
import crypto from "node:crypto";
import fs from "node:fs";
import path from "node:path";
import { prisma } from "../../config/db.js";
import ApiError from "../../utils/ApiError.js";
import { ROLES } from "../../constants/roles.js";
import { buildChatAttachmentUrl } from "../../utils/fileUrls.js";
import { CHAT_ATTACHMENTS_DIR } from "../../config/uploads.js";
import { emitToUsers } from "../../sockets/index.js";

// ---------------------------------------------------------------------------
// Small helpers
// ---------------------------------------------------------------------------

const idOf = (value) => {
  if (value === null || value === undefined) return "";

  if (typeof value === "object") {
    return String(value._id ?? value.id ?? "").trim();
  }

  return String(value).trim();
};

const isValidId = (value) =>
  /^[A-Za-z0-9_-]{8,128}$/.test(String(value ?? ""));

function requireId(value, label = "ID") {
  const id = idOf(value);

  if (!isValidId(id)) {
    throw new ApiError(400, `Invalid ${label}.`);
  }

  return id;
}

const toIso = (value) => {
  if (!value) return null;

  const date = new Date(value);

  return Number.isNaN(date.getTime()) ? null : date.toISOString();
};

const unique = (list) => [...new Set(list.filter(Boolean))];

const isAdminUser = (user) =>
  ["admin", "superadmin"].includes(
    String(user?.role || "").toLowerCase()
  );

const activeUserFilter = {
  isDeleted: false,
  status: "active",
};

// A failed socket emit must never break the HTTP request.
function safeEmit(userIds, event, payload) {
  try {
    emitToUsers(userIds, event, payload);
  } catch (error) {
    console.error(
      `[chat] socket emit failed (${event}):`,
      error?.message
    );
  }
}

// ---------------------------------------------------------------------------
// Per-conversation lock
// ---------------------------------------------------------------------------

const chatLocks = new Map();

async function withChatLock(chatId, task) {
  const previous = chatLocks.get(chatId) || Promise.resolve();

  let release;

  const gate = new Promise((resolve) => {
    release = resolve;
  });

  const tail = previous.then(() => gate);

  chatLocks.set(chatId, tail);

  await previous;

  try {
    return await task();
  } finally {
    release();

    if (chatLocks.get(chatId) === tail) {
      chatLocks.delete(chatId);
    }
  }
}

// ---------------------------------------------------------------------------
// Loading / saving
// ---------------------------------------------------------------------------

function hydrate(row) {
  let needsBackfill = false;

  const members = (Array.isArray(row.members) ? row.members : [])
    .map((entry) => ({
      user: idOf(entry?.user ?? entry),
      lastReadAt: toIso(entry?.lastReadAt),
      joinedAt: toIso(entry?.joinedAt) || toIso(row.createdAt),
    }))
    .filter((entry) => entry.user);

  const admins = unique(
    (Array.isArray(row.admins) ? row.admins : []).map(idOf)
  );

  const clearedFor = (
    Array.isArray(row.clearedFor) ? row.clearedFor : []
  )
    .map((entry) => ({
      user: idOf(entry?.user),
      clearedAt: toIso(entry?.clearedAt),
    }))
    .filter((entry) => entry.user && entry.clearedAt);

  const messages = (
    Array.isArray(row.messages) ? row.messages : []
  ).map((message) => {
    let id = idOf(message?._id ?? message?.id);

    if (!id) {
      id = crypto.randomUUID();
      needsBackfill = true;
    }

    let createdAt = toIso(message?.createdAt);

    if (!createdAt) {
      createdAt =
        toIso(row.lastMessageAt) ||
        toIso(row.createdAt) ||
        new Date().toISOString();

      needsBackfill = true;
    }

    return {
      _id: id,
      sender: idOf(message?.sender),
      text: String(message?.text || ""),
      attachments: Array.isArray(message?.attachments)
        ? message.attachments
        : [],
      replyTo: idOf(message?.replyTo) || null,
      mentions: (
        Array.isArray(message?.mentions) ? message.mentions : []
      )
        .map(idOf)
        .filter(Boolean),
      readBy: (
        Array.isArray(message?.readBy) ? message.readBy : []
      )
        .map((entry) => ({
          user: idOf(entry?.user ?? entry),
          at: toIso(entry?.at),
        }))
        .filter((entry) => entry.user),
      reactions: (
        Array.isArray(message?.reactions) ? message.reactions : []
      )
        .map((reaction) => ({
          emoji: String(reaction?.emoji || ""),
          userIds: (
            Array.isArray(reaction?.userIds)
              ? reaction.userIds
              : []
          )
            .map(idOf)
            .filter(Boolean),
        }))
        .filter((reaction) => reaction.emoji),
      pinned: Boolean(message?.pinned),
      deleted: Boolean(message?.deleted),
      forwardedFrom: idOf(message?.forwardedFrom) || null,
      createdAt,
      updatedAt: toIso(message?.updatedAt) || createdAt,
    };
  });

  return {
    id: row.id,
    type: row.type === "group" ? "group" : "direct",
    name: row.name || "",
    createdById: row.createdById || "",
    createdAt: toIso(row.createdAt),
    lastMessageAt:
      toIso(row.lastMessageAt) || toIso(row.createdAt) || null,
    lastMessageText: row.lastMessageText || "",
    members,
    admins,
    clearedFor,
    messages,
    needsBackfill,
  };
}

