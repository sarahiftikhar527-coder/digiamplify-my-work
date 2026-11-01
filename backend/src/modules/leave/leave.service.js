
import mongoose from "mongoose";
import Leave from "../../models/Leave.js";

const LEAVE_TYPES = ["Annual Leave", "Sick Leave", "Casual Leave"];
const STATUSES = ["pending", "approved", "unapproved", "cancelled"];

const parseDate = (value) => {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value || "")) return null;

  const date = new Date(`${value}T00:00:00.000Z`);

  return !Number.isNaN(date.getTime()) &&
    date.toISOString().slice(0, 10) === value
    ? date
    : null;
};

const getWorkingDays = (from, to) => {
  const start = parseDate(from);
  const end = parseDate(to);

  if (!start || !end || end < start) return 0;

  let days = 0;

  for (
    const date = new Date(start);
    date <= end;
    date.setUTCDate(date.getUTCDate() + 1)
  ) {
    const day = date.getUTCDay();

    if (day !== 0 && day !== 6) days++;
  }

  return days;
};

const validId = (id) => mongoose.isValidObjectId(id);

const getEmployeeQuery = (employeeId) => ({
  employee: employeeId,
  status: { $in: ["pending", "approved"] },
});

export const createLeave = async (employeeId, payload) => {
  if (!validId(employeeId)) {
    throw new Error("Invalid employee account.");
  }

  const { type, from, to, reason } = payload;

  if (!LEAVE_TYPES.includes(type)) {
    throw new Error("Invalid leave type.");
  }

  const start = parseDate(from);
  const end = parseDate(to);
  const today = new Date().toISOString().slice(0, 10);

  if (!start || !end) {
    throw new Error("Valid start and end dates are required.");
  }

  if (from < today) {
    throw new Error("Leave start date cannot be in the past.");
  }

  if (to < from) {
    throw new Error("End date cannot be before start date.");
  }

  if (typeof reason !== "string" || !reason.trim()) {
    throw new Error("Leave reason is required.");
  }

  if (reason.trim().length > 1000) {
    throw new Error("Leave reason is too long.");
  }

  const days = getWorkingDays(from, to);

  if (!days) {
    throw new Error("The selected dates contain no working days.");
  }

  const overlap = await Leave.exists({
    ...getEmployeeQuery(employeeId),
    from: { $lte: to },
    to: { $gte: from },
  });

  if (overlap) {
    throw new Error("These dates overlap an existing leave request.");
  }

  const leave = await Leave.create({
    employee: employeeId,
    type,
    from,
    to,
    days,
    reason: reason.trim(),
    status: "pending",
    appliedOn: today,
  });

  return leave;
};

export const getMyLeaves = async (employeeId) => {
  if (!validId(employeeId)) {
    throw new Error("Invalid employee account.");
  }

  return Leave.find({ employee: employeeId })
    .sort({ createdAt: -1 })
    .lean();
};

export const cancelMyLeave = async (employeeId, leaveId) => {
  if (!validId(employeeId) || !validId(leaveId)) {
    throw new Error("Invalid employee or leave ID.");
  }

  const leave = await Leave.findOne({
    _id: leaveId,
    employee: employeeId,
  });

  if (!leave) {
    throw new Error("Leave request not found.");
  }

  if (leave.status !== "pending") {
    throw new Error("Only pending leave requests can be cancelled.");
  }

  leave.status = "cancelled";
  await leave.save();

  return leave;
};

export const getAllLeaves = async ({ status, employeeId } = {}) => {
  const query = {};

  if (status && status !== "all") {
    if (!STATUSES.includes(status)) {
      throw new Error("Invalid leave status filter.");
    }

    query.status = status;
  }

  if (employeeId) {
    if (!validId(employeeId)) {
      throw new Error("Invalid employee ID.");
    }

    query.employee = employeeId;
  }

  return Leave.find(query)
    .populate("employee", "name email")
    .populate("reviewedBy", "name email")
    .sort({ createdAt: -1 })
    .lean();
};

export const reviewLeave = async (
  adminId,
  leaveId,
  { status, remarks = "" }
) => {
  if (!validId(adminId) || !validId(leaveId)) {
    throw new Error("Invalid admin or leave ID.");
  }

  if (!["approved", "unapproved"].includes(status)) {
    throw new Error("Status must be approved or unapproved.");
  }

  if (typeof remarks !== "string" || remarks.trim().length > 1000) {
    throw new Error("Remarks must be under 1000 characters.");
  }

  const leave = await Leave.findById(leaveId);

  if (!leave) {
    throw new Error("Leave request not found.");
  }

  if (leave.status !== "pending") {
    throw new Error("Only pending requests can be reviewed.");
  }

  if (status === "approved") {
    const overlap = await Leave.exists({
      _id: { $ne: leave._id },
      employee: leave.employee,
      status: "approved",
      from: { $lte: leave.to },
      to: { $gte: leave.from },
    });

    if (overlap) {
      throw new Error("This employee already has approved leave on these dates.");
    }
  }

  leave.status = status;
  leave.remarks = remarks.trim();
  leave.reviewedBy = adminId;
  leave.reviewedAt = new Date();

  await leave.save();

  return Leave.findById(leave._id)
    .populate("employee", "name email")
    .populate("reviewedBy", "name email")
    .lean();
};

export const updateLeaveRemarks = async (adminId, leaveId, remarks) => {
  if (!validId(adminId) || !validId(leaveId)) {
    throw new Error("Invalid admin or leave ID.");
  }

  if (typeof remarks !== "string" || remarks.trim().length > 1000) {
    throw new Error("Remarks must be under 1000 characters.");
  }

  const leave = await Leave.findById(leaveId);

  if (!leave) {
    throw new Error("Leave request not found.");
  }

  leave.remarks = remarks.trim();
  leave.reviewedBy = adminId;
  leave.reviewedAt = new Date();

  await leave.save();

  return leave;
};

export const getLeaveBalances = async (employeeId) => {
  if (!validId(employeeId)) {
    throw new Error("Invalid employee account.");
  }

  const types = [
    { name: "Annual Leave", total: 20 },
    { name: "Sick Leave", total: 10 },
    { name: "Casual Leave", total: 8 },
  ];

  const leaves = await Leave.find({
    employee: employeeId,
    status: { $in: ["pending", "approved"] },
  }).lean();

  return types.map((type) => {
    const used = leaves
      .filter((leave) => leave.type === type.name && leave.status === "approved")
      .reduce((sum, leave) => sum + leave.days, 0);

    const reserved = leaves
      .filter((leave) => leave.type === type.name && leave.status === "pending")
      .reduce((sum, leave) => sum + leave.days, 0);

    return {
      ...type,
      used,
      reserved,
      remaining: Math.max(0, type.total - used - reserved),
    };
  });
};
