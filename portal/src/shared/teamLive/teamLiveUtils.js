import {
  getBreakLabel,
  getSessionBreakMinutes,
  getSessionWorkedMinutes,
} from "@/utils/attendanceSessions";

export { getBreakLabel };

// Daily target used for the small progress bar on every person card.
export const DAILY_TARGET_MINUTES = 8 * 60;

// Tailwind classes are written out in full so they are never purged.
export const STATUS_META = {
  working: {
    label: "Working",
    dot: "bg-emerald-500",
    text: "text-emerald-400",
    chip: "border-emerald-500/40 bg-emerald-500/10 text-emerald-300",
    bar: "bg-emerald-500",
  },
  break: {
    label: "On break",
    dot: "bg-amber-500",
    text: "text-amber-400",
    chip: "border-amber-500/40 bg-amber-500/10 text-amber-300",
    bar: "bg-amber-500",
  },
  out: {
    label: "Clocked out",
    dot: "bg-neutral-500",
    text: "text-neutral-400",
    chip: "border-white/15 bg-white/5 text-white/60",
    bar: "bg-neutral-500",
  },
  not_in: {
    label: "Not clocked in",
    dot: "bg-red-600",
    text: "text-red-400",
    chip: "border-red-600/40 bg-red-600/10 text-red-300",
    bar: "bg-red-600",
  },
};

export const STATUS_FILTERS = [
  { key: "all", label: "All" },
  { key: "working", label: "Working" },
  { key: "break", label: "On break" },
  { key: "out", label: "Clocked out" },
  { key: "not_in", label: "Not in" },
];

const STATUS_ORDER = { working: 0, break: 1, out: 2, not_in: 3 };

/* ------------------------------ Formatting ------------------------------ */

export function formatTime(value) {
  if (!value) return "--:--";

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "--:--";

  return date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
}

// 135 -> "2h 15m", 45 -> "45m"
export function formatDuration(totalMinutes = 0) {
  const minutes = Math.max(0, Math.round(Number(totalMinutes) || 0));
  const hours = Math.floor(minutes / 60);
  const rest = minutes % 60;

  return hours > 0 ? `${hours}h ${String(rest).padStart(2, "0")}m` : `${rest}m`;
}

// "just now", "5m ago", "2h ago"
export function formatAgo(value, now = new Date()) {
  if (!value) return "";

  const minutes = Math.floor(
    (new Date(now).getTime() - new Date(value).getTime()) / 60000
  );

  if (minutes < 1) return "just now";
  if (minutes < 60) return `${minutes}m ago`;

  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;

  return `${Math.floor(hours / 24)}d ago`;
}

export function initials(name = "") {
  return (
    String(name)
      .trim()
      .split(/\s+/)
      .slice(0, 2)
      .map((part) => part[0]?.toUpperCase() || "")
      .join("") || "NA"
  );
}

/* ------------------------------ Live totals ----------------------------- */

// Worked minutes including the session that is still running.
export function getLiveWorkedMinutes(person, now) {
  return (person?.sessions || []).reduce(
    (sum, session) => sum + getSessionWorkedMinutes(session, now),
    0
  );
}

export function getLiveBreakMinutes(person, now) {
  return (person?.sessions || []).reduce(
    (sum, session) => sum + getSessionBreakMinutes(session, now),
    0
  );
}

/* -------------------------------- Grouping ------------------------------ */

export function sortMembers(list) {
  return [...list].sort(
    (a, b) =>
      STATUS_ORDER[a.status] - STATUS_ORDER[b.status] ||
      String(a.name).localeCompare(String(b.name))
  );
}

// Organisation -> Admin(s) -> Departments -> Employees.
export function groupPeople(people = []) {
  const admins = people.filter((person) => person.role === "admin");
  const byDepartment = new Map();

  people
    .filter((person) => person.role !== "admin")
    .forEach((person) => {
      const key = person.department?.trim() || "General";

      if (!byDepartment.has(key)) byDepartment.set(key, []);
      byDepartment.get(key).push(person);
    });

  const departments = [...byDepartment.entries()]
    .sort((a, b) => a[0].localeCompare(b[0]))
    .map(([name, members]) => ({ name, members: sortMembers(members) }));

  return { admins: sortMembers(admins), departments };
}

export function matchesFilters(person, search, status) {
  if (status !== "all" && person.status !== status) return false;

  const term = String(search || "").trim().toLowerCase();
  if (!term) return true;

  return [person.name, person.email, person.department, person.designation]
    .join(" ")
    .toLowerCase()
    .includes(term);
}

export function countByStatus(list = []) {
  return list.reduce(
    (acc, person) => {
      acc[person.status] = (acc[person.status] || 0) + 1;
      return acc;
    },
    { working: 0, break: 0, out: 0, not_in: 0 }
  );
}