import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import apiClient from "@/services/api/apiClient.js";
import { useAuth } from "@/context/AuthContext/AuthContext/AuthContext.jsx";
import { getPosition, getPositionLabel } from "@/constants/positions";

/*
|--------------------------------------------------------------------------
| Team Lead workspace: Team Tasks
|--------------------------------------------------------------------------
| - Assign one-time or fixed daily tasks to everyone in your hierarchy
| - Track progress on a board, a list or a per-member team view
| - Review work (approve or request changes) and comment on every task
| - Edit, reassign, pause or delete the tasks you manage
| - Export the current view to CSV
|
| The server decides who is "in your team" (direct and indirect reports), so
| this page can never show or change anything outside your hierarchy.
*/

/* ----------------------------- Constants ----------------------------- */

const PRIORITIES = ["High", "Medium", "Low"];
const PRIORITY_RANK = { High: 0, Medium: 1, Low: 2 };

const PRIORITY_STYLES = {
  High: "border-red-900/60 bg-red-950/70 text-red-400",
  Medium: "border-amber-900/60 bg-amber-950/60 text-amber-400",
  Low: "border-emerald-900/60 bg-emerald-950/60 text-emerald-400",
};

const COLUMNS = [
  { id: "todo", label: "To Do", dot: "bg-gray-400" },
  { id: "in-progress", label: "In Progress", dot: "bg-amber-400" },
  { id: "review", label: "In Review", dot: "bg-sky-400" },
  { id: "done", label: "Completed", dot: "bg-emerald-400" },
];

const STATUS_OPTIONS = [
  { value: "pending", label: "To Do" },
  { value: "in-progress", label: "In Progress" },
  { value: "review", label: "In Review" },
  { value: "approved", label: "Completed" },
];

const STATUS_TO_GROUP = {
  pending: "todo",
  "in-progress": "in-progress",
  review: "review",
  approved: "done",
  completed: "done",
};

const GROUP_TO_STATUS = {
  todo: "pending",
  "in-progress": "in-progress",
  review: "review",
  done: "approved",
};

const GROUP_LABEL = Object.fromEntries(
  COLUMNS.map((column) => [column.id, column.label])
);

const VIEWS = [
  { id: "board", label: "Board" },
  { id: "list", label: "All Tasks" },
  { id: "team", label: "My Team" },
];

const SORTS = [
  { id: "newest", label: "Newest first" },
  { id: "due", label: "Due date" },
  { id: "priority", label: "Priority" },
];

const REFRESH_MS = 60 * 1000;
const MAX_COMMENT_LENGTH = 2000;
const MAX_TITLE_LENGTH = 200;

const FIELD_CLASS =
  "w-full rounded-lg border border-white/15 bg-black px-3 py-2 text-sm text-white placeholder:text-gray-500 focus:border-[#c1121f] focus:outline-none focus:ring-1 focus:ring-[#c1121f] disabled:cursor-not-allowed disabled:opacity-60";

const GHOST_BUTTON =
  "rounded-lg border border-white/15 px-4 py-2 text-sm font-medium text-white transition hover:border-[#c1121f] hover:bg-[#c1121f]/10 disabled:cursor-not-allowed disabled:opacity-50";

const PRIMARY_BUTTON =
  "rounded-lg bg-[#c1121f] px-4 py-2 text-sm font-semibold text-white transition hover:bg-[#a50f1a] disabled:cursor-not-allowed disabled:opacity-50";

/* ------------------------------ Helpers ------------------------------ */

const cx = (...parts) => parts.filter(Boolean).join(" ");

const todayKey = () => new Date().toLocaleDateString("en-CA");

const parseDate = (value) => {
  if (!value) return null;

  const text = String(value);
  const date = new Date(text.length <= 10 ? `${text}T00:00:00` : text);

  return Number.isNaN(date.getTime()) ? null : date;
};

const formatDate = (value) => {
  const date = parseDate(value);

  return date
    ? date.toLocaleDateString("en-GB", {
        day: "numeric",
        month: "short",
        year: "numeric",
      })
    : "—";
};

const timeAgo = (value) => {
  const date = parseDate(value);

  if (!date) return "";

  const seconds = Math.max(0, Math.round((Date.now() - date.getTime()) / 1000));

  if (seconds < 60) return "just now";
  if (seconds < 3600) return `${Math.floor(seconds / 60)} min ago`;
  if (seconds < 86400) return `${Math.floor(seconds / 3600)} h ago`;
  if (seconds < 604800) return `${Math.floor(seconds / 86400)} d ago`;

  return formatDate(value);
};

const initials = (name) =>
  String(name || "?")
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() || "")
    .join("") || "?";

const errorMessage = (error, fallback) =>
  error?.response?.data?.message || error?.message || fallback;

const pickMembers = (body) => {
  const candidates = [
    body?.data?.employees?.employees,
    body?.employees?.employees,
    body?.data?.employees,
    body?.employees,
  ];

  return candidates.find(Array.isArray) || [];
};

const normalizeMember = (raw) => ({
  id: String(raw?.id || raw?._id || ""),
  name: raw?.name || raw?.email || "Employee",
  email: raw?.email || "",
  role: raw?.designation || raw?.department || "Employee",
  position: raw?.position || "employee",
  managerId: String(raw?.managerId || ""),
});

const normalizeTask = (raw) => {
  if (!raw || typeof raw !== "object") return null;

  const id = String(raw.id || raw._id || "");

  if (!id) return null;

  const status = String(raw.status || "pending").toLowerCase();
  const assignee = raw.assignedTo && typeof raw.assignedTo === "object" ? raw.assignedTo : null;
  const assigner = raw.assignedBy && typeof raw.assignedBy === "object" ? raw.assignedBy : null;

  return {
    id,
    title: raw.title || "Untitled task",
    subtitle: raw.subtitle || "",
    description: raw.description || "",
    priority: PRIORITIES.includes(raw.priority) ? raw.priority : "Medium",
    taskType: raw.taskType === "daily" ? "daily" : "extra",
    isActive: raw.isActive !== false,
    status,
    group: STATUS_TO_GROUP[status] || "todo",
    dueDate: raw.dueDate ? String(raw.dueDate).slice(0, 10) : "",
    assigneeId: String(assignee?.id || assignee?._id || raw.assignedToId || ""),
    assigneeName: assignee?.name || "Unassigned",
    assigneeRole: assignee?.designation || assignee?.department || "",
    assignedById: String(assigner?.id || assigner?._id || raw.assignedById || ""),
    assignedByName: assigner?.name || "",
    commentCount: Number(raw.commentCount ?? raw._count?.comments ?? 0) || 0,
    timeSpentMinutes: Number(raw.timeSpentMinutes) || 0,
    createdAt: raw.createdAt || "",
    completedAt: raw.completedAt || "",
  };
};

const isOpenTask = (task) => task.taskType === "extra" && task.group !== "done";

const isOverdue = (task, today) =>
  isOpenTask(task) && Boolean(task.dueDate) && task.dueDate < today;

const formatMinutes = (minutes) => {
  if (!minutes) return "";

  const hours = Math.floor(minutes / 60);
  const rest = minutes % 60;

  return hours ? `${hours}h ${rest}m` : `${rest}m`;
};

const sortTasks = (list, sort) => {
  const copy = [...list];

  if (sort === "due") {
    return copy.sort((a, b) => {
      if (!a.dueDate && !b.dueDate) return 0;
      if (!a.dueDate) return 1;
      if (!b.dueDate) return -1;
      return a.dueDate.localeCompare(b.dueDate);
    });
  }

  if (sort === "priority") {
    return copy.sort(
      (a, b) =>
        PRIORITY_RANK[a.priority] - PRIORITY_RANK[b.priority] ||
        String(b.createdAt).localeCompare(String(a.createdAt))
    );
  }

  return copy.sort((a, b) =>
    String(b.createdAt).localeCompare(String(a.createdAt))
  );
};

