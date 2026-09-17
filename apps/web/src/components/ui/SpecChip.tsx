import type { ReactNode } from "react";

export function SpecChip({ children }: { children: ReactNode }): ReactNode {
  return <span className="spec-chip">{children}</span>;
}
