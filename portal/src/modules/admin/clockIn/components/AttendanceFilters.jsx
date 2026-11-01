import { Search } from "lucide-react";
import { FILTERS } from "./attendanceUtils";

const AttendanceFilters = ({ filter, onFilter, search, onSearch }) => (
  <div className="flex flex-wrap items-center justify-between gap-3 p-5">
    <div className="flex flex-wrap gap-2">
      {FILTERS.map((f) => (
        <button
          key={f.key}
          onClick={() => onFilter(f.key)}
          className={`rounded-lg border px-4 py-1.5 text-[12px] font-medium ${
            filter === f.key
              ? "border-red-500/70 bg-red-600/20 text-red-300"
              : "border-white/10 text-white/70 hover:text-white"
          }`}
        >
          {f.label}
        </button>
      ))}
    </div>

    <div className="relative w-full sm:w-64">
      <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-white/50" />
      <input
        value={search}
        onChange={(e) => onSearch(e.target.value)}
        placeholder="Search employee"
        className="w-full rounded-lg border border-white/20 bg-transparent py-2 pl-9 pr-3 text-[13px] text-white outline-none placeholder:text-white/40 focus:border-red-500/60"
      />
    </div>
  </div>
);

export default AttendanceFilters;
