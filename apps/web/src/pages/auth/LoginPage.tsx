import type { ReactNode } from "react";
import { useState } from "react";
import { Navigate, useSearchParams } from "react-router";
import { BrandMark } from "../../components/brand/BrandMark.tsx";
import { GhostButton } from "../../components/ui/GhostButton.tsx";
import { SolidButton } from "../../components/ui/SolidButton.tsx";
import { useAuth } from "../../features/auth/Auth.tsx";
import { useLocale } from "../../i18n/Locale.tsx";
import { createDevSession } from "../../lib/api.ts";
import { textSecondary } from "../../tokens/theme.ts";
import "./login.css";

function safeNext(value: string | null): string {
  if (!value || !value.startsWith("/") || value.startsWith("//")) {
    return "/home";
  }
  return value;
}

export function LoginPage(): ReactNode {
  const { locale, copy } = useLocale();
  const { me, reload } = useAuth();
  const [params] = useSearchParams();
  const next = safeNext(params.get("next"));
  const [error, setError] = useState("");
  const [pending, setPending] = useState(false);
  const a = copy.auth;

  if (me) {
    return <Navigate to={next} replace />;
  }

  return (
    <div className="login-page">
      <div className="login-card">
        <BrandMark size={36} />
        <h1>{a.title}</h1>
        <p style={{ color: textSecondary }}>{a.intro}</p>
        <SolidButton
          onClick={() => {
            window.location.assign(`/v1/auth/google/start?next=${encodeURIComponent(next)}`);
          }}
        >
          {a.google}
        </SolidButton>
        <GhostButton
          onClick={() => {
            window.location.assign(`/v1/auth/github/start?next=${encodeURIComponent(next)}`);
          }}
        >
          {a.github}
        </GhostButton>
        {import.meta.env.DEV ? (
          <GhostButton
            disabled={pending}
            onClick={() => {
              setPending(true);
              setError("");
              void createDevSession()
                .then(() => reload())
                .catch((caught: unknown) => {
                  setError(caught instanceof Error ? caught.message : String(caught));
                })
                .finally(() => {
                  setPending(false);
                });
            }}
          >
            {a.dev}
          </GhostButton>
        ) : null}
        {error ? <p className="login-error">{error}</p> : null}
        <p className="login-foot">{locale === "zh" ? "文档仍可未登录阅读。" : "Docs stay public."}</p>
      </div>
    </div>
  );
}
