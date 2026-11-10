import { useEffect } from "react";
import { X } from "lucide-react";
import { BADGE, BADGE_LABEL, formatHours, formatTime, initials } from "./attendanceUtils";
import { getBreakLabel } from "../../../../utils/attendanceSessions";

const Item = ({ label, value }) => (
  <div className="rounded-xl border border-white/10 bg-[#0a0a0a] px-4 py-3">
    <p className="text-[11px] text-white/50">{label}</p>
    <p className="mt-1 text-[14px] font-semibold text-white">{value}</p>
  </div>
);

const STATE_LABEL = {
  in: "Working now",
  break: "On a break now",
  out: "Clocked out",
};

const AttendanceDetailsModal = ({ row, onClose }) => {
  useEffect(() => {
    const onKey = (e) => e.key === "Escape" && onClose();
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose]);

  if (!row) return null;

  const sessions = Array.isArray(row.sessions) ? row.sessions : [];
  const working = row.state === "in" || row.state === "break";

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4" onClick={onClose}>
      <div
        className="max-h-[92vh] w-full max-w-2xl overflow-y-auto rounded-2xl border border-white/10 bg-[#111] p-6"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-3">
            <span className="flex h-11 w-11 items-center justify-center rounded-lg border border-red-500/30 bg-red-600/15 text-[13px] font-bold text-red-400">
              {initials(row.name)}
            </span>
            <div>
              <p className="text-[16px] font-semibold text-white">{row.name}</p>
              <p className="text-[12px] text-white/60">{row.department}</p>
            </div>
          </div>
          <button onClick={onClose} aria-label="Close" className="text-white/60 hover:text-white">
            <X size={18} />
          </button>
        </div>

        <div className="mt-4 flex flex-wrap items-center gap-2">
          <span
            className={`inline-block rounded-full border px-3 py-1 text-[11px] font-semibold ${
              BADGE[row.status] || "border-white/20 text-white/70"
            }`}
          >
            {BADGE_LABEL[row.status] || row.status}
          </span>

          {row.clockInAt && STATE_LABEL[row.state] && (
            <span className="inline-block rounded-full border border-white/15 px-3 py-1 text-[11px] text-white/70">
              {STATE_LABEL[row.state]}
            </span>
          )}
        </div>

        <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-3">
          <Item label="First clock in" value={formatTime(row.clockInAt)} />
          <Item label="Last clock out" value={working ? "Still working" : formatTime(row.clockOutAt)} />
          <Item label="Hours worked" value={row.clockInAt ? formatHours(row.workedMinutes) : "—"} />
          <Item label="Clock ins" value={row.clockInAt ? (row.clockInCount ?? 1) : "—"} />
          <Item label="Clock outs" value={row.clockInAt ? (row.clockOutCount ?? (row.clockOutAt ? 1 : 0)) : "—"} />
          <Item
            label="Breaks"
            value={row.clockInAt ? `${row.breakCount ?? 0} · ${formatHours(row.breakMinutes || 0)}` : "—"}
          />
        </div>

        <h4 className="mt-6 text-[14px] font-semibold text-white">Timeline</h4>

        {sessions.length === 0 ? (
          <p className="mt-2 text-[13px] text-white/50">No clock in recorded for this day.</p>
        ) : (
          <ul className="mt-3 space-y-3">
            {sessions.map((session, index) => (
              <li key={session.id} className="rounded-xl border border-white/10 bg-[#0a0a0a] p-4">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <p className="text-[13px] font-semibold text-white">Session {index + 1}</p>
                  <p className="text-[12px] text-white/60">
                    {session.clockOutAt ? `${formatHours(session.workedMinutes)} worked` : "Working now"}
                  </p>
                </div>

                <p className="mt-1.5 text-[13px] tabular-nums text-white/80">
                  Clock in {formatTime(session.clockInAt)} → Clock out{" "}
                  {session.clockOutAt ? formatTime(session.clockOutAt) : "—"}
                </p>

                {(session.breaks || []).length > 0 && (
                  <div className="mt-2 space-y-1 border-l-2 border-amber-500/40 pl-3">
                    {session.breaks.map((item) => (
                      <p key={item.id} className="text-[12px] tabular-nums text-amber-300">
                        {getBreakLabel(item.type)} {formatTime(item.startAt)} –{" "}
                        {item.endAt ? formatTime(item.endAt) : "ongoing"} ({formatHours(item.minutes)})
                      </p>
                    ))}
                  </div>
                )}

                {session.description && (
                  <p className="mt-2 text-[12px] text-white/60">
                    <span className="text-white/40">Work done: </span>
                    {session.description}
                  </p>
                )}
              </li>
            ))}
          </ul>
        )}

        {sessions.length === 0 && (
          <div className="mt-3 rounded-xl border border-white/10 bg-[#0a0a0a] px-4 py-3">
            <p className="text-[11px] text-white/50">Clock out description</p>
            <p className="mt-1 text-[13px] text-white/80">{row.description || "No description added."}</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default AttendanceDetailsModal;