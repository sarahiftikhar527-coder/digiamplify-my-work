
import { ROLES } from "../../constants/roles.js";
import User from "../../models/User.js";
import Attendance from "../attendance/attendance.model.js";
import Task from "../../models/Task.js";

function getDateKey(timeZone = "UTC", date = new Date()) {
  const parts = new Intl.DateTimeFormat("en-CA", {
    timeZone,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).formatToParts(date);

  const values = Object.fromEntries(
    parts.map((part) => [part.type, part.value])
  );

  return `${values.year}-${values.month}-${values.day}`;
}

function getEmployeeTimeZone(user) {
  const timeZone = user?.timeZone || "UTC";

  try {
    new Intl.DateTimeFormat("en-US", { timeZone });
    return timeZone;
  } catch {
    return "UTC";
  }
}

const employeeFields = "name email department designation status timeZone";

export async function getAdminStats() {
  const now = new Date();

  const [
    totalEmployees,
    clockedInEmployees,
    totalTasks,
    pendingTasks,
    inProgressTasks,
    completedTasks,
    overdueTasks,
  ] = await Promise.all([
    User.countDocuments({
      role: ROLES.EMPLOYEE,
      status: "active",
      isDeleted: false,
    }),

    getClockedInEmployees(),

    Task.countDocuments({}),

    Task.countDocuments({ status: "pending" }),

    Task.countDocuments({ status: "in-progress" }),

    Task.countDocuments({ status: "completed" }),

    Task.countDocuments({
      status: { $ne: "completed" },
      dueDate: { $lt: now },
    }),
  ]);

  return [
    {
      id: "totalTasks",
      icon: "tasks",
      label: "Total Tasks",
      period: "All employees",
      value: totalTasks,
    },
    {
      id: "pending",
      icon: "clock",
      label: "Pending Tasks",
      period: "All employees",
      value: pendingTasks,
    },
    {
      id: "inProgress",
      icon: "progress",
      label: "In Progress",
      period: "All employees",
      value: inProgressTasks,
    },
    {
      id: "completed",
      icon: "check",
      label: "Completed Tasks",
      period: "All time",
      value: completedTasks,
    },
    {
      id: "overdue",
      icon: "alert",
      label: "Overdue Tasks",
      period: "All employees",
      value: overdueTasks,
    },
    {
      id: "clock",
      icon: "clock",
      label: "Clocked In",
      period: "Employees' local dates",
      value: clockedInEmployees.length,
    },
    {
      id: "users",
      icon: "users",
      label: "Total Employees",
      period: "Active",
      value: totalEmployees,
    },
  ];
}

export async function getClockedInEmployees() {
  const records = await Attendance.find({
    clockInAt: { $ne: null },
    clockOutAt: null,
  })
    .populate("user", employeeFields)
    .sort({ clockInAt: -1 })
    .lean();

  const now = new Date();

  return records.filter((record) => {
    if (!record.user) return false;

    const timeZone = getEmployeeTimeZone(record.user);
    const employeeDateKey = getDateKey(timeZone, now);

    return record.dateKey === employeeDateKey;
  });
}

export async function getCompletedTasksToday() {
  return Task.find({ status: "completed" })
    .populate("assignedTo", employeeFields)
    .sort({ completedAt: -1 })
    .lean();
}

export async function getOverdueTasks() {
  const now = new Date();

  return Task.find({
    status: { $ne: "completed" },
    dueDate: { $lt: now },
  })
    .populate("assignedTo", employeeFields)
    .sort({ dueDate: 1 })
    .lean();
}

export async function getAdminTasksByStatus(status) {
  const allowedStatuses = [
    "all",
    "pending",
    "in-progress",
    "completed",
    "overdue",
  ];

  if (!allowedStatuses.includes(status)) {
    const error = new Error("Invalid task status.");
    error.statusCode = 400;
    throw error;
  }

  const filter = {};

  if (status === "overdue") {
    filter.status = { $ne: "completed" };
    filter.dueDate = { $lt: new Date() };
  } else if (status !== "all") {
    filter.status = status;
  }

  return Task.find(filter)
    .populate("assignedTo", employeeFields)
    .populate("assignedBy", "name email")
    .sort({ createdAt: -1 })
    .lean();
}
