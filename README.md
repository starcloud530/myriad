# Myriad

[![CI](https://github.com/starcloud530/myriad/actions/workflows/ci.yml/badge.svg)](https://github.com/starcloud530/myriad/actions/workflows/ci.yml)
[![License: MIT](https://img.shields.io/badge/License-MIT-b5442f.svg)](LICENSE)

One HTTP contract for chat, image, video, speech, and a few extractors. You `POST` a capability id with a Bearer product key. The gateway picks the channel.

```ts
import { createMyriad } from "@myriad/sdk";

const myriad = createMyriad({
  baseUrl: "http://127.0.0.1:8791",
  apiKey: process.env.MYRIAD_KEY ?? "dev-key",
});

const { output } = await myriad.invoke("chat", {
  messages: [{ role: "user", content: "Say hello in one line." }],
});
```

The path is always `/v1/capabilities/:id`. There is no OpenAI-compat `/v1/models` or `/v1/chat/completions`.

## Capabilities

| id | You send | You get |
|---|---|---|
| `chat` | `messages` | assistant message |
| `image.generate` | `prompt`, optional `refs` | image URIs |
| `video.generate` | `prompt` | async `job_id` (`queued`) |
| `audio.speech` | `text` | audio URI |
| `image-nsfw` | image, optional `labels` | classify scores |
| `portrait-quality` | image | number |
| `calorie-recognize` | image + `task: "detect"` | instances |

## Docs

Hosted in the product:

| Page | Local |
|---|---|
| Quickstart | [http://127.0.0.1:18081/docs/quickstart](http://127.0.0.1:18081/docs/quickstart) |
| API | [http://127.0.0.1:18081/docs/api](http://127.0.0.1:18081/docs/api) |
| TypeScript SDK | [http://127.0.0.1:18081/docs/sdk](http://127.0.0.1:18081/docs/sdk) |
| API keys | [http://127.0.0.1:18081/docs/keys](http://127.0.0.1:18081/docs/keys) |
| Errors | [http://127.0.0.1:18081/docs/errors](http://127.0.0.1:18081/docs/errors) |

## Run

```bash
git clone https://github.com/starcloud530/myriad.git
cd myriad
npm install
# Southbound vendor keys → packages/gateway/.dev.vars (never commit)
npm run dev          # gateway :8791
npm run dev:web      # console + docs :18081
```

Issue a product key in Console → API Keys (`sk-myriad-…`, hashed in `MYRIAD_KEYS`). Vendor secrets stay in Worker Secrets. TypeScript services depend on `@myriad/sdk` (workspace). Do not import `@myriad/gateway`.

## License

[MIT](LICENSE)
