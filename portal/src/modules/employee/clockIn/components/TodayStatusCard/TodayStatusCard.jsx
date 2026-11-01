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

const TodayStatusCard = ({ status, record, worked, loading }) => {
  const clockIn = record?.clockInAt;
  const clockOut = record?.clockOutAt;
  const muted = "font-medium tabular-nums text-white/50";

  return (
    <Card icon={CalendarCheck} title="Today's Status">
      <div className={loading ? "animate-pulse opacity-60" : ""}>
        <Row label="Status">
          <StatusBadge status={status} withDot={false} />
        </Row>
        <Row label="Clock In">
          <span className={clockIn ? "font-semibold tabular-nums text-green-400" : muted}>{formatTime(clockIn)}</span>
        </Row>
        <Row label="Clock Out">
          <span className={clockOut ? "font-semibold tabular-nums text-green-400" : muted}>{formatTime(clockOut)}</span>
        </Row>
        <Row label="Worked Hours">
          <span className={worked != null ? "font-semibold tabular-nums text-white" : muted}>{formatDuration(worked)}</span>
        </Row>
        <Row label="Break Hours" last>
          <span className={record?.breakMinutes != null ? "font-semibold tabular-nums text-white" : muted}>
            {formatDuration(record?.breakMinutes)}
          </span>
        </Row>
      </div>
    </Card>
  );
};

export default TodayStatusCard;