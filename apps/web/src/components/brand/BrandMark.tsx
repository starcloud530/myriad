import type { ReactNode } from "react";
import { brandLogoDarkSrc } from "../../lib/publicAsset.ts";

export function BrandMark({ size = 26 }: { size?: number }): ReactNode {
  return (
    <img
      src={brandLogoDarkSrc}
      alt=""
      width={size}
      height={size}
      style={{ display: "block", borderRadius: Math.round(size * 0.2) }}
    />
  );
}
