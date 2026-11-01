
import { useRef, useState } from "react";
import {
  AlertCircle,
  ChevronDown,
  Clock,
  FileText,
  Forward,
  Pin,
  PinOff,
  Reply,
  Smile,
  Trash2,
  User,
  Plus,
} from "lucide-react";
import Avatar from "../Avatar";
import useClickOutside from "../../../../../hooks/useClickOutside";
import { formatTime } from "../../../../../utils/format";

const QUICK = ["👍", "❤️", "🤣", "😢", "🙏"];
const MORE = ["😀", "😮", "🔥", "🎉", "👏", "✅"];

const escapeRe = (value) =>
  value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

const renderText = (text, mentions = []) => {
  if (typeof text !== "string" || !text) {
    return text || null;
  }

  const names = mentions
    .map((mention) => mention?.name)
    .filter(Boolean)
    .sort((a, b) => b.length - a.length);

  if (!names.length) {
    return text;
  }

  const uniqueNames = [...new Set(names)];
  const pattern = uniqueNames.map(escapeRe).join("|");
  const regex = new RegExp(`(@(?:${pattern}))`, "g");

  return text.split(regex).map((part, index) => {
    const isMention = uniqueNames.some((name) => part === `@${name}`);

    return isMention ? (
      <span key={index} className="font-semibold text-red-400">
        {part}
      </span>
    ) : (
      part
    );
  });
};

