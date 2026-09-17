import { Alert } from "antd";
import type { ReactNode } from "react";

export function ErrorHint({ message }: { message: string }): ReactNode {
  return <Alert type="error" showIcon message={message} />;
}
