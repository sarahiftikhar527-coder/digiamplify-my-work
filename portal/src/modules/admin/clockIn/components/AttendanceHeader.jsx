
import { useState } from "react";
import {
  ArrowLeft,
  CalendarDays,
  FileSpreadsheet,
  FileText,
  LoaderCircle,
} from "lucide-react";

const getToday = () => {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, "0");
  const day = String(now.getDate()).padStart(2, "0");

  return `${year}-${month}-${day}`;
};

const AttendanceHeader = ({
  date = "",
  onDateChange = () => {},
  onExport = () => {},
  onBack = () => {},
  exporting = false,
}) => {
  const [period, setPeriod] = useState("daily");
  const [month, setMonth] = useState(getToday().slice(0, 7));

  const selectedDate = date || getToday();

  const handleExport = (format) => {
    onExport({
      format,
      period,
      date: selectedDate,
      month,
    });
  };

  return (
    <section className="mb-6 overflow-hidden rounded-2xl border border-white/10 bg-[#0d0d0d]">
      <div className="border-b-4 border-[#c1121f] px-5 py-6 sm:px-7">
        <div className="flex flex-wrap items-start justify-between gap-5">
          <div>
            <p className="text-[11px] font-bold tracking-[0.22em] text-red-500">
              ADMIN · ATTENDANCE
            </p>

            <h1 className="mt-2 text-3xl font-extrabold tracking-tight text-white sm:text-4xl">
              Attendance <span className="text-[#e11d2e]">Reports</span>
            </h1>

            <p className="mt-2 max-w-xl text-sm leading-6 text-white/55">
              Manage employee attendance and download professional reports
              for your selected reporting period.
            </p>
          </div>

          <button
            type="button"
            onClick={onBack}
            className="inline-flex items-center gap-2 rounded-lg border border-white/10 bg-white/5 px-4 py-3 text-sm font-medium text-white transition hover:bg-white/10"
          >
            <ArrowLeft size={16} />
            Back
          </button>
        </div>
      </div>

      <div className="flex flex-col gap-5 p-5 sm:p-6">
        <div>
          <p className="mb-3 text-xs font-bold uppercase tracking-wider text-white/55">
            Report period
          </p>

          <div className="grid max-w-md grid-cols-2 gap-2 rounded-xl border border-white/10 bg-black p-1">
            <button
              type="button"
              onClick={() => setPeriod("daily")}
              aria-pressed={period === "daily"}
              className={`rounded-lg px-4 py-3 text-sm font-semibold transition ${
                period === "daily"
                  ? "bg-[#c1121f] text-white shadow-lg"
                  : "text-white/60 hover:bg-white/5 hover:text-white"
              }`}
            >
              Daily Report
            </button>

            <button
              type="button"
              onClick={() => setPeriod("monthly")}
              aria-pressed={period === "monthly"}
              className={`rounded-lg px-4 py-3 text-sm font-semibold transition ${
                period === "monthly"
                  ? "bg-[#c1121f] text-white shadow-lg"
                  : "text-white/60 hover:bg-white/5 hover:text-white"
              }`}
            >
              Monthly Report
            </button>
          </div>
        </div>

        <div className="flex flex-wrap items-end gap-4">
          <label className="flex min-w-[220px] flex-col gap-2 text-xs font-semibold text-white/65">
            {period === "daily" ? "Select date" : "Select month"}

            <span className="flex items-center gap-3 rounded-lg border border-white/10 bg-[#151515] px-3 py-3">
              <CalendarDays size={17} className="shrink-0 text-red-500" />

              {period === "daily" ? (
                <input
                  type="date"
                  value={selectedDate}
                  onChange={(event) => onDateChange(event.target.value)}
                  className="w-full bg-transparent text-sm text-white outline-none [color-scheme:dark]"
                />
              ) : (
                <input
                  type="month"
                  value={month}
                  onChange={(event) => setMonth(event.target.value)}
                  className="w-full bg-transparent text-sm text-white outline-none [color-scheme:dark]"
                />
              )}
            </span>
          </label>

          <div className="flex flex-wrap gap-3">
            <button
              type="button"
              disabled={exporting}
              onClick={() => handleExport("xlsx")}
              className="inline-flex items-center justify-center gap-2 rounded-lg bg-[#176b43] px-5 py-3 text-sm font-semibold text-white transition hover:bg-[#218653] disabled:cursor-not-allowed disabled:opacity-50"
            >
              {exporting ? (
                <LoaderCircle size={17} className="animate-spin" />
              ) : (
                <FileSpreadsheet size={17} />
              )}
              Download Excel
            </button>

            <button
              type="button"
              disabled={exporting}
              onClick={() => handleExport("pdf")}
              className="inline-flex items-center justify-center gap-2 rounded-lg bg-[#c1121f] px-5 py-3 text-sm font-semibold text-white transition hover:bg-[#e01b2b] disabled:cursor-not-allowed disabled:opacity-50"
            >
              {exporting ? (
                <LoaderCircle size={17} className="animate-spin" />
              ) : (
                <FileText size={17} />
              )}
              Download PDF
            </button>
          </div>
        </div>

        <p className="text-xs leading-5 text-white/40">
          {period === "daily"
            ? "The report uses attendance records for the selected date and current search/status filters."
            : "The monthly report requests attendance records for each day of the selected month using the current search/status filters."}
        </p>
      </div>
    </section>
  );
};

export default AttendanceHeader;
