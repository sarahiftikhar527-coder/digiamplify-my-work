import { useState } from "react";
import { ArrowRight, FileText, Images, Search, Trash2, UserPlus, Users, Video, X, LogOut, Ban } from "lucide-react";
import Avatar from "../Avatar";
import ChatAttachment from "@/components/ChatAttachment/ChatAttachment";
import { scrollbar } from "../../../../../utils/format.js";

const GroupInfoPanel = ({ className = "", conversation, onClose, onVideoCall, onAddMembers, onClear, onExit }) => {
  const [showAllMedia, setShowAllMedia] = useState(false);
  const [searching, setSearching] = useState(false);
  const [memberSearch, setMemberSearch] = useState("");

  const isGroup = conversation.type === "group";
  const members = conversation.members || [];
  const media = conversation.media || [];
  const shownMedia = showAllMedia ? media : media.slice(0, 3);
  const visibleMembers = members.filter((m) => m.name.toLowerCase().includes(memberSearch.toLowerCase()));

  const roundBtn =
    "flex h-8 w-8 items-center justify-center rounded-full border border-white/20 text-white/90 hover:bg-white/10";

  return (
    <aside className={`flex min-h-0 flex-col border-l border-white/10 bg-[#0d0d0d] ${className}`}>
      <div className="flex items-center gap-3 border-b border-white/10 px-4 py-3.5">
        <button onClick={onClose} aria-label="Close" className="text-white/70 hover:text-white"><X size={16} /></button>
        <h3 className="text-[13px] text-white/90">{isGroup ? "Group Info" : "Contact Info"}</h3>
      </div>

      <div className={`min-h-0 flex-1 px-4 py-5 ${scrollbar}`}>
        <div className="flex flex-col items-center text-center">
          <Avatar src={conversation.avatar} name={conversation.name} group={isGroup} size={88} />
          <h4 className="mt-3 text-[16px] font-semibold text-white">{conversation.name}</h4>
          {isGroup ? (
            <p className="mt-1 text-[12px] text-white/60">
              Group . <span className="text-green-500">{members.length} members</span>
            </p>
          ) : (
            <p className="mt-1 text-[12px] text-white/60">{conversation.subtitle}</p>
          )}

          <div className="mt-4 flex items-center gap-3">
            <button onClick={onVideoCall} aria-label="Video call" className={roundBtn}><Video size={14} /></button>
            {isGroup && conversation.canManage && (
              <button onClick={onAddMembers} aria-label="Add members" className={roundBtn}><UserPlus size={14} /></button>
            )}
            {isGroup && (
              <button onClick={() => setSearching((v) => !v)} aria-label="Search members" className={roundBtn}><Search size={14} /></button>
            )}
            <button onClick={onClear} aria-label="Clear chat" className={roundBtn}><Trash2 size={14} /></button>
          </div>
        </div>

        <div className="mt-6">
          <div className="flex items-center justify-between text-[12px] text-white/80">
            <span className="flex items-center gap-2"><Images size={14} /> Media Documents</span>
            <span>{conversation.mediaCount ?? media.length}</span>
          </div>
          {media.length > 0 ? (
            <div className="mt-3 flex items-center gap-2">
              <div className="grid flex-1 grid-cols-3 gap-2">
                {shownMedia.map((a) => (
                  <ChatAttachment
                    key={a.id || a.url}
                    attachment={a}
                    imageClassName="aspect-[4/3] w-full rounded object-cover"
                    fileClassName="flex aspect-[4/3] w-full items-center justify-center rounded bg-white/10 text-white/70"
                  />
                ))}
              </div>
              {media.length > 3 && (
                <button onClick={() => setShowAllMedia((v) => !v)} aria-label="Toggle media" className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-white text-black">
                  <ArrowRight size={14} className={showAllMedia ? "rotate-90" : ""} />
                </button>
              )}
            </div>
          ) : (
            <p className="mt-2 text-[11px] text-white/40">No media shared yet.</p>
          )}
        </div>

        {isGroup && (
          <div className="mt-6">
            <div className="flex items-center justify-between text-[12px] text-white/80">
              <span className="flex items-center gap-2"><Users size={14} /> {members.length} Members</span>
              <button onClick={() => setSearching((v) => !v)} aria-label="Search members"><Search size={14} /></button>
            </div>
            {searching && (
              <input
                autoFocus
                value={memberSearch}
                onChange={(e) => setMemberSearch(e.target.value)}
                placeholder="Search members"
                className="mt-2 w-full rounded-full border border-white/10 bg-[#161616] px-3 py-1.5 text-[12px] text-white outline-none placeholder:text-white/40"
              />
            )}
            <div className="mt-3 space-y-3">
              {visibleMembers.map((m) => (
                <div key={m.id} className="flex items-center gap-3">
                  <Avatar src={m.avatar} name={m.name} size={32} online={m.online} />
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-[12.5px] text-white">{m.name}</p>
                    <p className="truncate text-[11px] text-white/40">{m.about || m.role || ""}</p>
                  </div>
                  {m.isAdmin && <span className="text-[10px] text-white/50">Admin</span>}
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      <div className="space-y-3 border-t border-white/10 px-4 py-4 text-[13px]">
        {isGroup && (
          <button onClick={onExit} className="flex items-center gap-2 text-red-500 hover:text-red-400">
            <LogOut size={14} /> Exit Group
          </button>
        )}
        <button onClick={onClear} className="flex items-center gap-2 text-red-500 hover:text-red-400">
          <Ban size={14} /> Clear Chat
        </button>
      </div>
    </aside>
  );
};

export default GroupInfoPanel;