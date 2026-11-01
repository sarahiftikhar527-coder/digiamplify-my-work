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

// Replace this list with API data when the backend is connected.
export const EMPLOYEES = [
  { id: "e1", name: "Ali Raza", role: "Frontend Developer", avatar: "" },
  { id: "e2", name: "Sara Khan", role: "UI/UX Designer", avatar: "" },
  { id: "e3", name: "Usman Tariq", role: "Backend Developer", avatar: "" },
  { id: "e4", name: "Hina Malik", role: "QA Engineer", avatar: "" },
  { id: "e5", name: "Bilal Ahmed", role: "App Developer", avatar: "" },
];

const now = new Date().toISOString();

export const INITIAL_TASKS = [
  {
    id: "t1", title: "Development", subtitle: "Authentication Screens",
    description: "Develop the login, signup, and forgot password screens. Include input validation and error states.",
    status: "todo", priority: "High", dueDate: "2026-07-19", progress: 20,
    assignees: ["e1", "e2", "e3"], createdAt: now, updatedAt: now,
  },
  {
    id: "t2", title: "Design", subtitle: "Dashboard Layout",
    description: "Finalize the admin dashboard layout and prepare the component design system.",
    status: "inprogress", priority: "Medium", dueDate: "2026-07-25", progress: 62,
    assignees: ["e2", "e4"], createdAt: now, updatedAt: now,
  },
  {
    id: "t3", title: "Development", subtitle: "Task API Integration",
    description: "Connect the task CRUD endpoints to the frontend.",
    status: "revision", priority: "High", dueDate: "2026-07-22", progress: 80,
    assignees: ["e3", "e5"], createdAt: now, updatedAt: now,
  },
  {
    id: "t4", title: "Testing", subtitle: "Login Flow QA",
    description: "Run all login flow test cases and report any bugs found.",
    status: "approved", priority: "Low", dueDate: "2026-07-15", progress: 100,
    assignees: ["e4"], createdAt: now, updatedAt: now,
  },
];

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