import { Empty } from "antd";
import type { ReactNode } from "react";
import { useParams } from "react-router";
import { getModel, ModelDetail } from "../../catalog-engine/index.ts";

export function PlaygroundDetailPage(): ReactNode {
  const params = useParams();
  const vendor = params.vendor ? decodeURIComponent(params.vendor) : "";
  const id = params.id ? decodeURIComponent(params.id) : "";
  const model = vendor && id ? getModel(vendor, id) : undefined;
  if (!model) {
    return <Empty description="货架里没有这个型号" />;
  }
  return <ModelDetail model={model} />;
}
