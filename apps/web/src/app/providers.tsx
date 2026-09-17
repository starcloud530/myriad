import { ConfigProvider, theme } from "antd";
import enUS from "antd/locale/en_US";
import zhCN from "antd/locale/zh_CN";
import type { ReactNode } from "react";
import { LocaleProvider, useLocale } from "../i18n/Locale.tsx";
import { appToken } from "../tokens/theme.ts";

function Themed({ children }: { children: ReactNode }): ReactNode {
  const { locale } = useLocale();
  return (
    <ConfigProvider
      locale={locale === "zh" ? zhCN : enUS}
      componentSize="middle"
      theme={{ algorithm: theme.darkAlgorithm, token: appToken }}
    >
      {children}
    </ConfigProvider>
  );
}

export function AppProviders({ children }: { children: ReactNode }) {
  return (
    <LocaleProvider>
      <Themed>{children}</Themed>
    </LocaleProvider>
  );
}
