import {
  ApiOutlined,
  AppstoreOutlined,
  BarChartOutlined,
  ControlOutlined,
  HomeOutlined,
  PayCircleOutlined,
  RobotOutlined,
  SettingOutlined,
  ToolOutlined,
} from "@ant-design/icons";
import type { ReactNode } from "react";
import type { Messages } from "../../i18n/messages.ts";

export interface NavLeaf {
  path: string;
  title: string;
  icon: ReactNode;
  badge?: "ai";
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

export function navItems(copy: Messages, admin = false): NavItem[] {
  const items: NavItem[] = [
    { path: "/playground", title: copy.nav.playground, icon: <RobotOutlined />, badge: "ai" },
    { path: "/home", title: copy.nav.models, icon: <HomeOutlined /> },
    { path: "/keys", title: copy.nav.keys, icon: <ApiOutlined /> },
    { path: "/usage", title: copy.nav.usage, icon: <BarChartOutlined /> },
    { path: "/billing", title: copy.nav.billing, icon: <PayCircleOutlined /> },
  ];
  if (admin) {
    items.push({
      key: "developer",
      title: copy.nav.admin,
      icon: <ControlOutlined />,
      children: [
        { path: "/dev/channels", title: copy.nav.channels, icon: <AppstoreOutlined /> },
        { path: "/dev/pricing", title: copy.nav.pricing, icon: <SettingOutlined /> },
        { path: "/dev/ops", title: copy.nav.ops, icon: <ToolOutlined /> },
      ],
    });
  }
  return items;
}

export const docsPath = "/docs";
