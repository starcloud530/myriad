import type { ReactNode } from "react";
import { Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { chartAxis, chartCursor, chartGrid, chartMuted, chartStroke, chartTooltipStyle } from "./chartTheme.ts";

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

export function BarSeries({
  values,
  labels,
  name,
  height = 260,
  valueFormatter,
}: {
  values: number[];
  labels?: string[];
  name?: string;
  height?: number;
  valueFormatter?: (value: number) => string;
}): ReactNode {
  const data = values.map((value, index) => ({
    label: labels?.[index] ?? String(index + 1),
    v: value,
  }));
  const formatTick = valueFormatter ?? String;
  return (
    <div className="usage-bars" style={{ height, width: "100%" }}>
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={data} margin={{ top: 8, right: 8, bottom: 0, left: 0 }} barCategoryGap={data.length > 20 ? 2 : 8}>
          <CartesianGrid stroke={chartGrid} strokeDasharray="3 3" vertical={false} />
          <XAxis
            dataKey="label"
            interval={axisInterval(data.length)}
            tick={{ fill: chartAxis, fontSize: 11 }}
            axisLine={{ stroke: chartGrid }}
            tickLine={false}
          />
          <YAxis
            width={48}
            tick={{ fill: chartAxis, fontSize: 11 }}
            axisLine={false}
            tickLine={false}
            tickFormatter={formatTick}
          />
          <Tooltip
            contentStyle={chartTooltipStyle}
            labelStyle={{ color: chartMuted }}
            itemStyle={{ color: "#fff" }}
            cursor={{ fill: chartCursor }}
            formatter={(value) => [formatTick(asNumber(value)), name ?? ""]}
          />
          <Bar dataKey="v" name={name} fill={chartStroke} radius={[2, 2, 0, 0]} maxBarSize={28} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
