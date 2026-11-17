import Task from "../../models/Task.js";
import User from "../../models/User.js";
import { prisma } from "../../config/db.js";
import { ROLES } from "../../constants/roles.js";
import { assertCanAssignTo } from "../../utils/hierarchy.js";

const TASK_STATUSES = [
  "pending",
  "in-progress",
  "review",
  "approved",
  "completed",
];

const DONE_STATUSES = ["approved", "completed"];
const TASK_PRIORITIES = ["Low", "Medium", "High"];
const UPDATE_STATUSES = ["in-progress", "completed"];
const DEFAULT_TIME_ZONE = "Asia/Karachi";
const MAX_MINUTES = 60 * 24 * 30;

const MIN_YEAR = 2000;
const MAX_YEAR = 2100;

function createError(message, statusCode = 400) {
  const error = new Error(message);
  error.statusCode = statusCode;
  return error;
}

function assertSaneDate(date, label = "Date") {
  if (Number.isNaN(date.getTime())) {
    throw createError(`${label} is invalid.`);
  }

  const year = date.getFullYear();

  if (year < MIN_YEAR || year > MAX_YEAR) {
    throw createError(
      `${label} must be a valid date (year ${MIN_YEAR} to ${MAX_YEAR}).`
    );
  }
}

function normalizeSavedStatus(status) {
  return status === "completed" ? "approved" : status;
}

function updateCompletionDate(task, status) {
  if (status === "approved" || status === "completed") {
    task.completedAt = task.completedAt || new Date();
  } else {
    task.completedAt = null;
  }
}

/*
|--------------------------------------------------------------------------
| Helpers: dates and minutes
|--------------------------------------------------------------------------
*/

function normalizeTimeZone(timeZone) {
  if (!timeZone || typeof timeZone !== "string") return DEFAULT_TIME_ZONE;

  try {
    new Intl.DateTimeFormat("en-US", { timeZone });
    return timeZone;
  } catch {
    return DEFAULT_TIME_ZONE;
  }
}

