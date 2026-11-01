import StatusBadge from "../StatusBadge";
import { formatTime } from "../../../../../utils/time";

const LiveClock = ({ now, status }) => (
  <div
    className="mx-auto flex aspect-square w-44 items-center justify-center rounded-full border-2 border-red-600 sm:w-56"
    style={{ boxShadow: "0 0 30px rgba(220,38,38,.45), inset 0 0 30px rgba(220,38,38,.25)" }}
    role="timer"
    aria-live="off"
  >
    <div className="text-center">
      <p className="whitespace-nowrap text-2xl font-medium tabular-nums text-white sm:text-3xl">{formatTime(now)}</p>
      <StatusBadge status={status} className="mt-4" />
    </div>
  </div>
);

export default LiveClock;