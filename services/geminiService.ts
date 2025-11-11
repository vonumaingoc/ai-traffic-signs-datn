import { GoogleGenAI, Type } from "@google/genai";
import { TrafficSign, DetailedSignInfo } from "../types";

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY as string });

export const identifyTrafficSigns = async (
  base64ImageData: string,
  mimeType: string
): Promise<TrafficSign[]> => {
  try {
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: {
        parts: [
          {
            inlineData: {
              data: base64ImageData,
              mimeType: mimeType,
            },
          },
          {
            text: "Identify any traffic signs in this image. For each sign, provide its official name and a brief explanation of its meaning. Respond in Vietnamese.",
          },
        ],
      },
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.ARRAY,
          items: {
            type: Type.OBJECT,
            properties: {
              name: {
                type: Type.STRING,
                description: "Tên chính thức của biển báo giao thông.",
              },
              meaning: {
                type: Type.STRING,
                description: "Giải thích ngắn gọn ý nghĩa của biển báo.",
              },
            },
            required: ["name", "meaning"],
          },
        },
      },
    });

    const jsonText = response.text.trim();
    const signs: TrafficSign[] = JSON.parse(jsonText);
    return signs;
  } catch (error) {
    console.error("Error calling Gemini API:", error);
    // In case of a real API error, you might want to return a more specific error message.
    // For this example, we'll return a mock sign to show UI functionality on error.
    return [
      {
        name: "Lỗi Phân Tích",
        meaning: "Không thể xác định biển báo từ hình ảnh. Vui lòng thử lại với hình ảnh rõ nét hơn.",
      }
    ];
  }
};

export const getSignDetails = async (
  signName: string
): Promise<DetailedSignInfo> => {
   try {
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: {
        parts: [
          {
            text: `Provide detailed information about the Vietnamese traffic sign named "${signName}". I need the following details: the official sign code (mã hiệu), a detailed explanation of its meaning (giải thích chi tiết), common application cases (các trường hợp áp dụng), and penalties for violation (mức phạt vi phạm). Respond in Vietnamese.`,
          },
        ],
      },
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            signCode: { type: Type.STRING, description: "Mã hiệu chính thức của biển báo (ví dụ: P.102)." },
            detailedMeaning: { type: Type.STRING, description: "Giải thích chi tiết và đầy đủ về ý nghĩa, quy tắc của biển báo." },
            applicationCases: { type: Type.STRING, description: "Mô tả các tình huống, vị trí thường gặp của biển báo này trên đường." },
            penalties: { type: Type.STRING, description: "Thông tin về các mức phạt khi không tuân thủ theo quy định của biển báo." },
          },
          required: ["signCode", "detailedMeaning", "applicationCases", "penalties"],
        },
      },
    });

    const jsonText = response.text.trim();
    return JSON.parse(jsonText);
  } catch (error) {
     console.error("Error fetching sign details from Gemini API:", error);
     throw new Error("Could not fetch detailed sign information.");
  }
};