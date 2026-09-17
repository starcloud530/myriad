import { PlusOutlined } from "@ant-design/icons";
import { Button, Card, Form, Input, Modal, Space, Table, Tag, Typography, message } from "antd";
import type { ColumnsType } from "antd/es/table";
import type { ReactNode } from "react";
import { useMemo, useState } from "react";
import { PageHeader } from "../../components/biz/PageHeader.tsx";
import { StatRow } from "../../components/biz/StatRow.tsx";
import { forgetSecret } from "../../features/keys/sessionSecrets.ts";
import { displayKey, type ProductKey } from "../../features/keys/types.ts";
import { useProductKeys } from "../../features/keys/useProductKeys.ts";
import { createKey, deleteKey, rotateKey, updateKey } from "../../lib/api.ts";
import { getDevApiKey } from "../../lib/devKey.ts";

interface KeyForm {
  tag: string;
  description: string;
}

function formatTime(iso: string): string {
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) {
    return iso;
  }
  return date.toLocaleString("zh-CN", { hour12: false });
}

export function KeysPage(): ReactNode {
  const bootstrap = getDevApiKey();
  const { keys, loading, error, reload, remember } = useProductKeys();
  const [query, setQuery] = useState("");
  const [creating, setCreating] = useState(false);
  const [editing, setEditing] = useState<ProductKey | null>(null);
  const [revealed, setRevealed] = useState<ProductKey | null>(null);
  const [form] = Form.useForm<KeyForm>();
  const [editForm] = Form.useForm<KeyForm>();

  const visible = useMemo(() => {
    const needle = query.trim().toLowerCase();
    if (!needle) {
      return keys;
    }
    return keys.filter((row) => [row.id, row.tag, row.description, row.prefix].join(" ").toLowerCase().includes(needle));
  }, [query, keys]);

  const columns: ColumnsType<ProductKey> = [
    { title: "ID", dataIndex: "id", width: 140 },
    {
      title: "API Key",
      render: (_, row) => <Typography.Text copyable={row.system ? { text: row.prefix } : false}>{displayKey(row)}</Typography.Text>,
    },
    { title: "业务标签", dataIndex: "tag" },
    { title: "描述", dataIndex: "description", ellipsis: true },
    {
      title: "创建时间",
      dataIndex: "created_at",
      width: 180,
      render: (value: string) => formatTime(value),
    },
    {
      title: "状态",
      dataIndex: "status",
      width: 88,
      render: (status: ProductKey["status"], row) =>
        row.system ? <Tag>系统</Tag> : <Tag color={status === "active" ? "green" : "default"}>{status === "active" ? "启用" : "停用"}</Tag>,
    },
    {
      title: "操作",
      width: 220,
      render: (_, row) => {
        return (
          <Space size={0}>
            <Button
              type="link"
              size="small"
              disabled={row.system}
              onClick={() => {
                setEditing(row);
                editForm.setFieldsValue({ tag: row.tag, description: row.description });
              }}
            >
              编辑
            </Button>
            <Button
              type="link"
              size="small"
              disabled={row.system}
              onClick={() => {
                Modal.confirm({
                  title: "重置密钥？",
                  content: "旧的密钥立刻失效。新密钥只会展示一次。",
                  okText: "重置",
                  onOk: async () => {
                    const body = await rotateKey(bootstrap, row.id);
                    remember(body.key);
                    setRevealed(body.key);
                  },
                });
              }}
            >
              重置
            </Button>
            <Button
              type="link"
              size="small"
              danger
              disabled={row.system}
              onClick={() => {
                Modal.confirm({
                  title: "删除这把密钥？",
                  okText: "删除",
                  okButtonProps: { danger: true },
                  onOk: async () => {
                    await deleteKey(bootstrap, row.id);
                    forgetSecret(row.id);
                    await reload();
                    void message.success("已删除，网关不再认它");
                  },
                });
              }}
            >
              删除
            </Button>
          </Space>
        );
      },
    },
  ];

  return (
    <div style={{ display: "grid", gap: 20, width: "100%" }}>
      <PageHeader
        title="API Keys"
        description="这里签发的密钥网关当场认。下游只带万象产品密钥，不要把渠道 Key 写进前端。"
        extra={
          <Button
            type="primary"
            icon={<PlusOutlined />}
            onClick={() => {
              form.resetFields();
              setCreating(true);
            }}
          >
            新建密钥
          </Button>
        }
      />
      <StatRow
        items={[
          { label: "密钥", value: String(keys.length), hint: "含 1 把系统密钥" },
          { label: "启用中", value: String(keys.filter((row) => row.status === "active").length) },
          { label: "网关", value: error ? "未连上" : "已接通" },
        ]}
      />
      <Card
        styles={{ body: { paddingTop: 16 } }}
        title="密钥列表"
        extra={
          <Input.Search
            allowClear
            placeholder="搜索标签、描述或前缀"
            style={{ width: 240 }}
            value={query}
            onChange={(event) => {
              setQuery(event.target.value);
            }}
          />
        }
      >
        {error ? (
          <Typography.Paragraph type="danger">{error}</Typography.Paragraph>
        ) : (
          <Table<ProductKey>
            rowKey="id"
            columns={columns}
            dataSource={visible}
            loading={loading}
            pagination={false}
            scroll={{ x: 1100 }}
          />
        )}
      </Card>
      <Modal
        title="新建密钥"
        open={creating}
        okText="创建"
        onCancel={() => {
          setCreating(false);
        }}
        onOk={() => {
          void form.validateFields().then(async (values) => {
            const body = await createKey(bootstrap, values);
            remember(body.key);
            setCreating(false);
            setRevealed(body.key);
          });
        }}
      >
        <Form form={form} layout="vertical" style={{ marginTop: 8 }}>
          <Form.Item name="tag" label="业务标签" rules={[{ required: true, message: "给这把钥匙起个业务名" }]}>
            <Input placeholder="例如：广场试用、内部评测" maxLength={32} />
          </Form.Item>
          <Form.Item name="description" label="描述">
            <Input.TextArea rows={3} placeholder="这把钥匙给谁用、限哪个环境" maxLength={120} />
          </Form.Item>
        </Form>
      </Modal>
      <Modal
        title="编辑密钥"
        open={Boolean(editing)}
        okText="保存"
        onCancel={() => {
          setEditing(null);
        }}
        onOk={() => {
          if (!editing) {
            return;
          }
          void editForm.validateFields().then(async (values) => {
            await updateKey(bootstrap, editing.id, values);
            await reload();
            setEditing(null);
            void message.success("已保存");
          });
        }}
      >
        <Form form={editForm} layout="vertical" style={{ marginTop: 8 }}>
          <Form.Item name="tag" label="业务标签" rules={[{ required: true, message: "标签不能为空" }]}>
            <Input maxLength={32} />
          </Form.Item>
          <Form.Item name="description" label="描述">
            <Input.TextArea rows={3} maxLength={120} />
          </Form.Item>
        </Form>
      </Modal>
      <Modal
        title="请保存这把密钥"
        open={Boolean(revealed)}
        okText="已复制并关闭"
        cancelButtonProps={{ style: { display: "none" } }}
        onCancel={() => {
          setRevealed(null);
        }}
        onOk={() => {
          if (revealed?.secret) {
            void navigator.clipboard.writeText(revealed.secret);
            void message.success("已复制");
          }
          setRevealed(null);
        }}
      >
        {revealed?.secret ? (
          <div style={{ display: "grid", gap: 12 }}>
            <Typography.Paragraph type="secondary" style={{ marginBottom: 0 }}>
              完整密钥只显示这一次。网关已经认它，广场试用和 curl 可以直接用。
            </Typography.Paragraph>
            <Typography.Text code copyable>
              {revealed.secret}
            </Typography.Text>
          </div>
        ) : null}
      </Modal>
    </div>
  );
}
