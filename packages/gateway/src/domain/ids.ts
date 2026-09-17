/** 已登记能力。新能力加常量，不要让下游拼字符串。 */
export const CapabilityIds = {
  chat: "chat",
  imageGenerate: "image.generate",
  videoGenerate: "video.generate",
  audioSpeech: "audio.speech",
  imageNsfw: "image-nsfw",
  portraitQuality: "portrait-quality",
  calorieRecognize: "calorie-recognize",
} as const;

export type KnownCapabilityId = (typeof CapabilityIds)[keyof typeof CapabilityIds];

export const AdapterKinds = {
  echo: "echo",
  http: "http",
  openaiCompat: "openai_compat",
  fal: "fal",
  volcengine: "volcengine",
} as const;

export type AdapterKind = (typeof AdapterKinds)[keyof typeof AdapterKinds];
