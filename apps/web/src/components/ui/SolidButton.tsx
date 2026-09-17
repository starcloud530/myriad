import type { ButtonHTMLAttributes, ReactNode } from "react";

export type SolidButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  children: ReactNode;
  title?: string;
};

export function SolidButton({
  children,
  className,
  disabled,
  style,
  title,
  type = "button",
  ...props
}: SolidButtonProps): ReactNode {
  return (
    <button
      type={type}
      className={className ? `btn-solid ${className}` : "btn-solid"}
      disabled={disabled}
      title={title}
      style={style}
      {...props}
    >
      {children}
    </button>
  );
}
