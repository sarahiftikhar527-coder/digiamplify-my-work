
import { useState } from "react";
import useAttendanceOverview from "../../../../hooks/useAttendanceOverview.js";
import {
  AttendanceDetailsModal,
  AttendanceFilters,
  AttendanceHeader,
  AttendanceStats,
  AttendanceTable,
} from "./index";
import ManageEmployeesModal from "./ManageEmployeesModal.jsx";

const AttendanceOverview = ({ onBack }) => {
  const a = useAttendanceOverview();
  const [selected, setSelected] = useState(null);
  const [showEmployees, setShowEmployees] = useState(false);

  return (
    <div className="w-full">
      <AttendanceHeader
        date={a.date}
        onDateChange={a.setDate}
        onExport={a.exportReport}
        onBack={onBack}
        exporting={a.exporting}
      />

      {(a.error || a.exportError) && (
        <div className="mb-4 flex items-center justify-between gap-3 rounded-lg border border-red-600/40 bg-red-600/10 px-4 py-3 text-[12px] text-red-300">
          <span>{a.exportError || a.error}</span>

          <button
            type="button"
            onClick={() => {
              if (a.exportError) {
                a.exportReport({
                  format: "xlsx",
                  period: "daily",
                  date: a.date,
                });
              } else {
                a.reload();
              }
            }}
            className="shrink-0 font-semibold hover:text-white"
          >
            {a.exportError ? "Retry Excel" : "Retry"}
          </button>
        </div>
      )}

      <AttendanceStats
        stats={a.stats}
        loading={a.loading}
        onManageEmployees={() => setShowEmployees(true)}
      />

      <div className="mt-5 rounded-2xl border border-white/10 bg-[#111]">
        <AttendanceFilters
          filter={a.filter}
          onFilter={a.setFilter}
          search={a.search}
          onSearch={a.setSearch}
        />

        <AttendanceTable
          rows={a.rows}
          loading={a.loading}
          onView={setSelected}
        />
      </div>

      <AttendanceDetailsModal
        row={selected}
        onClose={() => setSelected(null)}
      />

      {showEmployees && (
        <ManageEmployeesModal
          onClose={() => setShowEmployees(false)}
        />
      )}
    </div>
  );
};

export default AttendanceOverview;
