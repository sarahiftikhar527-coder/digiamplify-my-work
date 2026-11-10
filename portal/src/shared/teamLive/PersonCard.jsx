import { ChevronDown, Coffee, ShieldCheck } from "lucide-react";
import {
  DAILY_TARGET_MINUTES,
  STATUS_META,
  formatAgo,
  formatDuration,
  formatTime,
  getBreakLabel,
  getLiveBreakMinutes,
  getLiveWorkedMinutes,
  initials,
} from "./teamLiveUtils";

/* One clock-in session with its breaks (level 4 and 5 of the tree). */
function SessionList({ person, now, isAdminView }) {
  const sessions = person.sessions || [];

  if (sessions.length === 0) {
    return (
      <p className="px-1 py-2 text-[12px] text-white/45">
        No clock-ins recorded for this day.
      </p>
    );
  }

  return (
    <ul className="space-y-2">
      {sessions.map((session, index) => {
        const open = !session.clockOutAt;
        const minutes = open
          ? getLiveWorkedMinutes({ sessions: [session] }, now)
          : session.workedMinutes;

        return (
          <li
            key={session.id}
            className="rounded-md border border-white/10 bg-[#121212] p-3"
          >
            <div className="flex flex-wrap items-center justify-between gap-2 text-[12px]">
              <span className="font-semibold text-white">
                Session {index + 1}
              </span>

              <span
                className={`rounded-full border px-2.5 py-0.5 text-[10px] font-medium ${
                  open
                    ? session.onBreak
                      ? STATUS_META.break.chip
                      : STATUS_META.working.chip
                    : "border-white/15 text-white/60"
                }`}
              >
                {open ? (session.onBreak ? "On break" : "Working") : "Completed"}
              </span>
            </div>

            <p className="mt-1.5 text-[12px] tabular-nums text-white/70">
              In {formatTime(session.clockInAt)} → Out{" "}
              {open ? "--:--" : formatTime(session.clockOutAt)}
              <span className="ml-2 text-white/50">
                ({formatDuration(minutes)} worked
                {session.breakMinutes > 0
                  ? `, ${formatDuration(session.breakMinutes)} break`
                  : ""}
                )
              </span>
            </p>

            {(session.breaks || []).map((item) => (
              <p
                key={item.id}
                className="mt-1 flex items-center gap-1.5 pl-3 text-[11px] tabular-nums text-amber-300/90"
              >
                <Coffee size={11} />
                {getBreakLabel(item.type)} {formatTime(item.startAt)} –{" "}
                {item.endAt ? formatTime(item.endAt) : "now"} (
                {formatDuration(item.minutes)})
              </p>
            ))}

            {isAdminView && session.description && (
              <p className="mt-2 rounded border border-white/10 bg-black/40 px-2.5 py-1.5 text-[11px] leading-5 text-white/60">
                {session.description}
              </p>
            )}
          </li>
        );
      })}
    </ul>
  );
}

/* A person row: header with live numbers, expandable sessions below. */
export default function PersonCard({
  person,
  now,
  expanded,
  onToggle,
  isAdminView = false,
  highlight = false,
}) {
  const meta = STATUS_META[person.status] || STATUS_META.not_in;

  const worked = getLiveWorkedMinutes(person, now);
  const breakMinutes = getLiveBreakMinutes(person, now);
  const progress = Math.min(100, (worked / DAILY_TARGET_MINUTES) * 100);

  const lastOut = person.status === "out" ? person.lastClockOutAt : null;

  return (
    <div
      className={`rounded-md border ${
        highlight ? "border-red-800 bg-[#1a0808]" : "border-[#222] bg-black"
      }`}
    >
      <button
        type="button"
        onClick={onToggle}
        aria-expanded={expanded}
        className="flex w-full flex-wrap items-center justify-between gap-3 px-4 py-3 text-left"
      >
        <div className="flex min-w-0 items-center gap-3">
          <span
            className={`relative flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-sm font-semibold text-white ${
              highlight ? "bg-red-700" : "bg-[#222]"
            }`}
          >
            {initials(person.name)}
            <span
              className={`absolute -bottom-0.5 -right-0.5 h-3 w-3 rounded-full border-2 border-black ${meta.dot} ${
                person.status === "working" ? "animate-pulse" : ""
              }`}
            />
          </span>

          <div className="min-w-0">
            <p className="flex flex-wrap items-center gap-2 text-sm font-medium text-white">
              <span className="truncate">{person.name}</span>

              {person.isMe && (
                <span className="rounded bg-white/10 px-1.5 py-0.5 text-[10px] font-medium text-white/80">
                  You
                </span>
              )}

              {person.role === "admin" && (
                <span className="inline-flex items-center gap-1 rounded bg-red-900/40 px-1.5 py-0.5 text-[10px] font-medium text-red-300">
                  <ShieldCheck size={10} />
                  Admin
                </span>
              )}

              {isAdminView && person.signedIn && (
                <span className="rounded bg-emerald-900/40 px-1.5 py-0.5 text-[10px] font-medium text-emerald-400">
                  Signed in
                </span>
              )}
            </p>

            <p className="truncate text-xs text-neutral-500">
              {person.designation || person.email || person.department || "—"}
            </p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-x-5 gap-y-1.5 text-xs">
          <span
            className={`rounded-full border px-2.5 py-0.5 text-[11px] font-medium ${meta.chip}`}
          >
            {meta.label}
          </span>

          <span className="text-neutral-400">
            In:{" "}
            <span className="tabular-nums text-white">
              {formatTime(person.firstClockInAt)}
            </span>
          </span>

          <span className="text-neutral-400">
            Out:{" "}
            <span className="tabular-nums text-white">
              {formatTime(lastOut)}
            </span>
          </span>

          <span className="text-neutral-400">
            Worked:{" "}
            <span className="tabular-nums text-white">
              {formatDuration(worked)}
            </span>
          </span>

          {person.clockInCount > 0 && (
            <span className="text-neutral-500">
              {person.clockInCount} clock-in
              {person.clockInCount === 1 ? "" : "s"}
              {person.breakCount > 0
                ? ` · ${person.breakCount} break${
                    person.breakCount === 1 ? "" : "s"
                  } (${formatDuration(breakMinutes)})`
                : ""}
            </span>
          )}

          {person.lastActivityAt && person.status !== "not_in" && (
            <span className="text-neutral-600">
              {formatAgo(person.lastActivityAt, now)}
            </span>
          )}

          <ChevronDown
            size={16}
            className={`text-white/50 transition-transform ${
              expanded ? "rotate-180" : ""
            }`}
          />
        </div>
      </button>

      {/* Worked time versus the daily target */}
      <div className="mx-4 mb-3 h-1 overflow-hidden rounded-full bg-white/10">
        <div
          className={`h-full rounded-full transition-all ${meta.bar}`}
          style={{ width: `${progress}%` }}
        />
      </div>

      {expanded && (
        <div className="border-t border-[#222] px-4 pb-4 pt-3">
          <SessionList person={person} now={now} isAdminView={isAdminView} />
        </div>
      )}
    </div>
  );
}