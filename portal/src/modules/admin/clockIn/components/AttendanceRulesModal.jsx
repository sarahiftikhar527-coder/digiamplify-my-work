
import { useCallback, useEffect, useMemo, useState } from "react";
import {
  AlertTriangle,
  Clock3,
  Loader2,
  RotateCcw,
  Save,
  Users,
  X,
  Coffee,
  CalendarDays,
  Search,
} from "lucide-react";

import { clockInService } from "../../../../services/clockInService.js";
import { formatDuration, formatHHmm } from "../../../../utils/time";

const DAYS = [
  { value: 1, label: "Mon" },
  { value: 2, label: "Tue" },
  { value: 3, label: "Wed" },
  { value: 4, label: "Thu" },
  { value: 5, label: "Fri" },
  { value: 6, label: "Sat" },
  { value: 0, label: "Sun" },
];

const CARD_BORDER_COLORS = [
  "border-red-500/30",
  "border-purple-500/30",
  "border-blue-500/30",
  "border-emerald-500/30",
  "border-amber-500/30",
  "border-cyan-500/30",
];

const errorText = (error) =>
  error?.response?.data?.message || error?.message || "Something went wrong.";

const inputCls =
  "w-full rounded-xl border border-white/10 bg-[#090909] px-3.5 py-2.5 text-[12.5px] text-white outline-none transition placeholder:text-white/25 focus:border-red-500/70 focus:ring-2 focus:ring-red-500/10 disabled:opacity-60";

const timeInputCls = `${inputCls} [color-scheme:dark]`;

const DayPicker = ({ value = [], onChange }) => (
  <div className="flex flex-wrap gap-1.5">
    {DAYS.map((day) => {
      const active = value.includes(day.value);

      return (
        <button
          key={day.value}
          type="button"
          onClick={() =>
            onChange(
              active
                ? value.filter((item) => item !== day.value)
                : [...value, day.value]
            )
          }
          className={`rounded-lg border px-3 py-2 text-[11px] font-semibold transition-all ${
            active
              ? "border-red-500/50 bg-red-500/10 text-red-300"
              : "border-white/10 bg-[#0b0b0b] text-white/50 hover:border-white/25 hover:text-white"
          }`}
        >
          {day.label}
        </button>
      );
    })}
  </div>
);