const csvCell = (value) => {
  let text = String(value ?? "");

  // Stop spreadsheet apps from running text that looks like a formula.
  if (/^[=+\-@]/.test(text)) text = `'${text}`;

  return `"${text.replace(/"/g, '""')}"`;
};

const exportTasksCsv = (tasks) => {
  const header = [
    "Title",
    "Type",
    "Assignee",
    "Priority",
    "Status",
    "Due date",
    "Assigned by",
    "Created",
    "Completed",
    "Comments",
  ];

  const rows = tasks.map((task) => [
    task.title,
    task.taskType === "daily" ? "Fixed daily" : "One-time",
    task.assigneeName,
    task.priority,
    task.taskType === "daily" ? (task.isActive ? "Active" : "Paused") : GROUP_LABEL[task.group],
    task.taskType === "daily" ? "" : task.dueDate,
    task.assignedByName,
    task.createdAt ? String(task.createdAt).slice(0, 10) : "",
    task.completedAt ? String(task.completedAt).slice(0, 10) : "",
    task.commentCount,
  ]);

  const csv = [header, ...rows].map((row) => row.map(csvCell).join(",")).join("\r\n");
  const blob = new Blob([`\uFEFF${csv}`], { type: "text/csv;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");

  link.href = url;
  link.download = `team-tasks-${todayKey()}.csv`;
  document.body.appendChild(link);
  link.click();
  link.remove();
  URL.revokeObjectURL(url);
};

/* -------------------------- Small components -------------------------- */

function Avatar({ name, size = 32 }) {
  return (
    <span
      className="inline-flex shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-[#c1121f] to-[#5c0a10] font-semibold text-white"
      style={{ width: size, height: size, fontSize: Math.max(10, size * 0.38) }}
      aria-hidden="true"
    >
      {initials(name)}
    </span>
  );
}

function PriorityBadge({ priority }) {
  return (
    <span
      className={cx(
        "rounded-full border px-2 py-0.5 text-[11px] font-semibold",
        PRIORITY_STYLES[priority]
      )}
    >
      {priority}
    </span>
  );
}

function StatusPill({ task }) {
  if (task.taskType === "daily") {
    return (
      <span
        className={cx(
          "rounded-full border px-2 py-0.5 text-[11px] font-semibold",
          task.isActive
            ? "border-emerald-900/60 bg-emerald-950/60 text-emerald-400"
            : "border-neutral-700 bg-neutral-900 text-neutral-400"
        )}
      >
        {task.isActive ? "Active" : "Paused"}
      </span>
    );
  }

  const column = COLUMNS.find((item) => item.id === task.group) || COLUMNS[0];

  return (
    <span className="inline-flex items-center gap-1.5 rounded-full border border-white/10 bg-white/5 px-2 py-0.5 text-[11px] font-semibold text-gray-200">
      <span className={cx("h-1.5 w-1.5 rounded-full", column.dot)} />
      {column.label}
    </span>
  );
}

function TypeTag({ task }) {
  return task.taskType === "daily" ? (
    <span className="rounded border border-sky-900/60 bg-sky-950/60 px-1.5 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-sky-300">
      Daily
    </span>
  ) : null;
}

function DueLabel({ task, today }) {
  if (task.taskType === "daily") {
    return <span className="text-xs text-gray-400">Repeats every day</span>;
  }

  const overdue = isOverdue(task, today);

  return (
    <span className={cx("text-xs", overdue ? "font-semibold text-red-400" : "text-gray-400")}>
      {overdue ? "Overdue · " : "Due "}
      {formatDate(task.dueDate)}
    </span>
  );
}

function StatCard({ label, value, hint, active, onClick }) {
  const Tag = onClick ? "button" : "div";

  return (
    <Tag
      {...(onClick ? { type: "button", onClick } : {})}
      className={cx(
        "rounded-xl border bg-[#0d0d0d] p-4 text-left transition",
        onClick && "hover:border-[#c1121f]/60",
        active ? "border-[#c1121f]" : "border-white/10"
      )}
    >
      <p className="text-xs font-medium uppercase tracking-wide text-gray-400">{label}</p>
      <p className="mt-2 text-2xl font-bold text-white">{value}</p>
      {hint ? <p className="mt-1 text-xs text-gray-500">{hint}</p> : null}
    </Tag>
  );
}

function EmptyState({ title, text, action }) {
  return (
    <div className="rounded-xl border border-dashed border-white/15 bg-[#0d0d0d] px-6 py-12 text-center">
      <p className="text-base font-semibold text-white">{title}</p>
      {text ? <p className="mx-auto mt-2 max-w-md text-sm text-gray-400">{text}</p> : null}
      {action ? <div className="mt-4">{action}</div> : null}
    </div>
  );
}

function Toast({ notice }) {
  if (!notice) return null;

  const tone =
    notice.type === "error"
      ? "border-red-500/40 bg-red-950/90 text-red-100"
      : "border-emerald-500/40 bg-emerald-950/90 text-emerald-100";

  return (
    <div
      role="status"
      aria-live="polite"
      className={cx(
        "fixed right-4 top-4 z-[100] max-w-sm rounded-lg border px-4 py-3 text-sm shadow-xl",
        tone
      )}
    >
      {notice.text}
    </div>
  );
}

/* ------------------------------ Task card ------------------------------ */

function TaskCard({ task, today, onOpen, onDragStart }) {
  return (
    <div
      role="button"
      tabIndex={0}
      draggable
      onDragStart={(event) => onDragStart(event, task)}
      onClick={() => onOpen(task)}
      onKeyDown={(event) => {
        if (event.key === "Enter" || event.key === " ") {
          event.preventDefault();
          onOpen(task);
        }
      }}
      className="cursor-grab rounded-lg border border-white/10 bg-black p-3 transition hover:border-[#c1121f]/60 focus:outline-none focus:ring-1 focus:ring-[#c1121f] active:cursor-grabbing"
    >
      <div className="flex items-start justify-between gap-2">
        <p className="text-sm font-semibold leading-snug text-white">{task.title}</p>
        <PriorityBadge priority={task.priority} />
      </div>

      {task.subtitle ? (
        <p className="mt-1 line-clamp-1 text-xs text-gray-400">{task.subtitle}</p>
      ) : null}

      <div className="mt-3 flex items-center gap-2">
        <Avatar name={task.assigneeName} size={24} />
        <span className="truncate text-xs text-gray-300">{task.assigneeName}</span>
      </div>

      <div className="mt-3 flex items-center justify-between gap-2">
        <DueLabel task={task} today={today} />
        <span className="text-xs text-gray-500">
          {task.commentCount} comment{task.commentCount === 1 ? "" : "s"}
        </span>
      </div>
    </div>
  );
}

/* ----------------------------- Assign modal ----------------------------- */

function AssignTaskModal({ members, myId, preset, submitting, onClose, onSubmit }) {
  const today = todayKey();

  const [form, setForm] = useState({
    taskType: "extra",
    title: "",
    subtitle: "",
    description: "",
    priority: "Medium",
    startDate: today,
    dueDate: "",
  });
  const [selected, setSelected] = useState(() => new Set(preset));
  const [query, setQuery] = useState("");
  const [directOnly, setDirectOnly] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    const onKey = (event) => {
      if (event.key === "Escape" && !submitting) onClose();
    };

    window.addEventListener("keydown", onKey);

    return () => window.removeEventListener("keydown", onKey);
  }, [onClose, submitting]);

  const setField = (key) => (event) =>
    setForm((current) => ({ ...current, [key]: event.target.value }));

  const memberName = useMemo(
    () => Object.fromEntries(members.map((member) => [member.id, member.name])),
    [members]
  );

  const visible = useMemo(() => {
    const text = query.trim().toLowerCase();

    return members.filter((member) => {
      if (directOnly && member.managerId !== myId) return false;
      if (!text) return true;

      return `${member.name} ${member.email} ${member.role}`.toLowerCase().includes(text);
    });
  }, [members, query, directOnly, myId]);

  const direct = visible.filter((member) => member.managerId === myId);
  const indirect = visible.filter((member) => member.managerId !== myId);

  const toggle = (id) =>
    setSelected((current) => {
      const next = new Set(current);

      if (next.has(id)) next.delete(id);
      else next.add(id);

      return next;
    });

  const allVisibleSelected =
    visible.length > 0 && visible.every((member) => selected.has(member.id));

  const toggleAllVisible = () =>
    setSelected((current) => {
      const next = new Set(current);

      if (allVisibleSelected) visible.forEach((member) => next.delete(member.id));
      else visible.forEach((member) => next.add(member.id));

      return next;
    });

  const handleSubmit = async (event) => {
    event.preventDefault();

    const title = form.title.trim();
    const subtitle = form.subtitle.trim();
    const isDaily = form.taskType === "daily";

    if (!title) return setError("Please enter a task title.");
    if (title.length > MAX_TITLE_LENGTH) return setError("The title is too long.");
    if (subtitle.length > MAX_TITLE_LENGTH) return setError("The subtitle is too long.");

    if (isDaily && !form.startDate) return setError("Please select a start date.");

    if (!isDaily) {
      if (!form.dueDate) return setError("Please select a due date.");
      if (form.dueDate < today) return setError("The due date cannot be in the past.");
    }

    if (selected.size === 0) return setError("Select at least one team member.");

    setError("");

    const payload = {
      taskType: form.taskType,
      title,
      subtitle,
      description: form.description.trim(),
      priority: form.priority,
      assignees: [...selected],
    };

    if (isDaily) payload.startDate = form.startDate;
    else payload.dueDate = form.dueDate;

    const saved = await onSubmit(payload);

    if (saved) onClose();
  };

  const renderGroup = (title, list) =>
    list.length ? (
      <div key={title}>
        <p className="sticky top-0 bg-[#0d0d0d] px-3 py-1.5 text-[11px] font-semibold uppercase tracking-wide text-gray-500">
          {title} ({list.length})
        </p>

        {list.map((member) => (
          <label
            key={member.id}
            className="flex cursor-pointer items-center gap-3 px-3 py-2 hover:bg-white/5"
          >
            <input
              type="checkbox"
              checked={selected.has(member.id)}
              onChange={() => toggle(member.id)}
              className="h-4 w-4 accent-[#c1121f]"
            />
            <Avatar name={member.name} size={28} />
            <span className="min-w-0 flex-1">
              <span className="block truncate text-sm text-white">{member.name}</span>
              <span className="block truncate text-xs text-gray-500">
                {member.role}
                {member.managerId && member.managerId !== myId && memberName[member.managerId]
                  ? ` · reports to ${memberName[member.managerId]}`
                  : ""}
              </span>
            </span>
          </label>
        ))}
      </div>
    ) : null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget && !submitting) onClose();
      }}
    >
      <form
        role="dialog"
        aria-modal="true"
        aria-labelledby="assign-title"
        onSubmit={handleSubmit}
        className="flex max-h-[92vh] w-full max-w-3xl flex-col overflow-hidden rounded-2xl border border-white/10 bg-[#0d0d0d]"
      >
        <div className="flex items-center justify-between border-b border-white/10 px-5 py-4">
          <div>
            <h2 id="assign-title" className="text-lg font-bold text-white">
              Assign task
            </h2>
            <p className="text-xs text-gray-400">
              You can assign to anyone who reports to you, directly or indirectly.
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            disabled={submitting}
            aria-label="Close"
            className="rounded-lg px-2 py-1 text-xl leading-none text-gray-400 hover:text-white disabled:opacity-50"
          >
            ×
          </button>
        </div>

        <div className="grid flex-1 grid-cols-1 gap-5 overflow-y-auto p-5 md:grid-cols-2">
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-2 rounded-lg border border-white/10 p-1">
              {[
                { id: "extra", label: "One-time task" },
                { id: "daily", label: "Fixed daily task" },
              ].map((option) => (
                <button
                  key={option.id}
                  type="button"
                  onClick={() => setForm((current) => ({ ...current, taskType: option.id }))}
                  className={cx(
                    "rounded-md px-3 py-2 text-sm font-medium transition",
                    form.taskType === option.id
                      ? "bg-[#c1121f] text-white"
                      : "text-gray-400 hover:text-white"
                  )}
                >
                  {option.label}
                </button>
              ))}
            </div>

            <div>
              <label htmlFor="task-title" className="mb-1 block text-xs font-medium text-gray-300">
                Title *
              </label>
              <input
                id="task-title"
                value={form.title}
                onChange={setField("title")}
                maxLength={MAX_TITLE_LENGTH}
                placeholder="e.g. Prepare weekly client report"
                className={FIELD_CLASS}
              />
            </div>

            <div>
              <label htmlFor="task-subtitle" className="mb-1 block text-xs font-medium text-gray-300">
                Short summary
              </label>
              <input
                id="task-subtitle"
                value={form.subtitle}
                onChange={setField("subtitle")}
                maxLength={MAX_TITLE_LENGTH}
                placeholder="Optional one-line summary"
                className={FIELD_CLASS}
              />
            </div>

            <div>
              <label htmlFor="task-description" className="mb-1 block text-xs font-medium text-gray-300">
                Instructions
              </label>
              <textarea
                id="task-description"
                rows={4}
                value={form.description}
                onChange={setField("description")}
                placeholder="What exactly should be done? Add links, goals and acceptance criteria."
                className={FIELD_CLASS}
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label htmlFor="task-priority" className="mb-1 block text-xs font-medium text-gray-300">
                  Priority
                </label>
                <select
                  id="task-priority"
                  value={form.priority}
                  onChange={setField("priority")}
                  className={FIELD_CLASS}
                >
                  {PRIORITIES.map((priority) => (
                    <option key={priority} value={priority}>
                      {priority}
                    </option>
                  ))}
                </select>
              </div>

              {form.taskType === "daily" ? (
                <div>
                  <label htmlFor="task-start" className="mb-1 block text-xs font-medium text-gray-300">
                    Starts on *
                  </label>
                  <input
                    id="task-start"
                    type="date"
                    value={form.startDate}
                    onChange={setField("startDate")}
                    className={FIELD_CLASS}
                  />
                </div>
              ) : (
                <div>
                  <label htmlFor="task-due" className="mb-1 block text-xs font-medium text-gray-300">
                    Due date *
                  </label>
                  <input
                    id="task-due"
                    type="date"
                    min={today}
                    value={form.dueDate}
                    onChange={setField("dueDate")}
                    className={FIELD_CLASS}
                  />
                </div>
              )}
            </div>

            {form.taskType === "daily" ? (
              <p className="rounded-lg border border-sky-900/50 bg-sky-950/30 px-3 py-2 text-xs text-sky-200">
                A fixed daily task repeats every day. Each person posts a daily update instead of
                completing it.
              </p>
            ) : null}
          </div>

          <div className="flex min-h-[320px] flex-col rounded-xl border border-white/10">
            <div className="space-y-2 border-b border-white/10 p-3">
              <div className="flex items-center justify-between">
                <p className="text-sm font-semibold text-white">
                  Assign to *{" "}
                  <span className="font-normal text-gray-400">({selected.size} selected)</span>
                </p>
                <button
                  type="button"
                  onClick={toggleAllVisible}
                  disabled={!visible.length}
                  className="text-xs font-semibold text-[#ff4d5a] hover:underline disabled:opacity-40"
                >
                  {allVisibleSelected ? "Clear shown" : "Select all shown"}
                </button>
              </div>

              <input
                value={query}
                onChange={(event) => setQuery(event.target.value)}
                placeholder="Search by name, email or role"
                aria-label="Search team members"
                className={FIELD_CLASS}
              />

              <label className="flex cursor-pointer items-center gap-2 text-xs text-gray-300">
                <input
                  type="checkbox"
                  checked={directOnly}
                  onChange={(event) => setDirectOnly(event.target.checked)}
                  className="h-3.5 w-3.5 accent-[#c1121f]"
                />
                Show direct reports only
              </label>
            </div>

            <div className="max-h-72 flex-1 overflow-y-auto">
              {members.length === 0 ? (
                <p className="p-4 text-sm text-gray-400">
                  Nobody reports to you yet. Ask an admin to place employees under you in Team
                  Structure.
                </p>
              ) : visible.length === 0 ? (
                <p className="p-4 text-sm text-gray-400">No team member matches your search.</p>
              ) : (
                <>
                  {renderGroup("Direct reports", direct)}
                  {renderGroup("Wider team", indirect)}
                </>
              )}
            </div>
          </div>
        </div>

        <div className="flex flex-wrap items-center justify-between gap-3 border-t border-white/10 px-5 py-4">
          <p role="alert" className="min-h-[1.25rem] text-sm text-red-400">
            {error}
          </p>
          <div className="flex gap-2">
            <button type="button" onClick={onClose} disabled={submitting} className={GHOST_BUTTON}>
              Cancel
            </button>
            <button type="submit" disabled={submitting || members.length === 0} className={PRIMARY_BUTTON}>
              {submitting
                ? "Assigning..."
                : selected.size > 1
                  ? `Assign to ${selected.size} people`
                  : "Assign task"}
            </button>
          </div>
        </div>
      </form>
    </div>
  );
}

