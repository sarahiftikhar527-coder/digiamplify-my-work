import { useState } from "react";
import { Clock, FileText, Network } from "lucide-react";

import MyClockIn from "../../components/MyClockIn";
import AttendanceOverview from "../../components/AttendanceOverview";
import { TeamLiveBoard } from "@/shared/teamLive";

// Three views: the admin's own clock-in, the live team board, and reports.
const TABS = [
  { key: "clockin", label: "My Clock In", icon: Clock },
  { key: "live", label: "Live Team", icon: Network },
  { key: "attendance", label: "Attendance Reports", icon: FileText },
];

const AdminClockInPage = () => {
  const [view, setView] = useState("clockin");

  return (
    <div className="w-full">
      <div className="mb-5 flex flex-wrap gap-1 rounded-xl border border-white/10 bg-[#0d0d0d] p-1">
        {TABS.map(({ key, label, icon: Icon }) => (
          <button
            key={key}
            type="button"
            onClick={() => setView(key)}
            aria-pressed={view === key}
            className={`flex items-center gap-2 rounded-lg px-4 py-2.5 text-[13px] font-semibold transition ${
              view === key
                ? "bg-[#c1121f] text-white shadow-lg"
                : "text-white/60 hover:bg-white/5 hover:text-white"
            }`}
          >
            <Icon size={15} />
            {label}
          </button>
        ))}
      </div>

      {view === "attendance" ? (
        <AttendanceOverview onBack={() => setView("clockin")} />
      ) : view === "live" ? (
        <TeamLiveBoard mode="admin" embedded />
      ) : (
        <MyClockIn onViewAttendance={() => setView("attendance")} />
      )}
    </div>
  );
};

export default AdminClockInPage;