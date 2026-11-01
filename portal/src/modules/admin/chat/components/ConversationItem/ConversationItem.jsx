
import Avatar from "../Avatar";
import { formatListTime } from "../../../../../utils/format";

const ConversationItem = ({ conversation, active, onClick }) => {
  if (!conversation) {
    return null;
  }

  const name = conversation.name || "Conversation";
  const avatar = conversation.avatar || conversation.avatarUrl || "";
  const type = conversation.type || "direct";
  const lastMessage = conversation.lastMessage || null;
  const unreadCount = Math.max(0, Number(conversation.unreadCount) || 0);
  const online = Boolean(conversation.online);
  const messageText =
    lastMessage?.text?.trim() ||
    (lastMessage?.attachments?.length ? "Attachment" : "No messages yet");

  const lastMessageTime = lastMessage?.createdAt
    ? formatListTime(lastMessage.createdAt)
    : "";

  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={Boolean(active)}
      aria-label={`${name}${unreadCount > 0 ? `, ${unreadCount} unread messages` : ""}`}
      className={`flex w-full items-center gap-3 px-3 py-3 text-left transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-white/30 ${
        active ? "bg-white/[0.06]" : "hover:bg-white/[0.03]"
      }`}
    >
      <Avatar
        src={avatar}
        name={name}
        group={type === "group"}
        online={online}
      />

      <div className="min-w-0 flex-1">
        <div className="flex items-center justify-between gap-2">
          <span className="truncate text-[13px] font-medium text-white">
            {name}
          </span>

          {lastMessageTime && (
            <span className="shrink-0 text-[11px] text-white/40">
              {lastMessageTime}
            </span>
          )}
        </div>

        <div className="mt-0.5 flex items-center justify-between gap-2">
          <span className="min-w-0 flex-1 truncate text-[12px] text-white/40">
            {messageText}
          </span>

          {unreadCount > 0 && (
            <span className="flex h-4 min-w-[16px] shrink-0 items-center justify-center rounded-full bg-red-600 px-1 text-[10px] font-semibold text-white">
              {unreadCount > 99 ? "99+" : unreadCount}
            </span>
          )}
        </div>
      </div>
    </button>
  );
};

export default ConversationItem;
