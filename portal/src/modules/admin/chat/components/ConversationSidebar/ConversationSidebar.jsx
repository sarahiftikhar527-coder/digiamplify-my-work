
import { Plus } from "lucide-react";
import SearchConversation from "../SearchConversation";
import ConversationTabs from "../ConversationTabs";
import ConversationList from "../ConversationList";

const ConversationSidebar = ({
  className = "",
  conversations = [],
  activeId = null,
  loading = false,
  search = "",
  onSearch,
  tab = "all",
  onTab,
  onSelect,
  onNew,
}) => {
  return (
    <aside
      className={`flex min-h-0 flex-col overflow-hidden border-r border-white/10 bg-[#0d0d0d] ${className}`}
      aria-label="Chat conversations"
    >
      <div className="flex shrink-0 items-center justify-between border-b border-white/10 px-4 py-3.5">
        <h3 className="text-[14px] font-medium text-white">
          New Message
        </h3>

        <button
          type="button"
          onClick={() => {
            if (typeof onNew === "function") {
              onNew();
            }
          }}
          aria-label="Start a new conversation"
          title="New message"
          className="flex h-7 w-7 items-center justify-center rounded-full bg-red-600 text-white transition-colors hover:bg-red-500 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-400 focus-visible:ring-offset-2 focus-visible:ring-offset-[#0d0d0d]"
        >
          <Plus size={14} strokeWidth={3} />
        </button>
      </div>

      <div className="shrink-0 px-4 pt-3">
        <SearchConversation
          value={search}
          onChange={(value) => {
            if (typeof onSearch === "function") {
              onSearch(value);
            }
          }}
        />
      </div>

      <div className="shrink-0">
        <ConversationTabs
          value={tab}
          onChange={(value) => {
            if (typeof onTab === "function") {
              onTab(value);
            }
          }}
        />
      </div>

      <ConversationList
        conversations={conversations}
        activeId={activeId}
        loading={loading}
        onSelect={onSelect}
      />
    </aside>
  );
};

export default ConversationSidebar;
