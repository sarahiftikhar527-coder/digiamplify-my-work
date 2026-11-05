export const STATUSES = ["Ongoing", "Pending", "Resolved"];
export const PRIORITIES = ["High", "Medium", "Low"];
export const CATEGORIES = ["Attendance", "Leave", "Finance", "Payroll"];
export const PAGE_SIZE = 5;

export const STATUS_STYLES = {
  Ongoing: "border-red-700 bg-red-950/30 text-red-500",
  Pending: "border-amber-500 bg-amber-950/20 text-amber-400",
  Resolved: "border-emerald-600 bg-emerald-950/30 text-emerald-400",
};

export const PRIORITY_TEXT = {
  High: "text-red-500",
  Medium: "text-amber-400",
  Low: "text-emerald-500",
};

export const YESTERDAY = { open: 0, inProgress: 0, resolved: 0, critical: 0 };

const PEOPLE = [];

export const INITIAL_ESCALATIONS = [];

const MONTHS = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];

const toDate = (value) => new Date(value.length <= 10 ? `${value}T00:00:00` : value);

export const formatSubmitted = (value) => {
  if (!value) return "—";
  const d = toDate(value);
  return `${d.getDate()} ${MONTHS[d.getMonth()]}, ${d.getFullYear()}`;
};

export const formatCreated = (iso) => {
  if (!iso) return "—";
  const d = new Date(iso);
  const time = d.toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit" });
  return d.toDateString() === new Date().toDateString() ? `Today, ${time}` : `${formatSubmitted(iso)}, ${time}`;
};

export const isToday = (iso) => Boolean(iso) && new Date(iso).toDateString() === new Date().toDateString();

export const getGreeting = (date = new Date()) => {
  const h = date.getHours();
  return h < 12 ? "Good Morning" : h < 17 ? "Good Afternoon" : "Good Evening";
};

export const formatLongDate = (date = new Date()) =>
  `${date.toLocaleDateString("en-US", { weekday: "long" })}, ${date.getDate()} ${MONTHS[date.getMonth()]} ${date.getFullYear()}`;
