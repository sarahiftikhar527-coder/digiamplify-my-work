import fs from "fs";
import path from "path";
import { prisma } from "../../config/db.js";
import ApiError from "../../utils/ApiError.js";
import { ROLES } from "../../constants/roles.js";
import { CHAT_ATTACHMENTS_DIR } from "../../config/uploads.js";
import {
  buildChatAttachmentId,
  buildChatAttachmentUrl,
} from "../../utils/fileUrls.js";
import {
  emitToUser,
  emitToUsers,
  isUserOnline,
} from "../../sockets/index.js";

/* -------------------------------------------------------------------------
   Constants and small helpers
-------------------------------------------------------------------------- */

const USER_SELECT = {
  id: true,
  name: true,
  email: true,
  role: true,
  avatarUrl: true,
  designation: true,
  department: true,
};

const MEMBERS_INCLUDE = {
  where: { leftAt: null },
  include: { user: { select: USER_SELECT } },
  orderBy: { joinedAt: "asc" },
};

const MESSAGE_INCLUDE = {
  sender: { select: USER_SELECT },
  attachments: { orderBy: { createdAt: "asc" } },
  reactions: {
    select: { emoji: true, userId: true },
    orderBy: { createdAt: "asc" },
  },
  replyTo: {
    select: {
      id: true,
      text: true,
      deleted: true,
      sender: { select: { name: true } },
    },
  },
};

const MAX_TEXT_LENGTH = 10000;
const MAX_ATTACHMENTS_PER_MESSAGE = 10;
const MAX_FORWARD_TARGETS = 10;

const isSystemAdmin = (user) =>
  String(user?.role || "").toLowerCase() === ROLES.ADMIN;

const toId = (value) => String(value?.id ?? value?._id ?? value ?? "").trim();

const truncate = (value, max) => {
  const text = String(value ?? "");
  return text.length > max ? `${text.slice(0, max - 3)}...` : text;
};

const laterOf = (a, b) => {
  if (a && b) return new Date(a) > new Date(b) ? a : b;
  return a || b || null;
};

function buildPreview(text, attachmentCount = 0) {
  const clean = String(text || "").replace(/\s+/g, " ").trim();

  if (clean) return truncate(clean, 140);
  if (attachmentCount > 1) return `Sent ${attachmentCount} attachments`;
  if (attachmentCount === 1) return "Sent an attachment";

  return "";
}

/* -------------------------------------------------------------------------
   Serializers (database rows -> JSON that the portal understands)
-------------------------------------------------------------------------- */

function serializeUser(user) {
  if (!user) {
    return {
      id: "",
      _id: "",
      name: "User",
      email: "",
      role: "",
      avatar: "",
      designation: "",
      department: "",
      online: false,
    };
  }

  return {
    id: user.id,
    _id: user.id,
    name: user.name || "User",
    email: user.email || "",
    role: user.role || "",
    avatar: user.avatarUrl || "",
    designation: user.designation || "",
    department: user.department || "",
    online: isUserOnline(user.id),
  };
}

function serializeMember(member) {
  return {
    ...serializeUser(member.user),
    lastReadAt: member.lastReadAt || null,
    joinedAt: member.joinedAt || null,
    isGroupAdmin: member.role === "admin",
  };
}

function serializeAttachment(attachment) {
  return {
    id: buildChatAttachmentId(attachment.fileName),
    name: attachment.originalName,
    url: buildChatAttachmentUrl(attachment.fileName),
    mimeType: attachment.mimeType,
    type: attachment.mimeType,
    size: attachment.size,
    createdAt: attachment.createdAt,
  };
}

function groupReactions(rows = []) {
  const map = new Map();

  for (const row of rows) {
    if (!map.has(row.emoji)) map.set(row.emoji, []);
    map.get(row.emoji).push(row.userId);
  }

  return [...map.entries()].map(([emoji, userIds]) => ({ emoji, userIds }));
}

function serializeMessage(message) {
  const deleted = Boolean(message.deleted);
  const reply = message.replyTo && !message.replyTo.deleted ? message.replyTo : null;

  return {
    id: message.id,
    _id: message.id,
    conversationId: message.conversationId,
    sender: {
      id: message.sender?.id || message.senderId,
      _id: message.sender?.id || message.senderId,
      name: message.sender?.name || "User",
      role: message.sender?.role || "",
      avatar: message.sender?.avatarUrl || "",
    },
    text: deleted ? "" : message.text || "",
    createdAt: message.createdAt,
    updatedAt: message.updatedAt,
    replyTo: reply
      ? {
          id: reply.id,
          text: reply.text || "",
          senderName: reply.sender?.name || "User",
        }
      : null,
    replyToId: message.replyToId || null,
    reactions: groupReactions(message.reactions),
    pinned: Boolean(message.pinned) && !deleted,
    deleted,
    attachments: deleted
      ? []
      : (message.attachments || []).map(serializeAttachment),
    mentions: Array.isArray(message.mentions) ? message.mentions : [],
    forwarded: Boolean(message.forwardedFromId),
    forwardedFromId: message.forwardedFromId || null,
  };
}

