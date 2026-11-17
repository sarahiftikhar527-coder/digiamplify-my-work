import { useCallback, useEffect, useMemo, useState } from "react";
import {
  CalendarDays,
  CheckCircle2,
  Circle,
  Clock3,
  Flag,
  RefreshCw,
  Repeat,
  Search,
  ChevronDown,
  Users,
  ListTodo,
  AlertCircle,
  X,
} from "lucide-react";

import apiClient from "@/services/api/apiClient.js";

const STATUS = {
  pending: {
    label: "Open",
    color: "text-gray-300",
    bg: "bg-white/[0.07]",
    dot: "bg-gray-400",
  },
  "in-progress": {
    label: "In Progress",
    color: "text-sky-400",
    bg: "bg-sky-500/10",
    dot: "bg-sky-400",
  },
  review: {
    label: "In Review",
    color: "text-amber-400",
    bg: "bg-amber-500/10",
    dot: "bg-amber-400",
  },
  approved: {
    label: "Completed",
    color: "text-emerald-400",
    bg: "bg-emerald-500/10",
    dot: "bg-emerald-400",
  },
};

const PRIORITY = {
  High: "text-red-400 bg-red-500/10",
  Medium: "text-amber-400 bg-amber-500/10",
  Low: "text-sky-400 bg-sky-500/10",
};

const FILTERS = [
  { value: "all", label: "All Tasks" },
  { value: "pending", label: "Open" },
  { value: "in-progress", label: "In Progress" },
  { value: "review", label: "In Review" },
  { value: "approved", label: "Completed" },
];

const inputCls =
  "h-10 rounded-lg border border-white/[0.08] bg-[#111] px-3 text-sm text-gray-200 outline-none transition focus:border-red-500/50";

const fmtDate = (value) => {
  if (!value) return "";

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) return "";

  return date.toLocaleDateString("en-GB", {
    day: "numeric",
    month: "short",
  });
};

const initials = (name = "") =>
  name
    .split(" ")
    .filter(Boolean)
    .map((word) => word[0])
    .slice(0, 2)
    .join("")
    .toUpperCase() || "?";

const getError = (err, fallback) =>
  err?.response?.data?.message || err?.message || fallback;

