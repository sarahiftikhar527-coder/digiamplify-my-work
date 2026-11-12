import { prisma } from "../../config/db.js";

/*
|--------------------------------------------------------------------------
| Clock In / Clock Out tasks
|--------------------------------------------------------------------------
| - getClockInTasks: every task the admin assigned to the employee that
|   matters today (due today, overdue, assigned today, active daily tasks
|   and tasks finished today).
| - prepareClockOutNote / applyClockOutChecklist: the checklist the employee
|   ticks while clocking out.
|--------------------------------------------------------------------------
*/

const DEFAULT_TIME_ZONE = "Asia/Karachi";
const DONE_STATUSES = ["approved", "completed"];
const MAX_NOTE_LENGTH = 500;
const MAX_CHECKLIST_ITEMS = 100;

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

async function getUserTimeZone(userId) {
  try {
    const user = await prisma.user.findFirst({
      where: { id: String(userId) },
      select: { timeZone: true },
    });

    return normalizeTimeZone(user?.timeZone);
  } catch {
    return DEFAULT_TIME_ZONE;
  }
}

function normalizeIds(value) {
  if (!Array.isArray(value)) return [];

  return [
    ...new Set(
      value
        .map((item) => String(item ?? "").trim())
        .filter(Boolean)
    ),
  ].slice(0, MAX_CHECKLIST_ITEMS);
}

const PRIORITY_RANK = { high: 0, medium: 1, low: 2 };

/*
|--------------------------------------------------------------------------
| Tasks shown on the Clock In page
|--------------------------------------------------------------------------
*/

async function loadTaskRows(userId, today) {
  // Old tasks that are finished long ago are not needed.
  const recentSince = new Date(Date.now() - 72 * 60 * 60 * 1000);

  try {
    return await prisma.task.findMany({
      where: {
        assignedToId: userId,
        OR: [
          { status: { notIn: DONE_STATUSES } },
          { updatedAt: { gte: recentSince } },
        ],
      },
      include: {
        dailyUpdates: { where: { updateDate: today }, take: 1 },
      },
      orderBy: { createdAt: "desc" },
      take: 300,
    });
  } catch (error) {
    // If the database is missing the newer task tables or columns, fall
    // back to a plain query so the employee still sees the tasks.
    console.error("[ATTENDANCE] task query fallback:", error?.message);

    return prisma.task.findMany({
      where: { assignedToId: userId },
      orderBy: { createdAt: "desc" },
      take: 300,
    });
  }
}

export async function getClockInTasks(userId) {
  const id = String(userId);
  const timeZone = await getUserTimeZone(id);
  const today = dayKey(new Date(), timeZone);

  const rows = await loadTaskRows(id, today);
  const items = [];

  for (const task of rows) {
    const taskType = task.taskType || "extra";

    // Personal tasks belong to the employee, they are not assigned work.
    if (taskType === "personal") continue;

    const isDaily = taskType === "daily";
    const status = task.status === "completed" ? "approved" : task.status;
    const isDone = DONE_STATUSES.includes(task.status);

    const dueKey = dayKey(task.dueDate, timeZone);
    const createdKey = dayKey(task.createdAt, timeZone);
    const startKey = task.startDate
      ? dayKey(task.startDate, timeZone)
      : createdKey;
    const completedKey = dayKey(task.completedAt, timeZone);

    const todayUpdate = (task.dailyUpdates || [])[0] || null;

    let visible;

    if (isDaily) {
      visible =
        task.isActive !== false &&
        startKey <= today &&
        (!dueKey || dueKey >= today);
    } else if (isDone) {
      visible = completedKey === today;
    } else {
      visible = dueKey <= today || createdKey === today;
    }

    if (!visible) continue;

    const doneToday = isDaily ? Boolean(todayUpdate) : isDone;
    const inReview = !isDaily && status === "review";
    const overdue = !isDaily && !isDone && Boolean(dueKey) && dueKey < today;

    items.push({
      id: String(task.id),
      title: task.title,
      subtitle: task.subtitle || "",
      priority: String(task.priority || "Low").toLowerCase(),
      taskType,
      status,
      completed: doneToday,
      doneToday,
      inReview,
      overdue,
      dueAt: isDaily ? null : task.dueDate || null,
      dueDate: isDaily ? null : task.dueDate || null,
      assignedAt: task.createdAt || null,
    });
  }

  return items.sort(
    (a, b) =>
      Number(a.completed) - Number(b.completed) ||
      Number(b.overdue) - Number(a.overdue) ||
      (PRIORITY_RANK[a.priority] ?? 3) - (PRIORITY_RANK[b.priority] ?? 3) ||
      new Date(a.dueAt || 0).getTime() - new Date(b.dueAt || 0).getTime()
  );
}

