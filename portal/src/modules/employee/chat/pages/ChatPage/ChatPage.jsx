import { useEffect, useState } from "react";
import { MessageSquare } from "lucide-react";
import useChat from "../../../../../hooks/useChat";
import {
  ChatHeader, ChatWindowHeader, ConversationSidebar, ForwardModal,
  GroupInfoPanel, MessageInput, MessageList, NewMessageModal,
} from "../../components";

const ChatPage = () => {
  const chat = useChat();
  const { activeConversation: conv, me, myId } = chat;

  const [mobileChatOpen, setMobileChatOpen] = useState(false);
  const [infoOpen, setInfoOpen] = useState(false);
  const [modal, setModal] = useState(null); // "new" | "add" | null
  const [forwardMsg, setForwardMsg] = useState(null);
  const [notice, setNotice] = useState("");

  useEffect(() => {
    if (!notice) return;
    const t = setTimeout(() => setNotice(""), 3000);
    return () => clearTimeout(t);
  }, [notice]);

  const guard = (fn) => async (...args) => {
    try {
      await fn(...args);
    } catch (e) {
      chat.setError(e.message);
    }
  };

  const select = (id) => {
    chat.openConversation(id);
    setMobileChatOpen(true);
  };

  const handleClear = guard(async () => {
    if (conv && window.confirm("Clear all messages in this chat?")) await chat.clearChat(conv.id);
  });

  const handleExit = guard(async () => {
    if (conv && window.confirm(`Exit "${conv.name}"?`)) {
      await chat.exitGroup(conv.id);
      setInfoOpen(false);
      setMobileChatOpen(false);
    }
  });

  const videoCall = () => setNotice("Video call will be available once the calling service is connected.");

  const actions = {
    onReply: chat.setReplyTo,
    onReplyPrivately: guard(async (m) => {
      await chat.replyPrivately(m);
      setMobileChatOpen(true);
    }),
    onReact: chat.reactToMessage,
    onForward: setForwardMsg,
    onPin: chat.pinMessage,
    onDelete: chat.deleteMessage,
    onRetry: chat.retryMessage,
  };

  const isAdminUser = me?.role?.toLowerCase?.() === "admin";

  return (
    <div className="w-full">
   

      {chat.error && (
        <div className="mb-3 flex items-center justify-between gap-3 rounded-lg border border-red-600/40 bg-red-600/10 px-4 py-2 text-[12px] text-red-300">
          <span className="truncate">{chat.error}</span>
          <div className="flex shrink-0 gap-3">
            <button onClick={() => { chat.setError(""); chat.reload(); }} className="font-semibold hover:text-white">Retry</button>
            <button onClick={() => chat.setError("")} className="hover:text-white">Dismiss</button>
          </div>
        </div>
      )}

      <div className="relative flex h-[calc(100dvh-210px)] min-h-[520px] overflow-hidden rounded-lg border border-white/10 bg-[#0d0d0d]">
        <ConversationSidebar
          className={`${mobileChatOpen ? "hidden" : "flex"} w-full lg:flex lg:w-[290px] lg:shrink-0 xl:w-[320px]`}
          conversations={chat.filteredConversations}
          activeId={chat.activeId}
          loading={chat.loading}
          search={chat.search}
          onSearch={chat.setSearch}
          tab={chat.tab}
          onTab={chat.setTab}
          onSelect={select}
          onNew={() => setModal("new")}
        />

        <section className={`${mobileChatOpen ? "flex" : "hidden"} min-w-0 flex-1 flex-col lg:flex`}>
          {conv ? (
            <>
              <ChatWindowHeader
                conversation={conv}
                onBack={() => setMobileChatOpen(false)}
                onInfo={() => setInfoOpen(true)}
                onVideoCall={videoCall}
                onClear={handleClear}
                onExit={handleExit}
              />
              <MessageList
                key={conv.id}
                messages={chat.messages}
                loading={chat.messagesLoading}
                myId={myId}
                isGroup={conv.type === "group"}
                canDeleteAny={isAdminUser}
                actions={actions}
              />
              <MessageInput
                key={conv.id}
                me={me}
                myId={myId}
                members={conv.members}
                isGroup={conv.type === "group"}
                replyTo={chat.replyTo}
                onCancelReply={() => chat.setReplyTo(null)}
                onSend={chat.sendMessage}
              />
            </>
          ) : (
            <div className="flex flex-1 flex-col items-center justify-center gap-2 bg-[#141414] text-white/40">
              <MessageSquare size={40} />
              <p className="text-[13px]">{chat.loading ? "Loading chats..." : "Select a conversation to start chatting"}</p>
            </div>
          )}
        </section>

        {conv && infoOpen && (
          <>
            <div className="fixed inset-0 z-30 bg-black/60 xl:hidden" onClick={() => setInfoOpen(false)} />
            <GroupInfoPanel
              className="fixed inset-y-0 right-0 z-40 w-[300px] max-w-[85vw] xl:static xl:z-auto xl:w-[290px] xl:max-w-none xl:shrink-0"
              conversation={conv}
              onClose={() => setInfoOpen(false)}
              onVideoCall={videoCall}
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
          excludeIds={modal === "add" ? (conv?.members || []).map((m) => m.id) : []}
          onClose={() => setModal(null)}
          onSubmit={async (payload) => {
            if (modal === "add") await chat.addMembers(conv.id, payload.memberIds);
            else {
              await chat.createConversation(payload);
              setMobileChatOpen(true);
            }
          }}
        />
      )}

      {forwardMsg && (
        <ForwardModal
          message={forwardMsg}
          conversations={chat.conversations}
          onClose={() => setForwardMsg(null)}
          onForward={chat.forwardMessage}
        />
      )}

      {notice && (
        <div className="fixed bottom-6 left-1/2 z-50 -translate-x-1/2 rounded-full border border-white/10 bg-[#1a1a1a] px-4 py-2 text-[12px] text-white shadow-xl">
          {notice}
        </div>
      )}
    </div>
  );
};

export default ChatPage;