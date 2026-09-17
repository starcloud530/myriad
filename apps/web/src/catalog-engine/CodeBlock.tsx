import type { CSSProperties, ReactNode } from "react";
import { useState } from "react";
import { CodeTabs } from "../components/ui/CodeTabs.tsx";
import { CopyChip } from "../components/ui/CopyChip.tsx";
import { useLocale } from "../i18n/Locale.tsx";
import { codeBg, codeFg } from "../tokens/theme.ts";

const preStyle: CSSProperties = {
  margin: 0,
  padding: 14,
  background: codeBg,
  color: codeFg,
  border: "1px solid #1f1f1f",
  borderRadius: 8,
  overflow: "auto",
  fontSize: 13,
  lineHeight: 1.55,
  fontFamily: "ui-monospace, SFMono-Regular, Menlo, Consolas, monospace",
  whiteSpace: "pre-wrap",
  wordBreak: "break-word",
};

export function CodeBlock({
  code,
  tabs,
}: {
  code?: string;
  tabs?: Array<{ label: string; value: string; code: string }>;
}): ReactNode {
  const { copy } = useLocale();
  const [tab, setTab] = useState(tabs?.[0]?.value ?? "");
  const active = tabs?.find((item) => item.value === tab) ?? tabs?.[0];
  const text = active?.code ?? code ?? "";

  return (
    <div>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 8, marginBottom: 8 }}>
        {tabs && tabs.length > 1 ? (
          <CodeTabs
            tabs={tabs.map((item) => ({ label: item.label, value: item.value }))}
            value={active?.value ?? tab}
            onChange={setTab}
          />
        ) : (
          <span />
        )}
        <CopyChip text={text} copyLabel={copy.code.copy} copiedLabel={copy.code.copied} />
      </div>
      <pre style={preStyle}>{text}</pre>
    </div>
  );
}
