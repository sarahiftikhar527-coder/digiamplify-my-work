
import { useRef, useState } from "react";
import { ArrowLeft, MoreVertical, Video } from "lucide-react";
import Avatar from "../Avatar";
import useClickOutside from "../../../../../hooks/useClickOutside";

const ChatWindowHeader = ({
  conversation,
  onBack,
  onInfo,
  onVideoCall,
  onClear,
  onExit,
}) => {
  const [open, setOpen] = useState(false);
  const ref = useRef(null);

  useClickOutside(ref, () => setOpen(false), open);

  if (!conversation) {
    return (
      <div className="flex items-center border-b border-white/10 bg-[#262626] px-4 py-4">
        <p className="text-sm text-white/60">Select a conversation</p>
      </div>
    );
  }

  const isGroup = conversation.type === "group";
  const members = Array.isArray(conversation.members)
    ? conversation.members
    : [];

  const online =
    conversation.onlineCount ??
    members.filter((member) => member?.online).length;

  const item =
    "block w-full px-4 py-2.5 text-left text-[13px] text-white/90 transition-colors hover:bg-white/5 focus-visible:bg-white/10 focus-visible:outline-none";

  const handleAction = (callback) => {
    setOpen(false);

    if (typeof callback === "function") {
      callback();
    }
  };

  return (
    <div className="flex items-center gap-3 border-b border-white/10 bg-[#262626] px-3 py-3 sm:px-5">
      <button
        type="button"
        onClick={() => handleAction(onBack)}
        aria-label="Back to conversations"
        className="shrink-0 text-white/70 transition-colors hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/40 lg:hidden"
      >
        <ArrowLeft size={20} />
      </button>

      <button
        type="button"
        onClick={() => handleAction(onInfo)}
        aria-label={isGroup ? "Open group information" : "Open contact information"}
        className="flex min-w-0 flex-1 items-center gap-3 rounded-md text-left focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/40"
      >
        <Avatar
          src={conversation.avatar || conversation.avatarUrl}
          name={conversation.name || "Conversation"}
          group={isGroup}
          online={!isGroup && Boolean(conversation.online)}
        />

        <div className="min-w-0 flex-1">
          <p className="truncate text-[13px] font-medium text-white">
            {conversation.name || (isGroup ? "Group chat" : "Direct message")}
          </p>

          <p className="flex items-center gap-1.5 truncate text-[11px] text-white/50">
            {isGroup ? (
              <>
                <span className="h-1.5 w-1.5 shrink-0 rounded-full bg-green-500" />
                <span>{members.length} Members</span>
                <span>•</span>
                <span>{online} Online</span>
              </>
            ) : conversation.online ? (
              <>
                <span className="h-1.5 w-1.5 shrink-0 rounded-full bg-green-500" />
                <span>Online</span>
              </>
            ) : (
              conversation.subtitle || "Offline"
            )}
          </p>
        </div>
      </button>

      <button
        type="button"
        onClick={() => handleAction(onVideoCall)}
        aria-label="Start video call"
        title="Video call"
        className="shrink-0 rounded-md p-1 text-white/80 transition-colors hover:bg-white/5 hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/40"
      >
        <Video size={18} />
      </button>

      <div ref={ref} className="relative shrink-0">
        <button
          type="button"
          onClick={() => setOpen((current) => !current)}
          aria-label="Conversation options"
          aria-haspopup="menu"
          aria-expanded={open}
          className="rounded-md p-1 text-white/80 transition-colors hover:bg-white/5 hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/40"
        >
          <MoreVertical size={18} />
        </button>

        {open && (
          <div
            role="menu"
            className="absolute right-0 top-full z-30 mt-2 w-44 overflow-hidden rounded-lg border border-white/10 bg-[#111] py-1 shadow-xl"
          >
            <button
              type="button"
              role="menuitem"
              className={item}
              onClick={() => handleAction(onInfo)}
            >
              {isGroup ? "Group info" : "Contact info"}
            </button>

            <button
              type="button"
              role="menuitem"
              className={item}
              onClick={() => handleAction(onClear)}
            >
              Clear chat
            </button>

            {isGroup && (
              <button
                type="button"
                role="menuitem"
                className={`${item} text-red-500 hover:bg-red-500/10 hover:text-red-400`}
                onClick={() => handleAction(onExit)}
              >
                Exit group
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default ChatWindowHeader;
