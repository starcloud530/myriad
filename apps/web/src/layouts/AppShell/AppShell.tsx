import { MenuFoldOutlined, MenuUnfoldOutlined } from "@ant-design/icons";
import { Layout } from "antd";
import type { CSSProperties, ReactNode } from "react";
import { useEffect, useState } from "react";
import { Outlet, useLocation, useNavigate } from "react-router";
import { BrandMark } from "../../components/brand/BrandMark.tsx";
import { useAuth } from "../../features/auth/Auth.tsx";
import { GhostButton } from "../../components/ui/GhostButton.tsx";
import { IconButton } from "../../components/ui/IconButton.tsx";
import { LangSwitch } from "../../i18n/LangSwitch.tsx";
import { useLocale } from "../../i18n/Locale.tsx";
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
  const { copy } = useLocale();
  const { me, logout } = useAuth();

  return (
    <Header style={headerStyle}>
      <IconButton aria-label={collapsed ? "Expand menu" : "Collapse menu"} onClick={onToggle}>
        {collapsed ? <MenuUnfoldOutlined /> : <MenuFoldOutlined />}
      </IconButton>
      <BrandMark size={26} />
      <span style={{ fontWeight: 600, color: textPrimary, letterSpacing: "0.04em", fontSize: 15 }}>{copy.brand}</span>
      <span style={{ color: textSecondary, fontSize: 12 }}>{copy.console}</span>
      <div style={{ flex: 1 }} />
      <LangSwitch />
      {me ? (
        <span style={{ color: textSecondary, fontSize: 12, maxWidth: 160, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
          {me.user.display_name || me.user.email}
        </span>
      ) : null}
      <GhostButton
        onClick={() => {
          void navigate(docsPath);
        }}
      >
        {copy.docs}
      </GhostButton>
      {me ? (
        <GhostButton
          onClick={() => {
            void logout().then(() => {
              void navigate("/login");
            });
          }}
        >
          {copy.auth.logout}
        </GhostButton>
      ) : null}
    </Header>
  );
}

export function AppShell(): ReactNode {
  const [collapsed, setCollapsed] = useState(false);
  const location = useLocation();
  const { copy } = useLocale();
  const playHome = location.pathname === "/playground";

  useEffect(() => {
    document.title = copy.brand;
  }, [copy.brand]);

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
          <div
            style={{
              flex: 1,
              overflow: playHome ? "hidden" : "auto",
              padding: playHome ? 0 : "32px 36px 64px",
            }}
          >
            <Outlet />
          </div>
        </Content>
      </Layout>
    </Layout>
  );
}
