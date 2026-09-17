import type { InputHTMLAttributes, ReactNode } from "react";

export function SearchField({
  className,
  style,
  ...props
}: InputHTMLAttributes<HTMLInputElement>): ReactNode {
  return (
    <input
      type="search"
      className={className ? `search-field ${className}` : "search-field"}
      {...props}
      style={{
        height: 32,
        width: 280,
        maxWidth: "100%",
        padding: "0 10px",
        border: "1px solid #1f1f1f",
        borderRadius: 6,
        background: "#000",
        color: "#fff",
        fontSize: 13,
        fontFamily: "inherit",
        outline: "none",
        ...style,
      }}
    />
  );
}
