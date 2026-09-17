import type { CSSProperties, ReactNode } from "react";
import { pageMaxWidth } from "../../tokens/theme.ts";

export function PageFrame({
  children,
  wide = true,
  fill,
}: {
  children: ReactNode;
  wide?: boolean;
  fill?: boolean;
}): ReactNode {
  const style: CSSProperties = {
    display: "grid",
    gap: 22,
    width: "100%",
    maxWidth: wide ? "none" : pageMaxWidth,
    margin: "0 auto",
    minHeight: fill ? "calc(100dvh - 148px)" : undefined,
    gridTemplateRows: fill ? "auto auto 1fr" : undefined,
  };
  return <div style={style}>{children}</div>;
}
