import { prisma } from "../../config/db.js";

/*
|--------------------------------------------------------------------------
| Attendance rules (fixed break limits, daily hours) and employee schedules
| + weekly / monthly hour tracking.
|
| Hours are calculated from the TOTAL time worked, never from fixed
| start / end times. Starting late simply means finishing later.
|--------------------------------------------------------------------------
*/

export const DEFAULT_TIME_ZONE = "Asia/Karachi";
export const BREAK_TYPES = ["tea", "lunch", "prayer", "other"];

const DEFAULT_RULES = {
  teaMinutes: 15,
  lunchMinutes: 30,
  prayerMinutes: 15,
  otherMinutes: 15,
  dailyTargetMinutes: 480,
  workDays: "1,2,3,4,5",
};

const TIME_RE = /^([01]\d|2[0-3]):[0-5]\d$/;

const fail = (status, message, code = "ATTENDANCE_RULES_ERROR") =>
  Object.assign(new Error(message), { status, statusCode: status, code });

export function normalizeTimeZone(timeZone) {
  if (!timeZone || typeof timeZone !== "string") return DEFAULT_TIME_ZONE;

  try {
    new Intl.DateTimeFormat("en-US", { timeZone });
    return timeZone;
  } catch {
    return DEFAULT_TIME_ZONE;
  }
}

const parseDays = (value, fallback = [1, 2, 3, 4, 5]) => {
  const list = (Array.isArray(value) ? value : String(value ?? "").split(","))
    .map(Number)
    .filter((n) => Number.isInteger(n) && n >= 0 && n <= 6);

  const unique = [...new Set(list)].sort((a, b) => a - b);

  return unique.length ? unique : fallback;
};

const whole = (value, label, min, max) => {
  const number = Number(value);

  if (!Number.isInteger(number) || number < min || number > max) {
    throw fail(
      400,
      `${label} must be a whole number between ${min} and ${max}.`,
      "INVALID_RULES"
    );
  }

  return number;
};

const minutesBetween = (from, to) =>
  Math.max(
    0,
    Math.round((new Date(to).getTime() - new Date(from).getTime()) / 60000)
  );

/*
|--------------------------------------------------------------------------
| Rules
|--------------------------------------------------------------------------
*/

const shapeRules = (row) => {
  const r = { ...DEFAULT_RULES, ...(row || {}) };

  return {
    breakAllowances: {
      tea: r.teaMinutes,
      lunch: r.lunchMinutes,
      prayer: r.prayerMinutes,
      other: r.otherMinutes,
    },
    dailyTargetMinutes: r.dailyTargetMinutes,
    workDays: parseDays(r.workDays),
  };
};

export async function getRules() {
  try {
    return shapeRules(
      await prisma.attendanceRule.findUnique({ where: { id: "default" } })
    );
  } catch (error) {
    console.error(
      "[ATTENDANCE] rules unavailable, using defaults:",
      error?.message
    );

    return shapeRules(null);
  }
}

export async function updateRules(body = {}) {
  const breaks = body.breakAllowances || {};

  const data = {
    teaMinutes: whole(breaks.tea, "Tea break", 0, 240),
    lunchMinutes: whole(breaks.lunch, "Lunch break", 0, 240),
    prayerMinutes: whole(breaks.prayer, "Prayer break", 0, 240),
    otherMinutes: whole(breaks.other, "Other break", 0, 240),
    dailyTargetMinutes: whole(
      body.dailyTargetMinutes,
      "Daily working time (minutes)",
      60,
      960
    ),
    workDays: parseDays(body.workDays).join(","),
  };

  await prisma.attendanceRule.upsert({
    where: { id: "default" },
    create: { id: "default", ...data },
    update: data,
  });

  return { ...(await getRules()), message: "Attendance rules saved." };
}

/*
|--------------------------------------------------------------------------
| Employee schedule (optional override of the company default)
|--------------------------------------------------------------------------
*/

const shapeSchedule = (row, rules) => ({
  startTime: row?.startTime || "",
  endTime: row?.endTime || "",
  dailyTargetMinutes: row?.dailyTargetMinutes ?? rules.dailyTargetMinutes,
  workDays: row?.workDays ? parseDays(row.workDays, rules.workDays) : rules.workDays,
  custom: Boolean(row),
});

async function loadSchedules(userIds) {
  try {
    const rows = await prisma.employeeSchedule.findMany({
      where: { userId: { in: userIds } },
    });

    return new Map(rows.map((row) => [row.userId, row]));
  } catch (error) {
    console.error("[ATTENDANCE] schedules unavailable:", error?.message);

    return new Map();
  }
}

