
import { useCallback, useEffect, useState } from "react";
import { MessageSquare } from "lucide-react";
import useChat from "../../../../../hooks/useChat";
import {
  ChatWindowHeader,
  ConversationSidebar,
  ForwardModal,
  GroupInfoPanel,
  MessageInput,
  MessageList,
  NewMessageModal,
} from "../../components";

const getErrorMessage = (
  error,
  fallback = "Something went wrong. Please try again."
) => error?.message || fallback;

const getConversationId = (conversation) =>
  String(conversation?.id || conversation?._id || "");

const getMemberId = (member) => {
  const user = member?.user || member;
  return String(user?.id || user?._id || "");
};

const AdminChatPage = () => {
  const chat = useChat();

  const { activeConversation: conv, me, myId } = chat;

  const conversationId = getConversationId(conv);

  const [mobileChatOpen, setMobileChatOpen] = useState(false);
  const [infoOpen, setInfoOpen] = useState(false);
  const [modal, setModal] = useState(null);
  const [forwardMsg, setForwardMsg] = useState(null);
  const [notice, setNotice] = useState("");
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (!notice) return undefined;

    const timer = setTimeout(() => setNotice(""), 3000);

    return () => clearTimeout(timer);
  }, [notice]);

  const showNotice = useCallback((message) => {
    setNotice(message);
  }, []);

  const runSafely = useCallback(
    (fn, successMessage) =>
      async (...args) => {
        try {
          const result = await fn(...args);

          if (successMessage) {
            showNotice(successMessage);
          }

          return result;
        } catch (error) {
          chat.setError(getErrorMessage(error));
          return undefined;
        }
      },
    [chat.setError, showNotice]
  );

  const selectConversation = useCallback(
    (id) => {
      if (!id) return;

      setInfoOpen(false);
      setMobileChatOpen(true);
      chat.openConversation(id);
    },
    [chat.openConversation]
  );

  const handleClear = runSafely(async () => {
    if (!conversationId) return;

    if (!window.confirm("Clear all messages in this chat?")) {
      return;
    }

    await chat.clearChat(conversationId);
    showNotice("Chat cleared successfully.");
  });

  const handleExit = runSafely(async () => {
    if (!conv || !conversationId) return;

    if (!window.confirm(`Exit "${conv.name || "this group"}"?`)) {
      return;
    }

    await chat.exitGroup(conversationId);

    setInfoOpen(false);
    setMobileChatOpen(false);

    showNotice("You left the group.");
  });

  const handleReplyPrivately = runSafely(async (message) => {
    await chat.replyPrivately(message);
    setMobileChatOpen(true);
  });

  const handleReact = runSafely(chat.reactToMessage);
  const handlePin = runSafely(chat.pinMessage);
  const handleDelete = runSafely(chat.deleteMessage);
  const handleRetry = runSafely(chat.retryMessage);

  const handleForward = runSafely(
    async (message, conversationIds) => {
      await chat.forwardMessage(message, conversationIds);
      setForwardMsg(null);
      showNotice("Message forwarded successfully.");
    }
  );

  const handleCreateOrAddMembers = async (payload) => {
    if (submitting) return;

    setSubmitting(true);
    chat.setError("");

    try {
      if (modal === "add") {
        if (!conversationId) {
          throw new Error("Please select a group first.");
        }

        await chat.addMembers(conversationId, payload.memberIds);

        showNotice("Members added successfully.");
      } else {
        await chat.createConversation(payload);
        setMobileChatOpen(true);
        showNotice("Conversation created successfully.");
      }

      setModal(null);
      setInfoOpen(false);
    } catch (error) {
      chat.setError(
        getErrorMessage(error, "Unable to complete this action.")
      );
    } finally {
      setSubmitting(false);
    }
  };

  const handleReload = async () => {
    chat.setError("");

    try {
      await chat.reload();
    } catch (error) {
      chat.setError(
        getErrorMessage(error, "Unable to reload conversations.")
      );
    }
  };

  const handleVideoCall = () => {
    showNotice(
      "Video calling will be available once the calling service is connected."
    );
  };

  const handleSendMessage = async (payload = {}) => {
    if (!conversationId) {
      throw new Error("Please select a conversation first.");
    }

    return chat.sendMessage({
      text: payload.text || "",
      mentions: payload.mentions || [],
      files: Array.from(payload.files || []),
      replyTo: payload.replyTo || null,
    });
  };

  const actions = {
    onReply: chat.setReplyTo,
    onReplyPrivately: handleReplyPrivately,
    onReact: handleReact,
    onForward: setForwardMsg,
    onPin: handlePin,
    onDelete: handleDelete,
    onRetry: handleRetry,
  };

  const isAdminUser =
    String(me?.role || "").toLowerCase() === "admin";

  const excludeMemberIds = (conv?.members || [])
    .map(getMemberId)
    .filter(Boolean);

  const conversations = Array.isArray(chat.conversations)
    ? chat.conversations
    : [];

  const filteredConversations = Array.isArray(
    chat.filteredConversations
  )
    ? chat.filteredConversations
    : [];

  return (
    <div className="w-full">
      {chat.error && (
        <div
          role="alert"
          className="mb-3 flex items-center justify-between gap-3 rounded-lg border border-red-600/40 bg-red-600/10 px-4 py-3 text-[12px] text-red-300"
        >
          <span className="min-w-0 flex-1 break-words">
            {chat.error}
          </span>

          <div className="flex shrink-0 items-center gap-3">
            <button
              type="button"
              onClick={handleReload}
              className="font-semibold hover:text-white"
            >
              Retry
            </button>

            <button
              type="button"
              onClick={() => chat.setError("")}
              className="hover:text-white"
            >
              Dismiss
            </button>
          </div>
        </div>
      )}

      <div className="relative flex h-[calc(100dvh-210px)] min-h-[520px] overflow-hidden rounded-lg border border-white/10 bg-[#0d0d0d]">
        <ConversationSidebar
          className={`${
            mobileChatOpen ? "hidden" : "flex"
          } w-full lg:flex lg:w-[290px] lg:shrink-0 xl:w-[320px]`}
          conversations={filteredConversations}
          activeId={chat.activeId}
          loading={chat.loading}
          search={chat.search}
          onSearch={chat.setSearch}
          tab={chat.tab}
          onTab={chat.setTab}
          onSelect={selectConversation}
          onNew={() => setModal("new")}
        />

        <section
          className={`${
            mobileChatOpen ? "flex" : "hidden"
          } min-w-0 flex-1 flex-col lg:flex`}
        >
          {conv ? (
            <>
              <ChatWindowHeader
                conversation={conv}
                onBack={() => setMobileChatOpen(false)}
                onInfo={() => setInfoOpen(true)}
                onVideoCall={handleVideoCall}
                onClear={handleClear}
                onExit={handleExit}
              />

              <MessageList
                key={conversationId}
                messages={chat.messages}
                loading={chat.messagesLoading}
                myId={myId}
                isGroup={conv.type === "group"}
                canDeleteAny={isAdminUser}
                actions={actions}
              />

              <MessageInput
                key={`input-${conversationId}`}
                me={me}
                myId={myId}
                members={conv.members || []}
                isGroup={conv.type === "group"}
                replyTo={chat.replyTo}
                onCancelReply={() => chat.setReplyTo(null)}
                onSend={handleSendMessage}
                disabled={!conversationId}
              />
            </>
          ) : (
            <div className="flex flex-1 flex-col items-center justify-center gap-3 bg-[#141414] px-5 text-center text-white/40">
              <MessageSquare size={40} strokeWidth={1.5} />

              <p className="text-[13px]">
                {chat.loading
                  ? "Loading conversations..."
                  : "Select a conversation to start chatting"}
              </p>

              {!chat.loading && conversations.length === 0 && (
                <button
                  type="button"
                  onClick={() => setModal("new")}
                  className="rounded-lg border border-white/10 px-4 py-2 text-xs text-white/80 transition hover:bg-white/5 hover:text-white"
                >
                  Start a conversation
                </button>
              )}
            </div>
          )}
        </section>

        {conv && infoOpen && (
          <>
            <button
              type="button"
              aria-label="Close conversation information"
              className="fixed inset-0 z-30 cursor-default bg-black/60 xl:hidden"
              onClick={() => setInfoOpen(false)}
            />

            <GroupInfoPanel
              className="fixed inset-y-0 right-0 z-40 w-[300px] max-w-[85vw] xl:static xl:z-auto xl:w-[290px] xl:max-w-none xl:shrink-0"
              conversation={conv}
              onClose={() => setInfoOpen(false)}
              onVideoCall={handleVideoCall}
              onAddMembers={() => setModal("add")}
              onClear={handleClear}
              onExit={handleExit}
            />
          </>
        )}
      </div>

      {modal && (
        <NewMessageModal
          mode={modal}
          myId={myId}
          excludeIds={modal === "add" ? excludeMemberIds : []}
          onClose={() => {
            if (!submitting) {
              setModal(null);
            }
          }}
          onSubmit={handleCreateOrAddMembers}
        />
      )}

      {forwardMsg && (
        <ForwardModal
          message={forwardMsg}
          conversations={conversations}
          onClose={() => setForwardMsg(null)}
          onForward={handleForward}
        />
      )}

      {notice && (
        <div
          role="status"
          className="fixed bottom-6 left-1/2 z-50 -translate-x-1/2 rounded-full border border-white/10 bg-[#1a1a1a] px-4 py-2 text-center text-[12px] text-white shadow-xl"
        >
          {notice}
        </div>
      )}
    </div>
  );
};

export default AdminChatPage;
