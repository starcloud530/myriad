import { useEffect, useState } from "react";
import { listCapabilities } from "../../lib/api.ts";
import type { PublicCapability } from "./types.ts";

export function useCatalog(key: string): {
  capabilities: PublicCapability[];
  error: string;
  loading: boolean;
} {
  const [capabilities, setCapabilities] = useState<PublicCapability[]>([]);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setError("");
    listCapabilities(key)
      .then((data) => {
        if (!cancelled) {
          setCapabilities(data.capabilities);
        }
      })
      .catch((caught: unknown) => {
        if (!cancelled) {
          setCapabilities([]);
          setError(caught instanceof Error ? caught.message : String(caught));
        }
      })
      .finally(() => {
        if (!cancelled) {
          setLoading(false);
        }
      });
    return () => {
      cancelled = true;
    };
  }, [key]);

  return { capabilities, error, loading };
}
