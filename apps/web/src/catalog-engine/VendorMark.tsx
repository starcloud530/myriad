import type { CSSProperties, ReactNode } from "react";
import { useState } from "react";
import { useLocale } from "../i18n/Locale.tsx";
import { vendorLogoUrl } from "../lib/vendorLogos.ts";
import { vendorLabel } from "./labels.ts";
import { vendorMeta } from "./vendors.ts";

export function VendorMark({
  vendor,
  size = 28,
}: {
  vendor: string;
  size?: number;
}): ReactNode {
  const { locale } = useLocale();
  const meta = vendorMeta(vendor);
  const name = vendorLabel(vendor, locale);
  const src = vendorLogoUrl(vendor);
  const [failed, setFailed] = useState(false);

  if (src && !failed) {
    return (
      <span
        title={name}
        style={{
          width: size,
          height: size,
          borderRadius: 6,
          border: "1px solid #1f1f1f",
          background: "#111",
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
          alt={name}
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
    borderRadius: 6,
    border: "1px solid #1f1f1f",
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
    <span style={style} title={name} aria-label={name}>
      {meta.mark}
    </span>
  );
}
