/** 跨 kind 的介质引用。禁止每种合同各写一份 URL 字段。 */
export type MediaKind = "image" | "audio" | "video" | "file";

export interface MediaRef {
  kind: MediaKind;
  uri: string;
  mime?: string;
}
