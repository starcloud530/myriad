import { Menu } from "antd";
import type { ReactNode } from "react";
import { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router";
import { isNavGroup, navItems } from "./nav.tsx";
import { textSecondary } from "../../tokens/theme.ts";

function navLabel(title: string, unwired?: boolean): ReactNode {
  if (!unwired) {
    return title;
  }
  return (
    <span style={{ color: textSecondary }}>
      {title}
      <span style={{ marginLeft: 6, fontSize: 11 }}>未接通</span>
    </span>
  );
}

export function SidebarNav({ collapsed }: { collapsed: boolean }): ReactNode {
  const location = useLocation();
  const navigate = useNavigate();

  const items = navItems.map((item) => {
    if (isNavGroup(item)) {
      return {
        key: item.key,
        icon: item.icon,
        label: item.title,
        children: item.children.map((child) => ({
          key: child.path,
          icon: child.icon,
          label: navLabel(child.title, child.unwired),
        })),
      };
    }
    return {
      key: item.path,
      icon: item.icon,
      label: navLabel(item.title, item.unwired),
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
      style={{ borderInlineEnd: "none", height: "100%" }}
    />
  );
}
