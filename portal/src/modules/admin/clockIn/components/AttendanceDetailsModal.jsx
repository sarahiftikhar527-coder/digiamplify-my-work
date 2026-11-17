
import { useEffect } from "react";
import { X, Coffee, Clock } from "lucide-react";

import {
  BADGE,
  BADGE_LABEL,
  formatHours,
  formatTime,
  initials,
} from "./attendanceUtils";

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

const getBreakSeconds = (item) => {
  if (item.startAt && item.endAt) {
    const start = new Date(item.startAt).getTime();
    const end = new Date(item.endAt).getTime();

    if (Number.isFinite(start) && Number.isFinite(end)) {
      return Math.max(0, Math.floor((end - start) / 1000));
    }
  }

  if (item.startAt && !item.endAt) {
    const start = new Date(item.startAt).getTime();

    if (Number.isFinite(start)) {
      return Math.max(0, Math.floor((Date.now() - start) / 1000));
    }
  }

  return Math.max(0, Number(item.minutes || 0) * 60);
};

const formatExactDuration = (seconds) => {
  const safeSeconds = Math.max(0, Math.floor(seconds || 0));

  const hours = Math.floor(safeSeconds / 3600);
  const minutes = Math.floor((safeSeconds % 3600) / 60);
  const remainingSeconds = safeSeconds % 60;

  if (hours > 0) {
    return `${hours} hr ${minutes} min ${remainingSeconds} sec`;
  }

  if (minutes > 0) {
    return `${minutes} min ${remainingSeconds} sec`;
  }

  return `${remainingSeconds} sec`;
};

