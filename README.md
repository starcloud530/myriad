# 万象 / Myriad

能力聚合平台。下游只对接万象，不对接具体模型；第三方与自建都是渠道。

## 定位

新能力的标准工期是适配器 + 登记 + 额度。同步能力走纯 I/O 网关；异步作业以后再上 Durable Object。计数和账本不要进 KV。

## 目录

```
myriad/                 源码
  index.ts              Worker 入口
  app.ts                组合根：装配模块、挂路由
  domain/               能力 / 渠道 / 错误，不依赖存储
  catalog/              能力与产品清单（现为内存，接口按 KV 留）
  auth/                 产品鉴权
  quota/                额度（现为放行，接口按 DO 留）
  ledger/               成本账（现为结构化日志）
  routing/              主渠道 + 降级
  adapters/             echo（接线）/ http（第三方与自建）
  invoke/               鉴权 → 清单 → 额度 → 路由 → 适配 → 记账
  http/                 路由与响应
```

仓库、包名、Worker 一律用 `myriad`，对外中文名用「万象」。

## 本地运行

```bash
npm install
npm run typecheck
npm run dev
```

开发产品密钥：`dev-key`。

```bash
curl http://127.0.0.1:8787/health

curl -H "Authorization: Bearer dev-key" http://127.0.0.1:8787/v1/capabilities

curl -X POST http://127.0.0.1:8787/v1/capabilities/image-nsfw \
  -H "Authorization: Bearer dev-key" \
  -H "Content-Type: application/json" \
  -d "{\"input\":{\"image_url\":\"https://example.com/a.jpg\"}}"
```

已登记的示例能力：`image-nsfw`、`portrait-quality`、`calorie-recognize`。默认渠道是 `echo`，用来验证整条调用链。

## 调用约定

```http
POST /v1/capabilities/:id
Authorization: Bearer <api-key>
```

```json
{
  "input": { "image_url": "https://example.com/a.jpg" },
  "channel": "可选，指定渠道"
}
```

也可以直接把业务字段放在 body 根上。成功响应含 `capability`、`channel`、`output`、`usage`、`request_id`。

## 下一步（刻意未做）

- 清单从内存换成 KV
- 额度计数进 Durable Object
- 成本账接到 Analytics Engine
- 按能力校验输入 schema
- 管理后台拆成独立 Worker（`$5` 是账号级，拆分不加钱）
