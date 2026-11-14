
import { useCallback, useEffect, useState } from "react";
import apiClient from "@/services/api/apiClient.js";
import AdminTaskExport from "../Admintaskexport/Admintaskexport.jsx";
import { useAuth } from "@/context/AuthContext/AuthContext/AuthContext.jsx";

const field =
  "rounded border border-[#2a2a2a] bg-[#0d0d0d] px-3 py-2 text-sm text-white outline-none focus:border-red-700";

const todayKey = () => new Date().toLocaleDateString("en-CA");

const fmtMinutes = (total) => {
  const minutes = Number(total) || 0;
  if (minutes <= 0) return "—";
  const hours = Math.floor(minutes / 60);
  const rest = minutes % 60;
  if (!hours) return `${rest}m`;
  return rest ? `${hours}h ${rest}m` : `${hours}h`;
};

const fmtTime = (value) => {
  if (!value) return "—";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "—";
  return date.toLocaleString("en-GB", {
    day: "numeric",
    month: "short",
    hour: "2-digit",
    minute: "2-digit",
  });
};

const fmtDay = (value) => {
  if (!value) return "—";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "—";
  return date.toLocaleDateString("en-GB", { day: "numeric", month: "short" });
};

const STATUS_STYLE = {
  pending: "bg-neutral-800 text-neutral-300",
  "in-progress": "bg-sky-950/60 text-sky-300",
  review: "bg-amber-950/60 text-amber-300",
  approved: "bg-emerald-950/60 text-emerald-300",
};

const STATUS_LABEL = {
  pending: "To Do",
  "in-progress": "In Progress",
  review: "In Review",
  approved: "Done",
};

function StatCard({ label, value, tone = "text-white" }) {
  return (
    <div className="rounded-xl border border-white/10 bg-[#0d0d0d] p-4">
      <p className="text-xs text-neutral-400">{label}</p>
      <p className={`mt-1 text-2xl font-semibold ${tone}`}>{value}</p>
    </div>
  );
}

function Th({ children }) {
  return (
    <th className="whitespace-nowrap px-4 py-3 text-left text-[11px] font-medium uppercase tracking-wide text-neutral-500">
      {children}
    </th>
  );
}

