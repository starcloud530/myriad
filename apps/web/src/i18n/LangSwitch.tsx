import type { ReactNode } from "react";
import { textPrimary, textSecondary } from "../tokens/theme.ts";
import { useLocale } from "./Locale.tsx";
import type { Locale } from "./locale.ts";

export function LangSwitch({ onSwitch }: { onSwitch?: (next: Locale) => void }): ReactNode {
  const { locale, setLocale } = useLocale();
  const option = (id: Locale, label: string): ReactNode => (
    <button
      type="button"
      onClick={() => {
        setLocale(id);
        onSwitch?.(id);
      }}
      style={{
        border: "none",
        background: "none",
        padding: 0,
        cursor: "pointer",
        fontSize: 13,
        fontWeight: locale === id ? 650 : 400,
        color: locale === id ? textPrimary : textSecondary,
      }}
    >
      {label}
    </button>
  );
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
      {option("en", "EN")}
      <span style={{ color: textSecondary }}>/</span>
      {option("zh", "中文")}
    </div>
  );
}
