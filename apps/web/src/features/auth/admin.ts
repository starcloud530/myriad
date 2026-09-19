import type { AuthMe } from "../../lib/api.ts";

const ADMIN_NAMES = ["chengcheng jiang"];
const ADMIN_EMAILS = ["kk1234567qwe@163.com"];

function fold(value: string): string {
  return value.trim().toLowerCase().replace(/\s+/g, " ");
}

export function isConsoleAdmin(me: AuthMe | null | undefined): boolean {
  if (!me?.providers?.includes("google")) {
    return false;
  }
  const name = fold(me.user.display_name ?? "");
  const email = fold(me.user.email ?? "");
  return ADMIN_NAMES.includes(name) || ADMIN_EMAILS.includes(email);
}
