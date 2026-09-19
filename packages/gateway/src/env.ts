/** Cloudflare Worker 绑定。南向 Key 只从这里读，不进 catalog。 */
export interface Env {
  MYRIAD_ENV?: string;
  DEEPSEEK_API_KEY?: string;
  QIANWEN_API_KEY?: string;
  FAL_API_KEY?: string;
  VOLCENGINE_API_KEY?: string;
  KEY_PEPPER?: string;
  GOOGLE_CLIENT_ID?: string;
  GOOGLE_CLIENT_SECRET?: string;
  GITHUB_CLIENT_ID?: string;
  GITHUB_CLIENT_SECRET?: string;
  AUTH_PUBLIC_ORIGIN?: string;
  MYRIAD_KEYS?: KVNamespace;
  MYRIAD_LEDGER?: D1Database;
}
