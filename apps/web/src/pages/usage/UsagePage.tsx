import type { ReactNode } from "react";
import { useMemo, useState } from "react";
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
import { useLocale } from "../../i18n/Locale.tsx";
import type { Locale } from "../../i18n/locale.ts";
import "./usage.css";

type Range = "24h" | "7d" | "30d";

type Point = {
  label: string;
  requests: number;
  tokens: number;
  success: number;
  ttft: number;
  latency: number;
};

type CapRow = {
  name: string;
  sharePct: number;
  ok: number;
  ttft: number;
};

type KeyRow = {
  tag: string;
  requests: number;
  ok: number;
};

const RANGES: Range[] = ["24h", "7d", "30d"];
const SAMPLE_NOW = new Date(2026, 8, 18);

function wave(seed: number, index: number, base: number, swing: number): number {
  const curve = Math.sin((index + seed) / 2.4) * swing;
  const jitter = (((index * 17 + seed * 13) % 11) - 5) * (swing / 36);
  return Math.max(0, base + curve + jitter);
}

function envelope(range: Range, index: number): number {
  if (range === "24h") {
    if (index < 6) return 0.34;
    if (index < 9) return 0.72;
    if (index < 18) return 1;
    if (index < 22) return 0.76;
    return 0.44;
  }
  const weekend = range === "7d" ? index >= 5 : index % 7 >= 5;
  return weekend ? 0.64 : 1;
}

