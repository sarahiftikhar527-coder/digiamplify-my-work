
import mongoose from "../../utils/mongooseCompat.js";
import Chat from "../../models/chat.js";
import User from "../../models/User.js";
import ApiError from "../../utils/ApiError.js";
import { ROLES } from "../../constants/roles.js";
import { buildChatAttachmentUrl } from "../../utils/fileUrls.js";

const idOf = (value) =>
  String(value?._id || value?.id || value || "");

const isAdmin = (user) => user?.role === ROLES.ADMIN;

const activeUserFilter = {
  isDeleted: false,
  status: "active",
};

function requireId(value, label = "ID") {
  const normalizedId =
    value && typeof value === "object"
      ? String(value._id || value.id || "").trim()
      : String(value ?? "").trim();

  if (!mongoose.isValidObjectId(normalizedId)) {
    throw new ApiError(400, `Invalid ${label}.`);
  }

  return normalizedId;
}

function memberIds(chat) {
  return (chat.members || []).map((member) => idOf(member.user));
}

function hasMember(chat, userId) {
  return memberIds(chat).includes(idOf(userId));
}

async function getChat(chatId, user, populate = true) {
  const validChatId = requireId(chatId, "conversation ID");

  let query = Chat.findById(validChatId);

  if (populate) {
    query = query
      .populate("members.user", "name email role avatarUrl status")
      .populate("admins", "name email role avatarUrl")
      .populate("messages.sender", "name email role avatarUrl")
      .populate("messages.mentions", "name role avatarUrl");
  }

  const chat = await query;

  if (!chat) {
    throw new ApiError(404, "Conversation not found.");
  }

  if (!hasMember(chat, user._id)) {
    throw new ApiError(
      403,
      "You do not have access to this conversation."
    );
  }

  return chat;
}

function clearedAtFor(chat, userId) {
  const item = (chat.clearedFor || []).find(
    (entry) => idOf(entry.user) === idOf(userId)
  );

  return item?.clearedAt || null;
}

function visibleMessages(chat, userId) {
  const clearedAt = clearedAtFor(chat, userId);

  return (chat.messages || []).filter((message) => {
    if (message.deleted) return false;

    return (
      !clearedAt ||
      new Date(message.createdAt) > new Date(clearedAt)
    );
  });
}

function serializeMessage(message, chatId) {
  const sender = message.sender || {};
  const reply = message.replyTo
    ? message.parentMessage || null
    : null;

  return {
    id: idOf(message._id),
    _id: idOf(message._id),
    conversationId: idOf(chatId),
    sender: {
      id: idOf(sender._id || message.sender),
      name: sender.name || "User",
      role: sender.role || "",
      avatar: sender.avatarUrl || "",
    },
    text: message.text || "",
    createdAt: message.createdAt,
    updatedAt: message.updatedAt,
    replyTo: reply
      ? {
          id: idOf(reply._id),
          text: reply.text || "",
          senderName: reply.sender?.name || "User",
        }
      : null,
    replyToId: message.replyTo
      ? idOf(message.replyTo)
      : null,
    reactions: (message.reactions || []).map((reaction) => ({
      emoji: reaction.emoji,
      userIds: (reaction.userIds || []).map(idOf),
    })),
    pinned: Boolean(message.pinned),
    attachments: message.attachments || [],
    mentions: (message.mentions || []).map((person) => ({
      id: idOf(person._id || person),
      name: person.name || "",
      role: person.role || "",
    })),
    forwardedFrom: message.forwardedFrom
      ? idOf(message.forwardedFrom)
      : null,
  };
}

