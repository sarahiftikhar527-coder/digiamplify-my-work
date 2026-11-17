import { Gauge } from "lucide-react";
import Card from "../Card";
import {
  formatDuration,
  formatHHmm,
  formatTime,
} from "../../../../../utils/time";

const DAY_NAMES = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

const describeDays = (days = []) => {
  const key = [...days].sort((a, b) => a - b).join(",");

  if (key === "1,2,3,4,5") return "Mon – Fri";
  if (key === "1,2,3,4,5,6") return "Mon – Sat";
  if (key === "0,1,2,3,4,5,6") return "Every day";

  return [...days].sort((a, b) => a - b).map((d) => DAY_NAMES[d]).join(", ");
};

const Progress = ({ label, period, extra }) => {
  const target = period?.targetMinutes || 0;
  const worked = (period?.workedMinutes || 0) + extra;
  const remaining = Math.max(0, target - worked);
  const over = Math.max(0, worked - target);
  const percent = target > 0 ? Math.min(100, Math.round((worked / target) * 100)) : 0;
  const done = target > 0 && worked >= target;

  return (
    <div className="rounded-lg border border-white/10 bg-[#121212] p-3">
      <div className="flex items-center justify-between gap-2">
        <span className="text-[12px] font-semibold text-white">{label}</span>
        <span className="text-[11px] tabular-nums text-white/60">
          {formatDuration(worked)} / {formatDuration(target)}
        </span>
      </div>

      <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-white/10">
        <div
          className={`h-full rounded-full transition-all ${
            done ? "bg-green-500" : "bg-[#c1121f]"
          }`}
          style={{ width: `${percent}%` }}
        />
      </div>

      <p className="mt-1.5 text-[11px] text-white/50">
        {target === 0
          ? "No working time is required"
          : done
            ? over > 0
              ? `Target completed · ${formatDuration(over)} extra`
              : "Target completed"
            : `${formatDuration(remaining)} remaining`}
      </p>
    </div>
  );
};

const HoursCard = ({ hours, state = "out", now, loading }) => {
  if (!hours) {
    return (
      <Card icon={Gauge} title="Working Hours">
        <p className={`text-[12px] text-white/50 ${loading ? "animate-pulse" : ""}`}>
          {loading ? "Loading your hours..." : "Working hours are not available yet."}
        </p>
      </Card>
    );
  }

  const schedule = hours.schedule || {};

  // Time that passed since the server calculated these numbers.
  const extra =
    state === "in" && hours.asOf
      ? Math.max(
          0,
          Math.floor((new Date(now).getTime() - new Date(hours.asOf).getTime()) / 60000)
        )
      : 0;

  const todayTarget = hours.today?.targetMinutes || 0;
  const todayWorked = (hours.today?.workedMinutes || 0) + extra;
  const todayRemaining = Math.max(0, todayTarget - todayWorked);

  const finishAt =
    state === "in" && todayRemaining > 0
      ? new Date(new Date(now).getTime() + todayRemaining * 60000)
      : null;

  const scheduleText =
    schedule.startTime && schedule.endTime
      ? `${formatHHmm(schedule.startTime)} – ${formatHHmm(schedule.endTime)}`
      : "Flexible hours";

  return (
    <Card icon={Gauge} title="Working Hours">
      <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-[11.5px] text-white/60">
        <span>
          <span className="text-white/40">Schedule: </span>
          <span className="font-medium text-white">{scheduleText}</span>
        </span>
        <span>
          <span className="text-white/40">Daily: </span>
          <span className="font-medium text-white">
            {formatDuration(schedule.dailyTargetMinutes)}
          </span>
        </span>
        <span>
          <span className="text-white/40">Days: </span>
          <span className="font-medium text-white">
            {describeDays(schedule.workDays)}
          </span>
        </span>
      </div>

      <div className="mt-3 grid gap-2.5">
        <Progress label="Today" period={hours.today} extra={extra} />
        <Progress label="This Week" period={hours.week} extra={extra} />
        <Progress label="This Month" period={hours.month} extra={extra} />
      </div>

      <p className="mt-3 rounded-md border border-white/10 bg-white/[0.03] px-3 py-2 text-[11.5px] text-white/60">
        {finishAt ? (
          <>
            At this pace you will complete today&apos;s hours at about{" "}
            <strong className="text-white">{formatTime(finishAt)}</strong>.
          </>
        ) : state === "out" && todayRemaining > 0 ? (
          <>
            Clock in to continue. You still have{" "}
            <strong className="text-white">{formatDuration(todayRemaining)}</strong>{" "}
            to complete today.
          </>
        ) : todayTarget > 0 && todayRemaining === 0 ? (
          "Today's working hours are complete."
        ) : (
          "Your hours are counted from the time you actually clock in."
        )}{" "}
        Late start? Just finish later. Only your total hours matter.
      </p>
    </Card>
  );
};

export default HoursCard;