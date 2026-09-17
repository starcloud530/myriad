import type { CSSProperties, ReactNode } from "react";
import { useState } from "react";
import { vendorLogoUrl } from "../lib/vendorLogos.ts";
import { vendorMeta } from "./vendors.ts";

export function VendorMark({
  vendor,
  size = 28,
}: {
  vendor: string;
  size?: number;
}): ReactNode {
  const meta = vendorMeta(vendor);
  const src = vendorLogoUrl(vendor);
  const [failed, setFailed] = useState(false);

  if (src && !failed) {
    return (
      <span
        title={meta.name}
        style={{
          width: size,
          height: size,
          borderRadius: Math.max(6, Math.round(size / 5)),
          background: "#F5F7FB",
          display: "inline-flex",
          alignItems: "center",
          justifyContent: "center",
          overflow: "hidden",
          flex: "0 0 auto",
          userSelect: "none",
        }}
      >
        <img
          src={src}
          alt={meta.name}
          width={size}
          height={size}
          style={{
            width: size - 4,
            height: size - 4,
            objectFit: "contain",
            display: "block",
          }}
          onError={() => {
            setFailed(true);
          }}
        />
      </span>
    );
  }

  const style: CSSProperties = {
    width: size,
    height: size,
    borderRadius: Math.max(6, Math.round(size / 5)),
    background: meta.bg,
    color: meta.fg,
    display: "inline-flex",
    alignItems: "center",
    justifyContent: "center",
    fontSize: size < 28 ? 10 : 12,
    fontWeight: 700,
    letterSpacing: size > 32 ? 0.2 : 0,
    flex: "0 0 auto",
    userSelect: "none",
  };
  return (
    <span style={style} title={meta.name} aria-label={meta.name}>
      {meta.mark}
    </span>
  );
}
