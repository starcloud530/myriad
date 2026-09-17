import type { MediaRef } from "../media.ts";

export interface RegressInput {
  input: string | MediaRef;
}

export interface RegressOutput {
  value: number;
  vector?: number[];
}
