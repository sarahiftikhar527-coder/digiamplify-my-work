import { useEffect, useState } from "react";
import { Check, X, Forward } from "lucide-react";
import Avatar from "../Avatar";
import { scrollbar } from "../../../../../utils/format";

const getConversationId = (conversation) => {
  const value = conversation?.id ?? conversation?._id;
  return value == null ? "" : String(value);
};

const ForwardModal = ({
  message,
  conversations = [],
  onClose,
  onForward,
}) => {
  const [selected, setSelected] = useState([]);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  const conversationList = Array.isArray(conversations)
    ? conversations.filter((conversation) =>
        Boolean(getConversationId(conversation))
      )
    : [];

  useEffect(() => {
    const handleKeyDown = (event) => {
      if (event.key === "Escape" && !busy) {
        onClose?.();
      }
    };

    window.addEventListener("keydown", handleKeyDown);

    return () => {
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [onClose, busy]);

  const toggleConversation = (id) => {
    if (!id || busy) return;

    setSelected((previous) =>
      previous.includes(id)
        ? previous.filter((item) => item !== id)
        : [...previous, id]
    );

    setError("");
  };

  const handleSubmit = async (event) => {
    event?.preventDefault();

    if (busy) return;

    if (!message?.id && !message?._id) {
      setError("Message ID not found. Please select the message again.");
      return;
    }

    if (!selected.length) {
      setError("Select at least one conversation.");
      return;
    }

    if (typeof onForward !== "function") {
      setError("Forwarding is not available right now.");
      return;
    }

    setBusy(true);
    setError("");

    try {
      await onForward(message, selected);
      onClose?.();
    } catch (err) {
      setError(
        err?.message ||
          "Unable to forward this message. Please try again."
      );
      setBusy(false);
    }
  };

  const messageText =
    message?.text?.trim() ||
    (message?.attachments?.length ? "Attachment" : "Message");

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4 backdrop-blur-[2px]"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget && !busy) {
          onClose?.();
        }
      }}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="forward-modal-title"
        className="flex max-h-[80vh] w-full max-w-sm flex-col overflow-hidden rounded-2xl border border-white/10 bg-[#111] shadow-2xl"
        onMouseDown={(event) => event.stopPropagation()}
      >
        <div className="flex shrink-0 items-center justify-between border-b border-white/10 px-5 py-4">
          <div className="flex min-w-0 items-center gap-2">
            <Forward size={18} className="shrink-0 text-red-500" />

            <h3
              id="forward-modal-title"
              className="text-[15px] font-medium text-white"
            >
              Forward message
            </h3>
          </div>

          <button
            type="button"
            onClick={() => {
              if (!busy) onClose?.();
            }}
            disabled={busy}
            aria-label="Close forward dialog"
            className="rounded-md p-1 text-white/60 transition-colors hover:bg-white/5 hover:text-white disabled:cursor-not-allowed disabled:opacity-40"
          >
            <X size={18} />
          </button>
        </div>

        <div className="mx-5 mt-3 rounded-lg border border-white/5 bg-[#1a1a1a] px-3 py-2">
          <p className="line-clamp-3 break-words text-[12px] text-white/60">
            {messageText}
          </p>

          {message?.attachments?.length > 0 && (
            <p className="mt-1 text-[11px] text-white/40">
              {message.attachments.length} attachment
              {message.attachments.length !== 1 ? "s" : ""}
            </p>
          )}
        </div>

        <div
          className={`mt-3 min-h-[100px] flex-1 overflow-y-auto px-2 ${scrollbar}`}
        >
          {conversationList.length === 0 ? (
            <p className="px-4 py-8 text-center text-[12px] text-white/40">
              No conversations available.
            </p>
          ) : (
            conversationList.map((conversation) => {
              const id = getConversationId(conversation);
              const isSelected = selected.includes(id);
              const name = conversation.name || "Conversation";

              return (
                <button
                  key={id}
                  type="button"
                  onClick={() => toggleConversation(id)}
                  disabled={busy}
                  aria-pressed={isSelected}
                  className={`flex w-full items-center gap-3 rounded-lg px-3 py-2 text-left transition-colors disabled:cursor-not-allowed disabled:opacity-60 ${
                    isSelected ? "bg-red-600/10" : "hover:bg-white/5"
                  }`}
                >
                  <Avatar
                    src={conversation.avatar || conversation.avatarUrl}
                    name={name}
                    group={conversation.type === "group"}
                    size={32}
                  />

                  <span className="min-w-0 flex-1 truncate text-[13px] text-white">
                    {name}
                  </span>

                  <span
                    className={`flex h-5 w-5 shrink-0 items-center justify-center rounded-full border ${
                      isSelected
                        ? "border-red-500 bg-red-600 text-white"
                        : "border-white/20 text-transparent"
                    }`}
                  >
                    {isSelected && <Check size={13} />}
                  </span>
                </button>
              );
            })
          )}
        </div>

        <div className="shrink-0 border-t border-white/10 px-5 py-4">
          {error && (
            <p
              role="alert"
              className="mb-3 break-words text-[12px] text-red-400"
            >
              {error}
            </p>
          )}

          <button
            type="button"
            onClick={handleSubmit}
            disabled={busy || selected.length === 0}
            className="flex w-full items-center justify-center gap-2 rounded-full bg-red-600 py-2.5 text-[13px] font-semibold text-white transition-colors hover:bg-red-500 disabled:cursor-not-allowed disabled:opacity-50"
          >
            <Forward size={15} />
            {busy
              ? "Forwarding..."
              : `Forward${selected.length ? ` (${selected.length})` : ""}`}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ForwardModal;