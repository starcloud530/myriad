import type { MediaRef } from "../media.ts";

/** OCR / 检测 / 分割。第一期留口。 */
export interface ExtractInput {
  source: MediaRef;
  task: "ocr" | "detect" | "segment";
}

export interface ExtractInstance {
  label?: string;
  text?: string;
  score?: number;
  box?: [number, number, number, number];
}

export interface ExtractOutput {
  instances: ExtractInstance[];
}
