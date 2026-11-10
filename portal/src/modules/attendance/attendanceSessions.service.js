import bcrypt from "bcryptjs";

import { prisma } from "../../config/db.js";
import {
  getMyToday as getLegacyToday,
  getAdminOverview as getLegacyOverview,
  getEmployeeAttendance as getLegacyEmployeeAttendance,
  todayStr,
} from "./attendance.service.js";

const DEFAULT_TIME_ZONE = "Asia/Karachi";

const fail = (status, message, code = "ATTENDANCE_ERROR") =>
  Object.assign(new Error(message), { status, statusCode: status, code });

function normalizeTimeZone(timeZone) {
  if (!timeZone || typeof timeZone !== "string") return DEFAULT_TIME_ZONE;

  try {
    new Intl.DateTimeFormat("en-US", { timeZone });
    return timeZone;
  } catch {
    return DEFAULT_TIME_ZONE;
  }
}

const diffMinutes = (from, to) =>
  Math.max(
    0,
    Math.round((new Date(to).getTime() - new Date(from).getTime()) / 60000)
  );

/*
|--------------------------------------------------------------------------
| Users and PIN
|--------------------------------------------------------------------------
*/

async function getActiveUser(userId) {
  const user = await prisma.user.findFirst({
    where: { id: String(userId), status: "active", isDeleted: false },
    select: { id: true, timeZone: true, pinHash: true },
  });

  if (!user) {
    throw fail(404, "Employee account was not found.", "USER_NOT_FOUND");
  }

  return user;
}

async function verifyPin(userId, pin) {
  const value = String(pin ?? "").trim();

  if (!/^\d{4}$/.test(value)) {
    throw fail(400, "Enter your 4-digit PIN.", "INVALID_PIN_FORMAT");
  }

  const user = await getActiveUser(userId);

  if (!user.pinHash) {
    throw fail(
      400,
      "Set your attendance PIN before clocking in.",
      "PIN_NOT_SET"
    );
  }

  const matches = await bcrypt.compare(value, user.pinHash);

  if (!matches) {
    throw fail(401, "Incorrect PIN.", "INVALID_PIN");
  }

  return user;
}

/*
|--------------------------------------------------------------------------
| Serializers
|--------------------------------------------------------------------------
*/

function serializeBreak(item, now) {
  return {
    id: item.id,
    startAt: item.startAt,
    endAt: item.endAt || null,
    minutes: item.endAt ? item.minutes : diffMinutes(item.startAt, now),
    open: !item.endAt,
  };
}

function serializeSession(session, now) {
  const breaks = (session.breaks || []).map((item) =>
    serializeBreak(item, now)
  );

  const breakMinutes = breaks.reduce((sum, item) => sum + item.minutes, 0);

  const workedMinutes = session.clockOutAt
    ? session.workedMinutes
    : Math.max(0, diffMinutes(session.clockInAt, now) - breakMinutes);

  return {
    id: session.id,
    dateKey: session.dateKey,
    clockInAt: session.clockInAt,
    clockOutAt: session.clockOutAt || null,
    workedMinutes,
    breakMinutes,
    description: session.description || "",
    open: !session.clockOutAt,
    onBreak: breaks.some((item) => item.open),
    breaks,
  };
}

function summarize(sessions) {
  const open = sessions.find((item) => item.open) || null;
  const closed = sessions.filter((item) => !item.open);

  const totals = {
    clockIns: sessions.length,
    clockOuts: closed.length,
    breakCount: sessions.reduce((sum, item) => sum + item.breaks.length, 0),
    breakMinutes: sessions.reduce((sum, item) => sum + item.breakMinutes, 0),
    workedMinutes: sessions.reduce((sum, item) => sum + item.workedMinutes, 0),
  };

  const state = open ? (open.onBreak ? "break" : "in") : "out";

  return {
    totals,
    state,
    firstClockInAt: sessions[0]?.clockInAt || null,
    lastClockOutAt: open ? null : closed[closed.length - 1]?.clockOutAt || null,
  };
}