function dayKey(value = new Date(), timeZone = DEFAULT_TIME_ZONE) {
  const date = value instanceof Date ? value : new Date(value);

  if (Number.isNaN(date.getTime())) return "";

  return new Intl.DateTimeFormat("en-CA", {
    timeZone,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(date);
}

function minutesBetween(from, to) {
  if (!from || !to) return null;

  const diff = new Date(to).getTime() - new Date(from).getTime();

  if (Number.isNaN(diff)) return null;

  return Math.max(0, Math.round(diff / 60000));
}

function parseMinutes(value) {
  if (value === undefined || value === null || value === "") return null;

  const minutes = Math.round(Number(value));

  if (!Number.isFinite(minutes) || minutes < 0 || minutes > MAX_MINUTES) {
    throw createError("Time spent must be a valid number of minutes.");
  }

  return minutes;
}

function buildStatusPatch(task, status, timeSpentMinutes) {
  const now = new Date();
  const data = { status };

  if (status === "pending") {
    data.startedAt = null;
    data.completedAt = null;
    return data;
  }

  data.startedAt = task.startedAt || now;

  if (DONE_STATUSES.includes(status)) {
    data.completedAt = task.completedAt || now;

    const entered = parseMinutes(timeSpentMinutes);

    if (entered !== null) {
      data.timeSpentMinutes = entered;
    } else if (!task.timeSpentMinutes) {
      data.timeSpentMinutes =
        minutesBetween(data.startedAt, data.completedAt) || 0;
    }
  } else {
    data.completedAt = null;

    const entered = parseMinutes(timeSpentMinutes);

    if (entered !== null) data.timeSpentMinutes = entered;
  }

  return data;
}

/*
|--------------------------------------------------------------------------
| Serializers
|--------------------------------------------------------------------------
*/

function serializeUpdate(update) {
  return {
    id: update.id,
    _id: update.id,
    taskId: update.taskId,
    employeeId: update.employeeId,
    updateDate: update.updateDate,
    description: update.description,
    status: update.status,
    timeSpentMinutes: update.timeSpentMinutes || 0,
    createdAt: update.createdAt,
    updatedAt: update.updatedAt,
  };
}

function serializeTask(task, today, timeZone) {
  const status = normalizeSavedStatus(task.status);
  const isDone = DONE_STATUSES.includes(status);
  const isDaily = task.taskType === "daily";
  const isActive = task.isActive !== false;

  const dueKey = task.dueDate ? dayKey(task.dueDate, timeZone) : "";
  const startKey = task.startDate
    ? dayKey(task.startDate, timeZone)
    : dayKey(task.createdAt, timeZone);

  const started = !startKey || startKey <= today;
  const ended = Boolean(dueKey) && dueKey < today;

  const updates = (task.dailyUpdates || []).map(serializeUpdate);
  const todayUpdate = updates.find((item) => item.updateDate === today) || null;

  return {
    id: task.id,
    _id: task.id,
    title: task.title,
    subtitle: task.subtitle,
    description: task.description,
    priority: task.priority,
    taskType: task.taskType || "extra",
    status,
    isDone,
    isActive,
    assignedToId: task.assignedToId,
    assignedById: task.assignedById,
    assignedBy: task.assignedBy
      ? {
          id: task.assignedBy.id,
          _id: task.assignedBy.id,
          name: task.assignedBy.name,
          email: task.assignedBy.email,
        }
      : null,
    startDate: task.startDate,
    dueDate: task.dueDate,
    startedAt: task.startedAt || null,
    completedAt: task.completedAt,
    timeSpentMinutes: task.timeSpentMinutes || 0,
    elapsedMinutes: minutesBetween(task.startedAt, task.completedAt),
    submissionNote: task.submissionNote || "",
    submittedAt: task.submittedAt || null,
    reviewNote: task.reviewNote || "",
    reviewedAt: task.reviewedAt || null,
    reviewedByName: task.reviewedByName || "",
    createdAt: task.createdAt,
    updatedAt: task.updatedAt,
    started,
    ended,
    isOverdue: !isDaily && !isDone && Boolean(dueKey) && dueKey < today,
    dueToday: !isDaily && !isDone && dueKey === today,
    todayUpdate,
    updates,
    needsUpdateToday:
      isDaily && isActive && started && !ended && !todayUpdate,
  };
}

async function getPopulatedTask(taskId) {
  return Task.findById(taskId)
    .populate("assignedTo", "name email department designation status")
    .populate("assignedBy", "name email")
    .lean();
}

/*
|--------------------------------------------------------------------------
| Employee: stats and old list
|--------------------------------------------------------------------------
*/

export async function getEmployeeTaskStats(employeeId) {
  const now = new Date();

  const [assigned, completed, inProgress, review, overdue] =
    await Promise.all([
      Task.countDocuments({ assignedTo: employeeId }),
      Task.countDocuments({
        assignedTo: employeeId,
        status: { $in: ["approved", "completed"] },
      }),
      Task.countDocuments({
        assignedTo: employeeId,
        status: "in-progress",
      }),
      Task.countDocuments({
        assignedTo: employeeId,
        status: "review",
      }),
      Task.countDocuments({
        assignedTo: employeeId,
        status: { $nin: ["approved", "completed"] },
        dueDate: { $lt: now },
      }),
    ]);

  return { assigned, completed, inProgress, review, overdue };
}

export async function getEmployeeTasks(employeeId) {
  const tasks = await Task.find({ assignedTo: employeeId })
    .populate("assignedBy", "name email")
    .sort({ createdAt: -1 })
    .lean();

  return tasks.map((task) => ({
    ...task,
    status: normalizeSavedStatus(task.status),
  }));
}

export async function updateEmployeeTaskStatus(
  employeeId,
  taskId,
  status,
  timeSpentMinutes
) {
  if (!TASK_STATUSES.includes(status)) {
    throw createError("Invalid task status.");
  }

  const task = await prisma.task.findFirst({
    where: { id: String(taskId), assignedToId: String(employeeId) },
  });

  if (!task) {
    throw createError("Task not found.", 404);
  }

  if (task.taskType === "daily") {
    throw createError(
      "Fixed daily tasks are not completed. Post your daily update instead."
    );
  }

  const isPersonalTask =
    task.taskType === "personal" ||
    task.assignedById === task.assignedToId;

  if (!isPersonalTask) {
    if (status === "approved" || status === "completed") {
      throw createError(
        "You cannot complete this assigned task directly. Submit it for review."
      );
    }

    if (task.status === "review") {
      throw createError(
        "This task is already submitted for review. Wait for admin feedback."
      );
    }

    if (task.status === "approved" || task.status === "completed") {
      throw createError("This task has already been approved.");
    }

    if (!["pending", "in-progress"].includes(status)) {
      throw createError("Invalid status for an assigned task.");
    }
  }

  const row = await prisma.task.update({
    where: { id: task.id },
    data: buildStatusPatch(task, status, timeSpentMinutes),
  });

  return { ...row, _id: row.id };
}

/*
|--------------------------------------------------------------------------
| Employee: ClickUp style workspace
|--------------------------------------------------------------------------
*/

export async function getEmployeeWorkspace(
  employeeId,
  { view = "assigned", timeZone } = {}
) {
  const tz = normalizeTimeZone(timeZone);
  const today = dayKey(new Date(), tz);

  const rows = await prisma.task.findMany({
    where: { assignedToId: String(employeeId) },
    include: {
      assignedBy: { select: { id: true, name: true, email: true } },
      dailyUpdates: { orderBy: { updateDate: "desc" }, take: 14 },
    },
    orderBy: { createdAt: "desc" },
  });

  const tasks = rows.map((row) => serializeTask(row, today, tz));

  const lists = {
    assigned: tasks.filter((task) => task.taskType !== "personal"),
    today: tasks.filter((task) => {
      if (task.taskType === "daily") {
        return task.isActive && task.started && !task.ended;
      }

      return !task.isDone && (task.isOverdue || task.dueToday);
    }),
    personal: tasks.filter((task) => task.taskType === "personal"),
  };

  const counts = {
    assigned: lists.assigned.length,
    today: lists.today.length,
    personal: lists.personal.length,
    overdue: tasks.filter((task) => task.isOverdue).length,
    pendingDailyUpdates: tasks.filter((task) => task.needsUpdateToday).length,
  };

  return {
    view: lists[view] ? view : "assigned",
        serverDate: today,
    tasks: lists[view] || lists.assigned,
    counts,
  };
}

export async function submitDailyUpdate(
  employeeId,
  taskId,
  { description, status = "in-progress", timeSpentMinutes } = {},
  timeZone
) {
  const text = String(description || "").trim();

  if (text.length < 3) {
    throw createError("Please write what you worked on today.");
  }

  if (!UPDATE_STATUSES.includes(status)) {
    throw createError("Invalid update status.");
  }

  const minutes = parseMinutes(timeSpentMinutes) ?? 0;
  const tz = normalizeTimeZone(timeZone);
  const today = dayKey(new Date(), tz);

  const task = await prisma.task.findFirst({
    where: {
      id: String(taskId),
      assignedToId: String(employeeId),
      taskType: "daily",
    },
  });

  if (!task) {
    throw createError("Fixed daily task not found.", 404);
  }

  if (task.isActive === false) {
    throw createError("This fixed task is paused by the admin.");
  }

  const update = await prisma.taskDailyUpdate.upsert({
    where: { taskId_updateDate: { taskId: task.id, updateDate: today } },
    create: {
      taskId: task.id,
      employeeId: String(employeeId),
      updateDate: today,
      description: text,
      status,
      timeSpentMinutes: minutes,
    },
    update: { description: text, status, timeSpentMinutes: minutes },
  });

  return serializeUpdate(update);
}

export async function createPersonalTask(
  employeeId,
  { title, description = "", priority = "Medium", dueDate } = {},
  timeZone
) {
  const cleanTitle = String(title || "").trim();

  if (!cleanTitle) {
    throw createError("Task title is required.");
  }

  if (!TASK_PRIORITIES.includes(priority)) {
    throw createError("Invalid task priority.");
  }

  const tz = normalizeTimeZone(timeZone);
  const due = dueDate ? new Date(dueDate) : new Date();

  assertSaneDate(due, "Due date");

  const row = await prisma.task.create({
    data: {
      title: cleanTitle,
      description: String(description || "").trim(),
      priority,
      taskType: "personal",
      assignedToId: String(employeeId),
      assignedById: String(employeeId),
      dueDate: due,
    },
    include: {
      assignedBy: { select: { id: true, name: true, email: true } },
      dailyUpdates: true,
    },
  });

  return serializeTask(row, dayKey(new Date(), tz), tz);
}

export async function updatePersonalTask(
  employeeId,
  taskId,
  updates = {},
  timeZone
) {
  const task = await prisma.task.findFirst({
    where: {
      id: String(taskId),
      assignedToId: String(employeeId),
      assignedById: String(employeeId),
      taskType: "personal",
    },
  });

  if (!task) {
    throw createError("Personal task not found.", 404);
  }

  const data = {};

  if (updates.title !== undefined) {
    const title = String(updates.title).trim();
    if (!title) throw createError("Task title is required.");
    data.title = title;
  }

  if (updates.description !== undefined) {
    data.description = String(updates.description || "").trim();
  }

  if (updates.priority !== undefined) {
    if (!TASK_PRIORITIES.includes(updates.priority)) {
      throw createError("Invalid task priority.");
    }
    data.priority = updates.priority;
  }

  if (updates.dueDate !== undefined) {
    const due = new Date(updates.dueDate);
    assertSaneDate(due, "Due date");
    data.dueDate = due;
  }

  if (updates.status !== undefined) {
    if (!TASK_STATUSES.includes(updates.status)) {
      throw createError("Invalid task status.");
    }

    Object.assign(
      data,
      buildStatusPatch(task, updates.status, updates.timeSpentMinutes)
    );
  } else if (updates.timeSpentMinutes !== undefined) {
    const entered = parseMinutes(updates.timeSpentMinutes);
    if (entered !== null) data.timeSpentMinutes = entered;
  }

  const row = await prisma.task.update({
    where: { id: task.id },
    data,
    include: {
      assignedBy: { select: { id: true, name: true, email: true } },
      dailyUpdates: true,
    },
  });

  const tz = normalizeTimeZone(timeZone);

  return serializeTask(row, dayKey(new Date(), tz), tz);
}

export async function deletePersonalTask(employeeId, taskId) {
  const task = await prisma.task.findFirst({
    where: {
      id: String(taskId),
      assignedToId: String(employeeId),
      assignedById: String(employeeId),
      taskType: "personal",
    },
  });

  if (!task) {
    throw createError("Personal task not found.", 404);
  }

  await prisma.task.delete({ where: { id: task.id } });

  return task;
}

/*
|--------------------------------------------------------------------------
| Admin and task assigners
|--------------------------------------------------------------------------
*/

export async function createTask({
  title,
  subtitle = "",
  description = "",
  priority = "Medium",
  taskType = "extra",
  assignedTo,
  assignedBy,
  startDate,
  dueDate,
}) {
  if (!["daily", "extra"].includes(taskType)) {
    throw createError("Task type must be daily or extra.");
  }

  if (!assignedTo || !assignedBy) {
    throw createError("Assigned employee and assigner are required.");
  }

  if (!TASK_PRIORITIES.includes(priority)) {
    throw createError("Invalid task priority.");
  }

  const assigner = await prisma.user.findFirst({
    where: {
      id: String(assignedBy),
      status: "active",
      isDeleted: false,
    },
  });

  if (!assigner) {
    throw createError("Task assigner not found or inactive.", 404);
  }

  await assertCanAssignTo(assigner, [String(assignedTo)]);

  const employee = await prisma.user.findFirst({
    where: {
      id: String(assignedTo),
      role: ROLES.EMPLOYEE,
      status: "active",
      isDeleted: false,
    },
  });

  if (!employee) {
    throw createError("Active employee not found.", 404);
  }

  const start = startDate ? new Date(startDate) : new Date();

  assertSaneDate(start, "Start date");

  const due = dueDate
    ? new Date(dueDate)
    : new Date(start.getTime() + 365 * 24 * 60 * 60 * 1000);

  assertSaneDate(due, "Due date");

  const row = await prisma.task.create({
    data: {
      title: String(title || "").trim(),
      subtitle: String(subtitle || "").trim(),
      description: String(description || "").trim(),
      priority,
      taskType,
      startDate: taskType === "daily" ? start : null,
      assignedToId: String(employee.id),
      assignedById: String(assigner.id),
      dueDate: due,
    },
  });

  return { ...row, _id: row.id };
}

// Admins see all tasks. Other task assigners see their own assigned tasks
// and tasks assigned to employees within their reporting hierarchy.
export async function getAllTasksForAdmin(scope = null) {
  const filter = scope
    ? {
        OR: [
          { assignedById: String(scope.userId) },
          { assignedToId: { in: scope.employeeIds.map(String) } },
        ],
      }
    : {};

  const tasks = await prisma.task.findMany({
    where: filter,
    include: {
      assignedTo: {
        select: {
          id: true,
          name: true,
          email: true,
          department: true,
          designation: true,
          status: true,
        },
      },
      assignedBy: {
        select: { id: true, name: true, email: true },
      },
    },
    orderBy: { createdAt: "desc" },
  });

  return tasks
    .filter(
      (task) =>
        !scope || String(task.assignedById) !== String(task.assignedToId)
    )
    .map((task) => ({
      ...task,
      _id: task.id,
      status: normalizeSavedStatus(task.status),
    }));
}

export async function updateAdminTask(taskId, updates) {
  const task = await prisma.task.findUnique({
    where: { id: String(taskId) },
  });

  if (!task) {
    throw createError("Task not found.", 404);
  }

  const data = {};

  let parsedDueDate;
  let parsedStartDate;

  if (updates.dueDate !== undefined) {
    parsedDueDate = new Date(updates.dueDate);
    assertSaneDate(parsedDueDate, "Due date");
    data.dueDate = parsedDueDate;
  }

  if (updates.startDate !== undefined) {
    parsedStartDate = new Date(updates.startDate);
    assertSaneDate(parsedStartDate, "Start date");
    data.startDate = parsedStartDate;
  }

  if (updates.title !== undefined) {
    const title = String(updates.title).trim();
    if (!title) throw createError("Task title is required.");
    data.title = title;
  }

  if (updates.subtitle !== undefined) {
    data.subtitle = String(updates.subtitle || "").trim();
  }

  if (updates.description !== undefined) {
    data.description = String(updates.description || "").trim();
  }

  if (updates.priority !== undefined) {
    if (!TASK_PRIORITIES.includes(updates.priority)) {
      throw createError("Invalid task priority.");
    }
    data.priority = updates.priority;
  }

  if (updates.assignedTo !== undefined) {
    const employee = await prisma.user.findFirst({
      where: {
        id: String(updates.assignedTo),
        role: ROLES.EMPLOYEE,
        status: "active",
        isDeleted: false,
      },
    });

    if (!employee) {
      throw createError("Active employee not found.", 404);
    }

    data.assignedToId = employee.id;
  }

  if (updates.status !== undefined) {
    if (!TASK_STATUSES.includes(updates.status)) {
      throw createError("Invalid task status.");
    }

    data.status = updates.status;
    data.completedAt =
      updates.status === "approved" || updates.status === "completed"
        ? task.completedAt || new Date()
        : null;
  }

  if (updates.isActive !== undefined) {
    data.isActive = Boolean(updates.isActive);
  }

  const row = await prisma.task.update({
    where: { id: task.id },
    data,
  });

  return {
    ...row,
    _id: row.id,
  };
}

export async function updateAdminTaskStatus(taskId, status) {
  if (!TASK_STATUSES.includes(status)) {
    throw createError("Invalid task status.");
  }

  const task = await prisma.task.findUnique({
    where: { id: String(taskId) },
  });

  if (!task) {
    throw createError("Task not found.", 404);
  }

  const row = await prisma.task.update({
    where: { id: task.id },
    data: {
      status,
      completedAt:
        status === "approved" || status === "completed"
          ? task.completedAt || new Date()
          : null,
    },
  });

  return { ...row, _id: row.id };
}

export async function deleteAdminTask(taskId) {
  const task = await prisma.task.findUnique({
    where: { id: String(taskId) },
  });

  if (!task) {
    throw createError("Task not found.", 404);
  }

  await prisma.task.delete({
    where: { id: task.id },
  });

  return { ...task, _id: task.id };
}

/*
|--------------------------------------------------------------------------
| Admin feed of daily updates
|--------------------------------------------------------------------------
*/

export async function getAdminDailyUpdates({
  date,
  employeeId,
  employeeIds: scopeIds,
  taskId,
  timeZone,
} = {}) {
  const tz = normalizeTimeZone(timeZone);
  const day = date || dayKey(new Date(), tz);

  const where = { updateDate: day };

  if (employeeId) {
    where.employeeId = String(employeeId);
  } else if (scopeIds) {
    where.employeeId = { in: scopeIds.map(String) };
  }

  if (taskId) where.taskId = String(taskId);

  const rows = await prisma.taskDailyUpdate.findMany({
    where,
    include: {
      task: {
        select: { id: true, title: true, priority: true },
      },
    },
    orderBy: { updatedAt: "desc" },
  });

  const employeeIds = [...new Set(rows.map((row) => row.employeeId))];

  const employees = employeeIds.length
    ? await prisma.user.findMany({
        where: { id: { in: employeeIds } },
        select: {
          id: true,
          name: true,
          email: true,
          designation: true,
        },
      })
    : [];

  const employeeMap = new Map(employees.map((item) => [item.id, item]));

  return {
    date: day,
    updates: rows.map((row) => ({
      ...serializeUpdate(row),
      task: row.task,
      employee: employeeMap.get(row.employeeId) || null,
    })),
  };
}

/*
|--------------------------------------------------------------------------
| Admin activity for one day
|--------------------------------------------------------------------------
*/

export async function getAdminActivity({
  date,
  employeeId,
  employeeIds,
  timeZone,
} = {}) {
  const tz = normalizeTimeZone(timeZone);

  const day =
    date && /^\d{4}-\d{2}-\d{2}$/.test(String(date))
      ? String(date)
      : dayKey(new Date(), tz);

  const dailyWhere = {
    taskType: "daily",
    isActive: true,
  };

  if (employeeId) {
    dailyWhere.assignedToId = String(employeeId);
  } else if (employeeIds) {
    dailyWhere.assignedToId = { in: employeeIds.map(String) };
  }

  const dailyTasks = await prisma.task.findMany({
    where: dailyWhere,
    include: {
      dailyUpdates: {
        where: { updateDate: day },
      },
    },
    orderBy: { createdAt: "desc" },
  });

  const since = new Date(Date.now() - 60 * 24 * 60 * 60 * 1000);

  const extraWhere = {
    taskType: "extra",
    updatedAt: { gte: since },
  };

  if (employeeId) {
    extraWhere.assignedToId = String(employeeId);
  } else if (employeeIds) {
    extraWhere.assignedToId = { in: employeeIds.map(String) };
  }

  const allExtraRows = await prisma.task.findMany({
    where: extraWhere,
    orderBy: { updatedAt: "desc" },
  });

  const extraRows = employeeIds
    ? allExtraRows.filter(
        (task) => task.assignedById !== task.assignedToId
      )
    : allExtraRows;

  const userIds = [
    ...new Set(
      [...dailyTasks, ...extraRows].map((task) => task.assignedToId)
    ),
  ];

  const users = userIds.length
    ? await prisma.user.findMany({
        where: { id: { in: userIds } },
        select: {
          id: true,
          name: true,
          email: true,
          designation: true,
        },
      })
    : [];

  const userMap = new Map(users.map((item) => [item.id, item]));

  const fixedTasks = dailyTasks
    .filter((task) => {
      const startKey = task.startDate
        ? dayKey(task.startDate, tz)
        : dayKey(task.createdAt, tz);

      const endKey = task.dueDate ? dayKey(task.dueDate, tz) : "";

      return startKey <= day && (!endKey || endKey >= day);
    })
    .map((task) => ({
      task: {
        id: task.id,
        title: task.title,
        description: task.description,
        priority: task.priority,
      },
      employee: userMap.get(task.assignedToId) || null,
      update: task.dailyUpdates[0]
        ? serializeUpdate(task.dailyUpdates[0])
        : null,
    }));

  const extraTasks = extraRows
    .filter((task) =>
      [task.startedAt, task.completedAt, task.dueDate]
        .map((value) => (value ? dayKey(value, tz) : ""))
        .includes(day)
    )
    .map((task) => {
      const status = normalizeSavedStatus(task.status);

      return {
        id: task.id,
        title: task.title,
        priority: task.priority,
        status,
        isDone: DONE_STATUSES.includes(status),
        employee: userMap.get(task.assignedToId) || null,
        dueDate: task.dueDate,
        startedAt: task.startedAt || null,
        completedAt: task.completedAt || null,
        timeSpentMinutes: task.timeSpentMinutes || 0,
        elapsedMinutes: minutesBetween(task.startedAt, task.completedAt),
      };
    });

  const fixedPosted = fixedTasks.filter((item) => item.update).length;

  const totalMinutes =
    fixedTasks.reduce(
      (sum, item) => sum + (item.update?.timeSpentMinutes || 0),
      0
    ) +
    extraTasks
      .filter(
        (item) => item.completedAt && dayKey(item.completedAt, tz) === day
      )
      .reduce((sum, item) => sum + item.timeSpentMinutes, 0);

  return {
    date: day,
    fixedTasks,
    extraTasks,
    summary: {
      fixedTotal: fixedTasks.length,
      fixedPosted,
      fixedMissing: fixedTasks.length - fixedPosted,
      extraTotal: extraTasks.length,
      extraDone: extraTasks.filter((item) => item.isDone).length,
      totalMinutes,
    },
  };
}
