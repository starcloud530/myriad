import type { LedgerEvent, UsageFailure, UsageGroup, UsagePoint, UsageRange, UsageReport } from "./types.ts";

export function parseRange(value: string | null): UsageRange {
  if (value === "24h" || value === "7d" || value === "30d") {
    return value;
  }
  return "7d";
}

export function rangeWindow(range: UsageRange, now = Date.now()): { from: number; to: number; bucketMs: number; count: number } {
  const bucketMs = range === "24h" ? 3_600_000 : 86_400_000;
  const count = range === "24h" ? 24 : range === "7d" ? 7 : 30;
  const end = Math.floor(now / bucketMs) * bucketMs;
  const from = end - (count - 1) * bucketMs;
  return { from, to: now, bucketMs, count };
}

function labelOf(t: number, range: UsageRange): string {
  const date = new Date(t);
  if (range === "24h") {
    return `${String(date.getUTCHours()).padStart(2, "0")}:00`;
  }
  return `${date.getUTCMonth() + 1}/${date.getUTCDate()}`;
}

function ratio(ok: number, total: number): number {
  if (total === 0) {
    return 0;
  }
  return Math.round((ok / total) * 1000) / 10;
}

function avg(sum: number, count: number): number {
  if (count === 0) {
    return 0;
  }
  return Math.round(sum / count);
}

function groupBy(events: LedgerEvent[], keyOf: (event: LedgerEvent) => string): UsageGroup[] {
  const buckets = new Map<string, { requests: number; ok: number; latency: number; lastError?: string; lastAt?: number }>();
  for (const event of events) {
    const id = keyOf(event);
    const current = buckets.get(id) ?? { requests: 0, ok: 0, latency: 0 };
    current.requests += 1;
    if (event.ok) {
      current.ok += 1;
    } else {
      current.lastError = event.error;
    }
    current.latency += event.durationMs;
    current.lastAt = event.createdAt;
    buckets.set(id, current);
  }
  return [...buckets.entries()]
    .map(([id, row]) => ({
      id,
      requests: row.requests,
      ok: ratio(row.ok, row.requests),
      latency: avg(row.latency, row.requests),
      last_error: row.lastError,
      last_at: row.lastAt,
    }))
    .sort((left, right) => right.requests - left.requests);
}

export function aggregateUsage(events: LedgerEvent[], range: UsageRange, window: { from: number; to: number; bucketMs: number; count: number }): UsageReport {
  const points: UsagePoint[] = [];
  for (let index = 0; index < window.count; index += 1) {
    const t = window.from + index * window.bucketMs;
    const slice = events.filter((event) => event.createdAt >= t && event.createdAt < t + window.bucketMs);
    const ok = slice.filter((event) => event.ok).length;
    points.push({
      label: labelOf(t, range),
      t,
      requests: slice.length,
      units: slice.reduce((sum, event) => sum + event.units, 0),
      success: ratio(ok, slice.length),
      latency: avg(
        slice.reduce((sum, event) => sum + event.durationMs, 0),
        slice.length,
      ),
    });
  }

  const ok = events.filter((event) => event.ok).length;
  const failures: UsageFailure[] = events
    .filter((event) => !event.ok)
    .slice(-20)
    .reverse()
    .map((event) => ({
      request_id: event.requestId,
      capability_id: event.capabilityId,
      channel_id: event.channelId,
      error: event.error ?? "failed",
      duration_ms: event.durationMs,
      created_at: event.createdAt,
    }));

  return {
    range,
    from: window.from,
    to: window.to,
    requests: events.length,
    units: events.reduce((sum, event) => sum + event.units, 0),
    success: ratio(ok, events.length),
    latency: avg(
      events.reduce((sum, event) => sum + event.durationMs, 0),
      events.length,
    ),
    points,
    by_capability: groupBy(events, (event) => event.capabilityId),
    by_key: groupBy(events, (event) => event.keyId),
    by_channel: groupBy(events, (event) => event.channelId),
    failures,
  };
}
