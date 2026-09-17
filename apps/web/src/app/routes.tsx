import type { ReactNode } from "react";
import { Navigate, Route, Routes } from "react-router";
import { AppShell } from "../layouts/AppShell/AppShell.tsx";
import { DocsShell } from "../layouts/DocsShell/DocsShell.tsx";
import { BillingPage } from "../pages/billing/BillingPage.tsx";
import { ChannelsPage } from "../pages/dev/ChannelsPage.tsx";
import { OpsPage } from "../pages/dev/OpsPage.tsx";
import { PricingRulesPage } from "../pages/dev/PricingRulesPage.tsx";
import { ApiPage } from "../pages/docs/ApiPage.tsx";
import { ErrorsPage } from "../pages/docs/ErrorsPage.tsx";
import { KeysGuidePage } from "../pages/docs/KeysGuidePage.tsx";
import { QuickstartPage } from "../pages/docs/QuickstartPage.tsx";
import { SdkPage } from "../pages/docs/SdkPage.tsx";
import { HomePage } from "../pages/home/HomePage.tsx";
import { KeysPage } from "../pages/keys/KeysPage.tsx";
import { PlaygroundDetailPage } from "../pages/playground/PlaygroundDetailPage.tsx";
import { PlaygroundPage } from "../pages/playground/PlaygroundPage.tsx";
import { UsagePage } from "../pages/usage/UsagePage.tsx";

const landing = import.meta.env.PROD ? "/docs/quickstart" : "/home";

export function AppRoutes(): ReactNode {
  return (
    <Routes>
      <Route path="/" element={<Navigate to={landing} replace />} />
      <Route element={<DocsShell />}>
        <Route path="/docs" element={<Navigate to="/docs/quickstart" replace />} />
        <Route path="/docs/quickstart" element={<QuickstartPage />} />
        <Route path="/docs/api" element={<ApiPage />} />
        <Route path="/docs/sdk" element={<SdkPage />} />
        <Route path="/docs/keys" element={<KeysGuidePage />} />
        <Route path="/docs/errors" element={<ErrorsPage />} />
        <Route path="/docs/*" element={<Navigate to="/docs/quickstart" replace />} />
      </Route>
      <Route element={<AppShell />}>
        <Route path="/home" element={<HomePage />} />
        <Route path="/keys" element={<KeysPage />} />
        <Route path="/playground" element={<PlaygroundPage />} />
        <Route path="/playground/:vendor/:id" element={<PlaygroundDetailPage />} />
        <Route path="/usage" element={<UsagePage />} />
        <Route path="/billing" element={<BillingPage />} />
        <Route path="/dev/channels" element={<ChannelsPage />} />
        <Route path="/dev/pricing" element={<PricingRulesPage />} />
        <Route path="/dev/ops" element={<OpsPage />} />
        <Route path="*" element={<Navigate to="/home" replace />} />
      </Route>
    </Routes>
  );
}
