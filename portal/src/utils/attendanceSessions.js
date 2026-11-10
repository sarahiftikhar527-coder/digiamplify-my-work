const diffMinutes = (from, to) =>
  Math.max(
    0,
    Math.round((new Date(to).getTime() - new Date(from).getTime()) / 60000)
  );

const diffSeconds = (from, to) =>
  Math.max(
    0,
    Math.floor((new Date(to).getTime() - new Date(from).getTime()) / 1000)
  );

export const BREAK_TYPES = [
  { key: "tea", label: "Tea Break" },
  { key: "lunch", label: "Lunch" },
  { key: "prayer", label: "Prayer" },
  { key: "other", label: "Other" },
];

export const getBreakLabel = (type) =>
  BREAK_TYPES.find((item) => item.key === type)?.label || "Break";

export const formatClock = (totalSeconds = 0) => {
  const total = Math.max(0, Math.floor(totalSeconds));
  const h = String(Math.floor(total / 3600)).padStart(2, "0");
  const m = String(Math.floor((total % 3600) / 60)).padStart(2, "0");
  const s = String(total % 60).padStart(2, "0");

  return `${h}:${m}:${s}`;
};

export const getSessionBreakMinutes = (session, now = new Date()) =>
  (session?.breaks || []).reduce(
    (sum, item) =>
      sum +
      (item.endAt
        ? Number(item.minutes) || 0
        : diffMinutes(item.startAt, now)),
    0
  );

export const getSessionWorkedMinutes = (session, now = new Date()) => {
  if (!session) return 0;

  if (session.clockOutAt) return Number(session.workedMinutes) || 0;

  return Math.max(
    0,
    diffMinutes(session.clockInAt, now) - getSessionBreakMinutes(session, now)
  );
};

export const getDayTotals = (sessions = [], now = new Date()) => ({
  clockIns: sessions.length,
  clockOuts: sessions.filter((item) => item.clockOutAt).length,
  breakCount: sessions.reduce(
    (sum, item) => sum + (item.breaks || []).length,
    0
  ),
  breakMinutes: sessions.reduce(
    (sum, item) => sum + getSessionBreakMinutes(item, now),
    0
  ),
  workedMinutes: sessions.reduce(
    (sum, item) => sum + getSessionWorkedMinutes(item, now),
    0
  ),
});

// Live timer ke liye (seconds tak), break ka time nikal kar
export const getLiveWorkedSeconds = (sessions = [], now = new Date()) =>
  sessions.reduce((sum, session) => {
    if (session.clockOutAt) {
      return sum + (Number(session.workedMinutes) || 0) * 60;
    }

    const breakSeconds = (session.breaks || []).reduce(
      (total, item) =>
        total +
        (item.endAt
          ? (Number(item.minutes) || 0) * 60
          : diffSeconds(item.startAt, now)),
      0
    );

    return sum + Math.max(0, diffSeconds(session.clockInAt, now) - breakSeconds);
  }, 0);

export const getOpenBreak = (sessions = []) => {
  for (const session of sessions) {
    if (session.clockOutAt) continue;

    const open = (session.breaks || []).find((item) => !item.endAt);

    if (open) return open;
  }

  return null;
};