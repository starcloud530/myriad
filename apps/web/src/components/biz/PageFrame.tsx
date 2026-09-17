import type { CSSProperties, ReactNode } from "react";
import { pageMaxWidth } from "../../tokens/theme.ts";

export function PageFrame({ children }: { children: ReactNode }): ReactNode {
  const style: CSSProperties = {
    display: "grid",
    gap: 24,
    width: "100%",
    maxWidth: pageMaxWidth,
    margin: "0 auto",
  };
  return <div style={style}>{children}</div>;
}
