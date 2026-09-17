# 万象文档

GitHub 打开本目录就能读。建议按编号走，不要先翻源码。

| 顺序 | 文档 | 你离开时应该会 |
|---|---|---|
| 1 | [quickstart.md](quickstart.md) | 本地拉起网关，用 Key 打通一次 `chat` |
| 2 | [concepts.md](concepts.md) | 分清能力、型号、渠道、两把 Key |
| 3 | [http.md](http.md) | 会写 curl，知道路径永远是 `/v1/capabilities/:id` |
| 4 | [sdk.md](sdk.md) | 在自己的 TS 服务里 `createMyriad` |
| 5 | [keys.md](keys.md) | 签发、轮换、不把厂商 Key 带出网关 |
| 6 | [examples.md](examples.md) | 对话 / 文生图 / 图生图 / 视频 / 语音各跑一条 |
| 7 | [errors.md](errors.md) | 401 / 400 / 404 / 502 分别改哪一侧 |

内部存放约定（密钥放哪、yaml 写什么）仍在 [信息存储/](信息存储/)。

广场控制台：本地 `http://127.0.0.1:18081`。契约页与这里同一套合同。
