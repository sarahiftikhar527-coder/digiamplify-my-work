export const CATEGORIES = {
  general: { label: "General", color: "#9a9a9a" },
  standup: { label: "Stand-up", color: "#22c55e" },
  review: { label: "Review", color: "#f5a524" },
  one_on_one: { label: "1:1", color: "#a05cff" },
  client: { label: "Client", color: "#4aa3ff" },
  planning: { label: "Planning", color: "#14b8a6" },
  training: { label: "Training", color: "#ec4899" },
  interview: { label: "Interview", color: "#e5192b" },
};

export const MEETING_TYPES = [
  { value: "online", label: "Online" },
  { value: "in_person", label: "In person" },
  { value: "hybrid", label: "Hybrid" },
];

export const PRIORITIES = [
  { value: "low", label: "Low" },
  { value: "normal", label: "Normal" },
  { value: "high", label: "High" },
];

export const RECURRENCES = [
  { value: "none", label: "Does not repeat" },
  { value: "daily", label: "Every day" },
  { value: "weekdays", label: "Every weekday (Mon-Fri)" },
  { value: "weekly", label: "Every week" },
  { value: "biweekly", label: "Every 2 weeks" },
  { value: "monthly", label: "Every month" },
];

export const REMINDERS = [
  { value: 0, label: "No reminder" },
  { value: 5, label: "5 minutes before" },
  { value: 10, label: "10 minutes before" },
  { value: 15, label: "15 minutes before" },
  { value: 30, label: "30 minutes before" },
  { value: 60, label: "1 hour before" },
  { value: 1440, label: "1 day before" },
];

export const RSVP_LABELS = {
  accepted: "Accepted",
  tentative: "Maybe",
  declined: "Declined",
  pending: "Awaiting reply",
};

export const DURATIONS = [15, 30, 45, 60, 90];

const pad = (n) => String(n).padStart(2, "0");
const MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
const WEEKDAYS = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];

export const getTzOffset = () => -new Date().getTimezoneOffset();

export const toDateKey = (value) => {
  const d = value instanceof Date ? value : new Date(value);
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
};

export const toTimeKey = (value) => {
  const d = value instanceof Date ? value : new Date(value);
  return `${pad(d.getHours())}:${pad(d.getMinutes())}`;
};

export const buildISO = (dateKey, timeKey) => {
  const d = new Date(`${dateKey}T${timeKey}:00`);
  return Number.isNaN(d.getTime()) ? null : d.toISOString();
};

export const endOfDayISO = (dateKey) => {
  const d = new Date(`${dateKey}T23:59:59`);
  return Number.isNaN(d.getTime()) ? null : d.toISOString();
};

export const addMinutesToTime = (timeKey, minutes) => {
  const [h, m] = timeKey.split(":").map(Number);
  const total = h * 60 + m + minutes;
  if (total >= 24 * 60) return "23:59";
  return `${pad(Math.floor(total / 60))}:${pad(total % 60)}`;
};

export const minutesBetween = (a, b) => Math.round((new Date(b) - new Date(a)) / 60000);

export const format12 = (value) => {
  const d = value instanceof Date ? value : new Date(value);
  const h = d.getHours();
  return `${pad(((h + 11) % 12) + 1)}:${pad(d.getMinutes())} ${h >= 12 ? "PM" : "AM"}`;
};

export const formatTimeRange = (start, end) => `${format12(start)} - ${format12(end)}`;

export const formatDateLong = (value) => {
  const d = new Date(value);
  return `${WEEKDAYS[d.getDay()]}, ${d.getDate()} ${MONTHS[d.getMonth()]} ${d.getFullYear()}`;
};

export const formatDateShort = (value) => {
  const d = new Date(value);
  return `${d.getDate()} ${MONTHS[d.getMonth()]}`;
};

export const durationText = (minutes) => {
  if (minutes < 60) return `${minutes} min`;
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  return m ? `${h}h ${m}m` : `${h}h`;
};

export const initials = (name = "") =>
  name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0].toUpperCase())
    .join("") || "?";

export function meetingPhase(meeting, now = new Date()) {
  if (meeting.status === "cancelled") return "cancelled";
  const start = new Date(meeting.startAt);
  const end = new Date(meeting.endAt);
  if (now >= start && now < end) return "live";
  if (now >= end) return meeting.status === "completed" ? "completed" : "past";
  return "upcoming";
}

export function relativeStart(meeting, now = new Date()) {
  const phase = meetingPhase(meeting, now);
  if (phase === "live") return "Happening now";
  if (phase === "cancelled") return "Cancelled";
  if (phase === "completed" || phase === "past") return "Ended";
  const mins = Math.max(0, Math.round((new Date(meeting.startAt) - now) / 60000));
  if (mins < 1) return "Starting now";
  if (mins < 60) return `in ${mins} min`;
  if (mins < 24 * 60) {
    const h = Math.floor(mins / 60);
    const m = mins % 60;
    return m ? `in ${h}h ${m}m` : `in ${h}h`;
  }
  const days = Math.round(mins / (24 * 60));
  return days === 1 ? "tomorrow" : `in ${days} days`;
}

export function recurrenceText(meeting) {
  const label = RECURRENCES.find((r) => r.value === meeting.recurrence)?.label;
  if (!label || meeting.recurrence === "none") return "";
  return meeting.recurrenceUntil ? `${label} until ${formatDateShort(meeting.recurrenceUntil)}` : label;
}

