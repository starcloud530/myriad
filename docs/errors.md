# 错误

失败体永远是：

```json
{ "error": { "code": "…", "message": "…" }, "request_id": "…" }
```

SDK 抛 `MyriadClientError`，上面三个字段都能读。

| HTTP | code | 你改哪 |
|---|---|---|
| 401 | `unauthorized` | 没带 Bearer，或 Key 不是网关签发的 |
| 400 | `bad_request` | `input` 缺必填：chat 要 `messages`，图/视频要 `prompt`，语音要 `text` |
| 403 | `forbidden` | 这把产品钥匙没有该能力 |
| 404 | `not_found` | 能力 id 未登记，或货架 `capability` 对不上 seed |
| 502 | `channel_failed` / `all_channels_failed` | 南向挂了。查 `.dev.vars` 和上游，不要改北向路径 |
| 503 | `capability_disabled` | 能力被关掉 |

`request_id` 留给排障。广场 API 页点「测试」看到的 JSON 和这里同一套。
