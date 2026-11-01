import ApiError from "../../utils/ApiError.js";
import { ROLES } from "../../constants/roles.js";
import {
  PURPOSES,
  PREFERENCE_DEFAULTS,
} from "../../constants/notifications.js";
import Notification from "../../models/Notification.js";
import NotificationPreference from "../../models/NotificationPreference.js";
import User from "../../models/User.js";
import { emitToUser } from "../../sockets/index.js";

export async function listForUser(
  userId,
  { page = 1, limit = 100, unread } = {}
) {
  const filter = { to: userId };

  if (unread === "true") {
    filter.read = false;
  }

  const [items, total, unreadCount] = await Promise.all([
    Notification.find(filter)
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(limit)
      .lean(),
    Notification.countDocuments(filter),
    Notification.countDocuments({
      to: userId,
      read: false,
    }),
  ]);

  const normalizedItems = items.map((item) => ({
    ...item,
    id: item._id.toString(),
    to: item.to?.toString(),
    from: item.from?.toString() || null,
    _id: undefined,
    __v: undefined,
  }));

  return {
    items: normalizedItems,
    total,
    unreadCount,
    page,
    limit,
  };
}

async function updateOneOrFail(filter, update) {
  const result = await Notification.updateOne(filter, update);

  if (result.matchedCount === 0) {
    throw new ApiError(404, "Notification not found");
  }
}

export const markRead = (userId, id) =>
  updateOneOrFail(
    { _id: id, to: userId },
    { read: true }
  );

export const markUnread = (userId, id) =>
  updateOneOrFail(
    { _id: id, to: userId },
    { read: false }
  );

export const markAllRead = (userId) =>
  Notification.updateMany(
    { to: userId, read: false },
    { read: true }
  );

export async function remove(userId, id) {
  const result = await Notification.deleteOne({
    _id: id,
    to: userId,
  });

  if (result.deletedCount === 0) {
    throw new ApiError(404, "Notification not found");
  }
}

export const clearAll = (userId) =>
  Notification.deleteMany({ to: userId });

export async function createNotifications(userIds, payload) {
  const uniqueIds = [
    ...new Set((userIds || []).filter(Boolean).map(String)),
  ];

  if (!uniqueIds.length) return [];

  const docs = await Notification.insertMany(
    uniqueIds.map((to) => ({
      ...payload,
      to,
      read: false,
    }))
  );

  for (const doc of docs) {
    emitToUser(String(doc.to), "notification:new", doc.toJSON());
  }

  return docs;
}

export async function listEmployeesForNotifications() {
  const employees = await User.find({
    role: ROLES.EMPLOYEE,
    status: "active",
    isDeleted: false,
  })
    .select("_id name email role")
    .sort({ name: 1 })
    .lean();

  return employees.map((employee) => ({
    id: employee._id.toString(),
    name: employee.name || employee.email || "Employee",
    email: employee.email || "",
    role: employee.role,
  }));
}

export async function send(
  sender,
  { to, purpose, title, details }
) {
  const config = PURPOSES[purpose];

  if (!config) {
    throw new ApiError(400, "Invalid notification purpose");
  }

  const filter = {
    role: ROLES.EMPLOYEE,
    status: "active",
    isDeleted: false,
  };

  if (to !== "all") {
    if (!Array.isArray(to) || to.length === 0) {
      throw new ApiError(400, "Select at least one employee");
    }

    filter._id = { $in: to };
  }

  const employees = await User.find(filter).select("_id");

  if (!employees.length) {
    throw new ApiError(400, "No active employees found");
  }

  const cleanTitle = String(title || "").trim();
  const cleanDetails = String(details || "").trim();

  if (!cleanTitle || !cleanDetails) {
    throw new ApiError(400, "Title and description are required");
  }

  const message =
    cleanDetails.length > 100
      ? `${cleanDetails.slice(0, 100).trim()}…`
      : cleanDetails;

  const docs = await createNotifications(
    employees.map((employee) => employee._id.toString()),
    {
      from: sender.id || sender._id,
      type: purpose,
      tag: config.tag,
      title: cleanTitle,
      message,
      details: cleanDetails,
      link: config.link || "",
      linkLabel: config.linkLabel || "",
    }
  );

  return docs.length;
}

export async function getPreferences(userId) {
  const saved = await NotificationPreference.find({
    user: userId,
  });

  const map = new Map(
    saved.map((item) => [item.key, item.on])
  );

  return PREFERENCE_DEFAULTS.map((item) => ({
    ...item,
    on: map.has(item.key) ? map.get(item.key) : item.on,
  }));
}

export async function setPreference(userId, key, on) {
  await NotificationPreference.updateOne(
    { user: userId, key },
    { $set: { on } },
    { upsert: true }
  );

  return getPreferences(userId);
}