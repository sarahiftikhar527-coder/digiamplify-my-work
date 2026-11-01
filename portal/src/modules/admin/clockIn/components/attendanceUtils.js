export const STATS = [
  { key: "present", label: "Present", dot: "bg-green-500" },
  { key: "late", label: "Late", dot: "bg-amber-500" },
  { key: "absent", label: "Absent", dot: "bg-red-400" },
  { key: "leave", label: "On Leave", dot: "bg-blue-400" },
];

export const FILTERS = [
  { key: "all", label: "All" },
  { key: "present", label: "Present" },
  { key: "late", label: "Late" },
  { key: "absent", label: "Absent" },
];

export const BADGE = {
  present: "border-green-500/60 text-green-400",
  late: "border-amber-500/60 text-amber-400",
  absent: "border-red-400/60 text-red-400",
  leave: "border-blue-400/60 text-blue-300",
};

export const BADGE_LABEL = {
  present: "Present",
  late: "Late",
  absent: "Absent",
  leave: "On Leave",
};

// Recent Activity mein Present ki jagah "On Time" dikhta hai
export const RECENT_LABEL = { present: "On Time", late: "Late" };

export const pad = (n) => String(n).padStart(2, "0");

const toDate = (value) => {
  if (!value) return null;
  const d =
    typeof value === "string" && /^\d{4}-\d{2}-\d{2}$/.test(value)
      ? new Date(`${value}T00:00:00`)
      : new Date(value);
  return Number.isNaN(d.getTime()) ? null : d;
};

export function formatTime(value) {
  const d = toDate(value);
  if (!d) return "—";
  return d.toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit" });
}

// Monday, October 19, 2026
export function formatDate(value) {
  const d = toDate(value);
  if (!d) return "";
  return d.toLocaleDateString("en-US", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}

// Fri, 16 Oct
export function formatShortDate(value) {
  const d = toDate(value);
  if (!d) return "";
  const wk = d.toLocaleDateString("en-US", { weekday: "short" });
  const mo = d.toLocaleDateString("en-US", { month: "short" });
  return `${wk}, ${d.getDate()} ${mo}`;
}

// 2h 43m / 0h 00m
export function formatHours(minutes = 0) {
  const m = Math.max(0, Math.round(minutes));
  return `${Math.floor(m / 60)}h ${pad(m % 60)}m`;
}

export function initials(name) {
  if (!name) return "NA";
  return name
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() || "")
    .join("");
}