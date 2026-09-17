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
  { path: "/home", title: "模型", icon: <HomeOutlined /> },
  { path: "/keys", title: "密钥", icon: <ApiOutlined /> },
  { path: "/playground", title: "试用", icon: <ExperimentOutlined /> },
  { path: "/usage", title: "用量", icon: <BarChartOutlined /> },
  { path: "/billing", title: "账单", icon: <PayCircleOutlined /> },
  {
    key: "developer",
    title: "管理",
    icon: <ControlOutlined />,
    children: [
      { path: "/dev/channels", title: "渠道", icon: <AppstoreOutlined /> },
      { path: "/dev/pricing", title: "计费", icon: <SettingOutlined /> },
      { path: "/dev/ops", title: "运维", icon: <ToolOutlined /> },
    ],
  },
];

export const docsPath = "/docs";
