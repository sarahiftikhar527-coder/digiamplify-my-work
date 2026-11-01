import { useEffect, useRef } from "react";
import { MessageSquare, Pin } from "lucide-react";
import MessageBubble from "../MessageBubble";
import { formatDateLabel, isSameDay, scrollbar } from "../../../../../utils/format";

const MessageList = ({ messages, loading, myId, isGroup, canDeleteAny, actions }) => {
  const boxRef = useRef(null);
  const endRef = useRef(null);
  const prevLen = useRef(0);

  useEffect(() => {
    const box = boxRef.current;
    if (!box) return;
    const nearBottom = box.scrollHeight - box.scrollTop - box.clientHeight < 320;
    const last = messages[messages.length - 1];
    if (prevLen.current === 0 || nearBottom || last?.sender?.id === myId) {
      endRef.current?.scrollIntoView({ behavior: prevLen.current === 0 ? "auto" : "smooth" });
    }
    prevLen.current = messages.length;
  }, [messages, myId]);

  const pinned = messages.filter((m) => m.pinned && !m.deleted);
  const lastPinned = pinned[pinned.length - 1];

  if (loading && !messages.length) {
    return (
      <div className="flex flex-1 items-center justify-center bg-[#141414]">
        <div className="h-6 w-6 animate-spin rounded-full border-2 border-white/20 border-t-red-600" />
      </div>
    );
  }

  return (
    <div className="relative flex min-h-0 flex-1 flex-col bg-[#141414]">
      {lastPinned && (
        <button
          onClick={() => document.getElementById(`msg-${lastPinned.id}`)?.scrollIntoView({ behavior: "smooth", block: "center" })}
          className="flex items-center gap-2 border-b border-white/10 bg-[#1a1a1a] px-4 py-2 text-left text-[12px] text-white/70"
        >
          <Pin size={12} className="shrink-0 text-red-500" />
          <span className="truncate">{lastPinned.text || "Attachment"}</span>
          {pinned.length > 1 && <span className="shrink-0 text-white/40">+{pinned.length - 1}</span>}
        </button>
      )}

      <div ref={boxRef} className={`min-h-0 flex-1 space-y-5 px-3 py-4 sm:px-5 ${scrollbar}`}>
        {!messages.length ? (
          <div className="flex h-full flex-col items-center justify-center gap-2 text-white/40">
            <MessageSquare size={32} />
            <p className="text-[13px]">No messages yet. Say hello 👋</p>
          </div>
        ) : (
          messages.map((m, i) => {
            const showDate = i === 0 || !isSameDay(new Date(messages[i - 1].createdAt), new Date(m.createdAt));
            const isMine = m.sender?.id === myId;
            return (
              <div key={m.id} className="space-y-5">
                {showDate && (
                  <div className="flex items-center gap-3">
                    <span className="h-px flex-1 bg-white/10" />
                    <span className="text-[11px] text-white/50">{formatDateLabel(m.createdAt)}</span>
                    <span className="h-px flex-1 bg-white/10" />
                  </div>
                )}
                <MessageBubble
                  message={m}
                  isMine={isMine}
                  isGroup={isGroup}
                  myId={myId}
                  canDelete={isMine || canDeleteAny}
                  {...actions}
                />
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