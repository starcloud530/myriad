import { MenuFoldOutlined, MenuUnfoldOutlined } from "@ant-design/icons";
import { Button, Layout } from "antd";
import type { CSSProperties, ReactNode } from "react";
import { useEffect, useState } from "react";
import { Outlet, useNavigate } from "react-router";
import { brandLogoSrc } from "../../lib/publicAsset.ts";
import { borderColor, layoutBg, surfaceBg, textPrimary, textSecondary } from "../../tokens/theme.ts";
import { SidebarNav } from "./SidebarNav.tsx";
import { docsPath } from "./nav.tsx";

const { Header, Sider, Content } = Layout;

const headerStyle: CSSProperties = {
  display: "flex",
  alignItems: "center",
  gap: 12,
  height: 60,
  lineHeight: "60px",
  padding: "0 22px",
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
      <img src={brandLogoSrc} alt="" width={26} height={26} style={{ display: "block" }} />
      <span style={{ fontWeight: 680, color: textPrimary, letterSpacing: "0.06em", fontSize: 16 }}>万象</span>
      <span style={{ color: textSecondary, fontSize: 13 }}>控制台</span>
      <div style={{ flex: 1 }} />
      <Button
        onClick={() => {
          void navigate(docsPath);
        }}
      >
        文档
      </Button>
    </Header>
  );
}

export function AppShell(): ReactNode {
  const [collapsed, setCollapsed] = useState(false);

  useEffect(() => {
    document.title = "万象";
  }, []);

  return (
    <Layout style={{ height: "100vh" }}>
      <HeaderBar collapsed={collapsed} onToggle={() => setCollapsed((value) => !value)} />
      <Layout style={{ flex: 1, minHeight: 0 }}>
        <Sider
          theme="dark"
          collapsible
          collapsed={collapsed}
          trigger={null}
          width={220}
          collapsedWidth={68}
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
          <div style={{ flex: 1, overflow: "auto", padding: "32px 36px 64px" }}>
            <Outlet />
          </div>
        </Content>
      </Layout>
    </Layout>
  );
}
