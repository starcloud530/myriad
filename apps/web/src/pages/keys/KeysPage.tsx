import { PlusOutlined } from "@ant-design/icons";
import { Form, Input, Modal, message } from "antd";
import type { ReactNode } from "react";
import { useMemo, useState } from "react";
import { PageFrame } from "../../components/biz/PageFrame.tsx";
import { PageHeader } from "../../components/biz/PageHeader.tsx";
import { GhostButton } from "../../components/ui/GhostButton.tsx";
import { SearchField } from "../../components/ui/SearchField.tsx";
import { SolidButton } from "../../components/ui/SolidButton.tsx";
import { SpecChip } from "../../components/ui/SpecChip.tsx";
import { StatusDot } from "../../components/ui/StatusDot.tsx";
import { MeterStrip } from "../../components/viz/MeterStrip.tsx";
import { forgetSecret } from "../../features/keys/sessionSecrets.ts";
import { displayKey, type ProductKey } from "../../features/keys/types.ts";
import { useProductKeys } from "../../features/keys/useProductKeys.ts";
import type { Locale } from "../../i18n/locale.ts";
import { useLocale } from "../../i18n/Locale.tsx";
import type { Messages } from "../../i18n/messages.ts";
import { createKey, deleteKey, rotateKey, updateKey } from "../../lib/api.ts";
import { getDevApiKey } from "../../lib/devKey.ts";
import "./keys.css";

interface KeyForm {
  tag: string;
  description: string;
}

type KeysCopy = Messages["keys"];

function formatTime(iso: string, locale: Locale): string {
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) {
    return iso;
  }
  return date.toLocaleString(locale === "zh" ? "zh-CN" : "en-US", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  });
}

function KeySlab({
  row,
  locale,
  labels,
  onEdit,
  onRotate,
  onRemove,
}: {
  row: ProductKey;
  locale: Locale;
  labels: KeysCopy;
  onEdit: (row: ProductKey) => void;
  onRotate: (row: ProductKey) => void;
  onRemove: (row: ProductKey) => void;
}): ReactNode {
  const locked = row.system;
  const live = row.status === "active";

  return (
    <article className="keys-slab">
      <div className="keys-head">
        <div className="keys-eyebrow">{row.tag || "—"}</div>
        {locked ? (
          <SpecChip>{labels.system}</SpecChip>
        ) : (
          <StatusDot live={live} label={live ? labels.active : labels.disabled} />
        )}
      </div>
      <p className="keys-prefix">{displayKey(row)}</p>
      <div className="keys-foot">
        <div className="keys-meta">
          <span>{row.description || "—"}</span>
          <span className="keys-meta-sep" aria-hidden>
            ·
          </span>
          <time dateTime={row.created_at}>{formatTime(row.created_at, locale)}</time>
        </div>
        <div className="keys-actions">
          <GhostButton disabled={locked} onClick={() => onEdit(row)}>
            {labels.edit}
          </GhostButton>
          <GhostButton disabled={locked} onClick={() => onRotate(row)}>
            {labels.rotate}
          </GhostButton>
          <GhostButton disabled={locked} onClick={() => onRemove(row)}>
            {labels.remove}
          </GhostButton>
        </div>
      </div>
    </article>
  );
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
  const [rotating, setRotating] = useState<ProductKey | null>(null);
  const [removing, setRemoving] = useState<ProductKey | null>(null);
  const [form] = Form.useForm<KeyForm>();
  const [editForm] = Form.useForm<KeyForm>();

  const visible = useMemo(() => {
    const needle = query.trim().toLowerCase();
    if (!needle) {
      return keys;
    }
    return keys.filter((row) => [row.id, row.tag, row.description, row.prefix].join(" ").toLowerCase().includes(needle));
  }, [query, keys]);

  const openCreate = (): void => {
    form.resetFields();
    setCreating(true);
  };

  const openEdit = (row: ProductKey): void => {
    setEditing(row);
    editForm.setFieldsValue({ tag: row.tag, description: row.description });
  };

  const confirmRotate = (row: ProductKey): void => {
    setRotating(row);
  };

  const confirmRemove = (row: ProductKey): void => {
    setRemoving(row);
  };

  return (
    <PageFrame>
      <PageHeader
        eyebrow={k.eyebrow}
        title={k.title}
        description={k.intro}
        extra={
          <SolidButton onClick={openCreate}>
            <PlusOutlined />
            {k.create}
          </SolidButton>
        }
      />
      <MeterStrip
        items={[
          { label: k.count, value: String(keys.length) },
          { label: k.enabled, value: String(keys.filter((row) => row.status === "active").length) },
          { label: k.gateway, value: error ? k.offline : k.online },
        ]}
      />
      <SearchField
        className="keys-search"
        placeholder={k.search}
        value={query}
        style={{
          width: "100%",
          maxWidth: "none",
          height: 40,
          borderRadius: 0,
          borderWidth: "0 0 1px",
          background: "transparent",
        }}
        onChange={(event) => {
          setQuery(event.target.value);
        }}
      />
      <div className="keys-roster">
        {!loading && visible.length === 0 ? <div className="keys-empty">{k.list}</div> : null}
        {visible.map((row) => (
          <KeySlab
            key={row.id}
            row={row}
            locale={locale}
            labels={k}
            onEdit={openEdit}
            onRotate={confirmRotate}
            onRemove={confirmRemove}
          />
        ))}
      </div>
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
        title={k.rotateTitle}
        open={Boolean(rotating)}
        okText={k.rotate}
        cancelText={k.cancel}
        onCancel={() => {
          setRotating(null);
        }}
        onOk={() => {
          if (!rotating) {
            return;
          }
          void rotateKey(bootstrap, rotating.id).then((body) => {
            remember(body.key);
            setRotating(null);
            setRevealed(body.key);
          });
        }}
      >
        <p className="keys-reveal-body">{k.rotateBody}</p>
      </Modal>
      <Modal
        title={k.removeTitle}
        open={Boolean(removing)}
        okText={k.remove}
        cancelText={k.cancel}
        okButtonProps={{ danger: true }}
        onCancel={() => {
          setRemoving(null);
        }}
        onOk={() => {
          if (!removing) {
            return;
          }
          void deleteKey(bootstrap, removing.id).then(async () => {
            forgetSecret(removing.id);
            await reload();
            setRemoving(null);
            void message.success(k.deleted);
          });
        }}
      />
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
          <div className="keys-reveal">
            <p className="keys-reveal-body">{k.saveOnceBody}</p>
            <code className="keys-secret">{revealed.secret}</code>
          </div>
        ) : null}
      </Modal>
    </PageFrame>
  );
}
