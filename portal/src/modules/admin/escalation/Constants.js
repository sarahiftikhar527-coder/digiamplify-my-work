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

// Yesterday's numbers, used for the "from yesterday" comparison on the stat cards.
// Replace with API data when the backend is connected.
export const YESTERDAY = { open: 9, inProgress: 3, resolved: 2, critical: 1 };

const at = (h, m) => {
  const d = new Date();
  d.setHours(h, m, 0, 0);
  return d.toISOString();
};

const DOC = "https://example.com/document.pdf";

const PEOPLE = [
  { name: "Fahad", role: "Web Developer", avatar: "" },
  { name: "Ayesha Noor", role: "UI/UX Designer", avatar: "" },
  { name: "Hamza Ali", role: "App Developer", avatar: "" },
  { name: "Mariam Zahid", role: "QA Engineer", avatar: "" },
  { name: "Daniyal Khan", role: "Backend Developer", avatar: "" },
];

const mk = (id, p, category, priority, status, doc, subject, description, issue, department, submittedAt, h, m) => ({
  id,
  employee: PEOPLE[p],
  department,
  category,
  subject,
  description,
  issue,
  priority,
  status,
  document: doc,
  submittedAt,
  createdAt: at(h, m),
  resolvedAt: status === "Resolved" ? at(h + 1 > 23 ? 23 : h + 1, m) : null,
});

const ISSUE = "Unable to clock in after shift assignment. System displays an error message.";

// Replace with API data when the backend is connected.
export const INITIAL_ESCALATIONS = [
  mk(1, 0, "Attendance", "High", "Ongoing", DOC, "Design Employee screen", "You have to design this employee screen", ISSUE, "Design Team", "2026-07-13", 8, 40),
  mk(2, 0, "Leave", "Low", "Resolved", DOC, "Design Employee screen", "You have to design this employee screen", "Leave balance is not updating after approval.", "Design Team", "2026-07-13", 9, 5),
  mk(3, 0, "Finance", "Medium", "Ongoing", null, "Design Employee screen", "You have to design this employee screen", "Reimbursement request is stuck in review.", "Finance Team", "2026-07-13", 9, 30),
  mk(4, 0, "Payroll", "High", "Pending", DOC, "Design Employee screen", "You have to design this employee screen", "Salary slip shows an incorrect deduction.", "Finance Team", "2026-07-13", 10, 10),
  mk(5, 0, "Attendance", "Low", "Ongoing", DOC, "Design Employee screen", "You have to design this employee screen", "Late check-in marked by mistake.", "Design Team", "2026-07-13", 10, 45),
  mk(6, 1, "Leave", "Medium", "Pending", DOC, "Update leave policy page", "Leave policy page needs the new rules", "Annual leave count is showing the old policy.", "Design Team", "2026-07-12", 11, 15),
  mk(7, 2, "Payroll", "High", "Ongoing", DOC, "Fix bonus calculation", "Bonus amount is not matching the sheet", "Quarterly bonus was calculated on the wrong base salary.", "Engineering", "2026-07-12", 11, 50),
  mk(8, 3, "Attendance", "Medium", "Resolved", null, "Biometric sync failure", "Attendance is not syncing from the device", "Biometric device stopped syncing with the system.", "QA Team", "2026-07-12", 12, 20),
  mk(9, 4, "Finance", "Low", "Ongoing", DOC, "Invoice approval delay", "Invoice has been waiting for three days", "Invoice approval is pending from the finance lead.", "Engineering", "2026-07-11", 13, 0),
  mk(10, 1, "Payroll", "High", "Pending", DOC, "Tax deduction query", "Tax deducted twice this month", "Tax was deducted twice in the latest payroll.", "Design Team", "2026-07-11", 13, 35),
  mk(11, 2, "Leave", "Low", "Resolved", DOC, "Sick leave not visible", "Approved sick leave is missing", "Approved sick leave is missing from the calendar.", "Engineering", "2026-07-10", 14, 10),
  mk(12, 3, "Attendance", "High", "Ongoing", DOC, "Shift swap request", "Shift swap was not applied", "Shift swap approved but roster not updated.", "QA Team", "2026-07-10", 14, 40),
  mk(13, 4, "Finance", "Medium", "Pending", null, "Travel allowance issue", "Travel allowance missing from payout", "Travel allowance was not included in the payout.", "Engineering", "2026-07-09", 15, 5),
  mk(14, 0, "Payroll", "Low", "Resolved", DOC, "Overtime payment", "Overtime hours not paid", "Overtime hours were paid at the normal rate.", "Design Team", "2026-07-09", 15, 30),
  mk(15, 1, "Leave", "High", "Ongoing", DOC, "Emergency leave approval", "Emergency leave needs urgent approval", "Emergency leave request has no manager response.", "Design Team", "2026-07-08", 16, 0),
];

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