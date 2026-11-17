import { useState } from "react";
import { AlertTriangle, Coffee, Loader2, Play } from "lucide-react";
import Card from "../Card";
import { formatTime } from "../../../../../utils/time";
import {
  BREAK_TYPES,
  formatClock,
  getBreakLabel,
  getBreakOverSeconds,
} from "../../../../../utils/attendanceSessions";

const elapsedSeconds = (from, now) =>
  Math.max(
    0,
    Math.floor((new Date(now).getTime() - new Date(from).getTime()) / 1000)
  );

const BreakCard = ({
  state,
  openBreak,
  now,
  busy,
  error,
  rules,
  overMinutes = 0,
  onStart,
  onEnd,
}) => {
  const [type, setType] = useState("tea");
  const onBreak = state === "break";

  const allowances = rules?.breakAllowances || {};
  const allowedMinutes = Number(openBreak?.allowedMinutes) || 0;
  const elapsed = openBreak ? elapsedSeconds(openBreak.startAt, now) : 0;
  const overSeconds = openBreak ? getBreakOverSeconds(openBreak, now) : 0;
  const exceeded = onBreak && overSeconds > 0;
  const remainingSeconds = Math.max(0, allowedMinutes * 60 - elapsed);

  return (
    <Card icon={Coffee} title="Break">
      {onBreak ? (
        <div
          className={`rounded-lg border p-4 text-center ${
            exceeded
              ? "border-red-500/50 bg-red-500/10"
              : "border-amber-500/30 bg-amber-500/10"
          }`}
        >
          <p
            className={`text-[11px] uppercase tracking-wide ${
              exceeded ? "text-red-300" : "text-amber-300"
            }`}
          >
            On {getBreakLabel(openBreak?.type)} · {allowedMinutes} min allowed
          </p>

          <p className="mt-1 text-[30px] font-bold tabular-nums text-white">
            {openBreak ? formatClock(elapsed) : "00:00:00"}
          </p>

          <p className="text-[11px] text-white/50">
            Started at {formatTime(openBreak?.startAt)}
          </p>

          {exceeded ? (
            <div
              role="alert"
              className="mt-3 flex items-start gap-2 rounded-md border border-red-500/40 bg-red-500/15 px-3 py-2 text-left text-[12px] text-red-200"
            >
              <AlertTriangle size={15} className="mt-0.5 shrink-0" />
              <span>
                Break limit exceeded by{" "}
                <strong className="tabular-nums">{formatClock(overSeconds)}</strong>.
                End your break and resume work now. This extra time is
                recorded and visible to the admin.
              </span>
            </div>
          ) : (
            <p className="mt-3 text-[12px] text-amber-200">
              Time left:{" "}
              <strong className="tabular-nums">
                {formatClock(remainingSeconds)}
              </strong>
            </p>
          )}

          <button
            type="button"
            onClick={onEnd}
            disabled={busy}
            className="mt-4 flex w-full items-center justify-center gap-2 rounded-md bg-[#c1121f] py-2.5 text-[13px] font-semibold text-white transition hover:bg-[#d4202d] disabled:cursor-not-allowed disabled:opacity-60"
          >
            {busy ? (
              <Loader2 size={15} className="animate-spin" />
            ) : (
              <Play size={15} />
            )}
            End Break &amp; Resume Work
          </button>
        </div>
      ) : (
        <div>
          <p className="text-[12px] text-white/60">
            Choose a break type. Every break has a fixed time limit set by the
            admin. Break time is not counted in your worked hours.
          </p>

          <div className="mt-3 grid grid-cols-2 gap-2">
            {BREAK_TYPES.map((item) => (
              <button
                key={item.key}
                type="button"
                onClick={() => setType(item.key)}
                className={`rounded-md border px-3 py-2 text-[12px] font-medium transition ${
                  type === item.key
                    ? "border-amber-500/60 bg-amber-500/15 text-amber-300"
                    : "border-white/10 bg-[#121212] text-white/70 hover:border-white/25"
                }`}
              >
                {item.label}
                {allowances[item.key] != null && (
                  <span className="ml-1 text-white/45">
                    · {allowances[item.key]} min
                  </span>
                )}
              </button>
            ))}
          </div>

          <button
            type="button"
            onClick={() => onStart(type)}
            disabled={busy || state !== "in"}
            className="mt-3 flex w-full items-center justify-center gap-2 rounded-md border border-amber-500/40 bg-amber-500/10 py-2.5 text-[13px] font-semibold text-amber-300 transition hover:bg-amber-500/20 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {busy ? (
              <Loader2 size={15} className="animate-spin" />
            ) : (
              <Coffee size={15} />
            )}
            Take a Break
          </button>

          {overMinutes > 0 && (
            <p
              role="alert"
              className="mt-3 flex items-center gap-2 rounded-md border border-red-500/30 bg-red-500/10 px-3 py-2 text-[11.5px] text-red-300"
            >
              <AlertTriangle size={13} className="shrink-0" />
              Extra break time today: {overMinutes} min
            </p>
          )}
        </div>
      )}

      {error && (
        <p role="alert" className="mt-2 rounded border border-red-600/40 bg-red-600/10 px-3 py-2 text-[11px] text-red-300">
          {error}
        </p>
      )}
    </Card>
  );
};

export default BreakCard;