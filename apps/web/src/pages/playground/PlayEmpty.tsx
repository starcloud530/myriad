import type { ReactNode } from "react";
import { useLocale } from "../../i18n/Locale.tsx";

type PlayEmptyProps = {
  onPrompt: (text: string) => void;
  composer: ReactNode;
};

export function PlayEmpty({ onPrompt, composer }: PlayEmptyProps): ReactNode {
  const { copy } = useLocale();

  return (
    <div className="play-empty">
      <h1 className="play-empty-title">{copy.play.emptyTitle}</h1>
      <p className="play-empty-hint">{copy.play.emptyHint}</p>
      <div className="play-empty-composer">{composer}</div>
      <div className="play-chips">
        {copy.play.starters.map((starter) => (
          <button key={starter.id} type="button" className="play-chip" onClick={() => onPrompt(starter.text)}>
            {starter.label}
          </button>
        ))}
      </div>
    </div>
  );
}
