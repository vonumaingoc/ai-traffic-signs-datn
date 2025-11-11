export interface TrafficSign {
  name: string;
  meaning: string;
}

export interface DetailedSignInfo {
  signCode: string;
  detailedMeaning: string;
  applicationCases: string;
  penalties: string;
}

export enum DisplayMode {
  Idle,
  Image,
  Video,
  Webcam,
}