function timeLabel(range: Range, index: number, length: number, locale: Locale): string {
  if (range === "24h") {
    return `${String(index).padStart(2, "0")}:00`;
  }
  const day = new Date(SAMPLE_NOW);
  day.setDate(SAMPLE_NOW.getDate() - (length - 1 - index));
  return day.toLocaleDateString(locale === "zh" ? "zh-CN" : "en-US", { month: "numeric", day: "numeric" });
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

function average(values: number[]): number {
  if (values.length === 0) {
    return 0;
  }
  return values.reduce((sum, value) => sum + value, 0) / values.length;
}

function percentile(values: number[], p: number): number {
  if (values.length === 0) {
    return 0;
  }
  const sorted = [...values].sort((left, right) => left - right);
  const index = Math.min(sorted.length - 1, Math.max(0, Math.ceil((p / 100) * sorted.length) - 1));
  return sorted[index] ?? 0;
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

function buildPoints(range: Range, locale: Locale): Point[] {
  const length = range === "24h" ? 24 : range === "7d" ? 7 : 30;
  const requestBase = range === "24h" ? 420 : 9800;
  const requestSwing = range === "24h" ? 80 : 1800;
  const tokenBase = range === "24h" ? 2_400_000 : 18_000_000;
  const tokenSwing = range === "24h" ? 400_000 : 3_000_000;
  return Array.from({ length }, (_, index) => {
    const scale = envelope(range, index);
    return {
      label: timeLabel(range, index, length, locale),
      requests: Math.round(wave(3, index, requestBase, requestSwing) * scale),
      tokens: Math.round(wave(8, index, tokenBase, tokenSwing) * scale),
      success: Math.round(wave(5, index, 99.12, 0.35) * 10) / 10,
      ttft: Math.round(wave(2, index, 412, 70)),
      latency: Math.round(wave(6, index, 1800, 320)),
    };
  });
}

export function UsagePage(): ReactNode {
  const { copy, locale } = useLocale();
  const u = copy.usage;
  const [range, setRange] = useState<Range>("7d");
  const points = useMemo(() => buildPoints(range, locale), [locale, range]);
  const requests = points.map((point) => point.requests);
  const tokens = points.map((point) => point.tokens);
  const success = points.map((point) => point.success);
  const ttft = points.map((point) => point.ttft);
  const latency = points.map((point) => point.latency);
  const requestTotal = requests.reduce((sum, value) => sum + value, 0);
  const tokenTotal = tokens.reduce((sum, value) => sum + value, 0);
  const successAvg = average(success);
  const ttftAvg = average(ttft);
  const latencyAvg = average(latency);
  const capabilities: CapRow[] = [
    { name: "chat", sharePct: 62, ok: 99.4, ttft: 380 },
    { name: "generate.image", sharePct: 18, ok: 98.1, ttft: 920 },
    { name: "generate.video", sharePct: 11, ok: 96.8, ttft: 1400 },
    { name: "generate.audio", sharePct: 9, ok: 99.0, ttft: 610 },
  ];
  const keys: KeyRow[] = [
    { tag: "system", requests: Math.round(requestTotal * 0.41), ok: 99.6 },
    { tag: "production", requests: Math.round(requestTotal * 0.37), ok: 99.1 },
    { tag: "eval", requests: Math.round(requestTotal * 0.22), ok: 97.8 },
  ];
  const keyMax = Math.max(...keys.map((row) => row.requests), 1);

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
        <p className="usage-note">{u.sample}</p>
        <div className="usage-kpis">
          <article className="usage-kpi is-lead">
            <div className="pane-kicker">{u.requests}</div>
            <div className="usage-kpi-value">{formatCount(requestTotal)}</div>
            <div className="usage-kpi-sub">{u[range]}</div>
            <Sparkline values={requests} />
          </article>
          <article className="usage-kpi">
            <div className="pane-kicker">{u.tokens}</div>
            <div className="usage-kpi-value">{formatCount(tokenTotal)}</div>
            <div className="usage-kpi-sub">{u[range]}</div>
            <Sparkline values={tokens} />
          </article>
          <article className="usage-kpi">
            <div className="pane-kicker">{u.success}</div>
            <div className="usage-kpi-value">{successAvg.toFixed(1)}%</div>
            <div className="usage-kpi-sub">
              P50 {percentile(success, 50).toFixed(1)} · P95 {percentile(success, 95).toFixed(1)}
            </div>
            <Sparkline values={success} color={successAvg >= 99 ? chartOk : chartBad} />
          </article>
          <article className="usage-kpi">
            <div className="pane-kicker">{u.ttft}</div>
            <div className="usage-kpi-value">{formatMs(ttftAvg)}</div>
            <div className="usage-kpi-sub">P95 {formatMs(percentile(ttft, 95))}</div>
            <Sparkline values={ttft} />
          </article>
          <article className="usage-kpi">
            <div className="pane-kicker">{u.latency}</div>
            <div className="usage-kpi-value">{formatMs(latencyAvg)}</div>
            <div className="usage-kpi-sub">P95 {formatMs(percentile(latency, 95))}</div>
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
            <div className="pane-kicker">{u.tokenOverTime}</div>
            <BarSeries
              values={tokens}
              labels={points.map((point) => point.label)}
              name={u.tokens}
              valueFormatter={formatCount}
            />
          </section>
        </div>
        <div className="usage-bottom">
          <section className="usage-card">
            <div className="pane-kicker">{u.byCapability}</div>
            <div className="usage-card-plot is-short">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart layout="vertical" data={capabilities} margin={{ top: 4, right: 16, left: 8, bottom: 4 }}>
                  <CartesianGrid stroke={chartGrid} strokeDasharray="3 3" horizontal={false} />
                  <XAxis
                    type="number"
                    domain={[0, 100]}
                    tick={{ fill: chartAxis, fontSize: 11 }}
                    axisLine={false}
                    tickLine={false}
                    tickFormatter={(value: number) => `${value}%`}
                  />
                  <YAxis
                    type="category"
                    dataKey="name"
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
                    formatter={(value) => [`${asNumber(value)}%`, u.byCapability]}
                  />
                  <Bar dataKey="sharePct" name={u.byCapability} fill={chartStroke} radius={[0, 2, 2, 0]} barSize={12} />
                </BarChart>
              </ResponsiveContainer>
            </div>
            <table className="usage-table">
              <thead>
                <tr>
                  <th>{u.byCapability}</th>
                  <th>{u.success}</th>
                  <th>{u.ttft}</th>
                </tr>
              </thead>
              <tbody>
                {capabilities.map((row) => (
                  <tr key={row.name}>
                    <td className="usage-name">{row.name}</td>
                    <td className={toneClass(row.ok)}>{row.ok}%</td>
                    <td>{row.ttft} ms</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </section>
          <section className="usage-card">
            <div className="pane-kicker">{u.byKey}</div>
            <div className="usage-card-plot is-short">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart layout="vertical" data={keys} margin={{ top: 4, right: 16, left: 8, bottom: 4 }}>
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
                    dataKey="tag"
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
                {keys.map((row) => (
                  <tr key={row.tag}>
                    <td className="usage-name">{row.tag}</td>
                    <td>{formatCount(row.requests)}</td>
                    <td className={toneClass(row.ok)}>{row.ok}%</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </section>
        </div>
      </div>
    </PageFrame>
  );
}
