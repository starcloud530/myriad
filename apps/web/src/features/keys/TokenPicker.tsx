import { Input, Select, Typography } from "antd";
import type { ReactNode } from "react";
import { Link } from "react-router";
import { useLocale } from "../../i18n/Locale.tsx";
import { rememberSecret } from "./sessionSecrets.ts";
import { displayKey, type ProductKey } from "./types.ts";

export function TokenPicker({
  keys,
  value,
  secret,
  onChange,
  onSecret,
}: {
  keys: ProductKey[];
  value?: string;
  secret: string;
  onChange: (id: string) => void;
  onSecret?: (id: string, secret: string) => void;
}): ReactNode {
  const { copy } = useLocale();
  const selected = keys.find((row) => row.id === value);
  const missing = Boolean(selected && !selected.system && !secret);

  return (
    <div style={{ display: "grid", gap: 8 }}>
      <div style={{ display: "flex", alignItems: "center", gap: 12, flexWrap: "wrap" }}>
        <Select
          style={{ minWidth: 280 }}
          value={value}
          placeholder={copy.token.placeholder}
          options={keys
            .filter((row) => row.status === "active")
            .map((row) => ({
              value: row.id,
              label: `${row.tag} · ${displayKey(row)}`,
            }))}
          onChange={onChange}
        />
        <Link to="/keys">{copy.token.manage}</Link>
      </div>
      {missing ? (
        <div>
          <Typography.Text type="secondary">
            {copy.token.paste}
          </Typography.Text>
          <Input.Password
            style={{ marginTop: 8, maxWidth: 420 }}
            placeholder="sk-myriad-…"
            onBlur={(event) => {
              const next = event.target.value.trim();
              if (!selected || !next) {
                return;
              }
              rememberSecret(selected.id, next);
              onSecret?.(selected.id, next);
            }}
          />
        </div>
      ) : null}
    </div>
  );
}
