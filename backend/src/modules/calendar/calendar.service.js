
import mongoose from "mongoose";
import Calendar from "../../models/Calendar.js";
import User from "../../models/User.js";

const EVENT_TYPES = ["holiday", "leave", "shift", "attendance"];

const VALID_STATUSES = [
  "pending",
  "approved",
  "rejected",
  "scheduled",
  "completed",
  "absent",
  "cancelled",
];

const EDITABLE_FIELDS = [
  "eventType",
  "title",
  "subject",
  "employeeId",
  "employeeName",
  "role",
  "from",
  "to",
  "startTime",
  "endTime",
  "clockIn",
  "clockOut",
  "worked",
  "status",
  "description",
  "leaveType",
  "approverIds",
  "attachments",
];

const LEAVE_TYPES = ["Sick", "Casual", "Annual", "Unpaid"];

const validateDateRange = (from, to) => {
  const start = new Date(from);
  const end = new Date(to);

  if (
    Number.isNaN(start.getTime()) ||
    Number.isNaN(end.getTime())
  ) {
    throw new Error("Valid from and to dates are required.");
  }

  if (start > end) {
    throw new Error("The start date cannot be after the end date.");
  }

  return { start, end };
};

const normalizeIdArray = (value, fieldName) => {
  if (value === undefined || value === null || value === "") {
    return [];
  }

  let values = value;

  if (typeof values === "string") {
    try {
      values = JSON.parse(values);
    } catch {
      throw new Error(`${fieldName} must be a valid JSON array.`);
    }
  }

  if (!Array.isArray(values)) {
    values = [values];
  }

  const ids = values.map((item) => {
    const id =
      typeof item === "object" && item !== null
        ? item._id || item.id
        : item;

    if (!mongoose.isValidObjectId(id)) {
      throw new Error(`Invalid ID in ${fieldName}.`);
    }

    return new mongoose.Types.ObjectId(id);
  });

  return [...new Map(ids.map((id) => [id.toString(), id])).values()];
};

const normalizeAttachments = (value) => {
  if (value === undefined || value === null || value === "") {
    return [];
  }

  let attachments = value;

  if (typeof attachments === "string") {
    try {
      attachments = JSON.parse(attachments);
    } catch {
      throw new Error("Attachments must be a valid JSON array.");
    }
  }

  if (!Array.isArray(attachments)) {
    attachments = [attachments];
  }

  return attachments;
};

const normalizePayload = (payload = {}) => {
  const data = {};

  for (const field of EDITABLE_FIELDS) {
    if (payload[field] !== undefined) {
      data[field] = payload[field];
    }
  }

  if (data.eventType && !EVENT_TYPES.includes(data.eventType)) {
    throw new Error("Invalid calendar event type.");
  }

  if (data.status && !VALID_STATUSES.includes(data.status)) {
    throw new Error("Invalid calendar event status.");
  }

  if (data.employeeId) {
    if (!mongoose.isValidObjectId(data.employeeId)) {
      throw new Error("Invalid employee ID.");
    }

    data.employeeId = new mongoose.Types.ObjectId(data.employeeId);
  }

  if (data.from !== undefined || data.to !== undefined) {
    if (data.from === undefined || data.to === undefined) {
      throw new Error("Both from and to dates are required.");
    }

    const { start, end } = validateDateRange(data.from, data.to);
    data.from = start;
    data.to = end;
  }

  if (data.leaveType !== undefined && !LEAVE_TYPES.includes(data.leaveType)) {
    throw new Error("Invalid leave type.");
  }

  if (data.approverIds !== undefined) {
    data.approverIds = normalizeIdArray(data.approverIds, "Approver IDs");
  }

  if (data.attachments !== undefined) {
    data.attachments = normalizeAttachments(data.attachments);
  }

  if (data.subject !== undefined && !data.title) {
    data.title = data.subject;
  }

  if (typeof data.title === "string") {
    data.title = data.title.trim();
  }

  if (typeof data.description === "string") {
    data.description = data.description.trim();
  }

  return data;
};

export const searchCalendarApprovers = async (search = "") => {
  const queryText = String(search || "").trim();
  const filter = {};

  if (queryText) {
    const escaped = queryText.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
    const regex = new RegExp(escaped, "i");

    filter.$or = [
      { name: regex },
      { fullName: regex },
      { username: regex },
      { email: regex },
    ];
  }

  filter.role = { $regex: /^admin$/i };

  const users = await User.find(filter)
    .select("_id name fullName username email role")
    .limit(20)
    .lean();

  return users.map((user) => ({
    id: String(user._id),
    _id: user._id,
    name:
      user.name ||
      user.fullName ||
      user.username ||
      user.email ||
      "Admin",
    email: user.email || "",
    role: user.role,
  }));
};

