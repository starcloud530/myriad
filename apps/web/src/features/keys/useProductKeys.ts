import { useCallback, useEffect, useMemo, useState } from "react";
import { listKeys } from "../../lib/api.ts";
import { getDevApiKey } from "../../lib/devKey.ts";
import { readActiveKeyId, rememberSecret, secretOf, writeActiveKeyId } from "./sessionSecrets.ts";
import type { ProductKey } from "./types.ts";

export function useProductKeys(): {
  keys: ProductKey[];
  loading: boolean;
  error: string;
  selectedId: string;
  selected: ProductKey | undefined;
  secret: string;
  setSelectedId: (id: string) => void;
  remember: (key: ProductKey) => void;
  captureSecret: (id: string, value: string) => void;
  reload: () => Promise<void>;
} {
  const bootstrap = getDevApiKey();
  const [keys, setKeys] = useState<ProductKey[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [selectedId, setSelectedIdState] = useState(readActiveKeyId);
  const [secretTick, setSecretTick] = useState(0);

  const reload = useCallback(async () => {
    setLoading(true);
    try {
      const body = await listKeys(bootstrap);
      setKeys(body.keys);
      setError("");
    } catch (caught: unknown) {
      setKeys([]);
      setError(caught instanceof Error ? caught.message : String(caught));
    } finally {
      setLoading(false);
    }
  }, [bootstrap]);

  useEffect(() => {
    void reload();
  }, [reload]);

  const setSelectedId = (id: string): void => {
    setSelectedIdState(id);
    writeActiveKeyId(id);
  };

  const selected = useMemo(
    () => keys.find((row) => row.id === selectedId) ?? keys[0],
    [keys, selectedId],
  );

  const secret = selected
    ? (secretOf(selected.id, selected.system ? bootstrap : selected.secret) ?? "")
    : bootstrap;
  void secretTick;

  const remember = (key: ProductKey): void => {
    if (key.secret) {
      rememberSecret(key.id, key.secret);
      setSecretTick((value) => value + 1);
    }
    setSelectedId(key.id);
    void reload();
  };

  const captureSecret = (id: string, value: string): void => {
    rememberSecret(id, value);
    setSecretTick((current) => current + 1);
  };

  return {
    keys,
    loading,
    error,
    selectedId: selected?.id ?? selectedId,
    selected,
    secret,
    setSelectedId,
    remember,
    captureSecret,
    reload,
  };
}