/*
|--------------------------------------------------------------------------
| Day loading
|--------------------------------------------------------------------------
*/

// Aaj purane system mein jo clock in ho chuka ho, usay naye system mein le aao
async function ensureLegacySession(userId, dateKey) {
  const count = await prisma.attendanceSession.count({
    where: { userId, dateKey },
  });

  if (count > 0) return;

  const record = await prisma.attendance.findUnique({
    where: { userId_dateKey: { userId, dateKey } },
  });

  if (!record?.clockInAt) return;

  await prisma.attendanceSession.create({
    data: {
      userId,
      dateKey,
      clockInAt: record.clockInAt,
      clockOutAt: record.clockOutAt || null,
      workedMinutes: record.workedMinutes || 0,
      description: record.description || "",
    },
  });
}

async function loadDay(userId, dateKey, now = new Date()) {
  await ensureLegacySession(userId, dateKey);

  const rows = await prisma.attendanceSession.findMany({
    where: {
      userId,
      OR: [{ dateKey }, { clockOutAt: null }],
    },
    include: { breaks: { orderBy: { startAt: "asc" } } },
    orderBy: { clockInAt: "asc" },
  });

  const sessions = rows.map((row) => serializeSession(row, now));

  return { sessions, ...summarize(sessions) };
}

async function todaySnapshot(userId, message) {
  const base = await getLegacyToday(userId);
  const now = new Date(base.serverTime);
  const day = await loadDay(String(userId), base.dateKey, now);

  const lastClosed = [...day.sessions].reverse().find((item) => !item.open);

  return {
    ...base,
    ...(message ? { message } : {}),
    state: day.state,
    sessions: day.sessions,
    totals: day.totals,
    record: day.firstClockInAt
      ? {
          id: `day-${base.dateKey}`,
          dateKey: base.dateKey,
          clockInAt: day.firstClockInAt,
          clockOutAt: day.lastClockOutAt,
          workedMinutes: day.totals.workedMinutes,
          breakMinutes: day.totals.breakMinutes,
          description: lastClosed?.description || "",
          status: "present",
        }
      : null,
  };
}

/*
|--------------------------------------------------------------------------
| Employee: Today
|--------------------------------------------------------------------------
*/

export async function getMyToday(userId) {
  return todaySnapshot(userId);
}

/*
|--------------------------------------------------------------------------
| Employee: Clock In (unlimited times per day)
|--------------------------------------------------------------------------
*/

export async function clockIn(userId, pin) {
  const user = await verifyPin(userId, pin);

  const id = String(userId);
  const now = new Date();
  const dateKey = todayStr(now, normalizeTimeZone(user.timeZone));

  await ensureLegacySession(id, dateKey);

  const open = await prisma.attendanceSession.findFirst({
    where: { userId: id, clockOutAt: null },
  });

  if (open) {
    return todaySnapshot(userId, "You are already clocked in.");
  }

  await prisma.attendanceSession.create({
    data: { userId: id, dateKey, clockInAt: now },
  });

  const record = await prisma.attendance.findUnique({
    where: { userId_dateKey: { userId: id, dateKey } },
  });

  if (!record) {
    await prisma.attendance.create({
      data: {
        userId: id,
        dateKey,
        clockInAt: now,
        clockOutAt: null,
        workedMinutes: 0,
        status: "present",
        description: "",
      },
    });
  } else {
    await prisma.attendance.update({
      where: { id: record.id },
      data: {
        clockInAt: record.clockInAt || now,
        clockOutAt: null,
        status: "present",
      },
    });
  }

  return todaySnapshot(userId, "Clock In successful.");
}

/*
|--------------------------------------------------------------------------
| Employee: Break start / end
|--------------------------------------------------------------------------
*/

async function findOpenSession(userId) {
  return prisma.attendanceSession.findFirst({
    where: { userId: String(userId), clockOutAt: null },
    orderBy: { clockInAt: "desc" },
  });
}