function SummaryCard({ icon: Icon, label, value, color }) {
  return (
    <div className="flex min-w-0 items-center gap-3 rounded-xl border border-white/[0.07] bg-[#111] p-3">
      <div className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-lg ${color.bg}`}>
        <Icon size={17} className={color.text} />
      </div>

      <div className="min-w-0">
        <p className="text-[11px] text-gray-500">{label}</p>
        <p className="mt-0.5 text-xl font-semibold leading-none text-white">
          {value}
        </p>
      </div>
    </div>
  );
}

function TaskCard({ task }) {
  const [expanded, setExpanded] = useState(false);

  // A completed task always shows "Completed", whatever the saved status is.
  const statusKey = task.isDone ? "approved" : task.status;

  const status =
    task.taskType === "daily"
      ? null
      : STATUS[statusKey] || STATUS.pending;

  const priority =
    PRIORITY[task.priority] || "bg-white/5 text-gray-400";

  const isDone = Boolean(task.isDone);

  return (
    <article className="group flex min-w-0 flex-col rounded-xl border border-white/[0.07] bg-[#111] p-3.5 transition-all duration-200 hover:border-white/[0.14] hover:bg-[#151515]">
      {/* Card header */}
      <div className="flex items-start justify-between gap-2">
        <div className="flex min-w-0 items-start gap-2.5">
          <div className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-white/[0.05]">
            {task.taskType === "daily" ? (
              <Repeat size={15} className="text-red-400" />
            ) : isDone ? (
              <CheckCircle2 size={16} className="text-emerald-400" />
            ) : (
              <ListTodo size={16} className="text-gray-400" />
            )}
          </div>

          <div className="min-w-0">
            <h4
              className={`break-words text-[13px] font-medium leading-5 ${
                isDone ? "text-gray-400" : "text-white"
              }`}
            >
              {task.title || "Untitled task"}
            </h4>

            <p className="mt-0.5 text-[10px] text-gray-500">
              {task.taskType === "daily" ? "Daily task" : "Assigned task"}
            </p>
          </div>
        </div>

        {task.priority && (
          <span
            className={`shrink-0 rounded-md px-2 py-1 text-[9px] font-medium ${priority}`}
          >
            {task.priority}
          </span>
        )}
      </div>

      {/* Description */}
      {task.description && (
        <p
          className={`mt-3 text-[11px] leading-5 text-gray-500 ${
            expanded ? "whitespace-pre-wrap" : "line-clamp-2"
          }`}
        >
          {task.description}
        </p>
      )}

      {/* Card footer */}
      <div className="mt-3 flex flex-wrap items-center justify-between gap-2 border-t border-white/[0.06] pt-3">
        {task.taskType === "daily" ? (
          <span
            className={`rounded-md px-2 py-1 text-[10px] ${
              task.updatePostedToday
                ? "bg-emerald-500/10 text-emerald-400"
                : "bg-amber-500/10 text-amber-400"
            }`}
          >
            {task.updatePostedToday ? "Update posted" : "No update yet"}
          </span>
        ) : (
          <span
            className={`inline-flex items-center gap-1.5 rounded-md px-2 py-1 text-[10px] ${status.bg} ${status.color}`}
          >
            <span className={`h-1.5 w-1.5 rounded-full ${status.dot}`} />
            {status.label}
          </span>
        )}

        {task.taskType !== "daily" && task.dueDate && (
          <span
            className={`inline-flex items-center gap-1 text-[10px] ${
              task.isOverdue
                ? "text-red-400"
                : task.dueToday
                  ? "text-amber-400"
                  : "text-gray-500"
            }`}
          >
            <CalendarDays size={12} />
            {task.dueToday ? "Today" : fmtDate(task.dueDate)}
          </span>
        )}
      </div>

      {/* Expand details */}
      {(task.description || task.assignedBy?.name) && (
        <button
          type="button"
          onClick={() => setExpanded((value) => !value)}
          className="mt-2 flex items-center justify-center gap-1 border-t border-white/[0.05] pt-2 text-[10px] text-gray-500 transition hover:text-white"
        >
          {expanded ? "Show less" : "View details"}
          <ChevronDown
            size={12}
            className={`transition-transform ${expanded ? "rotate-180" : ""}`}
          />
        </button>
      )}

      {expanded && task.assignedBy?.name && (
        <p className="mt-2 text-[10px] text-gray-500">
          Assigned by: {task.assignedBy.name}
        </p>
      )}
    </article>
  );
}

function EmployeeSection({ employee, tasks, isMe }) {
  const [open, setOpen] = useState(true);

  const completed = tasks.filter((task) => task.isDone).length;

  return (
    <section className="overflow-hidden rounded-xl border border-white/[0.07] bg-[#0d0d0d]">
      {/* Employee header */}
      <button
        type="button"
        onClick={() => setOpen((value) => !value)}
        className="flex w-full items-center gap-3 px-4 py-3.5 text-left transition hover:bg-white/[0.025]"
      >
        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-[#F0202F] to-[#8f101a] text-xs font-semibold text-white">
          {initials(employee?.name)}
        </div>

        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <h3 className="truncate text-sm font-semibold text-white">
              {employee?.name || "Employee"}
            </h3>

            {isMe && (
              <span className="rounded-full bg-red-500/10 px-2 py-0.5 text-[9px] font-medium text-red-400">
                You
              </span>
            )}
          </div>

          <p className="mt-0.5 truncate text-[11px] text-gray-500">
            {employee?.designation || "Team member"}
          </p>
        </div>

        <div className="flex shrink-0 items-center gap-3">
          <div className="text-right">
            <p className="text-sm font-semibold text-white">
              {tasks.length}
            </p>
            <p className="text-[9px] text-gray-500">Tasks</p>
          </div>

          <div className="hidden h-7 w-px bg-white/[0.08] sm:block" />

          <div className="hidden text-right sm:block">
            <p className="text-sm font-semibold text-emerald-400">
              {completed}
            </p>
            <p className="text-[9px] text-gray-500">Completed</p>
          </div>

          <ChevronDown
            size={16}
            className={`text-gray-500 transition-transform duration-200 ${
              open ? "rotate-180" : ""
            }`}
          />
        </div>
      </button>

      {/* Task cards */}
      {open && (
        <div className="border-t border-white/[0.06] p-3 sm:p-4">
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-3">
            {tasks.map((task) => (
              <TaskCard key={task.id} task={task} />
            ))}
          </div>
        </div>
      )}
    </section>
  );
}

export default function TeamTasks() {
  const [tasks, setTasks] = useState([]);
  const [employees, setEmployees] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");
  const [employeeId, setEmployeeId] = useState("all");
  const [status, setStatus] = useState("all");

  const load = useCallback(async () => {
    setLoading(true);
    setError("");

    try {
      const response = await apiClient.get("/tasks/employee/team");

      setTasks(response?.data?.tasks || []);
      setEmployees(response?.data?.employees || []);
    } catch (err) {
      setError(
        getError(err, "Unable to load team tasks. Please try again.")
      );
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const filtered = useMemo(() => {
    const query = search.trim().toLowerCase();

    return tasks.filter((task) => {
      if (
        employeeId !== "all" &&
        task.assignedTo?.id !== employeeId
      ) {
        return false;
      }

      if (status !== "all") {
        const matches =
          status === "approved"
            ? task.isDone
            : !task.isDone && task.status === status;

        if (!matches) return false;
      }

      if (!query) return true;

      return [
        task.title,
        task.subtitle,
        task.description,
        task.assignedTo?.name,
      ]
        .join(" ")
        .toLowerCase()
        .includes(query);
    });
  }, [tasks, search, employeeId, status]);

  const groups = useMemo(() => {
    const map = new Map();

    filtered.forEach((task) => {
      const key = task.assignedTo?.id || "unknown";

      if (!map.has(key)) {
        map.set(key, {
          key,
          employee: task.assignedTo,
          isMe: task.isMine,
          tasks: [],
        });
      }

      map.get(key).tasks.push(task);
    });

    return [...map.values()].sort((a, b) => {
      if (a.isMe !== b.isMe) return a.isMe ? -1 : 1;

      return String(a.employee?.name || "").localeCompare(
        String(b.employee?.name || "")
      );
    });
  }, [filtered]);

  const summary = useMemo(
    () => ({
      total: tasks.length,
      active: tasks.filter(
        (task) => !task.isDone && task.taskType !== "daily"
      ).length,
      done: tasks.filter((task) => task.isDone).length,
      overdue: tasks.filter((task) => task.isOverdue).length,
    }),
    [tasks]
  );

  return (
    <div className="space-y-5">
      {/* Page heading */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="text-lg font-semibold text-white">
            Team Tasks
          </h2>
          <p className="mt-1 text-xs text-gray-500">
            View and track tasks assigned across your team.
          </p>
        </div>

        <button
          type="button"
          onClick={load}
          disabled={loading}
          className="inline-flex h-9 items-center gap-2 rounded-lg border border-white/[0.08] bg-[#111] px-3 text-xs text-gray-300 transition hover:border-red-500/40 hover:text-white disabled:opacity-50"
        >
          <RefreshCw
            size={14}
            className={loading ? "animate-spin" : ""}
          />
          Refresh
        </button>
      </div>

      {/* Summary boxes */}
      {!loading && !error && (
        <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
          <SummaryCard
            icon={Users}
            label="Total Tasks"
            value={summary.total}
            color={{ bg: "bg-white/[0.07]", text: "text-gray-300" }}
          />

          <SummaryCard
            icon={Clock3}
            label="Open Tasks"
            value={summary.active}
            color={{ bg: "bg-sky-500/10", text: "text-sky-400" }}
          />

          <SummaryCard
            icon={CheckCircle2}
            label="Completed"
            value={summary.done}
            color={{ bg: "bg-emerald-500/10", text: "text-emerald-400" }}
          />

          <SummaryCard
            icon={AlertCircle}
            label="Overdue"
            value={summary.overdue}
            color={{ bg: "bg-red-500/10", text: "text-red-400" }}
          />
        </div>
      )}

      {/* Search and filters */}
      <div className="rounded-xl border border-white/[0.07] bg-[#0d0d0d] p-3">
        <div className="flex flex-col gap-3 md:flex-row">
          <div className="relative min-w-0 flex-1">
            <Search
              size={15}
              className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-gray-500"
            />

            <input
              className={`${inputCls} w-full pl-9`}
              placeholder="Search tasks or employees..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>

          <select
            className={`${inputCls} w-full md:w-48`}
            value={employeeId}
            onChange={(e) => setEmployeeId(e.target.value)}
          >
            <option value="all">All employees</option>

            {employees.map((employee) => (
              <option key={employee.id} value={employee.id}>
                {employee.name}
              </option>
            ))}
          </select>

          <select
            className={`${inputCls} w-full md:w-40`}
            value={status}
            onChange={(e) => setStatus(e.target.value)}
          >
            {FILTERS.map((item) => (
              <option key={item.value} value={item.value}>
                {item.label}
              </option>
            ))}
          </select>

          {(search || employeeId !== "all" || status !== "all") && (
            <button
              type="button"
              onClick={() => {
                setSearch("");
                setEmployeeId("all");
                setStatus("all");
              }}
              className="inline-flex h-10 items-center justify-center gap-1.5 rounded-lg px-3 text-xs text-gray-400 transition hover:bg-white/[0.06] hover:text-white"
            >
              <X size={14} />
              Clear
            </button>
          )}
        </div>
      </div>

      {/* Error */}
      {error && (
        <div className="flex items-center gap-2 rounded-xl border border-red-500/20 bg-red-500/[0.06] p-4 text-sm text-red-400">
          <AlertCircle size={17} />
          <span>{error}</span>
          <button
            type="button"
            onClick={load}
            className="ml-auto text-xs underline"
          >
            Retry
          </button>
        </div>
      )}

      {/* Loading */}
      {loading ? (
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-3">
          {[1, 2, 3, 4, 5, 6].map((item) => (
            <div
              key={item}
              className="h-36 animate-pulse rounded-xl border border-white/[0.06] bg-[#111]"
            />
          ))}
        </div>
      ) : !error && groups.length === 0 ? (
        <div className="rounded-xl border border-white/[0.07] bg-[#0d0d0d] px-4 py-16 text-center">
          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-xl bg-white/[0.05]">
            <Circle size={22} className="text-gray-500" />
          </div>

          <h3 className="mt-3 text-sm font-medium text-white">
            No tasks found
          </h3>

          <p className="mt-1 text-xs text-gray-500">
            Try changing your search or filters.
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {groups.map((group) => (
            <EmployeeSection
              key={group.key}
              employee={group.employee}
              tasks={group.tasks}
              isMe={group.isMe}
            />
          ))}
        </div>
      )}
    </div>
  );
}