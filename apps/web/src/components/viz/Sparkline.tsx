import type { ReactNode } from "react";
import { Line, LineChart, ResponsiveContainer } from "recharts";
import { chartStroke } from "./chartTheme.ts";

export function Sparkline({
  values,
  height = 40,
  color = chartStroke,
}: {
  values: number[];
  height?: number;
  color?: string;
}): ReactNode {
  if (values.length === 0) {
    return <div className="usage-spark" style={{ height }} />;
  }
  const data = values.map((value, index) => ({ i: index, v: value }));
  return (
    <div className="usage-spark" style={{ height, width: "100%" }}>
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={data} margin={{ top: 2, right: 0, bottom: 2, left: 0 }}>
          <Line type="monotone" dataKey="v" stroke={color} strokeWidth={1.4} dot={false} isAnimationActive={false} />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}
