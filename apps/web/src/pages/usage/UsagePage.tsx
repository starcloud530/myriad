import type { ReactNode } from "react";
import { useEffect, useState } from "react";
import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { PageFrame } from "../../components/biz/PageFrame.tsx";
import { PageHeader } from "../../components/biz/PageHeader.tsx";
import { BarSeries } from "../../components/viz/BarSeries.tsx";
import {
  chartArea,
  chartAxis,
  chartBad,
  chartCursor,
  chartGrid,
  chartMuted,
  chartOk,
  chartStroke,
  chartTooltipStyle,
} from "../../components/viz/chartTheme.ts";
import { Sparkline } from "../../components/viz/Sparkline.tsx";
import type { UsageRange, UsageReport } from "../../features/usage/types.ts";
import { useLocale } from "../../i18n/Locale.tsx";
import { getUsage } from "../../lib/api.ts";
import "./usage.css";

const RANGES: UsageRange[] = ["24h", "7d", "30d"];

function emptyReport(range: UsageRange): UsageReport {
  return {
    range,
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

function formatCount(value: number): string {
  if (value >= 1_000_000) {
    return `${(value / 1_000_000).toFixed(1)}M`;
  }
  if (value >= 1000) {
    return `${(value / 1000).toFixed(1)}k`;
  }
  return String(Math.round(value));
}

function formatMs(value: number): string {
  if (value >= 1000) {
    return `${(value / 1000).toFixed(1)} s`;
  }
  return `${Math.round(value)} ms`;
}

function asNumber(value: unknown): number {
  if (typeof value === "number" && Number.isFinite(value)) {
    return value;
  }
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : 0;
}

function axisInterval(length: number): number {
  if (length <= 8) {
    return 0;
  }
  if (length <= 24) {
    return 3;
  }
  return 4;
}

function toneClass(ok: number): string {
  if (ok >= 99) {
    return "is-ok";
  }
  if (ok < 98) {
    return "is-bad";
  }
  return "";
}

export function UsagePage(): ReactNode {
  const { copy } = useLocale();
  const u = copy.usage;
  const [range, setRange] = useState<UsageRange>("7d");
  const [report, setReport] = useState<UsageReport>(() => emptyReport("7d"));
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    getUsage(range)
      .then((body) => {
        if (!cancelled) {
          setReport(body);
          setError("");
        }
      })
      .catch((caught: unknown) => {
        if (!cancelled) {
          setReport(emptyReport(range));
          setError(caught instanceof Error ? caught.message : String(caught));
        }
      })
      .finally(() => {
        if (!cancelled) {
          setLoading(false);
        }
      });
    return () => {
      cancelled = true;
    };
  }, [range]);

  const points = report.points;
  const requests = points.map((point) => point.requests);
  const units = points.map((point) => point.units);
  const success = points.map((point) => point.success);
  const latency = points.map((point) => point.latency);
  const keyMax = Math.max(...report.by_key.map((row) => row.requests), 1);
  const capMax = Math.max(...report.by_capability.map((row) => row.requests), 1);

  return (
    <PageFrame>
      <div className="usage-page">
        <PageHeader
          eyebrow={u.eyebrow}
          title={u.title}
          description={u.intro}
          extra={
            <div className="usage-range">
              {RANGES.map((item) => (
                <button key={item} type="button" className={range === item ? "is-on" : undefined} onClick={() => setRange(item)}>
                  {u[item]}
                </button>
              ))}
            </div>
          }
        />
        {error ? <p className="usage-note">{error}</p> : null}
        {!loading && report.requests === 0 && !error ? <p className="usage-note">{u.empty}</p> : null}
        <div className="usage-kpis">
          <article className="usage-kpi is-lead">
            <div className="pane-kicker">{u.requests}</div>
            <div className="usage-kpi-value">{formatCount(report.requests)}</div>
            <div className="usage-kpi-sub">{u[range]}</div>
            <Sparkline values={requests} />
          </article>
          <article className="usage-kpi">
            <div className="pane-kicker">{u.units}</div>
            <div className="usage-kpi-value">{formatCount(report.units)}</div>
            <div className="usage-kpi-sub">{u[range]}</div>
            <Sparkline values={units} />
          </article>
          <article className="usage-kpi">
            <div className="pane-kicker">{u.success}</div>
            <div className="usage-kpi-value">{report.success.toFixed(1)}%</div>
            <div className="usage-kpi-sub">{u[range]}</div>
            <Sparkline values={success} color={report.success >= 99 ? chartOk : chartBad} />
          </article>
          <article className="usage-kpi">
            <div className="pane-kicker">{u.latency}</div>
            <div className="usage-kpi-value">{formatMs(report.latency)}</div>
            <div className="usage-kpi-sub">{u[range]}</div>
            <Sparkline values={latency} />
          </article>
        </div>
        <div className="usage-main">
          <section className="usage-card">
            <div className="pane-kicker">{u.overTime}</div>
            <div className="usage-card-plot">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={points} margin={{ top: 8, right: 8, bottom: 0, left: 0 }}>
                  <CartesianGrid stroke={chartGrid} strokeDasharray="3 3" vertical={false} />
                  <XAxis
                    dataKey="label"
                    interval={axisInterval(points.length)}
                    tick={{ fill: chartAxis, fontSize: 11 }}
                    axisLine={{ stroke: chartGrid }}
                    tickLine={false}
                  />
                  <YAxis
                    width={48}
                    tick={{ fill: chartAxis, fontSize: 11 }}
                    axisLine={false}
                    tickLine={false}
                    tickFormatter={formatCount}
                  />
                  <Tooltip
                    contentStyle={chartTooltipStyle}
                    labelStyle={{ color: chartMuted }}
                    itemStyle={{ color: "#fff" }}
                    cursor={{ stroke: chartGrid, strokeDasharray: "3 3" }}
                    formatter={(value) => [formatCount(asNumber(value)), u.requests]}
                  />
                  <Area
                    type="monotone"
                    dataKey="requests"
                    name={u.requests}
                    stroke={chartStroke}
                    fill={chartArea}
                    strokeWidth={1.5}
                    dot={false}
                    activeDot={{ r: 3, fill: chartStroke, strokeWidth: 0 }}
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </section>
          <section className="usage-card">
            <div className="pane-kicker">{u.unitOverTime}</div>
            <BarSeries
              values={units}
              labels={points.map((point) => point.label)}
              name={u.units}
              valueFormatter={formatCount}
            />
          </section>
        </div>
        <div className="usage-bottom">
          <section className="usage-card">
            <div className="pane-kicker">{u.byCapability}</div>
            <div className="usage-card-plot is-short">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart layout="vertical" data={report.by_capability} margin={{ top: 4, right: 16, left: 8, bottom: 4 }}>
                  <CartesianGrid stroke={chartGrid} strokeDasharray="3 3" horizontal={false} />
                  <XAxis
                    type="number"
                    domain={[0, capMax]}
                    tick={{ fill: chartAxis, fontSize: 11 }}
                    axisLine={false}
                    tickLine={false}
                    tickFormatter={formatCount}
                  />
                  <YAxis
                    type="category"
                    dataKey="id"
                    width={118}
                    tick={{ fill: chartStroke, fontSize: 12 }}
                    axisLine={false}
                    tickLine={false}
                  />
                  <Tooltip
                    contentStyle={chartTooltipStyle}
                    labelStyle={{ color: chartMuted }}
                    itemStyle={{ color: "#fff" }}
                    cursor={{ fill: chartCursor }}
                    formatter={(value) => [formatCount(asNumber(value)), u.requests]}
                  />
                  <Bar dataKey="requests" name={u.requests} fill={chartStroke} radius={[0, 2, 2, 0]} barSize={12} />
                </BarChart>
              </ResponsiveContainer>
            </div>
            <table className="usage-table">
              <thead>
                <tr>
                  <th>{u.byCapability}</th>
                  <th>{u.requests}</th>
                  <th>{u.success}</th>
                  <th>{u.latency}</th>
                </tr>
              </thead>
              <tbody>
                {report.by_capability.length === 0 ? (
                  <tr>
                    <td colSpan={4}>{u.none}</td>
                  </tr>
                ) : (
                  report.by_capability.map((row) => (
                    <tr key={row.id}>
                      <td className="usage-name">{row.id}</td>
                      <td>{formatCount(row.requests)}</td>
                      <td className={toneClass(row.ok)}>{row.ok}%</td>
                      <td>{formatMs(row.latency)}</td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </section>
          <section className="usage-card">
            <div className="pane-kicker">{u.byKey}</div>
            <div className="usage-card-plot is-short">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart layout="vertical" data={report.by_key} margin={{ top: 4, right: 16, left: 8, bottom: 4 }}>
                  <CartesianGrid stroke={chartGrid} strokeDasharray="3 3" horizontal={false} />
                  <XAxis
                    type="number"
                    domain={[0, keyMax]}
                    tick={{ fill: chartAxis, fontSize: 11 }}
                    axisLine={false}
                    tickLine={false}
                    tickFormatter={formatCount}
                  />
                  <YAxis
                    type="category"
                    dataKey="id"
                    width={88}
                    tick={{ fill: chartStroke, fontSize: 12 }}
                    axisLine={false}
                    tickLine={false}
                  />
                  <Tooltip
                    contentStyle={chartTooltipStyle}
                    labelStyle={{ color: chartMuted }}
                    itemStyle={{ color: "#fff" }}
                    cursor={{ fill: chartCursor }}
                    formatter={(value) => [formatCount(asNumber(value)), u.requests]}
                  />
                  <Bar dataKey="requests" name={u.requests} fill={chartStroke} radius={[0, 2, 2, 0]} barSize={14} />
                </BarChart>
              </ResponsiveContainer>
            </div>
            <table className="usage-table">
              <thead>
                <tr>
                  <th>{u.byKey}</th>
                  <th>{u.requests}</th>
                  <th>{u.success}</th>
                </tr>
              </thead>
              <tbody>
                {report.by_key.length === 0 ? (
                  <tr>
                    <td colSpan={3}>{u.none}</td>
                  </tr>
                ) : (
                  report.by_key.map((row) => (
                    <tr key={row.id}>
                      <td className="usage-name">{row.id}</td>
                      <td>{formatCount(row.requests)}</td>
                      <td className={toneClass(row.ok)}>{row.ok}%</td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </section>
        </div>
      </div>
    </PageFrame>
  );
}
