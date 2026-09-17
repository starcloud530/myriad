# 示例

下列 `input` 都放在 `{ "input": … }` 里。SDK 的 `invoke(id, input)` 已经包好信封。

## 对话

```bash
curl -sS http://127.0.0.1:8791/v1/capabilities/chat \
  -H "Authorization: Bearer $MYRIAD_KEY" \
  -H "Content-Type: application/json" \
  -d "{\"input\":{\"messages\":[{\"role\":\"user\",\"content\":\"用一句话介绍万象\"}]}}"
```

## 文生图

```ts
await myriad.invoke("image.generate", {
  prompt: "一只坐在书堆上的橘猫，水彩",
});
```

## 图生图

同一能力，带 `refs`：

```ts
await myriad.invoke("image.generate", {
  prompt: "把背景改成夜晚的书房",
  refs: [{ kind: "image", uri: "https://example.com/ref.png" }],
});
```

## 视频（异步）

```ts
const job = await myriad.invoke("video.generate", {
  prompt: "一只橘猫走过阳光下的窗台",
});
// output.status 先是 queued，带 job_id
```

## 语音

```ts
await myriad.invoke("audio.speech", { text: "你好，万象。" });
```

## CLI

```bash
npm run dev:cli -- health
npm run dev:cli -- capabilities
npm run dev:cli -- invoke chat --input "{\"messages\":[{\"role\":\"user\",\"content\":\"你好\"}]}"
npm run dev:cli -- invoke image.generate --input "{\"prompt\":\"一只橘猫\"}"
```

广场里打开任意型号 → **试用**，不拼 JSON 也能看到耗时。