async function saveChat(chat) {
  await prisma.chat.update({
    where: {
      id: chat.id,
    },
    data: {
      name: chat.name,
      lastMessageAt: new Date(
        chat.lastMessageAt || Date.now()
      ),
      lastMessageText: chat.lastMessageText || null,
      members: chat.members.map((member) => ({
        user: member.user,
        lastReadAt: member.lastReadAt,
        joinedAt: member.joinedAt,
      })),
      admins: chat.admins,
      clearedFor: chat.clearedFor,
      messages: chat.messages,
    },
  });
}

async function loadChat(chatId) {
  const id = requireId(chatId, "conversation ID");

  const row = await prisma.chat.findUnique({
    where: { id },
  });

  if (!row) {
    throw new ApiError(404, "Conversation not found.");
  }

  return hydrate(row);
}

const memberIdsOf = (chat) =>
  chat.members.map((member) => member.user);

const hasMember = (chat, userId) =>
  chat.members.some(
    (member) => member.user === idOf(userId)
  );

function assertMember(chat, user) {
  if (!hasMember(chat, user)) {
    throw new ApiError(
      403,
      "You do not have access to this conversation."
    );
  }
}

async function getChat(chatId, user) {
  const chat = await loadChat(chatId);

  assertMember(chat, user);

  if (!chat.needsBackfill) {
    return chat;
  }

  return withChatLock(chat.id, async () => {
    const fresh = await loadChat(chat.id);

    if (fresh.needsBackfill) {
      await saveChat(fresh);
    }

    return fresh;
  });
}

async function mutateChat(chatId, user, mutator) {
  const id = requireId(chatId, "conversation ID");

  return withChatLock(id, async () => {
    const chat = await loadChat(id);

    assertMember(chat, user);

    const result = await mutator(chat);

    if (!chat.skipSave) {
      await saveChat(chat);
    }

    return {
      chat,
      result,
    };
  });
}

async function listChatsFor(userId) {
  const rows = await prisma.chat.findMany({
    orderBy: {
      lastMessageAt: "desc",
    },
  });

  const id = idOf(userId);

  return rows
    .map(hydrate)
    .filter((chat) => hasMember(chat, id));
}

async function loadUserMap(ids) {
  const list = unique(ids);

  if (!list.length) {
    return new Map();
  }

  const users = await prisma.user.findMany({
    where: {
      id: {
        in: list,
      },
    },
    select: {
      id: true,
      name: true,
      email: true,
      role: true,
      avatarUrl: true,
      status: true,
    },
  });

  return new Map(
    users.map((person) => [person.id, person])
  );
}

function collectUserIds(chat) {
  const ids = [
    chat.createdById,
    ...chat.admins,
    ...memberIdsOf(chat),
  ];

  for (const message of chat.messages) {
    ids.push(
      message.sender,
      ...message.mentions
    );
  }

  if (chat.name.startsWith("Admin Support ")) {
    ids.push(
      chat.name.slice("Admin Support ".length).trim()
    );
  }

  return ids;
}

// ---------------------------------------------------------------------------
// Visibility / serialization
// ---------------------------------------------------------------------------

function clearedAtFor(chat, userId) {
  const entry = chat.clearedFor.find(
    (item) => item.user === idOf(userId)
  );

  return entry?.clearedAt || null;
}

function visibleMessages(chat, userId) {
  const clearedAt = clearedAtFor(chat, userId);

  return chat.messages.filter(
    (message) =>
      !message.deleted &&
      (
        !clearedAt ||
        new Date(message.createdAt) > new Date(clearedAt)
      )
  );
}

function serializeMessage(chat, message, users) {
  const sender = users.get(message.sender);

  const parent = message.replyTo
    ? chat.messages.find(
        (item) =>
          item._id === message.replyTo &&
          !item.deleted
      )
    : null;

  return {
    id: message._id,
    _id: message._id,
    conversationId: chat.id,
    sender: {
      id: message.sender,
      name: sender?.name || "User",
      role: sender?.role || "",
      avatar: sender?.avatarUrl || "",
    },
    text: message.text,
    createdAt: message.createdAt,
    updatedAt: message.updatedAt,
    replyTo: parent
      ? {
          id: parent._id,
          text: parent.text,
          senderName:
            users.get(parent.sender)?.name || "User",
        }
      : null,
    replyToId: message.replyTo,
    reactions: message.reactions.map((reaction) => ({
      emoji: reaction.emoji,
      userIds: reaction.userIds,
    })),
    pinned: message.pinned,
    attachments: message.attachments,
    mentions: message.mentions.map((id) => ({
      id,
      name: users.get(id)?.name || "",
      role: users.get(id)?.role || "",
    })),
    forwardedFrom: message.forwardedFrom,
  };
}

