
import { useEffect, useRef } from "react";
import { MessageSquare, Pin } from "lucide-react";
import MessageBubble from "../MessageBubble";
import {
  formatDateLabel,
  isSameDay,
  scrollbar,
} from "../../../../../utils/format";

const getMessageId = (message) =>
  String(message?.id || message?._id || "");

const getSenderId = (message) =>
  String(
    message?.sender?.id ||
      message?.sender?._id ||
      message?.senderId ||
      ""
  );

const getMessageDate = (message) => {
  const value = message?.createdAt || message?.updatedAt;
  const date = value ? new Date(value) : new Date();

  return Number.isNaN(date.getTime()) ? new Date() : date;
};

const MessageList = ({
  messages = [],
  loading = false,
  myId,
  isGroup = false,
  canDeleteAny = false,
  actions = {},
}) => {
  const boxRef = useRef(null);
  const endRef = useRef(null);
  const prevLen = useRef(0);
  const previousLastId = useRef(null);
  const initialScrollDone = useRef(false);

  const safeMessages = Array.isArray(messages) ? messages : [];
  const currentUserId = String(myId || "");

  const pinned = safeMessages.filter(
    (message) => message?.pinned && !message?.deleted
  );

  const lastPinned = pinned[pinned.length - 1];
  const lastPinnedId = getMessageId(lastPinned);

  useEffect(() => {
    const box = boxRef.current;

    if (!box) return;

    if (safeMessages.length === 0) {
      prevLen.current = 0;
      previousLastId.current = null;
      initialScrollDone.current = false;
      return;
    }

    const lastMessage = safeMessages[safeMessages.length - 1];
    const lastMessageId = getMessageId(lastMessage);

    const isInitialLoad = !initialScrollDone.current;
    const nearBottom =
      box.scrollHeight - box.scrollTop - box.clientHeight < 320;

    const isNewMessage =
      lastMessageId !== previousLastId.current;

    const isOwnMessage =
      getSenderId(lastMessage) === currentUserId;

    if (
      isInitialLoad ||
      (isNewMessage && (nearBottom || isOwnMessage))
    ) {
      endRef.current?.scrollIntoView({
        behavior: isInitialLoad ? "auto" : "smooth",
        block: "end",
      });
    }

    initialScrollDone.current = true;
    prevLen.current = safeMessages.length;
    previousLastId.current = lastMessageId;
  }, [safeMessages, currentUserId]);

  const scrollToPinnedMessage = () => {
    if (!lastPinnedId) return;

    const element = document.getElementById(
      `msg-${lastPinnedId}`
    );

    element?.scrollIntoView({
      behavior: "smooth",
      block: "center",
    });
  };

  if (loading && safeMessages.length === 0) {
    return (
      <div
        className="flex min-h-0 flex-1 items-center justify-center bg-[#141414]"
        role="status"
        aria-label="Loading messages"
      >
        <div className="h-6 w-6 animate-spin rounded-full border-2 border-white/20 border-t-red-600" />
      </div>
    );
  }

  return (
    <div className="relative flex min-h-0 flex-1 flex-col bg-[#141414]">
      {lastPinned && (
        <button
          type="button"
          onClick={scrollToPinnedMessage}
          className="flex min-w-0 items-center gap-2 border-b border-white/10 bg-[#1a1a1a] px-4 py-2 text-left text-[12px] text-white/70 transition-colors hover:bg-[#202020]"
          aria-label="Scroll to the latest pinned message"
        >
          <Pin
            size={12}
            className="shrink-0 text-red-500"
          />

          <span className="truncate">
            {lastPinned.text || "Attachment"}
          </span>

          {pinned.length > 1 && (
            <span className="shrink-0 text-white/40">
              +{pinned.length - 1}
            </span>
          )}
        </button>
      )}

      <div
        ref={boxRef}
        className={`min-h-0 flex-1 space-y-5 overflow-y-auto px-3 py-4 sm:px-5 ${scrollbar}`}
        role="log"
        aria-label="Chat messages"
        aria-live="polite"
        aria-relevant="additions"
      >
        {safeMessages.length === 0 ? (
          <div className="flex h-full min-h-48 flex-col items-center justify-center gap-2 text-white/40">
            <MessageSquare size={32} />

            <p className="text-center text-[13px]">
              No messages yet. Say hello 👋
            </p>
          </div>
        ) : (
          safeMessages.map((message, index) => {
            const messageId = getMessageId(message);
            const previousMessage = safeMessages[index - 1];

            const messageDate = getMessageDate(message);
            const previousDate = previousMessage
              ? getMessageDate(previousMessage)
              : null;

            const showDate =
              index === 0 ||
              !isSameDay(previousDate, messageDate);

            const senderId = getSenderId(message);
            const isMine =
              Boolean(currentUserId) &&
              senderId === currentUserId;

            return (
              <div
                key={
                  messageId ||
                  `${senderId}-${messageDate.getTime()}-${index}`
                }
                className="space-y-5"
              >
                {showDate && (
                  <div className="flex items-center gap-3">
                    <span className="h-px flex-1 bg-white/10" />

                    <span className="shrink-0 text-[11px] text-white/50">
                      {formatDateLabel(messageDate)}
                    </span>

                    <span className="h-px flex-1 bg-white/10" />
                  </div>
                )}

                <div
                  id={messageId ? `msg-${messageId}` : undefined}
                >
                  <MessageBubble
                    message={message}
                    isMine={isMine}
                    isGroup={isGroup}
                    myId={currentUserId}
                    canDelete={isMine || canDeleteAny}
                    {...actions}
                  />
                </div>
              </div>
            );
          })
        )}

        <div ref={endRef} />
      </div>
    </div>
  );
};

export default MessageList;
