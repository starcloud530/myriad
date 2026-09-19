import type { ReactNode } from "react";
import { Navigate, Route, Routes } from "react-router";
import { RequireAdmin, RequireAuth } from "../features/auth/Auth.tsx";
import { AppShell } from "../layouts/AppShell/AppShell.tsx";
import { LoginPage } from "../pages/auth/LoginPage.tsx";
import { DocsShell } from "../layouts/DocsShell/DocsShell.tsx";
import { BillingPage } from "../pages/billing/BillingPage.tsx";
import { ChannelsPage } from "../pages/dev/ChannelsPage.tsx";
import { OpsPage } from "../pages/dev/OpsPage.tsx";
import { PricingRulesPage } from "../pages/dev/PricingRulesPage.tsx";
import { ApiPage } from "../pages/docs/ApiPage.tsx";
import { DocsIndexRedirect, DocsLegacyRedirect, DocsLocaleGate } from "../pages/docs/DocsLocale.tsx";
import { ErrorsPage } from "../pages/docs/ErrorsPage.tsx";
import { KeysGuidePage } from "../pages/docs/KeysGuidePage.tsx";
import { QuickstartPage } from "../pages/docs/QuickstartPage.tsx";
import { SdkPage } from "../pages/docs/SdkPage.tsx";
import { HomePage } from "../pages/home/HomePage.tsx";
import { KeysPage } from "../pages/keys/KeysPage.tsx";
import { PlaygroundDetailPage } from "../pages/playground/PlaygroundDetailPage.tsx";
import { PlaygroundPage } from "../pages/playground/PlaygroundPage.tsx";
import { UsagePage } from "../pages/usage/UsagePage.tsx";

const landing = import.meta.env.PROD ? "/docs" : "/home";

export function AppRoutes(): ReactNode {
  return (
    <Routes>
      <Route path="/" element={<Navigate to={landing} replace />} />
      <Route path="/docs" element={<DocsIndexRedirect />} />
      <Route path="/docs/quickstart" element={<DocsLegacyRedirect slug="quickstart" />} />
      <Route path="/docs/api" element={<DocsLegacyRedirect slug="api" />} />
      <Route path="/docs/sdk" element={<DocsLegacyRedirect slug="sdk" />} />
      <Route path="/docs/keys" element={<DocsLegacyRedirect slug="keys" />} />
      <Route path="/docs/errors" element={<DocsLegacyRedirect slug="errors" />} />
      <Route
        path="/docs/:lang"
        element={
          <DocsLocaleGate>
            <DocsShell />
          </DocsLocaleGate>
        }
      >
        <Route index element={<Navigate to="quickstart" replace />} />
        <Route path="quickstart" element={<QuickstartPage />} />
        <Route path="api" element={<ApiPage />} />
        <Route path="sdk" element={<SdkPage />} />
        <Route path="keys" element={<KeysGuidePage />} />
        <Route path="errors" element={<ErrorsPage />} />
        <Route path="*" element={<Navigate to="quickstart" replace />} />
      </Route>
      <Route path="/login" element={<LoginPage />} />
      <Route
        element={
          <RequireAuth>
            <AppShell />
          </RequireAuth>
        }
      >
        <Route path="/home" element={<HomePage />} />
        <Route path="/keys" element={<KeysPage />} />
        <Route path="/playground" element={<PlaygroundPage />} />
        <Route path="/playground/:vendor/:id" element={<PlaygroundDetailPage />} />
        <Route path="/playground/:vendor/:id/try" element={<PlaygroundDetailPage />} />
        <Route path="/usage" element={<UsagePage />} />
        <Route path="/billing" element={<BillingPage />} />
        <Route
          path="/dev/channels"
          element={
            <RequireAdmin>
              <ChannelsPage />
            </RequireAdmin>
          }
        />
        <Route
          path="/dev/pricing"
          element={
            <RequireAdmin>
              <PricingRulesPage />
            </RequireAdmin>
          }
        />
        <Route
          path="/dev/ops"
          element={
            <RequireAdmin>
              <OpsPage />
            </RequireAdmin>
          }
        />
        <Route path="*" element={<Navigate to="/home" replace />} />
      </Route>
    </Routes>
  );
}