function displayName(chat, currentId, users, otherNames) {
  if (chat.type !== "group") {
    return otherNames.join(", ") || "Direct chat";
  }

  if (chat.name.startsWith("Admin Support ")) {
    const ownerId = chat.name
      .slice("Admin Support ".length)
      .trim();

    return ownerId === currentId
      ? "Admin Support"
      : `Support: ${users.get(ownerId)?.name || "Employee"}`;
  }

  return chat.name || "Group chat";
}

function serializeConversation(chat, currentUserId, users) {
  const currentId = idOf(currentUserId);

  const members = chat.members.map((entry) => {
    const person = users.get(entry.user);

    return {
      id: entry.user,
      _id: entry.user,
      name: person?.name || "User",
      email: person?.email || "",
      role: person?.role || "",
      avatar: person?.avatarUrl || "",
      isAdmin: chat.admins.includes(entry.user),
      lastReadAt: entry.lastReadAt,
      joinedAt: entry.joinedAt,
    };
  });

  const otherNames = members
    .filter((person) => person.id !== currentId)
    .map((person) => person.name);

  const visible = visibleMessages(chat, currentId);

  const latest = [...visible].sort(
    (a, b) =>
      new Date(b.createdAt) - new Date(a.createdAt)
  )[0];

  const currentMember = chat.members.find(
    (entry) => entry.user === currentId
  );

  const unreadCount = visible.filter(
    (message) =>
      message.sender !== currentId &&
      (
        !currentMember?.lastReadAt ||
        new Date(message.createdAt) >
          new Date(currentMember.lastReadAt)
      )
  ).length;

  return {
    id: chat.id,
    _id: chat.id,
    type: chat.type,
    name: displayName(
      chat,
      currentId,
      users,
      otherNames
    ),
    members,
    admins: chat.admins,
    lastMessage: latest
      ? {
          text:
            latest.text ||
            (latest.attachments.length ? "Attachment" : ""),
          createdAt: latest.createdAt,
        }
      : {
          text: "",
          createdAt: null,
        },
    lastMessageAt: chat.lastMessageAt,
    unreadCount,
    createdAt: chat.createdAt,
  };
}

async function emitConversationToMembers(
  chat,
  userIds = memberIdsOf(chat)
) {
  try {
    const users = await loadUserMap(
      collectUserIds(chat)
    );

    for (const userId of unique(userIds)) {
      safeEmit(
        [userId],
        "chat:conversation",
        {
          conversation: serializeConversation(
            chat,
            userId,
            users
          ),
        }
      );
    }
  } catch (error) {
    console.error(
      "[chat] could not emit conversation:",
      error?.message
    );
  }
}

async function serializeFor(chat, user) {
  const users = await loadUserMap(
    collectUserIds(chat)
  );

  return serializeConversation(
    chat,
    idOf(user),
    users
  );
}

// ---------------------------------------------------------------------------
// Attachments
// ---------------------------------------------------------------------------

const MIME_BY_EXTENSION = {
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".png": "image/png",
  ".webp": "image/webp",
  ".gif": "image/gif",
  ".pdf": "application/pdf",
  ".txt": "text/plain",
  ".doc": "application/msword",
  ".docx":
    "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  ".xls": "application/vnd.ms-excel",
  ".xlsx":
    "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
};

function cleanFileName(value, fallback) {
  const cleaned = String(value || "")
    .replace(/[\\/\u0000-\u001f]/g, "")
    .trim()
    .slice(0, 120);

  return cleaned || fallback;
}

function resolveAttachment(input) {
  const id = String(input?.id || "").trim();

  if (!/^chat\/[A-Za-z0-9._-]{1,120}$/.test(id)) {
    throw new ApiError(400, "Invalid attachment ID.");
  }

  const fileName = id.slice("chat/".length);

  let size = Number(input?.size) || 0;

  try {
    const stats = fs.statSync(
      path.join(CHAT_ATTACHMENTS_DIR, fileName)
    );

    if (stats.isFile()) {
      size = stats.size;
    }
  } catch {
    // File metadata is optional.
  }

  return {
    id,
    name: cleanFileName(input?.name, fileName),
    url: buildChatAttachmentUrl(fileName),
    mimeType:
      MIME_BY_EXTENSION[path.extname(fileName).toLowerCase()] ||
      "application/octet-stream",
    size,
  };
}

function normalizeAttachmentInputs(data) {
  const byId = new Map();

  for (const item of (
    Array.isArray(data.attachments) ? data.attachments : []
  )) {
    const id = String(item?.id || "").trim();

    if (id) {
      byId.set(id, item);
    }
  }

  for (const value of (
    Array.isArray(data.attachmentIds)
      ? data.attachmentIds
      : []
  )) {
    const id = String(value || "").trim();

    if (id && !byId.has(id)) {
      byId.set(id, { id });
    }
  }

  if (byId.size > 10) {
    throw new ApiError(
      400,
      "You can attach at most 10 files per message."
    );
  }

  return [...byId.values()];
}