export async function setSchedule(userId, body = {}) {
  const user = await prisma.user.findFirst({
    where: { id: String(userId), isDeleted: false },
    select: { id: true },
  });

  if (!user) {
    throw fail(404, "Employee account was not found.", "USER_NOT_FOUND");
  }

  if (body.reset) {
    await prisma.employeeSchedule.deleteMany({ where: { userId: user.id } });

    return { message: "Schedule reset to the company default." };
  }

  const startTime = String(body.startTime ?? "").trim();
  const endTime = String(body.endTime ?? "").trim();

  if (
    (startTime && !TIME_RE.test(startTime)) ||
    (endTime && !TIME_RE.test(endTime))
  ) {
    throw fail(400, "Use the 24-hour format HH:mm for working times.", "INVALID_TIME");
  }

  const emptyDaily =
    body.dailyTargetMinutes === null ||
    body.dailyTargetMinutes === undefined ||
    body.dailyTargetMinutes === "";

  const data = {
    startTime,
    endTime,
    dailyTargetMinutes: emptyDaily
      ? null
      : whole(body.dailyTargetMinutes, "Daily working time (minutes)", 60, 960),
    workDays: parseDays(body.workDays).join(","),
  };

  await prisma.employeeSchedule.upsert({
    where: { userId: user.id },
    create: { userId: user.id, ...data },
    update: data,
  });

  return { message: "Employee schedule saved." };
}

/*
|--------------------------------------------------------------------------
| Date helpers (date keys are YYYY-MM-DD in the employee's time zone)
|--------------------------------------------------------------------------
*/

