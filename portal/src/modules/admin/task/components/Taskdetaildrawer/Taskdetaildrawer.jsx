import { useEffect, useState } from "react";
import { Avatar } from "../Avatarstack/Avatarstack";
import { ProgressRing } from "../Taskcard/Taskcard";
import {
  CalendarIcon,
  CloseIcon,
  EditIcon,
  TrashIcon,
} from "../Icons/Icons";
import {
  PRIORITY_STYLES,
  formatDate,
  formatDateTime,
} from "../../Constants";

const STATUS_OPTIONS = [
  { key: "todo", label: "To Do" },
  { key: "in-progress", label: "In Progress" },
  { key: "completed", label: "Completed" },
];

const PRIORITY_OPTIONS = ["Low", "Medium", "High"];

const normalizeStatus = (status) => {
  const value = String(status || "todo").toLowerCase().trim();

  if (["pending", "todo", "to-do"].includes(value)) {
    return "todo";
  }

  if (["in-progress", "in progress", "inprogress"].includes(value)) {
    return "in-progress";
  }

  if (["completed", "done", "approved"].includes(value)) {
    return "completed";
  }

  return "todo";
};

const getProgress = (task) => {
  const status = normalizeStatus(task?.status);

  if (status === "completed") return 100;
  if (status === "in-progress") return 50;

  return 0;
};

const getEmployeeId = (employee) => {
  if (typeof employee === "string" || typeof employee === "number") {
    return String(employee);
  }

  if (!employee || typeof employee !== "object") {
    return "";
  }

  return String(
    employee.id ||
      employee._id ||
      employee.userId ||
      employee.user?._id ||
      employee.user?.id ||
      ""
  );
};

const getAssigneeIds = (task) => {
  if (!task || typeof task !== "object") {
    return [];
  }

  const assignedTo = task.assignedTo;

  if (Array.isArray(assignedTo)) {
    return [...new Set(assignedTo.map(getEmployeeId).filter(Boolean))];
  }

  if (assignedTo != null) {
    const employeeId = getEmployeeId(assignedTo);

    if (employeeId) {
      return [employeeId];
    }
  }

  if (Array.isArray(task.assignees)) {
    return [
      ...new Set(task.assignees.map(getEmployeeId).filter(Boolean)),
    ];
  }

  if (task.assignee) {
    const employeeId = getEmployeeId(task.assignee);

    if (employeeId) {
      return [employeeId];
    }
  }

  return [];
};

const getInitialForm = (task) => ({
  title: task?.title || "",
  subtitle: task?.subtitle || "",
  description: task?.description || "",
  priority: PRIORITY_OPTIONS.includes(task?.priority)
    ? task.priority
    : "Medium",
  dueDate: task?.dueDate ? String(task.dueDate).slice(0, 10) : "",
  status: normalizeStatus(task?.status),
  assignedTo: getAssigneeIds(task)[0] || "",
});