export default function AdminTaskActivity({ employees = [], onNotice }) {
  // The Excel report is for admins only.
  const { user: currentUser } = useAuth();

  const isAdminUser =
    String(currentUser?.role || "").toLowerCase() === "admin";

  const [date, setDate] = useState(todayKey());
  const [employeeId, setEmployeeId] = useState("");
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [expanded, setExpanded] = useState({});
  const [stoppingId, setStoppingId] = useState(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError("");

    try {
      const response = await apiClient.get("/tasks/admin/activity", {
        params: { date, ...(employeeId ? { employeeId } : {}) },
      });

      setData(response?.data || null);
    } catch (requestError) {
      setError(
        requestError?.response?.data?.message ||
          requestError?.message ||
          "Unable to load employee activity."
      );
    } finally {
      setLoading(false);
    }
  }, [date, employeeId]);

  useEffect(() => {
    load();
  }, [load]);

  const stopFixedTask = async (item) => {
    const confirmed = window.confirm(
      `Stop "${item.task.title}" for ${item.employee?.name || "this employee"}? Past updates are kept.`
    );

    if (!confirmed) return;

    setStoppingId(item.task.id);

    try {
      await apiClient.patch(`/tasks/admin/${item.task.id}`, {
        isActive: false,
      });
      onNotice?.("Fixed task stopped.");
      await load();
    } catch (requestError) {
      onNotice?.(
        requestError?.response?.data?.message ||
          requestError?.message ||
          "Unable to stop this task."
      );
    } finally {
      setStoppingId(null);
    }
  };

  const summary = data?.summary || {};
  const fixedTasks = data?.fixedTasks || [];
  const extraTasks = data?.extraTasks || [];

  return (
    <div className="space-y-5">
      {/* Excel download: admins only */}
      {isAdminUser && (
        <div className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-white/10 bg-[#0d0d0d] px-4 py-3">
          <div>
            <h2 className="text-sm font-semibold text-white">Excel report</h2>
            <p className="text-xs text-neutral-500">
              Download task progress, daily updates and time spent
            </p>
          </div>

          <AdminTaskExport employees={employees} onNotice={onNotice} />
        </div>
      )}

      <div className="flex flex-wrap items-center gap-3">
        <input
          type="date"
          className={field}
          value={date}
          max={todayKey()}
          onChange={(event) => setDate(event.target.value || todayKey())}
        />

        <select
          className={field}
          value={employeeId}
          onChange={(event) => setEmployeeId(event.target.value)}
        >
          <option value="">All employees</option>
          {employees.map((employee) => (
            <option key={employee.id} value={employee.id}>
              {employee.name}
            </option>
          ))}
        </select>

        <button
          type="button"
          onClick={load}
          disabled={loading}
          className="rounded-lg border border-white/15 px-4 py-2 text-sm text-white transition hover:border-[#c1121f] hover:bg-[#c1121f]/10 disabled:opacity-50"
        >
          {loading ? "Loading..." : "Refresh"}
        </button>
      </div>

      {error && (
        <div className="rounded-lg border border-red-500/40 bg-red-500/10 px-4 py-3 text-sm text-red-200">
          {error}
        </div>
      )}

      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        <StatCard
          label="Fixed tasks posted"
          value={`${summary.fixedPosted ?? 0} / ${summary.fixedTotal ?? 0}`}
          tone="text-emerald-400"
        />
        <StatCard
          label="Not posted yet"
          value={summary.fixedMissing ?? 0}
          tone={summary.fixedMissing ? "text-amber-400" : "text-white"}
        />
        <StatCard
          label="Extra tasks done"
          value={`${summary.extraDone ?? 0} / ${summary.extraTotal ?? 0}`}
        />
        <StatCard
          label="Time logged"
          value={fmtMinutes(summary.totalMinutes)}
        />
      </div>

      {/* Fixed daily tasks */}
      <section className="rounded-xl border border-white/10 bg-[#0d0d0d]">
        <div className="border-b border-white/10 px-4 py-3">
          <h2 className="text-sm font-semibold text-white">
            Fixed daily tasks
          </h2>
          <p className="text-xs text-neutral-500">
            What each employee reported for {fmtDay(date)}
          </p>
        </div>

        {fixedTasks.length === 0 ? (
          <p className="px-4 py-10 text-center text-sm text-neutral-500">
            {loading
              ? "Loading..."
              : "No fixed daily tasks for this day. Use Assign Task to add one."}
          </p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[760px] text-sm">
              <thead>
                <tr className="border-b border-white/10">
                  <Th>Employee</Th>
                  <Th>Task</Th>
                  <Th>Status</Th>
                  <Th>Time spent</Th>
                  <Th>Update</Th>
                  <Th>&nbsp;</Th>
                </tr>
              </thead>
              <tbody>
                {fixedTasks.map((item) => {
                  const update = item.update;
                  const key = item.task.id;
                  const open = Boolean(expanded[key]);

                  return (
                    <tr
                      key={key}
                      className="border-b border-white/5 align-top last:border-b-0"
                    >
                      <td className="px-4 py-3 text-white">
                        {item.employee?.name || "Employee"}
                        <span className="block text-[11px] text-neutral-500">
                          {item.employee?.designation || ""}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-neutral-200">
                        {item.task.title}
                      </td>
                      <td className="px-4 py-3">
                        {update ? (
                          <span className="rounded-full bg-emerald-950/60 px-2 py-0.5 text-[11px] text-emerald-300">
                            {update.status === "completed"
                              ? "Done for the day"
                              : "Posted"}
                          </span>
                        ) : (
                          <span className="rounded-full bg-amber-950/60 px-2 py-0.5 text-[11px] text-amber-300">
                            Not posted
                          </span>
                        )}
                      </td>
                      <td className="whitespace-nowrap px-4 py-3 text-neutral-200">
                        {update ? fmtMinutes(update.timeSpentMinutes) : "—"}
                      </td>
                      <td className="max-w-[320px] px-4 py-3 text-neutral-300">
                        {update ? (
                          <>
                            <p
                              className={`whitespace-pre-wrap ${
                                open ? "" : "line-clamp-2"
                              }`}
                            >
                              {update.description}
                            </p>
                            {update.description.length > 90 && (
                              <button
                                type="button"
                                onClick={() =>
                                  setExpanded((current) => ({
                                    ...current,
                                    [key]: !open,
                                  }))
                                }
                                className="mt-1 text-[11px] text-red-400 hover:underline"
                              >
                                {open ? "Show less" : "Show more"}
                              </button>
                            )}
                            <p className="mt-1 text-[11px] text-neutral-500">
                              Posted {fmtTime(update.updatedAt)}
                            </p>
                          </>
                        ) : (
                          <span className="text-neutral-600">—</span>
                        )}
                      </td>
                      <td className="px-4 py-3 text-right">
                        <button
                          type="button"
                          disabled={stoppingId === key}
                          onClick={() => stopFixedTask(item)}
                          className="rounded border border-[#2a2a2a] px-2.5 py-1 text-[11px] text-neutral-400 hover:border-red-800 hover:text-red-400 disabled:opacity-50"
                        >
                          Stop task
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </section>

      {/* Extra tasks */}
      <section className="rounded-xl border border-white/10 bg-[#0d0d0d]">
        <div className="border-b border-white/10 px-4 py-3">
          <h2 className="text-sm font-semibold text-white">Extra tasks</h2>
          <p className="text-xs text-neutral-500">
            Tasks started, finished or due on {fmtDay(date)}, with the time
            each one took
          </p>
        </div>

        {extraTasks.length === 0 ? (
          <p className="px-4 py-10 text-center text-sm text-neutral-500">
            {loading ? "Loading..." : "No extra task activity on this day."}
          </p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[820px] text-sm">
              <thead>
                <tr className="border-b border-white/10">
                  <Th>Employee</Th>
                  <Th>Task</Th>
                  <Th>Status</Th>
                  <Th>Started</Th>
                  <Th>Finished</Th>
                  <Th>Time spent</Th>
                  <Th>Due</Th>
                </tr>
              </thead>
              <tbody>
                {extraTasks.map((task) => (
                  <tr
                    key={task.id}
                    className="border-b border-white/5 last:border-b-0"
                  >
                    <td className="px-4 py-3 text-white">
                      {task.employee?.name || "Employee"}
                    </td>
                    <td className="px-4 py-3 text-neutral-200">
                      {task.title}
                    </td>
                    <td className="px-4 py-3">
                      <span
                        className={`rounded-full px-2 py-0.5 text-[11px] ${
                          STATUS_STYLE[task.status] || STATUS_STYLE.pending
                        }`}
                      >
                        {STATUS_LABEL[task.status] || task.status}
                      </span>
                    </td>
                    <td className="whitespace-nowrap px-4 py-3 text-neutral-300">
                      {fmtTime(task.startedAt)}
                    </td>
                    <td className="whitespace-nowrap px-4 py-3 text-neutral-300">
                      {fmtTime(task.completedAt)}
                    </td>
                    <td className="whitespace-nowrap px-4 py-3 text-neutral-100">
                      {task.isDone
                        ? fmtMinutes(task.timeSpentMinutes)
                        : "—"}
                    </td>
                    <td className="whitespace-nowrap px-4 py-3 text-neutral-400">
                      {fmtDay(task.dueDate)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </div>
  );
}
