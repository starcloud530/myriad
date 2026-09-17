import { CheckOutlined, CopyOutlined } from "@ant-design/icons";
import type { ReactNode } from "react";
import { useState } from "react";

export function CopyChip({
  text,
  copyLabel,
  copiedLabel,
}: {
  text: string;
  copyLabel: string;
  copiedLabel: string;
}): ReactNode {
  const [copied, setCopied] = useState(false);

  return (
    <button
      type="button"
      className="copy-chip"
      aria-live="polite"
      onClick={() => {
        void navigator.clipboard.writeText(text).then(() => {
          setCopied(true);
          window.setTimeout(() => {
            setCopied(false);
          }, 1400);
        });
      }}
    >
      {copied ? <CheckOutlined /> : <CopyOutlined />}
      <span>{copied ? copiedLabel : copyLabel}</span>
    </button>
  );
}