// ---------------------------------------------------------------------------
// Conversations
// ---------------------------------------------------------------------------

export async function listConversations(user) {
  const chats = await listChatsFor(idOf(user));

  const users = await loadUserMap(
    chats.flatMap(collectUserIds)
  );

  return {
    conversations: chats.map((chat) =>
      serializeConversation(chat, idOf(user), users)
    ),
  };
}

export async function getConversation(chatId, user) {
  const chat = await getChat(chatId, user);

  return {
    conversation: await serializeFor(chat, user),
  };
}

function findDirectChat(chats, firstId, secondId) {
  return chats.find(
    (chat) =>
      chat.type === "direct" &&
      chat.members.length === 2 &&
      hasMember(chat, firstId) &&
      hasMember(chat, secondId)
  );
}

export async function createConversation(data = {}, user) {
  const currentId = idOf(user);

  const type =
    data.type === "group" ? "group" : "direct";

  const requestedIds = Array.isArray(data.memberIds)
    ? data.memberIds
    : [];

  const ids = unique([
    currentId,
    ...requestedIds.map(idOf),
  ]);

  if (ids.length < 2) {
    throw new ApiError(
      400,
      "At least two members are required."
    );
  }

  if (ids.some((id) => !isValidId(id))) {
    throw new ApiError(
      400,
      "One or more member IDs are invalid."
    );
  }

  if (type === "direct" && ids.length !== 2) {
    throw new ApiError(
      400,
      "A direct chat must have exactly two members."
    );
  }

  const people = await prisma.user.findMany({
    where: {
      id: { in: ids },
      ...activeUserFilter,
    },
    select: {
      id: true,
      role: true,
    },
  });

  if (people.length !== ids.length) {
    throw new ApiError(
      400,
      "One or more members are unavailable."
    );
  }

  if (type === "direct") {
    const otherId = ids.find(
      (id) => id !== currentId
    );

    const existing = findDirectChat(
      await listChatsFor(currentId),
      currentId,
      otherId
    );

    if (existing) {
      return {
        conversation: await serializeFor(existing, user),
      };
    }
  }

  const now = new Date().toISOString();

  const name =
    type === "group"
      ? String(data.name || "").trim().slice(0, 100) ||
        "New group"
      : "";

  const admins =
    type === "group"
      ? unique([
          currentId,
          ...people
            .filter((person) =>
              ["admin", "superadmin"].includes(
                String(person.role || "").toLowerCase()
              )
            )
            .map((person) => person.id),
        ])
      : [];

  const row = await prisma.chat.create({
    data: {
      type,
      name,
      createdById: currentId,
      lastMessageAt: new Date(now),
      members: ids.map((id) => ({
        user: id,
        lastReadAt: id === currentId ? now : null,
        joinedAt: now,
      })),
      admins,
      messages: [],
      clearedFor: [],
    },
  });

  const chat = hydrate(row);

  await emitConversationToMembers(chat);

  return {
    conversation: await serializeFor(chat, user),
  };
}

export async function getAdminConversation(user) {
  const currentId = idOf(user);
  const currentIsAdmin = isAdminUser(user);

  const admins = await prisma.user.findMany({
    where: {
      role: {
        in: ["admin", "superadmin"],
      },
      ...activeUserFilter,
    },
    select: {
      id: true,
    },
  });

  const adminIds = admins.map(
    (person) => person.id
  );

  const name = currentIsAdmin
    ? "Admin Team"
    : `Admin Support ${currentId}`;

  const memberIds = unique([
    currentId,
    ...adminIds,
  ]);

  const existing = (
    await listChatsFor(currentId)
  ).find(
    (chat) =>
      chat.type === "group" &&
      chat.name === name
  );

  if (existing) {
    const missing = memberIds.filter(
      (id) => !hasMember(existing, id)
    );

    if (!missing.length) {
      return {
        conversation: await serializeFor(existing, user),
      };
    }

    const { chat } = await mutateChat(
      existing.id,
      user,
      (current) => {
        const now = new Date().toISOString();

        for (const id of missing) {
          current.members.push({
            user: id,
            lastReadAt: null,
            joinedAt: now,
          });
        }

        current.admins = unique([
          ...current.admins,
          ...adminIds,
        ]);
      }
    );

    await emitConversationToMembers(chat);

    return {
      conversation: await serializeFor(chat, user),
    };
  }

  const now = new Date().toISOString();

  const row = await prisma.chat.create({
    data: {
      type: "group",
      name,
      createdById: currentId,
      lastMessageAt: new Date(now),
      members: memberIds.map((id) => ({
        user: id,
        lastReadAt: id === currentId ? now : null,
        joinedAt: now,
      })),
      admins: currentIsAdmin
        ? memberIds
        : adminIds,
      messages: [],
      clearedFor: [],
    },
  });

  const chat = hydrate(row);

  await emitConversationToMembers(chat);

  return {
    conversation: await serializeFor(chat, user),
  };
}

