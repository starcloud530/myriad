import { Button, Empty, Tag } from "antd";
import type { ReactNode } from "react";
import { useNavigate } from "react-router";
import { PageHeader } from "./PageHeader.tsx";

export function UnwiredHint({
  title,
  detail,
}: {
  title: string;
  detail: string;
}): ReactNode {
  const navigate = useNavigate();
  return (
    <div style={{ display: "grid", gap: 20, width: "100%" }}>
      <PageHeader title={title} extra={<Tag>未接通</Tag>} />
      <Empty
        description={detail}
        style={{ padding: "48px 16px" }}
      >
        <Button type="primary" onClick={() => void navigate("/keys")}>
          去 API Keys
        </Button>
      </Empty>
    </div>
  );
}