export function generateMeetingLink(title = "") {
  const slug =
    title.replace(/[^a-zA-Z0-9]+/g, "-").replace(/^-+|-+$/g, "").slice(0, 24) || "Meeting";
  const rand = Math.random().toString(36).slice(2, 8);
  return `https://meet.jit.si/DigiAmplify-${slug}-${rand}`;
}

/* Calendar grid / day view adapters -------------------------------- */
export function meetingToCalendarEvent(m) {
  const date = toDateKey(m.startAt);
  return {
    id: `meeting-${m.id}-${m.occurrenceKey}`,
    meetingId: m.id,
    occurrenceKey: m.occurrenceKey,
    type: "meeting",
    title: m.title,
    date,
    from: date,
    to: date,
    startDate: date,
    endDate: date,
    startTime: toTimeKey(m.startAt),
    endTime: toTimeKey(m.endAt),
    status: m.status,
    meeting: m,
  };
}

export function meetingToDayItem(m) {
  const place =
    m.meetingType === "online"
      ? "Online"
      : m.location || (m.meetingType === "hybrid" ? "Hybrid" : "In person");
  return {
    id: `meeting-${m.id}-${m.occurrenceKey}`,
    meetingId: m.id,
    meeting: m,
    type: "meeting",
    title: m.title,
    start: toTimeKey(m.startAt),
    end: toTimeKey(m.endAt),
    place,
    attendees: m.attendeeCount,
  };
}

/* .ics export ------------------------------------------------------- */
const icsDate = (value) => new Date(value).toISOString().replace(/[-:]/g, "").replace(/\.\d{3}/, "");
const icsEscape = (text = "") =>
  String(text).replace(/\\/g, "\\\\").replace(/;/g, "\\;").replace(/,/g, "\\,").replace(/\r?\n/g, "\\n");

const fold = (line) => {
  const parts = [];
  let rest = line;
  while (rest.length > 74) {
    parts.push(rest.slice(0, 74));
    rest = ` ${rest.slice(74)}`;
  }
  parts.push(rest);
  return parts.join("\r\n");
};

const RRULES = {
  daily: "FREQ=DAILY",
  weekdays: "FREQ=WEEKLY;BYDAY=MO,TU,WE,TH,FR",
  weekly: "FREQ=WEEKLY",
  biweekly: "FREQ=WEEKLY;INTERVAL=2",
  monthly: "FREQ=MONTHLY",
};

export function buildICS(m) {
  const lines = [
    "BEGIN:VCALENDAR",
    "VERSION:2.0",
    "PRODID:-//DigiAmplify//Meetings//EN",
    "CALSCALE:GREGORIAN",
    "METHOD:PUBLISH",
    "BEGIN:VEVENT",
    `UID:${m.id}@digiamplify`,
    `DTSTAMP:${icsDate(new Date())}`,
    `DTSTART:${icsDate(m.seriesStartAt || m.startAt)}`,
    `DTEND:${icsDate(m.seriesEndAt || m.endAt)}`,
    `SUMMARY:${icsEscape(m.title)}`,
  ];

  const description = [m.description, m.agenda && `Agenda:\n${m.agenda}`, m.meetingLink && `Join: ${m.meetingLink}`]
    .filter(Boolean)
    .join("\n\n");
  if (description) lines.push(`DESCRIPTION:${icsEscape(description)}`);

  const location = [m.location, m.meetingLink].filter(Boolean).join(" | ");
  if (location) lines.push(`LOCATION:${icsEscape(location)}`);
  if (m.meetingLink) lines.push(`URL:${m.meetingLink}`);

  if (RRULES[m.recurrence]) {
    lines.push(`RRULE:${RRULES[m.recurrence]}${m.recurrenceUntil ? `;UNTIL=${icsDate(m.recurrenceUntil)}` : ""}`);
  }

  if (m.status === "cancelled") lines.push("STATUS:CANCELLED");

  if (m.reminderMinutes > 0) {
    lines.push("BEGIN:VALARM", "ACTION:DISPLAY", `DESCRIPTION:${icsEscape(m.title)}`, `TRIGGER:-PT${m.reminderMinutes}M`, "END:VALARM");
  }

  lines.push("END:VEVENT", "END:VCALENDAR");
  return lines.map(fold).join("\r\n");
}

export function downloadFile(filename, content, type = "text/plain;charset=utf-8") {
  const blob = new Blob([content], { type });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  a.remove();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}

export const downloadICS = (m) =>
  downloadFile(
    `${m.title.replace(/[^a-z0-9]+/gi, "-").toLowerCase() || "meeting"}.ics`,
    buildICS(m),
    "text/calendar;charset=utf-8"
  );

const csvCell = (value) => `"${String(value ?? "").replace(/"/g, '""')}"`;

export function exportMeetingsCSV(meetings) {
  const header = ["Title", "Date", "Start", "End", "Category", "Type", "Status", "Organizer", "Attendees", "Accepted", "Declined", "Pending", "Location / Link"];
  const rows = meetings.map((m) => [
    m.title,
    toDateKey(m.startAt),
    toTimeKey(m.startAt),
    toTimeKey(m.endAt),
    CATEGORIES[m.category]?.label || m.category,
    m.meetingType,
    m.status,
    m.organizer?.name || "",
    m.attendeeCount,
    m.rsvpSummary?.accepted || 0,
    m.rsvpSummary?.declined || 0,
    m.rsvpSummary?.pending || 0,
    m.location || m.meetingLink || "",
  ]);
  const csv = [header, ...rows].map((r) => r.map(csvCell).join(",")).join("\r\n");
  downloadFile(`meetings-${toDateKey(new Date())}.csv`, `\uFEFF${csv}`, "text/csv;charset=utf-8");
}