export async function startBreak(userId) {
  await getActiveUser(userId);

  const session = await findOpenSession(userId);

  if (!session) {
    throw fail(400, "Please clock in first.", "NOT_CLOCKED_IN");
  }

  const openBreak = await prisma.attendanceBreak.findFirst({
    where: { sessionId: session.id, endAt: null },
  });

  if (openBreak) {
    throw fail(409, "You are already on a break.", "ALREADY_ON_BREAK");
  }

  await prisma.attendanceBreak.create({
    data: {
      sessionId: session.id,
      userId: String(userId),
      dateKey: session.dateKey,
      startAt: new Date(),
    },
  });

  return todaySnapshot(userId, "Break started.");
}

export async function endBreak(userId) {
  await getActiveUser(userId);

  const session = await findOpenSession(userId);

  if (!session) {
    throw fail(400, "Please clock in first.", "NOT_CLOCKED_IN");
  }

  const openBreak = await prisma.attendanceBreak.findFirst({
    where: { sessionId: session.id, endAt: null },
  });

  if (!openBreak) {
    throw fail(400, "You are not on a break.", "NOT_ON_BREAK");
  }

  const endAt = new Date();

  await prisma.attendanceBreak.update({
    where: { id: openBreak.id },
    data: { endAt, minutes: diffMinutes(openBreak.startAt, endAt) },
  });

  return todaySnapshot(userId, "Break ended. Welcome back!");
}

/*
|--------------------------------------------------------------------------
| Employee: Clock Out
|--------------------------------------------------------------------------
*/

export async function clockOut(userId, pin, description = "") {
  await verifyPin(userId, pin);

  const note = String(description ?? "").trim();

  if (!note) {
    throw fail(
      400,
      "Please enter your work description before Clock Out.",
      "DESCRIPTION_REQUIRED"
    );
  }

  if (note.length > 500) {
    throw fail(
      400,
      "Description must be 500 characters or fewer.",
      "DESCRIPTION_TOO_LONG"
    );
  }

  const id = String(userId);
  const session = await findOpenSession(id);

  if (!session) {
    throw fail(400, "Please clock in first.", "NOT_CLOCKED_IN");
  }

  const now = new Date();

  // Break chal rahi ho to pehle usko band karo
  const openBreak = await prisma.attendanceBreak.findFirst({
    where: { sessionId: session.id, endAt: null },
  });

  if (openBreak) {
    await prisma.attendanceBreak.update({
      where: { id: openBreak.id },
      data: { endAt: now, minutes: diffMinutes(openBreak.startAt, now) },
    });
  }

  const breaks = await prisma.attendanceBreak.findMany({
    where: { sessionId: session.id },
  });

  const breakMinutes = breaks.reduce((sum, item) => sum + item.minutes, 0);

  const workedMinutes = Math.max(
    0,
    diffMinutes(session.clockInAt, now) - breakMinutes
  );

  await prisma.attendanceSession.update({
    where: { id: session.id },
    data: {
      clockOutAt: now,
      workedMinutes,
      breakMinutes,
      description: note,
    },
  });

  // Din ka summary record (purani reports isi se chalti hain)
  const daySessions = await prisma.attendanceSession.findMany({
    where: { userId: id, dateKey: session.dateKey },
    orderBy: { clockInAt: "asc" },
  });

  const totalWorked = daySessions.reduce(
    (sum, item) => sum + (item.clockOutAt ? item.workedMinutes : 0),
    0
  );

  const combinedNotes = daySessions
    .map((item) => item.description)
    .filter(Boolean)
    .join(" | ")
    .slice(0, 500);

  const dayRecord = await prisma.attendance.findUnique({
    where: { userId_dateKey: { userId: id, dateKey: session.dateKey } },
  });

  if (!dayRecord) {
    await prisma.attendance.create({
      data: {
        userId: id,
        dateKey: session.dateKey,
        clockInAt: daySessions[0]?.clockInAt || session.clockInAt,
        clockOutAt: now,
        workedMinutes: totalWorked,
        status: "present",
        description: combinedNotes,
      },
    });
  } else {
    await prisma.attendance.update({
      where: { id: dayRecord.id },
      data: {
        clockOutAt: now,
        workedMinutes: totalWorked,
        status: "present",
        description: combinedNotes,
      },
    });
  }

  return todaySnapshot(userId, "Clock Out successful.");
}