const dateKeyOf = (date, timeZone) =>
  new Intl.DateTimeFormat("en-CA", {
    timeZone,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(date);

const parseKey = (key) => {
  const [y, m, d] = key.split("-").map(Number);

  return { y, m, d };
};

const utcOf = (key) => {
  const { y, m, d } = parseKey(key);

  return Date.UTC(y, m - 1, d);
};

const addDays = (key, amount) =>
  new Date(utcOf(key) + amount * 86400000).toISOString().slice(0, 10);

const weekday = (key) => new Date(utcOf(key)).getUTCDay();

function periodRanges(dateKey) {
  const offset = (weekday(dateKey) + 6) % 7; // week starts on Monday
  const weekStart = addDays(dateKey, -offset);
  const weekEnd = addDays(weekStart, 6);

  const { y, m } = parseKey(dateKey);
  const mm = String(m).padStart(2, "0");
  const last = new Date(Date.UTC(y, m, 0)).getUTCDate();

  return {
    weekStart,
    weekEnd,
    monthStart: `${y}-${mm}-01`,
    monthEnd: `${y}-${mm}-${String(last).padStart(2, "0")}`,
  };
}

function countWorkDays(start, end, workDays) {
  let count = 0;

  for (let key = start; key <= end; key = addDays(key, 1)) {
    if (workDays.includes(weekday(key))) count += 1;
  }

  return count;
}

/*
|--------------------------------------------------------------------------
| Worked time
|--------------------------------------------------------------------------
*/

function sessionMinutes(session, now) {
  if (session.clockOutAt) return session.workedMinutes || 0;

  const breaks = (session.breaks || []).reduce(
    (sum, item) =>
      sum + (item.endAt ? item.minutes : minutesBetween(item.startAt, now)),
    0
  );

  return Math.max(0, minutesBetween(session.clockInAt, now) - breaks);
}

function rangeWorked(sessions, attendance, start, end, now) {
  const covered = new Set();
  let total = 0;

  for (const session of sessions) {
    if (session.dateKey >= start && session.dateKey <= end) {
      covered.add(session.dateKey);
      total += sessionMinutes(session, now);
    }
  }

  // Days recorded before sessions existed still count.
  for (const record of attendance) {
    if (
      record.dateKey >= start &&
      record.dateKey <= end &&
      !covered.has(record.dateKey)
    ) {
      total += record.workedMinutes || 0;
    }
  }

  return total;
}

const summary = (worked, target, extra = {}) => ({
  workedMinutes: worked,
  targetMinutes: target,
  remainingMinutes: Math.max(0, target - worked),
  overtimeMinutes: Math.max(0, worked - target),
  percent: target > 0 ? Math.min(100, Math.round((worked / target) * 100)) : 0,
  ...extra,
});

function buildHours(plan, schedule, rules, sessions, attendance, now) {
  const target = schedule.dailyTargetMinutes;
  const isWorkDay = schedule.workDays.includes(weekday(plan.dateKey));

  let breakMinutes = 0;
  let breakOverMinutes = 0;
  let onBreak = false;
  let clockedIn = false;

  for (const session of sessions) {
    if (session.dateKey !== plan.dateKey) continue;

    if (!session.clockOutAt) clockedIn = true;

    for (const item of session.breaks || []) {
      const minutes = item.endAt
        ? item.minutes
        : minutesBetween(item.startAt, now);

      const allowed =
        rules.breakAllowances[item.type] ?? rules.breakAllowances.other;

      if (!item.endAt) onBreak = true;

      breakMinutes += minutes;
      breakOverMinutes += Math.max(0, minutes - allowed);
    }
  }

  return {
    asOf: now.toISOString(),
    dateKey: plan.dateKey,
    schedule,
    today: summary(
      rangeWorked(sessions, attendance, plan.dateKey, plan.dateKey, now),
      isWorkDay ? target : 0,
      { isWorkDay, breakMinutes, breakOverMinutes, onBreak, clockedIn }
    ),
    week: summary(
      rangeWorked(sessions, attendance, plan.weekStart, plan.weekEnd, now),
      countWorkDays(plan.weekStart, plan.weekEnd, schedule.workDays) * target,
      { start: plan.weekStart, end: plan.weekEnd }
    ),
    month: summary(
      rangeWorked(sessions, attendance, plan.monthStart, plan.monthEnd, now),
      countWorkDays(plan.monthStart, plan.monthEnd, schedule.workDays) * target,
      { start: plan.monthStart, end: plan.monthEnd }
    ),
  };
}

// users: [{ id, timeZone }]  ->  Map(userId -> hours)
export async function getHoursForUsers(users, now = new Date(), rulesIn = null) {
  const result = new Map();

  if (!users.length) return result;

  const rules = rulesIn || (await getRules());
  const ids = users.map((user) => String(user.id));
  const schedules = await loadSchedules(ids);

  const plans = users.map((user) => {
    const dateKey = dateKeyOf(now, normalizeTimeZone(user.timeZone));

    return { id: String(user.id), dateKey, ...periodRanges(dateKey) };
  });

  let from = "";
  let to = "";

  for (const plan of plans) {
    const a = plan.weekStart < plan.monthStart ? plan.weekStart : plan.monthStart;
    const b = plan.weekEnd > plan.monthEnd ? plan.weekEnd : plan.monthEnd;

    if (!from || a < from) from = a;
    if (!to || b > to) to = b;
  }

  const [sessions, attendance] = await Promise.all([
    prisma.attendanceSession.findMany({
      where: { userId: { in: ids }, dateKey: { gte: from, lte: to } },
      include: { breaks: true },
    }),
    prisma.attendance.findMany({
      where: { userId: { in: ids }, dateKey: { gte: from, lte: to } },
      select: { userId: true, dateKey: true, workedMinutes: true },
    }),
  ]);

  const sessionsBy = new Map();
  const attendanceBy = new Map();

  for (const item of sessions) {
    sessionsBy.set(item.userId, [...(sessionsBy.get(item.userId) || []), item]);
  }

  for (const item of attendance) {
    attendanceBy.set(item.userId, [...(attendanceBy.get(item.userId) || []), item]);
  }

  for (const plan of plans) {
    result.set(
      plan.id,
      buildHours(
        plan,
        shapeSchedule(schedules.get(plan.id), rules),
        rules,
        sessionsBy.get(plan.id) || [],
        attendanceBy.get(plan.id) || [],
        now
      )
    );
  }

  return result;
}

export async function getMyHours(userId) {
  const user = await prisma.user.findUnique({
    where: { id: String(userId) },
    select: { id: true, timeZone: true },
  });

  if (!user) {
    throw fail(404, "Employee account was not found.", "USER_NOT_FOUND");
  }

  const map = await getHoursForUsers([user]);

  return map.get(user.id);
}

// Admin: every active person with schedule, week / month hours and today's extra break time.
export async function listSchedules() {
  const rules = await getRules();

  const users = await prisma.user.findMany({
    where: { status: "active", isDeleted: false },
    select: {
      id: true,
      name: true,
      designation: true,
      department: true,
      role: true,
      timeZone: true,
    },
    orderBy: { name: "asc" },
  });

  const hours = await getHoursForUsers(users, new Date(), rules);

  return {
    rules,
    rows: users.map((user) => {
      const item = hours.get(String(user.id));

      return {
        userId: user.id,
        name: user.name,
        designation: user.designation,
        department: user.department,
        role: user.role,
        schedule: item?.schedule || null,
        hours: item
          ? { today: item.today, week: item.week, month: item.month }
          : null,
      };
    }),
  };
}