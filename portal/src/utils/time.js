const toMin = (hhmm) => {
  const [h, m] = hhmm.split(":").map(Number);
  return h * 60 + m;
};

export const toDate = (hhmm, base = new Date()) => {
  const [h, m] = hhmm.split(":").map(Number);
  const d = new Date(base);
  d.setHours(h, m, 0, 0);
  return d;
};

export const formatTime = (d) =>
  d ? new Date(d).toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit" }) : "--:--";

export const formatHHmm = (hhmm) => (hhmm ? formatTime(toDate(hhmm)) : "--:--");

export const formatDateLong = (d) => {
  const date = new Date(d);
  const day = date.toLocaleDateString("en-GB", { weekday: "long" });
  const rest = date.toLocaleDateString("en-GB", { day: "numeric", month: "long", year: "numeric" });
  return `${day}, ${rest}`;
};

export const formatDuration = (mins) => {
  if (mins == null || Number.isNaN(mins)) return "--h --m";
  const m = Math.max(0, Math.round(mins));
  return `${Math.floor(m / 60)}h ${m % 60}m`;
};

export const minutesBetween = (a, b) => Math.round((new Date(b) - new Date(a)) / 60000);

// overnight shift bhi handle hoti hai (end < start)
export const rangeMinutes = (start, end) => {
  if (!start || !end) return 0;
  let diff = toMin(end) - toMin(start);
  if (diff < 0) diff += 1440;
  return diff;
};

export const getShiftBreakMinutes = (shift) =>
  shift?.breakMinutes ?? rangeMinutes(shift?.breakStart, shift?.breakEnd);

export const getShiftTotalMinutes = (shift) =>
  shift?.totalWorkingMinutes ??
  Math.max(0, rangeMinutes(shift?.startTime, shift?.endTime) - getShiftBreakMinutes(shift));

// on_time | late
export const getStatus = (now, shift, record) => {
  if (record?.status) return record.status;
  if (!shift?.startTime) return "on_time";
  const ref = record?.clockInAt ? new Date(record.clockInAt) : now;
  const limit = toDate(shift.startTime, ref).getTime() + (shift.graceMinutes ?? 15) * 60000;
  return ref.getTime() > limit ? "late" : "on_time";
};

export const getWorkedMinutes = (record, now) => {
  if (!record?.clockInAt) return null;
  if (record.clockOutAt && record.workedMinutes != null) return record.workedMinutes;
  const end = record.clockOutAt ? new Date(record.clockOutAt) : now;
  return Math.max(0, minutesBetween(record.clockInAt, end) - (record.breakMinutes ?? 0));
};