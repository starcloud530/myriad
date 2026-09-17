import type { ReactNode } from "react";
import { Navigate, Route, Routes } from "react-router";
import { AppShell } from "../layouts/AppShell/AppShell.tsx";
import { BillingPage } from "../pages/billing/BillingPage.tsx";
import { ChannelsPage } from "../pages/dev/ChannelsPage.tsx";
import { OpsPage } from "../pages/dev/OpsPage.tsx";
import { PricingRulesPage } from "../pages/dev/PricingRulesPage.tsx";
import { DocsPage } from "../pages/docs/DocsPage.tsx";
import { HomePage } from "../pages/home/HomePage.tsx";
import { KeysPage } from "../pages/keys/KeysPage.tsx";
import { PlaygroundDetailPage } from "../pages/playground/PlaygroundDetailPage.tsx";
import { PlaygroundPage } from "../pages/playground/PlaygroundPage.tsx";
import { UsagePage } from "../pages/usage/UsagePage.tsx";

export function AppRoutes(): ReactNode {
  return (
    <Routes>
      <Route element={<AppShell />}>
        <Route path="/" element={<Navigate to="/home" replace />} />
        <Route path="/home" element={<HomePage />} />
        <Route path="/keys" element={<KeysPage />} />
        <Route path="/playground" element={<PlaygroundPage />} />
        <Route path="/playground/:vendor/:id" element={<PlaygroundDetailPage />} />
        <Route path="/usage" element={<UsagePage />} />
        <Route path="/billing" element={<BillingPage />} />
        <Route path="/docs" element={<DocsPage />} />
        <Route path="/dev/channels" element={<ChannelsPage />} />
        <Route path="/dev/pricing" element={<PricingRulesPage />} />
        <Route path="/dev/ops" element={<OpsPage />} />
        <Route path="*" element={<Navigate to="/home" replace />} />
      </Route>
    </Routes>
  );
}
