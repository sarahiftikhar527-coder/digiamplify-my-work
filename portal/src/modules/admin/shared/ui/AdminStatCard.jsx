const tones = {
  brand: "bg-red-600/15 text-red-500",
  success: "bg-green-500/15 text-green-400",
  warning: "bg-amber-500/15 text-amber-400",
};

export default function AdminStatCard({ icon: Icon, label, sub, value, tone = "brand" }) {
  return (
    <div className="flex items-center gap-3 rounded-xl border border-white/10 bg-[#0b0b0b] p-4">
      <div className={`grid h-10 w-10 shrink-0 place-items-center rounded-lg ${tones[tone]}`}>
        {Icon && <Icon size={18} />}
      </div>
      <div className="min-w-0">
        <p className="truncate text-sm text-gray-200">{label}</p>
        {sub && <p className="text-[11px] text-gray-500">{sub}</p>}
        <p className="mt-1 text-lg font-semibold text-white">{value}</p>
      </div>
    </div>
  );
}