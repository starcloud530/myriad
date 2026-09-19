import { DownOutlined } from "@ant-design/icons";
import type { ReactNode } from "react";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { FilterTrack } from "../../components/ui/FilterTrack.tsx";
import { useFx } from "../../catalog-engine/Fx.tsx";
import { listModels } from "../../catalog-engine/load.ts";
import { modelLabel, vendorLabel } from "../../catalog-engine/labels.ts";
import { modelKey } from "../../catalog-engine/spec.ts";
import { TryPlay } from "../../features/invoke/TryPlay.tsx";
import { useProductKeys } from "../../features/keys/useProductKeys.ts";
import { useLocale } from "../../i18n/Locale.tsx";
import { invokeCapability } from "../../lib/api.ts";
import {
  advisorModel,
  advisorSystem,
  assistantText,
  localAdvice,
  mergePicks,
  starterPrompt,
} from "./advise.ts";
import {
  createId,
  emptyConversation,
  loadConversations,
  saveConversations,
  titleFromMessages,
  type PlayConversation,
  type PlayMessage,
} from "./conversations.ts";
import { PlayComposer } from "./PlayComposer.tsx";
import { PlayEmpty } from "./PlayEmpty.tsx";
import { PlayCurtain } from "./PlayCurtain.tsx";
import { PlayTranscript } from "./PlayTranscript.tsx";
import "./playground.css";

type Mode = "agent" | "classic";

