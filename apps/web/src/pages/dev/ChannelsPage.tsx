import type { ReactNode } from "react";
import { useEffect, useMemo, useState } from "react";
import { vendorLabel } from "../../catalog-engine/labels.ts";
import { VendorMark } from "../../catalog-engine/VendorMark.tsx";
import { PageFrame } from "../../components/biz/PageFrame.tsx";
import { PageHeader } from "../../components/biz/PageHeader.tsx";
import { StatusDot } from "../../components/ui/StatusDot.tsx";
import { useCatalog } from "../../features/capability/useCatalog.ts";
import type { PublicChannel, PublicCapability } from "../../features/capability/types.ts";
import type { UsageGroup } from "../../features/usage/types.ts";
import { useLocale } from "../../i18n/Locale.tsx";
import { getUsage } from "../../lib/api.ts";
import "./admin.css";

interface ChannelRow {
  id: string;
  vendor: string;
  role: PublicChannel["role"];
  enabled: boolean;
  vendorModel?: string;
  capabilities: string[];
}

function collectChannels(capabilities: PublicCapability[]): ChannelRow[] {
  const rows = new Map<string, ChannelRow>();
  for (const capability of capabilities) {
    for (const channel of capability.channels) {
      const current = rows.get(channel.id);
      if (current) {
        if (!current.capabilities.includes(capability.id)) {
          current.capabilities.push(capability.id);
        }
        continue;
      }
      rows.set(channel.id, {
        id: channel.id,
        vendor: channel.vendor,
        role: channel.role,
        enabled: channel.enabled,
        vendorModel: channel.vendor_model,
        capabilities: [capability.id],
      });
    }
  }
  return [...rows.values()].sort((left, right) => left.vendor.localeCompare(right.vendor) || left.id.localeCompare(right.id));
}

function formatMs(value: number): string {
  if (value >= 1000) {
    return `${(value / 1000).toFixed(1)} s`;
  }
  return `${Math.round(value)} ms`;
}

export function ChannelsPage(): ReactNode {
  const { locale, copy } = useLocale();
  const a = copy.admin;
  const { capabilities, loading, error } = useCatalog();
  const [health, setHealth] = useState<Record<string, UsageGroup>>({});
  const rows = useMemo(() => collectChannels(capabilities), [capabilities]);
  const liveCount = rows.filter((row) => row.enabled).length;

  useEffect(() => {
    let cancelled = false;
    getUsage("24h")
      .then((report) => {
        if (cancelled) {
          return;
        }
        setHealth(Object.fromEntries(report.by_channel.map((row) => [row.id, row])));
      })
      .catch(() => {
        if (!cancelled) {
          setHealth({});
        }
      });
    return () => {
      cancelled = true;
    };
  }, []);

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
      {error ? <div className="admin-empty">{error}</div> : null}
      {!loading && rows.length === 0 && !error ? <div className="admin-empty">{copy.shelf.empty}</div> : null}
      <div className="admin-roster">
        {rows.map((row) => {
          const stat = health[row.id];
          return (
            <article key={row.id} className={row.enabled ? "admin-circuit is-live" : "admin-circuit is-down"}>
              <div className="admin-circuit-row">
                <VendorMark vendor={row.vendor} size={36} />
                <div className="admin-circuit-id">
                  <strong>{vendorLabel(row.vendor, locale)}</strong>
                  <small>{row.id}</small>
                </div>
                <span className="admin-wire" aria-hidden />
                <div className="admin-endpoint">
                  <span className="admin-url">{row.vendorModel || row.id}</span>
                  <span className="admin-secret">
                    {a.channelsCaps} {row.capabilities.join(" · ")}
                  </span>
                </div>
                <span className={row.role === "primary" ? "admin-role is-primary" : "admin-role"}>{row.role}</span>
                <div className="admin-channel-health admin-mono">
                  {stat ? (
                    <>
                      <StatusDot live={stat.ok >= 98} label={`${stat.ok}%`} />
                      <span>{formatMs(stat.latency)}</span>
                    </>
                  ) : (
                    <span className="admin-idle">{a.channelsIdle}</span>
                  )}
                </div>
              </div>
            </article>
          );
        })}
      </div>
    </PageFrame>
  );
}
