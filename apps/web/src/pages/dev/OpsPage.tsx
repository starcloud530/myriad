import type { ReactNode } from "react";
import { useEffect, useRef, useState } from "react";
import { PageFrame } from "../../components/biz/PageFrame.tsx";
import { PageHeader } from "../../components/biz/PageHeader.tsx";
import { SolidButton } from "../../components/ui/SolidButton.tsx";
import { useLocale } from "../../i18n/Locale.tsx";
import type { Locale } from "../../i18n/locale.ts";
import "./admin.css";

interface Line {
  role: "user" | "agent";
  text: string;
}

interface WatchRow {
  id: string;
  up: string;
  bar: number;
}

const watches: WatchRow[] = [
  { id: "chat", up: "99.4%", bar: 99.4 },
  { id: "fal", up: "98.1%", bar: 98.1 },
  { id: "volcengine", up: "97.6%", bar: 97.6 },
];

function reply(input: string, locale: "en" | "zh"): string {
  const q = input.toLowerCase();
  if (q.includes("key") || q.includes("密钥")) {
    return locale === "zh" ? "系统密钥在线。用户密钥哈希存在 MYRIAD_KEYS。轮换后旧 secret 立即失效。" : "System key is live. Product keys are hashed in MYRIAD_KEYS. Rotate drops the old secret immediately.";
  }
  if (q.includes("channel") || q.includes("渠道") || q.includes("deepseek") || q.includes("fal")) {
    return locale === "zh" ? "DeepSeek / 千问 / fal / 火山主渠道均探测通过。回落仍是 qwen-plus。" : "DeepSeek, Qwen, fal, and Volcengine primaries probe clean. Fallback is still qwen-plus.";
  }
  if (q.includes("error") || q.includes("延迟") || q.includes("latency")) {
    return locale === "zh" ? "近 15 分钟错误率 0.7%。对话首包 380–450ms。生视频排队偏长，属异步。" : "Error rate 0.7% in the last 15m. Chat TTFT 380–450ms. Video sits in the async queue.";
  }
  return locale === "zh"
    ? "我是运维 Agent。可以问渠道健康、密钥、延迟或故障。正式工单以后从这里派。"
    : "Ops agent. Ask about channel health, keys, latency, or incidents. Tickets will dispatch from this thread.";
}

function watchAsk(id: string, locale: Locale): string {
  return locale === "zh" ? `${id} 渠道健康如何？` : `How is the ${id} channel?`;
}

export function OpsPage(): ReactNode {
  const { locale, copy } = useLocale();
  const a = copy.admin;
  const [draft, setDraft] = useState("");
  const [lines, setLines] = useState<Line[]>([{ role: "agent", text: a.opsHello }]);
  const [focusId, setFocusId] = useState(watches[0]?.id ?? "");
  const logRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const node = logRef.current;
    if (!node) {
      return;
    }
    node.scrollTo({ top: node.scrollHeight, behavior: "smooth" });
  }, [lines]);

  function push(text: string): void {
    setLines((current) => [...current, { role: "user", text }, { role: "agent", text: reply(text, locale) }]);
  }

  function send(): void {
    const text = draft.trim();
    if (!text) {
      return;
    }
    push(text);
    setDraft("");
  }

  const chips = [
    { id: "keys", label: copy.nav.keys, ask: locale === "zh" ? "密钥" : "key" },
    { id: "channels", label: copy.nav.channels, ask: locale === "zh" ? "渠道" : "channel" },
    { id: "latency", label: copy.usage.latency, ask: locale === "zh" ? "延迟" : "latency" },
  ] as const;

  return (
    <PageFrame>
      <PageHeader eyebrow={a.opsEyebrow} title={a.opsTitle} description={a.opsIntro} />
      <div className="admin-desk">
        <aside className="admin-watch">
          <div className="admin-kicker">{a.opsWatch}</div>
          {watches.map((row) => (
            <button
              key={row.id}
              type="button"
              className={focusId === row.id ? "admin-watch-item is-on" : "admin-watch-item"}
              onClick={() => {
                setFocusId(row.id);
                push(watchAsk(row.id, locale));
              }}
            >
              <span className="admin-watch-name">{row.id}</span>
              <span className="admin-watch-up admin-mono">{row.up}</span>
              <span className="admin-watch-bar" aria-hidden>
                <span style={{ width: `${row.bar}%` }} />
              </span>
            </button>
          ))}
        </aside>
        <section className="admin-thread">
          <div className="admin-thread-bar">
            <span>Ops</span>
            <div className="admin-chips">
              {chips.map((chip) => (
                <button key={chip.id} type="button" className="admin-chip" onClick={() => push(chip.ask)}>
                  {chip.label}
                </button>
              ))}
            </div>
          </div>
          <div className="admin-log" ref={logRef}>
            {lines.map((line, index) => (
              <div key={`${line.role}-${index}`} className={line.role === "user" ? "admin-bubble is-user" : "admin-bubble"}>
                <div className="admin-bubble-who">{line.role === "user" ? "You" : "Ops"}</div>
                <p>{line.text}</p>
              </div>
            ))}
          </div>
          <div className="admin-composer">
            <input
              value={draft}
              placeholder={a.opsPlaceholder}
              onChange={(event) => {
                setDraft(event.target.value);
              }}
              onKeyDown={(event) => {
                if (event.key === "Enter") {
                  send();
                }
              }}
            />
            <SolidButton onClick={send}>{a.opsSend}</SolidButton>
          </div>
        </section>
      </div>
    </PageFrame>
  );
}
