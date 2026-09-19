import { CopyOutlined, PlusOutlined } from "@ant-design/icons";
import { Form, Input, Modal, Switch, message } from "antd";
import type { ReactNode } from "react";
import { useMemo, useState } from "react";
import { Link } from "react-router";
import { PageFrame } from "../../components/biz/PageFrame.tsx";
import { PageHeader } from "../../components/biz/PageHeader.tsx";
import { GhostButton } from "../../components/ui/GhostButton.tsx";
import { IconButton } from "../../components/ui/IconButton.tsx";
import { SolidButton } from "../../components/ui/SolidButton.tsx";
import { isLocalOrigin, liveOrigin, PRODUCTION_ORIGIN } from "../../features/keys/origins.ts";
import { forgetSecret, secretOf } from "../../features/keys/sessionSecrets.ts";
import { displayKey, type ProductKey } from "../../features/keys/types.ts";
import { useProductKeys } from "../../features/keys/useProductKeys.ts";
import type { Locale } from "../../i18n/locale.ts";
import { useLocale } from "../../i18n/Locale.tsx";
import { docsHref } from "../docs/locale.ts";
import { createKey, deleteKey, rotateKey, updateKey } from "../../lib/api.ts";
import "./keys.css";

interface KeyForm {
  tag: string;
  description: string;
}

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
    second: "2-digit",
    hour12: false,
  });
}

function copyText(value: string, ok: string): void {
  void navigator.clipboard.writeText(value).then(() => {
    void message.success(ok);
  });
}

function Endpoint({ label, url, copyLabel }: { label: string; url: string; copyLabel: string }): ReactNode {
  return (
    <div className="keys-endpoint">
      <div className="keys-endpoint-label">{label}</div>
      <div className="keys-endpoint-row">
        <code title={url}>{url}</code>
        <IconButton aria-label={copyLabel} style={{ width: 28, height: 28 }} onClick={() => copyText(url, copyLabel)}>
          <CopyOutlined />
        </IconButton>
      </div>
    </div>
  );
}

export function KeysPage(): ReactNode {
  const { locale, copy } = useLocale();
  const k = copy.keys;
  const { keys, loading, error, reload, remember } = useProductKeys();
  const [query, setQuery] = useState("");
  const [creating, setCreating] = useState(false);
  const [editing, setEditing] = useState<ProductKey | null>(null);
  const [revealed, setRevealed] = useState<ProductKey | null>(null);
  const [rotating, setRotating] = useState<ProductKey | null>(null);
  const [removing, setRemoving] = useState<ProductKey | null>(null);
  const [form] = Form.useForm<KeyForm>();
  const [editForm] = Form.useForm<KeyForm>();

  const origin = liveOrigin();
  const local = isLocalOrigin(origin);
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

  const copySecret = (row: ProductKey): void => {
    const secret = secretOf(row.id, row.secret);
    if (!secret) {
      void message.info(k.noSecret);
      return;
    }
    copyText(secret, k.copied);
  };

  const toggleStatus = async (row: ProductKey, enabled: boolean): Promise<void> => {
    await updateKey(row.id, { status: enabled ? "active" : "disabled" });
    await reload();
  };

  return (
    <PageFrame>
      <PageHeader title={k.title} description={k.intro} />
      <section className="keys-banner">
        <div className="keys-banner-copy">
          <p className="keys-banner-kicker">{copy.brand}</p>
          <h2>{k.bannerTitle}</h2>
          <p>{k.bannerBody}</p>
          <div className="keys-banner-cta">
            <Link to={docsHref(locale, "keys")}>
              <GhostButton>{k.bannerCta}</GhostButton>
            </Link>
          </div>
        </div>
        <div className="keys-banner-mark" aria-hidden />
      </section>
      <section className="keys-section">
        <div className="keys-section-head">
          <h3>{k.section}</h3>
          <p>{k.sectionHint}</p>
        </div>
        <div className="keys-endpoints">
          <Endpoint label={k.sdkOrigin} url={origin} copyLabel={k.copyUrl} />
          <Endpoint label={k.capabilityApi} url={`${origin}/v1/capabilities/:id`} copyLabel={k.copyUrl} />
          {local ? <Endpoint label={k.production} url={PRODUCTION_ORIGIN} copyLabel={k.copyUrl} /> : null}
        </div>
        <div className="keys-toolbar">
          <input
            type="search"
            className="find-line"
            placeholder={k.search}
            value={query}
            onChange={(event) => {
              setQuery(event.target.value);
            }}
          />
          <SolidButton onClick={openCreate}>
            <PlusOutlined />
            {k.create}
          </SolidButton>
        </div>
        <div className="keys-table-wrap">
          <table className="keys-table">
            <thead>
              <tr>
                <th>{k.colId}</th>
                <th>{k.colKey}</th>
                <th>{k.colName}</th>
                <th>{k.created}</th>
                <th>{k.colScope}</th>
                <th>{k.status}</th>
                <th>{k.actions}</th>
              </tr>
            </thead>
            <tbody>
              {visible.map((row) => {
                const live = row.status === "active";
                return (
                  <tr key={row.id}>
                    <td className="keys-id">{row.id}</td>
                    <td>
                      <div className="keys-secret-cell">
                        <code>{displayKey(row)}</code>
                        <IconButton
                          aria-label={k.copyUrl}
                          style={{ width: 28, height: 28 }}
                          onClick={() => {
                            copySecret(row);
                          }}
                        >
                          <CopyOutlined />
                        </IconButton>
                      </div>
                    </td>
                    <td className="keys-name">{row.tag || "—"}</td>
                    <td>
                      <time className="keys-time" dateTime={row.created_at}>
                        {formatTime(row.created_at, locale)}
                      </time>
                    </td>
                    <td className="keys-scope">{k.scopeAll}</td>
                    <td>
                      <div className="keys-state">
                        <Switch
                          size="small"
                          checked={live}
                          disabled={row.system}
                          onChange={(enabled) => {
                            void toggleStatus(row, enabled);
                          }}
                        />
                        <span>{live ? k.active : k.disabled}</span>
                      </div>
                    </td>
                    <td>
                      <div className="keys-acts">
                        <GhostButton className="keys-act" disabled={row.system} onClick={() => openEdit(row)}>
                          {k.edit}
                        </GhostButton>
                        <GhostButton className="keys-act" disabled={row.system} onClick={() => setRotating(row)}>
                          {k.rotate}
                        </GhostButton>
                        <GhostButton
                          className="keys-act is-danger"
                          disabled={row.system}
                          onClick={() => setRemoving(row)}
                        >
                          {k.remove}
                        </GhostButton>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
          {!loading && visible.length === 0 ? <div className="keys-empty">{error || k.list}</div> : null}
        </div>
      </section>
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
            const body = await createKey(values);
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
            await updateKey(editing.id, values);
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
          void rotateKey(rotating.id).then((body) => {
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
          void deleteKey(removing.id).then(async () => {
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