/**
 * The name shown for a conversation depends on who is looking at it.
 * viewer = { id, role }
 */
function conversationTitle(conversation, viewer) {
  const members = conversation.members || [];

  if (conversation.type !== "group") {
    const other = members.find((member) => member.userId !== viewer.id);
    return other?.user?.name || "Direct chat";
  }

  if (conversation.uniqueKey === "admin-team") return "Admin Team";

  if (String(conversation.uniqueKey || "").startsWith("admin-support:")) {
    if (!isSystemAdmin(viewer)) return "Admin Support";

    const employee = members.find(
      (member) => String(member.user?.role).toLowerCase() !== ROLES.ADMIN
    );

    return `Support: ${employee?.user?.name || "Employee"}`;
  }

  return conversation.name || "Group chat";
}

function serializeConversation(conversation, viewer, stats = {}) {
  const members = conversation.members || [];
  const me = members.find((member) => member.userId === viewer.id);
  const isGroup = conversation.type === "group";
  const other = isGroup
    ? null
    : members.find((member) => member.userId !== viewer.id);

  const serializedMembers = members.map(serializeMember);

  const lastMessage = stats.lastMessage || {
    text: "",
    createdAt: null,
  };

  return {
    id: conversation.id,
    _id: conversation.id,
    type: conversation.type,
    name: conversationTitle(conversation, viewer),
    avatar: other?.user?.avatarUrl || "",
    online: other ? isUserOnline(other.userId) : false,
    onlineCount: serializedMembers.filter((member) => member.online).length,
    subtitle: other
      ? other.user?.designation || other.user?.role || ""
      : "",
    members: serializedMembers,
    admins: members
      .filter((member) => member.role === "admin")
      .map((member) => member.userId),
    canManage: Boolean(
      isGroup && (me?.role === "admin" || isSystemAdmin(viewer))
    ),
    isSpecial: Boolean(conversation.uniqueKey) && isGroup,
    lastMessage,
    lastMessageAt: conversation.lastMessageAt,
    unreadCount: stats.unreadCount || 0,
    media: stats.media || [],
    mediaCount: stats.mediaCount ?? (stats.media ? stats.media.length : 0),
    createdAt: conversation.createdAt,
    updatedAt: conversation.updatedAt,
  };
}

/* -------------------------------------------------------------------------
   Loading and access checks
-------------------------------------------------------------------------- */

async function requireConversation(conversationId, user) {
  const id = String(conversationId || "").trim();

  if (!id) throw new ApiError(400, "Invalid conversation ID.");

  const conversation = await prisma.chatConversation.findUnique({
    where: { id },
    include: { members: MEMBERS_INCLUDE },
  });

  if (!conversation) throw new ApiError(404, "Conversation not found.");

  const me = conversation.members.find((member) => member.userId === user.id);

  if (!me) {
    throw new ApiError(403, "You do not have access to this conversation.");
  }

  return { conversation, me };
}

async function loadConversation(id) {
  return prisma.chatConversation.findUnique({
    where: { id },
    include: { members: MEMBERS_INCLUDE },
  });
}

async function buildStats(conversation, me, { withMedia = false } = {}) {
  const visibleFilter = me.clearedAt ? { createdAt: { gt: me.clearedAt } } : {};
  const unreadAfter = laterOf(me.lastReadAt, me.clearedAt);

  const [last, unreadCount] = await Promise.all([
    prisma.chatMessage.findFirst({
      where: { conversationId: conversation.id, deleted: false, ...visibleFilter },
      orderBy: { createdAt: "desc" },
      select: {
        text: true,
        createdAt: true,
        _count: { select: { attachments: true } },
      },
    }),
    prisma.chatMessage.count({
      where: {
        conversationId: conversation.id,
        deleted: false,
        senderId: { not: me.userId },
        ...(unreadAfter ? { createdAt: { gt: unreadAfter } } : {}),
      },
    }),
  ]);

  const stats = {
    unreadCount,
    lastMessage: last
      ? {
          text: last.text || buildPreview("", last._count.attachments) || "",
          createdAt: last.createdAt,
          attachments: last._count.attachments
            ? new Array(last._count.attachments).fill(null)
            : [],
        }
      : { text: "", createdAt: null },
  };

  if (withMedia) {
    const mediaWhere = {
      message: {
        conversationId: conversation.id,
        deleted: false,
        ...visibleFilter,
      },
    };

    const [media, mediaCount] = await Promise.all([
      prisma.chatAttachment.findMany({
        where: mediaWhere,
        orderBy: { createdAt: "desc" },
        take: 30,
      }),
      prisma.chatAttachment.count({ where: mediaWhere }),
    ]);

    stats.media = media.map(serializeAttachment);
    stats.mediaCount = mediaCount;
  }

  return stats;
}

