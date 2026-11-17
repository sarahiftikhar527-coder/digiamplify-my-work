
import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";

import { chatService } from "../services/chatService.js";
import { getSocket } from "../services/socket.js";
import { CHAT_CONFIG } from "../modules/employee/chat/chat.config.js";

const getId = (item) => {
  const id =
    item?.id ??
    item?._id ??
    item?.messageId ??
    item?.conversationId ??
    item?.conversation?._id ??
    item?.conversation?.id;

  return id == null ? null : String(id);
};

const unwrap = (response) =>
  response?.data !== undefined ? response.data : response;

const normalizeConversation = (response) => {
  let conversation = unwrap(response);

  if (conversation?.conversation) {
    conversation = conversation.conversation;
  }

  if (!conversation || typeof conversation !== "object") return null;

  const id = getId(conversation);

  if (!id) return null;

  return {
    ...conversation,
    id,
    _id: conversation._id ?? id,
  };
};

const normalizeConversations = (response) => {
  let result = unwrap(response);

  if (result?.conversations !== undefined) {
    result = result.conversations;
  }

  if (!Array.isArray(result)) return [];

  return result.map(normalizeConversation).filter(Boolean);
};

const normalizeMessages = (response) => {
  let result = unwrap(response);

  if (result?.messages !== undefined) {
    result = result.messages;
  }

  if (!Array.isArray(result)) return [];

  return result
    .filter((message) => message && typeof message === "object")
    .map((message) => {
      const id = getId(message);
      const conversationId =
        message.conversationId ??
        message.conversation?._id ??
        message.conversation?.id;

      return {
        ...message,
        id,
        _id: message._id ?? id,
        conversationId:
          conversationId == null ? null : String(conversationId),
      };
    })
    .filter((message) => message.id);
};

const normalizeSingleMessage = (response, fallbackConversationId) => {
  let result = unwrap(response);

  if (result?.message && typeof result.message === "object") {
    result = result.message;
  } else if (result?.data?.message && typeof result.data.message === "object") {
    result = result.data.message;
  } else if (result?.data && typeof result.data === "object") {
    result = result.data;
  }

  if (!result || typeof result !== "object" || Array.isArray(result)) {
    return null;
  }

  const normalized = normalizeMessages([result])[0];

  if (!normalized?.id) return null;

  return {
    ...normalized,
    conversationId:
      normalized.conversationId ?? String(fallbackConversationId),
  };
};

const stamp = (conversation) =>
  new Date(
    conversation.lastMessage?.createdAt ||
      conversation.lastMessageAt ||
      conversation.updatedAt ||
      conversation.createdAt ||
      0
  ).getTime();

const sortConversations = (list) =>
  [...list].sort((a, b) => stamp(b) - stamp(a));

const mergeMessages = (serverMessages, localMessages = []) => {
  const result = [];
  const knownIds = new Set();

  for (const message of serverMessages) {
    const id = String(message.id ?? message._id ?? "");

    if (!id || knownIds.has(id)) continue;

    knownIds.add(id);
    result.push(message);
  }

  for (const message of localMessages) {
    const id = String(message.id ?? message._id ?? "");

    if (!id || knownIds.has(id)) continue;

    if (message.status === "sending" || message.status === "failed") {
      knownIds.add(id);
      result.push(message);
    }
  }

  return result.sort(
    (a, b) =>
      new Date(a.createdAt || 0).getTime() -
      new Date(b.createdAt || 0).getTime()
  );
};

const toggleReaction = (reactions = [], emoji, userId) => {
  const existing = reactions.find((reaction) => reaction.emoji === emoji);

  if (!existing) {
    return [...reactions, { emoji, userIds: [userId] }];
  }

  const userIds = existing.userIds || [];
  const userExists = userIds.some(
    (id) => String(id) === String(userId)
  );

  const updatedIds = userExists
    ? userIds.filter((id) => String(id) !== String(userId))
    : [...userIds, userId];

  return reactions
    .map((reaction) =>
      reaction.emoji === emoji
        ? { ...reaction, userIds: updatedIds }
        : reaction
    )
    .filter((reaction) => (reaction.userIds || []).length > 0);
};