function serializeConversation(chat, currentUserId) {
  const conversationId = idOf(chat._id);
  const currentId = idOf(currentUserId);

  const members = (chat.members || []).map((entry) => {
    const person = entry.user || {};
    const memberId = idOf(person._id || person);

    return {
      id: memberId,
      _id: memberId,
      name: person.name || "User",
      email: person.email || "",
      role: person.role || "",
      avatar: person.avatarUrl || "",
      lastReadAt: entry.lastReadAt || null,
      joinedAt: entry.joinedAt || null,
    };
  });

  const otherMembers = members.filter(
    (person) => person.id !== currentId
  );

  const latest = [...(chat.messages || [])]
    .filter((message) => !message.deleted)
    .sort(
      (a, b) =>
        new Date(b.createdAt) - new Date(a.createdAt)
    )[0];

  const currentMember = (chat.members || []).find(
    (entry) => idOf(entry.user) === currentId
  );

  const clearedAt = clearedAtFor(chat, currentId);

  const unreadCount = (chat.messages || []).filter((message) => {
    if (
      message.deleted ||
      idOf(message.sender) === currentId
    ) {
      return false;
    }

    if (
      clearedAt &&
      new Date(message.createdAt) <= new Date(clearedAt)
    ) {
      return false;
    }

    return (
      !currentMember?.lastReadAt ||
      new Date(message.createdAt) >
        new Date(currentMember.lastReadAt)
    );
  }).length;

  return {
    id: conversationId,
    _id: conversationId,
    type: chat.type,
    name:
      chat.type === "group"
        ? chat.name || "Group chat"
        : otherMembers.map((person) => person.name).join(", ") ||
          "Direct chat",
    members,
    admins: (chat.admins || []).map(idOf),
    lastMessage: latest
      ? {
          text:
            latest.text ||
            (latest.attachments?.length ? "Attachment" : ""),
          createdAt: latest.createdAt,
        }
      : {
          text: chat.lastMessageText || "",
          createdAt: chat.lastMessageAt,
        },
    lastMessageAt: chat.lastMessageAt,
    unreadCount,
    createdAt: chat.createdAt,
  };
}

async function loadPopulatedChat(chatId) {
  return Chat.findById(requireId(chatId, "conversation ID"))
    .populate("members.user", "name email role avatarUrl status")
    .populate("admins", "name email role avatarUrl")
    .populate("messages.sender", "name email role avatarUrl")
    .populate("messages.mentions", "name role avatarUrl");
}

export async function listConversations(user) {
  const chats = await Chat.find({
    "members.user": user._id,
  })
    .populate("members.user", "name email role avatarUrl status")
    .populate("admins", "name email role avatarUrl")
    .sort({ lastMessageAt: -1, updatedAt: -1 });

  return {
    conversations: chats.map((chat) =>
      serializeConversation(chat, user._id)
    ),
  };
}

export async function getConversation(chatId, user) {
  const chat = await getChat(chatId, user);

  return {
    conversation: serializeConversation(chat, user._id),
  };
}

export async function createConversation(data = {}, user) {
  const type = data.type === "group" ? "group" : "direct";
  const requestedIds = Array.isArray(data.memberIds)
    ? data.memberIds
    : [];

  const ids = [
    ...new Set([
      idOf(user._id),
      ...requestedIds.map((value) =>
        typeof value === "object"
          ? idOf(value)
          : String(value ?? "").trim()
      ),
    ]),
  ];

  if (ids.length < 2) {
    throw new ApiError(400, "At least two members are required.");
  }

  if (ids.some((id) => !mongoose.isValidObjectId(id))) {
    throw new ApiError(400, "One or more member IDs are invalid.");
  }

  if (type === "direct" && ids.length !== 2) {
    throw new ApiError(
      400,
      "A direct chat must have exactly two members."
    );
  }

  const people = await Chat.db.model("User").find({
    _id: { $in: ids },
    ...activeUserFilter,
  }).select("name email role avatarUrl");

  if (people.length !== ids.length) {
    throw new ApiError(400, "One or more members are unavailable.");
  }

  if (type === "direct") {
    const existing = await Chat.findOne({
      type: "direct",
      "members.user": {
        $all: ids.map((id) => new mongoose.Types.ObjectId(id)),
      },
      $expr: {
        $eq: [{ $size: "$members" }, 2],
      },
    });

    if (existing) {
      const populated = await loadPopulatedChat(existing._id);

      return {
        conversation: serializeConversation(populated, user._id),
      };
    }
  }

  const admins = people
    .filter((person) => person.role === ROLES.ADMIN)
    .map((person) => person._id);

  const chat = await Chat.create({
    type,
    name:
      type === "group"
        ? String(data.name || "New group").trim()
        : "",
    members: people.map((person) => ({
      user: person._id,
      lastReadAt: person._id.equals(user._id) ? new Date() : null,
    })),
    admins,
    createdBy: user._id,
    lastMessageAt: new Date(),
  });

  const populated = await loadPopulatedChat(chat._id);

  return {
    conversation: serializeConversation(populated, user._id),
  };
}

