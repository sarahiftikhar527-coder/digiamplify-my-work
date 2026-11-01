import { useRef, useState } from "react";
import { ArrowLeft, MoreVertical, Video } from "lucide-react";
import Avatar from "../Avatar";
import useClickOutside from "../../../../../hooks/useClickOutside";

const ChatWindowHeader = ({ conversation, onBack, onInfo, onVideoCall, onClear, onExit }) => {
  const [open, setOpen] = useState(false);
  const ref = useRef(null);
  useClickOutside(ref, () => setOpen(false), open);

  const isGroup = conversation.type === "group";
  const members = conversation.members || [];
  const online = conversation.onlineCount ?? members.filter((m) => m.online).length;
  const item = "block w-full px-4 py-2 text-left text-[13px] text-white/90 hover:bg-white/5";

  return (
    <div className="flex items-center gap-3 border-b border-white/10 bg-[#262626] px-3 py-3 sm:px-5">
      <button onClick={onBack} aria-label="Back" className="text-white/70 hover:text-white lg:hidden">
        <ArrowLeft size={20} />
      </button>

      <button onClick={onInfo} className="flex min-w-0 flex-1 items-center gap-3 text-left">
        <Avatar src={conversation.avatar} name={conversation.name} group={isGroup} online={!isGroup && conversation.online} />
        <div className="min-w-0">
          <p className="truncate text-[13px] font-medium text-white">{conversation.name}</p>
          <p className="flex items-center gap-1.5 truncate text-[11px] text-white/50">
            {isGroup ? (
              <>
                <span className="h-1.5 w-1.5 rounded-full bg-green-500" />
                {members.length} Members <span>•</span> {online} Online
              </>
            ) : conversation.online ? (
              <>
                <span className="h-1.5 w-1.5 rounded-full bg-green-500" /> Online
              </>
            ) : (
              conversation.subtitle || "Offline"
            )}
          </p>
        </div>
      </button>

      <button onClick={onVideoCall} aria-label="Video call" className="text-white/80 hover:text-white">
        <Video size={18} />
      </button>

      <div ref={ref} className="relative">
        <button onClick={() => setOpen((v) => !v)} aria-label="More" className="text-white/80 hover:text-white">
          <MoreVertical size={18} />
        </button>
        {open && (
          <div className="absolute right-0 top-full z-30 mt-2 w-44 overflow-hidden rounded-lg border border-white/10 bg-[#111] py-1 shadow-xl">
            <button className={item} onClick={() => { setOpen(false); onInfo(); }}>
              {isGroup ? "Group info" : "Contact info"}
            </button>
            <button className={item} onClick={() => { setOpen(false); onClear(); }}>Clear chat</button>
            {isGroup && (
              <button className={`${item} !text-red-500`} onClick={() => { setOpen(false); onExit(); }}>
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