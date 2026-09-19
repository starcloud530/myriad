import type { ReactNode } from "react";
import { useEffect, useRef } from "react";
import { Link } from "react-router";
import { VendorMark } from "../../catalog-engine/VendorMark.tsx";
import { modelLabel, vendorLabel } from "../../catalog-engine/labels.ts";
import { usePriceText } from "../../catalog-engine/Fx.tsx";
import { modelHref, modelKey } from "../../catalog-engine/spec.ts";
import type { ModelRecord } from "../../catalog-engine/spec.ts";
import { useLocale } from "../../i18n/Locale.tsx";
import type { PlayMessage } from "./conversations.ts";

type PlayTranscriptProps = {
  messages: PlayMessage[];
  models: ModelRecord[];
  pending: boolean;
};

export function PlayTranscript({ messages, models, pending }: PlayTranscriptProps): ReactNode {
  const endRef = useRef<HTMLDivElement>(null);
  const { copy } = useLocale();

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: "smooth", block: "end" });
  }, [messages, pending]);

  return (
    <div className="play-thread">
      <div className="play-log">
        {messages.map((message) => (
          <PlayBubble key={message.id} message={message} models={models} />
        ))}
        {pending ? (
          <article className="play-bot">
            <div className="play-bot-text is-muted">{copy.play.thinking}</div>
          </article>
        ) : null}
        <div ref={endRef} />
      </div>
    </div>
  );
}

function PlayBubble({ message, models }: { message: PlayMessage; models: ModelRecord[] }): ReactNode {
  const { locale, copy } = useLocale();
  const { summary } = usePriceText();
  const picks = (message.pickKeys ?? [])
    .map((key) => models.find((model) => modelKey(model) === key))
    .filter((model): model is ModelRecord => model != null);

  if (message.role === "user") {
    return (
      <article className="play-user">
        <div className="play-user-text">{message.text}</div>
      </article>
    );
  }

  return (
    <article className="play-bot">
      <div className="play-bot-text">{message.text}</div>
      {picks.length > 0 ? (
        <div className="play-picks">
          {picks.map((model) => (
            <Link key={modelKey(model)} to={modelHref(model)} className="play-pick">
              <VendorMark vendor={model.vendor} size={28} />
              <div>
                <div className="play-pick-name">{modelLabel(model, locale)}</div>
                <div className="play-pick-sub">
                  {vendorLabel(model.vendor, locale)} · {summary(model.pricing)}
                </div>
              </div>
              <span className="play-pick-go">{copy.play.tryModel}</span>
            </Link>
          ))}
        </div>
      ) : null}
    </article>
  );
}
