import { useCallback, useEffect, useState } from "react";
import {
  AlertTriangle,
  Coffee,
  Loader2,
  RotateCcw,
  Save,
  Users,
  X,
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

const BREAKS = [
  { key: "tea", label: "Tea break" },
  { key: "lunch", label: "Lunch break" },
  { key: "prayer", label: "Prayer break" },
  { key: "other", label: "Other break" },
];

const errorText = (error) =>
  error?.response?.data?.message || error?.message || "Something went wrong.";

const inputCls =
  "w-full rounded-lg border border-white/10 bg-[#121212] px-3 py-2 text-[12.5px] text-white outline-none focus:border-red-600 disabled:opacity-60";

const DayPicker = ({ value, onChange }) => (
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
          className={`rounded-md border px-2.5 py-1.5 text-[11.5px] font-medium transition ${
            active
              ? "border-red-600/60 bg-red-600/15 text-red-300"
              : "border-white/10 bg-[#121212] text-white/60 hover:border-white/25"
          }`}
        >
          {day.label}
        </button>
      );
    })}
  </div>
);

const AttendanceRulesModal = ({ onClose }) => {
  const [tab, setTab] = useState("breaks");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [notice, setNotice] = useState(null);

  const [form, setForm] = useState(null);
  const [rows, setRows] = useState([]);
  const [editingId, setEditingId] = useState(null);
  const [draft, setDraft] = useState(null);

  const load = useCallback(async () => {
    setLoading(true);

    try {
      const data = await clockInService.getSchedules();
      const rules = data.rules;

      setForm({
        tea: rules.breakAllowances.tea,
        lunch: rules.breakAllowances.lunch,
        prayer: rules.breakAllowances.prayer,
        other: rules.breakAllowances.other,
        dailyHours: rules.dailyTargetMinutes / 60,
        workDays: rules.workDays,
      });

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
    const onKey = (event) => event.key === "Escape" && onClose();

    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose]);

  const saveRules = async () => {
    setSaving(true);
    setNotice(null);

    try {
      const result = await clockInService.updateRules({
        breakAllowances: {
          tea: Number(form.tea),
          lunch: Number(form.lunch),
          prayer: Number(form.prayer),
          other: Number(form.other),
        },
        dailyTargetMinutes: Math.round(Number(form.dailyHours) * 60),
        workDays: form.workDays,
      });

      setNotice({ type: "success", text: result?.message || "Attendance rules saved." });
      await load();
    } catch (error) {
      setNotice({ type: "error", text: errorText(error) });
    } finally {
      setSaving(false);
    }
  };

  const startEdit = (row) => {
    const schedule = row.schedule || {};

    setEditingId(row.userId);
    setNotice(null);
    setDraft({
      startTime: schedule.startTime || "",
      endTime: schedule.endTime || "",
      dailyHours: schedule.custom ? schedule.dailyTargetMinutes / 60 : "",
      workDays: schedule.workDays || form.workDays,
    });
  };

  const saveSchedule = async (userId, reset = false) => {
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
                draft.dailyHours === "" ? null : Math.round(Number(draft.dailyHours) * 60),
              workDays: draft.workDays,
            }
      );

      setNotice({ type: "success", text: result?.message || "Schedule saved." });
      setEditingId(null);
      await load();
    } catch (error) {
      setNotice({ type: "error", text: errorText(error) });
    } finally {
      setSaving(false);
    }
  };

  const setField = (key, value) => setForm((current) => ({ ...current, [key]: value }));

  return (
    <div
      className="fixed inset-0 z-[70] flex items-start justify-center overflow-y-auto bg-black/75 p-4 backdrop-blur-sm"
      onMouseDown={(event) => event.target === event.currentTarget && onClose()}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-label="Attendance rules"
        className="my-6 w-full max-w-3xl rounded-2xl border border-white/10 bg-[#0a0a0a] p-5 shadow-2xl sm:p-6"
      >
        <div className="flex items-start justify-between gap-3">
          <div>
            <h2 className="text-lg font-bold text-white">Attendance Rules</h2>
            <p className="mt-0.5 text-[12px] text-white/55">
              Fixed break limits for everyone, and working hours for each
              employee.
            </p>
          </div>

          <button
            type="button"
            onClick={onClose}
            aria-label="Close"
            className="rounded-md p-1.5 text-white/60 hover:bg-white/10 hover:text-white"
          >
            <X size={18} />
          </button>
        </div>

        <div className="mt-4 flex gap-1 rounded-xl border border-white/10 bg-[#0d0d0d] p-1">
          {[
            { key: "breaks", label: "Break Limits & Default Hours", icon: Coffee },
            { key: "employees", label: "Employee Hours", icon: Users },
          ].map(({ key, label, icon: Icon }) => (
            <button
              key={key}
              type="button"
              onClick={() => setTab(key)}
              className={`flex flex-1 items-center justify-center gap-2 rounded-lg px-3 py-2 text-[12.5px] font-semibold transition ${
                tab === key
                  ? "bg-[#c1121f] text-white"
                  : "text-white/60 hover:bg-white/5 hover:text-white"
              }`}
            >
              <Icon size={14} />
              {label}
            </button>
          ))}
        </div>

        {notice && (
          <p
            role="alert"
            className={`mt-3 rounded-md border px-3 py-2 text-[12px] ${
              notice.type === "success"
                ? "border-green-500/30 bg-green-500/10 text-green-300"
                : "border-red-600/40 bg-red-600/10 text-red-300"
            }`}
          >
            {notice.text}
          </p>
        )}

        {loading || !form ? (
          <div className="flex items-center justify-center gap-2 py-16 text-[12.5px] text-white/60">
            <Loader2 size={16} className="animate-spin" /> Loading...
          </div>
        ) : tab === "breaks" ? (
          <div className="mt-4">
            <p className="text-[12px] text-white/60">
              Each break type has a fixed time limit. If someone stays on a
              break longer, or does not end it, the extra minutes are counted
              and a warning is shown to them. You can see the extra time in the
              Employee Hours tab.
            </p>

            <div className="mt-4 grid gap-3 sm:grid-cols-2">
              {BREAKS.map((item) => (
                <label key={item.key} className="block">
                  <span className="mb-1.5 block text-[11px] font-medium text-white/55">
                    {item.label} (minutes)
                  </span>
                  <input
                    type="number"
                    min="0"
                    max="240"
                    value={form[item.key]}
                    onChange={(event) => setField(item.key, event.target.value)}
                    className={inputCls}
                  />
                </label>
              ))}
            </div>

            <div className="mt-5 border-t border-white/10 pt-4">
              <h3 className="text-[13px] font-semibold text-white">
                Default working time
              </h3>
              <p className="mt-0.5 text-[11.5px] text-white/50">
                Used for everyone who has no personal schedule. Attendance is
                measured by total hours, not by fixed start and end times.
              </p>

              <div className="mt-3 grid gap-3 sm:grid-cols-2">
                <label className="block">
                  <span className="mb-1.5 block text-[11px] font-medium text-white/55">
                    Hours per working day
                  </span>
                  <input
                    type="number"
                    min="1"
                    max="16"
                    step="0.5"
                    value={form.dailyHours}
                    onChange={(event) => setField("dailyHours", event.target.value)}
                    className={inputCls}
                  />
                </label>

                <div>
                  <span className="mb-1.5 block text-[11px] font-medium text-white/55">
                    Working days
                  </span>
                  <DayPicker
                    value={form.workDays}
                    onChange={(days) => setField("workDays", days)}
                  />
                </div>
              </div>
            </div>

            <button
              type="button"
              onClick={saveRules}
              disabled={saving || form.workDays.length === 0}
              className="mt-5 flex items-center justify-center gap-2 rounded-md bg-[#c1121f] px-5 py-2.5 text-[13px] font-semibold text-white transition hover:bg-[#d4202d] disabled:cursor-not-allowed disabled:opacity-60"
            >
              {saving ? <Loader2 size={15} className="animate-spin" /> : <Save size={15} />}
              Save Rules
            </button>
          </div>
        ) : (
          <ul className="mt-4 flex flex-col gap-2.5">
            {rows.length === 0 && (
              <li className="py-10 text-center text-[12.5px] text-white/50">
                No employees found.
              </li>
            )}

            {rows.map((row) => {
              const schedule = row.schedule || {};
              const editing = editingId === row.userId;
              const over = row.hours?.today?.breakOverMinutes || 0;

              return (
                <li
                  key={row.userId}
                  className="rounded-xl border border-white/10 bg-[#0d0d0d] p-3.5"
                >
                  <div className="flex flex-wrap items-start justify-between gap-3">
                    <div className="min-w-0">
                      <p className="truncate text-[13px] font-semibold text-white">
                        {row.name}
                      </p>
                      <p className="truncate text-[11px] text-white/45">
                        {[row.designation, row.department].filter(Boolean).join(" · ") ||
                          row.role}
                      </p>
                      <p className="mt-1.5 text-[11.5px] text-white/60">
                        {schedule.startTime && schedule.endTime
                          ? `${formatHHmm(schedule.startTime)} – ${formatHHmm(schedule.endTime)}`
                          : "Flexible hours"}{" "}
                        · {formatDuration(schedule.dailyTargetMinutes)} daily ·{" "}
                        <span className={schedule.custom ? "text-red-300" : "text-white/40"}>
                          {schedule.custom ? "Custom schedule" : "Company default"}
                        </span>
                      </p>
                    </div>

                    <button
                      type="button"
                      onClick={() => (editing ? setEditingId(null) : startEdit(row))}
                      className="rounded-md border border-white/15 px-3 py-1.5 text-[11.5px] font-semibold text-white/80 hover:border-white/30 hover:text-white"
                    >
                      {editing ? "Cancel" : "Edit"}
                    </button>
                  </div>

                  <div className="mt-3 grid gap-2 sm:grid-cols-3">
                    <div className="rounded-lg border border-white/10 bg-[#121212] px-3 py-2">
                      <p className="text-[10px] uppercase tracking-wide text-white/40">
                        This week
                      </p>
                      <p className="text-[12px] font-semibold tabular-nums text-white">
                        {formatDuration(row.hours?.week?.workedMinutes)} /{" "}
                        {formatDuration(row.hours?.week?.targetMinutes)}
                      </p>
                      <p className="text-[10.5px] text-white/45">
                        {formatDuration(row.hours?.week?.remainingMinutes)} remaining
                      </p>
                    </div>

                    <div className="rounded-lg border border-white/10 bg-[#121212] px-3 py-2">
                      <p className="text-[10px] uppercase tracking-wide text-white/40">
                        This month
                      </p>
                      <p className="text-[12px] font-semibold tabular-nums text-white">
                        {formatDuration(row.hours?.month?.workedMinutes)} /{" "}
                        {formatDuration(row.hours?.month?.targetMinutes)}
                      </p>
                      <p className="text-[10.5px] text-white/45">
                        {formatDuration(row.hours?.month?.remainingMinutes)} remaining
                      </p>
                    </div>

                    <div
                      className={`rounded-lg border px-3 py-2 ${
                        over > 0
                          ? "border-red-500/40 bg-red-500/10"
                          : "border-white/10 bg-[#121212]"
                      }`}
                    >
                      <p className="text-[10px] uppercase tracking-wide text-white/40">
                        Extra break today
                      </p>
                      <p
                        className={`flex items-center gap-1.5 text-[12px] font-semibold tabular-nums ${
                          over > 0 ? "text-red-300" : "text-white"
                        }`}
                      >
                        {over > 0 && <AlertTriangle size={12} />}
                        {formatDuration(over)}
                      </p>
                      <p className="text-[10.5px] text-white/45">
                        {row.hours?.today?.onBreak ? "On a break now" : "Over the fixed limits"}
                      </p>
                    </div>
                  </div>

                  {editing && draft && (
                    <div className="mt-3 rounded-lg border border-white/10 bg-[#121212] p-3.5">
                      <div className="grid gap-3 sm:grid-cols-3">
                        <label className="block">
                          <span className="mb-1.5 block text-[11px] text-white/55">
                            Usual start time
                          </span>
                          <input
                            type="time"
                            value={draft.startTime}
                            onChange={(event) =>
                              setDraft((d) => ({ ...d, startTime: event.target.value }))
                            }
                            className={inputCls}
                          />
                        </label>

                        <label className="block">
                          <span className="mb-1.5 block text-[11px] text-white/55">
                            Usual end time
                          </span>
                          <input
                            type="time"
                            value={draft.endTime}
                            onChange={(event) =>
                              setDraft((d) => ({ ...d, endTime: event.target.value }))
                            }
                            className={inputCls}
                          />
                        </label>

                        <label className="block">
                          <span className="mb-1.5 block text-[11px] text-white/55">
                            Hours per day (empty = default)
                          </span>
                          <input
                            type="number"
                            min="1"
                            max="16"
                            step="0.5"
                            value={draft.dailyHours}
                            onChange={(event) =>
                              setDraft((d) => ({ ...d, dailyHours: event.target.value }))
                            }
                            className={inputCls}
                          />
                        </label>
                      </div>

                      <div className="mt-3">
                        <span className="mb-1.5 block text-[11px] text-white/55">
                          Working days
                        </span>
                        <DayPicker
                          value={draft.workDays}
                          onChange={(days) => setDraft((d) => ({ ...d, workDays: days }))}
                        />
                      </div>

                      <p className="mt-3 text-[11px] text-white/45">
                        Start and end times are only the usual schedule. Hours
                        are counted from when the person actually clocks in.
                      </p>

                      <div className="mt-3 flex flex-wrap gap-2">
                        <button
                          type="button"
                          onClick={() => saveSchedule(row.userId)}
                          disabled={saving || draft.workDays.length === 0}
                          className="flex items-center gap-2 rounded-md bg-[#c1121f] px-4 py-2 text-[12.5px] font-semibold text-white hover:bg-[#d4202d] disabled:opacity-60"
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
                            className="flex items-center gap-2 rounded-md border border-white/15 px-4 py-2 text-[12.5px] font-semibold text-white/80 hover:border-white/30 disabled:opacity-60"
                          >
                            <RotateCcw size={14} />
                            Use Company Default
                          </button>
                        )}
                      </div>
                    </div>
                  )}
                </li>
              );
            })}
          </ul>
        )}
      </div>
    </div>
  );
};

export default AttendanceRulesModal;