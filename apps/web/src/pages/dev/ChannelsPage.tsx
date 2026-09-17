import type { ReactNode } from "react";
import { useRef, useState } from "react";
import { vendorLabel } from "../../catalog-engine/labels.ts";
import { VendorMark } from "../../catalog-engine/VendorMark.tsx";
import { PageFrame } from "../../components/biz/PageFrame.tsx";
import { PageHeader } from "../../components/biz/PageHeader.tsx";
import { StatusDot } from "../../components/ui/StatusDot.tsx";
import { useLocale } from "../../i18n/Locale.tsx";
import "./admin.css";

interface ChannelRow {
  id: string;
  vendor: string;
  role: "primary" | "fallback";
  baseUrl: string;
  secret: string;
  live: boolean;
}

const seed: ChannelRow[] = [
  { id: "deepseek", vendor: "deepseek", role: "primary", baseUrl: "https://api.deepseek.com", secret: "DEEPSEEK_API_KEY", live: true },
  { id: "qianwen", vendor: "qianwen", role: "fallback", baseUrl: "https://dashscope.aliyuncs.com/compatible-mode/v1", secret: "QIANWEN_API_KEY", live: true },
  { id: "fal-image", vendor: "fal", role: "primary", baseUrl: "https://fal.run", secret: "FAL_API_KEY", live: true },
  { id: "volcengine", vendor: "volcengine", role: "primary", baseUrl: "https://ark.cn-beijing.volces.com", secret: "VOLC_API_KEY", live: true },
  { id: "myriad-echo", vendor: "myriad", role: "primary", baseUrl: "worker://echo", secret: "—", live: true },
];

export function ChannelsPage(): ReactNode {
  const { locale, copy } = useLocale();
  const a = copy.admin;
  const [rows, setRows] = useState(seed);
  const [openId, setOpenId] = useState(seed[0]?.id ?? "");
  const [copiedId, setCopiedId] = useState("");
  const [pulseId, setPulseId] = useState("");
  const pulseTimer = useRef(0);
  const liveCount = rows.filter((row) => row.live).length;

  function toggle(id: string): void {
    setRows((current) => current.map((item) => (item.id === id ? { ...item, live: !item.live } : item)));
    setPulseId(id);
    window.clearTimeout(pulseTimer.current);
    pulseTimer.current = window.setTimeout(() => {
      setPulseId((current) => (current === id ? "" : current));
    }, 420);
  }

  function copyUrl(row: ChannelRow): void {
    if (!navigator.clipboard) {
      return;
    }
    void navigator.clipboard.writeText(row.baseUrl).then(
      () => {
        setCopiedId(row.id);
      },
      () => {
        setCopiedId("");
      },
    );
  }

  return (
    <PageFrame>
      <PageHeader
        eyebrow={a.channelsEyebrow}
        title={a.channelsTitle}
        description={a.channelsIntro}
        extra={
          <div className="admin-roster-meta admin-mono">
            <span>
              {copy.labels.live} {liveCount}
            </span>
            <span>
              {copy.labels.disabled} {rows.length - liveCount}
            </span>
          </div>
        }
      />
      <div className="admin-roster">
        {rows.map((row) => {
          const open = openId === row.id;
          const circuitClass = [
            "admin-circuit",
            row.live ? "is-live" : "is-down",
            open ? "is-open" : "",
            pulseId === row.id ? "is-pulse" : "",
          ]
            .filter(Boolean)
            .join(" ");
          return (
            <article key={row.id} className={circuitClass}>
              <div
                className="admin-circuit-row"
                onClick={() => setOpenId(row.id)}
              >
                <VendorMark vendor={row.vendor} size={36} />
                <div className="admin-circuit-id">
                  <strong>{vendorLabel(row.vendor, locale)}</strong>
                  <small>{row.id}</small>
                </div>
                <span className="admin-wire" aria-hidden />
                <div className="admin-endpoint">
                  <button
                    type="button"
                    className={copiedId === row.id ? "admin-url is-copied" : "admin-url"}
                    onClick={(event) => {
                      event.stopPropagation();
                      copyUrl(row);
                    }}
                  >
                    {copiedId === row.id ? copy.keys.copied : row.baseUrl}
                  </button>
                  <code className="admin-secret">{row.secret}</code>
                </div>
                <span className={row.role === "primary" ? "admin-role is-primary" : "admin-role"}>{row.role}</span>
                <button
                  type="button"
                  className={row.live ? "admin-breaker is-live" : "admin-breaker"}
                  aria-pressed={row.live}
                  onClick={(event) => {
                    event.stopPropagation();
                    toggle(row.id);
                  }}
                >
                  <span className="admin-breaker-track">
                    <span className="admin-breaker-knob" />
                  </span>
                  <StatusDot live={row.live} label={row.live ? copy.labels.live : copy.labels.disabled} />
                </button>
              </div>
              {open ? (
                <div className="admin-path">
                  <span />
                  <pre className="admin-mono">
                    {`base_url=${row.baseUrl}\nsecret=${row.secret}\nrole=${row.role}\nlive=${row.live ? "1" : "0"}`}
                  </pre>
                </div>
              ) : null}
            </article>
          );
        })}
      </div>
    </PageFrame>
  );
}
