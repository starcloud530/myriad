import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { BrowserRouter } from "react-router";
import "../styles/global.css";
import { AppProviders } from "./providers.tsx";
import { AppRoutes } from "./routes.tsx";

const root = document.querySelector("#app");
if (!root) {
  throw new Error("#app missing");
}

const basename = import.meta.env.BASE_URL.replace(/\/$/, "") || undefined;

createRoot(root).render(
  <StrictMode>
    <AppProviders>
      <BrowserRouter basename={basename === "" ? undefined : basename}>
        <AppRoutes />
      </BrowserRouter>
    </AppProviders>
  </StrictMode>,
);