export async function getAdminConversation(user) {
  const adminUsers = await User.find({
    role: ROLES.ADMIN,
    ...activeUserFilter,
  }).select("_id");

  if (user.role === ROLES.ADMIN) {
    const ids = adminUsers.map((person) => person._id);

    if (!ids.some((id) => id.equals(user._id))) {
      ids.push(user._id);
    }

    let chat = await Chat.findOne({
      type: "group",
      name: "Admin Team",
      "members.user": user._id,
    });

    if (!chat) {
      chat = await Chat.create({
        type: "group",
        name: "Admin Team",
        members: ids.map((id) => ({ user: id })),
        admins: ids,
        createdBy: user._id,
      });
    }

    const populated = await loadPopulatedChat(chat._id);

    return {
      conversation: serializeConversation(populated, user._id),
    };
  }

  const ids = [
    ...new Set([
      idOf(user._id),
      ...adminUsers.map((person) => idOf(person._id)),
    ]),
  ];

  let chat = await Chat.findOne({
    type: "group",
    name: `Admin Support ${idOf(user._id)}`,
    "members.user": user._id,
  });

  if (!chat) {
    chat = await Chat.create({
      type: "group",
      name: `Admin Support ${idOf(user._id)}`,
      members: ids.map((id) => ({ user: id })),
      admins: adminUsers.map((person) => person._id),
      createdBy: user._id,
    });
  }

  const populated = await loadPopulatedChat(chat._id);

  return {
    conversation: serializeConversation(populated, user._id),
  };
}

export async function getMessages(chatId, user, before) {
  const chat = await getChat(chatId, user);
  let messages = visibleMessages(chat, user._id);

  if (before && !Number.isNaN(new Date(before).getTime())) {
    messages = messages.filter(
      (message) =>
        new Date(message.createdAt) < new Date(before)
    );
  }

  messages.sort(
    (a, b) =>
      new Date(a.createdAt) - new Date(b.createdAt)
  );

  const serialized = messages.map((message) =>
    serializeMessage(message, chat._id)
  );

  for (const item of serialized) {
    if (!item.replyToId) continue;

    const parent = chat.messages.id(item.replyToId);

    if (parent && !parent.deleted) {
      const parentSender = await User.findById(parent.sender)
        .select("name");

      item.replyTo = {
        id: idOf(parent._id),
        text: parent.text || "",
        senderName: parentSender?.name || "User",
      };
    }
  }

  return { messages: serialized };
}

export async function sendMessage(chatId, data = {}, user) {
  const chat = await getChat(chatId, user, false);
  const text = String(data.text || "").trim();

  const attachments = Array.isArray(data.attachmentIds)
    ? data.attachmentIds
    : [];

  if (!text && !attachments.length) {
    throw new ApiError(
      400,
      "A message or attachment is required."
    );
  }

  if (text.length > 10000) {
    throw new ApiError(400, "Message is too long.");
  }

  let replyTo = null;

  if (data.replyToId) {
    const replyId = requireId(data.replyToId, "reply ID");
    const parent = chat.messages.id(replyId);

    if (!parent || parent.deleted) {
      throw new ApiError(404, "Reply message not found.");
    }

    replyTo = parent._id;
  }

  const validAttachments = attachments.map((attachmentId) => {
    if (
      typeof attachmentId !== "string" ||
      !attachmentId.startsWith("chat/")
    ) {
      throw new ApiError(400, "Invalid attachment ID.");
    }

    return attachmentId;
  });

  const resolvedAttachments = validAttachments.map(
    (attachmentId) => ({
      id: attachmentId,
      name: attachmentId.split("/").pop(),
      url: buildChatAttachmentUrl(attachmentId.split("/").pop()),
      mimeType: "application/octet-stream",
      size: 0,
    })
  );

  chat.messages.push({
    sender: user._id,
    text,
    attachments: resolvedAttachments,
    replyTo,
    mentions: Array.isArray(data.mentions)
      ? data.mentions.filter((id) =>
          mongoose.isValidObjectId(id)
        )
      : [],
    readBy: [user._id],
  });

  chat.lastMessageAt = new Date();
  chat.lastMessageText = text || "Attachment";
  chat.clearedFor = (chat.clearedFor || []).filter(
    (entry) => !entry.user.equals(user._id)
  );

  await chat.save();

  const populated = await loadPopulatedChat(chat._id);
  const message =
    populated.messages[populated.messages.length - 1];

  return {
    message: serializeMessage(message, populated._id),
    conversation: serializeConversation(populated, user._id),
  };
}

