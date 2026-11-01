
import { ArrowLeft, CalendarDays, Download } from "lucide-react";
import { formatDate } from "./attendanceUtils";

const ClockInHeader = ({
  date = "",
  onDateChange = () => {},
  onExport = () => {},
  onBack = () => {},
}) => {
  return (
    <div className="mb-6 flex flex-wrap items-start justify-between gap-4">
      <div>
        <p className="text-[11px] font-bold tracking-[0.2em] text-red-500">
          ADMIN · ATTENDANCE
        </p>

        <h1 className="mt-2 text-3xl font-bold text-white sm:text-4xl">
          Clock In <span className="text-red-500">Overview</span>
        </h1>

        <p className="mt-1 text-[13px] text-white/60">
          {date ? formatDate(date) : "Attendance overview"} · Live attendance of all employees
        </p>
      </div>

      <div className="flex flex-wrap items-center gap-3">
        <button
          type="button"
          onClick={onBack}
          className="flex items-center gap-2 rounded-lg border border-white/10 bg-white/5 px-4 py-3 text-[13px] font-medium text-white hover:bg-white/10"
        >
          <ArrowLeft size={15} />
          Back to Clock In
        </button>

        <label className="flex items-center gap-2 rounded-lg border border-white/10 bg-[#111] px-4 py-2.5 text-[13px] text-white/90">
          <CalendarDays size={15} className="text-red-500" />

          <input
            type="date"
            value={date}
            onChange={(event) => onDateChange(event.target.value)}
            className="bg-transparent text-white outline-none [color-scheme:dark]"
          />
        </label>

        <button
          type="button"
          onClick={onExport}
          className="flex items-center gap-2 rounded-lg bg-red-600 px-5 py-3 text-[13px] font-semibold text-white hover:bg-red-500"
        >
          <Download size={15} />
          Export Report
        </button>
      </div>
    </div>
  );
};

export default ClockInHeader;
