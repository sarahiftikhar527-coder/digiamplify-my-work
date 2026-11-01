
import { useCallback, useEffect, useState } from "react";
import {
  X,
  LoaderCircle,
  RefreshCw,
  Pencil,
  Trash2,
  CalendarDays,
  Clock3,
  FileText,
  Users,
} from "lucide-react";

import apiClient, { unwrap } from "@/services/api/apiClient";

const field =
  "w-full rounded border border-[#2a2a2a] bg-black px-3 py-2 text-sm text-white focus:border-red-600 focus:outline-none disabled:cursor-not-allowed disabled:opacity-60";

const SHIFT_PRESETS = {
  Morning: { start: "09:00", end: "17:00" },
  Evening: { start: "14:00", end: "22:00" },
  Night: { start: "22:00", end: "06:00" },
  Custom: { start: "09:00", end: "17:00" },
};

const getRows = (response) => {
  if (Array.isArray(response)) return response;
  if (Array.isArray(response?.data)) return response.data;
  if (Array.isArray(response?.data?.data)) return response.data.data;
  if (Array.isArray(response?.employees)) return response.employees;
  if (Array.isArray(response?.results)) return response.results;

  return [];
};

const getEmployeeId = (employee) => {
  if (typeof employee === "string") return employee;

  return (
    employee?._id ||
    employee?.id ||
    employee?.employeeId?._id ||
    employee?.employeeId?.id ||
    employee?.employeeId ||
    ""
  );
};

const getEmployeeName = (employee) => {
  if (typeof employee === "string") return employee;

  if (typeof employee?.employeeId === "object") {
    return (
      employee.employeeId.name ||
      employee.employeeId.fullName ||
      employee.employeeId.employeeName ||
      employee.employeeId.email ||
      employee.name ||
      "Employee"
    );
  }

  return (
    employee?.name ||
    employee?.fullName ||
    employee?.employeeName ||
    employee?.email ||
    "Employee"
  );
};

const normalizeEmployee = (employee) => ({
  id: getEmployeeId(employee),
  name: getEmployeeName(employee),
  role: employee?.role || employee?.designation || "",
  email: employee?.email || "",
});

const getShiftEmployees = (shift) => {
  const source =
    shift?.employees ||
    shift?.assignedEmployees ||
    (shift?.employeeId ? [shift.employeeId] : []);

  if (!Array.isArray(source)) return [];

  return source.map((employee) => {
    if (typeof employee === "string") {
      return {
        id: employee,
        name: employee,
        role: "",
        email: "",
      };
    }

    return {
      id: getEmployeeId(employee),
      name: getEmployeeName(employee),
      role: employee?.role || employee?.designation || "",
      email: employee?.email || "",
    };
  });
};

const getDateValue = (value) => {
  if (!value) return "";

  if (typeof value === "string") {
    const match = value.match(/^\d{4}-\d{2}-\d{2}/);
    if (match) return match[0];
  }

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) return "";

  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");

  return `${year}-${month}-${day}`;
};

const getTimeValue = (value, fallback) => {
  if (!value) return fallback;

  const match = String(value).match(/(\d{2}:\d{2})/);

  return match ? match[1] : fallback;
};

const getShiftForm = (shift, defaultDate) => {
  const shiftName = shift?.shift || shift?.title || shift?.name || "Morning";
  const preset = SHIFT_PRESETS[shiftName] || SHIFT_PRESETS.Custom;
  const employees = getShiftEmployees(shift);

  return {
    employees: employees.map((employee) => employee.id).filter(Boolean),
    shift: SHIFT_PRESETS[shiftName] ? shiftName : "Custom",
    from: getDateValue(
      shift?.from || shift?.startDate || shift?.date || defaultDate
    ),
    to: getDateValue(
      shift?.to || shift?.endDate || shift?.from || defaultDate
    ),
    start: getTimeValue(
      shift?.startTime || shift?.start,
      preset.start
    ),
    end: getTimeValue(
      shift?.endTime || shift?.end,
      preset.end
    ),
    description: shift?.description || "",
  };
};

