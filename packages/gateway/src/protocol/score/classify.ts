import type { MediaRef } from "../media.ts";

export interface ClassifyInput {
  input: string | MediaRef;
  labels?: string[];
}

export interface ClassifyLabel {
  label: string;
  score: number;
}

export interface ClassifyOutput {
  labels: ClassifyLabel[];
}