/* ----------------------------- Task drawer ----------------------------- */

function TaskDrawer({
  task,
  members,
  busy,
  onClose,
  onStatus,
  onSave,
  onDelete,
  onCountChange,
  flash,
}) {
  const [comments, setComments] = useState([]);
  const [commentsLoading, setCommentsLoading] = useState(true);
  const [commentsError, setCommentsError] = useState("");
  const [draft, setDraft] = useState("");
  const [posting, setPosting] = useState(false);
  const [editing, setEditing] = useState(false);
  const [form, setForm] = useState(null);
  const [formError, setFormError] = useState("");
  const [changesOpen, setChangesOpen] = useState(false);
  const [changeNote, setChangeNote] = useState("");
  const endRef = useRef(null);

  const today = todayKey();

  useEffect(() => {
    const onKey = (event) => {
      if (event.key === "Escape") onClose();
    };

    window.addEventListener("keydown", onKey);

    return () => window.removeEventListener("keydown", onKey);
  }, [onClose]);

  useEffect(() => {
    let cancelled = false;

    const loadComments = async () => {
      setCommentsLoading(true);
      setCommentsError("");

      try {
        const response = await apiClient.get(`/tasks/${task.id}/comments`);

        if (cancelled) return;

        const list = Array.isArray(response?.data?.comments) ? response.data.comments : [];

        setComments(list);
        onCountChange(task.id, list.length);
      } catch (error) {
        if (!cancelled) setCommentsError(errorMessage(error, "Unable to load comments."));
      } finally {
        if (!cancelled) setCommentsLoading(false);
      }
    };

    loadComments();

    return () => {
      cancelled = true;
    };
  }, [task.id, onCountChange]);

  useEffect(() => {
    endRef.current?.scrollIntoView?.({ behavior: "smooth", block: "nearest" });
  }, [comments.length]);

  const sendComment = async (text) => {
    const response = await apiClient.post(`/tasks/${task.id}/comments`, { body: text });
    const created = response?.data?.comment;

    if (created) {
      const next = [...comments, created];

      setComments(next);
      onCountChange(task.id, next.length);
    }
  };

  const handlePost = async () => {
    const text = draft.trim();

    if (!text || posting) return;

    setPosting(true);

    try {
      await sendComment(text);
      setDraft("");
    } catch (error) {
      flash("error", errorMessage(error, "Comment could not be posted."));
    } finally {
      setPosting(false);
    }
  };

  const handleDeleteComment = async (comment) => {
    if (!window.confirm("Delete this comment?")) return;

    try {
      await apiClient.delete(`/tasks/${task.id}/comments/${comment.id}`);

      const next = comments.filter((item) => item.id !== comment.id);

      setComments(next);
      onCountChange(task.id, next.length);
    } catch (error) {
      flash("error", errorMessage(error, "Comment could not be deleted."));
    }
  };

  const handleApprove = () => onStatus(task, "approved");

  const handleRequestChanges = async () => {
    const note = changeNote.trim();

    if (!note) {
      flash("error", "Please describe what needs to change.");
      return;
    }

    setPosting(true);

    try {
      await sendComment(`Changes requested: ${note}`);

      const moved = await onStatus(task, "in-progress");

      if (moved) {
        setChangesOpen(false);
        setChangeNote("");
      }
    } catch (error) {
      flash("error", errorMessage(error, "Could not request changes."));
    } finally {
      setPosting(false);
    }
  };

  const startEdit = () => {
    setForm({
      title: task.title,
      subtitle: task.subtitle,
      description: task.description,
      priority: task.priority,
      dueDate: task.dueDate,
      assignedTo: task.assigneeId,
    });
    setFormError("");
    setEditing(true);
  };

  const setFormField = (key) => (event) =>
    setForm((current) => ({ ...current, [key]: event.target.value }));

  const handleSaveEdit = async () => {
    const title = form.title.trim();

    if (!title) return setFormError("The title cannot be empty.");
    if (title.length > MAX_TITLE_LENGTH) return setFormError("The title is too long.");
    if (task.taskType === "extra" && !form.dueDate) return setFormError("Please select a due date.");

    const patch = {};

    if (title !== task.title) patch.title = title;
    if (form.subtitle.trim() !== task.subtitle) patch.subtitle = form.subtitle.trim();
    if (form.description.trim() !== task.description) patch.description = form.description.trim();
    if (form.priority !== task.priority) patch.priority = form.priority;
    if (task.taskType === "extra" && form.dueDate !== task.dueDate) patch.dueDate = form.dueDate;
    if (form.assignedTo && form.assignedTo !== task.assigneeId) patch.assignedTo = form.assignedTo;

    if (Object.keys(patch).length === 0) {
      setEditing(false);
      return;
    }

    setFormError("");

    const saved = await onSave(task, patch);

    if (saved) setEditing(false);
  };

  const assigneeOptions = useMemo(() => {
    const list = [...members];

    if (task.assigneeId && !list.some((member) => member.id === task.assigneeId)) {
      list.unshift({ id: task.assigneeId, name: task.assigneeName, role: "" });
    }

    return list;
  }, [members, task.assigneeId, task.assigneeName]);

  const isDaily = task.taskType === "daily";

  return (
    <div className="fixed inset-0 z-40 flex justify-end bg-black/70" onMouseDown={(event) => {
      if (event.target === event.currentTarget) onClose();
    }}>
      <aside
        role="dialog"
        aria-modal="true"
        aria-label="Task details"
        className="flex h-full w-full max-w-xl flex-col border-l border-white/10 bg-[#0d0d0d]"
      >
        <header className="flex items-start justify-between gap-3 border-b border-white/10 px-5 py-4">
          <div className="min-w-0">
            <div className="flex flex-wrap items-center gap-2">
              <PriorityBadge priority={task.priority} />
              <StatusPill task={task} />
              <TypeTag task={task} />
            </div>
            {!editing ? (
              <>
                <h2 className="mt-2 break-words text-lg font-bold text-white">{task.title}</h2>
                {task.subtitle ? <p className="mt-0.5 text-sm text-gray-400">{task.subtitle}</p> : null}
              </>
            ) : null}
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close task details"
            className="rounded-lg px-2 py-1 text-xl leading-none text-gray-400 hover:text-white"
          >
            ×
          </button>
        </header>

        <div className="flex-1 space-y-6 overflow-y-auto px-5 py-5">
          {editing && form ? (
            <section className="space-y-3">
              <input
                value={form.title}
                onChange={setFormField("title")}
                maxLength={MAX_TITLE_LENGTH}
                aria-label="Title"
                className={FIELD_CLASS}
              />
              <input
                value={form.subtitle}
                onChange={setFormField("subtitle")}
                maxLength={MAX_TITLE_LENGTH}
                placeholder="Short summary"
                aria-label="Short summary"
                className={FIELD_CLASS}
              />
              <textarea
                rows={4}
                value={form.description}
                onChange={setFormField("description")}
                placeholder="Instructions"
                aria-label="Instructions"
                className={FIELD_CLASS}
              />
              <div className="grid grid-cols-2 gap-3">
                <select
                  value={form.priority}
                  onChange={setFormField("priority")}
                  aria-label="Priority"
                  className={FIELD_CLASS}
                >
                  {PRIORITIES.map((priority) => (
                    <option key={priority} value={priority}>
                      {priority}
                    </option>
                  ))}
                </select>
                {!isDaily ? (
                  <input
                    type="date"
                    value={form.dueDate}
                    onChange={setFormField("dueDate")}
                    aria-label="Due date"
                    className={FIELD_CLASS}
                  />
                ) : null}
              </div>
              <select
                value={form.assignedTo}
                onChange={setFormField("assignedTo")}
                aria-label="Assigned to"
                className={FIELD_CLASS}
              >
                {assigneeOptions.map((member) => (
                  <option key={member.id} value={member.id}>
                    {member.name}
                    {member.role ? ` — ${member.role}` : ""}
                  </option>
                ))}
              </select>

              {formError ? (
                <p role="alert" className="text-sm text-red-400">
                  {formError}
                </p>
              ) : null}

              <div className="flex gap-2">
                <button type="button" onClick={handleSaveEdit} disabled={busy} className={PRIMARY_BUTTON}>
                  {busy ? "Saving..." : "Save changes"}
                </button>
                <button type="button" onClick={() => setEditing(false)} disabled={busy} className={GHOST_BUTTON}>
                  Cancel
                </button>
              </div>
            </section>
          ) : (
            <>
              <section className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <p className="text-xs uppercase tracking-wide text-gray-500">Assigned to</p>
                  <div className="mt-1.5 flex items-center gap-2">
                    <Avatar name={task.assigneeName} size={28} />
                    <div className="min-w-0">
                      <p className="truncate text-white">{task.assigneeName}</p>
                      {task.assigneeRole ? (
                        <p className="truncate text-xs text-gray-500">{task.assigneeRole}</p>
                      ) : null}
                    </div>
                  </div>
                </div>
                <div>
                  <p className="text-xs uppercase tracking-wide text-gray-500">Assigned by</p>
                  <p className="mt-1.5 text-white">{task.assignedByName || "—"}</p>
                </div>
                <div>
                  <p className="text-xs uppercase tracking-wide text-gray-500">
                    {isDaily ? "Schedule" : "Due date"}
                  </p>
                  <p className="mt-1.5">
                    <DueLabel task={task} today={today} />
                  </p>
                </div>
                <div>
                  <p className="text-xs uppercase tracking-wide text-gray-500">Created</p>
                  <p className="mt-1.5 text-white">{formatDate(task.createdAt)}</p>
                </div>
                {task.completedAt ? (
                  <div>
                    <p className="text-xs uppercase tracking-wide text-gray-500">Completed</p>
                    <p className="mt-1.5 text-white">{formatDate(task.completedAt)}</p>
                  </div>
                ) : null}
                {task.timeSpentMinutes ? (
                  <div>
                    <p className="text-xs uppercase tracking-wide text-gray-500">Time spent</p>
                    <p className="mt-1.5 text-white">{formatMinutes(task.timeSpentMinutes)}</p>
                  </div>
                ) : null}
              </section>

              <section>
                <p className="text-xs uppercase tracking-wide text-gray-500">Instructions</p>
                <p className="mt-1.5 whitespace-pre-wrap break-words text-sm text-gray-200">
                  {task.description || "No instructions were added."}
                </p>
              </section>

              {!isDaily && task.group === "review" ? (
                <section className="rounded-xl border border-sky-900/60 bg-sky-950/30 p-4">
                  <p className="text-sm font-semibold text-sky-200">Waiting for your review</p>
                  <p className="mt-1 text-xs text-sky-300/80">
                    Approve the work, or send it back with clear feedback.
                  </p>

                  {changesOpen ? (
                    <div className="mt-3 space-y-2">
                      <textarea
                        rows={3}
                        value={changeNote}
                        onChange={(event) => setChangeNote(event.target.value)}
                        placeholder="What needs to change?"
                        aria-label="Requested changes"
                        className={FIELD_CLASS}
                      />
                      <div className="flex gap-2">
                        <button
                          type="button"
                          onClick={handleRequestChanges}
                          disabled={posting || busy}
                          className={PRIMARY_BUTTON}
                        >
                          Send back
                        </button>
                        <button
                          type="button"
                          onClick={() => setChangesOpen(false)}
                          className={GHOST_BUTTON}
                        >
                          Cancel
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div className="mt-3 flex gap-2">
                      <button type="button" onClick={handleApprove} disabled={busy} className={PRIMARY_BUTTON}>
                        Approve
                      </button>
                      <button type="button" onClick={() => setChangesOpen(true)} className={GHOST_BUTTON}>
                        Request changes
                      </button>
                    </div>
                  )}
                </section>
              ) : null}

              <section className="flex flex-wrap items-center gap-2">
                {!isDaily ? (
                  <select
                    value={task.status === "completed" ? "approved" : task.status}
                    onChange={(event) => onStatus(task, event.target.value)}
                    disabled={busy}
                    aria-label="Change status"
                    className={cx(FIELD_CLASS, "w-auto")}
                  >
                    {STATUS_OPTIONS.map((option) => (
                      <option key={option.value} value={option.value}>
                        {option.label}
                      </option>
                    ))}
                  </select>
                ) : (
                  <button
                    type="button"
                    onClick={() => onSave(task, { isActive: !task.isActive })}
                    disabled={busy}
                    className={GHOST_BUTTON}
                  >
                    {task.isActive ? "Pause daily task" : "Resume daily task"}
                  </button>
                )}

                <button type="button" onClick={startEdit} disabled={busy} className={GHOST_BUTTON}>
                  Edit / Reassign
                </button>
                <button
                  type="button"
                  onClick={() => onDelete(task)}
                  disabled={busy}
                  className="rounded-lg border border-red-900/60 px-4 py-2 text-sm font-medium text-red-400 transition hover:bg-red-950/50 disabled:opacity-50"
                >
                  Delete
                </button>
              </section>
            </>
          )}

          <section>
            <h3 className="text-sm font-semibold text-white">
              Comments <span className="text-gray-500">({comments.length})</span>
            </h3>

            <div className="mt-3 space-y-3">
              {commentsLoading ? (
                <p className="text-sm text-gray-500">Loading comments...</p>
              ) : commentsError ? (
                <p role="alert" className="text-sm text-red-400">
                  {commentsError}
                </p>
              ) : comments.length === 0 ? (
                <p className="text-sm text-gray-500">
                  No comments yet. Start the conversation below.
                </p>
              ) : (
                comments.map((comment) => (
                  <article key={comment.id} className="flex gap-3">
                    <Avatar name={comment.author?.name} size={30} />
                    <div className="min-w-0 flex-1 rounded-lg border border-white/10 bg-black px-3 py-2">
                      <div className="flex flex-wrap items-center gap-x-2 text-xs">
                        <span className="font-semibold text-white">
                          {comment.isMine ? "You" : comment.author?.name || "Unknown"}
                        </span>
                        {comment.author?.position && comment.author.position !== "employee" ? (
                          <span className="text-gray-500">
                            {getPositionLabel(comment.author.position)}
                          </span>
                        ) : null}
                        <span className="text-gray-500">{timeAgo(comment.createdAt)}</span>
                        {comment.isMine ? (
                          <button
                            type="button"
                            onClick={() => handleDeleteComment(comment)}
                            className="ml-auto text-gray-500 hover:text-red-400"
                          >
                            Delete
                          </button>
                        ) : null}
                      </div>
                      <p className="mt-1 whitespace-pre-wrap break-words text-sm text-gray-200">
                        {comment.body}
                      </p>
                    </div>
                  </article>
                ))
              )}
              <div ref={endRef} />
            </div>

            <div className="mt-4">
              <textarea
                rows={3}
                value={draft}
                maxLength={MAX_COMMENT_LENGTH}
                onChange={(event) => setDraft(event.target.value)}
                onKeyDown={(event) => {
                  if (event.key === "Enter" && (event.ctrlKey || event.metaKey)) {
                    event.preventDefault();
                    handlePost();
                  }
                }}
                placeholder="Write a comment, give feedback or ask a question..."
                aria-label="Write a comment"
                className={FIELD_CLASS}
              />
              <div className="mt-2 flex items-center justify-between">
                <span className="text-xs text-gray-500">
                  {draft.length}/{MAX_COMMENT_LENGTH} · Ctrl+Enter to send
                </span>
                <button
                  type="button"
                  onClick={handlePost}
                  disabled={posting || !draft.trim()}
                  className={PRIMARY_BUTTON}
                >
                  {posting ? "Posting..." : "Comment"}
                </button>
              </div>
            </div>
          </section>
        </div>
      </aside>
    </div>
  );
}

