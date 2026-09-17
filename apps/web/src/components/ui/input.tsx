import { Input as AntInput } from "antd";
import type { InputProps, InputRef } from "antd";
import type { TextAreaProps } from "antd/es/input";
import type { ReactNode, Ref } from "react";

export function Input(props: InputProps & { ref?: Ref<InputRef> }): ReactNode {
  return <AntInput {...props} />;
}

export function TextArea(props: TextAreaProps): ReactNode {
  return <AntInput.TextArea {...props} />;
}