const AttendanceRulesModal = ({ onClose }) => {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [notice, setNotice] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");

  const [defaultWorkDays, setDefaultWorkDays] = useState([]);
  const [rows, setRows] = useState([]);
  const [editingId, setEditingId] = useState(null);
  const [draft, setDraft] = useState(null);

  const filteredRows = useMemo(() => {
    const query = searchTerm.trim().toLowerCase();

    if (!query) return rows;

    return rows.filter((row) => {
      const searchableText = [
        row.name,
        row.designation,
        row.department,
        row.role,
        row.email,
      ]
        .filter(Boolean)
        .join(" ")
        .toLowerCase();

      return searchableText.includes(query);
    });
  }, [rows, searchTerm]);

  const load = useCallback(async () => {
    setLoading(true);

    try {
      const data = await clockInService.getSchedules();

      setDefaultWorkDays(data.rules?.workDays || []);
      setRows(data.rows || []);
      setNotice(null);
    } catch (error) {
      setNotice({ type: "error", text: errorText(error) });
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  useEffect(() => {
    const onKey = (event) => {
      if (event.key === "Escape") onClose();
    };

    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose]);

  const startEdit = (row) => {
    const schedule = row.schedule || {};

    setEditingId(row.userId);
    setNotice(null);

    setDraft({
      startTime: schedule.startTime || "",
      endTime: schedule.endTime || "",
      dailyHours: schedule.custom
        ? schedule.dailyTargetMinutes / 60
        : "",
      breakDurationMinutes:
        schedule.breakDurationMinutes != null
          ? String(schedule.breakDurationMinutes)
          : "",
      workDays: schedule.workDays || defaultWorkDays,
    });
  };

  const saveSchedule = async (userId, reset = false) => {
    if (!reset) {
      if (!draft) return;

      const breakDuration = Number(draft.breakDurationMinutes);

      if (
        draft.breakDurationMinutes === "" ||
        !Number.isFinite(breakDuration) ||
        breakDuration < 0 ||
        breakDuration > 240
      ) {
        setNotice({
          type: "error",
          text: "Please enter a break duration between 0 and 240 minutes.",
        });
        return;
      }

      if (draft.dailyHours !== "") {
        const dailyHours = Number(draft.dailyHours);

        if (
          !Number.isFinite(dailyHours) ||
          dailyHours < 1 ||
          dailyHours > 16
        ) {
          setNotice({
            type: "error",
            text: "Daily hours must be between 1 and 16.",
          });
          return;
        }
      }

      if (draft.workDays.length === 0) {
        setNotice({
          type: "error",
          text: "Please select at least one working day.",
        });
        return;
      }

      if (
        draft.startTime &&
        draft.endTime &&
        draft.startTime === draft.endTime
      ) {
        setNotice({
          type: "error",
          text: "Start time and end time cannot be the same.",
        });
        return;
      }
    }

    setSaving(true);
    setNotice(null);

    try {
      const result = await clockInService.saveSchedule(
        userId,
        reset
          ? { reset: true }
          : {
              startTime: draft.startTime,
              endTime: draft.endTime,
              dailyTargetMinutes:
                draft.dailyHours === ""
                  ? null
                  : Math.round(Number(draft.dailyHours) * 60),
              breakDurationMinutes: Number(
                draft.breakDurationMinutes
              ),
              workDays: draft.workDays,
            }
      );

      setNotice({
        type: "success",
        text: result?.message || "Employee schedule saved.",
      });

      setEditingId(null);
      setDraft(null);
      await load();
    } catch (error) {
      setNotice({ type: "error", text: errorText(error) });
    } finally {
      setSaving(false);
    }
  };

  return (
    <div
      className="fixed inset-0 z-[70] flex items-start justify-center overflow-y-auto bg-black/80 p-3 backdrop-blur-md sm:p-5"
      onMouseDown={(event) =>
        event.target === event.currentTarget && onClose()
      }
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-label="Attendance rules"
        className="my-5 w-full max-w-4xl overflow-hidden rounded-2xl border border-white/10 bg-[#090909] shadow-2xl"
      >
        <div className="relative border-b border-white/10 bg-[#0d0d0d] px-5 py-6 sm:px-7">
          <button
            type="button"
            onClick={onClose}
            aria-label="Close"
            className="absolute right-5 top-5 rounded-lg p-2 text-white/50 transition hover:bg-white/10 hover:text-white"
          >
            <X size={18} />
          </button>

          <div className="flex flex-col items-center text-center">
            <h2 className="rounded-lg border border-red-500/30 bg-[#c1121f] px-5 py-2 text-lg font-bold text-white shadow-lg shadow-red-950/20">
              Attendance Rules
            </h2>

            <p className="mt-3 max-w-md text-[11.5px] leading-relaxed text-white/50">
              Manage individual employee schedules, working hours, and
              break allowances.
            </p>

            <div className="mt-4 inline-flex items-center gap-2 rounded-lg border border-white/10 bg-white/[0.03] px-4 py-2">
              <Users size={14} className="text-white/60" />
              <span className="text-[12px] font-semibold text-white">
                Employee Hours
              </span>
              <span className="rounded-md bg-red-500/15 px-2 py-0.5 text-[10px] font-bold text-red-300">
                {rows.length}
              </span>
            </div>
          </div>
        </div>

        <div className="p-4 sm:p-6">
          <div className="mb-4 flex flex-wrap items-center justify-between gap-2">
            <div>
              <h3 className="text-[13px] font-bold text-white">
                Employee Schedules
              </h3>
              <p className="mt-0.5 text-[11px] text-white/40">
                Configure working hours and break duration separately for
                each employee.
              </p>
            </div>

            <div className="flex items-center gap-2 rounded-lg border border-white/10 bg-white/[0.03] px-3 py-2">
              <Users size={13} className="text-white/50" />
              <span className="text-[11px] font-semibold text-white/70">
                {rows.length} Employees
              </span>
            </div>
          </div>

          <div className="mb-4">
            <div className="relative">
              <Search
                size={16}
                className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-white/35"
              />

              <input
                type="text"
                value={searchTerm}
                onChange={(event) => setSearchTerm(event.target.value)}
                placeholder="Search employee by name, department, designation..."
                aria-label="Search employees"
                className={`${inputCls} h-11 pl-10 pr-10`}
              />

              {searchTerm && (
                <button
                  type="button"
                  onClick={() => setSearchTerm("")}
                  aria-label="Clear employee search"
                  className="absolute right-3 top-1/2 -translate-y-1/2 rounded-md p-1 text-white/40 transition hover:bg-white/10 hover:text-white"
                >
                  <X size={14} />
                </button>
              )}
            </div>

            <p className="mt-2 text-[10.5px] text-white/40">
              {searchTerm
                ? `${filteredRows.length} matching employees`
                : "Search to quickly find an employee."}
            </p>
          </div>

          {notice && (
            <div
              role="alert"
              className={`mb-4 flex items-start gap-2 rounded-xl border px-3.5 py-3 text-[12px] ${
                notice.type === "success"
                  ? "border-green-500/30 bg-green-500/10 text-green-300"
                  : "border-red-600/40 bg-red-600/10 text-red-300"
              }`}
            >
              {notice.type === "success" ? (
                <Save size={15} className="mt-0.5 shrink-0" />
              ) : (
                <AlertTriangle size={15} className="mt-0.5 shrink-0" />
              )}
              {notice.text}
            </div>
          )}

          {loading ? (
            <div className="flex min-h-56 items-center justify-center gap-2 text-[12.5px] text-white/60">
              <Loader2 size={18} className="animate-spin text-red-400" />
              Loading employees...
            </div>
          ) : rows.length === 0 ? (
            <div className="flex min-h-48 flex-col items-center justify-center rounded-xl border border-dashed border-white/10 bg-white/[0.02] text-center">
              <Users size={28} className="mb-2 text-white/20" />
              <p className="text-[13px] font-semibold text-white/65">
                No employees found
              </p>
              <p className="mt-1 text-[11px] text-white/35">
                Employee schedules will appear here.
              </p>
            </div>
          ) : filteredRows.length === 0 ? (
            <div className="flex min-h-40 flex-col items-center justify-center rounded-xl border border-dashed border-white/10 bg-white/[0.02] text-center">
              <Search size={25} className="mb-2 text-white/25" />
              <p className="text-[13px] font-semibold text-white/65">
                No matching employee
              </p>
              <p className="mt-1 text-[11px] text-white/35">
                Try another employee name or department.
              </p>
              <button
                type="button"
                onClick={() => setSearchTerm("")}
                className="mt-3 rounded-lg border border-white/10 px-3 py-2 text-[11px] font-semibold text-white/65 transition hover:bg-white/5 hover:text-white"
              >
                Clear search
              </button>
            </div>
          ) : (
            <ul className="flex flex-col gap-3">
              {filteredRows.map((row, index) => {
                const schedule = row.schedule || {};
                const editing = editingId === row.userId;
                const over = row.hours?.today?.breakOverMinutes || 0;

                const breakDuration =
                  schedule.breakDurationMinutes != null
                    ? formatDuration(schedule.breakDurationMinutes)
                    : "Not set";

                const cardBorder =
                  CARD_BORDER_COLORS[index % CARD_BORDER_COLORS.length];

                return (
                  <li
                    key={row.userId}
                    className={`overflow-hidden rounded-xl border ${
                      editing ? "border-red-500/50" : cardBorder
                    } bg-[#0d0d0d] transition-colors`}
                  >
                    <div className="p-4 sm:p-5">
                      <div className="flex flex-wrap items-start justify-between gap-3">
                        <div className="flex min-w-0 items-center gap-3">
                          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-white/10 bg-white/[0.04]">
                            <Users size={17} className="text-white/60" />
                          </div>

                          <div className="min-w-0">
                            <p className="truncate text-[13.5px] font-bold text-white">
                              {row.name}
                            </p>
                            <p className="mt-0.5 truncate text-[11px] text-white/45">
                              {[row.designation, row.department]
                                .filter(Boolean)
                                .join(" · ") || row.role}
                            </p>
                            <p className="mt-1 text-[11px] text-white/65">
                              {schedule.startTime && schedule.endTime
                                ? `${formatHHmm(schedule.startTime)} – ${formatHHmm(schedule.endTime)}`
                                : "Flexible hours"}
                              {" · "}
                              {formatDuration(schedule.dailyTargetMinutes)} daily
                            </p>
                          </div>
                        </div>

                        <button
                          type="button"
                          onClick={() => {
                            if (editing) {
                              setEditingId(null);
                              setDraft(null);
                            } else {
                              startEdit(row);
                            }
                          }}
                          className={`rounded-lg border px-4 py-2 text-[11px] font-semibold transition ${
                            editing
                              ? "border-white/15 bg-white/5 text-white/70 hover:bg-white/10"
                              : "border-white/15 bg-white/[0.03] text-white/75 hover:border-red-500/40 hover:text-white"
                          }`}
                        >
                          {editing ? "Cancel" : "Edit Schedule"}
                        </button>
                      </div>

                      <div className="mt-4 flex flex-wrap items-center gap-2">
                        <div className="inline-flex items-center gap-2 rounded-lg border border-white/10 bg-[#121212] px-3 py-2">
                          <Coffee size={13} className="text-white/50" />
                          <span className="text-[10.5px] text-white/55">
                            Break allowance
                          </span>
                          <span className="text-[11px] font-bold text-white">
                            {breakDuration}
                          </span>
                        </div>

                        <div className="inline-flex items-center gap-2 rounded-lg border border-white/10 bg-[#121212] px-3 py-2">
                          <CalendarDays size={13} className="text-white/40" />
                          <span className="text-[10.5px] text-white/55">
                            {schedule.custom
                              ? "Custom schedule"
                              : "Company default"}
                          </span>
                        </div>
                      </div>

                      <div className="mt-4 grid gap-2 sm:grid-cols-3">
                        <div className="rounded-xl border border-white/10 bg-[#111111] p-3">
                          <p className="text-[9.5px] font-bold uppercase tracking-wider text-white/40">
                            This week
                          </p>
                          <p className="mt-1.5 text-[13px] font-bold tabular-nums text-white">
                            {formatDuration(row.hours?.week?.workedMinutes)}
                            <span className="px-1 text-white/25">/</span>
                            <span className="text-white/55">
                              {formatDuration(row.hours?.week?.targetMinutes)}
                            </span>
                          </p>
                          <p className="mt-1 text-[10px] text-white/40">
                            {formatDuration(row.hours?.week?.remainingMinutes)} remaining
                          </p>
                        </div>

                        <div className="rounded-xl border border-white/10 bg-[#111111] p-3">
                          <p className="text-[9.5px] font-bold uppercase tracking-wider text-white/40">
                            This month
                          </p>
                          <p className="mt-1.5 text-[13px] font-bold tabular-nums text-white">
                            {formatDuration(row.hours?.month?.workedMinutes)}
                            <span className="px-1 text-white/25">/</span>
                            <span className="text-white/55">
                              {formatDuration(row.hours?.month?.targetMinutes)}
                            </span>
                          </p>
                          <p className="mt-1 text-[10px] text-white/40">
                            {formatDuration(row.hours?.month?.remainingMinutes)} remaining
                          </p>
                        </div>

                        <div
                          className={`rounded-xl border p-3 ${
                            over > 0
                              ? "border-red-500/30 bg-red-500/5"
                              : "border-white/10 bg-[#111111]"
                          }`}
                        >
                          <p className="text-[9.5px] font-bold uppercase tracking-wider text-white/40">
                            Extra break today
                          </p>
                          <p
                            className={`mt-1.5 flex items-center gap-1.5 text-[13px] font-bold tabular-nums ${
                              over > 0 ? "text-red-300" : "text-white"
                            }`}
                          >
                            {over > 0 && <AlertTriangle size={13} />}
                            {formatDuration(over)}
                          </p>
                          <p className="mt-1 text-[10px] text-white/40">
                            {row.hours?.today?.onBreak
                              ? "On a break now"
                              : "Beyond allowed duration"}
                          </p>
                        </div>
                      </div>

                      {editing && draft && (
                        <div className="mt-4 rounded-xl border border-white/10 bg-[#111111] p-4">
                          <div className="mb-4 flex items-center gap-2 border-b border-white/10 pb-3">
                            <div className="rounded-lg border border-white/10 bg-white/5 p-2">
                              <Clock3 size={15} className="text-white/70" />
                            </div>
                            <div>
                              <p className="text-[12.5px] font-bold text-white">
                                Edit Employee Schedule
                              </p>
                              <p className="text-[10.5px] text-white/40">
                                Update working hours and break allowance
                              </p>
                            </div>
                          </div>

                          <div className="grid gap-3 sm:grid-cols-2">
                            <label className="block">
                              <span className="mb-1.5 block text-[11px] font-semibold text-white/65">
                                Usual start time
                              </span>
                              <input
                                type="time"
                                value={draft.startTime}
                                onChange={(event) =>
                                  setDraft((current) => ({
                                    ...current,
                                    startTime: event.target.value,
                                  }))
                                }
                                className={timeInputCls}
                              />
                            </label>

                            <label className="block">
                              <span className="mb-1.5 block text-[11px] font-semibold text-white/65">
                                Usual end time
                              </span>
                              <input
                                type="time"
                                value={draft.endTime}
                                onChange={(event) =>
                                  setDraft((current) => ({
                                    ...current,
                                    endTime: event.target.value,
                                  }))
                                }
                                className={timeInputCls}
                              />
                            </label>

                            <label className="block">
                              <span className="mb-1.5 block text-[11px] font-semibold text-white/65">
                                Hours per day
                              </span>
                              <input
                                type="number"
                                min="1"
                                max="16"
                                step="0.5"
                                value={draft.dailyHours}
                                placeholder="Use company default"
                                onChange={(event) =>
                                  setDraft((current) => ({
                                    ...current,
                                    dailyHours: event.target.value,
                                  }))
                                }
                                className={inputCls}
                              />
                            </label>

                            <label className="block">
                              <span className="mb-1.5 block text-[11px] font-semibold text-white/65">
                                Break duration (minutes)
                              </span>
                              <div className="relative">
                                <Coffee
                                  size={15}
                                  className="absolute left-3 top-1/2 -translate-y-1/2 text-white/40"
                                />
                                <input
                                  type="number"
                                  min="0"
                                  max="240"
                                  step="5"
                                  value={draft.breakDurationMinutes}
                                  placeholder="Enter minutes"
                                  onChange={(event) =>
                                    setDraft((current) => ({
                                      ...current,
                                      breakDurationMinutes: event.target.value,
                                    }))
                                  }
                                  className={`${inputCls} pl-9`}
                                />
                              </div>
                              <span className="mt-1 block text-[10px] text-white/40">
                                Set the allowed break duration for this employee.
                              </span>
                            </label>
                          </div>

                          <div className="mt-4">
                            <span className="mb-2 block text-[11px] font-semibold text-white/65">
                              Working days
                            </span>
                            <DayPicker
                              value={draft.workDays}
                              onChange={(days) =>
                                setDraft((current) => ({
                                  ...current,
                                  workDays: days,
                                }))
                              }
                            />
                          </div>

                          <p className="mt-4 rounded-lg border border-white/5 bg-black/20 px-3 py-2.5 text-[10.5px] leading-relaxed text-white/45">
                            Actual working time is calculated from clock-in
                            and clock-out records. Break time is tracked
                            separately.
                          </p>

                          <div className="mt-4 flex flex-wrap gap-2">
                            <button
                              type="button"
                              onClick={() => saveSchedule(row.userId)}
                              disabled={saving}
                              className="flex items-center gap-2 rounded-lg bg-[#c1121f] px-5 py-2.5 text-[11.5px] font-bold text-white transition hover:bg-[#d4202d] disabled:cursor-not-allowed disabled:opacity-60"
                            >
                              {saving ? (
                                <Loader2 size={14} className="animate-spin" />
                              ) : (
                                <Save size={14} />
                              )}
                              Save Schedule
                            </button>

                            {schedule.custom && (
                              <button
                                type="button"
                                onClick={() => saveSchedule(row.userId, true)}
                                disabled={saving}
                                className="flex items-center gap-2 rounded-lg border border-white/10 bg-white/[0.03] px-4 py-2.5 text-[11.5px] font-semibold text-white/65 transition hover:border-white/25 hover:text-white disabled:opacity-60"
                              >
                                <RotateCcw size={14} />
                                Use Company Default
                              </button>
                            )}
                          </div>
                        </div>
                      )}
                    </div>
                  </li>
                );
              })}
            </ul>
          )}
        </div>

        <div className="flex items-center justify-between border-t border-white/10 bg-[#0c0c0c] px-5 py-3.5 sm:px-6">
          <p className="text-[10px] text-white/30">
            DigiAmplify · Attendance Management
          </p>
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg border border-white/10 px-4 py-2 text-[11px] font-semibold text-white/65 transition hover:border-white/25 hover:bg-white/5 hover:text-white"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};

export default AttendanceRulesModal;
