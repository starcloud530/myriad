import { Table, Typography } from "antd";
import type { ReactNode } from "react";
import { CodeBlock } from "../../catalog-engine/CodeBlock.tsx";
import { buildCurl, commonErrors, requestPath } from "../../catalog-engine/api-spec.ts";

const { Paragraph, Title } = Typography;

const origin = "http://127.0.0.1:18081";

const examples = [
  {
    title: "对话",
    path: requestPath("chat"),
    input: { messages: [{ role: "user", content: "用一句话介绍万象" }] },
  },
  {
    title: "文生图",
    path: requestPath("image.generate"),
    input: { prompt: "一只坐在书堆上的橘猫，水彩" },
  },
  {
    title: "图生图",
    path: requestPath("image.generate"),
    input: {
      prompt: "把背景改成夜晚的书房",
      refs: [{ kind: "image", uri: "https://example.com/ref.png" }],
    },
  },
  {
    title: "提交视频任务",
    path: requestPath("video.generate"),
    input: { prompt: "一只橘猫走过阳光下的窗台" },
  },
  {
    title: "语音合成",
    path: requestPath("audio.speech"),
    input: { text: "你好，万象。" },
  },
];

export function DocsPage(): ReactNode {
  return (
    <div style={{ display: "grid", gap: 22, maxWidth: 820 }}>
      <div>
        <Title level={3} style={{ margin: 0 }}>
          调用约定
        </Title>
        <Paragraph style={{ margin: "8px 0 0" }}>
          北向只卖 <Typography.Text code>POST /v1/capabilities/:id</Typography.Text>
          。型号在货架，调用走能力。不提供 OpenAI 的{" "}
          <Typography.Text code>/v1/models</Typography.Text> 或{" "}
          <Typography.Text code>/v1/chat/completions</Typography.Text>。
        </Paragraph>
      </div>

      <section>
        <Title level={4}>鉴权</Title>
        <Paragraph>
          <Typography.Text code>Authorization: Bearer &lt;产品密钥&gt;</Typography.Text>
          。控制台签发的 Key 与系统种子密钥同一套鉴权。南向厂商 Key 不进前端。
        </Paragraph>
      </section>

      <section>
        <Title level={4}>签发密钥</Title>
        <Paragraph>
          <Typography.Text code>GET /v1/keys</Typography.Text> 列表；
          <Typography.Text code>POST /v1/keys</Typography.Text>{" "}
          创建（明文只回一次）；
          <Typography.Text code>POST /v1/keys/:id/rotate</Typography.Text> 重置；
          <Typography.Text code>DELETE /v1/keys/:id</Typography.Text> 删除。
        </Paragraph>
        <CodeBlock
          code={`curl -sS ${origin}/v1/keys \\
  -H "Authorization: Bearer $MYRIAD_KEY" \\
  -H "Content-Type: application/json" \\
  -d "{\\"tag\\":\\"评测\\",\\"description\\":\\"内部试跑\\"}"`}
        />
      </section>

      <section>
        <Title level={4}>调用</Title>
        <Paragraph>
          路径上的 <Typography.Text code>:id</Typography.Text> 是能力，不是 yaml 型号。对话是{" "}
          <Typography.Text code>chat</Typography.Text>，生图是{" "}
          <Typography.Text code>image.generate</Typography.Text>。
        </Paragraph>
        {examples.map((item) => (
          <div key={item.title} style={{ marginBottom: 16 }}>
            <Typography.Text strong>{item.title}</Typography.Text>
            <div style={{ marginTop: 8 }}>
              <CodeBlock
                code={buildCurl({
                  origin,
                  path: item.path,
                  token: "$MYRIAD_KEY",
                  input: item.input,
                  comment: item.title,
                })}
              />
            </div>
          </div>
        ))}
      </section>

      <section>
        <Title level={4}>错误</Title>
        <Table
          size="small"
          pagination={false}
          rowKey="key"
          dataSource={commonErrors()}
          columns={[
            { title: "HTTP", dataIndex: "status", width: 80 },
            { title: "code", dataIndex: "code", width: 200 },
            { title: "何时", dataIndex: "when" },
          ]}
        />
      </section>
    </div>
  );
}
