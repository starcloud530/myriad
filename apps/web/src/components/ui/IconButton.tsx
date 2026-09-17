import type { ButtonHTMLAttributes, ReactNode } from "react";

export function IconButton({
  children,
  style,
  ...props
}: ButtonHTMLAttributes<HTMLButtonElement> & { children: ReactNode }): ReactNode {
  return (
    <button
      type="button"
      className="btn-icon"
      {...props}
      style={{
        width: 32,
        height: 32,
        display: "inline-flex",
        alignItems: "center",
        justifyContent: "center",
        border: "1px solid transparent",
        borderRadius: 6,
        background: "transparent",
        color: "#9ca3af",
        cursor: props.disabled ? "not-allowed" : "pointer",
        opacity: props.disabled ? 0.45 : 1,
        ...style,
      }}
    >
      {children}
    </button>
  );
}
