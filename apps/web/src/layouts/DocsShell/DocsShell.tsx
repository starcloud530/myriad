import { Button, Layout } from "antd";
import type { CSSProperties, ReactNode } from "react";
import { Link, NavLink, Outlet, useNavigate } from "react-router";
import { brandLogoSrc } from "../../lib/publicAsset.ts";
import { docsNav } from "../../pages/docs/docsNav.ts";
import { borderColor, layoutBg, surfaceBg, textPrimary, textSecondary } from "../../tokens/theme.ts";
const { Header, Sider, Content } = Layout;

const headerStyle: CSSProperties = {
  display: "flex",
  alignItems: "center",
  gap: 12,
  height: 52,
  lineHeight: "52px",
  padding: "0 20px",
  background: surfaceBg,
  borderBottom: `1px solid ${borderColor}`,
};

export function DocsShell(): ReactNode {
  const navigate = useNavigate();

  return (
    <Layout style={{ height: "100vh", background: layoutBg }}>
      <Header style={headerStyle}>
        <Link to="/docs/quickstart" style={{ display: "flex", alignItems: "center", gap: 8, color: textPrimary, textDecoration: "none" }}>
          <img src={brandLogoSrc} alt="" width={22} height={22} />
          <span style={{ fontWeight: 650, letterSpacing: "0.04em" }}>万象</span>
          <span style={{ color: textSecondary, fontWeight: 400 }}>Docs</span>
        </Link>
        <div style={{ flex: 1 }} />
        <Button type="link" href="https://github.com/starcloud530/myriad" target="_blank" rel="noreferrer">
          GitHub
        </Button>
        <Button
          type="primary"
          onClick={() => {
            void navigate("/home");
          }}
        >
          Console
        </Button>
      </Header>
      <Layout style={{ flex: 1, minHeight: 0 }}>
        <Sider
          width={220}
          theme="light"
          style={{ background: surfaceBg, borderRight: `1px solid ${borderColor}`, overflow: "auto" }}
        >
          <nav style={{ padding: "20px 16px", display: "grid", gap: 22 }}>
            {docsNav.map((group) => (
              <div key={group.title} style={{ display: "grid", gap: 6 }}>
                <div style={{ fontSize: 11, letterSpacing: "0.08em", textTransform: "uppercase", color: textSecondary }}>
                  {group.title}
                </div>
                {group.items.map((item) => (
                  <NavLink
                    key={item.path}
                    to={item.path}
                    style={({ isActive }) => ({
                      color: isActive ? textPrimary : textSecondary,
                      fontWeight: isActive ? 600 : 400,
                      textDecoration: "none",
                      fontSize: 14,
                      padding: "5px 10px",
                      borderLeft: isActive ? "2px solid #b5442f" : "2px solid transparent",
                      marginLeft: -2,
                    })}
                  >
                    {item.title}
                  </NavLink>
                ))}
              </div>
            ))}
          </nav>
        </Sider>
        <Content style={{ overflow: "auto", background: surfaceBg }}>
          <article style={{ maxWidth: 760, margin: "0 auto", padding: "40px 32px 80px" }}>
            <Outlet />
          </article>
        </Content>
      </Layout>
    </Layout>
  );
}