/* ------------------------------ Main page ------------------------------ */

export default function TeamLeadTasksPage() {
  const { user } = useAuth();

  const myId = String(user?.id || user?._id || "");
  const positionLabel = getPositionLabel(getPosition(user));

  const [tasks, setTasks] = useState([]);
  const [members, setMembers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState("");
  const [lastUpdated, setLastUpdated] = useState(null);
  const [view, setView] = useState("board");
  const [filters, setFilters] = useState({
    search: "",
    member: "",
    priority: "",
    type: "all",
    quick: "",
    sort: "newest",
  });
  const [assignOpen, setAssignOpen] = useState(false);
  const [assignPreset, setAssignPreset] = useState([]);
  const [selectedId, setSelectedId] = useState(null);
  const [dragOver, setDragOver] = useState("");
  const [busy, setBusy] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [notice, setNotice] = useState(null);
  const noticeTimer = useRef(null);

  const today = todayKey();

  const flash = useCallback((type, text) => {
    setNotice({ type, text });
    clearTimeout(noticeTimer.current);
    noticeTimer.current = setTimeout(() => setNotice(null), 5000);
  }, []);

  useEffect(() => () => clearTimeout(noticeTimer.current), []);

  const load = useCallback(
    async ({ silent = false } = {}) => {
      if (!silent) setLoading(true);

      const [tasksResult, membersResult] = await Promise.allSettled([
        apiClient.get("/tasks/admin"),
        apiClient.get("/users/assignable"),
      ]);

      let failure = "";

      if (tasksResult.status === "fulfilled") {
        const list = tasksResult.value?.data?.tasks;

        setTasks(Array.isArray(list) ? list.map(normalizeTask).filter(Boolean) : []);
      } else {
        failure = errorMessage(tasksResult.reason, "Unable to load tasks.");
      }

      if (membersResult.status === "fulfilled") {
        setMembers(
          pickMembers(membersResult.value?.data)
            .map(normalizeMember)
            .filter((member) => member.id && member.id !== myId)
        );
      } else {
        failure = failure || errorMessage(membersResult.reason, "Unable to load your team.");
      }

      if (!silent) setLoadError(failure);
      else if (!failure) setLoadError("");

      setLastUpdated(new Date());

      if (!silent) setLoading(false);
    },
    [myId]
  );

  useEffect(() => {
    load();
  }, [load]);

  useEffect(() => {
    const timer = setInterval(() => {
      if (document.visibilityState === "visible") load({ silent: true });
    }, REFRESH_MS);

    return () => clearInterval(timer);
  }, [load]);

  /* ----------------------------- Derived data ----------------------------- */

  const stats = useMemo(() => {
    const oneTime = tasks.filter((task) => task.taskType === "extra");
    const open = oneTime.filter((task) => task.group !== "done");
    const done = oneTime.filter((task) => task.group === "done");

    return {
      open: open.length,
      overdue: open.filter((task) => isOverdue(task, today)).length,
      review: oneTime.filter((task) => task.group === "review").length,
      done: done.length,
      rate: oneTime.length ? Math.round((done.length / oneTime.length) * 100) : 0,
    };
  }, [tasks, today]);

  const filtered = useMemo(() => {
    const text = filters.search.trim().toLowerCase();

    const list = tasks.filter((task) => {
      if (filters.member && task.assigneeId !== filters.member) return false;
      if (filters.priority && task.priority !== filters.priority) return false;
      if (filters.type === "extra" && task.taskType !== "extra") return false;
      if (filters.type === "daily" && task.taskType !== "daily") return false;
      if (filters.quick === "overdue" && !isOverdue(task, today)) return false;
      if (filters.quick === "review" && !(task.taskType === "extra" && task.group === "review")) return false;
      if (filters.quick === "open" && !isOpenTask(task)) return false;

      if (!text) return true;

      return `${task.title} ${task.subtitle} ${task.description} ${task.assigneeName}`
        .toLowerCase()
        .includes(text);
    });

    return sortTasks(list, filters.sort);
  }, [tasks, filters, today]);

  const memberStats = useMemo(
    () =>
      members.map((member) => {
        const own = tasks.filter(
          (task) => task.assigneeId === member.id && task.taskType === "extra"
        );
        const open = own.filter((task) => task.group !== "done");
        const done = own.length - open.length;

        return {
          member,
          open: open.length,
          review: own.filter((task) => task.group === "review").length,
          overdue: open.filter((task) => isOverdue(task, today)).length,
          done,
          rate: own.length ? Math.round((done / own.length) * 100) : 0,
          daily: tasks.filter(
            (task) => task.assigneeId === member.id && task.taskType === "daily" && task.isActive
          ).length,
        };
      }),
    [members, tasks, today]
  );

  const memberNameById = useMemo(
    () => Object.fromEntries(members.map((member) => [member.id, member.name])),
    [members]
  );

  const selectedTask = useMemo(
    () => tasks.find((task) => task.id === selectedId) || null,
    [tasks, selectedId]
  );

  const setFilter = (key) => (event) =>
    setFilters((current) => ({ ...current, [key]: event.target.value }));

  const toggleQuick = (quick) =>
    setFilters((current) => ({ ...current, quick: current.quick === quick ? "" : quick }));

  const hasFilters = Boolean(
    filters.search || filters.member || filters.priority || filters.quick || filters.type !== "all"
  );

  const clearFilters = () =>
    setFilters((current) => ({
      ...current,
      search: "",
      member: "",
      priority: "",
      type: "all",
      quick: "",
    }));

  /* -------------------------------- Actions -------------------------------- */

  const openAssign = (preset = []) => {
    setAssignPreset(preset);
    setAssignOpen(true);
  };

  const createTasks = async (payload) => {
    setSubmitting(true);

    try {
      const response = await apiClient.post("/tasks", payload);
      const count = response?.data?.tasks?.length || payload.assignees.length;

      flash(
        "success",
        count > 1 ? `Task assigned to ${count} people.` : "Task assigned successfully."
      );
      await load({ silent: true });

      return true;
    } catch (error) {
      flash("error", errorMessage(error, "Task could not be assigned."));
      return false;
    } finally {
      setSubmitting(false);
    }
  };

  const changeStatus = async (task, status) => {
    const nextStatus = status === "completed" ? "approved" : status;

    if (task.status === nextStatus || (task.group === "done" && nextStatus === "approved")) {
      return true;
    }

    const previous = tasks;

    setTasks((current) =>
      current.map((item) =>
        item.id === task.id
          ? { ...item, status: nextStatus, group: STATUS_TO_GROUP[nextStatus] || item.group }
          : item
      )
    );

    try {
      await apiClient.patch(`/tasks/admin/${task.id}/status`, { status: nextStatus });
      flash("success", `Moved to "${GROUP_LABEL[STATUS_TO_GROUP[nextStatus]]}".`);
      load({ silent: true });

      return true;
    } catch (error) {
      setTasks(previous);
      flash("error", errorMessage(error, "Status could not be updated."));

      return false;
    }
  };

  const saveTask = async (task, patch) => {
    setBusy(true);

    try {
      await apiClient.patch(`/tasks/admin/${task.id}`, patch);
      flash("success", "Task updated.");
      await load({ silent: true });

      return true;
    } catch (error) {
      flash("error", errorMessage(error, "Task could not be updated."));

      return false;
    } finally {
      setBusy(false);
    }
  };

  const deleteTask = async (task) => {
    if (!window.confirm(`Delete "${task.title}"? This cannot be undone.`)) return false;

    setBusy(true);

    try {
      await apiClient.delete(`/tasks/admin/${task.id}`);
      setSelectedId(null);
      flash("success", "Task deleted.");
      await load({ silent: true });

      return true;
    } catch (error) {
      flash("error", errorMessage(error, "Task could not be deleted."));

      return false;
    } finally {
      setBusy(false);
    }
  };

  const updateCommentCount = useCallback((taskId, count) => {
    setTasks((current) =>
      current.map((task) =>
        task.id === taskId && task.commentCount !== count
          ? { ...task, commentCount: count }
          : task
      )
    );
  }, []);

  const closeDrawer = useCallback(() => setSelectedId(null), []);

  const handleDragStart = (event, task) => {
    event.dataTransfer.setData("text/plain", task.id);
    event.dataTransfer.effectAllowed = "move";
  };

  const handleDrop = (event, columnId) => {
    event.preventDefault();
    setDragOver("");

    const taskId = event.dataTransfer.getData("text/plain");
    const task = tasks.find((item) => item.id === taskId);

    if (task && task.taskType === "extra") changeStatus(task, GROUP_TO_STATUS[columnId]);
  };

  const viewMemberTasks = (memberId) => {
    setFilters((current) => ({ ...current, member: memberId, quick: "" }));
    setView("list");
  };

  /* --------------------------------- Render --------------------------------- */

  const boardTasks = filtered.filter((task) => task.taskType === "extra");

  return (
    <div className="min-h-screen bg-black text-white">
      <Toast notice={notice} />

      <div className="mx-auto w-full max-w-[1600px] px-4 py-6 sm:px-6 lg:px-8">
        <header className="mb-6 flex flex-wrap items-start justify-between gap-4">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wider text-[#ff4d5a]">
              {positionLabel} workspace
            </p>
            <h1 className="mt-1 text-2xl font-bold sm:text-3xl">Team Tasks</h1>
            <p className="mt-1 text-sm text-gray-400">
              Assign work to your team, review progress and keep everyone aligned.
              {lastUpdated
                ? ` Last updated ${lastUpdated.toLocaleTimeString("en-GB", {
                    hour: "2-digit",
                    minute: "2-digit",
                  })}.`
                : ""}
            </p>
          </div>

          <div className="flex flex-wrap gap-2">
            <button type="button" onClick={() => load()} disabled={loading} className={GHOST_BUTTON}>
              {loading ? "Refreshing..." : "Refresh"}
            </button>
            <button
              type="button"
              onClick={() => exportTasksCsv(filtered)}
              disabled={filtered.length === 0}
              className={GHOST_BUTTON}
            >
              Export CSV
            </button>
            <button type="button" onClick={() => openAssign()} className={PRIMARY_BUTTON}>
              + Assign Task
            </button>
          </div>
        </header>

        {loadError ? (
          <div
            role="alert"
            className="mb-5 rounded-lg border border-red-500/40 bg-red-500/10 px-4 py-3 text-sm text-red-200"
          >
            <p>{loadError}</p>
            <button
              type="button"
              onClick={() => load()}
              className="mt-2 font-semibold text-white underline underline-offset-4"
            >
              Try again
            </button>
          </div>
        ) : null}

        <section className="mb-6 grid grid-cols-2 gap-3 lg:grid-cols-5">
          <StatCard label="Team members" value={members.length} hint="Direct and indirect reports" />
          <StatCard
            label="Open tasks"
            value={stats.open}
            hint="Not completed yet"
            active={filters.quick === "open"}
            onClick={() => toggleQuick("open")}
          />
          <StatCard
            label="Overdue"
            value={stats.overdue}
            hint="Past their due date"
            active={filters.quick === "overdue"}
            onClick={() => toggleQuick("overdue")}
          />
          <StatCard
            label="Awaiting review"
            value={stats.review}
            hint="Needs your decision"
            active={filters.quick === "review"}
            onClick={() => toggleQuick("review")}
          />
          <StatCard label="Completion rate" value={`${stats.rate}%`} hint={`${stats.done} completed`} />
        </section>

        <div className="mb-5 flex gap-1 border-b border-white/10">
          {VIEWS.map((item) => (
            <button
              key={item.id}
              type="button"
              onClick={() => setView(item.id)}
              className={cx(
                "-mb-px border-b-2 px-4 py-2.5 text-sm font-medium transition-colors",
                view === item.id
                  ? "border-[#c1121f] text-white"
                  : "border-transparent text-gray-400 hover:text-white"
              )}
            >
              {item.label}
            </button>
          ))}
        </div>

        {view !== "team" ? (
          <section className="mb-5 grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-6">
            <input
              value={filters.search}
              onChange={setFilter("search")}
              placeholder="Search tasks or people"
              aria-label="Search tasks"
              className={cx(FIELD_CLASS, "lg:col-span-2")}
            />
            <select value={filters.member} onChange={setFilter("member")} aria-label="Filter by member" className={FIELD_CLASS}>
              <option value="">All members</option>
              {members.map((member) => (
                <option key={member.id} value={member.id}>
                  {member.name}
                </option>
              ))}
            </select>
            <select value={filters.priority} onChange={setFilter("priority")} aria-label="Filter by priority" className={FIELD_CLASS}>
              <option value="">All priorities</option>
              {PRIORITIES.map((priority) => (
                <option key={priority} value={priority}>
                  {priority}
                </option>
              ))}
            </select>
            <select value={filters.type} onChange={setFilter("type")} aria-label="Filter by type" className={FIELD_CLASS}>
              <option value="all">All types</option>
              <option value="extra">One-time tasks</option>
              <option value="daily">Fixed daily tasks</option>
            </select>
            <select value={filters.sort} onChange={setFilter("sort")} aria-label="Sort tasks" className={FIELD_CLASS}>
              {SORTS.map((sort) => (
                <option key={sort.id} value={sort.id}>
                  {sort.label}
                </option>
              ))}
            </select>
          </section>
        ) : null}

        {hasFilters && view !== "team" ? (
          <div className="mb-4 flex items-center gap-3 text-sm text-gray-400">
            <span>
              Showing {filtered.length} of {tasks.length} tasks
            </span>
            <button type="button" onClick={clearFilters} className="font-semibold text-[#ff4d5a] hover:underline">
              Clear filters
            </button>
          </div>
        ) : null}

        {loading ? (
          <div className="rounded-xl border border-white/10 bg-[#0d0d0d] px-5 py-14 text-center text-sm text-gray-400">
            Loading your team workspace...
          </div>
        ) : view === "board" ? (
          members.length === 0 && tasks.length === 0 ? (
            <EmptyState
              title="Your team is empty"
              text="Nobody reports to you yet. Ask an admin to place employees under you in Team Structure, then you can start assigning tasks."
            />
          ) : (
            <div className="grid grid-cols-1 items-start gap-4 md:grid-cols-2 xl:grid-cols-4">
              {COLUMNS.map((column) => {
                const columnTasks = boardTasks.filter((task) => task.group === column.id);

                return (
                  <section
                    key={column.id}
                    onDragOver={(event) => {
                      event.preventDefault();
                      setDragOver(column.id);
                    }}
                    onDragLeave={() => setDragOver("")}
                    onDrop={(event) => handleDrop(event, column.id)}
                    className={cx(
                      "rounded-xl border bg-[#0d0d0d] p-3 transition",
                      dragOver === column.id ? "border-[#c1121f]" : "border-white/10"
                    )}
                  >
                    <div className="mb-3 flex items-center justify-between px-1">
                      <h2 className="flex items-center gap-2 text-sm font-semibold">
                        <span className={cx("h-2 w-2 rounded-full", column.dot)} />
                        {column.label}
                      </h2>
                      <span className="rounded-full bg-white/10 px-2 py-0.5 text-xs text-gray-300">
                        {columnTasks.length}
                      </span>
                    </div>

                    <div className="space-y-3">
                      {columnTasks.length === 0 ? (
                        <p className="rounded-lg border border-dashed border-white/10 px-3 py-6 text-center text-xs text-gray-500">
                          Nothing here
                        </p>
                      ) : (
                        columnTasks.map((task) => (
                          <TaskCard
                            key={task.id}
                            task={task}
                            today={today}
                            onOpen={(item) => setSelectedId(item.id)}
                            onDragStart={handleDragStart}
                          />
                        ))
                      )}
                    </div>
                  </section>
                );
              })}
            </div>
          )
        ) : view === "list" ? (
          filtered.length === 0 ? (
            <EmptyState
              title="No tasks found"
              text={
                hasFilters
                  ? "No task matches the current filters."
                  : "Tasks you assign to your team will appear here."
              }
              action={
                hasFilters ? (
                  <button type="button" onClick={clearFilters} className={GHOST_BUTTON}>
                    Clear filters
                  </button>
                ) : (
                  <button type="button" onClick={() => openAssign()} className={PRIMARY_BUTTON}>
                    Assign a task
                  </button>
                )
              }
            />
          ) : (
            <div className="overflow-x-auto rounded-xl border border-white/10 bg-[#0d0d0d]">
              <table className="w-full min-w-[820px] text-left text-sm">
                <thead className="border-b border-white/10 text-xs uppercase tracking-wide text-gray-500">
                  <tr>
                    <th className="px-4 py-3 font-medium">Task</th>
                    <th className="px-4 py-3 font-medium">Assignee</th>
                    <th className="px-4 py-3 font-medium">Priority</th>
                    <th className="px-4 py-3 font-medium">Status</th>
                    <th className="px-4 py-3 font-medium">Due</th>
                    <th className="px-4 py-3 font-medium">Comments</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5">
                  {filtered.map((task) => (
                    <tr
                      key={task.id}
                      tabIndex={0}
                      onClick={() => setSelectedId(task.id)}
                      onKeyDown={(event) => {
                        if (event.key === "Enter") setSelectedId(task.id);
                      }}
                      className="cursor-pointer transition hover:bg-white/5 focus:bg-white/5 focus:outline-none"
                    >
                      <td className="max-w-[320px] px-4 py-3">
                        <div className="flex items-center gap-2">
                          <span className="truncate font-medium text-white">{task.title}</span>
                          <TypeTag task={task} />
                        </div>
                        {task.subtitle ? (
                          <p className="truncate text-xs text-gray-500">{task.subtitle}</p>
                        ) : null}
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2">
                          <Avatar name={task.assigneeName} size={24} />
                          <span className="truncate text-gray-200">{task.assigneeName}</span>
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <PriorityBadge priority={task.priority} />
                      </td>
                      <td className="px-4 py-3">
                        <StatusPill task={task} />
                      </td>
                      <td className="px-4 py-3">
                        <DueLabel task={task} today={today} />
                      </td>
                      <td className="px-4 py-3 text-gray-400">{task.commentCount}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )
        ) : members.length === 0 ? (
          <EmptyState
            title="No team members yet"
            text="Nobody reports to you yet. An admin can place employees under you in Team Structure."
          />
        ) : (
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
            {memberStats.map(({ member, open, review, overdue, done, rate, daily }) => (
              <article key={member.id} className="rounded-xl border border-white/10 bg-[#0d0d0d] p-4">
                <div className="flex items-center gap-3">
                  <Avatar name={member.name} size={40} />
                  <div className="min-w-0">
                    <p className="truncate font-semibold text-white">{member.name}</p>
                    <p className="truncate text-xs text-gray-400">{member.role}</p>
                    <p className="truncate text-[11px] text-gray-500">
                      {member.managerId === myId
                        ? "Direct report"
                        : `Reports to ${memberNameById[member.managerId] || "a team member"}`}
                    </p>
                  </div>
                </div>

                <div className="mt-4 grid grid-cols-4 gap-2 text-center">
                  {[
                    ["Open", open, "text-white"],
                    ["Review", review, "text-sky-300"],
                    ["Overdue", overdue, overdue ? "text-red-400" : "text-white"],
                    ["Done", done, "text-emerald-400"],
                  ].map(([label, value, tone]) => (
                    <div key={label} className="rounded-lg bg-black py-2">
                      <p className={cx("text-lg font-bold", tone)}>{value}</p>
                      <p className="text-[10px] uppercase tracking-wide text-gray-500">{label}</p>
                    </div>
                  ))}
                </div>

                <div className="mt-4">
                  <div className="mb-1 flex justify-between text-xs text-gray-400">
                    <span>Completion{daily ? ` · ${daily} daily task${daily === 1 ? "" : "s"}` : ""}</span>
                    <span>{rate}%</span>
                  </div>
                  <div
                    className="h-1.5 overflow-hidden rounded-full bg-white/10"
                    role="progressbar"
                    aria-valuenow={rate}
                    aria-valuemin={0}
                    aria-valuemax={100}
                  >
                    <div className="h-full rounded-full bg-[#c1121f]" style={{ width: `${rate}%` }} />
                  </div>
                </div>

                <div className="mt-4 flex gap-2">
                  <button type="button" onClick={() => openAssign([member.id])} className={cx(PRIMARY_BUTTON, "flex-1")}>
                    Assign task
                  </button>
                  <button type="button" onClick={() => viewMemberTasks(member.id)} className={cx(GHOST_BUTTON, "flex-1")}>
                    View tasks
                  </button>
                </div>
              </article>
            ))}
          </div>
        )}
      </div>

      {assignOpen ? (
        <AssignTaskModal
          members={members}
          myId={myId}
          preset={assignPreset}
          submitting={submitting}
          onClose={() => setAssignOpen(false)}
          onSubmit={createTasks}
        />
      ) : null}

      {selectedTask ? (
        <TaskDrawer
          key={selectedTask.id}
          task={selectedTask}
          members={members}
          busy={busy}
          onClose={closeDrawer}
          onStatus={changeStatus}
          onSave={saveTask}
          onDelete={deleteTask}
          onCountChange={updateCommentCount}
          flash={flash}
        />
      ) : null}
    </div>
  );
}