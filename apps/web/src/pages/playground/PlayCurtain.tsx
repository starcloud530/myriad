import { DeleteOutlined, MessageOutlined, PlusOutlined } from "@ant-design/icons";
import type { ReactNode } from "react";
import { useEffect } from "react";
import { useLocale } from "../../i18n/Locale.tsx";
import type { PlayConversation } from "./conversations.ts";

type PlayCurtainProps = {
  conversations: PlayConversation[];
  activeId: string;
  open: boolean;
  onClose: () => void;
  onNew: () => void;
  onSelect: (id: string) => void;
  onDelete: (id: string) => void;
};

export function PlayCurtain({
  conversations,
  activeId,
  open,
  onClose,
  onNew,
  onSelect,
  onDelete,
}: PlayCurtainProps): ReactNode {
  const { copy } = useLocale();

  useEffect(() => {
    if (!open) {
      return;
    }
    const onKey = (event: KeyboardEvent): void => {
      if (event.key === "Escape") {
        onClose();
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, onClose]);

  return (
    <>
      <button
        type="button"
        aria-label={copy.play.closeChats}
        onClick={onClose}
        className={open ? "play-mask is-on" : "play-mask"}
        tabIndex={-1}
      />
      <div className={open ? "play-curtain is-open" : "play-curtain"} aria-hidden={!open}>
        <div className="play-curtain-bar">
          <button type="button" className="play-new" onClick={onNew}>
            <PlusOutlined />
            {copy.play.newChat}
          </button>
          <p className="play-recent">{copy.play.recent}</p>
        </div>
        <div className="play-curtain-list">
          {conversations.length === 0 ? (
            <p className="play-none">{copy.play.noneYet}</p>
          ) : (
            <ul>
              {conversations.map((item) => (
                <li key={item.id}>
                  <div className={item.id === activeId ? "play-item is-on" : "play-item"}>
                    <MessageOutlined className="play-item-icon" />
                    <button type="button" className="play-item-title" onClick={() => onSelect(item.id)}>
                      {item.title}
                    </button>
                    <button
                      type="button"
                      className="play-item-del"
                      aria-label={copy.play.deleteChat}
                      onClick={() => onDelete(item.id)}
                    >
                      <DeleteOutlined />
                    </button>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </>
  );
}
