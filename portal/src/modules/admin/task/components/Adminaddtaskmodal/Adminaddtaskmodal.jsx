import { useEffect, useState } from "react";
import { Avatar } from "../Avatarstack/Avatarstack";
import { CloseIcon } from "../Icons/Icons";
import { PRIORITIES } from "../../Constants";

const today = () => new Date().toLocaleDateString("en-CA");

const makeEmpty = () => ({
  taskType: "extra",
  title: "",
  subtitle: "",
  description: "",
  priority: "Medium",
  startDate: today(),
  dueDate: "",
  assignees: [],
});

const field =
  "w-full rounded border border-[#2a2a2a] bg-[#0d0d0d] px-3 py-2 text-sm text-white outline-none focus:border-red-700 placeholder:text-neutral-600";

const label = "mb-1 block text-xs text-neutral-400";

const TYPES = [
  {
    id: "extra",
    title: "Extra task",
    hint: "One-off work for a specific day, like testing or designing",
  },
  {
    id: "daily",
    title: "Fixed daily task",
    hint: "Repeats every day. The employee posts a daily update",
  },
];

export default function AdminAddTaskModal({
  open,
  onClose,
  onSubmit,
  task = null,
  employees = [],
}) {
  const [form, setForm] = useState(makeEmpty());
  const [errors, setErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);
  const isEdit = Boolean(task);
  const isDaily = form.taskType === "daily";

  useEffect(() => {
    if (!open) return;

    setForm(
      task
        ? {
            ...makeEmpty(),
            ...task,
            taskType: task.taskType === "daily" ? "daily" : "extra",
            assignees: Array.isArray(task.assignees) ? task.assignees : [],
          }
        : makeEmpty()
    );
    setErrors({});
    setSubmitting(false);
  }, [open, task]);

  useEffect(() => {
    if (!open) return;

    const onKey = (event) => {
      if (event.key === "Escape" && !submitting) onClose();
    };

    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, onClose, submitting]);

  if (!open) return null;

  const set = (key, value) => {
    setForm((previous) => ({ ...previous, [key]: value }));
  };

  const toggleAssignee = (id) => {
    setForm((previous) => ({
      ...previous,
      assignees: previous.assignees.includes(id)
        ? previous.assignees.filter((item) => item !== id)
        : [...previous.assignees, id],
    }));
  };

  const submit = async (event) => {
    event.preventDefault();

    const nextErrors = {};

    if (!form.title.trim()) {
      nextErrors.title = "Title is required";
    }

    if (!isDaily && !form.dueDate) {
      nextErrors.dueDate = "Select a due date";
    }

    if (isDaily && form.dueDate && form.dueDate < form.startDate) {
      nextErrors.dueDate = "End date cannot be before the start date";
    }

    if (!form.assignees.length) {
      nextErrors.assignees = "Select at least one employee";
    }

    setErrors(nextErrors);

    if (Object.keys(nextErrors).length || submitting) return;

    setSubmitting(true);

    try {
      await onSubmit({
        taskType: form.taskType,
        title: form.title.trim(),
        subtitle: form.subtitle.trim(),
        description: form.description.trim(),
        priority: form.priority,
        startDate: isDaily ? form.startDate : undefined,
        dueDate: form.dueDate || undefined,
        assignees: form.assignees,
      });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget && !submitting) onClose();
      }}
    >
      <form
        onSubmit={submit}
        onMouseDown={(event) => event.stopPropagation()}
        className="max-h-[90vh] w-full max-w-xl overflow-y-auto rounded-lg border border-[#262626] bg-[#0b0b0b] p-6"
      >
        <div className="mb-5 flex items-center justify-between">
          <h2 className="text-lg font-semibold text-white">
            {isEdit ? "Edit Task" : "Assign Task"}
          </h2>

          <button
            type="button"
            onClick={onClose}
            disabled={submitting}
            aria-label="Close"
            className="text-neutral-400 hover:text-white disabled:opacity-50"
          >
            <CloseIcon />
          </button>
        </div>

        {!isEdit && (
          <div className="mb-5 grid gap-2 sm:grid-cols-2">
            {TYPES.map((type) => {
              const selected = form.taskType === type.id;

              return (
                <button
                  type="button"
                  key={type.id}
                  onClick={() => set("taskType", type.id)}
                  aria-pressed={selected}
                  className={`rounded border px-3 py-3 text-left transition-colors ${
                    selected
                      ? "border-red-700 bg-red-950/40"
                      : "border-[#2a2a2a] hover:border-neutral-600"
                  }`}
                >
                  <span className="block text-sm font-medium text-white">
                    {type.title}
                  </span>
                  <span className="mt-0.5 block text-[11px] leading-snug text-neutral-500">
                    {type.hint}
                  </span>
                </button>
              );
            })}
          </div>
        )}

        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label className={label}>Title</label>
            <input
              className={field}
              value={form.title}
              onChange={(event) => set("title", event.target.value)}
              placeholder={isDaily ? "Daily social media posting" : "Testing"}
              maxLength={200}
              required
            />
            {errors.title && (
              <p className="mt-1 text-xs text-red-500">{errors.title}</p>
            )}
          </div>

          <div>
            <label className={label}>Sub title</label>
            <input
              className={field}
              value={form.subtitle}
              onChange={(event) => set("subtitle", event.target.value)}
              placeholder="Authentication Screens"
              maxLength={200}
            />
          </div>

          <div className="sm:col-span-2">
            <label className={label}>Description</label>
            <textarea
              rows={3}
              className={field}
              value={form.description}
              onChange={(event) => set("description", event.target.value)}
              placeholder={
                isDaily
                  ? "What the employee must do every day"
                  : "Describe the task"
              }
            />
          </div>

          <div>
            <label className={label}>Priority</label>
            <select
              className={field}
              value={form.priority}
              onChange={(event) => set("priority", event.target.value)}
            >
              {PRIORITIES.map((priority) => (
                <option key={priority} value={priority}>
                  {priority}
                </option>
              ))}
            </select>
          </div>

          {isDaily ? (
            <>
              <div>
                <label className={label}>Starts on</label>
                <input
                  type="date"
                  className={field}
                  value={form.startDate}
                  onChange={(event) => set("startDate", event.target.value)}
                  required
                />
              </div>

              <div className="sm:col-span-2">
                <label className={label}>
                  Ends on (optional, leave empty to keep it running)
                </label>
                <input
                  type="date"
                  className={field}
                  value={form.dueDate}
                  onChange={(event) => set("dueDate", event.target.value)}
                  min={form.startDate}
                />
                {errors.dueDate && (
                  <p className="mt-1 text-xs text-red-500">
                    {errors.dueDate}
                  </p>
                )}
              </div>
            </>
          ) : (
            <div>
              <label className={label}>Due date</label>
              <input
                type="date"
                className={field}
                value={form.dueDate}
                onChange={(event) => set("dueDate", event.target.value)}
                min={today()}
                required
              />
              {errors.dueDate && (
                <p className="mt-1 text-xs text-red-500">{errors.dueDate}</p>
              )}
            </div>
          )}
        </div>

        <div className="mt-5">
          <label className={label}>
            Assign to ({form.assignees.length} selected)
          </label>

          {employees.length === 0 ? (
            <p className="rounded border border-[#2a2a2a] p-3 text-sm text-neutral-400">
              No active employees were returned by the server. Check the users
              API and make sure active employee accounts exist.
            </p>
          ) : (
            <div className="grid gap-2 sm:grid-cols-2">
              {employees.map((employee, index) => {
                const selected = form.assignees.includes(employee.id);

                return (
                  <button
                    type="button"
                    key={employee.id}
                    onClick={() => toggleAssignee(employee.id)}
                    aria-pressed={selected}
                    className={`flex items-center gap-2 rounded border px-3 py-2 text-left text-xs transition-colors ${
                      selected
                        ? "border-red-700 bg-red-950/40 text-white"
                        : "border-[#2a2a2a] text-neutral-300 hover:border-neutral-600"
                    }`}
                  >
                    <Avatar user={employee} size={24} index={index} />

                    <span className="min-w-0">
                      <span className="block truncate text-white">
                        {employee.name}
                      </span>
                      <span className="block truncate text-neutral-500">
                        {employee.email || employee.role || "Employee"}
                      </span>
                    </span>
                  </button>
                );
              })}
            </div>
          )}

          {errors.assignees && (
            <p className="mt-1 text-xs text-red-500">{errors.assignees}</p>
          )}
        </div>

        <div className="mt-6 flex justify-end gap-3">
          <button
            type="button"
            onClick={onClose}
            disabled={submitting}
            className="rounded border border-[#2a2a2a] px-4 py-2 text-xs text-neutral-300 hover:bg-neutral-900 disabled:opacity-50"
          >
            Cancel
          </button>

          <button
            type="submit"
            disabled={submitting || employees.length === 0}
            className="rounded bg-gradient-to-r from-red-700 to-red-600 px-5 py-2 text-xs font-semibold text-white hover:from-red-600 hover:to-red-500 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {submitting
              ? "Assigning..."
              : isDaily
                ? "Assign fixed task"
                : "Assign task"}
          </button>
        </div>
      </form>
    </div>
  );
}