// ---------------------------------------------------------------------------
// Messages
// ---------------------------------------------------------------------------

export async function getMessages(chatId, user, before) {
  const chat = await getChat(chatId, user);

  let messages = visibleMessages(
    chat,
    idOf(user)
  );

  if (
    before &&
    !Number.isNaN(new Date(before).getTime())
  ) {
    messages = messages.filter(
      (message) =>
        new Date(message.createdAt) < new Date(before)
    );
  }

  messages = [...messages].sort(
    (a, b) =>
      new Date(a.createdAt) - new Date(b.createdAt)
  );

  const users = await loadUserMap(
    collectUserIds(chat)
  );

  return {
    messages: messages.map((message) =>
      serializeMessage(chat, message, users)
    ),
  };
}

export async function sendMessage(chatId, data = {}, user) {
  const currentId = idOf(user);

  const text = String(data.text ?? "").trim();

  const attachmentInputs =
    normalizeAttachmentInputs(data);

  if (!text && !attachmentInputs.length) {
    throw new ApiError(
      400,
      "A message or attachment is required."
    );
  }

  if (text.length > 10000) {
    throw new ApiError(
      400,
      "Message is too long."
    );
  }

  const attachments = attachmentInputs.map(
    resolveAttachment
  );

  const { chat, result: message } = await mutateChat(
    chatId,
    user,
    (current) => {
      let replyTo = null;

      if (data.replyToId) {
        const replyId = requireId(
          data.replyToId,
          "reply ID"
        );

        const parent = current.messages.find(
          (item) =>
            item._id === replyId &&
            !item.deleted
        );

        if (!parent) {
          throw new ApiError(
            404,
            "Reply message not found."
          );
        }

        replyTo = parent._id;
      }

      const mentions = unique(
        (
          Array.isArray(data.mentions)
            ? data.mentions
            : []
        ).map(idOf)
      ).filter((id) => hasMember(current, id));

      const now = new Date().toISOString();

      const created = {
        _id: crypto.randomUUID(),
        sender: currentId,
        text,
        attachments,
        replyTo,
        mentions,
        readBy: [
          {
            user: currentId,
            at: now,
          },
        ],
        reactions: [],
        pinned: false,
        deleted: false,
        forwardedFrom: null,
        createdAt: now,
        updatedAt: now,
      };

      current.messages.push(created);

      current.lastMessageAt = now;
      current.lastMessageText = text || "Attachment";

      current.clearedFor = current.clearedFor.filter(
        (entry) => entry.user !== currentId
      );

      const me = current.members.find(
        (entry) => entry.user === currentId
      );

      if (me) {
        me.lastReadAt = now;
      }

      return created;
    }
  );

  const users = await loadUserMap(
    collectUserIds(chat)
  );

  const payload = serializeMessage(
    chat,
    message,
    users
  );

  safeEmit(
    memberIdsOf(chat),
    "chat:message",
    {
      conversationId: chat.id,
      message: payload,
    }
  );

  return {
    message: payload,
    conversation: serializeConversation(
      chat,
      currentId,
      users
    ),
  };
}

export async function markRead(chatId, user) {
  const currentId = idOf(user);

  const { chat, result } = await mutateChat(
    chatId,
    user,
    (current) => {
      const member = current.members.find(
        (entry) => entry.user === currentId
      );

      const hasSeen = (message) =>
        message.readBy.some(
          (entry) => entry.user === currentId
        );

      const hasUnread = current.messages.some(
        (message) =>
          !message.deleted &&
          message.sender !== currentId &&
          !hasSeen(message)
      );

      if (!hasUnread && member?.lastReadAt) {
        current.skipSave = true;
        return null;
      }

      const now = new Date().toISOString();
      const messageIds = [];

      if (member) {
        member.lastReadAt = now;
      }

      for (const message of current.messages) {
        if (hasSeen(message)) continue;

        message.readBy.push({
          user: currentId,
          at: now,
        });

        if (
          !message.deleted &&
          message.sender !== currentId
        ) {
          messageIds.push(message._id);
        }
      }

      return {
        readAt: now,
        messageIds,
      };
    }
  );

  if (result?.messageIds?.length) {
    safeEmit(
      memberIdsOf(chat),
      "chat:message:read",
      {
        conversationId: chat.id,
        userId: currentId,
        readAt: result.readAt,
        messageIds: result.messageIds,
      }
    );
  }

  return {
    conversationId: chat.id,
    unreadCount: 0,
  };
}

// ---------------------------------------------------------------------------
// Message information
// ---------------------------------------------------------------------------

