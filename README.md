<p align="center">
  <img src="docs/logo.svg" width="88" alt="Myriad" />
</p>

<h1 align="center">Myriad</h1>

<p align="center">
  One HTTP contract for chat, image, video, and speech.
</p>

<p align="center">
  <a href="https://starcloud530.github.io/myriad/docs/en/quickstart">Docs</a>
  ·
  <a href="https://starcloud530.github.io/myriad/docs/en/api">API</a>
  ·
  <a href="https://starcloud530.github.io/myriad/docs/en/sdk">SDK</a>
  ·
  <a href="LICENSE">License</a>
  ·
  <a href="https://github.com/starcloud530/myriad/issues">Issues</a>
</p>

<p align="center">
  <a href="https://github.com/starcloud530/myriad/actions/workflows/ci.yml"><img src="https://github.com/starcloud530/myriad/actions/workflows/ci.yml/badge.svg" alt="CI" /></a>
  <a href="LICENSE"><img src="https://img.shields.io/badge/License-MIT-b5442f.svg" alt="MIT" /></a>
</p>

```ts
import { createMyriad } from "@myriad/sdk";

const myriad = createMyriad({
  baseUrl: "http://127.0.0.1:8791",
  apiKey: process.env.MYRIAD_KEY ?? "dev-key", // local only; production uses a console-issued key
});

const { output } = await myriad.invoke("chat", {
  messages: [{ role: "user", content: "Say hello in one line." }],
});
```

The path is always `POST /v1/capabilities/:id`. There is no OpenAI-compat `/v1/models` or `/v1/chat/completions`.

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

Published on GitHub Pages:

- [Quickstart](https://starcloud530.github.io/myriad/docs/en/quickstart)
- [API](https://starcloud530.github.io/myriad/docs/en/api)
- [TypeScript SDK](https://starcloud530.github.io/myriad/docs/en/sdk)
- [API keys](https://starcloud530.github.io/myriad/docs/en/keys)
- [Errors](https://starcloud530.github.io/myriad/docs/en/errors)

## Run

```bash
git clone https://github.com/starcloud530/myriad.git
cd myriad
npm install
# Southbound vendor keys → packages/gateway/.dev.vars (never commit)
npm run dev          # gateway :8791
npm run dev:web      # local console :18081
```

Issue a product key in Console → API Keys. Vendor secrets stay in Worker Secrets. TypeScript services depend on `@myriad/sdk` (workspace). Do not import `@myriad/gateway`.

## License

[MIT](LICENSE)