export default function TaskDetailDrawer({
  task,
  onClose,
  onEdit,
  onDelete,
  onUpdate,
  employees = [],
}) {
  const [editing, setEditing] = useState(false);
  const [form, setForm] = useState(() => getInitialForm(task));
  const [saving, setSaving] = useState(false);
  const [localError, setLocalError] = useState("");

  useEffect(() => {
    setForm(getInitialForm(task));
    setEditing(false);
    setSaving(false);
    setLocalError("");
  }, [task]);

  useEffect(() => {
    if (!task) return;

    const handleKeyDown = (event) => {
      if (event.key === "Escape" && !saving) {
        onClose?.();
      }
    };

    window.addEventListener("keydown", handleKeyDown);

    return () => {
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [task, onClose, saving]);

  if (!task || typeof task !== "object") {
    return null;
  }

  const taskId = task.id || task._id;
  const progress = getProgress(task);
  const currentStatus = normalizeStatus(task.status);
  const assignedIds = getAssigneeIds(task);
  const employeeList = Array.isArray(employees) ? employees : [];

  const priorityClass =
    PRIORITY_STYLES?.[task.priority] ||
    "border-neutral-700 text-neutral-300";

  const updateField = (field, value) => {
    setForm((current) => ({
      ...current,
      [field]: value,
    }));

    setLocalError("");
  };

  const handleEdit = () => {
    setForm(getInitialForm(task));
    setEditing(true);
    setLocalError("");
    onEdit?.(task);
  };

  const handleCancelEdit = () => {
    setForm(getInitialForm(task));
    setEditing(false);
    setLocalError("");
  };

  const handleSave = async (event) => {
    event.preventDefault();

    if (!form.title.trim()) {
      setLocalError("Please enter a task title.");
      return;
    }

    if (!form.dueDate) {
      setLocalError("Please select a due date.");
      return;
    }

    if (!form.assignedTo) {
      setLocalError("Please select an employee.");
      return;
    }

    if (!PRIORITY_OPTIONS.includes(form.priority)) {
      setLocalError("Please select a valid priority.");
      return;
    }

    if (!taskId) {
      setLocalError("Task ID is missing. Unable to update task.");
      return;
    }

    if (typeof onUpdate !== "function") {
      setLocalError("Task update service is unavailable.");
      return;
    }

    setSaving(true);
    setLocalError("");

    try {
      const result = await onUpdate(taskId, {
        title: form.title.trim(),
        subtitle: form.subtitle.trim(),
        description: form.description.trim(),
        priority: form.priority,
        dueDate: form.dueDate,
        status: form.status,
        assignedTo: form.assignedTo,
      });

      if (result === false) {
        setLocalError("Task could not be updated. Please try again.");
        return;
      }

      setEditing(false);
      onClose?.();
    } catch (error) {
      setLocalError(
        error?.response?.data?.message ||
          error?.message ||
          "Unable to save task changes."
      );
    } finally {
      setSaving(false);
    }
  };

  const handleStatusChange = async (event) => {
    const status = event.target.value;

    if (!taskId) {
      setLocalError("Task ID is missing. Unable to update status.");
      return;
    }

    if (typeof onUpdate !== "function") {
      setLocalError("Task update service is unavailable.");
      return;
    }

    setLocalError("");

    try {
      const result = await onUpdate(taskId, { status });

      if (result === false) {
        setLocalError("Status could not be updated. Please try again.");
      }
    } catch (error) {
      setLocalError(
        error?.response?.data?.message ||
          error?.message ||
          "Unable to update task status."
      );
    }
  };

  const handleDelete = () => {
    if (taskId && typeof onDelete === "function") {
      onDelete(taskId);
    }
  };

  return (
    <div
      className="fixed inset-0 z-40 flex justify-end bg-black/60"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget && !saving) {
          onClose?.();
        }
      }}
    >
      <aside
        onMouseDown={(event) => event.stopPropagation()}
        className="flex h-full w-full max-w-md flex-col overflow-y-auto border-l border-[#262626] bg-[#0b0b0b] p-6"
      >
        <div className="flex items-start justify-between gap-3">
          <div>
            <h2 className="text-lg font-semibold text-white">
              {editing ? "Edit Task" : task.title || "Untitled Task"}
            </h2>

            <p className="text-sm text-neutral-400">
              {editing
                ? "Update task information"
                : task.subtitle || "Task details"}
            </p>
          </div>

          <button
            type="button"
            onClick={onClose}
            disabled={saving}
            aria-label="Close task details"
            className="text-neutral-400 hover:text-white disabled:opacity-50"
          >
            <CloseIcon />
          </button>
        </div>

        {editing ? (
          <form
            onSubmit={handleSave}
            className="mt-6 flex flex-1 flex-col gap-4"
          >
            <div>
              <label
                htmlFor="edit-task-title"
                className="mb-1.5 block text-xs text-neutral-400"
              >
                Task Title *
              </label>

              <input
                id="edit-task-title"
                value={form.title}
                onChange={(event) =>
                  updateField("title", event.target.value)
                }
                maxLength={200}
                required
                className="w-full rounded-lg border border-[#2a2a2a] bg-[#0d0d0d] px-3 py-2.5 text-sm text-white outline-none focus:border-red-700"
              />
            </div>

            <div>
              <label
                htmlFor="edit-task-subtitle"
                className="mb-1.5 block text-xs text-neutral-400"
              >
                Subtitle
              </label>

              <input
                id="edit-task-subtitle"
                value={form.subtitle}
                onChange={(event) =>
                  updateField("subtitle", event.target.value)
                }
                maxLength={200}
                className="w-full rounded-lg border border-[#2a2a2a] bg-[#0d0d0d] px-3 py-2.5 text-sm text-white outline-none focus:border-red-700"
              />
            </div>

            <div>
              <label
                htmlFor="edit-task-description"
                className="mb-1.5 block text-xs text-neutral-400"
              >
                Description
              </label>

              <textarea
                id="edit-task-description"
                value={form.description}
                onChange={(event) =>
                  updateField("description", event.target.value)
                }
                rows={4}
                className="w-full resize-y rounded-lg border border-[#2a2a2a] bg-[#0d0d0d] px-3 py-2.5 text-sm text-white outline-none focus:border-red-700"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label
                  htmlFor="edit-task-priority"
                  className="mb-1.5 block text-xs text-neutral-400"
                >
                  Priority
                </label>

                <select
                  id="edit-task-priority"
                  value={form.priority}
                  onChange={(event) =>
                    updateField("priority", event.target.value)
                  }
                  className="w-full rounded-lg border border-[#2a2a2a] bg-[#0d0d0d] px-3 py-2.5 text-sm text-white outline-none focus:border-red-700"
                >
                  {PRIORITY_OPTIONS.map((priority) => (
                    <option key={priority} value={priority}>
                      {priority}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label
                  htmlFor="edit-task-status"
                  className="mb-1.5 block text-xs text-neutral-400"
                >
                  Status
                </label>

                <select
                  id="edit-task-status"
                  value={form.status}
                  onChange={(event) =>
                    updateField("status", event.target.value)
                  }
                  className="w-full rounded-lg border border-[#2a2a2a] bg-[#0d0d0d] px-3 py-2.5 text-sm text-white outline-none focus:border-red-700"
                >
                  {STATUS_OPTIONS.map((option) => (
                    <option key={option.key} value={option.key}>
                      {option.label}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div>
              <label
                htmlFor="edit-task-due-date"
                className="mb-1.5 block text-xs text-neutral-400"
              >
                Due Date *
              </label>

              <input
                id="edit-task-due-date"
                type="date"
                value={form.dueDate}
                onChange={(event) =>
                  updateField("dueDate", event.target.value)
                }
                required
                className="w-full rounded-lg border border-[#2a2a2a] bg-[#0d0d0d] px-3 py-2.5 text-sm text-white outline-none focus:border-red-700"
              />
            </div>

            <div>
              <label
                htmlFor="edit-task-assignee"
                className="mb-1.5 block text-xs text-neutral-400"
              >
                Assigned Employee *
              </label>

              <select
                id="edit-task-assignee"
                value={form.assignedTo}
                onChange={(event) =>
                  updateField("assignedTo", event.target.value)
                }
                required
                className="w-full rounded-lg border border-[#2a2a2a] bg-[#0d0d0d] px-3 py-2.5 text-sm text-white outline-none focus:border-red-700"
              >
                <option value="">Select an employee</option>

                {employeeList.map((employee, index) => {
                  const employeeId = getEmployeeId(employee);

                  return (
                    <option
                      key={employeeId || index}
                      value={employeeId}
                      disabled={!employeeId}
                    >
                      {employee?.name ||
                        employee?.email ||
                        "Employee"}
                    </option>
                  );
                })}
              </select>

              <p className="mt-1.5 text-xs text-neutral-500">
                Each task is assigned to one employee. Multiple employees
                require separate task records.
              </p>
            </div>

            {localError && (
              <p
                role="alert"
                className="rounded-lg border border-red-500/30 bg-red-950/30 px-3 py-2 text-xs text-red-300"
              >
                {localError}
              </p>
            )}

            <div className="mt-auto flex gap-3 border-t border-[#262626] pt-5">
              <button
                type="button"
                onClick={handleCancelEdit}
                disabled={saving}
                className="flex-1 rounded-lg border border-[#2a2a2a] py-2.5 text-sm text-white hover:bg-neutral-900 disabled:opacity-50"
              >
                Cancel
              </button>

              <button
                type="submit"
                disabled={saving}
                className="flex-1 rounded-lg bg-red-700 py-2.5 text-sm font-semibold text-white hover:bg-red-600 disabled:cursor-not-allowed disabled:opacity-50"
              >
                {saving ? "Saving..." : "Save Changes"}
              </button>
            </div>
          </form>
        ) : (
          <>
            <div className="mt-5 flex items-center gap-4">
              <ProgressRing value={progress} size={64} />

              <div className="flex flex-col gap-2 text-xs">
                <span
                  className={`w-fit rounded border px-3 py-0.5 ${priorityClass}`}
                >
                  {task.priority || "Medium"} Priority
                </span>

                <span className="flex items-center gap-1.5 text-neutral-300">
                  <CalendarIcon width={13} height={13} />
                  Due {formatDate(task.dueDate)}
                </span>
              </div>
            </div>

            <div className="mt-5">
              <div className="mb-2 flex items-center justify-between">
                <p className="text-xs text-neutral-400">Task Progress</p>
                <p className="text-sm font-semibold text-white">
                  {progress}%
                </p>
              </div>

              <div className="h-2 overflow-hidden rounded-full bg-[#262626]">
                <div
                  className="h-full rounded-full bg-red-600 transition-all duration-300"
                  style={{ width: `${progress}%` }}
                />
              </div>

              <p className="mt-2 text-xs text-neutral-500">
                {currentStatus === "completed"
                  ? "Task completed"
                  : currentStatus === "in-progress"
                    ? "Task is in progress"
                    : "Task has not started"}
              </p>
            </div>

            <p className="mt-5 whitespace-pre-wrap text-sm leading-relaxed text-neutral-200">
              {task.description || "No description provided."}
            </p>

            <div className="mt-6">
              <label
                htmlFor="task-status"
                className="mb-1 block text-xs text-neutral-400"
              >
                Status
              </label>

              <select
                id="task-status"
                value={currentStatus}
                onChange={handleStatusChange}
                className="w-full rounded border border-[#2a2a2a] bg-[#0d0d0d] px-3 py-2 text-sm text-white outline-none focus:border-red-700"
              >
                {STATUS_OPTIONS.map((option) => (
                  <option key={option.key} value={option.key}>
                    {option.label}
                  </option>
                ))}
              </select>

              <p className="mt-2 text-xs text-neutral-500">
                Progress is calculated from the task status.
              </p>
            </div>

            <div className="mt-5">
              <p className="mb-2 text-xs text-neutral-400">
                Assigned Employee
              </p>

              {assignedIds.length === 0 ? (
                <p className="rounded border border-[#262626] px-3 py-4 text-xs text-neutral-500">
                  No employee assigned.
                </p>
              ) : (
                <div className="flex flex-col gap-2">
                  {assignedIds.map((employeeId) => {
                    const employee = employeeList.find(
                      (item) => getEmployeeId(item) === employeeId
                    );

                    const assignedUser =
                      employee ||
                      (typeof task.assignedTo === "object" &&
                      !Array.isArray(task.assignedTo) &&
                      getEmployeeId(task.assignedTo) === employeeId
                        ? task.assignedTo
                        : null);

                    return (
                      <div
                        key={employeeId}
                        className="flex items-center gap-2 rounded border border-[#2a2a2a] px-3 py-2"
                      >
                        <Avatar
                          user={assignedUser || { name: "Employee" }}
                          size={28}
                        />

                        <div className="min-w-0">
                          <p className="truncate text-xs text-white">
                            {assignedUser?.name ||
                              assignedUser?.email ||
                              "Assigned employee"}
                          </p>

                          <p className="text-xs text-neutral-500">
                            {assignedUser?.role ||
                              assignedUser?.designation ||
                              "Employee"}
                          </p>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            {localError && (
              <p
                role="alert"
                className="mt-4 rounded-lg border border-red-500/30 bg-red-950/30 px-3 py-2 text-xs text-red-300"
              >
                {localError}
              </p>
            )}

            <p className="mt-5 text-[11px] text-neutral-500">
              Last updated:{" "}
              {formatDateTime(task.updatedAt || task.createdAt)}
            </p>

            <div className="mt-auto flex gap-3 pt-6">
              <button
                type="button"
                onClick={handleEdit}
                className="flex flex-1 items-center justify-center gap-2 rounded border border-[#2a2a2a] py-2 text-xs text-white hover:bg-neutral-900"
              >
                <EditIcon width={14} height={14} />
                Edit
              </button>

              <button
                type="button"
                onClick={handleDelete}
                className="flex flex-1 items-center justify-center gap-2 rounded bg-red-700 py-2 text-xs font-semibold text-white hover:bg-red-600"
              >
                <TrashIcon width={14} height={14} />
                Delete
              </button>
            </div>
          </>
        )}
      </aside>
    </div>
  );
}