import { MenuFoldOutlined, MenuUnfoldOutlined, UserOutlined } from "@ant-design/icons";
import { Button, Dropdown, Layout, Tag } from "antd";
import type { CSSProperties, ReactNode } from "react";
import { useState } from "react";
import { Outlet, useNavigate } from "react-router";
import { vendorLogoUrl } from "../../lib/vendorLogos.ts";
import { borderColor, layoutBg, surfaceBg, textPrimary } from "../../tokens/theme.ts";
import { SidebarNav } from "./SidebarNav.tsx";
import { docsPath } from "./nav.tsx";

const myriadMark = vendorLogoUrl("myriad");

const { Header, Sider, Content } = Layout;

const headerStyle: CSSProperties = {
  display: "flex",
  alignItems: "center",
  gap: 12,
  height: 48,
  lineHeight: "48px",
  padding: "0 16px",
  overflow: "visible",
  background: surfaceBg,
  borderBottom: `1px solid ${borderColor}`,
};

function HeaderBar({
  collapsed,
  onToggle,
}: {
  collapsed: boolean;
  onToggle: () => void;
}): ReactNode {
  const navigate = useNavigate();

  return (
    <Header style={headerStyle}>
      <Button
        type="text"
        icon={collapsed ? <MenuUnfoldOutlined /> : <MenuFoldOutlined />}
        onClick={onToggle}
      />
      {myriadMark ? (
        <img src={myriadMark} alt="" width={22} height={22} style={{ display: "block" }} />
      ) : null}
      <span style={{ fontWeight: 650, color: textPrimary, whiteSpace: "nowrap", letterSpacing: "0.04em" }}>万象</span>
      <div style={{ flex: 1 }} />
      <Tag bordered={false}>开发环境</Tag>
      <Button
        type="link"
        onClick={() => {
          void navigate(docsPath);
        }}
      >
        文档
      </Button>
      <Dropdown menu={{ items: [{ key: "env", label: "本地 Worker", disabled: true }] }}>
        <Button type="text" icon={<UserOutlined />} />
      </Dropdown>
    </Header>
  );
}

export function AppShell(): ReactNode {
  const [collapsed, setCollapsed] = useState(false);

  return (
    <Layout style={{ height: "100vh" }}>
      <HeaderBar collapsed={collapsed} onToggle={() => setCollapsed((value) => !value)} />
      <Layout style={{ flex: 1, minHeight: 0 }}>
        <Sider
          theme="light"
          collapsible
          collapsed={collapsed}
          trigger={null}
          width={200}
          collapsedWidth={64}
          style={{ background: surfaceBg, borderRight: `1px solid ${borderColor}` }}
        >
          <SidebarNav collapsed={collapsed} />
        </Sider>
        <Content
          style={{
            display: "flex",
            flexDirection: "column",
            overflow: "hidden",
            background: layoutBg,
          }}
        >
          <div style={{ flex: 1, overflow: "auto", padding: "16px 20px 28px" }}>
            <Outlet />
          </div>
        </Content>
      </Layout>
    </Layout>
  );
}
