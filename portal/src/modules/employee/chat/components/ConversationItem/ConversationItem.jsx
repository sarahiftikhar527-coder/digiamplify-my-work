import Avatar from "../Avatar";
import { formatListTime } from "../../../../../utils/format";

const ConversationItem = ({ conversation, active, onClick }) => {
  const { name, avatar, type, lastMessage, unreadCount, online } = conversation;
  return (
    <button
      onClick={onClick}
      className={`flex w-full items-center gap-3 px-3 py-3 text-left transition ${
        active ? "bg-white/[0.06]" : "hover:bg-white/[0.03]"
      }`}
    >
      <Avatar src={avatar} name={name} group={type === "group"} online={online} />
      <div className="min-w-0 flex-1">
        <div className="flex items-center justify-between gap-2">
          <span className="truncate text-[13px] font-medium text-white">{name}</span>
          <span className="shrink-0 text-[11px] text-white/40">{formatListTime(lastMessage?.createdAt)}</span>
        </div>
        <div className="mt-0.5 flex items-center justify-between gap-2">
          <span className="truncate text-[12px] text-white/40">{lastMessage?.text || "No messages yet"}</span>
          {unreadCount > 0 && (
            <span className="flex h-4 min-w-[16px] items-center justify-center rounded-full bg-red-600 px-1 text-[10px] font-semibold text-white">
              {unreadCount > 99 ? "99+" : unreadCount}
            </span>
          )}
        </div>
      </div>
    </button>
  );
};

export default ConversationItem;