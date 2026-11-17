import { CalendarCheck } from "lucide-react";
import Card from "../Card";
import StatusBadge from "../StatusBadge";
import { formatDuration, formatTime } from "../../../../../utils/time";

const Row = ({ label, children, last }) => (
  <div className={`flex items-center justify-between gap-3 py-3 text-[12px] ${last ? "" : "border-b border-white/10"}`}>
    <span className="text-white/60">{label}</span>
    {children}
  </div>
);

const STATE = {
  in: { label: "Working", cls: "border-green-500/40 bg-green-500/10 text-green-400" },
  break: { label: "On Break", cls: "border-amber-500/40 bg-amber-500/10 text-amber-400" },
  out: { label: "Clocked Out", cls: "border-white/15 bg-white/5 text-white/60" },
};

const TodayStatusCard = ({ status, record, totals, state = "out", loading }) => {
  const clockIn = record?.clockInAt;
  const clockOut = record?.clockOutAt;
  const muted = "font-medium tabular-nums text-white/50";
  const current = STATE[state] || STATE.out;
  const hasData = Boolean(clockIn);
  const over = totals?.breakOverMinutes ?? 0;

  return (
    <Card icon={CalendarCheck} title="Today's Status">
      <div className={loading ? "animate-pulse opacity-60" : ""}>
        <Row label="Status">
          <StatusBadge status={status} withDot={false} />
        </Row>
        <Row label="Right Now">
          <span className={`rounded-full border px-3 py-1 text-[11px] font-medium ${current.cls}`}>
            {current.label}
          </span>
        </Row>
        <Row label="First Clock In">
          <span className={clockIn ? "font-semibold tabular-nums text-green-400" : muted}>{formatTime(clockIn)}</span>
        </Row>
        <Row label="Last Clock Out">
          <span className={clockOut ? "font-semibold tabular-nums text-green-400" : muted}>{formatTime(clockOut)}</span>
        </Row>
        <Row label="Clock Ins / Outs">
          <span className={hasData ? "font-semibold tabular-nums text-white" : muted}>
            {hasData ? `${totals?.clockIns ?? 0} / ${totals?.clockOuts ?? 0}` : "-- / --"}
          </span>
        </Row>
        <Row label="Breaks">
          <span className={hasData ? "font-semibold tabular-nums text-white" : muted}>
            {hasData
              ? `${totals?.breakCount ?? 0} · ${formatDuration(totals?.breakMinutes ?? 0)}`
              : "--"}
          </span>
        </Row>
        <Row label="Extra Break Time">
          <span
            className={
              over > 0
                ? "font-semibold tabular-nums text-red-400"
                : hasData
                  ? "font-semibold tabular-nums text-white"
                  : muted
            }
          >
            {hasData ? formatDuration(over) : "--"}
          </span>
        </Row>
        <Row label="Worked Hours" last>
          <span className={hasData ? "font-semibold tabular-nums text-white" : muted}>
            {hasData ? formatDuration(totals?.workedMinutes ?? 0) : formatDuration(null)}
          </span>
        </Row>
      </div>
    </Card>
  );
};

export default TodayStatusCard;