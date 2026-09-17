# HTTP 契约

北向只卖这一条写路径。没有 OpenAI 兼容的 `/v1/models`、`/v1/chat/completions`。

```
POST /v1/capabilities/:id
Authorization: Bearer <产品密钥>
Content-Type: application/json

{ "input": { … } }
```

`input` 的形状由该能力的 kind 决定，见 [examples.md](examples.md)。

## 读

| 方法 | 路径 | 说明 |
|---|---|---|
| `GET` | `/health` | 不鉴权 |
| `GET` | `/v1/capabilities` | 当前产品能用的能力 |
| `GET` | `/v1/capabilities/:id` | 单条能力（无 config） |

## 写

| 方法 | 路径 | 说明 |
|---|---|---|
| `POST` | `/v1/capabilities/:id` | 调用 |
| `GET` | `/v1/keys` | 密钥列表（无明文） |
| `POST` | `/v1/keys` | 签发，明文只回一次 |
| `PATCH` | `/v1/keys/:id` | 标签 / 停用 |
| `POST` | `/v1/keys/:id/rotate` | 重置 |
| `DELETE` | `/v1/keys/:id` | 删除 |

调试时可多带 `"channel": "deepseek"`。生产路由不认这个字段。

## 成功信封

```json
{
  "request_id": "uuid",
  "capability": "chat",
  "kind": "chat",
  "channel": "deepseek",
  "output": {},
  "usage": { "units": 1, "unit": "token" }
}
```

## 失败信封

```json
{
  "error": { "code": "unauthorized", "message": "missing or invalid api key" },
  "request_id": "uuid"
}
```

码表见 [errors.md](errors.md)。

## 本地地址

| 进程 | 默认 |
|---|---|
| 网关 | `http://127.0.0.1:8791` |
| 广场（代理 `/v1`） | `http://127.0.0.1:18081` |
