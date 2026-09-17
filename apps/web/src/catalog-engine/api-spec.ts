import type { ModelKind, ModelRecord } from "./spec.ts";

export interface ParamRow {
  key: string;
  name: string;
  path: string;
  type: string;
  required: boolean;
  desc: string;
  example: string;
}

export interface OutputField {
  key: string;
  name: string;
  type: string;
  desc: string;
}

export interface ErrorRow {
  key: string;
  status: string;
  code: string;
  when: string;
}

const reserved = new Set<ModelKind>(["complete", "transduce", "score.embed", "realtime"]);

export function isReservedKind(kind: ModelKind): boolean {
  return reserved.has(kind);
}

export function kindNote(kind: ModelKind): string {
  if (kind === "complete") {
    return "complete 合同已留口（prefix / suffix），本期没有渠道，示例为空对象。";
  }
  if (kind === "transduce") {
    return "transduce 合同已留口（转录 / 翻译），本期没有渠道，示例为空对象。";
  }
  if (kind === "score.embed") {
    return "score.embed 合同已留口，本期没有渠道，示例为空对象。";
  }
  if (kind === "realtime") {
    return "realtime 合同已留口，本期没有渠道，示例为空对象。";
  }
  return "";
}

export function envelopeParams(): ParamRow[] {
  return [
    {
      key: "input",
      name: "input",
      path: "body",
      type: "object",
      required: true,
      desc: "本 kind 的输入。形状见下表 input.*。",
      example: "{ … }",
    },
    {
      key: "channel",
      name: "channel",
      path: "body",
      type: "string",
      required: false,
      desc: "调试时指定渠道。生产路由不认这个字段。",
      example: "deepseek",
    },
  ];
}

export function kindParams(kind: ModelKind): ParamRow[] {
  if (kind === "chat") {
    return [
      {
        key: "messages",
        name: "messages",
        path: "input",
        type: "ChatMessage[]",
        required: true,
        desc: "对话轮次。role 为 system / user / assistant / tool；content 可以是字符串或图文 parts。",
        example: '[{ "role": "user", "content": "用一句话介绍万象" }]',
      },
      {
        key: "tools",
        name: "tools",
        path: "input",
        type: "ChatTool[]",
        required: false,
        desc: "可选工具定义。",
        example: "—",
      },
      {
        key: "stream",
        name: "stream",
        path: "input",
        type: "boolean",
        required: false,
        desc: "是否流式。第一期示例按非流式。",
        example: "false",
      },
    ];
  }
  if (kind === "generate.image") {
    return [
      {
        key: "prompt",
        name: "prompt",
        path: "input",
        type: "string",
        required: true,
        desc: "文生图提示词。",
        example: "一只坐在书堆上的橘猫，水彩",
      },
      {
        key: "refs",
        name: "refs",
        path: "input",
        type: "MediaRef[]",
        required: false,
        desc: "参考图。有 refs 走图生图；最多 16 张。每项需要 kind 与 uri。",
        example: '[{ "kind": "image", "uri": "https://example.com/ref.png" }]',
      },
    ];
  }
  if (kind === "generate.video") {
    return [
      {
        key: "prompt",
        name: "prompt",
        path: "input",
        type: "string",
        required: true,
        desc: "文生视频提示词。异步 job。",
        example: "一只橘猫走过阳光下的窗台",
      },
      {
        key: "refs",
        name: "refs",
        path: "input",
        type: "MediaRef[]",
        required: false,
        desc: "可选参考帧。每项需要 kind 与 uri。",
        example: "—",
      },
    ];
  }
  if (kind === "generate.audio") {
    return [
      {
        key: "text",
        name: "text",
        path: "input",
        type: "string",
        required: true,
        desc: "要朗读的文本。",
        example: "你好，万象。",
      },
      {
        key: "voice",
        name: "voice",
        path: "input",
        type: "{ id } | { ref }",
        required: false,
        desc: "音色。登记音色是目录资源；第一期示例可省略。",
        example: "—",
      },
    ];
  }
  if (kind === "score.classify") {
    return [
      {
        key: "input",
        name: "input",
        path: "input",
        type: "string | MediaRef",
        required: true,
        desc: "待分类文本，或带 uri 的介质。",
        example: '{ "kind": "image", "uri": "https://example.com/a.jpg" }',
      },
      {
        key: "labels",
        name: "labels",
        path: "input",
        type: "string[]",
        required: false,
        desc: "候选标签。省略则由模型自定。",
        example: '["safe", "nsfw"]',
      },
    ];
  }
  if (kind === "score.regress") {
    return [
      {
        key: "input",
        name: "input",
        path: "input",
        type: "string | MediaRef",
        required: true,
        desc: "待打分文本或介质。与 classify 同形，无 labels。",
        example: '{ "kind": "image", "uri": "https://example.com/face.jpg" }',
      },
    ];
  }
  if (kind === "extract") {
    return [
      {
        key: "source",
        name: "source",
        path: "input",
        type: "MediaRef",
        required: true,
        desc: "抽取来源图或文件。",
        example: '{ "kind": "image", "uri": "https://example.com/food.jpg" }',
      },
      {
        key: "task",
        name: "task",
        path: "input",
        type: '"ocr" | "detect" | "segment"',
        required: true,
        desc: "抽取任务。卡路里识别走 detect。",
        example: "detect",
      },
    ];
  }
  return [];
}

