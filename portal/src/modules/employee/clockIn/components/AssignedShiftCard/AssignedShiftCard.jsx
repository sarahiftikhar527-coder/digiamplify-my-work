import { CalendarDays, Clock, Coffee, Timer } from "lucide-react";
import Card from "../Card";
import { formatDuration, formatHHmm, getShiftBreakMinutes, getShiftTotalMinutes } from "../../../../../utils/time";

/* ---------- helpers ---------- */

// "2026-10-31" ya ISO date ko local din ki shuruaat (00:00) mein badalta hai
const toDay = (value) => {
  if (!value) return null;
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return null;
  d.setHours(0, 0, 0, 0);
  return d;
};

const formatDay = (value) => {
  const d = toDay(value);
  return d
    ? d.toLocaleDateString("en-GB", { day: "numeric", month: "short" })
    : "";
};

// backend ke alag-alag field names handle karne ke liye
const getStart = (s) => s.startDate ?? s.fromDate ?? s.from ?? s.date;
const getEnd = (s) => s.endDate ?? s.toDate ?? s.to ?? s.date;

const isCompleted = (s) =>
  Boolean(
    s.completed ||
      s.isCompleted ||
      s.completedAt ||
      ["completed", "complete", "done"].includes(String(s.status || "").toLowerCase())
  );

// shift tab dikhegi jab aaj ki date range ke andar ho aur complete na ho
const isActiveToday = (s, today) => {
  if (isCompleted(s)) return false;

  const start = toDay(getStart(s));
  const end = toDay(getEnd(s));

  if (start && today < start) return false;
  if (end && today > end) return false;

  return true;
};

/* ---------- UI ---------- */

const Row = ({ icon: Icon, label, value, last }) => (
  <div className={`flex items-start gap-3 py-3 ${last ? "" : "border-b border-white/10"}`}>
    <Icon size={15} className="mt-0.5 shrink-0 text-red-500" />
    <div className="min-w-0">
      <p className="text-[11px] text-white/50">{label}</p>
      <p className="mt-0.5 text-[12.5px] font-semibold text-white">{value}</p>
    </div>
  </div>
);

const ShiftBlock = ({ shift, index, showLabel }) => {
  const breakMin = getShiftBreakMinutes(shift);

  const start = formatDay(getStart(shift));
  const end = formatDay(getEnd(shift));
  const dateRange = start && end ? (start === end ? start : `${start} - ${end}`) : "";

  return (
    <div className={index > 0 ? "mt-3 border-t border-white/20 pt-3" : ""}>
      {(showLabel || dateRange) && (
        <div className="flex items-center justify-between gap-2">
          {showLabel ? (
            <p className="text-[10.5px] font-semibold uppercase tracking-wider text-red-500">
              Shift {index + 1}
            </p>
          ) : (
            <span />
          )}

          {dateRange && (
            <p className="text-[10.5px] font-medium text-white/50">{dateRange}</p>
          )}
        </div>
      )}

      <Row
        icon={Clock}
        label="Shift Time"
        value={`${formatHHmm(shift.startTime)} - ${formatHHmm(shift.endTime)}`}
      />
     
   
    </div>
  );
};

const AssignedShiftCard = ({ shift, loading }) => {
  const today = toDay(new Date());

  // shift object ho ya array, dono chalenge
  const shifts = (Array.isArray(shift) ? shift : shift ? [shift] : [])
    .filter((s) => s?.startTime)
    .filter((s) => isActiveToday(s, today))
    .sort((a, b) => String(a.startTime).localeCompare(String(b.startTime)));

  if (loading) {
    return (
      <Card icon={CalendarDays} title="Assigned Shift">
        <div className="animate-pulse space-y-4 py-2">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="h-8 rounded bg-white/5" />
          ))}
        </div>
      </Card>
    );
  }

  if (shifts.length === 0) {
    return (
      <Card icon={CalendarDays} title="Assigned Shift">
        <p className="py-4 text-[12px] text-white/50">No shift assigned for today.</p>
      </Card>
    );
  }

  return (
    <Card icon={CalendarDays} title="Assigned Shift">
      <div
        className="
          max-h-[200px] overflow-y-auto pr-1
          [&::-webkit-scrollbar]:w-1
          [&::-webkit-scrollbar-track]:bg-transparent
          [&::-webkit-scrollbar-thumb]:rounded-full
          [&::-webkit-scrollbar-thumb]:bg-white/20
          hover:[&::-webkit-scrollbar-thumb]:bg-red-600/60
        "
      >
        {shifts.map((s, i) => (
          <ShiftBlock
            key={s.id || s._id || i}
            shift={s}
            index={i}
            showLabel={shifts.length > 1}
          />
        ))}
      </div>
    </Card>
  );
};

export default AssignedShiftCard;