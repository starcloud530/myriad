export type UsageRange = "24h" | "7d" | "30d";

export interface UsagePoint {
  label: string;
  t: number;
  requests: number;
  units: number;
  success: number;
  latency: number;
}

export interface UsageGroup {
  id: string;
  requests: number;
  ok: number;
  latency: number;
  last_error?: string;
  last_at?: number;
}

export interface UsageFailure {
  request_id: string;
  capability_id: string;
  channel_id: string;
  error: string;
  duration_ms: number;
  created_at: number;
}

export interface UsageReport {
  range: UsageRange;
  from: number;
  to: number;
  requests: number;
  units: number;
  success: number;
  latency: number;
  points: UsagePoint[];
  by_capability: UsageGroup[];
  by_key: UsageGroup[];
  by_channel: UsageGroup[];
  failures: UsageFailure[];
}

export interface HealthReport {
  ok: boolean;
  name: string;
  name_zh?: string;
}