/*
|--------------------------------------------------------------------------
| Clock Out checklist
|--------------------------------------------------------------------------
*/

// Builds the description that is stored with the clock out. The ticked
// tasks are added to the employee's own note, so the admin sees them in
// the attendance reports.
export async function prepareClockOutNote(userId, rawNote, taskIds) {
  const base = String(rawNote ?? "").trim();
  const ids = normalizeIds(taskIds);

  // Too long notes are rejected by the clock out itself.
  if (ids.length === 0 || base.length > MAX_NOTE_LENGTH) {
    return { note: base, titles: [] };
  }

  try {
    const rows = await prisma.task.findMany({
      where: { id: { in: ids }, assignedToId: String(userId) },
      select: { id: true, title: true },
    });

    const titles = rows.map((row) => row.title).filter(Boolean);

    if (titles.length === 0) return { note: base, titles: [] };

    const line = `Tasks done: ${titles.join(", ")}`;
    let note = base ? `${base} — ${line}` : line;

    if (note.length > MAX_NOTE_LENGTH) {
      note = `${note.slice(0, MAX_NOTE_LENGTH - 3)}...`;
    }

    return { note, titles };
  } catch (error) {
    console.error("[ATTENDANCE] checklist note failed:", error?.message);
    return { note: base, titles: [] };
  }
}

// Saves the checklist on the tasks themselves:
//  - fixed daily tasks get today's daily update (marked completed)
//  - extra tasks move to "review" so the admin can approve them
// It never throws: the clock out has already succeeded.
export async function applyClockOutChecklist(userId, taskIds, rawNote = "") {
  const ids = normalizeIds(taskIds);

  if (ids.length === 0) return { updated: 0 };

  const id = String(userId);
  let updated = 0;

  try {
    const timeZone = await getUserTimeZone(id);
    const today = dayKey(new Date(), timeZone);
    const now = new Date();
    const note = String(rawNote ?? "").trim().slice(0, MAX_NOTE_LENGTH);

    const tasks = await prisma.task.findMany({
      where: { id: { in: ids }, assignedToId: id },
    });

    for (const task of tasks) {
      try {
        const taskType = task.taskType || "extra";

        if (taskType === "personal") continue;

        if (taskType === "daily") {
          if (task.isActive === false) continue;

          await prisma.taskDailyUpdate.upsert({
            where: {
              taskId_updateDate: { taskId: task.id, updateDate: today },
            },
            create: {
              taskId: task.id,
              employeeId: id,
              updateDate: today,
              description: note || "Marked done at clock out.",
              status: "completed",
            },
            // Keep the description the employee already wrote today.
            update: { status: "completed" },
          });

          updated += 1;
          continue;
        }

        if (DONE_STATUSES.includes(task.status) || task.status === "review") {
          continue;
        }

        await prisma.task.update({
          where: { id: task.id },
          data: {
            status: "review",
            startedAt: task.startedAt || now,
            completedAt: null,
          },
        });

        updated += 1;
      } catch (error) {
        console.error(
          `[ATTENDANCE] checklist item ${task.id} failed:`,
          error?.message
        );
      }
    }
  } catch (error) {
    console.error("[ATTENDANCE] checklist failed:", error?.message);
  }

  return { updated };
}