/** 一级协议：入参形状 × 出参形状 × 时序。厂商和模态不是一级。 */
export const ProtocolFamilies = {
  chat: "chat",
  complete: "complete",
  generate: "generate",
  transduce: "transduce",
  score: "score",
  extract: "extract",
  realtime: "realtime",
} as const;

export type ProtocolFamily = (typeof ProtocolFamilies)[keyof typeof ProtocolFamilies];

/** 第二层合同。新服务先对上这里，对不上才加合同，不加第八族。 */
export const ProtocolKinds = {
  chat: "chat",
  complete: "complete",
  imageGenerate: "generate.image",
  videoGenerate: "generate.video",
  audioSpeech: "generate.audio",
  transduce: "transduce",
  classify: "score.classify",
  regress: "score.regress",
  embed: "score.embed",
  extract: "extract",
  realtime: "realtime",
} as const;

export type ProtocolKind = (typeof ProtocolKinds)[keyof typeof ProtocolKinds];

export function familyOf(kind: ProtocolKind): ProtocolFamily {
  if (kind === ProtocolKinds.chat) return ProtocolFamilies.chat;
  if (kind === ProtocolKinds.complete) return ProtocolFamilies.complete;
  if (kind.startsWith("generate.")) return ProtocolFamilies.generate;
  if (kind === ProtocolKinds.transduce) return ProtocolFamilies.transduce;
  if (kind.startsWith("score.")) return ProtocolFamilies.score;
  if (kind === ProtocolKinds.extract) return ProtocolFamilies.extract;
  return ProtocolFamilies.realtime;
}
