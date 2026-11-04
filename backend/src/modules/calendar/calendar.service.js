
import mongoose from "../../utils/mongooseCompat.js";
import Calendar from "../../models/Calendar.js";
import User from "../../models/User.js";
import {
  isAdmin,
  forbidden,
  canEmployeeReadEvent,
  canEmployeeMutateEvent,
  assertEmployeeCreateEventType,
  isCompanyHoliday,
} from "./calendar.auth.js";

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

const CREATE_FIELDS = [
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
  "description",
  "leaveType",
  "approverIds",
  "attachments",
];

const UPDATE_FIELDS = [
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
  "description",
  "leaveType",
];

const LEAVE_TYPES = ["Sick", "Casual", "Annual", "Unpaid"];

const EMPLOYEE_CREATE_BLOCKED = new Set([
  "clockIn",
  "clockOut",
  "worked",
  "status",
  "employeeId",
  "reviewedBy",
  "reviewedAt",
]);

export function actorFromUser(user) {
  return {
    userId: String(user._id || user.id),
    role: user.role,
  };
}

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

const pickFields = (payload, fields) => {
  const data = {};

  for (const field of fields) {
    if (payload[field] !== undefined) {
      data[field] = payload[field];
    }
  }

  return data;
};

const normalizePayload = (payload = {}, { allowedFields = CREATE_FIELDS } = {}) => {
  const data = pickFields(payload, allowedFields);

  if (data.eventType && !EVENT_TYPES.includes(data.eventType)) {
    throw new Error("Invalid calendar event type.");
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

async function resolveActiveUserId(employeeId) {
  if (!mongoose.isValidObjectId(employeeId)) {
    throw new Error("Invalid employee ID.");
  }

  const user = await User.findOne({
    _id: employeeId,
    status: "active",
    isDeleted: false,
  }).select("_id");

  if (!user) {
    throw new Error("The selected employee is not available.");
  }

  return user._id;
}

function employeeReadFilter(actor) {
  const userObjectId = new mongoose.Types.ObjectId(actor.userId);

  return {
    $or: [
      { employeeId: userObjectId },
      { eventType: "holiday", employeeId: null },
    ],
  };
}

export const searchCalendarApprovers = async (search = "") => {
  const queryText = String(search || "").trim();
  const filter = { role: { $regex: /^admin$/i } };

  if (queryText) {
    const escaped = queryText.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
    const regex = new RegExp(escaped, "i");

    filter.$or = [
      { name: regex },
      { fullName: regex },
      { username: regex },
    ];
  }

  const users = await User.find(filter)
    .select("_id name fullName username role department")
    .limit(20)
    .lean();

  return users.map((user) => ({
    id: String(user._id),
    name:
      user.name ||
      user.fullName ||
      user.username ||
      "Admin",
    role: user.role || "admin",
    department: user.department || "",
  }));
};

export const getCalendarEvents = async (actor, filters = {}) => {
  const query = {};

  if (!isAdmin(actor)) {
    Object.assign(query, employeeReadFilter(actor));

    if (
      filters.employeeId &&
      String(filters.employeeId) !== actor.userId
    ) {
      throw forbidden("You do not have permission to view these events.");
    }
  } else if (filters.employeeId) {
    if (!mongoose.isValidObjectId(filters.employeeId)) {
      throw new Error("Invalid employee ID.");
    }

    query.employeeId = filters.employeeId;
  }

  if (filters.eventType) {
    query.eventType = filters.eventType;
  }

  if (filters.status) {
    query.status = filters.status;
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
    .populate("employeeId", "name role")
    .populate("createdBy", "name")
    .populate("reviewedBy", "name")
    .sort({ from: 1, createdAt: -1 })
    .lean();
};

export const getCalendarEventById = async (actor, id) => {
  if (!mongoose.isValidObjectId(id)) {
    throw new Error("Invalid calendar event ID.");
  }

  const event = await Calendar.findById(id)
    .populate("employeeId", "name role")
    .populate("createdBy", "name")
    .populate("reviewedBy", "name")
    .lean();

  if (!event) {
    throw new Error("Calendar event not found.");
  }

  if (!isAdmin(actor) && !canEmployeeReadEvent(event, actor.userId)) {
    throw forbidden("You do not have permission to view this event.");
  }

  return event;
};

export const createCalendarEvent = async (actor, payload) => {
  const sanitized = { ...payload };

  if (!isAdmin(actor)) {
    for (const key of EMPLOYEE_CREATE_BLOCKED) {
      delete sanitized[key];
    }

    assertEmployeeCreateEventType(sanitized.eventType);
  } else if (
    ["holiday", "shift", "attendance"].includes(sanitized.eventType)
  ) {
    // admin-only types
  }

  const data = normalizePayload(sanitized, { allowedFields: CREATE_FIELDS });

  if (!data.eventType) {
    throw new Error("Event type is required.");
  }

  if (!data.from || !data.to) {
    throw new Error("Both from and to dates are required.");
  }

  if (!isAdmin(actor)) {
    if (data.eventType !== "leave") {
      throw forbidden(
        "You do not have permission to create this type of calendar event."
      );
    }
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

    if (isAdmin(actor) && data.employeeId) {
      data.employeeId = await resolveActiveUserId(data.employeeId);
    } else {
      data.employeeId = new mongoose.Types.ObjectId(actor.userId);
    }

    data.status = "pending";
  } else if (isAdmin(actor)) {
    if (data.employeeId) {
      data.employeeId = await resolveActiveUserId(data.employeeId);
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
  }

  data.createdBy = new mongoose.Types.ObjectId(actor.userId);

  delete data.leaveType;
  delete data.approverIds;
  delete data.attachments;

  const event = await Calendar.create(data);

  return Calendar.findById(event._id)
    .populate("employeeId", "name role")
    .populate("createdBy", "name")
    .populate("reviewedBy", "name")
    .lean();
};

export const updateCalendarEvent = async (actor, id, payload) => {
  if (!mongoose.isValidObjectId(id)) {
    throw new Error("Invalid calendar event ID.");
  }

  const existing = await Calendar.findById(id);

  if (!existing) {
    throw new Error("Calendar event not found.");
  }

  if (isCompanyHoliday(existing) && !isAdmin(actor)) {
    throw forbidden("You do not have permission to edit this event.");
  }

  if (!isAdmin(actor) && !canEmployeeMutateEvent(existing, actor.userId)) {
    throw forbidden("You do not have permission to edit this event.");
  }

  const data = normalizePayload(payload, { allowedFields: UPDATE_FIELDS });

  if (existing.eventType === "leave") {
    delete data.employeeId;
    delete data.leaveType;
  }

  if (!isAdmin(actor)) {
    delete data.employeeId;
    delete data.clockIn;
    delete data.clockOut;
    delete data.worked;
  } else if (data.employeeId) {
    data.employeeId = await resolveActiveUserId(data.employeeId);
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
    .populate("employeeId", "name role")
    .populate("createdBy", "name")
    .populate("reviewedBy", "name")
    .lean();
};

export const updateCalendarEventStatus = async (actor, id, status) => {
  if (!isAdmin(actor)) {
    throw forbidden("Only administrators can approve or reject calendar events.");
  }

  if (!mongoose.isValidObjectId(id)) {
    throw new Error("Invalid calendar event ID.");
  }

  const normalizedStatus = String(status || "").toLowerCase();

  if (!["approved", "rejected"].includes(normalizedStatus)) {
    throw new Error("Status must be approved or rejected.");
  }

  const existing = await Calendar.findById(id);

  if (!existing) {
    throw new Error("Calendar event not found.");
  }

  const update = {
    status: normalizedStatus,
    reviewedAt: new Date(),
    reviewedBy: new mongoose.Types.ObjectId(actor.userId),
  };

  return Calendar.findByIdAndUpdate(
    id,
    { $set: update },
    {
      new: true,
      runValidators: true,
    }
  )
    .populate("employeeId", "name role")
    .populate("createdBy", "name")
    .populate("reviewedBy", "name")
    .lean();
};

export const deleteCalendarEvent = async (actor, id) => {
  if (!mongoose.isValidObjectId(id)) {
    throw new Error("Invalid calendar event ID.");
  }

  const existing = await Calendar.findById(id);

  if (!existing) {
    throw new Error("Calendar event not found.");
  }

  if (isCompanyHoliday(existing) && !isAdmin(actor)) {
    throw forbidden("You do not have permission to delete this event.");
  }

  if (!isAdmin(actor) && !canEmployeeMutateEvent(existing, actor.userId)) {
    throw forbidden("You do not have permission to delete this event.");
  }

  const event = await Calendar.findByIdAndDelete(id);

  return event;
};
