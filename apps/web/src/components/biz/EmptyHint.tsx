import { Empty } from "antd";
import type { ReactNode } from "react";

export function EmptyHint({ description }: { description: string }): ReactNode {
  return (
    <div style={{ padding: "48px 16px" }}>
      <Empty description={description} />
    </div>
  );
}
