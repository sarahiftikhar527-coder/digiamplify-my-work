const MAP = {
  on_time: { label: "On Time", cls: "border-green-500/40 bg-green-500/10 text-green-400", dot: "bg-green-400" },
  late: { label: "Late", cls: "border-amber-500/40 bg-amber-500/10 text-amber-400", dot: "bg-amber-400" },
  absent: { label: "Absent", cls: "border-red-500/40 bg-red-500/10 text-red-400", dot: "bg-red-400" },
};

const StatusBadge = ({ status, withDot = true, className = "" }) => {
  const s = MAP[status] || MAP.on_time;
  return (
    <span
      className={`inline-flex items-center gap-1.5 whitespace-nowrap rounded-full border px-3 py-1 text-[11px] font-medium ${s.cls} ${className}`}
    >
      {withDot && <span className={`h-1.5 w-1.5 rounded-full ${s.dot}`} />}
      {s.label}
    </span>
  );
};

export default StatusBadge;