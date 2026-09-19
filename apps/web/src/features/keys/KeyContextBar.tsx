import type { CSSProperties, ReactNode } from "react";
import { Input } from "../../components/ui/input.tsx";
import { textSecondary } from "../../tokens/theme.ts";

const labelStyle: CSSProperties = {
  display: "grid",
  gap: 6,
  fontSize: 13,
  color: textSecondary,
};

export function KeyContextBar({
  value,
  onCommit,
}: {
  value: string;
  onCommit: (key: string) => void;
}): ReactNode {
  return (
    <label style={labelStyle}>
      API Key
      <Input
        value={value}
        onChange={(event) => {
          onCommit(event.target.value);
        }}
        onBlur={(event) => {
          onCommit(event.target.value.trim());
        }}
        onPressEnter={(event) => {
          onCommit(event.currentTarget.value.trim());
        }}
      />
    </label>
  );
}
