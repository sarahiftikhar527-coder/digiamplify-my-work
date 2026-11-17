
import { useState } from "react";
import { Clock, FileText, SlidersHorizontal } from "lucide-react";

import MyClockIn from "../../components/MyClockIn";
import AttendanceOverview from "../../components/AttendanceOverview";
import AttendanceRulesModal from "../../components/AttendanceRulesModal";
import { formatDateLong } from "../../../../../utils/time";

const TABS = [
  { key: "clockin", label: "Clock In", icon: Clock },
  { key: "attendance", label: "Attendance Reports", icon: FileText },
];

const AdminClockInPage = () => {
  const [view, setView] = useState("clockin");
  const [rulesOpen, setRulesOpen] = useState(false);

  return (
    <div className="w-full">
      <div className="mb-5 flex flex-wrap items-end justify-between gap-3">
        <div>
          <p className="text-[11px] font-bold tracking-[0.2em] text-red-500">
            ADMIN · ATTENDANCE
          </p>

          <h1 className="mt-1.5 text-2xl font-bold text-white sm:text-3xl">
            Clock <span className="text-red-500">In</span>
          </h1>

          <p className="mt-1 text-[12px] text-white/55">
            {formatDateLong(new Date())}
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <div
            role="tablist"
            className="flex flex-wrap gap-1 rounded-xl border border-white/10 bg-[#0d0d0d] p-1"
          >
            {TABS.map(({ key, label, icon: Icon }) => (
              <button
                key={key}
                type="button"
                role="tab"
                aria-selected={view === key}
                onClick={() => setView(key)}
                className={`flex items-center gap-2 rounded-lg px-3.5 py-2 text-[12.5px] font-semibold transition ${
                  view === key
                    ? "bg-[#c1121f] text-white shadow-lg"
                    : "text-white/60 hover:bg-white/5 hover:text-white"
                }`}
              >
                <Icon size={14} />
                {label}
              </button>
            ))}
          </div>

          <button
            type="button"
            onClick={() => setRulesOpen(true)}
            className="flex items-center gap-2 rounded-xl border border-white/10 bg-[#0d0d0d] px-3.5 py-2.5 text-[12.5px] font-semibold text-white/80 transition hover:border-white/25 hover:text-white"
          >
            <SlidersHorizontal size={14} />
            Attendance Rules
          </button>
        </div>
      </div>

      {view === "attendance" ? (
        <AttendanceOverview onBack={() => setView("clockin")} />
      ) : (
        <MyClockIn />
      )}

      {rulesOpen && (
        <AttendanceRulesModal onClose={() => setRulesOpen(false)} />
      )}
    </div>
  );
};

export default AdminClockInPage;
