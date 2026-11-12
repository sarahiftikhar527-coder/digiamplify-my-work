import { useState } from "react";
import { Clock, FileText, Network } from "lucide-react";

import MyClockIn from "../../components/MyClockIn";
import AttendanceOverview from "../../components/AttendanceOverview";
import { TeamLiveBoard } from "@/shared/teamLive";
import { formatDateLong } from "../../../../../utils/time";

// Three views: the admin's own clock in (with today's live team), the full
// live hierarchy board, and the attendance reports.
const TABS = [
  { key: "clockin", label: "Clock In", icon: Clock },
  { key: "live", label: "Live Hierarchy", icon: Network },
  { key: "attendance", label: "Attendance Reports", icon: FileText },
];

const AdminClockInPage = () => {
  const [view, setView] = useState("clockin");

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
      </div>

      {view === "attendance" ? (
        <AttendanceOverview onBack={() => setView("clockin")} />
      ) : view === "live" ? (
        <TeamLiveBoard mode="admin" embedded />
      ) : (
        <MyClockIn />
      )}
    </div>
  );
};

export default AdminClockInPage;