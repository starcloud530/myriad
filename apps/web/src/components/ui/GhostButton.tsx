import type { ButtonHTMLAttributes, ReactNode } from "react";

export type GhostButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  children: ReactNode;
  title?: string;
};

export function GhostButton({
  children,
  className,
  disabled,
  style,
  title,
  type = "button",
  ...props
}: GhostButtonProps): ReactNode {
  return (
    <button
      type={type}
      className={className ? `btn-ghost ${className}` : "btn-ghost"}
      disabled={disabled}
      title={title}
      style={style}
      {...props}
    >
      {children}
    </button>
  );
}