export async function getMessageInfo(
  chatId,
  messageId,
  user
) {
  const validMessageId = requireId(
    messageId,
    "message ID"
  );

  const chat = await getChat(chatId, user);

  const message = chat.messages.find(
    (item) =>
      item._id === validMessageId &&
      !item.deleted
  );

  if (!message) {
    throw new ApiError(404, "Message not found.");
  }

  if (
    message.sender !== idOf(user) &&
    !isAdminUser(user)
  ) {
    throw new ApiError(
      403,
      "Only the sender can view message info."
    );
  }

  const users = await loadUserMap([
    ...collectUserIds(chat),
    ...message.readBy.map(
      (entry) => entry.user
    ),
  ]);

  const person = (id) => ({
    id,
    name: users.get(id)?.name || "User",
    role: users.get(id)?.role || "",
    avatar: users.get(id)?.avatarUrl || "",
  });

  const readAtByUser = new Map(
    message.readBy.map((entry) => [
      entry.user,
      entry.at,
    ])
  );

  const recipients = chat.members.filter(
    (member) => member.user !== message.sender
  );

  const seenBy = recipients
    .filter((member) =>
      readAtByUser.has(member.user)
    )
    .map((member) => ({
      user: person(member.user),
      readAt: readAtByUser.get(member.user),
    }))
    .sort(
      (a, b) =>
        (a.readAt
          ? new Date(a.readAt).getTime()
          : Infinity) -
        (b.readAt
          ? new Date(b.readAt).getTime()
          : Infinity)
    );

  const notSeenBy = recipients
    .filter(
      (member) =>
        !readAtByUser.has(member.user)
    )
    .map((member) => ({
      user: person(member.user),
    }));

  return {
    messageId: message._id,
    conversationId: chat.id,
    text: message.text,
    attachments: message.attachments,
    sentAt: message.createdAt,
    sender: person(message.sender),
    seenBy,
    notSeenBy,
    totalRecipients: recipients.length,
  };
}

// ---------------------------------------------------------------------------
// Group members
// ---------------------------------------------------------------------------

export async function addMembers(chatId, data = {}, user) {
  const currentId = idOf(user);

  const requestedIds = unique(
    (
      Array.isArray(data.memberIds)
        ? data.memberIds
        : []
    ).map(idOf)
  );

  if (!requestedIds.length) {
    throw new ApiError(
      400,
      "Select at least one member."
    );
  }

  if (requestedIds.some((id) => !isValidId(id))) {
    throw new ApiError(
      400,
      "One or more member IDs are invalid."
    );
  }

  let addedIds = [];

  const { chat } = await mutateChat(
    chatId,
    user,
    async (current) => {
      if (current.type !== "group") {
        throw new ApiError(
          400,
          "Members can only be added to group chats."
        );
      }

      const allowed =
        isAdminUser(user) ||
        current.admins.includes(currentId) ||
        current.createdById === currentId;

      if (!allowed) {
        throw new ApiError(
          403,
          "Only group admins can add members."
        );
      }

      addedIds = requestedIds.filter(
        (id) => !hasMember(current, id)
      );

      if (!addedIds.length) {
        current.skipSave = true;
        return;
      }

      const people = await prisma.user.findMany({
        where: {
          id: { in: addedIds },
          ...activeUserFilter,
        },
        select: {
          id: true,
        },
      });

      if (people.length !== addedIds.length) {
        throw new ApiError(
          400,
          "One or more members are unavailable."
        );
      }

      const now = new Date().toISOString();

      for (const id of addedIds) {
        current.members.push({
          user: id,
          lastReadAt: null,
          joinedAt: now,
        });
      }
    }
  );

  if (addedIds.length) {
    await emitConversationToMembers(chat);
  }

  return {
    conversation: await serializeFor(chat, user),
  };
}

export async function leaveGroup(chatId, user) {
  const currentId = idOf(user);

  const { chat } = await mutateChat(
    chatId,
    user,
    (current) => {
      if (current.type !== "group") {
        throw new ApiError(
          400,
          "This is not a group chat."
        );
      }

      current.members = current.members.filter(
        (entry) => entry.user !== currentId
      );

      current.admins = current.admins.filter(
        (id) => id !== currentId
      );
    }
  );

  safeEmit(
    [currentId],
    "chat:conversation:removed",
    {
      conversationId: chat.id,
    }
  );

  await emitConversationToMembers(chat);

  return {
    conversationId: chat.id,
    left: true,
  };
}

export async function clearChat(chatId, user) {
  const currentId = idOf(user);

  const { chat } = await mutateChat(
    chatId,
    user,
    (current) => {
      const now = new Date().toISOString();

      const existing = current.clearedFor.find(
        (entry) => entry.user === currentId
      );

      if (existing) {
        existing.clearedAt = now;
      } else {
        current.clearedFor.push({
          user: currentId,
          clearedAt: now,
        });
      }
    }
  );

  return {
    conversationId: chat.id,
    cleared: true,
  };
}

// ---------------------------------------------------------------------------
// Delete message
// ---------------------------------------------------------------------------

