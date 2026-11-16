
import { prisma } from "../../config/db.js";

/*
|--------------------------------------------------------------------------
| Task lists that need the assigned employee's details
|--------------------------------------------------------------------------
| The old admin list used the Mongo-style populate() helper. That helper
| selected only "name email ..." and dropped the user "id", so the board
| could not match a task with its employee and showed "Unassigned".
| These queries use Prisma directly and always return the employee id.
*/

const DEFAULT_TIME_ZONE = "Asia/Karachi";
const DONE_STATUSES = ["approved", "completed"];

const USER_SELECT = {
  id: true,
  name: true,
  email: true,
  department: true,
  designation: true,
  status: true,
  avatarUrl: true,
};

const normalizeSavedStatus = (status) =>
  status === "completed" ? "approved" : status;

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

const withIds = (user) => (user ? { ...user, _id: user.id } : null);

/*
|--------------------------------------------------------------------------
| Admin / Task assigners: task list with scope support
|--------------------------------------------------------------------------
| scope is null for admins (no limit).
| Other task assigners receive only tasks they created or tasks assigned
| to employees within their hierarchy.
*/

export async function getAllTasksForAdmin(scope = null) {
  const where = {
    taskType: { not: "personal" },
    ...(scope
      ? {
          OR: [
            { assignedById: String(scope.userId) },
            { assignedToId: { in: scope.employeeIds.map(String) } },
          ],
        }
      : {}),
  };

  const rows = await prisma.task.findMany({
    where,
    include: {
      assignedTo: { select: USER_SELECT },
      assignedBy: { select: { id: true, name: true, email: true } },
      _count: { select: { comments: true } },
    },
    orderBy: { createdAt: "desc" },
  });

  return rows.map(({ _count, ...row }) => ({
    ...row,
    _id: row.id,
    status: normalizeSavedStatus(row.status),
    commentCount: _count?.comments || 0,
    assignedTo: withIds(row.assignedTo),
    assignedBy: withIds(row.assignedBy),
  }));
}

/*
|--------------------------------------------------------------------------
| Employee: read-only list of everybody's tasks
|--------------------------------------------------------------------------
| Personal tasks stay private. Everything else (fixed daily tasks and extra
| tasks of all employees) is visible to every employee.
*/

export async function getTeamTasks(viewerId, { timeZone } = {}) {
  const tz = normalizeTimeZone(timeZone);
  const today = dayKey(new Date(), tz);

  const rows = await prisma.task.findMany({
    where: {
      taskType: { in: ["daily", "extra"] },
      isActive: true,
      assignedTo: { is: { isDeleted: false } },
    },
    include: {
      assignedTo: { select: USER_SELECT },
      assignedBy: { select: { id: true, name: true } },
      dailyUpdates: { where: { updateDate: today } },
    },
    orderBy: { createdAt: "desc" },
  });

  const tasks = rows.map((row) => {
    const status = normalizeSavedStatus(row.status);
    const isDone = DONE_STATUSES.includes(status);
    const isDaily = row.taskType === "daily";
    const dueKey = row.dueDate ? dayKey(row.dueDate, tz) : "";
    const todayUpdate = row.dailyUpdates?.[0] || null;

    return {
      id: row.id,
      _id: row.id,
      title: row.title,
      subtitle: row.subtitle,
      description: row.description,
      priority: row.priority,
      taskType: row.taskType,
      status,
      isDone,
      startDate: row.startDate,
      dueDate: row.dueDate,
      startedAt: row.startedAt || null,
      completedAt: row.completedAt || null,
      timeSpentMinutes: row.timeSpentMinutes || 0,
      isOverdue: !isDaily && !isDone && Boolean(dueKey) && dueKey < today,
      dueToday: !isDaily && !isDone && dueKey === today,
      isMine: row.assignedToId === String(viewerId),
      updatePostedToday: isDaily ? Boolean(todayUpdate) : null,
      assignedTo: withIds(row.assignedTo),
      assignedBy: withIds(row.assignedBy),
    };
  });

  const employeeMap = new Map();

  for (const task of tasks) {
    if (task.assignedTo && !employeeMap.has(task.assignedTo.id)) {
      employeeMap.set(task.assignedTo.id, {
        id: task.assignedTo.id,
        name: task.assignedTo.name,
        designation: task.assignedTo.designation,
      });
    }
  }

  const employees = [...employeeMap.values()].sort((a, b) =>
    String(a.name || "").localeCompare(String(b.name || ""))
  );

  return { serverDate: today, tasks, employees };
}
