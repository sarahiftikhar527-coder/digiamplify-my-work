import { useRef, useState } from "react";
import {
  AlertCircle, ChevronDown, Clock, FileText, Forward, Pin, PinOff, Reply, Smile, Trash2, User, Plus,
} from "lucide-react";
import Avatar from "../Avatar";
import useClickOutside from "../../../../../hooks/useClickOutside";
import { formatTime } from "../../../../../utils/format";

const QUICK = ["👍", "❤️", "🤣", "😢", "🙏"];
const MORE = ["😀", "😮", "🔥", "🎉", "👏", "✅"];

const escapeRe = (s) => s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
const renderText = (text, mentions = []) => {
  const names = mentions.map((m) => m.name).filter(Boolean);
  if (!names.length) return text;
  const re = new RegExp(`(@(?:${names.map(escapeRe).join("|")}))`, "g");
  return text.split(re).map((part, i) =>
    i % 2 ? <span key={i} className="font-semibold text-red-400">{part}</span> : part
  );
};

const MessageBubble = ({
  message, isMine, isGroup, myId, canDelete,
  onReply, onReplyPrivately, onReact, onForward, onPin, onDelete, onRetry,
}) => {
  const [menu, setMenu] = useState(false);
  const [more, setMore] = useState(false);
  const [openUp, setOpenUp] = useState(false);
  const ref = useRef(null);
  const btnRef = useRef(null);
  useClickOutside(ref, () => { setMenu(false); setMore(false); }, menu);

  const { sender, text, createdAt, replyTo, reactions = [], pinned, deleted, attachments = [], status, mentions = [] } = message;

  const toggleMenu = () => {
    if (!menu && btnRef.current) {
      const r = btnRef.current.getBoundingClientRect();
      setOpenUp(window.innerHeight - r.bottom < 320);
    }
    setMenu((v) => !v);
    setMore(false);
  };
  const run = (fn) => { setMenu(false); setMore(false); fn?.(); };

  const items = [
    { label: "Reply", icon: Reply, onClick: () => run(() => onReply(message)) },
    ...(!isMine && isGroup
      ? [{ label: "Reply Privately", icon: User, onClick: () => run(() => onReplyPrivately(message)) }]
      : []),
    { label: "React", icon: Smile, onClick: () => setMore((v) => !v) },
    { label: "Forward", icon: Forward, onClick: () => run(() => onForward(message)) },
    { label: pinned ? "Unpin" : "Pin", icon: pinned ? PinOff : Pin, onClick: () => run(() => onPin(message)) },
    ...(canDelete ? [{ label: "Delete", icon: Trash2, onClick: () => run(() => onDelete(message)) }] : []),
  ];

  return (
    <div id={`msg-${message.id}`} className={`flex gap-3 ${isMine ? "flex-row-reverse" : ""}`}>
      <Avatar src={sender?.avatar} name={sender?.name} size={32} />

      <div className={`flex min-w-0 max-w-[85%] flex-col sm:max-w-[75%] lg:max-w-[70%] ${isMine ? "items-end" : "items-start"}`}>
        <div className={`mb-1 flex flex-wrap items-center gap-x-2 text-[11px] ${isMine ? "flex-row-reverse" : ""}`}>
          <span className="font-semibold text-white">{sender?.name}</span>
          {sender?.role && <span className="text-white/45">{sender.role}</span>}
          <span className="flex items-center gap-1 text-white/45">
            {pinned && <Pin size={10} className="text-red-500" />}
            {formatTime(createdAt)}
          </span>
        </div>

        <div ref={ref} className="relative max-w-full">
          <div
            className={`flex items-start gap-3 rounded-xl border border-white/10 bg-[#1c1c1c] px-3.5 py-2.5 ${
              isMine ? "flex-row-reverse" : ""
            } ${pinned ? "ring-1 ring-red-600/50" : ""}`}
          >
            <div className={`min-w-0 flex-1 ${isMine ? "text-right" : ""}`}>
              {replyTo && !deleted && (
                <div className="mb-2 rounded-md border-l-2 border-red-600 bg-black/30 px-2 py-1 text-left text-[11px] text-white/60">
                  <p className="font-semibold text-red-400">{replyTo.senderName}</p>
                  <p className="line-clamp-2">{replyTo.text}</p>
                </div>
              )}

              {deleted ? (
                <p className="text-[12px] italic text-white/40">This message was deleted</p>
              ) : (
                <>
                  {text && (
                    <p className="whitespace-pre-wrap break-words text-[12.5px] leading-relaxed text-white/90">
                      {renderText(text, mentions)}
                    </p>
                  )}
                  {attachments.length > 0 && (
                    <div className={`mt-2 flex flex-wrap gap-2 ${isMine ? "justify-end" : ""}`}>
                      {attachments.map((a) =>
                        a.type?.startsWith("image") ? (
                          <a key={a.id} href={a.url} target="_blank" rel="noreferrer">
                            <img src={a.url} alt={a.name} className="h-24 w-24 rounded-lg object-cover" />
                          </a>
                        ) : (
                          <a
                            key={a.id}
                            href={a.url}
                            target="_blank"
                            rel="noreferrer"
                            className="flex items-center gap-2 rounded-lg bg-black/30 px-2.5 py-1.5 text-[11px] text-white/80 hover:bg-black/50"
                          >
                            <FileText size={14} />
                            <span className="max-w-[140px] truncate">{a.name}</span>
                          </a>
                        )
                      )}
                    </div>
                  )}
                </>
              )}
            </div>

            {!deleted && (
              <button ref={btnRef} onClick={toggleMenu} aria-label="Message options" className="mt-0.5 shrink-0 text-white/60 hover:text-white">
                <ChevronDown size={16} />
              </button>
            )}
          </div>

          {menu && (
            <div
              className={`absolute z-30 flex flex-col gap-2 ${isMine ? "right-0 items-end" : "left-0 items-start"} ${
                openUp ? "bottom-full mb-2" : "top-full mt-2"
              }`}
            >
              <div className="flex items-center gap-1 rounded-full border border-white/10 bg-[#161616] px-2 py-1.5 shadow-xl">
                {[...QUICK, ...(more ? MORE : [])].map((e) => (
                  <button key={e} onClick={() => run(() => onReact(message, e))} className="px-0.5 text-[16px] transition hover:scale-125">
                    {e}
                  </button>
                ))}
                {!more && (
                  <button onClick={() => setMore(true)} aria-label="More reactions" className="px-1 text-white/70 hover:text-white">
                    <Plus size={14} />
                  </button>
                )}
              </div>

              <div className="w-48 overflow-hidden rounded-xl border border-white/10 bg-[#0f0f0f] py-1 shadow-2xl">
                {items.map(({ label, icon: Icon, onClick }) => (
                  <button
                    key={label}
                    onClick={onClick}
                    className="flex w-full items-center gap-3 px-4 py-2 text-left text-[13px] text-white/90 hover:bg-white/5"
                  >
                    <Icon size={14} className="text-white/60" />
                    {label}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>

        {reactions.length > 0 && (
          <div className="mt-1 flex flex-wrap gap-1">
            {reactions.map((r) => (
              <button
                key={r.emoji}
                onClick={() => onReact(message, r.emoji)}
                className={`flex items-center gap-1 rounded-full border px-1.5 py-0.5 text-[11px] ${
                  r.userIds.includes(myId) ? "border-red-600/60 bg-red-600/15" : "border-white/10 bg-[#1c1c1c]"
                }`}
              >
                {r.emoji}
                <span className="text-white/70">{r.userIds.length}</span>
              </button>
            ))}
          </div>
        )}

        {status === "sending" && (
          <span className="mt-1 flex items-center gap-1 text-[10px] text-white/40"><Clock size={10} /> Sending…</span>
        )}
        {status === "failed" && (
          <button onClick={() => onRetry(message)} className="mt-1 flex items-center gap-1 text-[10px] text-red-400">
            <AlertCircle size={10} /> Failed — tap to retry
          </button>
        )}
      </div>
    </div>
  );
};

export default MessageBubble;