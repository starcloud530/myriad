import type { ReactNode } from "react";
import { downColor, liveColor, textFaint, textSecondary } from "../../tokens/theme.ts";

export function StatusDot({
  live,
  label,
}: {
  live: boolean;
  label: string;
}): ReactNode {
  return (
    <span
      title={label}
      aria-label={label}
      style={{
        display: "inline-flex",
        alignItems: "center",
        gap: 6,
        flexShrink: 0,
        padding: 0,
        background: "transparent",
        border: "none",
        borderRadius: 0,
        color: live ? textSecondary : textFaint,
        fontSize: 11,
        fontWeight: 500,
        letterSpacing: "0.02em",
        lineHeight: 1,
        whiteSpace: "nowrap",
      }}
    >
      <span
        aria-hidden
        style={{
          width: 6,
          height: 6,
          flexShrink: 0,
          borderRadius: "50%",
          background: live ? liveColor : downColor,
          boxShadow: live ? "0 0 0 2px rgba(74, 222, 128, 0.08)" : "none",
        }}
      />
      <span>{label}</span>
    </span>
  );
}