export async function deleteMessage(
  chatId,
  messageId,
  user
) {
  const validMessageId = requireId(
    messageId,
    "message ID"
  );

  const { chat } = await mutateChat(
    chatId,
    user,
    (current) => {
      const message = current.messages.find(
        (item) =>
          item._id === validMessageId &&
          !item.deleted
      );

      if (!message) {
        throw new ApiError(
          404,
          "Message not found."
        );
      }

      if (
        message.sender !== idOf(user) &&
        !isAdminUser(user)
      ) {
        throw new ApiError(
          403,
          "You cannot delete this message."
        );
      }

      message.deleted = true;
      message.text = "";
      message.attachments = [];
      message.updatedAt = new Date().toISOString();
    }
  );

  safeEmit(
    memberIdsOf(chat),
    "chat:message:deleted",
    {
      conversationId: chat.id,
      messageId: validMessageId,
    }
  );

  return {
    conversationId: chat.id,
    messageId: validMessageId,
  };
}

// ---------------------------------------------------------------------------
// Reactions
// ---------------------------------------------------------------------------

export async function reactToMessage(
  chatId,
  messageId,
  data = {},
  user
) {
  const emoji = String(data.emoji || "").trim();

  if (!emoji || emoji.length > 32) {
    throw new ApiError(400, "Invalid emoji.");
  }

  const validMessageId = requireId(
    messageId,
    "message ID"
  );

  const currentId = idOf(user);

  const { chat, result: reactions } = await mutateChat(
    chatId,
    user,
    (current) => {
      const message = current.messages.find(
        (item) =>
          item._id === validMessageId &&
          !item.deleted
      );

      if (!message) {
        throw new ApiError(
          404,
          "Message not found."
        );
      }

      const reaction = message.reactions.find(
        (item) => item.emoji === emoji
      );

      if (!reaction) {
        message.reactions.push({
          emoji,
          userIds: [currentId],
        });
      } else if (
        reaction.userIds.includes(currentId)
      ) {
        reaction.userIds = reaction.userIds.filter(
          (id) => id !== currentId
        );

        if (!reaction.userIds.length) {
          message.reactions = message.reactions.filter(
            (item) => item.emoji !== emoji
          );
        }
      } else {
        reaction.userIds.push(currentId);
      }

      return message.reactions.map((item) => ({
        emoji: item.emoji,
        userIds: [...item.userIds],
      }));
    }
  );

  safeEmit(
    memberIdsOf(chat),
    "chat:message:reaction",
    {
      conversationId: chat.id,
      messageId: validMessageId,
      reactions,
    }
  );

  return {
    messageId: validMessageId,
    reactions,
  };
}

// ---------------------------------------------------------------------------
// Pin message
// ---------------------------------------------------------------------------

export async function pinMessage(
  chatId,
  messageId,
  data = {},
  user
) {
  const validMessageId = requireId(
    messageId,
    "message ID"
  );

  const pinned = Boolean(data.pinned);

  const { chat } = await mutateChat(
    chatId,
    user,
    (current) => {
      const message = current.messages.find(
        (item) =>
          item._id === validMessageId &&
          !item.deleted
      );

      if (!message) {
        throw new ApiError(
          404,
          "Message not found."
        );
      }

      message.pinned = pinned;
    }
  );

  safeEmit(
    memberIdsOf(chat),
    "chat:message:pinned",
    {
      conversationId: chat.id,
      messageId: validMessageId,
      pinned,
    }
  );

  return {
    messageId: validMessageId,
    pinned,
  };
}

// ---------------------------------------------------------------------------
// Forward message
// ---------------------------------------------------------------------------

export async function forwardMessage(
  messageId,
  data = {},
  user
) {
  const sourceId = requireId(
    messageId,
    "message ID"
  );

  const currentId = idOf(user);

  const destinationIds = unique(
    (
      Array.isArray(data.conversationIds)
        ? data.conversationIds
        : []
    ).map(idOf)
  );

  if (!destinationIds.length) {
    throw new ApiError(
      400,
      "Select at least one destination conversation."
    );
  }

  if (
    destinationIds.some((id) => !isValidId(id))
  ) {
    throw new ApiError(
      400,
      "One or more destination conversation IDs are invalid."
    );
  }

  let source = null;

  for (const chat of await listChatsFor(currentId)) {
    source = chat.messages.find(
      (item) =>
        item._id === sourceId &&
        !item.deleted
    );

    if (source) break;
  }

  if (!source) {
    throw new ApiError(
      404,
      "Message not found."
    );
  }

  const results = [];

  for (const destinationId of destinationIds) {
    const { chat, result: forwarded } =
      await mutateChat(
        destinationId,
        user,
        (current) => {
          const now = new Date().toISOString();

          const created = {
            _id: crypto.randomUUID(),
            sender: currentId,
            text: source.text,
            attachments: source.attachments,
            replyTo: null,
            mentions: [],
            readBy: [
              {
                user: currentId,
                at: now,
              },
            ],
            reactions: [],
            pinned: false,
            deleted: false,
            forwardedFrom: source._id,
            createdAt: now,
            updatedAt: now,
          };

          current.messages.push(created);
          current.lastMessageAt = now;
          current.lastMessageText =
            source.text || "Forwarded attachment";

          const me = current.members.find(
            (entry) => entry.user === currentId
          );

          if (me) {
            me.lastReadAt = now;
          }

          return created;
        }
      );

    const users = await loadUserMap(
      collectUserIds(chat)
    );

    safeEmit(
      memberIdsOf(chat),
      "chat:message",
      {
        conversationId: chat.id,
        message: serializeMessage(
          chat,
          forwarded,
          users
        ),
      }
    );

    results.push(chat.id);
  }

  return {
    forwardedTo: results,
  };
}

