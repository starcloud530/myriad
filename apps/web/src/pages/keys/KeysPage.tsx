import { PlusOutlined } from "@ant-design/icons";
import { Button, Card, Form, Input, Modal, Space, Table, Tag, Typography, message } from "antd";
import type { ColumnsType } from "antd/es/table";
import type { ReactNode } from "react";
import { useMemo, useState } from "react";
import { PageFrame } from "../../components/biz/PageFrame.tsx";
import { PageHeader } from "../../components/biz/PageHeader.tsx";
import { StatRow } from "../../components/biz/StatRow.tsx";
import { forgetSecret } from "../../features/keys/sessionSecrets.ts";
import { displayKey, type ProductKey } from "../../features/keys/types.ts";
import { useProductKeys } from "../../features/keys/useProductKeys.ts";
import { useLocale } from "../../i18n/Locale.tsx";
import { createKey, deleteKey, rotateKey, updateKey } from "../../lib/api.ts";
import { getDevApiKey } from "../../lib/devKey.ts";

interface KeyForm {
  tag: string;
  description: string;
}

function formatTime(iso: string, locale: string): string {
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) {
    return iso;
  }
  return date.toLocaleString(locale === "zh" ? "zh-CN" : "en-US", { hour12: false });
}

export function KeysPage(): ReactNode {
  const { locale, copy } = useLocale();
  const k = copy.keys;
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
    { title: k.tag, dataIndex: "tag" },
    { title: k.description, dataIndex: "description", ellipsis: true },
    {
      title: k.created,
      dataIndex: "created_at",
      width: 180,
      render: (value: string) => formatTime(value, locale),
    },
    {
      title: k.status,
      dataIndex: "status",
      width: 88,
      render: (status: ProductKey["status"], row) =>
        row.system ? <Tag>{k.system}</Tag> : <Tag color={status === "active" ? "green" : "default"}>{status === "active" ? k.active : k.disabled}</Tag>,
    },
    {
      title: k.actions,
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
              {k.edit}
            </Button>
            <Button
              type="link"
              size="small"
              disabled={row.system}
              onClick={() => {
                Modal.confirm({
                  title: k.rotateTitle,
                  content: k.rotateBody,
                  okText: k.rotate,
                  onOk: async () => {
                    const body = await rotateKey(bootstrap, row.id);
                    remember(body.key);
                    setRevealed(body.key);
                  },
                });
              }}
            >
              {k.rotate}
            </Button>
            <Button
              type="link"
              size="small"
              danger
              disabled={row.system}
              onClick={() => {
                Modal.confirm({
                  title: k.removeTitle,
                  okText: k.remove,
                  okButtonProps: { danger: true },
                  onOk: async () => {
                    await deleteKey(bootstrap, row.id);
                    forgetSecret(row.id);
                    await reload();
                    void message.success(k.deleted);
                  },
                });
              }}
            >
              {k.remove}
            </Button>
          </Space>
        );
      },
    },
  ];

  return (
    <PageFrame>
      <PageHeader
        eyebrow={k.eyebrow}
        title={k.title}
        description={k.intro}
        extra={
          <Button
            type="primary"
            icon={<PlusOutlined />}
            onClick={() => {
              form.resetFields();
              setCreating(true);
            }}
          >
            {k.create}
          </Button>
        }
      />
      <StatRow
        items={[
          { label: k.count, value: String(keys.length) },
          { label: k.enabled, value: String(keys.filter((row) => row.status === "active").length) },
          { label: k.gateway, value: error ? k.offline : k.online },
        ]}
      />
      <Card
        styles={{ body: { paddingTop: 16 } }}
        title={k.list}
        extra={
          <Input.Search
            allowClear
            placeholder={k.search}
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
        title={k.createTitle}
        open={creating}
        okText={k.createOk}
        cancelText={k.cancel}
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
          <Form.Item name="tag" label={k.tag} rules={[{ required: true, message: k.tagRequired }]}>
            <Input placeholder={k.tagPh} maxLength={32} />
          </Form.Item>
          <Form.Item name="description" label={k.description}>
            <Input.TextArea rows={3} placeholder={k.descPh} maxLength={120} />
          </Form.Item>
        </Form>
      </Modal>
      <Modal
        title={k.editTitle}
        open={Boolean(editing)}
        okText={k.save}
        cancelText={k.cancel}
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
            void message.success(k.saved);
          });
        }}
      >
        <Form form={editForm} layout="vertical" style={{ marginTop: 8 }}>
          <Form.Item name="tag" label={k.tag} rules={[{ required: true, message: k.tagRequired }]}>
            <Input maxLength={32} />
          </Form.Item>
          <Form.Item name="description" label={k.description}>
            <Input.TextArea rows={3} maxLength={120} />
          </Form.Item>
        </Form>
      </Modal>
      <Modal
        title={k.saveOnce}
        open={Boolean(revealed)}
        okText={k.copiedClose}
        cancelButtonProps={{ style: { display: "none" } }}
        onCancel={() => {
          setRevealed(null);
        }}
        onOk={() => {
          if (revealed?.secret) {
            void navigator.clipboard.writeText(revealed.secret);
            void message.success(k.copied);
          }
          setRevealed(null);
        }}
      >
        {revealed?.secret ? (
          <div style={{ display: "grid", gap: 12 }}>
            <Typography.Paragraph type="secondary" style={{ marginBottom: 0 }}>
              {k.saveOnceBody}
            </Typography.Paragraph>
            <Typography.Text code copyable>
              {revealed.secret}
            </Typography.Text>
          </div>
        ) : null}
      </Modal>
    </PageFrame>
  );
}
