# 概念

万象把四件事拆开。混在一起就会回到「每个模型一个类、generate(any)」那条路。

## 能力 Capability

北向的一等公民。路径是：

```
POST /v1/capabilities/:id
```

`:id` 是 `chat`、`image.generate`，不是 `deepseek-flash`。下游选能力，网关选渠道。

## 型号 Model

货架上的一张卡。写在 `catalog/models/<vendor>/<id>.yaml`：介绍、标价、上下文、`vendor_model`。

广场按型号拆卡，方便人挑。**调用不打 yaml 文件名**，仍打型号上挂的 `capability`。

## 渠道 Channel

能力背后的出站实现。一条能力可以有主渠道和兜底：对话是 DeepSeek → 通义。

对外列表只给 `vendor` / `role` / `enabled`，剥掉 `secret_env` 和 base URL。

## 适配器 Adapter

渠道用哪套南向协议：`openai_compat`、`fal`、`volcengine`、`echo`。  
这是网关内部的事。客户端不要为 fal 再包一层。

## 两把密钥

| | 谁用 | 放哪 |
|---|---|---|
| **北向 · 产品密钥** | 你的服务、控制台、CLI | 控制台签发；哈希进 KV；明文只展示一次 |
| **南向 · 厂商密钥** | 仅网关适配器 | Worker `env` / `.dev.vars`，永不进 git、yaml、前端 |

业务仓库里只该出现 `MYRIAD_KEY`。

## 七族协议

入参形状 × 出参形状 × 时序。厂商和模态都不是一级。

`chat` · `complete` · `generate` · `transduce` · `score` · `extract` · `realtime`

新服务先对上现有 kind。对不上再加合同，**不加第八族**。

## 和「一个模型一个 generate」的差别

画布那种 `AigcModel<TInput>.generate()` 适合单服务里封装 HF/Replicate。  
万象是中台：能力合同在网关，客户端只是 HTTP + 类型，不为每个 checkpoint 开类。
