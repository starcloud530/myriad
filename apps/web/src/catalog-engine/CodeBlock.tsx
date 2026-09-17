import { CheckOutlined, CopyOutlined } from "@ant-design/icons";
import { Button, Segmented, Typography, message } from "antd";
import type { CSSProperties, ReactNode } from "react";
import { useState } from "react";
import { codeBg, codeFg } from "../tokens/theme.ts";

const preStyle: CSSProperties = {
  margin: 0,
  padding: 14,
  background: codeBg,
  color: codeFg,
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
  const [tab, setTab] = useState(tabs?.[0]?.value ?? "");
  const [copied, setCopied] = useState(false);
  const active = tabs?.find((item) => item.value === tab) ?? tabs?.[0];
  const text = active?.code ?? code ?? "";

  return (
    <div>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 8, marginBottom: 8 }}>
        {tabs && tabs.length > 1 ? (
          <Segmented
            size="small"
            value={active?.value}
            options={tabs.map((item) => ({ label: item.label, value: item.value }))}
            onChange={(value) => {
              setTab(String(value));
              setCopied(false);
            }}
          />
        ) : (
          <span />
        )}
        <Button
          size="small"
          icon={copied ? <CheckOutlined /> : <CopyOutlined />}
          onClick={() => {
            void navigator.clipboard.writeText(text).then(() => {
              setCopied(true);
              void message.success("已复制");
              window.setTimeout(() => {
                setCopied(false);
              }, 1500);
            });
          }}
        >
          复制
        </Button>
      </div>
      <pre style={preStyle}>
        <Typography.Text style={{ color: codeFg, fontFamily: "inherit", whiteSpace: "inherit" }}>{text}</Typography.Text>
      </pre>
    </div>
  );
}
