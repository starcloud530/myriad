import { useRef, useState, type CSSProperties, type KeyboardEvent, type ReactNode } from "react";
import { textFaint, textPrimary } from "../tokens/theme.ts";
import { useLocale } from "./Locale.tsx";
import type { Locale } from "./locale.ts";

const order: readonly Locale[] = ["en", "zh"];

const track: CSSProperties = {
  display: "inline-flex",
  alignItems: "center",
  padding: 2,
  border: "1px solid #1f1f1f",
  borderRadius: 7,
  background: "#000",
};

const chip = (on: boolean, ring: boolean): CSSProperties => ({
  appearance: "none",
  WebkitAppearance: "none",
  border: "none",
  height: 24,
  padding: "0 8px",
  borderRadius: 5,
  background: on ? "#1a1a1a" : "transparent",
  color: on ? textPrimary : textFaint,
  fontSize: 12,
  fontWeight: on ? 500 : 400,
  letterSpacing: "0.02em",
  lineHeight: 1,
  fontFamily: "inherit",
  cursor: "pointer",
  outline: "none",
  userSelect: "none",
  boxShadow: ring ? "inset 0 0 0 1px #2a2a2a" : "none",
});

export function LangSwitch({ onSwitch }: { onSwitch?: (next: "en" | "zh") => void }): ReactNode {
  const { locale, setLocale } = useLocale();
  const refs = useRef<Partial<Record<Locale, HTMLButtonElement | null>>>({});
  const [ring, setRing] = useState<Locale | null>(null);

  const pick = (id: Locale) => {
    if (id === locale) return;
    setLocale(id);
    onSwitch?.(id);
  };

  const move = (dir: -1 | 1) => {
    const i = order.indexOf(locale);
    const next = order[(i + dir + order.length) % order.length];
    pick(next);
    refs.current[next]?.focus();
  };

  const onKeyDown = (event: KeyboardEvent<HTMLDivElement>) => {
    if (event.key === "ArrowLeft") {
      event.preventDefault();
      move(-1);
      return;
    }
    if (event.key === "ArrowRight") {
      event.preventDefault();
      move(1);
    }
  };

  return (
    <div
      role="group"
      aria-label={locale === "zh" ? "语言" : "Language"}
      onKeyDown={onKeyDown}
      style={track}
    >
      {order.map((id) => {
        const on = locale === id;
        return (
          <button
            key={id}
            ref={(node) => {
              refs.current[id] = node;
            }}
            type="button"
            tabIndex={on ? 0 : -1}
            aria-pressed={on}
            aria-label={id === "en" ? "English" : "中文"}
            style={chip(on, ring === id)}
            onClick={() => pick(id)}
            onFocus={(event) => {
              if (event.currentTarget.matches(":focus-visible")) setRing(id);
            }}
            onBlur={() => setRing(null)}
          >
            {id === "en" ? "EN" : "中文"}
          </button>
        );
      })}
    </div>
  );
}
