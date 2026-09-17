import { Empty } from "antd";
import type { ReactNode } from "react";
import { useParams } from "react-router";
import { PageFrame } from "../../components/biz/PageFrame.tsx";
import { getModel, ModelDetail } from "../../catalog-engine/index.ts";

export function PlaygroundDetailPage(): ReactNode {
  const params = useParams();
  const vendor = params.vendor ? decodeURIComponent(params.vendor) : "";
  const id = params.id ? decodeURIComponent(params.id) : "";
  const model = vendor && id ? getModel(vendor, id) : undefined;
  if (!model) {
    return (
      <PageFrame>
        <Empty description="没有找到这个模型" />
      </PageFrame>
    );
  }
  return <ModelDetail model={model} />;
}
