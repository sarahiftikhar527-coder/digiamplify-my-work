import { useEffect } from "react";
import { X } from "lucide-react";
import { BADGE, BADGE_LABEL, formatHours, formatTime, initials } from "./attendanceUtils";

const Item = ({ label, value }) => (
  <div className="rounded-xl border border-white/10 bg-[#0a0a0a] px-4 py-3">
    <p className="text-[11px] text-white/50">{label}</p>
    <p className="mt-1 text-[14px] font-semibold text-white">{value}</p>
  </div>
);

const AttendanceDetailsModal = ({ row, onClose }) => {
  useEffect(() => {
    const onKey = (e) => e.key === "Escape" && onClose();
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose]);

  if (!row) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4" onClick={onClose}>
      <div
        className="w-full max-w-md rounded-2xl border border-white/10 bg-[#111] p-6"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-3">
            <span className="flex h-11 w-11 items-center justify-center rounded-lg border border-red-500/30 bg-red-600/15 text-[13px] font-bold text-red-400">
              {initials(row.name)}
            </span>
            <div>
              <p className="text-[16px] font-semibold text-white">{row.name}</p>
              <p className="text-[12px] text-white/60">{row.department}</p>
            </div>
          </div>
          <button onClick={onClose} aria-label="Close" className="text-white/60 hover:text-white">
            <X size={18} />
          </button>
        </div>

        <span
          className={`mt-4 inline-block rounded-full border px-3 py-1 text-[11px] font-semibold ${
            BADGE[row.status] || "border-white/20 text-white/70"
          }`}
        >
          {BADGE_LABEL[row.status] || row.status}
        </span>

        <div className="mt-4 grid grid-cols-2 gap-3">
          <Item label="Clock In" value={formatTime(row.clockInAt)} />
          <Item label="Clock Out" value={row.clockInAt && !row.clockOutAt ? "Still working" : formatTime(row.clockOutAt)} />
          <Item label="Hours worked" value={row.clockInAt ? formatHours(row.workedMinutes) : "—"} />
          <Item label="Department" value={row.department} />
        </div>

        <div className="mt-3 rounded-xl border border-white/10 bg-[#0a0a0a] px-4 py-3">
          <p className="text-[11px] text-white/50">Clock out description</p>
          <p className="mt-1 text-[13px] text-white/80">{row.description || "No description added."}</p>
        </div>
      </div>
    </div>
  );
};

export default AttendanceDetailsModal;