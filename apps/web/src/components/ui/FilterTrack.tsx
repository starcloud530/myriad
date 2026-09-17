import type { ReactNode } from "react";

export function FilterTrack<T extends string>({
  options,
  value,
  onChange,
}: {
  options: Array<{ label: string; value: T }>;
  value: T;
  onChange: (next: T) => void;
}): ReactNode {
  return (
    <div role="tablist" className="code-tabs">
      {options.map((option) => {
        const on = option.value === value;
        return (
          <button
            key={option.value}
            type="button"
            role="tab"
            aria-selected={on}
            className={on ? "code-tab is-on" : "code-tab"}
            onClick={() => {
              onChange(option.value);
            }}
          >
            {option.label}
          </button>
        );
      })}
    </div>
  );
}