/*
|--------------------------------------------------------------------------
| Admin: Daily overview with every clock in/out and break
|--------------------------------------------------------------------------
*/

function legacySession(row) {
  return {
    id: `legacy-${row.userId}`,
    dateKey: "",
    clockInAt: row.clockInAt,
    clockOutAt: row.clockOutAt || null,
    workedMinutes: row.workedMinutes || 0,
    breakMinutes: 0,
    description: row.description || "",
    open: !row.clockOutAt,
    onBreak: false,
    breaks: [],
  };
}

export async function getAdminOverview(query = {}) {
  const base = await getLegacyOverview(query);

  const userIds = base.rows.map((row) => row.userId);
  const now = new Date();

  const dbSessions = userIds.length
    ? await prisma.attendanceSession.findMany({
        where: { dateKey: base.date, userId: { in: userIds } },
        include: { breaks: { orderBy: { startAt: "asc" } } },
        orderBy: { clockInAt: "asc" },
      })
    : [];

  const byUser = new Map();

  for (const session of dbSessions) {
    const list = byUser.get(session.userId) || [];
    list.push(serializeSession(session, now));
    byUser.set(session.userId, list);
  }

  let working = 0;
  let onBreak = 0;

  const rows = base.rows.map((row) => {
    let sessions = byUser.get(row.userId) || [];

    if (sessions.length === 0 && row.clockInAt) {
      sessions = [legacySession(row)];
    }

    const day = summarize(sessions);

    if (day.state === "in") working += 1;
    if (day.state === "break") onBreak += 1;

    return {
      ...row,
      clockInAt: day.firstClockInAt || row.clockInAt,
      clockOutAt: sessions.length ? day.lastClockOutAt : row.clockOutAt,
      workedMinutes: sessions.length
        ? day.totals.workedMinutes
        : row.workedMinutes,
      clockInCount: day.totals.clockIns,
      clockOutCount: day.totals.clockOuts,
      breakCount: day.totals.breakCount,
      breakMinutes: day.totals.breakMinutes,
      state: day.state,
      sessions,
    };
  });

  return {
    ...base,
    stats: { ...base.stats, working, onBreak },
    rows,
  };
}

/*
|--------------------------------------------------------------------------
| Admin: One employee's history with sessions and breaks
|--------------------------------------------------------------------------
*/

export async function getEmployeeAttendance(userId) {
  const base = await getLegacyEmployeeAttendance(userId);
  const now = new Date();

  const dateKeys = base.records.map((record) => record.dateKey);

  const dbSessions = dateKeys.length
    ? await prisma.attendanceSession.findMany({
        where: { userId: String(userId), dateKey: { in: dateKeys } },
        include: { breaks: { orderBy: { startAt: "asc" } } },
        orderBy: { clockInAt: "asc" },
      })
    : [];

  const byDate = new Map();

  for (const session of dbSessions) {
    const list = byDate.get(session.dateKey) || [];
    list.push(serializeSession(session, now));
    byDate.set(session.dateKey, list);
  }

  return {
    ...base,
    records: base.records.map((record) => {
      const sessions = byDate.get(record.dateKey) || [];
      const day = summarize(sessions);

      return {
        ...record,
        clockInCount: day.totals.clockIns,
        clockOutCount: day.totals.clockOuts,
        breakCount: day.totals.breakCount,
        breakMinutes: day.totals.breakMinutes,
        workedMinutes: sessions.length
          ? day.totals.workedMinutes
          : record.workedMinutes,
        sessions,
      };
    }),
  };
}