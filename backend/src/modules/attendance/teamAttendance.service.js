
import { prisma } from "../../config/db.js";
import { todayStr } from "./attendance.service.js";

const DEFAULT_TIME_ZONE = "Asia/Karachi";
const DATE_KEY_PATTERN = /^\d{4}-\d{2}-\d{2}$/;
const MAX_EVENTS = 80;

const BREAK_LABELS = {
  tea: "Tea break",
  lunch: "Lunch",
  prayer: "Prayer",
  other: "Break",
};

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

function getMemberAvatar(user) {
  return user.avatarUrl || user.profile?.avatarUrl || "";
}

function serializeBreak(item, now) {
  return {
    id: item.id,
    type: item.type || "other",
    startAt: item.startAt,
    endAt: item.endAt || null,
    minutes: item.endAt ? item.minutes : diffMinutes(item.startAt, now),
    open: !item.endAt,
  };
}

function serializeSession(session, now, includeNotes) {
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
    description: includeNotes ? session.description || "" : "",
    open: !session.clockOutAt,
    onBreak: breaks.some((item) => item.open),
    breaks,
  };
}

function serializeLegacySession(record, now, includeNotes) {
  const open = !record.clockOutAt;

  return {
    id: `legacy-${record.userId}-${record.dateKey}`,
    dateKey: record.dateKey,
    clockInAt: record.clockInAt,
    clockOutAt: record.clockOutAt || null,
    workedMinutes: open
      ? diffMinutes(record.clockInAt, now)
      : record.workedMinutes || 0,
    breakMinutes: 0,
    description: includeNotes ? record.description || "" : "",
    open,
    onBreak: false,
    breaks: [],
  };
}

function getStatus(sessions) {
  const open = sessions.find((item) => item.open);

  if (open) return open.onBreak ? "break" : "working";

  return sessions.length > 0 ? "out" : "not_in";
}

const LEGACY_STATE = {
  working: "in",
  break: "break",
  out: "out",
  not_in: "out",
};

function toLegacyMember(person) {
  return {
    ...person,
    userId: person.id,
    state: LEGACY_STATE[person.status] || "out",
    clockInAt: person.firstClockInAt,
    clockOutAt: person.lastClockOutAt,
  };
}

function buildEvents(people) {
  const events = [];

  for (const person of people) {
    const base = {
      userId: person.id,
      name: person.name,
      role: person.role,
      department: person.department,
    };

    person.sessions.forEach((session, index) => {
      events.push({
        ...base,
        id: `${session.id}:in`,
        type: "clock_in",
        at: session.clockInAt,
        detail: `Session ${index + 1}`,
      });

      for (const item of session.breaks) {
        events.push({
          ...base,
          id: `${item.id}:break-start`,
          type: "break_start",
          at: item.startAt,
          detail: BREAK_LABELS[item.type] || "Break",
        });

        if (item.endAt) {
          events.push({
            ...base,
            id: `${item.id}:break-end`,
            type: "break_end",
            at: item.endAt,
            detail: `${BREAK_LABELS[item.type] || "Break"} (${item.minutes}m)`,
          });
        }
      }

      if (session.clockOutAt) {
        events.push({
          ...base,
          id: `${session.id}:out`,
          type: "clock_out",
          at: session.clockOutAt,
          detail: `Session ${index + 1} · ${session.workedMinutes}m worked`,
        });
      }
    });
  }

  return events
    .sort((a, b) => new Date(b.at).getTime() - new Date(a.at).getTime())
    .slice(0, MAX_EVENTS);
}

