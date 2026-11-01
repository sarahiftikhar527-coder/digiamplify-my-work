
import ConversationItem from "../ConversationItem";
import { scrollbar } from "../../../../../utils/format";

const ConversationList = ({
  conversations = [],
  activeId,
  loading = false,
  onSelect,
}) => {
  const conversationList = Array.isArray(conversations)
    ? conversations
    : [];

  if (loading) {
    return (
      <div
        className="mt-2 space-y-4 px-3 py-2"
        aria-label="Loading conversations"
        role="status"
      >
        {[...Array(5)].map((_, index) => (
          <div
            key={index}
            className="flex animate-pulse items-center gap-3"
          >
            <div className="h-9 w-9 shrink-0 rounded-full bg-white/10" />

            <div className="min-w-0 flex-1 space-y-2">
              <div className="h-3 w-2/3 rounded bg-white/10" />
              <div className="h-2.5 w-1/2 rounded bg-white/5" />
            </div>
          </div>
        ))}

        <span className="sr-only">Loading conversations...</span>
      </div>
    );
  }

  if (conversationList.length === 0) {
    return (
      <div className="px-6 py-10 text-center">
        <p className="text-[13px] font-medium text-white/60">
          No conversations found
        </p>

        <p className="mt-1 text-[12px] text-white/35">
          Start a new conversation to chat with your team.
        </p>
      </div>
    );
  }

  return (
    <div
      className={`mt-2 min-h-0 flex-1 divide-y divide-white/5 overflow-y-auto ${scrollbar}`}
      role="list"
      aria-label="Conversations"
    >
      {conversationList.map((conversation) => {
        const conversationId =
          conversation?.id || conversation?._id?.toString();

        if (!conversationId) {
          return null;
        }

        return (
          <div key={conversationId} role="listitem">
            <ConversationItem
              conversation={{
                ...conversation,
                id: conversationId,
              }}
              active={String(conversationId) === String(activeId)}
              onClick={() => {
                if (typeof onSelect === "function") {
                  onSelect(conversationId);
                }
              }}
            />
          </div>
        );
      })}
    </div>
  );
};

export default ConversationList;