export async function markRead(chatId, user) {
  const chat = await getChat(chatId, user, false);

  const member = chat.members.find((entry) =>
    entry.user.equals(user._id)
  );

  if (!member) {
    throw new ApiError(403, "You are not a member of this conversation.");
  }

  member.lastReadAt = new Date();

  chat.messages.forEach((message) => {
    const alreadyRead = (message.readBy || []).some((id) =>
      id.equals(user._id)
    );

    if (!alreadyRead) {
      message.readBy.push(user._id);
    }
  });

  await chat.save();

  return {
    conversationId: idOf(chat._id),
    unreadCount: 0,
  };
}

export async function addMembers(chatId, data = {}, user) {
  const chat = await getChat(chatId, user, false);

  if (chat.type !== "group") {
    throw new ApiError(
      400,
      "Members can only be added to group chats."
    );
  }

  if (
    !isAdmin(user) &&
    !(chat.admins || []).some((id) => id.equals(user._id))
  ) {
    throw new ApiError(
      403,
      "Only group admins can add members."
    );
  }

  const requestedIds = Array.isArray(data.memberIds)
    ? data.memberIds
    : [];

  const ids = [
    ...new Set(
      requestedIds.map((value) =>
        typeof value === "object"
          ? idOf(value)
          : String(value ?? "").trim()
      )
    ),
  ];

  if (!ids.length) {
    throw new ApiError(400, "Select at least one member.");
  }

  if (ids.some((id) => !mongoose.isValidObjectId(id))) {
    throw new ApiError(400, "One or more member IDs are invalid.");
  }

  const existingIds = memberIds(chat);
  const newIds = ids.filter((id) => !existingIds.includes(id));

  const people = await User.find({
    _id: { $in: newIds },
    ...activeUserFilter,
  }).select("_id");

  if (people.length !== newIds.length) {
    throw new ApiError(400, "One or more members are unavailable.");
  }

  people.forEach((person) => {
    chat.members.push({ user: person._id });
  });

  await chat.save();

  const populated = await loadPopulatedChat(chat._id);

  return {
    conversation: serializeConversation(populated, user._id),
  };
}

export async function leaveGroup(chatId, user) {
  const chat = await getChat(chatId, user, false);

  if (chat.type !== "group") {
    throw new ApiError(400, "This is not a group chat.");
  }

  chat.members = chat.members.filter(
    (entry) => !entry.user.equals(user._id)
  );

  chat.admins = (chat.admins || []).filter(
    (id) => !id.equals(user._id)
  );

  await chat.save();

  return {
    conversationId: idOf(chat._id),
    left: true,
  };
}

export async function clearChat(chatId, user) {
  const chat = await getChat(chatId, user, false);
  const now = new Date();

  const existing = (chat.clearedFor || []).find(
    (entry) => entry.user.equals(user._id)
  );

  if (existing) {
    existing.clearedAt = now;
  } else {
    chat.clearedFor.push({
      user: user._id,
      clearedAt: now,
    });
  }

  await chat.save();

  return {
    conversationId: idOf(chat._id),
    cleared: true,
  };
}