export async function getTeamLive(viewer, query = {}) {
  const viewerIsAdmin = String(viewer?.role || "").toLowerCase() === "admin";
  const now = new Date();

  const requestedDate = String(query?.date ?? "").trim();
  const dateOverride =
    viewerIsAdmin && DATE_KEY_PATTERN.test(requestedDate)
      ? requestedDate
      : "";

  const users = await prisma.user.findMany({
    where: {
      status: "active",
      isDeleted: false,
      role: { in: ["admin", "employee"] },
    },
    select: {
      id: true,
      name: true,
      email: true,
      role: true,
      department: true,
      designation: true,
      avatarUrl: true,
      timeZone: true,
      profile: {
        select: {
          avatarUrl: true,
        },
      },
    },
    orderBy: { name: "asc" },
  });

  if (users.length === 0) {
    return {
      date: dateOverride || todayStr(now, DEFAULT_TIME_ZONE),
      isToday: !dateOverride,
      serverTime: now.toISOString(),
      viewerId: String(viewer?.id ?? viewer?._id ?? ""),
      summary: {
        total: 0,
        working: 0,
        onBreak: 0,
        clockedOut: 0,
        notIn: 0,
        workedMinutes: 0,
      },
      people: [],
      events: [],
      meId: String(viewer?.id ?? viewer?._id ?? ""),
      members: [],
    };
  }

  const keyByUser = new Map(
    users.map((user) => [
      user.id,
      dateOverride || todayStr(now, normalizeTimeZone(user.timeZone)),
    ])
  );

  const dateKeys = [...new Set(keyByUser.values())];
  const userIds = users.map((user) => user.id);

  const sessionWhere = dateOverride
    ? { userId: { in: userIds }, dateKey: dateOverride }
    : {
        userId: { in: userIds },
        OR: [{ dateKey: { in: dateKeys } }, { clockOutAt: null }],
      };

  const [sessionRows, legacyRows] = await Promise.all([
    prisma.attendanceSession.findMany({
      where: sessionWhere,
      include: { breaks: { orderBy: { startAt: "asc" } } },
      orderBy: { clockInAt: "asc" },
    }),
    prisma.attendance.findMany({
      where: {
        userId: { in: userIds },
        dateKey: { in: dateKeys },
        clockInAt: { not: null },
      },
    }),
  ]);

  let signedInIds = new Set();

  if (viewerIsAdmin) {
    try {
      const tokens = await prisma.refreshToken.findMany({
        where: { revoked: false, expiresAt: { gt: now } },
        select: { userId: true },
      });

      signedInIds = new Set(tokens.map((token) => token.userId));
    } catch {
    }
  }

  const sessionsByUser = new Map();

  for (const row of sessionRows) {
    const dayKey = keyByUser.get(row.userId);

    if (!dateOverride && row.dateKey !== dayKey && row.clockOutAt) continue;

    const list = sessionsByUser.get(row.userId) || [];
    list.push(serializeSession(row, now, viewerIsAdmin));
    sessionsByUser.set(row.userId, list);
  }

  const legacyByUser = new Map(
    legacyRows
      .filter((row) => row.dateKey === keyByUser.get(row.userId))
      .map((row) => [row.userId, row])
  );

  const viewerId = String(viewer?.id ?? viewer?._id ?? "");

  const people = users.map((user) => {
    let sessions = sessionsByUser.get(user.id) || [];

    if (sessions.length === 0 && legacyByUser.has(user.id)) {
      sessions = [
        serializeLegacySession(legacyByUser.get(user.id), now, viewerIsAdmin),
      ];
    }

    const closed = sessions.filter((item) => !item.open);
    const status = getStatus(sessions);

    const lastClockOutAt =
      status === "working" || status === "break"
        ? null
        : closed[closed.length - 1]?.clockOutAt || null;

    const lastActivityAt = sessions.reduce((latest, session) => {
      const stamps = [
        session.clockInAt,
        session.clockOutAt,
        ...session.breaks.flatMap((item) => [item.startAt, item.endAt]),
      ].filter(Boolean);

      return stamps.reduce(
        (best, stamp) =>
          !best || new Date(stamp) > new Date(best) ? stamp : best,
        latest
      );
    }, null);

    return {
      id: user.id,
      name: user.name,
      email: viewerIsAdmin ? user.email : "",
      role: user.role,
      department: (user.department || "").trim(),
      designation: user.designation || "",
      avatarUrl: getMemberAvatar(user),
      isMe: user.id === viewerId,
      signedIn: viewerIsAdmin ? signedInIds.has(user.id) : null,
      status,
      firstClockInAt: sessions[0]?.clockInAt || null,
      lastClockOutAt,
      lastActivityAt,
      clockInCount: sessions.length,
      clockOutCount: closed.length,
      breakCount: sessions.reduce((sum, item) => sum + item.breaks.length, 0),
      breakMinutes: sessions.reduce((sum, item) => sum + item.breakMinutes, 0),
      workedMinutes: sessions.reduce(
        (sum, item) => sum + item.workedMinutes,
        0
      ),
      sessions,
    };
  });

  const summary = {
    total: people.length,
    working: people.filter((p) => p.status === "working").length,
    onBreak: people.filter((p) => p.status === "break").length,
    clockedOut: people.filter((p) => p.status === "out").length,
    notIn: people.filter((p) => p.status === "not_in").length,
    workedMinutes: people.reduce((sum, p) => sum + p.workedMinutes, 0),
  };

  return {
    date: dateOverride || todayStr(now, DEFAULT_TIME_ZONE),
    isToday: !dateOverride,
    serverTime: now.toISOString(),
    viewerId,
    summary,
    people,
    events: buildEvents(people),
    meId: viewerId,
    members: people.map(toLegacyMember),
  };
}
