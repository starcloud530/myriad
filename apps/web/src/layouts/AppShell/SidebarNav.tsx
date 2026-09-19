import { Menu } from "antd";
import type { ReactNode } from "react";
import { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router";
import { useAuth } from "../../features/auth/Auth.tsx";
import { isConsoleAdmin } from "../../features/auth/admin.ts";
import { useLocale } from "../../i18n/Locale.tsx";
import { isNavGroup, navItems } from "./nav.tsx";

export function SidebarNav({ collapsed }: { collapsed: boolean }): ReactNode {
  const location = useLocation();
  const navigate = useNavigate();
  const { copy } = useLocale();
  const { me } = useAuth();

  const items = navItems(copy, isConsoleAdmin(me)).map((item) => {
    if (isNavGroup(item)) {
      return {
        key: item.key,
        icon: item.icon,
        label: item.title,
        children: item.children.map((child) => ({
          key: child.path,
          icon: child.icon,
          label: child.title,
        })),
      };
    }
    return {
      key: item.path,
      icon: item.icon,
      label: item.badge === "ai" ? (
        <span className="nav-label-row">
          {item.title}
          <span className="nav-ai-tag">AI</span>
        </span>
      ) : (
        item.title
      ),
    };
  });

  const [openKeys, setOpenKeys] = useState<string[]>(
    location.pathname.startsWith("/dev/") ? ["developer"] : [],
  );

  useEffect(() => {
    if (location.pathname.startsWith("/dev/")) {
      setOpenKeys((keys) => (keys.includes("developer") ? keys : [...keys, "developer"]));
    }
  }, [location.pathname]);

  return (
    <Menu
      mode="inline"
      selectedKeys={[location.pathname.startsWith("/playground") ? "/playground" : location.pathname]}
      inlineCollapsed={collapsed}
      {...(collapsed
        ? {}
        : {
            openKeys,
            onOpenChange: setOpenKeys,
          })}
      items={items}
      onClick={({ key }) => {
        if (key === "developer") {
          return;
        }
        void navigate(key);
      }}
      style={{ borderInlineEnd: "none", height: "100%", paddingTop: 12 }}
    />
  );
}
