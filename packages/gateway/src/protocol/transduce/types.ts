import type { MediaRef } from "../media.ts";

/** 转录 / 语音翻译。第一期留口。 */
export interface TransduceInput {
  source: MediaRef;
  task: "transcribe" | "translate";
  target_lang?: string;
}

export interface TranscriptSegment {
  start_s: number;
  end_s: number;
  text: string;
}

export interface TransduceOutput {
  text: string;
  segments?: TranscriptSegment[];
}