// ---------------------------------------------------------------------------
// Users
// ---------------------------------------------------------------------------

export async function listUsers(search = "", user) {
  const where = {
    ...activeUserFilter,
    id: {
      not: idOf(user),
    },
  };

  const term = String(search || "").trim();

  if (term) {
    where.OR = [
      {
        name: {
          contains: term,
        },
      },
      {
        email: {
          contains: term,
        },
      },
      {
        department: {
          contains: term,
        },
      },
    ];
  }

  const users = await prisma.user.findMany({
    where,
    select: {
      id: true,
      name: true,
      email: true,
      role: true,
      avatarUrl: true,
      department: true,
      designation: true,
    },
    orderBy: {
      name: "asc",
    },
    take: 50,
  });

  return {
    users: users.map((person) => ({
      id: person.id,
      _id: person.id,
      name: person.name,
      email: person.email,
      role: person.role,
      avatar: person.avatarUrl || "",
      department: person.department || "",
      designation: person.designation || "",
    })),
  };
}

// ---------------------------------------------------------------------------
// Unread summary
// ---------------------------------------------------------------------------

export async function getUnreadSummary(user) {
  const currentId = idOf(user);

  if (!currentId) {
    throw new ApiError(
      401,
      "Authentication required."
    );
  }

  const chats = await listChatsFor(currentId);

  let totalUnread = 0;

  const conversations = chats.map((chat) => {
    const member = chat.members.find(
      (entry) => entry.user === currentId
    );

    const visible = visibleMessages(
      chat,
      currentId
    );

    const unreadCount = visible.filter(
      (message) => {
        if (message.sender === currentId) {
          return false;
        }

        if (
          member?.lastReadAt &&
          new Date(message.createdAt) <=
            new Date(member.lastReadAt)
        ) {
          return false;
        }

        return true;
      }
    ).length;

    totalUnread += unreadCount;

    return {
      conversationId: chat.id,
      unreadCount,
    };
  });

  return {
    unreadCount: totalUnread,
    totalUnread,
    count: totalUnread,
    conversations,
  };
}

// ---------------------------------------------------------------------------
// Register uploaded chat attachment
// ---------------------------------------------------------------------------

export async function registerAttachmentUpload(user, file) {
  if (!user || !idOf(user)) {
    throw new ApiError(
      401,
      "Authentication required."
    );
  }

  if (!file || !file.filename) {
    throw new ApiError(
      400,
      "Please select a file to upload."
    );
  }

  const fileName = path.basename(
    String(file.filename)
  );

  if (!/^[A-Za-z0-9._-]{1,120}$/.test(fileName)) {
    throw new ApiError(
      400,
      "Invalid uploaded file."
    );
  }

  const extension = path.extname(fileName).toLowerCase();

  const expectedMime = MIME_BY_EXTENSION[extension];

  if (!expectedMime) {
    throw new ApiError(
      400,
      "This file type is not supported."
    );
  }

  const filePath = path.join(
    CHAT_ATTACHMENTS_DIR,
    fileName
  );

  let stats;

  try {
    stats = await fs.promises.stat(filePath);
  } catch {
    throw new ApiError(
      400,
      "Uploaded file could not be found."
    );
  }

  if (!stats.isFile()) {
    throw new ApiError(
      400,
      "Invalid uploaded file."
    );
  }

  return {
    id: `chat/${fileName}`,
    name: cleanFileName(
      file.originalname,
      fileName
    ),
    url: buildChatAttachmentUrl(fileName),
    mimeType: file.mimetype || expectedMime,
    size: Number(file.size) || stats.size,
  };
}

// ---------------------------------------------------------------------------
// Attachment access
// ---------------------------------------------------------------------------

export async function getAttachmentAccess(
  attachmentId,
  user
) {
  const id = String(attachmentId || "").trim();

  const chats = await listChatsFor(idOf(user));

  const found = chats.some((chat) =>
    chat.messages.some(
      (message) =>
        !message.deleted &&
        message.attachments.some(
          (attachment) => attachment?.id === id
        )
    )
  );

  if (!found) {
    throw new ApiError(
      404,
      "Attachment not found."
    );
  }

  return true;
}