export async function deleteMessage(chatId, messageId, user) {
  const chat = await getChat(chatId, user, false);
  const validMessageId = requireId(messageId, "message ID");
  const message = chat.messages.id(validMessageId);

  if (!message || message.deleted) {
    throw new ApiError(404, "Message not found.");
  }

  if (!message.sender.equals(user._id) && !isAdmin(user)) {
    throw new ApiError(
      403,
      "You cannot delete this message."
    );
  }

  message.deleted = true;
  message.text = "";
  message.attachments = [];

  await chat.save();

  return {
    conversationId: idOf(chat._id),
    messageId: idOf(message._id),
  };
}

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

  const chat = await getChat(chatId, user, false);
  const validMessageId = requireId(messageId, "message ID");
  const message = chat.messages.id(validMessageId);

  if (!message || message.deleted) {
    throw new ApiError(404, "Message not found.");
  }

  let reaction = message.reactions.find(
    (item) => item.emoji === emoji
  );

  if (!reaction) {
    message.reactions.push({
      emoji,
      userIds: [user._id],
    });
  } else {
    const hasReacted = reaction.userIds.some((id) =>
      id.equals(user._id)
    );

    if (hasReacted) {
      reaction.userIds = reaction.userIds.filter(
        (id) => !id.equals(user._id)
      );

      if (!reaction.userIds.length) {
        message.reactions = message.reactions.filter(
          (item) => item.emoji !== emoji
        );
      }
    } else {
      reaction.userIds.push(user._id);
    }
  }

  await chat.save();

  return {
    messageId: idOf(message._id),
    reactions: message.reactions,
  };
}

export async function pinMessage(
  chatId,
  messageId,
  data = {},
  user
) {
  const chat = await getChat(chatId, user, false);
  const validMessageId = requireId(messageId, "message ID");
  const message = chat.messages.id(validMessageId);

  if (!message || message.deleted) {
    throw new ApiError(404, "Message not found.");
  }

  message.pinned = Boolean(data.pinned);

  await chat.save();

  return {
    messageId: idOf(message._id),
    pinned: message.pinned,
  };
}

export async function forwardMessage(
  messageId,
  data = {},
  user
) {
  const sourceId = requireId(messageId, "message ID");

  const requestedIds = Array.isArray(data.conversationIds)
    ? data.conversationIds
    : [];

  const conversationIds = [
    ...new Set(
      requestedIds.map((value) =>
        typeof value === "object"
          ? idOf(value)
          : String(value ?? "").trim()
      )
    ),
  ];

  if (!conversationIds.length) {
    throw new ApiError(
      400,
      "Select at least one destination conversation."
    );
  }

  if (
    conversationIds.some(
      (conversationId) =>
        !mongoose.isValidObjectId(conversationId)
    )
  ) {
    throw new ApiError(
      400,
      "One or more destination conversation IDs are invalid."
    );
  }

  const sourceChat = await Chat.findOne({
    "messages._id": sourceId,
    "members.user": user._id,
  });

  if (!sourceChat) {
    throw new ApiError(404, "Message not found.");
  }

  const sourceMessage = sourceChat.messages.id(sourceId);

  if (!sourceMessage || sourceMessage.deleted) {
    throw new ApiError(404, "Message not found.");
  }

  const results = [];

  for (const conversationId of conversationIds) {
    const target = await getChat(
      conversationId,
      user,
      false
    );

    target.messages.push({
      sender: user._id,
      text: sourceMessage.text,
      attachments: sourceMessage.attachments,
      forwardedFrom: sourceMessage._id,
      readBy: [user._id],
    });

    target.lastMessageAt = new Date();
    target.lastMessageText =
      sourceMessage.text || "Forwarded attachment";

    await target.save();

    results.push(idOf(target._id));
  }

  return {
    forwardedTo: results,
  };
}

export async function listUsers(search = "", user) {
  const query = {
    ...activeUserFilter,
    _id: { $ne: user._id },
  };

  const term = String(search || "").trim();

  if (term) {
    const escaped = term.replace(
      /[.*+?^${}()|[\]\\]/g,
      "\\$&"
    );

    query.$or = [
      { name: { $regex: escaped, $options: "i" } },
      { email: { $regex: escaped, $options: "i" } },
      { department: { $regex: escaped, $options: "i" } },
    ];
  }

  const users = await User.find(query)
    .select("name email role avatarUrl department designation")
    .sort({ name: 1 })
    .limit(50)
    .lean();

  return {
    users: users.map((person) => ({
      id: idOf(person._id),
      _id: idOf(person._id),
      name: person.name,
      email: person.email,
      role: person.role,
      avatar: person.avatarUrl || "",
      department: person.department || "",
      designation: person.designation || "",
    })),
  };
}

export async function getAttachmentAccess(
  attachmentId,
  user
) {
  const chat = await Chat.findOne({
    "members.user": user._id,
    "messages.attachments.id": attachmentId,
  });

  if (!chat) {
    throw new ApiError(404, "Attachment not found.");
  }

  return true;
}
