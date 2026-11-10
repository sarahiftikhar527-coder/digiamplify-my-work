import { ROLES } from "../../constants/roles.js";

// Whole seconds between two dates (never negative).
const secondsBetween = (from, to) =>
  Math.max(
    0,
    Math.floor((new Date(to).getTime() - new Date(from).getTime()) / 1000)
  );

// Turns one person's sessions for today into the small, safe object that
// every employee and admin sees on the team board.
//
// state:
//   "absent" - no clock in today
//   "in"     - clocked in and working
//   "break"  - clocked in but on a break
//   "out"    - clocked out
//
// workedSeconds is the worked time as of `now`. When `state` is "in" the
// client keeps adding the seconds that pass after it received the data.
export function summarizeMember(user, sessions, now) {
  let workedSeconds = 0;
  let breakSeconds = 0;
  let openSession = null;

  for (const session of sessions) {
    const breaks = session.breaks || [];

    const sessionBreakSeconds = breaks.reduce(
      (sum, item) =>
        sum +
        (item.endAt
          ? (Number(item.minutes) || 0) * 60
          : secondsBetween(item.startAt, now)),
      0
    );

    breakSeconds += sessionBreakSeconds;

    if (session.clockOutAt) {
      workedSeconds += (Number(session.workedMinutes) || 0) * 60;
    } else {
      openSession = session;
      workedSeconds += Math.max(
        0,
        secondsBetween(session.clockInAt, now) - sessionBreakSeconds
      );
    }
  }

  const onBreak =
    Boolean(openSession) &&
    (openSession.breaks || []).some((item) => !item.endAt);

  let state = "absent";
  if (sessions.length > 0) {
    state = openSession ? (onBreak ? "break" : "in") : "out";
  }

  const closedSessions = sessions.filter((session) => session.clockOutAt);
  const lastClosed = closedSessions[closedSessions.length - 1];

  return {
    userId: String(user.id),
    name: user.name,
    avatarUrl: user.avatarUrl || "",
    department: user.department || "",
    designation: user.designation || "",
    role: user.role,
    state,
    firstClockInAt: sessions.length > 0 ? sessions[0].clockInAt : null,
    lastClockOutAt: openSession ? null : lastClosed?.clockOutAt || null,
    clockIns: sessions.length,
    workedSeconds,
    breakSeconds,
    asOf: new Date(now).toISOString(),
  };
}

// Every employee is listed (so absent people show up).
// Other roles, such as an admin, are listed only after they clock in.
export function shouldShowMember(member) {
  return member.role === ROLES.EMPLOYEE || member.state !== "absent";
}

export function buildStats(members) {
  const stats = { total: members.length, working: 0, onBreak: 0, out: 0, absent: 0 };

  for (const member of members) {
    if (member.state === "in") stats.working += 1;
    else if (member.state === "break") stats.onBreak += 1;
    else if (member.state === "out") stats.out += 1;
    else stats.absent += 1;
  }

  return stats;
}