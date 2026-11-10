import { Timer } from "lucide-react";
import Card from "../Card";
import {
  formatClock,
  getDayTotals,
  getLiveWorkedSeconds,
} from "../../../../../utils/attendanceSessions";

const STATE = {
  in: { label: "Working", cls: "border-green-500/40 bg-green-500/10 text-green-400" },
  break: { label: "On Break", cls: "border-amber-500/40 bg-amber-500/10 text-amber-400" },
  out: { label: "Clocked Out", cls: "border-white/15 bg-white/5 text-white/60" },
};

const WorkTimerCard = ({ sessions = [], state = "out", now }) => {
  const seconds = getLiveWorkedSeconds(sessions, now);
  const totals = getDayTotals(sessions, now);
  const current = STATE[state] || STATE.out;

  return (
    <Card icon={Timer} title="Work Timer">
      <div className="text-center">
        <span className={`inline-block rounded-full border px-3 py-1 text-[11px] font-medium ${current.cls}`}>
          {current.label}
        </span>

        <p className="mt-3 text-[38px] font-bold leading-none tabular-nums text-white">
          {formatClock(seconds)}
        </p>

        <p className="mt-2 text-[11px] text-white/50">
          Worked today (breaks not counted)
        </p>

        <div className="mt-4 grid grid-cols-3 gap-2 text-center">
          <div className="rounded-lg border border-white/10 bg-[#121212] py-2">
            <p className="text-[15px] font-semibold text-white">{totals.clockIns}</p>
            <p className="text-[10px] text-white/50">Clock Ins</p>
          </div>
          <div className="rounded-lg border border-white/10 bg-[#121212] py-2">
            <p className="text-[15px] font-semibold text-white">{totals.clockOuts}</p>
            <p className="text-[10px] text-white/50">Clock Outs</p>
          </div>
          <div className="rounded-lg border border-white/10 bg-[#121212] py-2">
            <p className="text-[15px] font-semibold text-white">{totals.breakCount}</p>
            <p className="text-[10px] text-white/50">Breaks</p>
          </div>
        </div>
      </div>
    </Card>
  );
};

export default WorkTimerCard;