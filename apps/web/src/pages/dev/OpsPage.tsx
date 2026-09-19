import type { ReactNode } from "react";
import { useEffect, useMemo, useState } from "react";
import { vendorLabel } from "../../catalog-engine/labels.ts";
import { VendorMark } from "../../catalog-engine/VendorMark.tsx";
import { PageFrame } from "../../components/biz/PageFrame.tsx";
import { PageHeader } from "../../components/biz/PageHeader.tsx";
import { StatusDot } from "../../components/ui/StatusDot.tsx";
import { useCatalog } from "../../features/capability/useCatalog.ts";
import type { HealthReport, UsageReport } from "../../features/usage/types.ts";
import { useLocale } from "../../i18n/Locale.tsx";
import { getHealth, getUsage } from "../../lib/api.ts";
import "./admin.css";

function emptyUsage(): UsageReport {
  return {
    range: "24h",
    from: 0,
    to: 0,
    requests: 0,
    units: 0,
    success: 0,
    latency: 0,
    points: [],
    by_capability: [],
    by_key: [],
    by_channel: [],
    failures: [],
  };
}

function formatMs(value: number): string {
  if (value >= 1000) {
    return `${(value / 1000).toFixed(1)} s`;
  }
  return `${Math.round(value)} ms`;
}

function formatTime(value: number, locale: string): string {
  if (!value) {
    return "—";
  }
  return new Date(value).toLocaleString(locale === "zh" ? "zh-CN" : "en-US", {
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  });
}

export function OpsPage(): ReactNode {
  const { locale, copy } = useLocale();
  const a = copy.admin;
  const { capabilities } = useCatalog();
  const [health, setHealth] = useState<HealthReport | null>(null);
  const [usage, setUsage] = useState<UsageReport>(emptyUsage);
  const [error, setError] = useState("");

  const channels = useMemo(() => {
    const seen = new Map<string, { id: string; vendor: string }>();
    for (const capability of capabilities) {
      for (const channel of capability.channels) {
        if (!seen.has(channel.id)) {
          seen.set(channel.id, { id: channel.id, vendor: channel.vendor });
        }
      }
    }
    return [...seen.values()];
  }, [capabilities]);

  useEffect(() => {
    let cancelled = false;
    Promise.all([getHealth(), getUsage("24h")])
      .then(([nextHealth, nextUsage]) => {
        if (cancelled) {
          return;
        }
        setHealth(nextHealth);
        setUsage(nextUsage);
        setError("");
      })
      .catch((caught: unknown) => {
        if (!cancelled) {
          setError(caught instanceof Error ? caught.message : String(caught));
        }
      });
    return () => {
      cancelled = true;
    };
  }, []);

  const byChannel = useMemo(
    () => Object.fromEntries(usage.by_channel.map((row) => [row.id, row])),
    [usage.by_channel],
  );

  return (
    <PageFrame>
      <PageHeader eyebrow={a.opsEyebrow} title={a.opsTitle} description={a.opsIntro} />
      {error ? <div className="admin-empty">{error}</div> : null}
      <div className="admin-ops">
        <article className="admin-ops-card">
          <div className="admin-kicker">{a.opsGateway}</div>
          <div className="admin-ops-status">
            <StatusDot
              live={Boolean(health?.ok)}
              label={health?.ok ? a.opsUp : a.opsDown}
            />
            <strong>{health?.name ?? "myriad"}</strong>
          </div>
          <p className="admin-ops-meta admin-mono">
            {copy.usage.requests} {usage.requests} · {copy.usage.success} {usage.success}% · {copy.usage.latency}{" "}
            {formatMs(usage.latency)}
          </p>
        </article>
        <div className="admin-ops-channels">
          {channels.map((channel) => {
            const stat = byChannel[channel.id];
            return (
              <article key={channel.id} className="admin-ops-card">
                <div className="admin-ops-channel-head">
                  <VendorMark vendor={channel.vendor} size={24} />
                  <div>
                    <strong>{vendorLabel(channel.vendor, locale)}</strong>
                    <small className="admin-mono">{channel.id}</small>
                  </div>
                </div>
                {stat ? (
                  <p className="admin-ops-meta admin-mono">
                    {stat.ok}% · {formatMs(stat.latency)} · {stat.requests}
                    {stat.last_error ? ` · ${stat.last_error}` : ""}
                  </p>
                ) : (
                  <p className="admin-ops-meta">{a.channelsIdle}</p>
                )}
              </article>
            );
          })}
        </div>
        <section className="admin-ops-card">
          <div className="admin-kicker">{a.opsFailures}</div>
          {usage.failures.length === 0 ? (
            <p className="admin-ops-meta">{a.opsNone}</p>
          ) : (
            <table className="admin-ops-table">
              <thead>
                <tr>
                  <th>time</th>
                  <th>channel</th>
                  <th>capability</th>
                  <th>error</th>
                </tr>
              </thead>
              <tbody>
                {usage.failures.map((row) => (
                  <tr key={`${row.request_id}-${row.created_at}`}>
                    <td className="admin-mono">{formatTime(row.created_at, locale)}</td>
                    <td className="admin-mono">{row.channel_id}</td>
                    <td className="admin-mono">{row.capability_id}</td>
                    <td>{row.error}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </section>
      </div>
    </PageFrame>
  );
}
