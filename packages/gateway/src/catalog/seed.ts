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
          "通用文本对话。主渠道 DeepSeek Chat，限流或失败时落到通义千问 Plus。下游只打万象 chat，不直连厂商。",
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
        description:
          "文生图；传入 refs[] 时走 gpt-image-2/edit，最多 16 张参考图。渠道是 fal，不暴露厂商 Key。",
        channels: [
          channel("fal-image", AdapterKinds.fal, "primary", {
            vendor_model: "fal-ai/gpt-image-2",
            edit_model: "fal-ai/gpt-image-2/edit",
            secret_env: "FAL_API_KEY",
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
        description:
          "异步生视频。主渠道火山 Seedance（需方舟接入点 ID），失败落到 fal MiniMax。调用只验提交 job。",
        channels: [
          channel("volcengine-seedance", AdapterKinds.volcengine, "primary", {
            base_url: "https://ark.cn-beijing.volces.com/api/v3",
            vendor_model: "doubao-seedance",
            secret_env: "VOLCENGINE_API_KEY",
          }),
          channel("fal-video", AdapterKinds.fal, "fallback", {
            vendor_model: "fal-ai/minimax/video-01",
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
        description: "文本转语音。第一期走 fal MiniMax Speech，音色目录以后再登记。",
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
        description: "万象自建能力。图像敏感内容检测，第一期先走本平台接线，随后替换为自有模型服务。",
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
        description: "万象自建能力。人像质量打分，第一期先走本平台接线，随后替换为自有模型服务。",
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
        description: "万象自建能力。卡路里识别，厂商是万象，不是第三方渠道。第一期先走本平台接线。",
        channels: [myriadChannel("myriad-calorie", "myriad-calorie")],
      },
    ],
    products: [
      {
        id: "dev",
        name: "开发调试",
        apiKeys: ["dev-key"],
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
