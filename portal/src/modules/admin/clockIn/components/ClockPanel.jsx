import { Clock } from "lucide-react";
import RecentActivity from "./RecentActivity";
import { formatHours, formatTime, pad } from "./attendanceUtils";

const Mini = ({ label, value }) => (
  <div className="rounded-xl border border-white/10 bg-[#0e0e10] p-4">
    <p className="text-[12px] text-white/60">{label}</p>
    <p className="mt-2 text-xl font-bold text-white">{value}</p>
  </div>
);

const ClockPanel = ({ now, mode, shift, record, worked, recent, loading }) => {
  const h = now.getHours();
  const hh = pad(h % 12 || 12);
  const mm = pad(now.getMinutes());
  const ss = pad(now.getSeconds());
  const ap = h >= 12 ? "PM" : "AM";

  const statusText =
    mode === "in"
      ? "You have not clocked in yet today"
      : mode === "out"
      ? `You clocked in at ${formatTime(record?.clockInAt)}`
      : "You have completed today's attendance";

  return (
    <div
      className="rounded-3xl border border-white/10 p-6"
      style={{
        background:
          "radial-gradient(120% 90% at 100% 0%, rgba(185,28,28,0.45) 0%, rgba(23,23,26,0) 55%), #17171a",
      }}
    >
      <span className="inline-flex items-center gap-2 rounded-full border border-red-500/40 bg-red-600/10 px-4 py-2 text-[12px] font-semibold text-red-400">
        <Clock size={13} /> Shift {shift?.label || "9:00 AM – 6:00 PM"}
      </span>

      <div className="mt-6 flex items-baseline">
        <span className="text-6xl font-extrabold tracking-tight text-white sm:text-7xl">
          {hh}:{mm}
        </span>
        <span className="text-2xl font-extrabold text-red-500 sm:text-3xl">
          :{ss} {ap}
        </span>
      </div>
      <p className="mt-1 text-[14px] text-white/50">{statusText}</p>

      <div className="mt-6 grid grid-cols-3 gap-3">
        <Mini label="Clock In" value={record?.clockInAt ? formatTime(record.clockInAt) : "--:--"} />
        <Mini label="Clock Out" value={record?.clockOutAt ? formatTime(record.clockOutAt) : "--:--"} />
        <Mini label="Hours Today" value={formatHours(worked)} />
      </div>

      <RecentActivity items={recent} loading={loading} />
    </div>
  );
};

export default ClockPanel;