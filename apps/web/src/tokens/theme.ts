import type { ThemeConfig } from "antd";

/**
 * OpenRouter 路线：纯黑画布 + 白字 + 灰阶。
 * OneAPI / NewAPI 的浅蓝后台不要。朱砂只作 1px 提示，不当大面积填充。
 */
export const appToken: NonNullable<ThemeConfig["token"]> = {
  colorBgBase: "#000000",
  colorBgLayout: "#000000",
  colorBgContainer: "#111111",
  colorBgElevated: "#1a1a1a",
  colorText: "#ffffff",
  colorTextSecondary: "#9ca3af",
  colorBorder: "#2a2a2a",
  colorBorderSecondary: "#1f1f1f",
  colorPrimary: "#ffffff",
  colorInfo: "#ffffff",
  colorError: "#f87171",
  colorSuccess: "#4ade80",
  colorLink: "#d4d4d4",
  colorFillSecondary: "#1a1a1a",
  colorFillTertiary: "#141414",
  borderRadius: 8,
  fontFamily: '"Inter", "SF Pro Text", "PingFang SC", "Segoe UI", sans-serif',
  motionDurationMid: "0.14s",
};

export const layoutBg = "#000000";
export const surfaceBg = "#111111";
export const elevatedBg = "#1a1a1a";
export const textPrimary = "#ffffff";
export const textSecondary = "#9ca3af";
export const textBody = "#d4d4d4";
export const textFaint = "#6b7280";
export const borderColor = "#2a2a2a";
export const accentColor = "#ffffff";
export const sparkColor = "#ff4d3a";
export const errorColor = "#f87171";
export const codeBg = "#080808";
export const codeFg = "#ededed";
export const liveColor = "#4ade80";
export const downColor = "#f87171";
export const pageMaxWidth = 1180;
export const cardShadow = "none";
export const paperRadius = 8;
export const liveWash = "transparent";
export const downWash = "transparent";
export const accentWash = "rgba(255,255,255,0.06)";
