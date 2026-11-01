import {
  BADGE,
  BADGE_LABEL,
  formatHours,
  formatTime,
  initials,
} from "./attendanceUtils";

const HEADERS = ["Employee", "Department", "Clock In", "Clock Out", "Hours", "Status", ""];

const Message = ({ children }) => (
  <tr>
    <td colSpan={HEADERS.length} className="px-5 py-10 text-center text-white/50">
      {children}
    </td>
  </tr>
);

export default function AttendanceTable({ rows = [], loading = false, onView = () => {} }) {
  return (
    <div className="overflow-x-auto">
      <table className="w-full min-w-[720px] text-left text-[13px]">
        <thead>
          <tr className="border-y border-white/10 text-[12px] text-white/60">
            {HEADERS.map((heading, index) => (
              <th key={index} className="px-5 py-3.5 font-medium">
                {heading}
              </th>
            ))}
          </tr>
        </thead>

        <tbody>
          {loading ? (
            <Message>Loading attendance...</Message>
          ) : rows.length === 0 ? (
            <Message>Koi employee attendance record nahi mila.</Message>
          ) : (
            rows.map((employee, index) => (
              <tr
                key={employee.userId || employee._id || index}
                className="border-b border-white/5 last:border-0"
              >
                <td className="px-5 py-3">
                  <div className="flex items-center gap-3">
                    <span className="flex h-9 w-9 items-center justify-center rounded-lg border border-red-500/30 bg-red-600/15 text-[11px] font-bold text-red-400">
                      {initials(employee.name || "Employee")}
                    </span>
                    <span className="font-semibold text-white">{employee.name || "Unknown"}</span>
                  </div>
                </td>

                <td className="px-5 py-3 text-white/70">{employee.department || "—"}</td>

                <td className="px-5 py-3 font-medium text-white">{formatTime(employee.clockInAt)}</td>

                <td className="px-5 py-3 text-white/60">{formatTime(employee.clockOutAt)}</td>

                <td className="px-5 py-3 text-white/80">
                  {employee.clockInAt ? formatHours(employee.workedMinutes || 0) : "—"}
                </td>

                <td className="px-5 py-3">
                  <span
                    className={`rounded-full border px-3 py-1 text-[11px] font-semibold ${
                      BADGE[employee.status] || "border-white/20 text-white/70"
                    }`}
                  >
                    {BADGE_LABEL[employee.status] || employee.status || "—"}
                  </span>
                </td>

                <td className="px-5 py-3 text-right">
                  <button
                    type="button"
                    onClick={() => onView(employee)}
                    className="rounded-lg border border-white/10 bg-white/5 px-4 py-1.5 text-[12px] font-medium text-white hover:bg-white/10"
                  >
                    View
                  </button>
                </td>
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
}