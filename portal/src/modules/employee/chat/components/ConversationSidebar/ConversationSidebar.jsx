import { Plus } from "lucide-react";
import SearchConversation from "../SearchConversation";
import ConversationTabs from "../ConversationTabs";
import ConversationList from "../ConversationList";

const ConversationSidebar = ({
  className = "", conversations, activeId, loading,
  search, onSearch, tab, onTab, onSelect, onNew,
}) => (
  <aside className={`flex min-h-0 flex-col border-r border-white/10 bg-[#0d0d0d] ${className}`}>
    <div className="flex items-center justify-between border-b border-white/10 px-4 py-3.5">
      <h3 className="text-[14px] font-medium text-white">New Message</h3>
      <button
        onClick={onNew}
        aria-label="New message"
        className="flex h-5 w-5 items-center justify-center rounded-full bg-red-600 text-white hover:bg-red-500"
      >
        <Plus size={12} strokeWidth={3} />
      </button>
    </div>
    <div className="px-4 pt-3">
      <SearchConversation value={search} onChange={onSearch} />
    </div>
    <ConversationTabs value={tab} onChange={onTab} />
    <ConversationList conversations={conversations} activeId={activeId} loading={loading} onSelect={onSelect} />
  </aside>
);

export default ConversationSidebar;