export default function useChat() {
  const me = useMemo(() => CHAT_CONFIG.getUser(), []);
  const myId = me?.id ?? me?._id;

  const [conversations, setConversations] = useState([]);
  const [activeId, setActiveId] = useState(null);
  const [messages, setMessages] = useState({});
  const [loading, setLoading] = useState(true);
  const [messagesLoading, setMessagesLoading] = useState(false);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");
  const [tab, setTab] = useState("all");
  const [replyTo, setReplyTo] = useState(null);

   const activeRef = useRef(null);
  const conversationsRef = useRef([]);
  const messagesRef = useRef({});
  const socketOnlineRef = useRef(false);
  const pollTickRef = useRef(0);
  const requestVersionRef = useRef(0);

  activeRef.current = activeId;
  conversationsRef.current = conversations;
  messagesRef.current = messages;

  const upsertConversation = useCallback((response) => {
    const conversation = normalizeConversation(response);

    if (!conversation) return null;

    setConversations((previous) =>
      sortConversations(
        previous.some((item) => item.id === conversation.id)
          ? previous.map((item) =>
              item.id === conversation.id
                ? { ...item, ...conversation }
                : item
            )
          : [conversation, ...previous]
      )
    );

    return conversation;
  }, []);

  const patchMessage = useCallback((conversationId, messageId, updater) => {
    const cid = conversationId == null ? null : String(conversationId);
    const mid = messageId == null ? null : String(messageId);

    if (!cid || !mid) return;

    setMessages((previous) => {
      const list = previous[cid];

      if (!list) return previous;

      return {
        ...previous,
        [cid]: list.map((message) =>
          String(message.id ?? message._id) === mid
            ? { ...message, ...updater(message) }
            : message
        ),
      };
    });
  }, []);

  const bumpLastMessage = useCallback((message, unreadIncrement = 0) => {
    const conversationId =
      message?.conversationId == null
        ? null
        : String(message.conversationId);

    if (!conversationId) return;

    setConversations((previous) =>
      sortConversations(
        previous.map((conversation) =>
          conversation.id === conversationId
            ? {
                ...conversation,
                lastMessage: {
                  ...(conversation.lastMessage || {}),
                  text:
                    message.text ||
                    (message.attachments?.length ? "Attachment" : ""),
                  createdAt: message.createdAt || new Date().toISOString(),
                },
                lastMessageAt:
                  message.createdAt || conversation.lastMessageAt,
                unreadCount: unreadIncrement
                  ? (conversation.unreadCount || 0) + unreadIncrement
                  : conversation.unreadCount,
              }
            : conversation
        )
      )
    );
  }, []);

  const loadConversations = useCallback(async () => {
    try {
      const response = await chatService.getConversations();
      const list = normalizeConversations(response);

      setConversations(sortConversations(list));
      setError("");

      return list;
    } catch (exception) {
      setError(exception?.message || "Conversations load nahi ho sakin.");
      return [];
    } finally {
      setLoading(false);
    }
  }, []);

  const openConversation = useCallback(async (conversationOrId) => {
    const conversation =
      typeof conversationOrId === "object"
        ? normalizeConversation(conversationOrId)
        : null;

    const id =
      conversation?.id ??
      (conversationOrId == null
        ? null
        : String(conversationOrId).trim());

    if (!id || id === "undefined" || id === "null") {
      setError("Conversation ID nahi mili. Conversation dobara select karein.");
      return;
    }

    const version = ++requestVersionRef.current;

    setActiveId(id);
    activeRef.current = id;
    setReplyTo(null);
    setError("");

    setConversations((previous) =>
      previous.map((item) =>
        item.id === id ? { ...item, unreadCount: 0 } : item
      )
    );

    setMessagesLoading(true);

    try {
      const response = await chatService.getMessages(id);
      const data = normalizeMessages(response);

      if (version !== requestVersionRef.current) return;

      setMessages((previous) => ({
        ...previous,
        [id]: mergeMessages(data, previous[id] || []),
      }));

      chatService.markRead(id).catch(() => {});
    } catch (exception) {
      if (version === requestVersionRef.current) {
        setError(exception?.message || "Messages load nahi ho sake.");
      }
    } finally {
      if (version === requestVersionRef.current) {
        setMessagesLoading(false);
      }
    }
  }, []);

  const handleEvent = useCallback(
    ({ type, payload }) => {
      if (!payload) return;

      if (type === "message:new") {
        const message = normalizeMessages([payload])[0];

        if (!message?.conversationId || !message.id) return;

        const conversationId = String(message.conversationId);

        if (
          !conversationsRef.current.some(
            (conversation) => conversation.id === conversationId
          )
        ) {
          chatService
            .getConversations()
            .then((response) => {
              setConversations(
                sortConversations(normalizeConversations(response))
              );
            })
            .catch(() => {});

          return;
        }

        const mine =
          String(
            message.sender?.id ??
              message.sender?._id ??
              message.sender ??
              ""
          ) === String(myId ?? "");

        const isActive = activeRef.current === conversationId;

        setMessages((previous) => {
          const list = previous[conversationId] || [];

          if (list.some((item) => String(item.id) === String(message.id))) {
            return previous;
          }

          const withoutMatchingPending = mine
            ? list.filter(
                (item) =>
                  !(
                    item.status === "sending" &&
                    item.text === message.text
                  )
              )
            : list;

          return {
            ...previous,
            [conversationId]: [...withoutMatchingPending, message],
          };
        });

        bumpLastMessage(message, isActive || mine ? 0 : 1);

        if (isActive && !mine) {
          chatService.markRead(conversationId).catch(() => {});
        }
      } else if (type === "message:deleted") {
        patchMessage(
          payload.conversationId,
          payload.messageId,
          () => ({ deleted: true, text: "", attachments: [] })
        );
      } else if (type === "message:reaction") {
        patchMessage(
          payload.conversationId,
          payload.messageId,
          () => ({ reactions: payload.reactions })
        );
      } else if (type === "message:pinned") {
        patchMessage(
          payload.conversationId,
          payload.messageId,
          () => ({ pinned: payload.pinned })
        );
            } else if (type === "conversation:updated") {
        const updated = normalizeConversation(payload);

        if (updated) {
          // The chat that is open on screen is always "read".
          upsertConversation(
            updated.id === activeRef.current
              ? { ...updated, unreadCount: 0 }
              : updated
          );
        }
      } else if (type === "conversation:removed") {
        const removedId = String(payload.conversationId ?? "");

        if (!removedId) return;

        setConversations((previous) =>
          previous.filter((conversation) => conversation.id !== removedId)
        );

        if (activeRef.current === removedId) {
          activeRef.current = null;
          setActiveId(null);
        }
      }
    },
    [myId, bumpLastMessage, patchMessage, upsertConversation]
  );

  useEffect(() => {
    let alive = true;

    (async () => {
      const list = await loadConversations();

      if (alive && list.length > 0 && window.innerWidth >= 1024) {
        const firstConversation = normalizeConversation(list[0]);

        if (firstConversation?.id) {
          await openConversation(firstConversation.id);
        }
      }
    })();

        return () => {
      alive = false;
      requestVersionRef.current += 1;
    };
  }, [loadConversations, openConversation]);

  // Real-time updates over the same socket.io connection the rest of the app
  // uses. The server sends these events to EVERY member of a conversation, so
  // new groups and new messages appear instantly for everyone who was added.
  useEffect(() => {
    let socket;

    try {
      socket = getSocket();
    } catch {
      return undefined;
    }

    const events = {
      "chat:message": (data) =>
        handleEvent({ type: "message:new", payload: data?.message }),
      "chat:conversation": (data) =>
        handleEvent({ type: "conversation:updated", payload: data }),
      "chat:conversation:removed": (data) =>
        handleEvent({ type: "conversation:removed", payload: data }),
      "chat:message:deleted": (data) =>
        handleEvent({ type: "message:deleted", payload: data }),
      "chat:message:reaction": (data) =>
        handleEvent({ type: "message:reaction", payload: data }),
      "chat:message:pinned": (data) =>
        handleEvent({ type: "message:pinned", payload: data }),
    };

    // After a (re)connect, catch up on anything missed while offline.
    const onConnect = async () => {
      socketOnlineRef.current = true;

      const list = await loadConversations();
      const id = activeRef.current;

      if (!id || !list.some((conversation) => conversation.id === id)) return;

      try {
        const data = normalizeMessages(await chatService.getMessages(id));

        setMessages((previous) => ({
          ...previous,
          [id]: mergeMessages(data, previous[id] || []),
        }));
      } catch {
        /* the next poll will retry */
      }
    };

    const onDisconnect = () => {
      socketOnlineRef.current = false;
    };

    socketOnlineRef.current = Boolean(socket.connected);

    socket.on("connect", onConnect);
    socket.on("disconnect", onDisconnect);

    Object.entries(events).forEach(([name, listener]) =>
      socket.on(name, listener)
    );

    return () => {
      socket.off("connect", onConnect);
      socket.off("disconnect", onDisconnect);

      Object.entries(events).forEach(([name, listener]) =>
        socket.off(name, listener)
      );
    };
  }, [handleEvent, loadConversations]);

  // Safety net: if the socket is offline, poll every few seconds. While the
  // socket is connected, only a slow refresh (about every 30s) is needed.
  useEffect(() => {
    const interval = setInterval(async () => {
      pollTickRef.current += 1;

      if (socketOnlineRef.current && pollTickRef.current % 6 !== 0) return;

      try {
        const response = await chatService.getConversations();
        const list = normalizeConversations(response);

        setConversations(
          sortConversations(
            list.map((conversation) =>
              conversation.id === activeRef.current
                ? { ...conversation, unreadCount: 0 }
                : conversation
            )
          )
        );

        const id = activeRef.current;

        if (!id || id === "undefined" || id === "null") return;

                const messagesResponse = await chatService.getMessages(id);
        const data = normalizeMessages(messagesResponse);

        const knownIds = new Set(
          (messagesRef.current[id] || []).map((item) => String(item.id))
        );

        const hasNewIncoming = data.some(
          (item) =>
            !knownIds.has(String(item.id)) &&
            String(item.sender?.id ?? "") !== String(myId ?? "")
        );

        setMessages((previous) => ({
          ...previous,
          [id]: mergeMessages(data, previous[id] || []),
        }));

        if (hasNewIncoming) {
          chatService.markRead(id).catch(() => {});
        }
      } catch {
        /* ignore, the next poll will retry */
      }
    }, CHAT_CONFIG.POLL_INTERVAL);

    return () => clearInterval(interval);
  }, [myId]);

  const sendMessage = useCallback(
    async ({ text = "", mentions = [], files = [], replyTo: reply } = {}) => {
      const conversationId = activeRef.current;
      const cleanText = String(text ?? "").trim();
      const selectedFiles = Array.from(files || []);

      if (
        !conversationId ||
        conversationId === "undefined" ||
        conversationId === "null"
      ) {
        setError("Pehle chat select karein, phir message send karein.");
        return;
      }

      if (!cleanText && !selectedFiles.length) {
        setError("Message likhein ya koi attachment select karein.");
        return;
      }

      const tempId = `tmp-${Date.now()}-${Math.random()
        .toString(36)
        .slice(2, 7)}`;

      const optimisticMessage = {
        id: tempId,
        _id: tempId,
        conversationId: String(conversationId),
        sender: {
          id: myId,
          _id: myId,
          name: me?.name,
          role: me?.role,
          avatar: me?.avatar,
        },
        text: cleanText,
        createdAt: new Date().toISOString(),
        replyTo: reply
          ? {
              id: reply.id ?? reply._id,
              text: reply.text,
              senderName: reply.sender?.name,
            }
          : null,
        reactions: [],
        pinned: false,
        attachments: [],
        mentions,
        status: "sending",
      };

      setError("");

      setMessages((previous) => ({
        ...previous,
        [conversationId]: [
          ...(previous[conversationId] || []),
          optimisticMessage,
        ],
      }));

      setReplyTo(null);
      bumpLastMessage(optimisticMessage);

      try {
        const uploaded = await Promise.all(
          selectedFiles.map((file) => chatService.uploadAttachment(file))
        );

                const attachmentMeta = uploaded
          .map((attachment) => {
            const result = unwrap(attachment);
            const file = result?.attachment ?? result;

            return {
              id: file?.id ?? file?._id,
              name: file?.name,
              mimeType: file?.mimeType,
              size: file?.size,
            };
          })
          .filter((file) => file.id);

        const attachmentIds = attachmentMeta.map((file) => file.id);

        if (selectedFiles.length && !attachmentIds.length) {
          throw new Error("Attachments upload nahi huin. Dobara try karein.");
        }

        const sendResponse = await chatService.sendMessage(conversationId, {
          text: cleanText,
          replyToId: reply?.id ?? reply?._id ?? null,
          mentions,
          attachmentIds,
        });

        const savedMessage = normalizeSingleMessage(
          sendResponse,
          conversationId
        );

        const latestResponse = await chatService.getMessages(conversationId);
        const latestMessages = normalizeMessages(latestResponse);

        const serverMessages = [...latestMessages];

        if (
          savedMessage &&
          !serverMessages.some(
            (message) => String(message.id) === String(savedMessage.id)
          )
        ) {
          serverMessages.push(savedMessage);
        }

        if (!serverMessages.length && !savedMessage) {
          throw new Error(
            "Server ne message save hone ki confirmation nahi di. POST response check karna hoga."
          );
        }

        setMessages((previous) => ({
          ...previous,
          [conversationId]: mergeMessages(
            serverMessages,
            (previous[conversationId] || []).filter(
              (message) => message.id !== tempId
            )
          ),
        }));

        if (savedMessage) {
          bumpLastMessage(savedMessage);
        }

        const conversationsResponse = await chatService.getConversations();
        const freshConversations = normalizeConversations(
          conversationsResponse
        );

        setConversations((previous) =>
          sortConversations(
            freshConversations.length ? freshConversations : previous
          )
        );
      } catch (exception) {
        patchMessage(conversationId, tempId, () => ({
          status: "failed",
          error:
            exception?.message ||
            "Message was not sent. Please try again.",
        }));

        setError(
          exception?.message ||
            "Message send nahi hua. Network aur backend check karein."
        );
      }
    },
    [me, myId, bumpLastMessage, patchMessage]
  );

  const retryMessage = useCallback(
    (message) => {
      const conversationId = message.conversationId;

      if (!conversationId) return;

      setMessages((previous) => ({
        ...previous,
        [conversationId]: (previous[conversationId] || []).filter(
          (item) => item.id !== message.id
        ),
      }));

      sendMessage({
        text: message.text,
        mentions: message.mentions || [],
      });
    },
    [sendMessage]
  );

  const deleteMessage = useCallback(
    async (message) => {
      const conversationId = message.conversationId;

      if (!conversationId || !message.id) return;

      patchMessage(conversationId, message.id, () => ({
        deleted: true,
        text: "",
        attachments: [],
      }));

      try {
        await chatService.deleteMessage(conversationId, message.id);
      } catch (exception) {
        setError(exception?.message || "Message delete nahi hua.");
        await openConversation(conversationId);
      }
    },
    [patchMessage, openConversation]
  );

  const reactToMessage = useCallback(
    async (message, emoji) => {
      const conversationId = message.conversationId;

      if (!conversationId || !message.id) return;

      patchMessage(conversationId, message.id, (current) => ({
        reactions: toggleReaction(current.reactions, emoji, myId),
      }));

      try {
        const response = await chatService.reactToMessage(
          conversationId,
          message.id,
          emoji
        );

        const result = unwrap(response);

        if (result?.reactions) {
          patchMessage(conversationId, message.id, () => ({
            reactions: result.reactions,
          }));
        }
      } catch (exception) {
        setError(exception?.message || "Reaction update nahi hui.");

        patchMessage(conversationId, message.id, (current) => ({
          reactions: toggleReaction(current.reactions, emoji, myId),
        }));
      }
    },
    [patchMessage, myId]
  );

  const pinMessage = useCallback(
    async (message) => {
      const conversationId = message.conversationId;

      if (!conversationId || !message.id) return;

      const next = !message.pinned;

      patchMessage(conversationId, message.id, () => ({
        pinned: next,
      }));

      try {
        await chatService.pinMessage(conversationId, message.id, next);
      } catch (exception) {
        setError(exception?.message || "Message pin update nahi hua.");

        patchMessage(conversationId, message.id, () => ({
          pinned: !next,
        }));
      }
    },
    [patchMessage]
  );

  const forwardMessage = useCallback(async (message, ids) => {
    const messageId = message?.id ?? message?._id;

    const targetIds = [
      ...new Set(
        (Array.isArray(ids) ? ids : [])
          .map((id) => String(id ?? "").trim())
          .filter((id) => id && id !== "undefined" && id !== "null")
      ),
    ];

    if (!messageId) {
      throw new Error("Forward karne wale message ki ID nahi mili.");
    }

    if (!targetIds.length) {
      throw new Error("Kam az kam aik destination chat select karein.");
    }

    await chatService.forwardMessage(messageId, targetIds);

    const [conversationResponse, ...messageResponses] = await Promise.all([
      chatService.getConversations(),
      ...targetIds.map((id) => chatService.getMessages(id)),
    ]);

    const freshConversations = normalizeConversations(conversationResponse);

    setConversations(sortConversations(freshConversations));

    setMessages((previous) => {
      const next = { ...previous };

      targetIds.forEach((id, index) => {
        next[id] = normalizeMessages(messageResponses[index]);
      });

      return next;
    });
  }, []);

  const createConversation = useCallback(
    async (payload) => {
      const response = await chatService.createConversation(payload);
      const conversation = normalizeConversation(response);

      if (!conversation) {
        throw new Error(
          "Conversation create hui, lekin server se valid conversation ID nahi mili."
        );
      }

      upsertConversation(conversation);
      await openConversation(conversation.id);

      return conversation;
    },
    [upsertConversation, openConversation]
  );

  const replyPrivately = useCallback(
    async (message) => {
      const senderId = getId(message?.sender);

      if (!senderId) {
        throw new Error("Sender ki ID nahi mili.");
      }

      const response = await chatService.createConversation({
        type: "direct",
        memberIds: [senderId],
      });

      const conversation = normalizeConversation(response);

      if (!conversation) {
        throw new Error(
          "Private conversation ki valid ID server se nahi mili."
        );
      }

      upsertConversation(conversation);
      await openConversation(conversation.id);
      setReplyTo(message);
    },
    [upsertConversation, openConversation]
  );

  const addMembers = useCallback(
    async (conversationId, ids) => {
      if (!conversationId) return;

      const response = await chatService.addMembers(conversationId, ids);
      const conversation = normalizeConversation(response);

      if (conversation) upsertConversation(conversation);
    },
    [upsertConversation]
  );

  const clearChat = useCallback(async (conversationId) => {
    if (!conversationId) return;

    await chatService.clearChat(conversationId);

    setMessages((previous) => ({
      ...previous,
      [conversationId]: [],
    }));

    setConversations((previous) =>
      previous.map((conversation) =>
        conversation.id === conversationId
          ? {
              ...conversation,
              lastMessage: null,
              lastMessageAt: null,
              media: [],
              mediaCount: 0,
            }
          : conversation
      )
    );
  }, []);

  const exitGroup = useCallback(async (conversationId) => {
    if (!conversationId) return;

    await chatService.exitGroup(conversationId);

    setConversations((previous) =>
      previous.filter((conversation) => conversation.id !== conversationId)
    );

    if (activeRef.current === conversationId) {
      activeRef.current = null;
      setActiveId(null);
    }
  }, []);

  const filteredConversations = useMemo(() => {
    const query = search.trim().toLowerCase();

    return conversations.filter(
      (conversation) =>
        (tab === "all" ||
          (tab === "groups"
            ? conversation.type === "group"
            : conversation.type !== "group")) &&
        (!query ||
          conversation.name?.toLowerCase().includes(query) ||
          conversation.lastMessage?.text?.toLowerCase().includes(query))
    );
  }, [conversations, search, tab]);

  const activeConversation =
    conversations.find((conversation) => conversation.id === activeId) ||
    null;

  return {
    me,
    myId,
    error,
    setError,
    loading,
    messagesLoading,
    conversations,
    filteredConversations,
    activeId,
    activeConversation,
    messages: messages[activeId] || [],
    search,
    setSearch,
    tab,
    setTab,
    replyTo,
    setReplyTo,
    reload: loadConversations,
    openConversation,
    sendMessage,
    retryMessage,
    deleteMessage,
    reactToMessage,
    pinMessage,
    forwardMessage,
    createConversation,
    replyPrivately,
    addMembers,
    clearChat,
    exitGroup,
  };
}
