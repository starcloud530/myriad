import { Button, Layout } from "antd";
import type { CSSProperties, ReactNode } from "react";
import { Link, NavLink, Outlet, useNavigate } from "react-router";
import { brandLogoSrc } from "../../lib/publicAsset.ts";
import { useDocsLocale, useSwitchDocsLocale } from "../../pages/docs/DocsLocale.tsx";
import { docsNav } from "../../pages/docs/docsNav.ts";
import { docsHref, type DocsLocale } from "../../pages/docs/locale.ts";
import { borderColor, layoutBg, surfaceBg, textPrimary, textSecondary } from "../../tokens/theme.ts";

const { Header, Sider, Content } = Layout;

const headerStyle: CSSProperties = {
  display: "flex",
  alignItems: "center",
  gap: 12,
  height: 60,
  lineHeight: "60px",
  padding: "0 22px",
  background: surfaceBg,
  borderBottom: `1px solid ${borderColor}`,
};

function LangSwitch(): ReactNode {
  const locale = useDocsLocale();
  const switchLocale = useSwitchDocsLocale();
  const option = (id: DocsLocale, label: string): ReactNode => (
    <button
      type="button"
      onClick={() => {
        switchLocale(id);
      }}
      style={{
        border: "none",
        background: "none",
        padding: 0,
        cursor: "pointer",
        fontSize: 13,
        fontWeight: locale === id ? 650 : 400,
        color: locale === id ? textPrimary : textSecondary,
      }}
    >
      {label}
    </button>
  );
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
      {option("zh", "中文")}
      <span style={{ color: textSecondary }}>/</span>
      {option("en", "EN")}
    </div>
  );
}

export function DocsShell(): ReactNode {
  const navigate = useNavigate();
  const locale = useDocsLocale();
  const chrome = locale === "zh" ? { console: "控制台", docs: "文档" } : { console: "Console", docs: "Docs" };

  return (
    <Layout style={{ height: "100vh", background: layoutBg }}>
      <Header style={headerStyle}>
        <Link
          to={docsHref(locale, "quickstart")}
          style={{ display: "flex", alignItems: "center", gap: 8, color: textPrimary, textDecoration: "none" }}
        >
          <img src={brandLogoSrc} alt="" width={22} height={22} />
          <span style={{ fontWeight: 650, letterSpacing: "0.04em" }}>{locale === "zh" ? "万象" : "Myriad"}</span>
          <span style={{ color: textSecondary, fontWeight: 400 }}>{chrome.docs}</span>
        </Link>
        <div style={{ flex: 1 }} />
        <LangSwitch />
        <Button type="link" href="https://github.com/starcloud530/myriad" target="_blank" rel="noreferrer">
          GitHub
        </Button>
        <Button
          type="primary"
          onClick={() => {
            void navigate("/home");
          }}
        >
          {chrome.console}
        </Button>
      </Header>
      <Layout style={{ flex: 1, minHeight: 0 }}>
        <Sider
          width={220}
          theme="dark"
          style={{ background: surfaceBg, borderRight: `1px solid ${borderColor}`, overflow: "auto" }}
        >
          <nav style={{ padding: "20px 16px", display: "grid", gap: 22 }}>
            {docsNav(locale).map((group) => (
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
                      borderLeft: isActive ? "2px solid #ff4d3a" : "2px solid transparent",
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
