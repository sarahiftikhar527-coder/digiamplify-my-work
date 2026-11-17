
import { useEffect, useRef } from "react";
import {
  AlertTriangle,
  Coffee,
  Loader2,
  Play,
} from "lucide-react";

import Card from "../Card";
import { formatTime } from "../../../../../utils/time";
import { formatClock } from "../../../../../utils/attendanceSessions";

const elapsedSeconds = (from, now) =>
  Math.max(
    0,
    Math.floor(
      (new Date(now).getTime() - new Date(from).getTime()) / 1000
    )
  );

const getBreakSeconds = (item, now) => {
  if (!item?.startAt) {
    return Math.max(0, Number(item?.minutes || 0) * 60);
  }

  const start = new Date(item.startAt).getTime();
  const end = item.endAt
    ? new Date(item.endAt).getTime()
    : new Date(now).getTime();

  if (!Number.isFinite(start) || !Number.isFinite(end)) {
    return Math.max(0, Number(item.minutes || 0) * 60);
  }

  return Math.max(0, Math.floor((end - start) / 1000));
};

const BreakCard = ({
  state,
  openBreak,
  now,
  busy,
  error,
  breakAllowanceMinutes,
  breakUsedMinutes = 0,
  breakUsedSeconds,
  breakRemainingMinutes,
  breakOverMinutes = 0,
  breaks = [],
  onStart,
  onEnd,
}) => {
  const notifiedRef = useRef(false);

  const onBreak = state === "break";

  const allowanceIsSet =
    breakAllowanceMinutes !== null &&
    breakAllowanceMinutes !== undefined;

  const allowance = allowanceIsSet
    ? Math.max(0, Number(breakAllowanceMinutes) || 0)
    : null;

  const allowanceSeconds = (allowance ?? 0) * 60;

  const elapsed = openBreak
    ? elapsedSeconds(openBreak.startAt, now)
    : 0;

  const usedSeconds = Math.max(
    0,
    Number(
      breakUsedSeconds !== undefined
        ? breakUsedSeconds
        : Number(breakUsedMinutes || 0) * 60
    ) || 0
  );

  const remainingSeconds = allowanceIsSet
    ? Math.max(0, allowanceSeconds - usedSeconds)
    : 0;

  const extraSeconds = allowanceIsSet
    ? Math.max(0, usedSeconds - allowanceSeconds)
    : 0;

  const displayedExtraMinutes = Math.ceil(extraSeconds / 60);
  const exceeded = onBreak && extraSeconds > 0;

  const breakHistory = [...breaks].sort(
    (a, b) =>
      new Date(b.startAt || 0).getTime() -
      new Date(a.startAt || 0).getTime()
  );

  useEffect(() => {
    if (!onBreak || !exceeded || notifiedRef.current) {
      return;
    }

    notifiedRef.current = true;

    if (
      typeof window !== "undefined" &&
      "Notification" in window &&
      Notification.permission === "granted"
    ) {
      new Notification("Daily break allowance finished", {
        body: "Your daily break allowance has been used. Extra break time is now being recorded.",
        icon: "/favicon.ico",
      });
    }
  }, [onBreak, exceeded]);

  useEffect(() => {
    if (!onBreak) {
      notifiedRef.current = false;
    }
  }, [onBreak]);

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
            On Break · Daily allowance:{" "}
            {allowanceIsSet ? `${allowance} min` : "Not set"}
          </p>

          <p className="mt-1 text-[30px] font-bold tabular-nums text-white">
            {formatClock(elapsed)}
          </p>

          <p className="text-[11px] text-white/50">
            Started at {formatTime(openBreak?.startAt)}
          </p>

          <div className="mt-4 grid grid-cols-2 gap-2">
            <div className="rounded-md bg-black/20 p-3">
              <p className="text-[11px] text-white/50">
                Daily allowance
              </p>
              <p className="mt-1 text-lg font-semibold text-white">
                {allowanceIsSet ? `${allowance} min` : "Not set"}
              </p>
            </div>

            <div className="rounded-md bg-black/20 p-3">
              <p className="text-[11px] text-white/50">
                Total used today
              </p>
              <p className="mt-1 text-lg font-semibold text-white tabular-nums">
                {formatClock(usedSeconds)}
              </p>
            </div>

            <div className="rounded-md bg-black/20 p-3">
              <p className="text-[11px] text-white/50">
                Remaining today
              </p>
              <p className="mt-1 text-lg font-semibold text-amber-300 tabular-nums">
                {formatClock(remainingSeconds)}
              </p>
            </div>

            <div className="rounded-md bg-black/20 p-3">
              <p className="text-[11px] text-white/50">
                Extra time
              </p>
              <p className="mt-1 text-lg font-semibold text-red-300 tabular-nums">
                {formatClock(extraSeconds)}
              </p>
            </div>
          </div>

          {exceeded ? (
            <div
              role="alert"
              className="mt-3 flex items-start gap-2 rounded-md border border-red-500/40 bg-red-500/15 px-3 py-3 text-left text-[12px] text-red-200"
            >
              <AlertTriangle size={16} className="mt-0.5 shrink-0" />
              <span>
                Your daily break allowance has been used. Any additional
                break time is being recorded as extra time.
              </span>
            </div>
          ) : (
            <p className="mt-3 text-[12px] text-amber-200">
              Your break timer is running. Your remaining daily allowance
              updates while you are on break.
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
            End Break & Resume Work
          </button>
        </div>
      ) : (
        <div>
          <p className="text-[12px] text-white/60">
            Your break allowance is shared across all breaks during the
            attendance day. You can take multiple breaks of any duration.
          </p>

          <div className="mt-3 grid grid-cols-2 gap-2">
            <div className="rounded-md border border-amber-500/25 bg-amber-500/10 p-3">
              <p className="text-[11px] text-amber-200/70">
                Daily allowance
              </p>
              <p className="mt-1 text-xl font-bold text-amber-300">
                {allowanceIsSet ? `${allowance} min` : "Not set"}
              </p>
            </div>

            <div className="rounded-md border border-white/10 bg-white/[0.03] p-3">
              <p className="text-[11px] text-white/50">
                Total used today
              </p>
              <p className="mt-1 text-xl font-bold text-white tabular-nums">
                {formatClock(usedSeconds)}
              </p>
            </div>

            <div className="rounded-md border border-white/10 bg-white/[0.03] p-3">
              <p className="text-[11px] text-white/50">
                Remaining today
              </p>
              <p className="mt-1 text-xl font-bold text-emerald-300 tabular-nums">
                {allowanceIsSet
                  ? formatClock(remainingSeconds)
                  : "—"}
              </p>
            </div>

            <div className="rounded-md border border-white/10 bg-white/[0.03] p-3">
              <p className="text-[11px] text-white/50">
                Extra time
              </p>
              <p className="mt-1 text-xl font-bold text-red-300 tabular-nums">
                {formatClock(extraSeconds)}
              </p>
            </div>
          </div>

          {!allowanceIsSet && (
            <p className="mt-3 rounded-md border border-amber-500/30 bg-amber-500/10 px-3 py-2 text-[12px] text-amber-200">
              Your daily break allowance has not been assigned yet.
              Please contact your admin before taking a break.
            </p>
          )}

          <button
            type="button"
            onClick={() => onStart("")}
            disabled={
              busy ||
              state !== "in" ||
              !allowanceIsSet ||
              allowance <= 0
            }
            className="mt-3 flex w-full items-center justify-center gap-2 rounded-md border border-amber-500/40 bg-amber-500/10 py-2.5 text-[13px] font-semibold text-amber-300 transition hover:bg-amber-500/20 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {busy ? (
              <Loader2 size={15} className="animate-spin" />
            ) : (
              <Coffee size={15} />
            )}
            Take Break
          </button>

          {breakHistory.length > 0 && (
            <div className="mt-4 border-t border-white/10 pt-4">
              <div className="mb-3 flex items-center justify-between gap-2">
                <p className="text-[12px] font-semibold text-white">
                  Today's Break History
                </p>
                <span className="text-[11px] text-white/40">
                  {breakHistory.length}{" "}
                  {breakHistory.length === 1 ? "break" : "breaks"}
                </span>
              </div>

              <div className="space-y-2">
                {breakHistory.map((item, index) => {
                  const duration = getBreakSeconds(item, now);

                  return (
                    <div
                      key={item.id || `${item.startAt}-${index}`}
                      className="rounded-md border border-white/10 bg-white/[0.03] p-3"
                    >
                      <div className="flex items-center justify-between gap-3">
                        <p className="text-[12px] font-medium text-white/80">
                          Break {breakHistory.length - index}
                          {!item.endAt && (
                            <span className="ml-2 text-amber-300">
                              Ongoing
                            </span>
                          )}
                        </p>

                        <p className="text-[12px] font-semibold tabular-nums text-white">
                          {formatClock(duration)}
                        </p>
                      </div>

                      <p className="mt-1 text-[11px] text-white/45">
                        {formatTime(item.startAt)} –{" "}
                        {item.endAt
                          ? formatTime(item.endAt)
                          : "Ongoing"}
                      </p>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {displayedExtraMinutes > 0 && (
            <p
              role="alert"
              className="mt-3 flex items-center gap-2 rounded-md border border-red-500/30 bg-red-500/10 px-3 py-2 text-[11.5px] text-red-300"
            >
              <AlertTriangle size={13} className="shrink-0" />
              Extra break time today: {formatClock(extraSeconds)}
            </p>
          )}
        </div>
      )}

      {error && (
        <p
          role="alert"
          className="mt-2 rounded border border-red-600/40 bg-red-600/10 px-3 py-2 text-[11px] text-red-300"
        >
          {error}
        </p>
      )}
    </Card>
  );
};

export default BreakCard;
