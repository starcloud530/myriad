import { AdapterKinds, CapabilityIds } from "../domain/ids.ts";
import type { Capability, Channel, Product } from "../domain/types.ts";
import { ProtocolKinds } from "../protocol/kind.ts";

export interface CatalogSeed {
  capabilities: Capability[];
  products: Product[];
}

function channel(
  id: string,
  adapter: Channel["adapter"],
  role: Channel["role"],
  config: Record<string, unknown>,
): Channel {
  return { id, adapter, role, enabled: true, config };
}

export function defaultSeed(): CatalogSeed {
  function myriadChannel(id: string, vendorModel: string): Channel {
    return {
      id,
      adapter: AdapterKinds.echo,
      role: "primary",
      enabled: true,
      vendor: "myriad",
      config: { vendor_model: vendorModel },
    };
  }

  return {
    capabilities: [
      {
        id: CapabilityIds.chat,
        name: "对话",
        kind: ProtocolKinds.chat,
        modality: "text",
        mode: "sync",
        billing: { unit: "token" },
        enabled: true,
        description:
          "通用文本对话。优先 DeepSeek，失败时回落到通义千问。一次调用，网关选择渠道。",
        channels: [
          channel("deepseek", AdapterKinds.openaiCompat, "primary", {
            base_url: "https://api.deepseek.com",
            vendor_model: "deepseek-chat",
            secret_env: "DEEPSEEK_API_KEY",
          }),
          channel("qianwen", AdapterKinds.openaiCompat, "fallback", {
            base_url: "https://dashscope.aliyuncs.com/compatible-mode/v1",
            vendor_model: "qwen-plus",
            secret_env: "QIANWEN_API_KEY",
          }),
        ],
      },
      {
        id: CapabilityIds.imageGenerate,
        name: "生图",
        kind: ProtocolKinds.imageGenerate,
        modality: "image",
        mode: "sync",
        billing: { unit: "image" },
        enabled: true,
        description: "文生图。传入参考图时走编辑接口，最多 16 张。",
        channels: [
          channel("fal-image", AdapterKinds.fal, "primary", {
            vendor_model: "openai/gpt-image-2",
            edit_model: "openai/gpt-image-2/edit",
            secret_env: "FAL_API_KEY",
          }),
          channel("volcengine-seedream", AdapterKinds.volcengine, "fallback", {
            base_url: "https://ark.cn-beijing.volces.com/api/v3",
            vendor_model: "doubao-seedream-5-0-pro-260628",
            secret_env: "VOLCENGINE_API_KEY",
          }),
        ],
      },
      {
        id: CapabilityIds.videoGenerate,
        name: "生视频",
        kind: ProtocolKinds.videoGenerate,
        modality: "video",
        mode: "async",
        billing: { unit: "video_second" },
        enabled: true,
        description: "异步视频生成。优先火山 Seedance 2.5，失败回落到 fal H3 Max Turbo。",
        channels: [
          channel("volcengine-seedance", AdapterKinds.volcengine, "primary", {
            base_url: "https://ark.cn-beijing.volces.com/api/v3",
            vendor_model: "doubao-seedance-2-5-260628",
            secret_env: "VOLCENGINE_API_KEY",
          }),
          channel("fal-video", AdapterKinds.fal, "fallback", {
            vendor_model: "minimax/h3-max-turbo/text-to-video",
            i2v_model: "minimax/h3-max-turbo/image-to-video",
            secret_env: "FAL_API_KEY",
          }),
        ],
      },
      {
        id: CapabilityIds.audioSpeech,
        name: "语音合成",
        kind: ProtocolKinds.audioSpeech,
        modality: "audio",
        mode: "sync",
        billing: { unit: "audio_second" },
        enabled: true,
        description: "文本转语音，当前接入 MiniMax Speech。",
        channels: [
          channel("fal-speech", AdapterKinds.fal, "primary", {
            vendor_model: "fal-ai/minimax/speech-2.8-turbo",
            secret_env: "FAL_API_KEY",
          }),
        ],
      },
      {
        id: CapabilityIds.imageNsfw,
        name: "图像敏感内容检测",
        kind: ProtocolKinds.classify,
        modality: "image",
        mode: "sync",
        billing: { unit: "image" },
        enabled: true,
        description: "图像敏感内容检测。",
        channels: [myriadChannel("myriad-nsfw", "myriad-nsfw")],
      },
      {
        id: CapabilityIds.portraitQuality,
        name: "人像图片质量打分",
        kind: ProtocolKinds.regress,
        modality: "image",
        mode: "sync",
        billing: { unit: "image" },
        enabled: true,
        description: "人像质量打分。",
        channels: [myriadChannel("myriad-portrait-quality", "myriad-portrait-quality")],
      },
      {
        id: CapabilityIds.calorieRecognize,
        name: "卡路里识别",
        kind: ProtocolKinds.chat,
        modality: "image",
        mode: "sync",
        billing: { unit: "image" },
        enabled: true,
        description: "从图像识别食物并估算卡路里。",
        channels: [myriadChannel("myriad-calorie", "myriad-calorie")],
      },
    ],
    products: [
      {
        id: "dev",
        name: "开发调试",
        apiKeys: ["dev-key"], // local CLI only; stripped when MYRIAD_ENV=production
        capabilities: [
          CapabilityIds.chat,
          CapabilityIds.imageGenerate,
          CapabilityIds.videoGenerate,
          CapabilityIds.audioSpeech,
          CapabilityIds.imageNsfw,
          CapabilityIds.portraitQuality,
          CapabilityIds.calorieRecognize,
        ],
      },
    ],
  };
}
