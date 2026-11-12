import { useCallback, useEffect, useState } from "react";
import { CheckCheck, Clock, Loader2, X } from "lucide-react";
import chatService from "@/services/chatService";
import { getSocket } from "@/services/socket";

const formatDateTime = (iso) =>
  iso
    ? new Date(iso).toLocaleString("en-US", {
        month: "short",
        day: "numeric",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      })
    : "Time not recorded";

const initials = (name = "") =>
  name
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase())
    .join("") || "U";

const Person = ({ person, time, muted = false }) => (
  <div className="flex items-center gap-3 py-2">
    {person?.avatar ? (
      <img
        src={person.avatar}
        alt=""
        className="h-8 w-8 shrink-0 rounded-full object-cover"
      />
    ) : (
      <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-[#222] text-[11px] font-semibold text-white/80">
        {initials(person?.name)}
      </span>
    )}

    <div className="min-w-0 flex-1">
      <p className="truncate text-[13px] text-white">{person?.name || "User"}</p>
      {person?.role && (
        <p className="text-[10px] capitalize text-white/40">{person.role}</p>
      )}
    </div>

    {time !== undefined && (
      <p
        className={`shrink-0 text-right text-[11px] ${
          muted ? "text-white/40" : "text-blue-300"
        }`}
      >
        {time}
      </p>
    )}
  </div>
);

/**
 * "Message info" (like WhatsApp): who has seen a message and when.
 * Shared by the admin and the employee chat.
 */
const MessageInfoModal = ({ message, conversationId, onClose }) => {
  const [info, setInfo] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const messageId = message?.id ?? message?._id;
  const isPending = String(messageId || "").startsWith("tmp-");

  const load = useCallback(
    async (silent = false) => {
      if (!conversationId || !messageId || isPending) {
        setLoading(false);
        return;
      }

      if (!silent) setLoading(true);

      try {
        const response = await chatService.getMessageInfo(
          conversationId,
          messageId
        );

        setInfo(response?.data ?? response);
        setError("");
      } catch (exception) {
        setError(exception?.message || "Could not load message info.");
      } finally {
        setLoading(false);
      }
    },
    [conversationId, messageId, isPending]
  );

  useEffect(() => {
    load();
  }, [load]);

  // Update live when somebody opens the chat and sees the message.
  useEffect(() => {
    let socket;

    try {
      socket = getSocket();
    } catch {
      return undefined;
    }

    const onRead = (data) => {
      if (
        String(data?.conversationId) === String(conversationId) &&
        (data?.messageIds || []).map(String).includes(String(messageId))
      ) {
        load(true);
      }
    };

    socket.on("chat:message:read", onRead);

    return () => socket.off("chat:message:read", onRead);
  }, [conversationId, messageId, load]);

  const seenBy = info?.seenBy || [];
  const notSeenBy = info?.notSeenBy || [];
  const preview = message?.text || info?.text || "Attachment";

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget) onClose?.();
      }}
    >
      <div className="flex max-h-[85vh] w-full max-w-sm flex-col overflow-hidden rounded-2xl border border-white/10 bg-[#111] shadow-2xl">
        <div className="flex items-center justify-between border-b border-white/10 px-5 py-4">
          <h3 className="text-[15px] font-semibold text-white">Message info</h3>
          <button
            type="button"
            onClick={() => onClose?.()}
            aria-label="Close"
            className="rounded-lg p-1 text-white/60 hover:bg-white/5 hover:text-white"
          >
            <X size={18} />
          </button>
        </div>

        <div className="overflow-y-auto px-5 py-4">
          <div className="rounded-xl bg-[#1a1a1a] px-3 py-2.5">
            <p className="line-clamp-4 whitespace-pre-wrap break-words text-[12.5px] text-white/90">
              {preview}
            </p>
            <p className="mt-1.5 text-right text-[10px] text-white/40">
              Sent {formatDateTime(info?.sentAt || message?.createdAt)}
            </p>
          </div>

          {isPending && (
            <p className="mt-4 text-[12px] text-white/50">
              This message is still sending. Info will be available once it is
              delivered.
            </p>
          )}

          {loading && !isPending && (
            <div className="flex items-center justify-center gap-2 py-8 text-[12px] text-white/50">
              <Loader2 size={14} className="animate-spin" />
              Loading...
            </div>
          )}

          {!loading && error && (
            <p className="mt-4 rounded-lg bg-red-600/10 px-3 py-2 text-[12px] text-red-300">
              {error}
            </p>
          )}

          {!loading && !error && info && (
            <>
              <div className="mt-4">
                <div className="flex items-center gap-2 text-[12px] font-semibold text-blue-300">
                  <CheckCheck size={15} />
                  Seen by {seenBy.length} of {info.totalRecipients}
                </div>

                {seenBy.length === 0 ? (
                  <p className="py-2 text-[12px] text-white/40">
                    Nobody has seen this message yet.
                  </p>
                ) : (
                  <div className="divide-y divide-white/5">
                    {seenBy.map((item) => (
                      <Person
                        key={item.user.id}
                        person={item.user}
                        time={formatDateTime(item.readAt)}
                      />
                    ))}
                  </div>
                )}
              </div>

              {notSeenBy.length > 0 && (
                <div className="mt-4">
                  <div className="flex items-center gap-2 text-[12px] font-semibold text-white/60">
                    <Clock size={14} />
                    Delivered, not seen yet ({notSeenBy.length})
                  </div>

                  <div className="divide-y divide-white/5">
                    {notSeenBy.map((item) => (
                      <Person
                        key={item.user.id}
                        person={item.user}
                        time="Not seen"
                        muted
                      />
                    ))}
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default MessageInfoModal;