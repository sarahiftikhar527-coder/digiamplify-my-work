import { prisma } from "../../config/db.js";
import { ROLES } from "../../constants/roles.js";

const DEFAULT_TIME_ZONE = "Asia/Karachi";
const DONE_STATUSES = ["approved", "completed"];
const MAX_RANGE_DAYS = 366;
const DAY_MS = 24 * 60 * 60 * 1000;

const fail = (message, statusCode = 400) =>
  Object.assign(new Error(message), { statusCode });

function normalizeTimeZone(timeZone) {
  if (!timeZone || typeof timeZone !== "string") return DEFAULT_TIME_ZONE;

  try {
    new Intl.DateTimeFormat("en-US", { timeZone });
    return timeZone;
  } catch {
    return DEFAULT_TIME_ZONE;
  }
}

// "YYYY-MM-DD" of a date in the given time zone.
function dayKey(value, timeZone) {
  if (!value) return "";

  const date = value instanceof Date ? value : new Date(value);

  if (Number.isNaN(date.getTime())) return "";

  return new Intl.DateTimeFormat("en-CA", {
    timeZone,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(date);
}

const isDayKey = (value) => /^\d{4}-\d{2}-\d{2}$/.test(String(value || ""));

function addDays(key, amount) {
  const date = new Date(`${key}T00:00:00Z`);
  date.setUTCDate(date.getUTCDate() + amount);
  return date.toISOString().slice(0, 10);
}

// Number of calendar days from a to b, both included.
function daysBetween(a, b) {
  return (
    Math.round(
      (Date.parse(`${b}T00:00:00Z`) - Date.parse(`${a}T00:00:00Z`)) / DAY_MS
    ) + 1
  );
}

const minKey = (...keys) => keys.filter(Boolean).sort()[0] || "";
const maxKey = (...keys) => keys.filter(Boolean).sort().slice(-1)[0] || "";

/*
|--------------------------------------------------------------------------
| Admin report: raw rows for the Excel export
|--------------------------------------------------------------------------
*/

export async function getAdminTaskReport({
  from,
  to,
  employeeId,
  timeZone,
} = {}) {
  const tz = normalizeTimeZone(timeZone);
  const today = dayKey(new Date(), tz);

  const end = isDayKey(to) ? String(to) : today;
  const start = isDayKey(from) ? String(from) : addDays(end, -29);

  if (start > end) {
    throw fail("Start date cannot be after the end date.");
  }

  if (daysBetween(start, end) > MAX_RANGE_DAYS) {
    throw fail("Please choose a date range of one year or less.");
  }

  const employeeWhere = {
    role: ROLES.EMPLOYEE,
    status: "active",
    isDeleted: false,
  };

  if (employeeId) employeeWhere.id = String(employeeId);

  const employees = await prisma.user.findMany({
    where: employeeWhere,
    select: {
      id: true,
      name: true,
      email: true,
      designation: true,
      department: true,
    },
    orderBy: { name: "asc" },
  });

  if (employeeId && !employees.length) {
    throw fail("Employee not found.", 404);
  }

  const ids = employees.map((employee) => employee.id);

  if (!ids.length) {
    return {
      from: start,
      to: end,
      today,
      generatedAt: new Date().toISOString(),
      employees: [],
      fixedTasks: [],
      updates: [],
      extraTasks: [],
    };
  }

  // Daily updates posted inside the range
  const updateRows = await prisma.taskDailyUpdate.findMany({
    where: {
      employeeId: { in: ids },
      updateDate: { gte: start, lte: end },
    },
    include: { task: { select: { id: true, title: true } } },
    orderBy: [{ updateDate: "asc" }, { createdAt: "asc" }],
  });

  // Fixed daily tasks that were running inside the range
  const dailyRows = await prisma.task.findMany({
    where: { taskType: "daily", assignedToId: { in: ids } },
  });

  const lastDay = minKey(end, today);

  const fixedTasks = dailyRows
    .map((task) => {
      const startKey = task.startDate
        ? dayKey(task.startDate, tz)
        : dayKey(task.createdAt, tz);

      const dueKey = task.dueDate ? dayKey(task.dueDate, tz) : "";
      const stopKey =
        task.isActive === false ? dayKey(task.updatedAt, tz) : "";

      const first = maxKey(startKey, start);
      const last = minKey(lastDay, dueKey, stopKey);

      const expectedDays =
        first && last && first <= last ? daysBetween(first, last) : 0;

      return {
        id: task.id,
        title: task.title,
        employeeId: task.assignedToId,
        startDate: startKey,
        isActive: task.isActive !== false,
        expectedDays,
      };
    })
    .filter((task) => task.expectedDays > 0);

  // Extra tasks with any activity (assigned, due, started, finished) inside the range
  const padFrom = new Date(`${addDays(start, -1)}T00:00:00Z`);
  const padTo = new Date(`${addDays(end, 2)}T00:00:00Z`);
  const padded = { gte: padFrom, lte: padTo };

  const extraRows = await prisma.task.findMany({
    where: {
      taskType: "extra",
      assignedToId: { in: ids },
      OR: [
        { createdAt: padded },
        { dueDate: padded },
        { startedAt: padded },
        { completedAt: padded },
      ],
    },
    include: { assignedBy: { select: { name: true } } },
    orderBy: { createdAt: "asc" },
  });

  const extraTasks = extraRows
    .filter((task) =>
      [task.createdAt, task.dueDate, task.startedAt, task.completedAt]
        .map((value) => dayKey(value, tz))
        .some((key) => key && key >= start && key <= end)
    )
    .map((task) => {
      const status = task.status === "completed" ? "approved" : task.status;

      return {
        id: task.id,
        employeeId: task.assignedToId,
        title: task.title,
        priority: task.priority,
        status,
        isDone: DONE_STATUSES.includes(status),
        assignedBy: task.assignedBy?.name || "",
        createdAt: task.createdAt,
        dueDate: task.dueDate,
        startedAt: task.startedAt || null,
        completedAt: task.completedAt || null,
        timeSpentMinutes: task.timeSpentMinutes || 0,
      };
    });

  return {
    from: start,
    to: end,
    today,
    generatedAt: new Date().toISOString(),
    employees,
    fixedTasks,
    updates: updateRows.map((row) => ({
      id: row.id,
      taskId: row.taskId,
      taskTitle: row.task?.title || "",
      employeeId: row.employeeId,
      updateDate: row.updateDate,
      status: row.status,
      timeSpentMinutes: row.timeSpentMinutes || 0,
      description: row.description,
      updatedAt: row.updatedAt,
    })),
    extraTasks,
  };
}