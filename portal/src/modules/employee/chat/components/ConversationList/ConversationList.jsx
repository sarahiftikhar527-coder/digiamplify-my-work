import ConversationItem from "../ConversationItem";
import { scrollbar } from "../../../../../utils/format";

const ConversationList = ({ conversations, activeId, loading, onSelect }) => {
  if (loading) {
    return (
      <div className="mt-2 space-y-3 px-3 py-2">
        {[...Array(5)].map((_, i) => (
          <div key={i} className="flex animate-pulse items-center gap-3">
            <div className="h-9 w-9 rounded-full bg-white/10" />
            <div className="flex-1 space-y-2">
              <div className="h-3 w-2/3 rounded bg-white/10" />
              <div className="h-2.5 w-1/2 rounded bg-white/5" />
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (!conversations.length) {
    return <p className="px-6 py-10 text-center text-[12px] text-white/40">No conversations found.</p>;
  }

  return (
    <div className={`mt-2 min-h-0 flex-1 divide-y divide-white/5 ${scrollbar}`}>
      {conversations.map((c) => (
        <ConversationItem key={c.id} conversation={c} active={c.id === activeId} onClick={() => onSelect(c.id)} />
      ))}
    </div>
  );
};

export default ConversationList;