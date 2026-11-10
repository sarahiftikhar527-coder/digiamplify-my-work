import { Clock } from "lucide-react";
import Card from "../Card";
import { formatDuration, formatTime } from "../../../../../utils/time";
import {
  getBreakLabel,
  getSessionWorkedMinutes,
} from "../../../../../utils/attendanceSessions";

const SessionsCard = ({ sessions = [], now, loading }) => (
  <Card icon={Clock} title="Today's Sessions">
    <div className={loading ? "animate-pulse opacity-60" : ""}>
      {sessions.length === 0 ? (
        <p className="py-2 text-[12px] text-white/50">
          No clock-ins yet today.
        </p>
      ) : (
        <ul className="space-y-2.5">
          {sessions.map((session, index) => {
            const open = !session.clockOutAt;

            return (
              <li
                key={session.id}
                className="rounded-lg border border-white/10 bg-[#121212] p-3"
              >
                <div className="flex items-center justify-between gap-2 text-[12px]">
                  <span className="font-semibold text-white">
                    Session {index + 1}
                  </span>

                  <span
                    className={`rounded-full border px-2.5 py-0.5 text-[10px] font-medium ${
                      open
                        ? "border-green-500/40 bg-green-500/10 text-green-400"
                        : "border-white/15 text-white/60"
                    }`}
                  >
                    {open ? "Working" : "Completed"}
                  </span>
                </div>

                <p className="mt-1.5 text-[12px] tabular-nums text-white/70">
                  In {formatTime(session.clockInAt)} → Out{" "}
                  {open ? "--:--" : formatTime(session.clockOutAt)}
                  <span className="ml-2 text-white/50">
                    ({formatDuration(getSessionWorkedMinutes(session, now))}{" "}
                    worked)
                  </span>
                </p>

                {(session.breaks || []).map((item) => (
                  <p
                    key={item.id}
                    className="mt-1 pl-3 text-[11px] tabular-nums text-amber-300/90"
                  >
                    {getBreakLabel(item.type)} {formatTime(item.startAt)} –{" "}
                    {item.endAt ? formatTime(item.endAt) : "now"} (
                    {formatDuration(item.minutes)})
                  </p>
                ))}
              </li>
            );
          })}
        </ul>
      )}
    </div>
  </Card>
);

export default SessionsCard;