const AttendanceDetailsModal = ({ row, onClose }) => {
  useEffect(() => {
    const onKey = (event) => {
      if (event.key === "Escape") onClose();
    };

    window.addEventListener("keydown", onKey);

    return () => window.removeEventListener("keydown", onKey);
  }, [onClose]);

  if (!row) return null;

  const sessions = Array.isArray(row.sessions) ? row.sessions : [];
  const working = row.state === "in" || row.state === "break";

  const allBreaks = sessions.flatMap((session) =>
    Array.isArray(session.breaks) ? session.breaks : []
  );

  const totalBreakSeconds = allBreaks.reduce(
    (total, item) => total + getBreakSeconds(item),
    0
  );

  const breakCount = row.clockInAt
    ? row.breakCount ?? allBreaks.length
    : 0;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4"
      onClick={onClose}
    >
      <div
        className="max-h-[92vh] w-full max-w-2xl overflow-y-auto rounded-2xl border border-white/10 bg-[#111] p-6"
        onClick={(event) => event.stopPropagation()}
      >
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-3">
            <span className="flex h-11 w-11 items-center justify-center rounded-lg border border-red-500/30 bg-red-600/15 text-[13px] font-bold text-red-400">
              {initials(row.name)}
            </span>

            <div>
              <p className="text-[16px] font-semibold text-white">
                {row.name}
              </p>

              <p className="text-[12px] text-white/60">
                {row.department}
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            aria-label="Close"
            className="text-white/60 hover:text-white"
          >
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
          <Item
            label="First clock in"
            value={formatTime(row.clockInAt)}
          />

          <Item
            label="Last clock out"
            value={
              working
                ? "Still working"
                : formatTime(row.clockOutAt)
            }
          />

          <Item
            label="Hours worked"
            value={
              row.clockInAt
                ? formatHours(row.workedMinutes)
                : "—"
            }
          />

          <Item
            label="Clock ins"
            value={
              row.clockInAt
                ? row.clockInCount ?? 1
                : "—"
            }
          />

          <Item
            label="Clock outs"
            value={
              row.clockInAt
                ? row.clockOutCount ?? (row.clockOutAt ? 1 : 0)
                : "—"
            }
          />

          <Item
            label="Total breaks"
            value={
              row.clockInAt
                ? `${breakCount} · ${formatExactDuration(totalBreakSeconds)}`
                : "—"
            }
          />
        </div>

        <div className="mt-6 flex items-center justify-between gap-3">
          <h4 className="text-[14px] font-semibold text-white">
            Break Details
          </h4>

          <span className="text-[11px] text-white/50">
            Exact duration
          </span>
        </div>

        {allBreaks.length === 0 ? (
          <div className="mt-3 rounded-xl border border-white/10 bg-[#0a0a0a] px-4 py-4">
            <p className="text-[12px] text-white/50">
              No breaks recorded for this day.
            </p>
          </div>
        ) : (
          <div className="mt-3 space-y-3">
            {sessions.map((session, sessionIndex) => {
              const breaks = Array.isArray(session.breaks)
                ? session.breaks
                : [];

              if (breaks.length === 0) return null;

              return (
                <div
                  key={session.id || sessionIndex}
                  className="rounded-xl border border-white/10 bg-[#0a0a0a] p-4"
                >
                  <p className="mb-3 text-[12px] font-semibold text-white/70">
                    Session {sessionIndex + 1}
                  </p>

                  <div className="space-y-3">
                    {breaks.map((item, breakIndex) => {
                      const durationSeconds = getBreakSeconds(item);
                      const isOngoing = !item.endAt;

                      return (
                        <div
                          key={item.id || breakIndex}
                          className="rounded-lg border border-amber-500/20 bg-amber-500/[0.05] p-3"
                        >
                          <div className="flex flex-wrap items-center justify-between gap-2">
                            <div className="flex items-center gap-2">
                              <Coffee
                                size={14}
                                className="text-amber-400"
                              />

                              <span className="text-[13px] font-semibold text-white">
                                Break {breakIndex + 1}
                              </span>
                            </div>

                            <span
                              className={`rounded-full px-2.5 py-1 text-[11px] font-semibold ${
                                isOngoing
                                  ? "bg-amber-500/15 text-amber-300"
                                  : "bg-white/10 text-white/70"
                              }`}
                            >
                              {isOngoing ? "Ongoing" : "Completed"}
                            </span>
                          </div>

                          <div className="mt-3 grid grid-cols-2 gap-3">
                            <div>
                              <p className="text-[10px] text-white/45">
                                Started
                              </p>

                              <p className="mt-1 text-[12px] tabular-nums text-white/80">
                                {formatTime(item.startAt)}
                              </p>
                            </div>

                            <div>
                              <p className="text-[10px] text-white/45">
                                Ended
                              </p>

                              <p className="mt-1 text-[12px] tabular-nums text-white/80">
                                {item.endAt
                                  ? formatTime(item.endAt)
                                  : "Still on break"}
                              </p>
                            </div>
                          </div>

                          <div className="mt-3 flex items-center justify-between gap-2 border-t border-white/10 pt-3">
                            <span className="flex items-center gap-1.5 text-[11px] text-white/50">
                              <Clock size={12} />
                              Exact duration
                            </span>

                            <span className="text-[13px] font-bold tabular-nums text-amber-300">
                              {formatExactDuration(durationSeconds)}
                            </span>
                          </div>

                          {(item.reason || item.description) && (
                            <p className="mt-2 border-t border-white/10 pt-2 text-[12px] text-white/60">
                              <span className="text-white/40">
                                Reason:{" "}
                              </span>
                              {item.reason || item.description}
                            </p>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>
              );
            })}
          </div>
        )}

        <h4 className="mt-6 text-[14px] font-semibold text-white">
          Timeline
        </h4>

        {sessions.length === 0 ? (
          <p className="mt-2 text-[13px] text-white/50">
            No clock in recorded for this day.
          </p>
        ) : (
          <ul className="mt-3 space-y-3">
            {sessions.map((session, index) => (
              <li
                key={session.id || index}
                className="rounded-xl border border-white/10 bg-[#0a0a0a] p-4"
              >
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <p className="text-[13px] font-semibold text-white">
                    Session {index + 1}
                  </p>

                  <p className="text-[12px] text-white/60">
                    {session.clockOutAt
                      ? `${formatHours(session.workedMinutes)} worked`
                      : "Working now"}
                  </p>
                </div>

                <p className="mt-1.5 text-[13px] tabular-nums text-white/80">
                  Clock in {formatTime(session.clockInAt)} → Clock out{" "}
                  {session.clockOutAt
                    ? formatTime(session.clockOutAt)
                    : "—"}
                </p>

                {session.description && (
                  <p className="mt-2 text-[12px] text-white/60">
                    <span className="text-white/40">
                      Work done:{" "}
                    </span>
                    {session.description}
                  </p>
                )}
              </li>
            ))}
          </ul>
        )}

        {sessions.length === 0 && (
          <div className="mt-3 rounded-xl border border-white/10 bg-[#0a0a0a] px-4 py-3">
            <p className="text-[11px] text-white/50">
              Clock out description
            </p>

            <p className="mt-1 text-[13px] text-white/80">
              {row.description || "No description added."}
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default AttendanceDetailsModal;