export function PlaygroundPage(): ReactNode {
  const { locale, copy } = useLocale();
  const fx = useFx();
  const models = useMemo(() => listModels(), []);
  const { secret } = useProductKeys();
  const [mode, setMode] = useState<Mode>("agent");
  const [classicKey, setClassicKey] = useState(() => {
    const first = advisorModel(models) ?? models[0];
    return first ? modelKey(first) : "";
  });
  const [hydrated, setHydrated] = useState(false);
  const [conversations, setConversations] = useState<PlayConversation[]>([]);
  const [activeId, setActiveId] = useState("");
  const [draft, setDraft] = useState("");
  const [pending, setPending] = useState(false);
  const [curtainOpen, setCurtainOpen] = useState(false);
  const abortRef = useRef<AbortController | null>(null);

  const classic = models.find((model) => modelKey(model) === classicKey) ?? models[0];

  useEffect(() => {
    const stored = loadConversations();
    if (stored.length > 0) {
      setConversations(stored);
      setActiveId(stored[0].id);
    } else {
      const first = emptyConversation(copy.play.newChat);
      setConversations([first]);
      setActiveId(first.id);
    }
    setHydrated(true);
  }, []);

  useEffect(() => {
    if (!hydrated) {
      return;
    }
    saveConversations(conversations);
  }, [conversations, hydrated]);

  useEffect(() => {
    return () => abortRef.current?.abort();
  }, []);

  const active = conversations.find((item) => item.id === activeId) ?? conversations[0];
  const messages = active?.messages ?? [];

  const updateActive = useCallback(
    (updater: (current: PlayConversation) => PlayConversation) => {
      setConversations((list) => list.map((item) => (item.id === activeId ? updater(item) : item)));
    },
    [activeId],
  );

  const send = useCallback(
    async (text: string) => {
      const content = text.trim();
      if (!content || abortRef.current || !active) {
        return;
      }

      const userMessage: PlayMessage = { id: createId(), role: "user", text: content };
      const nextMessages = [...active.messages, userMessage];
      updateActive((current) => ({
        ...current,
        title: titleFromMessages(nextMessages, copy.play.newChat),
        updatedAt: Date.now(),
        messages: nextMessages,
      }));
      setDraft("");
      setPending(true);
      setCurtainOpen(false);

      const controller = new AbortController();
      abortRef.current = controller;

      const guide = advisorModel(models);
      let reply = localAdvice(content, mergePicks(content, "", models), locale, copy);
      if (secret && guide) {
        try {
          const body = await invokeCapability(secret, guide.capability, {
            messages: [
              { role: "system", content: advisorSystem(models, locale, copy, fx) },
              ...nextMessages
                .filter((row) => row.role === "user" || row.role === "assistant")
                .map((row) => ({ role: row.role, content: row.text })),
            ],
          });
          if (!controller.signal.aborted) {
            const spoken = assistantText(body).trim();
            if (spoken) {
              reply = spoken;
            }
          }
        } catch {
          if (!controller.signal.aborted) {
            reply = `${copy.play.noKey}\n\n${reply}`;
          }
        }
      } else if (!secret && !controller.signal.aborted) {
        reply = `${copy.play.noKey}\n\n${reply}`;
      }

      if (controller.signal.aborted) {
        abortRef.current = null;
        setPending(false);
        return;
      }

      const picks = mergePicks(content, reply, models);
      if (!reply.includes(copy.play.promptTitle) && picks[0]) {
        reply = `${reply}\n\n${copy.play.promptTitle}\n${starterPrompt(content, picks[0], locale)}`;
      }

      const assistantMessage: PlayMessage = {
        id: createId(),
        role: "assistant",
        text: reply,
        pickKeys: picks.map((model) => modelKey(model)),
      };
      setConversations((list) =>
        list.map((item) =>
          item.id === active.id
            ? { ...item, updatedAt: Date.now(), messages: [...nextMessages, assistantMessage] }
            : item,
        ),
      );
      abortRef.current = null;
      setPending(false);
    },
    [active, copy, fx, locale, models, secret, updateActive],
  );

  function handleStop(): void {
    abortRef.current?.abort();
    abortRef.current = null;
    setPending(false);
  }

  function handleNewChat(): void {
    abortRef.current?.abort();
    abortRef.current = null;
    setPending(false);
    setDraft("");
    const next = emptyConversation(copy.play.newChat);
    setConversations((list) => [next, ...list.filter((item) => item.messages.length > 0)]);
    setActiveId(next.id);
    setCurtainOpen(false);
    setMode("agent");
  }

  function handleSelect(id: string): void {
    if (id === activeId) {
      setCurtainOpen(false);
      return;
    }
    abortRef.current?.abort();
    abortRef.current = null;
    setPending(false);
    setDraft("");
    setActiveId(id);
    setCurtainOpen(false);
    setMode("agent");
  }

  function handleDelete(id: string): void {
    setConversations((list) => {
      const next = list.filter((item) => item.id !== id);
      if (next.length === 0) {
        const fresh = emptyConversation(copy.play.newChat);
        setActiveId(fresh.id);
        return [fresh];
      }
      if (id === activeId) {
        setActiveId(next[0].id);
      }
      return next;
    });
  }

  const sorted = [...conversations].sort((a, b) => b.updatedAt - a.updatedAt);
  const composer = (
    <PlayComposer
      value={draft}
      onChange={setDraft}
      onSend={() => void send(draft)}
      onStop={handleStop}
      pending={pending}
    />
  );

  return (
    <div className="play-root">
      <div className="play-main">
        <header className="play-head">
          <button
            type="button"
            className={curtainOpen ? "play-curtain-trigger is-open" : "play-curtain-trigger"}
            aria-label={copy.play.openChats}
            aria-expanded={curtainOpen}
            onClick={() => setCurtainOpen((value) => !value)}
          >
            <span className="play-head-title">{active?.title ?? copy.play.newChat}</span>
            <DownOutlined className="play-curtain-caret" />
          </button>
          <FilterTrack
            value={mode}
            onChange={setMode}
            options={[
              { value: "agent", label: copy.play.agent },
              { value: "classic", label: copy.play.classic },
            ]}
          />
        </header>
        <PlayCurtain
          conversations={sorted}
          activeId={activeId}
          open={curtainOpen}
          onClose={() => setCurtainOpen(false)}
          onNew={handleNewChat}
          onSelect={handleSelect}
          onDelete={handleDelete}
        />
        {mode === "classic" ? (
          <div className="play-classic">
            <div className="play-classic-bar">
              <label className="play-select">
                <span>{copy.play.pickModel}</span>
                <select
                  value={classic ? modelKey(classic) : ""}
                  onChange={(event) => {
                    const next = models.find((model) => modelKey(model) === event.target.value);
                    if (next) {
                      setClassicKey(modelKey(next));
                    }
                  }}
                >
                  {models.map((model) => (
                    <option key={modelKey(model)} value={modelKey(model)}>
                      {vendorLabel(model.vendor, locale)} · {modelLabel(model, locale)}
                    </option>
                  ))}
                </select>
              </label>
              <p className="play-note">{copy.play.classicHint}</p>
            </div>
            <div className="play-classic-stage">{classic ? <TryPlay apiKey={secret} model={classic} /> : null}</div>
          </div>
        ) : (
          <>
            <main className="play-body">
              {messages.length === 0 ? (
                <PlayEmpty onPrompt={(text) => void send(text)} composer={composer} />
              ) : (
                <PlayTranscript messages={messages} models={models} pending={pending} />
              )}
            </main>
            {messages.length > 0 ? <div className="play-dock">{composer}</div> : null}
          </>
        )}
      </div>
    </div>
  );
}
