import type { ReactNode } from "react";

export function CodeTabs({
  tabs,
  value,
  onChange,
}: {
  tabs: Array<{ label: string; value: string }>;
  value: string;
  onChange: (next: string) => void;
}): ReactNode {
  return (
    <div role="tablist" className="code-tabs">
      {tabs.map((tab) => {
        const on = tab.value === value;
        return (
          <button
            key={tab.value}
            type="button"
            role="tab"
            aria-selected={on}
            className={on ? "code-tab is-on" : "code-tab"}
            onClick={() => {
              onChange(tab.value);
            }}
          >
            {tab.label}
          </button>
        );
      })}
    </div>
  );
}
