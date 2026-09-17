import { ConfigProvider, theme } from "antd";
import zhCN from "antd/locale/zh_CN";
import type { ReactNode } from "react";
import { lightToken } from "../tokens/theme.ts";

export function AppProviders({ children }: { children: ReactNode }) {
  return (
    <ConfigProvider
      locale={zhCN}
      componentSize="small"
      theme={{ algorithm: theme.defaultAlgorithm, token: lightToken }}
    >
      {children}
    </ConfigProvider>
  );
}