/* -------------------------------------------------------------------------
   Conversations
-------------------------------------------------------------------------- */

export async function listUsers(search = "", user) {
  const term = String(search || "").trim();

  const users = await prisma.user.findMany({
    where: {
      isDeleted: false,
      status: "active",
      id: { not: user.id },
      ...(term
        ? {
            OR: [
              { name: { contains: term } },
              { email: { contains: term } },
              { department: { contains: term } },
              { designation: { contains: term } },
            ],
          }
        : {}),
    },
    select: USER_SELECT,
    orderBy: { name: "asc" },
    take: 100,
  });

  return { users: users.map(serializeUser) };
}

export async function listConversations(user) {
  const conversations = await prisma.chatConversation.findMany({
    where: { members: { some: { userId: user.id, leftAt: null } } },
    include: { members: MEMBERS_INCLUDE },
    orderBy: { lastMessageAt: "desc" },
  });

  const items = await Promise.all(
    conversations.map(async (conversation) => {
      const me = conversation.members.find(
        (member) => member.userId === user.id
      );
      const stats = await buildStats(conversation, me);

      return serializeConversation(conversation, user, stats);
    })
  );

  return { conversations: items };
}

export async function getUnreadSummary(user) {
  const memberships = await prisma.chatMember.findMany({
    where: { userId: user.id, leftAt: null },
    select: {
      conversationId: true,
      userId: true,
      lastReadAt: true,
      clearedAt: true,
    },
  });

  const counts = await Promise.all(
    memberships.map(async (member) => {
      const after = laterOf(member.lastReadAt, member.clearedAt);

      const count = await prisma.chatMessage.count({
        where: {
          conversationId: member.conversationId,
          deleted: false,
          senderId: { not: user.id },
          ...(after ? { createdAt: { gt: after } } : {}),
        },
      });

      return [member.conversationId, count];
    })
  );

  const conversationsMap = {};
  let total = 0;

  for (const [conversationId, count] of counts) {
    if (count > 0) {
      conversationsMap[conversationId] = count;
      total += count;
    }
  }

  return { total, conversations: conversationsMap };
}

export async function getConversation(chatId, user) {
  const { conversation, me } = await requireConversation(chatId, user);
  const stats = await buildStats(conversation, me, { withMedia: true });

  return { conversation: serializeConversation(conversation, user, stats) };
}

export async function createConversation(data = {}, user) {
  const type = data.type === "group" ? "group" : "direct";
  const requested = Array.isArray(data.memberIds) ? data.memberIds : [];

  const ids = [...new Set([user.id, ...requested.map(toId).filter(Boolean)])];

  if (ids.length < 2) {
    throw new ApiError(400, "At least two members are required.");
  }

  if (type === "direct" && ids.length !== 2) {
    throw new ApiError(400, "A direct chat must have exactly two members.");
  }

  const people = await prisma.user.findMany({
    where: { id: { in: ids }, isDeleted: false, status: "active" },
    select: { id: true, role: true },
  });

  if (people.length !== ids.length) {
    throw new ApiError(400, "One or more members are unavailable.");
  }

  let conversation = null;
  let created = false;

  if (type === "direct") {
    const uniqueKey = `direct:${[...ids].sort().join(":")}`;

    conversation = await prisma.chatConversation.findUnique({
      where: { uniqueKey },
      include: { members: MEMBERS_INCLUDE },
    });

    if (!conversation) {
      try {
        conversation = await prisma.chatConversation.create({
          data: {
            type: "direct",
            uniqueKey,
            createdById: user.id,
            members: {
              create: ids.map((id) => ({
                userId: id,
                lastReadAt: id === user.id ? new Date() : null,
              })),
            },
          },
          include: { members: MEMBERS_INCLUDE },
        });
        created = true;
      } catch (error) {
        if (error?.code !== "P2002") throw error;
        conversation = await prisma.chatConversation.findUnique({
          where: { uniqueKey },
          include: { members: MEMBERS_INCLUDE },
        });
      }
    }
  } else {
    const name = String(data.name || "").trim() || "New group";

    if (name.length > 100) {
      throw new ApiError(400, "Group name is too long.");
    }

    conversation = await prisma.chatConversation.create({
      data: {
        type: "group",
        name,
        createdById: user.id,
        members: {
          create: people.map((person) => ({
            userId: person.id,
            role:
              person.id === user.id ||
              String(person.role).toLowerCase() === ROLES.ADMIN
                ? "admin"
                : "member",
            lastReadAt: person.id === user.id ? new Date() : null,
          })),
        },
      },
      include: { members: MEMBERS_INCLUDE },
    });
    created = true;
  }

  if (created) {
    emitToUsers(
      conversation.members.map((member) => member.userId),
      "chat:conversation:updated",
      { conversationId: conversation.id, reason: "created" }
    );
  }

  const me = conversation.members.find((member) => member.userId === user.id);
  const stats = await buildStats(conversation, me);

  return { conversation: serializeConversation(conversation, user, stats) };
}

