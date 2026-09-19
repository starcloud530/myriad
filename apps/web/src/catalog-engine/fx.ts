import { parse } from "yaml";
import type { Locale } from "../i18n/locale.ts";
import fallbackRaw from "../../../../catalog/fx.yaml?raw";

export type FxSource = "live" | "fallback";

export type FxQuote = {
  usdCny: number;
  asOf: string;
  source: FxSource;
};

const STORAGE_KEY = "myriad.fx.usdCny";
const TTL_MS = 6 * 60 * 60 * 1000;

type LiveFeed = {
  url: string;
  read: (body: unknown) => FxQuote | null;
};

const FEEDS: LiveFeed[] = [
  {
    url: "https://open.er-api.com/v6/latest/USD",
    read: (body) => {
      const row = body as { rates?: { CNY?: unknown }; time_last_update_unix?: unknown };
      const usdCny = asNumber(row.rates?.CNY);
      if (usdCny == null) {
        return null;
      }
      const unix = asNumber(row.time_last_update_unix);
      const asOf = unix != null ? new Date(unix * 1000).toISOString().slice(0, 10) : new Date().toISOString().slice(0, 10);
      return { usdCny, asOf, source: "live" };
    },
  },
  {
    url: "https://cdn.jsdelivr.net/npm/@fawazahmed0/currency-api@latest/v1/currencies/usd.min.json",
    read: (body) => {
      const row = body as { date?: unknown; usd?: { cny?: unknown } };
      const usdCny = asNumber(row.usd?.cny);
      if (usdCny == null) {
        return null;
      }
      return { usdCny, asOf: asString(row.date) ?? new Date().toISOString().slice(0, 10), source: "live" };
    },
  },
  {
    url: "https://api.frankfurter.app/latest?from=USD&to=CNY",
    read: (body) => {
      const row = body as { date?: unknown; rates?: { CNY?: unknown } };
      const usdCny = asNumber(row.rates?.CNY);
      if (usdCny == null) {
        return null;
      }
      return { usdCny, asOf: asString(row.date) ?? new Date().toISOString().slice(0, 10), source: "live" };
    },
  },
];

type StoredQuote = FxQuote & { fetchedAt: number };

function asNumber(value: unknown): number | null {
  return typeof value === "number" && Number.isFinite(value) && value > 0 ? value : null;
}

function asString(value: unknown): string | undefined {
  return typeof value === "string" && value.trim() ? value.trim() : undefined;
}

export function fallbackQuote(): FxQuote {
  const row = parse(fallbackRaw) as { usd_cny?: unknown; as_of?: unknown };
  return {
    usdCny: asNumber(row.usd_cny) ?? 6.72,
    asOf: asString(row.as_of) ?? "2026-09-16",
    source: "fallback",
  };
}

export function formatRate(usdCny: number): string {
  return String(Math.round(usdCny * 10_000) / 10_000);
}

function roundDisplay(value: number): number {
  if (value >= 0.1) {
    return Math.round(value * 100) / 100;
  }
  if (value >= 0.01) {
    return Math.round(value * 1000) / 1000;
  }
  return Math.round(value * 10_000) / 10_000;
}

export function formatMoney(cny: number, locale: Locale, fx: FxQuote): string {
  if (locale === "zh") {
    return `¥${cny}`;
  }
  return `$${roundDisplay(cny / fx.usdCny)}`;
}

export function readCachedQuote(): FxQuote | null {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) {
      return null;
    }
    const parsed = JSON.parse(raw) as StoredQuote;
    if (Date.now() - parsed.fetchedAt > TTL_MS) {
      return null;
    }
    if (!asNumber(parsed.usdCny) || !asString(parsed.asOf)) {
      return null;
    }
    return { usdCny: parsed.usdCny, asOf: parsed.asOf, source: parsed.source === "live" ? "live" : "fallback" };
  } catch {
    return null;
  }
}

function writeCachedQuote(quote: FxQuote): void {
  const stored: StoredQuote = { ...quote, fetchedAt: Date.now() };
  localStorage.setItem(STORAGE_KEY, JSON.stringify(stored));
}

export async function fetchLiveQuote(): Promise<FxQuote> {
  const errors: string[] = [];
  for (const feed of FEEDS) {
    try {
      const response = await fetch(feed.url);
      if (!response.ok) {
        errors.push(`${feed.url} ${response.status}`);
        continue;
      }
      const quote = feed.read(await response.json());
      if (!quote) {
        errors.push(`${feed.url} empty`);
        continue;
      }
      writeCachedQuote(quote);
      return quote;
    } catch (caught) {
      errors.push(`${feed.url} ${caught instanceof Error ? caught.message : String(caught)}`);
    }
  }
  throw new Error(errors.join("; ") || "fx");
}

export function initialQuote(): FxQuote {
  return readCachedQuote() ?? fallbackQuote();
}
