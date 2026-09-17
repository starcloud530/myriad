import { Empty } from "antd";
import type { ReactNode } from "react";
import { useParams } from "react-router";
import { PageFrame } from "../../components/biz/PageFrame.tsx";
import { getModel, ModelDetail } from "../../catalog-engine/index.ts";
import { useLocale } from "../../i18n/Locale.tsx";

export function PlaygroundDetailPage(): ReactNode {
  const { copy } = useLocale();
  const params = useParams();
  const vendor = params.vendor ? decodeURIComponent(params.vendor) : "";
  const id = params.id ? decodeURIComponent(params.id) : "";
  const model = vendor && id ? getModel(vendor, id) : undefined;
  if (!model) {
    return (
      <PageFrame>
        <Empty description={copy.play.missing} />
      </PageFrame>
    );
  }
  return <ModelDetail model={model} />;
}
