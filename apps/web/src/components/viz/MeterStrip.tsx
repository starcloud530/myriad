import type { CSSProperties, ReactNode } from "react";

const stripStyle: CSSProperties = {
  display: "flex",
  flexWrap: "wrap",
  alignItems: "baseline",
  gap: 0,
  margin: 0,
  padding: "10px 0",
  listStyle: "none",
  background: "transparent",
  border: "none",
  borderTop: "1px solid #2a2a2a",
  borderBottom: "1px solid #2a2a2a",
  borderRadius: 0,
};

const cellStyle: CSSProperties = {
  display: "inline-flex",
  alignItems: "baseline",
  gap: 8,
  margin: 0,
  padding: "0 18px",
  background: "transparent",
  border: "none",
  borderLeft: "1px solid #2a2a2a",
  borderRadius: 0,
};

const firstCellStyle: CSSProperties = {
  ...cellStyle,
  borderLeft: "none",
  paddingLeft: 0,
};

const valueStyle: CSSProperties = {
  fontSize: 13,
  fontWeight: 650,
  fontVariantNumeric: "tabular-nums",
  letterSpacing: "0.01em",
  lineHeight: 1.2,
  color: "#fff",
};

const labelStyle: CSSProperties = {
  margin: 0,
  fontSize: 13,
  fontWeight: 400,
  lineHeight: 1.2,
  color: "#6b7280",
};

const hintStyle: CSSProperties = {
  margin: 0,
  fontSize: 12,
  lineHeight: 1.2,
  color: "#6b7280",
};

export function MeterStrip({
  items,
}: {
  items: Array<{ label: string; value: string; hint?: string }>;
}): ReactNode {
  return (
    <ul className="meter-strip" style={stripStyle}>
      {items.map((item, index) => (
        <li key={item.label} className="meter-cell" style={index === 0 ? firstCellStyle : cellStyle}>
          <span className="meter-value" style={valueStyle}>
            {item.value}
          </span>
          <span className="meter-label" style={labelStyle}>
            {item.label}
          </span>
          {item.hint ? (
            <span className="meter-hint" style={hintStyle}>
              {item.hint}
            </span>
          ) : null}
        </li>
      ))}
    </ul>
  );
}