const MessageBubble = ({
  message,
  isMine = false,
  isGroup = false,
  myId,
  canDelete = false,
  onReply,
  onReplyPrivately,
  onReact,
  onForward,
  onPin,
  onDelete,
  onRetry,
}) => {
  const [menu, setMenu] = useState(false);
  const [more, setMore] = useState(false);
  const [openUp, setOpenUp] = useState(false);

  const ref = useRef(null);
  const btnRef = useRef(null);

  useClickOutside(
    ref,
    () => {
      setMenu(false);
      setMore(false);
    },
    menu
  );

  if (!message) {
    return null;
  }

  const sender = message.sender || {};
  const text = message.text || "";
  const createdAt = message.createdAt;
  const replyTo = message.replyTo;
  const reactions = Array.isArray(message.reactions)
    ? message.reactions
    : [];
  const pinned = Boolean(message.pinned);
  const deleted = Boolean(message.deleted);
  const attachments = Array.isArray(message.attachments)
    ? message.attachments
    : [];
  const status = message.status;
  const mentions = Array.isArray(message.mentions)
    ? message.mentions
    : [];

  const messageId = message.id || message._id;

  const toggleMenu = () => {
    if (!menu && btnRef.current) {
      const rect = btnRef.current.getBoundingClientRect();
      setOpenUp(window.innerHeight - rect.bottom < 320);
    }

    setMenu((previous) => !previous);
    setMore(false);
  };

  const run = (callback, ...args) => {
    setMenu(false);
    setMore(false);

    if (typeof callback === "function") {
      callback(...args);
    }
  };

  const items = [
    {
      label: "Reply",
      icon: Reply,
      onClick: () => run(onReply, message),
    },
    ...(!isMine && isGroup
      ? [
          {
            label: "Reply Privately",
            icon: User,
            onClick: () => run(onReplyPrivately, message),
          },
        ]
      : []),
    {
      label: "React",
      icon: Smile,
      onClick: () => setMore((previous) => !previous),
    },
    {
      label: "Forward",
      icon: Forward,
      onClick: () => run(onForward, message),
    },
    {
      label: pinned ? "Unpin" : "Pin",
      icon: pinned ? PinOff : Pin,
      onClick: () => run(onPin, message),
    },
    ...(canDelete
      ? [
          {
            label: "Delete",
            icon: Trash2,
            onClick: () => run(onDelete, message),
          },
        ]
      : []),
  ];

  const normalizedMyId = myId == null ? "" : String(myId);

  return (
    <div
      id={messageId ? `msg-${messageId}` : undefined}
      className={`flex min-w-0 gap-3 ${
        isMine ? "flex-row-reverse" : ""
      }`}
    >
      <Avatar
        src={sender.avatar || sender.avatarUrl}
        name={sender.name || "User"}
        size={32}
      />

      <div
        className={`flex min-w-0 max-w-[85%] flex-col sm:max-w-[75%] lg:max-w-[70%] ${
          isMine ? "items-end" : "items-start"
        }`}
      >
        <div
          className={`mb-1 flex flex-wrap items-center gap-x-2 text-[11px] ${
            isMine ? "flex-row-reverse" : ""
          }`}
        >
          <span className="font-semibold text-white">
            {sender.name || "User"}
          </span>

          {sender.role && (
            <span className="text-white/45">{sender.role}</span>
          )}

          <span className="flex items-center gap-1 text-white/45">
            {pinned && <Pin size={10} className="text-red-500" />}
            {createdAt ? formatTime(createdAt) : ""}
          </span>
        </div>

        <div ref={ref} className="relative min-w-0 max-w-full">
          <div
            className={`flex max-w-full items-start gap-3 rounded-xl border border-white/10 bg-[#1c1c1c] px-3.5 py-2.5 ${
              isMine ? "flex-row-reverse" : ""
            } ${pinned ? "ring-1 ring-red-600/50" : ""}`}
          >
            <div
              className={`min-w-0 flex-1 ${
                isMine ? "text-right" : ""
              }`}
            >
              {replyTo && !deleted && (
                <div className="mb-2 rounded-md border-l-2 border-red-600 bg-black/30 px-2 py-1 text-left text-[11px] text-white/60">
                  <p className="font-semibold text-red-400">
                    {replyTo.senderName ||
                      replyTo.sender?.name ||
                      "Replied message"}
                  </p>

                  <p className="line-clamp-2 break-words">
                    {replyTo.text || "Attachment"}
                  </p>
                </div>
              )}

              {deleted ? (
                <p className="text-[12px] italic text-white/40">
                  This message was deleted
                </p>
              ) : (
                <>
                  {text && (
                    <p className="whitespace-pre-wrap break-words text-[12.5px] leading-relaxed text-white/90">
                      {renderText(text, mentions)}
                    </p>
                  )}

                  {attachments.length > 0 && (
                    <div
                      className={`mt-2 flex flex-wrap gap-2 ${
                        isMine ? "justify-end" : ""
                      }`}
                    >
                      {attachments.map((attachment, index) => {
                        const attachmentId =
                          attachment.id ||
                          attachment._id ||
                          attachment.url ||
                          `attachment-${index}`;

                        const attachmentUrl =
                          attachment.url ||
                          attachment.secureUrl ||
                          "";

                        const attachmentName =
                          attachment.name ||
                          attachment.originalName ||
                          "Attachment";

                        const attachmentType =
                          attachment.type ||
                          attachment.mimeType ||
                          attachment.mimetype ||
                          "";

                        if (!attachmentUrl) {
                          return (
                            <div
                              key={attachmentId}
                              className="flex items-center gap-2 rounded-lg bg-black/30 px-2.5 py-1.5 text-[11px] text-white/60"
                            >
                              <FileText size={14} />
                              <span className="max-w-[140px] truncate">
                                {attachmentName}
                              </span>
                            </div>
                          );
                        }

                        if (attachmentType.startsWith("image/")) {
                          return (
                            <a
                              key={attachmentId}
                              href={attachmentUrl}
                              target="_blank"
                              rel="noreferrer"
                              className="block overflow-hidden rounded-lg"
                            >
                              <img
                                src={attachmentUrl}
                                alt={attachmentName}
                                loading="lazy"
                                className="h-24 w-24 rounded-lg object-cover"
                              />
                            </a>
                          );
                        }

                        return (
                          <a
                            key={attachmentId}
                            href={attachmentUrl}
                            target="_blank"
                            rel="noreferrer"
                            className="flex items-center gap-2 rounded-lg bg-black/30 px-2.5 py-1.5 text-[11px] text-white/80 transition-colors hover:bg-black/50"
                          >
                            <FileText size={14} />
                            <span className="max-w-[140px] truncate">
                              {attachmentName}
                            </span>
                          </a>
                        );
                      })}
                    </div>
                  )}
                </>
              )}
            </div>

            {!deleted && (
              <button
                ref={btnRef}
                type="button"
                onClick={toggleMenu}
                aria-label="Message options"
                aria-haspopup="menu"
                aria-expanded={menu}
                className="mt-0.5 shrink-0 rounded p-0.5 text-white/60 transition-colors hover:bg-white/5 hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/30"
              >
                <ChevronDown size={16} />
              </button>
            )}
          </div>

          {menu && (
            <div
              className={`absolute z-30 flex flex-col gap-2 ${
                isMine ? "right-0 items-end" : "left-0 items-start"
              } ${openUp ? "bottom-full mb-2" : "top-full mt-2"}`}
            >
              <div className="flex max-w-[min(90vw,320px)] flex-wrap items-center gap-1 rounded-full border border-white/10 bg-[#161616] px-2 py-1.5 shadow-xl">
                {[...QUICK, ...(more ? MORE : [])].map((emoji) => (
                  <button
                    key={emoji}
                    type="button"
                    onClick={() => run(onReact, message, emoji)}
                    aria-label={`React with ${emoji}`}
                    className="px-0.5 text-[16px] transition-transform hover:scale-125"
                  >
                    {emoji}
                  </button>
                ))}

                {!more && (
                  <button
                    type="button"
                    onClick={() => setMore(true)}
                    aria-label="More reactions"
                    className="px-1 text-white/70 hover:text-white"
                  >
                    <Plus size={14} />
                  </button>
                )}
              </div>

              <div
                role="menu"
                className="w-48 overflow-hidden rounded-xl border border-white/10 bg-[#0f0f0f] py-1 shadow-2xl"
              >
                {items.map(({ label, icon: Icon, onClick }) => (
                  <button
                    key={label}
                    type="button"
                    role="menuitem"
                    onClick={onClick}
                    className="flex w-full items-center gap-3 px-4 py-2 text-left text-[13px] text-white/90 transition-colors hover:bg-white/5"
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
            {reactions.map((reaction, index) => {
              const userIds = Array.isArray(reaction.userIds)
                ? reaction.userIds.map(String)
                : [];

              const hasReacted =
                normalizedMyId !== "" &&
                userIds.includes(normalizedMyId);

              return (
                <button
                  key={`${reaction.emoji}-${index}`}
                  type="button"
                  onClick={() => {
                    if (typeof onReact === "function") {
                      onReact(message, reaction.emoji);
                    }
                  }}
                  aria-label={`${reaction.emoji}, ${userIds.length} reactions`}
                  className={`flex items-center gap-1 rounded-full border px-1.5 py-0.5 text-[11px] transition-colors ${
                    hasReacted
                      ? "border-red-600/60 bg-red-600/15"
                      : "border-white/10 bg-[#1c1c1c]"
                  }`}
                >
                  {reaction.emoji}
                  <span className="text-white/70">{userIds.length}</span>
                </button>
              );
            })}
          </div>
        )}

        {status === "sending" && (
          <span className="mt-1 flex items-center gap-1 text-[10px] text-white/40">
            <Clock size={10} />
            Sending…
          </span>
        )}

        {status === "failed" && (
          <button
            type="button"
            onClick={() => {
              if (typeof onRetry === "function") {
                onRetry(message);
              }
            }}
            className="mt-1 flex items-center gap-1 text-[10px] text-red-400 hover:text-red-300"
          >
            <AlertCircle size={10} />
            Failed — tap to retry
          </button>
        )}
      </div>
    </div>
  );
};

export default MessageBubble;