/**
 * Support chat.
 * - Employee: a group with all admins ("Admin Support").
 * - Admin: one shared group with all admins ("Admin Team").
 */
export async function getAdminConversation(user) {
  const admins = await prisma.user.findMany({
    where: { role: ROLES.ADMIN, status: "active", isDeleted: false },
    select: { id: true },
  });

  const adminIds = admins.map((admin) => admin.id);
  const viewerIsAdmin = isSystemAdmin(user);
  const uniqueKey = viewerIsAdmin ? "admin-team" : `admin-support:${user.id}`;
  const memberIds = [...new Set([user.id, ...adminIds])];

  let conversation = await prisma.chatConversation.findUnique({
    where: { uniqueKey },
    select: { id: true },
  });

  if (!conversation) {
    try {
      conversation = await prisma.chatConversation.create({
        data: {
          type: "group",
          name: viewerIsAdmin ? "Admin Team" : "Admin Support",
          uniqueKey,
          createdById: user.id,
          members: {
            create: memberIds.map((id) => ({
              userId: id,
              role: adminIds.includes(id) ? "admin" : "member",
              lastReadAt: new Date(),
            })),
          },
        },
        select: { id: true },
      });
    } catch (error) {
      if (error?.code !== "P2002") throw error;
      conversation = await prisma.chatConversation.findUnique({
        where: { uniqueKey },
        select: { id: true },
      });
    }
  } else {
    // Make sure every current admin is part of the group.
    const rows = await prisma.chatMember.findMany({
      where: { conversationId: conversation.id },
      select: { userId: true, leftAt: true },
    });

    const byUser = new Map(rows.map((row) => [row.userId, row]));

    for (const id of memberIds) {
      const row = byUser.get(id);

      if (!row) {
        await prisma.chatMember.create({
          data: {
            conversationId: conversation.id,
            userId: id,
            role: adminIds.includes(id) ? "admin" : "member",
            lastReadAt: new Date(),
          },
        });
      } else if (row.leftAt) {
        await prisma.chatMember.update({
          where: {
            conversationId_userId: {
              conversationId: conversation.id,
              userId: id,
            },
          },
          data: { leftAt: null, joinedAt: new Date(), lastReadAt: new Date() },
        });
      }
    }
  }

  const full = await loadConversation(conversation.id);
  const me = full.members.find((member) => member.userId === user.id);
  const stats = await buildStats(full, me);

  return { conversation: serializeConversation(full, user, stats) };
}

export async function addMembers(chatId, data = {}, user) {
  const { conversation, me } = await requireConversation(chatId, user);

  if (conversation.type !== "group") {
    throw new ApiError(400, "Members can only be added to group chats.");
  }

  if (me.role !== "admin" && !isSystemAdmin(user)) {
    throw new ApiError(403, "Only group admins can add members.");
  }

  const requested = Array.isArray(data.memberIds) ? data.memberIds : [];
  const ids = [...new Set(requested.map(toId).filter(Boolean))];

  if (!ids.length) throw new ApiError(400, "Select at least one member.");

  const people = await prisma.user.findMany({
    where: { id: { in: ids }, isDeleted: false, status: "active" },
    select: { id: true },
  });

  if (people.length !== ids.length) {
    throw new ApiError(400, "One or more members are unavailable.");
  }

  const existingRows = await prisma.chatMember.findMany({
    where: { conversationId: conversation.id, userId: { in: ids } },
  });

  const byUser = new Map(existingRows.map((row) => [row.userId, row]));
  const now = new Date();

  for (const id of ids) {
    const row = byUser.get(id);

    if (row && !row.leftAt) continue;

    if (row) {
      await prisma.chatMember.update({
        where: {
          conversationId_userId: { conversationId: conversation.id, userId: id },
        },
        data: { leftAt: null, role: "member", joinedAt: now, lastReadAt: now },
      });
    } else {
      await prisma.chatMember.create({
        data: {
          conversationId: conversation.id,
          userId: id,
          role: "member",
          lastReadAt: now,
        },
      });
    }
  }

  const full = await loadConversation(conversation.id);

  emitToUsers(
    full.members.map((member) => member.userId),
    "chat:conversation:updated",
    { conversationId: full.id, reason: "members" }
  );

  const mine = full.members.find((member) => member.userId === user.id);
  const stats = await buildStats(full, mine, { withMedia: true });

  return { conversation: serializeConversation(full, user, stats) };
}

