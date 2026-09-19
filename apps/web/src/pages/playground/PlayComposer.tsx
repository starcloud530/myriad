import { BorderOutlined, SendOutlined } from "@ant-design/icons";
import type { KeyboardEvent, ReactNode } from "react";
import { useLocale } from "../../i18n/Locale.tsx";

type PlayComposerProps = {
  value: string;
  onChange: (value: string) => void;
  onSend: () => void;
  onStop: () => void;
  pending: boolean;
  disabled?: boolean;
};

export function PlayComposer({
  value,
  onChange,
  onSend,
  onStop,
  pending,
  disabled,
}: PlayComposerProps): ReactNode {
  const { copy } = useLocale();
  const canSend = value.trim().length > 0 && !pending && !disabled;

  function handleKeyDown(event: KeyboardEvent<HTMLInputElement>): void {
    if (event.key === "Enter" && !event.nativeEvent.isComposing) {
      event.preventDefault();
      if (canSend) {
        onSend();
      }
    }
  }

  return (
    <div className="play-composer">
      <div className="play-pill">
        <input
          className="play-pill-input"
          value={value}
          disabled={disabled}
          onChange={(event) => onChange(event.target.value)}
          onKeyDown={handleKeyDown}
          placeholder={copy.play.placeholder}
          aria-label={copy.play.placeholder}
        />
        {pending ? (
          <button type="button" className="play-send" onClick={onStop} aria-label={copy.play.stop}>
            <BorderOutlined />
          </button>
        ) : (
          <button type="button" className="play-send" disabled={!canSend} onClick={onSend} aria-label={copy.play.send}>
            <SendOutlined />
          </button>
        )}
      </div>
    </div>
  );
}
