export const STATUSES = [
  { key: "todo", label: "To Do" },
  { key: "inprogress", label: "In Progress" },
  { key: "revision", label: "Revision" },
  { key: "approved", label: "Approved" },
];

export const PRIORITIES = ["High", "Medium", "Low"];

export const PRIORITY_STYLES = {
  High: "bg-red-950/70 text-red-400 border-red-900/60",
  Medium: "bg-amber-950/60 text-amber-400 border-amber-900/60",
  Low: "bg-emerald-950/60 text-emerald-400 border-emerald-900/60",
};

export const EMPLOYEES = [];

export const INITIAL_TASKS = [];

export const formatDate = (date) =>
  date
    ? new Date(date.length <= 10 ? `${date}T00:00:00` : date).toLocaleDateString("en-GB", {
        day: "numeric", month: "long", year: "numeric",
      })
    : "—";

export const formatDateTime = (iso) =>
  iso
    ? `${formatDate(iso)}, ${new Date(iso).toLocaleTimeString("en-GB", { hour: "2-digit", minute: "2-digit" })}`
    : "—";