export async function leaveGroup(chatId, user) {
  const { conversation } = await requireConversation(chatId, user);

  if (conversation.type !== "group") {
    throw new ApiError(400, "This is not a group chat.");
  }

  if (conversation.uniqueKey) {
    throw new ApiError(400, "You cannot leave this conversation.");
  }

  await prisma.chatMember.update({
    where: {
      conversationId_userId: { conversationId: conversation.id, userId: user.id },
    },
    data: { leftAt: new Date(), role: "member" },
  });

  const remaining = conversation.members.filter(
    (member) => member.userId !== user.id
  );

  // Make sure the group always has at least one group admin.
  if (remaining.length && !remaining.some((member) => member.role === "admin")) {
    await prisma.chatMember.update({
      where: {
        conversationId_userId: {
          conversationId: conversation.id,
          userId: remaining[0].userId,
        },
      },
      data: { role: "admin" },
    });
  }

  emitToUser(user.id, "chat:conversation:removed", {
    conversationId: conversation.id,
  });

  emitToUsers(
    remaining.map((member) => member.userId),
    "chat:conversation:updated",
    { conversationId: conversation.id, reason: "left" }
  );

  return { conversationId: conversation.id, left: true };
}

export async function clearChat(chatId, user) {
  const { conversation } = await requireConversation(chatId, user);

  await prisma.chatMember.update({
    where: {
      conversationId_userId: { conversationId: conversation.id, userId: user.id },
    },
    data: { clearedAt: new Date() },
  });

  return { conversationId: conversation.id, cleared: true };
}

/* -------------------------------------------------------------------------
   Messages
-------------------------------------------------------------------------- */

export async function getMessages(chatId, user, before, limit = 100) {
  const { conversation, me } = await requireConversation(chatId, user);

  const range = {};

  if (me.clearedAt) range.gt = me.clearedAt;

  if (before) {
    const beforeDate = new Date(before);
    if (!Number.isNaN(beforeDate.getTime())) range.lt = beforeDate;
  }

  const rows = await prisma.chatMessage.findMany({
    where: {
      conversationId: conversation.id,
      ...(Object.keys(range).length ? { createdAt: range } : {}),
    },
    include: MESSAGE_INCLUDE,
    orderBy: { createdAt: "desc" },
    take: limit + 1,
  });

  const hasMore = rows.length > limit;
  const page = rows.slice(0, limit).reverse();

  return { messages: page.map(serializeMessage), hasMore };
}

function resolveMentions(conversation, senderId, rawMentions) {
  if (!Array.isArray(rawMentions)) return [];

  const people = new Map(
    conversation.members.map((member) => [member.userId, member.user])
  );

  const result = [];
  const seen = new Set();

  for (const item of rawMentions.slice(0, 50)) {
    const id = toId(typeof item === "object" ? item?.id ?? item?._id : item);

    if (!id || seen.has(id)) continue;

    if (id === "all") {
      if (conversation.type === "group") {
        seen.add(id);
        result.push({ id: "all", name: "All" });
      }
      continue;
    }

    const person = people.get(id);

    if (person && id !== senderId) {
      seen.add(id);
      result.push({ id, name: person.name });
    }
  }

  return result;
}

