import base64
import io
from typing import List, Dict, Any, Tuple

from fastapi import FastAPI
from fastapi.staticfiles import StaticFiles
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from PIL import Image
import yaml
import os
import logging

try:
    # Ultralytics supports YOLOv8/YOLOv11 using the same API
    from ultralytics import YOLO
except Exception as exc:  # pragma: no cover
    raise RuntimeError("Ultralytics is required: pip install ultralytics") from exc


ROOT_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
MODEL_PATH = os.path.join(ROOT_DIR, "best.pt")
DATA_YAML_PATH = os.path.join(ROOT_DIR, "data.yaml")
FDTEST_DIR = os.path.join(ROOT_DIR, "fdtest")
TEXT_INFO_PATH = os.path.join(ROOT_DIR, "Thong-tin-bien-bao.txt")
LOGGER = logging.getLogger("uvicorn.error")


def load_class_names(yaml_path: str) -> Dict[int, str]:
    with open(yaml_path, "r", encoding="utf-8") as f:
        data = yaml.safe_load(f)
    names_field = data.get("names", {})
    # names may be list or dict; normalize to index->name dict
    if isinstance(names_field, list):
        return {i: str(name) for i, name in enumerate(names_field)}
    if isinstance(names_field, dict):
        # keys in data.yaml snapshot are integers as strings
        return {int(k): str(v) for k, v in names_field.items()}
    return {}


class PredictRequest(BaseModel):
    image: str  # base64 without data URL prefix
    mimeType: str | None = None


class Detection(BaseModel):
    classId: int
    code: str
    name: str  # display name
    meaning: str
    confidence: float
    bbox: list[float]  # [x1, y1, x2, y2]


class PredictResponse(BaseModel):
    detections: List[Detection]
    imageSize: Dict[str, int]


app = FastAPI(title="YOLO Traffic Sign Inference API")
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# Load once at startup
CLASS_NAMES = load_class_names(DATA_YAML_PATH)
MODEL = YOLO(MODEL_PATH)


def load_sign_info_map(path: str) -> Dict[str, Tuple[str, str]]:
    """Parse Thong-tin-bien-bao.txt to a map: code -> (display_name, meaning)."""
    mapping: Dict[str, Tuple[str, str]] = {}
    if not os.path.isfile(path):
        LOGGER.warning("Sign info file not found: %s", path)
        return mapping
    try:
        with open(path, "r", encoding="utf-8") as f:
            for line in f:
                line = line.strip()
                if not line or line.startswith("#"):
                    continue
                parts = [p.strip() for p in line.split("|")]
                if len(parts) >= 3:
                    code, display_name, meaning = parts[0], parts[1], parts[2]
                    mapping[code] = (display_name, meaning)
    except Exception as exc:
        LOGGER.exception("Failed to parse sign info file: %s", exc)
    LOGGER.info("Loaded %d sign infos from %s", len(mapping), path)
    return mapping


def calculate_iou(box1: list[float], box2: list[float]) -> float:
    """Tính Intersection over Union (IoU) giữa 2 bounding boxes.
    
    Args:
        box1, box2: [x1, y1, x2, y2]
    
    Returns:
        IoU value từ 0.0 đến 1.0
    """
    x1_min, y1_min, x1_max, y1_max = box1
    x2_min, y2_min, x2_max, y2_max = box2
    
    # Tính area của mỗi box
    area1 = (x1_max - x1_min) * (y1_max - y1_min)
    area2 = (x2_max - x2_min) * (y2_max - y2_min)
    
    # Tìm intersection box
    inter_x1 = max(x1_min, x2_min)
    inter_y1 = max(y1_min, y2_min)
    inter_x2 = min(x1_max, x2_max)
    inter_y2 = min(y1_max, y2_max)
    
    # Tính intersection area
    if inter_x2 <= inter_x1 or inter_y2 <= inter_y1:
        return 0.0
    
    inter_area = (inter_x2 - inter_x1) * (inter_y2 - inter_y1)
    
    # IoU = intersection / union
    union_area = area1 + area2 - inter_area
    if union_area == 0:
        return 0.0
    
    return inter_area / union_area


