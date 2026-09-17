import { Button as AntButton } from "antd";
import type { ButtonProps } from "antd";
import type { ReactNode } from "react";

export function Button(props: ButtonProps): ReactNode {
  return <AntButton {...props} />;
}