async function upsertBellNotification({
  recipient,
  sender,
  conversation,
  preview,
  mentioned,
}) {
  const base = String(recipient.role).toLowerCase() === ROLES.ADMIN
    ? "/admin/chat"
    : "/chat";

  const link = `${base}?conversation=${conversation.id}`;
  const conversationName = conversationTitle(conversation, recipient);
  const isGroup = conversation.type === "group";

  const title = truncate(
    mentioned
      ? `${sender.name} mentioned you`
      : isGroup
        ? `${sender.name} in ${conversationName}`
        : `New message from ${sender.name}`,
    150
  );

  const data = {
    fromId: sender.id,
    tag: "Messages",
    title,
    message: truncate(preview || "New message", 500),
    details: preview || null,
    linkLabel: "Open chat",
  };

  const existing = await prisma.notification.findFirst({
    where: { toId: recipient.id, type: "message", read: false, link },
    select: { id: true },
  });

  if (existing) {
    await prisma.notification.update({
      where: { id: existing.id },
      data: { ...data, createdAt: new Date() },
    });
  } else {
    await prisma.notification.create({
      data: { ...data, toId: recipient.id, type: "message", link, read: false },
    });
  }

  emitToUser(recipient.id, "notification:new", {
    type: "message",
    conversationId: conversation.id,
  });
}

async function notifyRecipients({
  conversation,
  sender,
  message,
  preview,
  mentions,
}) {
  const mentionAll = mentions.some((item) => item.id === "all");
  const mentionedIds = new Set(
    mentions.filter((item) => item.id !== "all").map((item) => item.id)
  );

  for (const member of conversation.members) {
    if (member.userId === sender.id) continue;

    const recipient = { id: member.userId, role: member.user?.role };
    const mentioned = mentionAll || mentionedIds.has(member.userId);

    // Live popup + sound + sidebar badge (the browser decides what to show).
    emitToUser(member.userId, "chat:notification", {
      conversationId: conversation.id,
      conversationName: conversationTitle(conversation, recipient),
      isGroup: conversation.type === "group",
      messageId: message.id,
      sender: {
        id: sender.id,
        name: sender.name,
        avatar: sender.avatarUrl || "",
      },
      preview,
      mentioned,
      createdAt: message.createdAt,
    });

    try {
      await upsertBellNotification({
        recipient,
        sender,
        conversation,
        preview,
        mentioned,
      });
    } catch (error) {
      console.error("Chat notification failed:", error?.message || error);
    }
  }
}

/**
 * Saves a message, then pushes it to every member in real time.
 * Used by "send" and by "forward".
 */
async function createMessage({
  conversation,
  sender,
  text,
  connectAttachmentIds = [],
  copyAttachments = [],
  replyToId = null,
  mentions = [],
  forwardedFromId = null,
}) {
  const attachmentCount = connectAttachmentIds.length + copyAttachments.length;
  const preview = buildPreview(text, attachmentCount);

  const message = await prisma.$transaction(async (tx) => {
    const created = await tx.chatMessage.create({
      data: {
        conversationId: conversation.id,
        senderId: sender.id,
        text,
        replyToId,
        forwardedFromId,
        ...(mentions.length ? { mentions } : {}),
        ...(connectAttachmentIds.length || copyAttachments.length
          ? {
              attachments: {
                ...(connectAttachmentIds.length
                  ? { connect: connectAttachmentIds.map((id) => ({ id })) }
                  : {}),
                ...(copyAttachments.length
                  ? { create: copyAttachments }
                  : {}),
              },
            }
          : {}),
      },
    });

    await tx.chatConversation.update({
      where: { id: conversation.id },
      data: {
        lastMessageAt: created.createdAt,
        lastMessageText: truncate(preview, 500),
      },
    });

    await tx.chatMember.updateMany({
      where: { conversationId: conversation.id, userId: sender.id },
      data: { lastReadAt: created.createdAt },
    });

    return tx.chatMessage.findUnique({
      where: { id: created.id },
      include: MESSAGE_INCLUDE,
    });
  });

  const serialized = serializeMessage(message);

  emitToUsers(
    conversation.members.map((member) => member.userId),
    "chat:message:new",
    { conversationId: conversation.id, message: serialized }
  );

  // Do not make the sender wait for notifications.
  notifyRecipients({
    conversation,
    sender,
    message: serialized,
    preview,
    mentions,
  }).catch((error) => console.error("Chat notify error:", error));

  return { message: serialized, preview };
}