export const getCalendarEvents = async (filters = {}) => {
  const query = {};

  if (filters.eventType) {
    if (!EVENT_TYPES.includes(filters.eventType)) {
      throw new Error("Invalid calendar event type.");
    }

    query.eventType = filters.eventType;
  }

  if (filters.status) {
    if (!VALID_STATUSES.includes(filters.status)) {
      throw new Error("Invalid calendar event status.");
    }

    query.status = filters.status;
  }

  if (filters.employeeId) {
    if (!mongoose.isValidObjectId(filters.employeeId)) {
      throw new Error("Invalid employee ID.");
    }

    query.employeeId = filters.employeeId;
  }

  if (filters.from || filters.to) {
    const start = filters.from ? new Date(filters.from) : null;
    const end = filters.to ? new Date(filters.to) : null;

    if (
      (start && Number.isNaN(start.getTime())) ||
      (end && Number.isNaN(end.getTime()))
    ) {
      throw new Error("Invalid calendar date filter.");
    }

    if (start && end && start > end) {
      throw new Error("The from date cannot be after the to date.");
    }

    if (start && end) {
      query.from = { $lte: end };
      query.to = { $gte: start };
    } else if (start) {
      query.to = { $gte: start };
    } else if (end) {
      query.from = { $lte: end };
    }
  }

  return Calendar.find(query)
    .populate("employeeId", "name email role")
    .populate("createdBy", "name email")
    .populate("reviewedBy", "name email")
    .sort({ from: 1, createdAt: -1 })
    .lean();
};

export const getCalendarEventById = async (id) => {
  if (!mongoose.isValidObjectId(id)) {
    throw new Error("Invalid calendar event ID.");
  }

  const event = await Calendar.findById(id)
    .populate("employeeId", "name email role")
    .populate("createdBy", "name email")
    .populate("reviewedBy", "name email")
    .lean();

  if (!event) {
    throw new Error("Calendar event not found.");
  }

  return event;
};

export const createCalendarEvent = async (payload, userId = null) => {
  const data = normalizePayload(payload);

  if (!data.eventType) {
    throw new Error("Event type is required.");
  }

  if (!data.from || !data.to) {
    throw new Error("Both from and to dates are required.");
  }

  if (data.eventType === "leave") {
    if (!data.title) {
      throw new Error("Leave subject is required.");
    }

    if (!data.description) {
      throw new Error("Leave description is required.");
    }

    if (!data.leaveType) {
      throw new Error("Leave type is required.");
    }

    if (!data.approverIds?.length) {
      throw new Error("At least one approver is required.");
    }

    if (!userId || !mongoose.isValidObjectId(userId)) {
      throw new Error("Authenticated employee is required.");
    }

    data.employeeId = new mongoose.Types.ObjectId(userId);
    data.status = "pending";
  }

  if (userId && mongoose.isValidObjectId(userId)) {
    data.createdBy = new mongoose.Types.ObjectId(userId);
  }

  if (data.eventType === "holiday" && !data.status) {
    data.status = "pending";
  }

  if (data.eventType === "shift" && !data.status) {
    data.status = "scheduled";
  }

  if (data.eventType === "attendance" && !data.status) {
    data.status = "completed";
  }

  const event = await Calendar.create(data);

  return Calendar.findById(event._id)
    .populate("employeeId", "name email role")
    .populate("createdBy", "name email")
    .populate("reviewedBy", "name email")
    .lean();
};

export const updateCalendarEvent = async (id, payload) => {
  if (!mongoose.isValidObjectId(id)) {
    throw new Error("Invalid calendar event ID.");
  }

  const data = normalizePayload(payload);
  const existing = await Calendar.findById(id);

  if (!existing) {
    throw new Error("Calendar event not found.");
  }

  if (existing.eventType === "leave") {
    delete data.employeeId;
    delete data.createdBy;
    delete data.reviewedBy;
    delete data.approverIds;
    delete data.attachments;
    delete data.eventType;
  }

  const nextFrom = data.from ?? existing.from;
  const nextTo = data.to ?? existing.to;

  validateDateRange(nextFrom, nextTo);

  return Calendar.findByIdAndUpdate(
    id,
    { $set: data },
    {
      new: true,
      runValidators: true,
    }
  )
    .populate("employeeId", "name email role")
    .populate("createdBy", "name email")
    .populate("reviewedBy", "name email")
    .lean();
};

export const updateCalendarEventStatus = async (
  id,
  status,
  reviewerId = null
) => {
  if (!mongoose.isValidObjectId(id)) {
    throw new Error("Invalid calendar event ID.");
  }

  const normalizedStatus = String(status || "").toLowerCase();

  if (!VALID_STATUSES.includes(normalizedStatus)) {
    throw new Error("Invalid calendar event status.");
  }

  const existing = await Calendar.findById(id);

  if (!existing) {
    throw new Error("Calendar event not found.");
  }

  if (
    existing.eventType === "leave" &&
    !["approved", "rejected", "pending"].includes(normalizedStatus)
  ) {
    throw new Error(
      "Leave requests can only be pending, approved, or rejected."
    );
  }

  const update = { status: normalizedStatus };

  if (["approved", "rejected"].includes(normalizedStatus)) {
    update.reviewedAt = new Date();

    if (reviewerId && mongoose.isValidObjectId(reviewerId)) {
      update.reviewedBy = new mongoose.Types.ObjectId(reviewerId);
    }
  } else {
    update.reviewedAt = null;
    update.reviewedBy = null;
  }

  return Calendar.findByIdAndUpdate(
    id,
    { $set: update },
    {
      new: true,
      runValidators: true,
    }
  )
    .populate("employeeId", "name email role")
    .populate("createdBy", "name email")
    .populate("reviewedBy", "name email")
    .lean();
};

export const deleteCalendarEvent = async (id) => {
  if (!mongoose.isValidObjectId(id)) {
    throw new Error("Invalid calendar event ID.");
  }

  const event = await Calendar.findByIdAndDelete(id);

  if (!event) {
    throw new Error("Calendar event not found.");
  }

  return event;
};