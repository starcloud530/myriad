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

createRoot(root).render(
  <StrictMode>
    <AppProviders>
      <BrowserRouter>
        <AppRoutes />
      </BrowserRouter>
    </AppProviders>
  </StrictMode>,
);