export async function sendMessage(chatId, data = {}, user) {
  const { conversation } = await requireConversation(chatId, user);

  const text = String(data.text || "").trim();
  const attachmentIds = Array.isArray(data.attachmentIds)
    ? [...new Set(data.attachmentIds.map((value) => String(value || "")))]
    : [];

  if (!text && !attachmentIds.length) {
    throw new ApiError(400, "A message or attachment is required.");
  }

  if (text.length > MAX_TEXT_LENGTH) {
    throw new ApiError(400, "Message is too long.");
  }

  if (attachmentIds.length > MAX_ATTACHMENTS_PER_MESSAGE) {
    throw new ApiError(
      400,
      `You can send at most ${MAX_ATTACHMENTS_PER_MESSAGE} attachments at once.`
    );
  }

  // Reply target must be a message of the same conversation.
  let replyToId = null;

  if (data.replyToId) {
    const parent = await prisma.chatMessage.findFirst({
      where: {
        id: String(data.replyToId),
        conversationId: conversation.id,
        deleted: false,
      },
      select: { id: true },
    });

    if (!parent) throw new ApiError(404, "Reply message not found.");

    replyToId = parent.id;
  }

  // Attachments must have been uploaded by this user and not used yet.
  let connectAttachmentIds = [];

  if (attachmentIds.length) {
    const fileNames = attachmentIds.map((id) => {
      if (!id.startsWith("chat/")) {
        throw new ApiError(400, "Invalid attachment ID.");
      }

      return id.slice("chat/".length);
    });

    const rows = await prisma.chatAttachment.findMany({
      where: {
        fileName: { in: fileNames },
        uploaderId: user.id,
        messageId: null,
      },
      select: { id: true },
    });

    if (rows.length !== fileNames.length) {
      throw new ApiError(
        400,
        "One or more attachments are invalid or were already sent."
      );
    }

    connectAttachmentIds = rows.map((row) => row.id);
  }

  const mentions = resolveMentions(conversation, user.id, data.mentions);

  const { message, preview } = await createMessage({
    conversation,
    sender: user,
    text,
    connectAttachmentIds,
    replyToId,
    mentions,
  });

  return {
    message,
    conversation: serializeConversation(conversation, user, {
      lastMessage: { text: preview, createdAt: message.createdAt },
      unreadCount: 0,
    }),
  };
}

export async function markRead(chatId, user) {
  const { conversation } = await requireConversation(chatId, user);
  const now = new Date();

  await prisma.chatMember.update({
    where: {
      conversationId_userId: { conversationId: conversation.id, userId: user.id },
    },
    data: { lastReadAt: now },
  });

  // The bell notifications for this conversation are now read.
  const links = [
    `/chat?conversation=${conversation.id}`,
    `/admin/chat?conversation=${conversation.id}`,
  ];

  await prisma.notification.updateMany({
    where: {
      toId: user.id,
      type: "message",
      read: false,
      link: { in: links },
    },
    data: { read: true },
  });

  emitToUsers(
    conversation.members
      .map((member) => member.userId)
      .filter((id) => id !== user.id),
    "chat:read",
    { conversationId: conversation.id, userId: user.id, at: now }
  );

  // Other open tabs of the same user update their unread badge.
  emitToUser(user.id, "chat:unread:changed", { conversationId: conversation.id });

  return { conversationId: conversation.id, unreadCount: 0 };
}

async function refreshLastMessage(conversationId) {
  const last = await prisma.chatMessage.findFirst({
    where: { conversationId, deleted: false },
    orderBy: { createdAt: "desc" },
    select: { text: true, createdAt: true, _count: { select: { attachments: true } } },
  });

  await prisma.chatConversation.update({
    where: { id: conversationId },
    data: {
      lastMessageText: last
        ? truncate(buildPreview(last.text, last._count.attachments), 500)
        : "",
    },
  });
}

async function removeUnreferencedFiles(fileNames) {
  for (const fileName of new Set(fileNames)) {
    const stillUsed = await prisma.chatAttachment.count({ where: { fileName } });

    if (stillUsed === 0) {
      fs.promises
        .unlink(path.join(CHAT_ATTACHMENTS_DIR, fileName))
        .catch(() => {});
    }
  }
}

export async function deleteMessage(chatId, messageId, user) {
  const { conversation } = await requireConversation(chatId, user);

  const message = await prisma.chatMessage.findFirst({
    where: { id: String(messageId), conversationId: conversation.id },
    include: { attachments: { select: { fileName: true } } },
  });

  if (!message || message.deleted) {
    throw new ApiError(404, "Message not found.");
  }

  if (message.senderId !== user.id && !isSystemAdmin(user)) {
    throw new ApiError(403, "You cannot delete this message.");
  }

  await prisma.$transaction([
    prisma.chatAttachment.deleteMany({ where: { messageId: message.id } }),
    prisma.chatMessage.update({
      where: { id: message.id },
      data: { deleted: true, text: "", pinned: false },
    }),
  ]);

  await removeUnreferencedFiles(message.attachments.map((item) => item.fileName));
  await refreshLastMessage(conversation.id);

  emitToUsers(
    conversation.members.map((member) => member.userId),
    "chat:message:deleted",
    { conversationId: conversation.id, messageId: message.id }
  );

  return { conversationId: conversation.id, messageId: message.id };
}