export function sampleInput(kind: ModelKind): Record<string, unknown> {
  if (kind === "chat") {
    return { messages: [{ role: "user", content: "用一句话介绍万象" }] };
  }
  if (kind === "generate.image") {
    return {
      prompt: "一只坐在书堆上的橘猫，水彩",
      refs: [{ kind: "image", uri: "https://example.com/ref.png" }],
    };
  }
  if (kind === "generate.video") {
    return { prompt: "一只橘猫走过阳光下的窗台" };
  }
  if (kind === "generate.audio") {
    return { text: "你好，万象。" };
  }
  if (kind === "score.classify") {
    return { input: { kind: "image", uri: "https://example.com/a.jpg" }, labels: ["safe", "nsfw"] };
  }
  if (kind === "score.regress") {
    return { input: { kind: "image", uri: "https://example.com/face.jpg" } };
  }
  if (kind === "extract") {
    return { source: { kind: "image", uri: "https://example.com/food.jpg" }, task: "detect" };
  }
  return {};
}

export function sampleOutput(kind: ModelKind, model: ModelRecord, channel?: string): Record<string, unknown> {
  const envelope = {
    request_id: "…",
    capability: model.capability,
    kind: model.kind,
    channel: channel ?? "…",
    usage: { units: 1, unit: model.pricing.unit },
  };
  if (kind === "chat") {
    return { ...envelope, output: { message: { role: "assistant", content: "…" } } };
  }
  if (kind === "generate.image") {
    return { ...envelope, output: { images: [{ kind: "image", uri: "https://…" }] } };
  }
  if (kind === "generate.video") {
    return { ...envelope, output: { job_id: "…", status: "queued" } };
  }
  if (kind === "generate.audio") {
    return { ...envelope, output: { audio: { kind: "audio", uri: "https://…" } } };
  }
  if (kind === "score.classify") {
    return { ...envelope, output: { labels: [{ label: "safe", score: 0.98 }] } };
  }
  if (kind === "score.regress") {
    return { ...envelope, output: { value: 0.86 } };
  }
  if (kind === "extract") {
    return { ...envelope, output: { instances: [{ label: "米饭", score: 0.9, text: "120 kcal" }] } };
  }
  return { ...envelope, output: {} };
}

export function envelopeOutputFields(): OutputField[] {
  return [
    { key: "request_id", name: "request_id", type: "string", desc: "本次请求 id。" },
    { key: "capability", name: "capability", type: "string", desc: "打中的北向能力，与路径一致。" },
    { key: "kind", name: "kind", type: "ProtocolKind", desc: "七族协议之一。" },
    { key: "channel", name: "channel", type: "string", desc: "实际出站的渠道 id，不是客户端指定结果。" },
    { key: "output", name: "output", type: "object", desc: "本 kind 的输出，见下表。" },
    { key: "usage", name: "usage", type: "{ units, unit }", desc: "用量。unit 为 token / image / audio_second / video_second / request。" },
  ];
}

export function kindOutputFields(kind: ModelKind): OutputField[] {
  if (kind === "chat") {
    return [{ key: "output.message", name: "output.message", type: "{ role, content }", desc: "助手回复。可能带 tool_calls。" }];
  }
  if (kind === "generate.image") {
    return [{ key: "output.images", name: "output.images", type: "MediaRef[]", desc: "生成图的 uri 列表。" }];
  }
  if (kind === "generate.video") {
    return [
      { key: "output.job_id", name: "output.job_id", type: "string", desc: "异步任务 id。" },
      { key: "output.status", name: "output.status", type: "queued | running | succeeded | failed", desc: "任务状态。先回 queued。" },
    ];
  }
  if (kind === "generate.audio") {
    return [{ key: "output.audio", name: "output.audio", type: "MediaRef", desc: "合成音频。" }];
  }
  if (kind === "score.classify") {
    return [{ key: "output.labels", name: "output.labels", type: "{ label, score }[]", desc: "分类标签与分数。" }];
  }
  if (kind === "score.regress") {
    return [{ key: "output.value", name: "output.value", type: "number", desc: "回归分数。" }];
  }
  if (kind === "extract") {
    return [{ key: "output.instances", name: "output.instances", type: "ExtractInstance[]", desc: "抽出的实例，可含 label / text / score / box。" }];
  }
  return [{ key: "output", name: "output", type: "object", desc: "合同已留口，本期无渠道输出。" }];
}