def apply_nms(detections: List[Detection], iou_threshold: float = 0.5) -> List[Detection]:
    """Áp dụng Non-Maximum Suppression để loại bỏ duplicate detections.
    
    Args:
        detections: Danh sách detections
        iou_threshold: Ngưỡng IoU để coi là duplicate (mặc định 0.5 = 50% overlap)
    
    Returns:
        Danh sách detections sau khi loại bỏ duplicates (giữ confidence cao nhất)
    """
    if not detections:
        return []
    
    # Sort theo confidence giảm dần
    sorted_detections = sorted(detections, key=lambda d: d.confidence, reverse=True)
    
    kept = []
    
    while sorted_detections:
        # Lấy detection có confidence cao nhất
        best = sorted_detections.pop(0)
        kept.append(best)
        
        # Loại bỏ các detections cùng class và có IoU cao
        remaining = []
        for det in sorted_detections:
            # Nếu khác class hoặc IoU thấp thì giữ lại
            if det.code != best.code:
                remaining.append(det)
            else:
                iou = calculate_iou(best.bbox, det.bbox)
                if iou <= iou_threshold:
                    remaining.append(det)
                else:
                    LOGGER.debug(
                        "Removing duplicate '%s' (IoU=%.2f, conf=%.1f%% vs %.1f%%)",
                        best.code, iou, det.confidence * 100, best.confidence * 100
                    )
        
        sorted_detections = remaining
    
    return kept


SIGN_INFO_MAP = load_sign_info_map(TEXT_INFO_PATH)

# Serve static images for traffic signs from fdtest directory
app.mount("/sign-images", StaticFiles(directory=FDTEST_DIR), name="sign-images")
if not os.path.isdir(FDTEST_DIR):
    LOGGER.warning("FDTEST_DIR does not exist: %s", FDTEST_DIR)
else:
    LOGGER.info("Serving sign images from: %s", FDTEST_DIR)


@app.get("/health")
def health() -> dict[str, str]:
    return {"status": "ok"}


@app.post("/predict", response_model=PredictResponse)
def predict(req: PredictRequest) -> Any:
    image_bytes = base64.b64decode(req.image)
    image = Image.open(io.BytesIO(image_bytes)).convert("RGB")
    width, height = image.size

    results = MODEL.predict(image, verbose=False)
    detections: List[Detection] = []

    for r in results:
        if r.boxes is None:
            continue
        xyxy = r.boxes.xyxy.cpu().tolist()
        conf = r.boxes.conf.cpu().tolist()
        cls = r.boxes.cls.cpu().tolist()
        for (x1, y1, x2, y2), c, ci in zip(xyxy, conf, cls):
            # Apply confidence threshold: chỉ chấp nhận kết quả có độ tin cậy > 60%
            if float(c) <= 0.35:
                LOGGER.debug("Skipping detection with confidence %.2f%% (below 60%% threshold)", float(c) * 100)
                continue
            
            class_id = int(ci)
            code = CLASS_NAMES.get(class_id, f"class_{class_id}")
            # Map to human-friendly name and meaning from text file
            display_name, meaning = SIGN_INFO_MAP.get(code, (code, "Nhấn để xem chi tiết."))
            # Log image existence for this sign code
            img_path = os.path.join(FDTEST_DIR, f"{code}.png")
            exists = os.path.isfile(img_path)
            LOGGER.info("Sign '%s' (confidence: %.1f%%) image %s at %s", code, float(c) * 100, "FOUND" if exists else "MISSING", img_path)
            detections.append(
                Detection(
                    classId=class_id,
                    code=code,
                    name=display_name,
                    meaning=meaning,
                    confidence=float(c),
                    bbox=[float(x1), float(y1), float(x2), float(y2)],
                )
            )

    # Apply NMS để loại bỏ duplicate detections
    detections_after_nms = apply_nms(detections, iou_threshold=0.5)
    LOGGER.info("Detections: %d before NMS, %d after NMS", len(detections), len(detections_after_nms))

    return PredictResponse(
        detections=detections_after_nms,
        imageSize={"width": width, "height": height},
    )


if __name__ == "__main__":
    import uvicorn
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)