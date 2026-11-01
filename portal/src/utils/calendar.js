export const WEEKDAYS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
export const MONTHS = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December',
];

export const EVENT_TYPES = {
  task: { label: 'Task View' },
  absent: { label: 'Absent' },
  weekend: { label: 'Weekend' },
  event: { label: 'Event' },
  holiday: { label: 'Holiday' },
};
export const LEGEND_ORDER = Object.keys(EVENT_TYPES);
export const ALL_VISIBLE = { task: true, absent: true, weekend: true, event: true, holiday: true };

const pad = (n) => String(n).padStart(2, '0');
const mon3 = (d) => MONTHS[d.getMonth()].slice(0, 3);

/* ---------- Dates ---------- */
export const startOfDay = (d) => new Date(d.getFullYear(), d.getMonth(), d.getDate());
export const toISO = (d) => `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
export const fromISO = (s) => {
  const [y, m, d] = s.split('-').map(Number);
  return new Date(y, m - 1, d);
};
export const addDays = (d, n) => new Date(d.getFullYear(), d.getMonth(), d.getDate() + n);
export const addMonths = (d, n) => {
  const first = new Date(d.getFullYear(), d.getMonth() + n, 1);
  const last = new Date(first.getFullYear(), first.getMonth() + 1, 0).getDate();
  return new Date(first.getFullYear(), first.getMonth(), Math.min(d.getDate(), last));
};
export const weekdayIndex = (d) => (d.getDay() + 6) % 7; // Monday = 0
export const startOfWeek = (d) => addDays(d, -weekdayIndex(d));
export const isSameDay = (a, b) =>
  a.getFullYear() === b.getFullYear() && a.getMonth() === b.getMonth() && a.getDate() === b.getDate();

export function monthMatrix(year, month) {
  const first = new Date(year, month, 1);
  const start = startOfWeek(first);
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const weeks = Math.ceil((weekdayIndex(first) + daysInMonth) / 7);
  return Array.from({ length: weeks }, (_, w) =>
    Array.from({ length: 7 }, (_, i) => addDays(start, w * 7 + i))
  );
}

export const weekDays = (d) => {
  const s = startOfWeek(d);
  return Array.from({ length: 7 }, (_, i) => addDays(s, i));
};

export function rangeForView(view, cursor) {
  if (view === 'month') {
    const days = monthMatrix(cursor.getFullYear(), cursor.getMonth()).flat();
    return { from: toISO(days[0]), to: toISO(days[days.length - 1]) };
  }
  if (view === 'week') {
    const w = weekDays(cursor);
    return { from: toISO(w[0]), to: toISO(w[6]) };
  }
  const iso = toISO(cursor);
  return { from: iso, to: iso };
}

/* ---------- Labels ---------- */
export function periodLabel(view, cursor) {
  if (view === 'week') {
    const w = weekDays(cursor);
    return `${w[0].getDate()} ${mon3(w[0])} - ${w[6].getDate()} ${mon3(w[6])} ${w[6].getFullYear()}`;
  }
  return `${MONTHS[cursor.getMonth()]} ${cursor.getFullYear()}`;
}

export const formatLong = (d) =>
  `${d.getDate()} ${MONTHS[d.getMonth()]} ${d.getFullYear()}, ${d.toLocaleDateString('en-GB', { weekday: 'long' })}`;

export const formatShort = (iso) => {
  const d = fromISO(iso);
  return `${d.getDate()} ${mon3(d)}, ${d.getFullYear()}`;
};

export const formatRange = (a, b) => {
  const f = (iso) => {
    const d = fromISO(iso);
    return `${d.getDate()} ${mon3(d)} ${d.getFullYear()}`;
  };
  return `${f(a)} - ${f(b)}`;
};

/* ---------- Time ("HH:MM", 24h) ---------- */
export const toMinutes = (hhmm) => {
  const [h, m] = hhmm.split(':').map(Number);
  return h * 60 + m;
};
export const endMinutes = (hhmm) => (hhmm === '00:00' ? 1440 : toMinutes(hhmm));
export const fromMinutes = (m) => `${pad(Math.floor(m / 60) % 24)}:${pad(m % 60)}`;
export const format12 = (hhmm) => {
  const [h, m] = hhmm.split(':').map(Number);
  return `${pad(((h + 11) % 12) + 1)}:${pad(m)} ${h >= 12 ? 'PM' : 'AM'}`;
};
export const spanMinutes = (start, end) => {
  let m = endMinutes(end) - toMinutes(start);
  if (m < 0) m += 1440;
  return m;
};
export const durationLabel = (mins) => `${pad(Math.floor(mins / 60))}h ${pad(mins % 60)}m`;