export function commonErrors(): ErrorRow[] {
  return [
    { key: "401", status: "401", code: "unauthorized", when: "没带 Authorization，或 Key 不是网关认的产品密钥。" },
    { key: "404", status: "404", code: "not_found", when: "路径上的能力未在网关登记，或货架 capability 对不上 seed。" },
    { key: "502", status: "502", code: "channel_failed / all_channels_failed", when: "主备渠道都失败。检查南向密钥与上游状态，不是改北向路径。" },
    { key: "400", status: "400", code: "bad_request", when: "input 缺必填（如 chat.messages、image/video.prompt、audio.text）。" },
  ];
}

export function requestPath(capability: string): string {
  return `/v1/capabilities/${capability}`;
}

export function sampleBody(kind: ModelKind): { input: Record<string, unknown> } {
  return { input: sampleInput(kind) };
}

export function sampleCurl(model: ModelRecord): string {
  return buildCurl({
    origin: "http://127.0.0.1:8788",
    path: requestPath(model.capability),
    token: "$MYRIAD_KEY",
    input: sampleInput(model.kind),
    comment: `${model.vendor}/${model.id}  vendor_model=${model.vendor_model}  kind=${model.kind}`,
  });
}

export function sampleJson(model: ModelRecord): string {
  return JSON.stringify(sampleBody(model.kind), null, 2);
}

export interface TestEndpoint {
  id: string;
  label: string;
  input: Record<string, unknown>;
  runnable: boolean;
}

export function testEndpoints(model: ModelRecord): TestEndpoint[] {
  if (model.kind === "chat") {
    return [
      {
        id: "chat",
        label: "对话",
        input: { messages: [{ role: "user", content: "用一句话介绍万象" }] },
        runnable: true,
      },
    ];
  }
  if (model.kind === "generate.image") {
    return [
      {
        id: "image-text",
        label: "文生图",
        input: { prompt: "一只坐在书堆上的橘猫，水彩" },
        runnable: true,
      },
      {
        id: "image-edit",
        label: "图生图",
        input: {
          prompt: "把背景改成夜晚的书房",
          refs: [{ kind: "image", uri: "https://example.com/ref.png" }],
        },
        runnable: true,
      },
    ];
  }
  if (model.kind === "generate.video") {
    return [
      {
        id: "video-job",
        label: "提交任务",
        input: { prompt: "一只橘猫走过阳光下的窗台" },
        runnable: true,
      },
    ];
  }
  if (model.kind === "generate.audio") {
    return [{ id: "speech", label: "语音合成", input: { text: "你好，万象。" }, runnable: true }];
  }
  if (model.kind === "score.classify") {
    return [
      {
        id: "classify",
        label: "分类",
        input: { input: { kind: "image", uri: "https://example.com/a.jpg" }, labels: ["safe", "nsfw"] },
        runnable: true,
      },
    ];
  }
  if (model.kind === "score.regress") {
    return [
      {
        id: "regress",
        label: "打分",
        input: { input: { kind: "image", uri: "https://example.com/face.jpg" } },
        runnable: true,
      },
    ];
  }
  if (model.kind === "extract") {
    return [
      {
        id: "extract",
        label: "抽取",
        input: { source: { kind: "image", uri: "https://example.com/food.jpg" }, task: "detect" },
        runnable: true,
      },
    ];
  }
  return [{ id: "reserved", label: "合同留口", input: {}, runnable: false }];
}

export function buildCurl(opts: {
  origin: string;
  path: string;
  token: string;
  input: Record<string, unknown>;
  comment?: string;
}): string {
  const escaped = JSON.stringify({ input: opts.input }).replace(/\\/g, "\\\\").replace(/"/g, '\\"');
  const head = opts.comment ? `# ${opts.comment}\n` : "";
  return `${head}curl -sS ${opts.origin}${opts.path} \\
  -H "Authorization: Bearer ${opts.token}" \\
  -H "Content-Type: application/json" \\
  -d "${escaped}"`;
}