const formatDisplayDate = (value) => {
  if (!value) return "Not specified";

  const date = new Date(`${value}T00:00:00`);

  if (Number.isNaN(date.getTime())) return value;

  return date.toLocaleDateString("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
};

const formatDisplayTime = (value) => {
  if (!value) return "Not specified";

  const match = String(value).match(/^(\d{1,2}):(\d{2})/);

  if (!match) return value;

  const hours = Number(match[1]);
  const minutes = match[2];
  const suffix = hours >= 12 ? "PM" : "AM";
  const formattedHours = hours % 12 || 12;

  return `${formattedHours}:${minutes} ${suffix}`;
};

const getErrorMessage = (error, fallback) =>
  error?.response?.data?.message ||
  error?.message ||
  fallback;

export default function AssignShiftModal({
  open,
  defaultDate,
  onClose,
  onSave,
  initialShift = null,
  mode = "create",
  onDelete,
}) {
  const [employees, setEmployees] = useState([]);
  const [employeesLoading, setEmployeesLoading] = useState(false);
  const [employeesError, setEmployeesError] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [editing, setEditing] = useState(mode === "edit");
  const [form, setForm] = useState(null);
  const [errors, setErrors] = useState({});

  const isDetailsMode = mode === "details" && !editing;
  const isReadOnly = isDetailsMode;
  const shiftId = initialShift?._id || initialShift?.id || "";

  const loadEmployees = useCallback(async (signal) => {
    setEmployeesLoading(true);
    setEmployeesError("");

    try {
      const response = await unwrap(
        apiClient.get("/profile/employees", { signal })
      );

      const rows = getRows(response)
        .map(normalizeEmployee)
        .filter((employee) => employee.id);

      setEmployees(rows);

      if (!rows.length) {
        setEmployeesError("No employees were returned by the server.");
      }
    } catch (error) {
      if (
        error?.name === "CanceledError" ||
        error?.name === "AbortError" ||
        error?.code === "ERR_CANCELED"
      ) {
        return;
      }

      setEmployeesError(
        getErrorMessage(error, "Unable to load employees.")
      );
    } finally {
      if (!signal?.aborted) {
        setEmployeesLoading(false);
      }
    }
  }, []);

  useEffect(() => {
    if (!open) return undefined;

    const controller = new AbortController();

    loadEmployees(controller.signal);

    return () => controller.abort();
  }, [open, loadEmployees]);

  useEffect(() => {
    if (!open) return;

    setForm(getShiftForm(initialShift, defaultDate));
    setErrors({});
    setSubmitting(false);
    setDeleting(false);
    setEditing(mode === "edit");
  }, [open, defaultDate, initialShift, mode]);

  useEffect(() => {
    if (!open) return undefined;

    const handleKeyDown = (event) => {
      if (event.key === "Escape" && !submitting && !deleting) {
        onClose?.();
      }
    };

    window.addEventListener("keydown", handleKeyDown);

    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [open, onClose, submitting, deleting]);

  if (!open || !form) return null;

  const set = (patch) => {
    setForm((current) => ({ ...current, ...patch }));
  };

  const toggleEmployee = (id) => {
    if (isReadOnly || submitting) return;

    set({
      employees: form.employees.includes(id)
        ? form.employees.filter((employeeId) => employeeId !== id)
        : [...form.employees, id],
    });
  };

  const startEditing = () => {
    setEditing(true);
    setErrors({});
  };

  const cancelEditing = () => {
    setForm(getShiftForm(initialShift, defaultDate));
    setEditing(false);
    setErrors({});
  };

  const submit = async (event) => {
    event.preventDefault();

    const nextErrors = {};

    if (!form.employees.length) {
      nextErrors.employees = "Select at least one employee.";
    }

    if (!form.from || !form.to) {
      nextErrors.date = "Choose a start and end date.";
    } else if (form.to < form.from) {
      nextErrors.date = "End date must be on or after the start date.";
    }

    if (!form.start || !form.end) {
      nextErrors.time = "Choose start and end time.";
    }

    if (employeesLoading) {
      nextErrors.employees = "Wait until employees finish loading.";
    } else if (employeesError) {
      nextErrors.employees =
        "Load employees successfully before saving this shift.";
    }

    setErrors(nextErrors);

    if (Object.keys(nextErrors).length) return;

    const selectedEmployees = employees.filter((employee) =>
      form.employees.includes(employee.id)
    );

    if (selectedEmployees.length !== form.employees.length) {
      setErrors({
        employees: "One or more selected employees are no longer available.",
      });
      return;
    }

    if (mode !== "create" && !shiftId) {
      setErrors({
        submit: "This shift has no ID, so it cannot be updated.",
      });
      return;
    }

    setSubmitting(true);

    try {
      await onSave?.({
        ...(initialShift || {}),
        id: shiftId || undefined,
        _id: shiftId || undefined,
        eventType: "shift",
        title: form.shift,
        shift: form.shift,
        from: form.from,
        to: form.to,
        start: form.start,
        end: form.end,
        startTime: form.start,
        endTime: form.end,
        description: form.description.trim(),
        employees: selectedEmployees.map((employee) => ({
          id: employee.id,
          _id: employee.id,
          name: employee.name,
          email: employee.email,
          role: employee.role,
        })),
      });

      if (mode !== "create") {
        setEditing(false);
      }
    } catch (error) {
      setErrors({
        submit: getErrorMessage(error, "Unable to save shift."),
      });
    } finally {
      setSubmitting(false);
    }
  };

  const deleteShift = async () => {
    if (!shiftId || !onDelete || deleting || submitting) return;

    const confirmed = window.confirm(
      "Are you sure you want to delete this shift? This action cannot be undone."
    );

    if (!confirmed) return;

    setDeleting(true);
    setErrors({});

    try {
      await onDelete(initialShift);
    } catch (error) {
      setErrors({
        submit: getErrorMessage(error, "Unable to delete shift."),
      });
    } finally {
      setDeleting(false);
    }
  };

  const reloadEmployees = () => {
    const controller = new AbortController();
    loadEmployees(controller.signal);
  };

  const title =
    mode === "create"
      ? "Assign Shift"
      : isDetailsMode
        ? "Shift Details"
        : "Edit Shift";

  const shiftEmployees = getShiftEmployees(initialShift);

  return (
    <div
      className="fixed inset-0 z-50 flex items-end justify-center bg-black/70 p-0 sm:items-center sm:p-4"
      onMouseDown={(event) => {
        if (
          event.target === event.currentTarget &&
          !submitting &&
          !deleting
        ) {
          onClose?.();
        }
      }}
    >
      <form
        onSubmit={submit}
        role="dialog"
        aria-modal="true"
        aria-labelledby="shift-title"
        className="max-h-[92vh] w-full max-w-lg overflow-y-auto rounded-t-xl border border-[#2a2a2a] bg-[#0a0a0a] p-5 sm:rounded-xl"
      >
        <div className="mb-5 flex items-center justify-between gap-3">
          <div>
            <h2 id="shift-title" className="text-base font-semibold text-white">
              {title}
            </h2>
            <p className="mt-1 text-xs text-neutral-500">
              {isDetailsMode
                ? "View assigned shift information."
                : mode === "create"
                  ? "Assign a shift to one or more employees."
                  : "Update the shift details and assigned employees."}
            </p>
          </div>

          <button
            type="button"
            onClick={onClose}
            disabled={submitting || deleting}
            aria-label="Close"
            className="grid h-8 w-8 shrink-0 place-items-center rounded text-neutral-300 hover:bg-white/10 disabled:opacity-50"
          >
            <X size={16} />
          </button>
        </div>

        {isDetailsMode && (
          <div className="mb-5 space-y-3">
            <div className="rounded-lg border border-[#292929] bg-black p-4">
              <div className="mb-3 flex items-center gap-2">
                <CalendarDays size={16} className="text-red-400" />
                <h3 className="text-sm font-semibold text-white">
                  Schedule
                </h3>
              </div>

              <div className="grid grid-cols-2 gap-4 text-xs">
                <div>
                  <p className="mb-1 text-neutral-500">Shift type</p>
                  <p className="font-medium text-white">
                    {form.shift}
                  </p>
                </div>
                <div>
                  <p className="mb-1 text-neutral-500">Date range</p>
                  <p className="font-medium text-white">
                    {formatDisplayDate(form.from)}
                    {form.to && form.to !== form.from
                      ? ` – ${formatDisplayDate(form.to)}`
                      : ""}
                  </p>
                </div>
                <div>
                  <p className="mb-1 text-neutral-500">Start time</p>
                  <p className="font-medium text-white">
                    {formatDisplayTime(form.start)}
                  </p>
                </div>
                <div>
                  <p className="mb-1 text-neutral-500">End time</p>
                  <p className="font-medium text-white">
                    {formatDisplayTime(form.end)}
                  </p>
                </div>
              </div>
            </div>

            <div className="rounded-lg border border-[#292929] bg-black p-4">
              <div className="mb-3 flex items-center gap-2">
                <Users size={16} className="text-red-400" />
                <h3 className="text-sm font-semibold text-white">
                  Assigned employees
                </h3>
              </div>

              {shiftEmployees.length ? (
                <div className="space-y-2">
                  {shiftEmployees.map((employee, index) => (
                    <div
                      key={employee.id || `${employee.name}-${index}`}
                      className="rounded border border-[#222] px-3 py-2"
                    >
                      <p className="text-sm text-neutral-100">
                        {employee.name}
                      </p>
                      {employee.role && (
                        <p className="mt-0.5 text-xs text-neutral-500">
                          {employee.role}
                        </p>
                      )}
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-xs text-neutral-500">
                  No employee details were provided by the server.
                </p>
              )}
            </div>

            <div className="rounded-lg border border-[#292929] bg-black p-4">
              <div className="mb-2 flex items-center gap-2">
                <FileText size={16} className="text-red-400" />
                <h3 className="text-sm font-semibold text-white">
                  Description
                </h3>
              </div>

              <p className="whitespace-pre-wrap break-words text-sm leading-6 text-neutral-300">
                {form.description || "No description added for this shift."}
              </p>
            </div>
          </div>
        )}

        {!isReadOnly && (
          <>
            <fieldset className="mb-4" disabled={submitting}>
              <legend className="mb-2 text-xs text-neutral-300">
                Employees
              </legend>

              <div className="mb-2 flex items-center justify-between gap-2">
                <span className="text-xs text-neutral-500">
                  {employees.length} employee
                  {employees.length === 1 ? "" : "s"} available
                </span>

                <button
                  type="button"
                  onClick={reloadEmployees}
                  disabled={employeesLoading}
                  className="inline-flex items-center gap-1 text-xs text-neutral-300 hover:text-white disabled:opacity-50"
                >
                  <RefreshCw size={12} />
                  Refresh
                </button>
              </div>

              <div className="grid max-h-40 grid-cols-1 gap-2 overflow-y-auto rounded border border-[#2a2a2a] p-2 sm:grid-cols-2">
                {employeesLoading ? (
                  <div className="col-span-full flex items-center gap-2 py-3 text-xs text-neutral-400">
                    <LoaderCircle size={14} className="animate-spin" />
                    Loading employees...
                  </div>
                ) : employeesError ? (
                  <div className="col-span-full py-2 text-xs text-red-400">
                    {employeesError}
                  </div>
                ) : employees.length === 0 ? (
                  <p className="col-span-full py-2 text-xs text-neutral-400">
                    No employees available.
                  </p>
                ) : (
                  employees.map((employee) => (
                    <label
                      key={employee.id}
                      className="flex cursor-pointer items-start gap-2 rounded p-1.5 text-xs hover:bg-white/5"
                    >
                      <input
                        type="checkbox"
                        checked={form.employees.includes(employee.id)}
                        onChange={() => toggleEmployee(employee.id)}
                        className="mt-0.5 accent-red-600"
                      />

                      <span className="min-w-0">
                        <span className="block break-words text-neutral-100">
                          {employee.name}
                        </span>

                        {employee.role && (
                          <span className="mt-0.5 block text-neutral-500">
                            {employee.role}
                          </span>
                        )}
                      </span>
                    </label>
                  ))
                )}
              </div>

              {errors.employees && (
                <p className="mt-1 text-xs text-red-400">
                  {errors.employees}
                </p>
              )}
            </fieldset>

            <label className="mb-4 block text-xs text-neutral-300">
              Shift type

              <select
                value={form.shift}
                className={`${field} mt-1`}
                disabled={submitting}
                onChange={(event) => {
                  const shift = event.target.value;

                  set({
                    shift,
                    ...SHIFT_PRESETS[shift],
                  });
                }}
              >
                {Object.keys(SHIFT_PRESETS).map((shift) => (
                  <option key={shift} value={shift}>
                    {shift}
                  </option>
                ))}
              </select>
            </label>

            <div className="mb-4 grid grid-cols-2 gap-3">
              <label className="text-xs text-neutral-300">
                From

                <input
                  type="date"
                  value={form.from}
                  disabled={submitting}
                  onChange={(event) => set({ from: event.target.value })}
                  className={`${field} mt-1`}
                />
              </label>

              <label className="text-xs text-neutral-300">
                To

                <input
                  type="date"
                  value={form.to}
                  min={form.from || undefined}
                  disabled={submitting}
                  onChange={(event) => set({ to: event.target.value })}
                  className={`${field} mt-1`}
                />
              </label>

              {errors.date && (
                <p className="col-span-2 -mt-2 text-xs text-red-400">
                  {errors.date}
                </p>
              )}
            </div>

            <div className="mb-4 grid grid-cols-2 gap-3">
              <label className="text-xs text-neutral-300">
                Start time

                <input
                  type="time"
                  value={form.start}
                  disabled={submitting}
                  onChange={(event) =>
                    set({ start: event.target.value, shift: "Custom" })
                  }
                  className={`${field} mt-1`}
                />
              </label>

              <label className="text-xs text-neutral-300">
                End time

                <input
                  type="time"
                  value={form.end}
                  disabled={submitting}
                  onChange={(event) =>
                    set({ end: event.target.value, shift: "Custom" })
                  }
                  className={`${field} mt-1`}
                />
              </label>

              {errors.time && (
                <p className="col-span-2 -mt-2 text-xs text-red-400">
                  {errors.time}
                </p>
              )}
            </div>

            <label className="mb-5 block text-xs text-neutral-300">
              Description
              <span className="ml-1 text-neutral-500">(optional)</span>

              <textarea
                value={form.description}
                onChange={(event) =>
                  set({ description: event.target.value })
                }
                disabled={submitting}
                rows={4}
                maxLength={1000}
                placeholder="Add shift instructions, responsibilities, or other details..."
                className={`${field} mt-1 resize-y`}
              />

              <span className="mt-1 block text-right text-[11px] text-neutral-500">
                {form.description.length}/1000
              </span>
            </label>
          </>
        )}

        {errors.submit && (
          <p role="alert" className="mb-4 text-xs text-red-400">
            {errors.submit}
          </p>
        )}

        {isReadOnly ? (
          <div className="flex flex-wrap justify-between gap-2 border-t border-[#252525] pt-4">
            <button
              type="button"
              onClick={deleteShift}
              disabled={!onDelete || !shiftId || deleting}
              className="inline-flex items-center justify-center gap-2 rounded border border-red-900/70 px-3 py-2 text-sm text-red-400 hover:bg-red-500/10 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {deleting ? (
                <LoaderCircle size={14} className="animate-spin" />
              ) : (
                <Trash2 size={14} />
              )}
              {deleting ? "Deleting..." : "Delete"}
            </button>

            <div className="flex gap-2">
              <button
                type="button"
                onClick={onClose}
                className="rounded border border-[#2a2a2a] px-4 py-2 text-sm hover:bg-white/10"
              >
                Close
              </button>

              <button
                type="button"
                onClick={startEditing}
                className="inline-flex items-center gap-2 rounded bg-[#c1121f] px-4 py-2 text-sm font-semibold hover:bg-[#a30f1a]"
              >
                <Pencil size={14} />
                Edit
              </button>
            </div>
          </div>
        ) : (
          <div className="flex flex-wrap justify-end gap-2 border-t border-[#252525] pt-4">
            {mode !== "create" && (
              <button
                type="button"
                onClick={cancelEditing}
                disabled={submitting}
                className="rounded border border-[#2a2a2a] px-4 py-2 text-sm hover:bg-white/10 disabled:opacity-50"
              >
                Cancel edit
              </button>
            )}

            <button
              type="button"
              onClick={onClose}
              disabled={submitting}
              className="rounded border border-[#2a2a2a] px-4 py-2 text-sm hover:bg-white/10 disabled:opacity-50"
            >
              Close
            </button>

            <button
              type="submit"
              disabled={
                submitting ||
                employeesLoading ||
                Boolean(employeesError) ||
                deleting
              }
              className="inline-flex items-center justify-center gap-2 rounded bg-[#c1121f] px-4 py-2 text-sm font-semibold hover:bg-[#a30f1a] disabled:cursor-not-allowed disabled:opacity-60"
            >
              {submitting && (
                <LoaderCircle size={14} className="animate-spin" />
              )}
              {submitting
                ? "Saving..."
                : mode === "create"
                  ? "Assign shift"
                  : "Save changes"}
            </button>
          </div>
        )}
      </form>
    </div>
  );
}