export async function reactToMessage(chatId, messageId, data = {}, user) {
  const emoji = String(data.emoji || "").trim();

  if (!emoji || emoji.length > 16) throw new ApiError(400, "Invalid emoji.");

  const { conversation } = await requireConversation(chatId, user);

  const message = await prisma.chatMessage.findFirst({
    where: { id: String(messageId), conversationId: conversation.id, deleted: false },
    select: { id: true },
  });

  if (!message) throw new ApiError(404, "Message not found.");

  const key = { messageId: message.id, userId: user.id, emoji };

  const existing = await prisma.chatReaction.findUnique({
    where: { messageId_userId_emoji: key },
    select: { id: true },
  });

  if (existing) {
    await prisma.chatReaction.delete({ where: { id: existing.id } });
  } else {
    try {
      await prisma.chatReaction.create({ data: key });
    } catch (error) {
      if (error?.code !== "P2002") throw error;
    }
  }

  const rows = await prisma.chatReaction.findMany({
    where: { messageId: message.id },
    select: { emoji: true, userId: true },
    orderBy: { createdAt: "asc" },
  });

  const reactions = groupReactions(rows);

  emitToUsers(
    conversation.members.map((member) => member.userId),
    "chat:message:reaction",
    { conversationId: conversation.id, messageId: message.id, reactions }
  );

  return { messageId: message.id, reactions };
}

export async function pinMessage(chatId, messageId, data = {}, user) {
  const { conversation } = await requireConversation(chatId, user);

  const message = await prisma.chatMessage.findFirst({
    where: { id: String(messageId), conversationId: conversation.id, deleted: false },
    select: { id: true },
  });

  if (!message) throw new ApiError(404, "Message not found.");

  const pinned = Boolean(data.pinned);

  await prisma.chatMessage.update({
    where: { id: message.id },
    data: { pinned, pinnedById: pinned ? user.id : null },
  });

  emitToUsers(
    conversation.members.map((member) => member.userId),
    "chat:message:pinned",
    { conversationId: conversation.id, messageId: message.id, pinned }
  );

  return { messageId: message.id, pinned };
}

export async function forwardMessage(messageId, data = {}, user) {
  const requested = Array.isArray(data.conversationIds)
    ? data.conversationIds
    : [];

  const targetIds = [...new Set(requested.map(toId).filter(Boolean))];

  if (!targetIds.length) {
    throw new ApiError(400, "Select at least one destination conversation.");
  }

  if (targetIds.length > MAX_FORWARD_TARGETS) {
    throw new ApiError(
      400,
      `You can forward to at most ${MAX_FORWARD_TARGETS} conversations at once.`
    );
  }

  const source = await prisma.chatMessage.findUnique({
    where: { id: String(messageId) },
    include: {
      attachments: true,
      conversation: { include: { members: MEMBERS_INCLUDE } },
    },
  });

  const sourceMember = source?.conversation.members.find(
    (member) => member.userId === user.id
  );

  if (
    !source ||
    source.deleted ||
    !sourceMember ||
    (sourceMember.clearedAt && source.createdAt <= sourceMember.clearedAt)
  ) {
    throw new ApiError(404, "Message not found.");
  }

  const copies = source.attachments.map((item) => ({
    fileName: item.fileName,
    originalName: item.originalName,
    mimeType: item.mimeType,
    size: item.size,
    uploaderId: user.id,
  }));

  const forwardedTo = [];

  for (const targetId of targetIds) {
    const { conversation } = await requireConversation(targetId, user);

    await createMessage({
      conversation,
      sender: user,
      text: source.text,
      copyAttachments: copies,
      forwardedFromId: source.id,
    });

    forwardedTo.push(conversation.id);
  }

  return { forwardedTo };
}

/* -------------------------------------------------------------------------
   Attachments
-------------------------------------------------------------------------- */

/**
 * Called after multer saved the file to disk. The file is not visible to
 * anybody except the uploader until it is sent with a message.
 */
export async function registerAttachmentUpload(user, file) {
  if (!file) throw new ApiError(400, "Please select a file to upload.");

  // Browsers send file names as UTF-8 but multer reads them as latin1.
  const originalName = truncate(
    path.basename(Buffer.from(file.originalname, "latin1").toString("utf8")),
    255
  );

  const row = await prisma.chatAttachment.create({
    data: {
      fileName: file.filename,
      originalName,
      mimeType: file.mimetype || "application/octet-stream",
      size: file.size || 0,
      uploaderId: user.id,
    },
  });

  return serializeAttachment(row);
}