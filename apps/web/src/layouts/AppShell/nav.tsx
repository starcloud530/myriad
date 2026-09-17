import {
  ApiOutlined,
  AppstoreOutlined,
  BarChartOutlined,
  ControlOutlined,
  ExperimentOutlined,
  HomeOutlined,
  PayCircleOutlined,
  SettingOutlined,
  ToolOutlined,
} from "@ant-design/icons";
import type { ReactNode } from "react";

export interface NavLeaf {
  path: string;
  title: string;
  icon: ReactNode;
  unwired?: boolean;
}

export interface NavGroup {
  key: string;
  title: string;
  icon: ReactNode;
  children: NavLeaf[];
}

export type NavItem = NavLeaf | NavGroup;

export function isNavGroup(item: NavItem): item is NavGroup {
  return "children" in item;
}

export const navItems: NavItem[] = [
  { path: "/home", title: "首页", icon: <HomeOutlined /> },
  { path: "/keys", title: "API Keys", icon: <ApiOutlined /> },
  { path: "/playground", title: "模型广场", icon: <ExperimentOutlined /> },
  { path: "/usage", title: "用量分析", icon: <BarChartOutlined />, unwired: true },
  { path: "/billing", title: "账单", icon: <PayCircleOutlined />, unwired: true },
  {
    key: "developer",
    title: "开发者模式",
    icon: <ControlOutlined />,
    children: [
      { path: "/dev/channels", title: "渠道管理", icon: <AppstoreOutlined />, unwired: true },
      { path: "/dev/pricing", title: "计费规则", icon: <SettingOutlined />, unwired: true },
      { path: "/dev/ops", title: "运维", icon: <ToolOutlined />, unwired: true },
    ],
  },
];

export const docsPath = "/docs";
