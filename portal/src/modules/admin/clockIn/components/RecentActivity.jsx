import {
  BADGE,
  RECENT_LABEL,
  formatShortDate,
  formatTime,
} from "./attendanceUtils";

const RecentActivity = ({ items = [], loading }) => (
  <div className="mt-7">
    <h3 className="mb-2 text-[15px] font-semibold text-white">
      Recent Activity
    </h3>

    {loading ? (
      <p className="py-4 text-[13px] text-white/50">Loading...</p>
    ) : items.length === 0 ? (
      <p className="py-4 text-[13px] text-white/50">
        No recent activity yet.
      </p>
    ) : (
      items.map((it, index) => (
        <div
          key={it._id || it.id || `${it.date || "activity"}-${index}`}
          className="flex items-center justify-between border-t border-white/5 py-3"
        >
          <div>
            <p className="text-[14px] font-semibold text-white">
              {it.date ? formatShortDate(it.date) : "Date unavailable"}
            </p>

            <p className="mt-0.5 text-[12px] text-white/50">
              {it.clockInAt ? formatTime(it.clockInAt) : "No clock in"} –{" "}
              {it.clockOutAt ? formatTime(it.clockOutAt) : "No clock out"}
            </p>
          </div>

          <span
            className={`rounded-full border px-3 py-1 text-[11px] font-semibold ${
              BADGE[it.status] || BADGE.present
            }`}
          >
            {RECENT_LABEL[it.status] || "On Time"}
          </span>
        </div>
      ))
    )}
  </div>
);

export default RecentActivity;