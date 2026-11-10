
import {
  Coffee,
  Users,
  UserCheck,
  UserPlus,
  UserX,
  Activity,
} from "lucide-react";

const STAT_ITEMS = [
  {
    key: "totalEmployees",
    label: "Total Employees",
    icon: Users,
    color: "text-blue-400",
    bg: "bg-blue-500/10",
  },
  {
    key: "present",
    label: "Present",
    icon: UserCheck,
    color: "text-green-400",
    bg: "bg-green-500/10",
  },
  {
    key: "working",
    label: "Working Now",
    icon: Activity,
    color: "text-emerald-400",
    bg: "bg-emerald-500/10",
  },
  {
    key: "onBreak",
    label: "On Break",
    icon: Coffee,
    color: "text-amber-400",
    bg: "bg-amber-500/10",
  },
  {
    key: "absent",
    label: "Absent",
    icon: UserX,
    color: "text-red-400",
    bg: "bg-red-500/10",
  },
  {
    key: "manageEmployees",
    label: "Manage Employees",
    icon: UserPlus,
    color: "text-purple-400",
    bg: "bg-purple-500/10",
    action: true,
  },
];

const AttendanceStats = ({
  stats = {},
  loading = false,
  onManageEmployees,
}) => {
  const safeStats = {
    totalEmployees: Number(stats?.totalEmployees ?? stats?.total ?? 0),
    present: Number(stats?.present ?? 0),
    working: Number(stats?.working ?? 0),
    onBreak: Number(stats?.onBreak ?? 0),
    manageEmployees: null,
    absent: Number(stats?.absent ?? 0),
  };

  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
      {STAT_ITEMS.map((item) => {
        const Icon = item.icon;

        return (
          <button
            key={item.key}
            type="button"
            onClick={item.action ? onManageEmployees : undefined}
            disabled={item.action && !onManageEmployees}
            aria-label={item.label}
            className={`rounded-xl border border-white/10 bg-[#101010] p-5 text-left transition duration-200 ${
              item.action
                ? "cursor-pointer hover:border-purple-400/50 hover:bg-[#17131d] focus:outline-none focus:ring-2 focus:ring-purple-400/50"
                : "cursor-default"
            } disabled:cursor-not-allowed`}
          >
            <div className="flex items-center justify-between gap-3">
              <div>
                <p className="text-sm text-white/60">
                  {item.label}
                </p>

                {item.action ? (
                  <p className="mt-2 text-sm font-semibold text-white">
                    Add, edit or remove
                  </p>
                ) : (
                  <p className="mt-2 text-3xl font-bold text-white">
                    {loading ? "—" : safeStats[item.key]}
                  </p>
                )}
              </div>

              <div
                className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-xl ${item.bg} ${item.color}`}
              >
                <Icon size={21} />
              </div>
            </div>

            {item.action && (
              <p className="mt-4 text-xs font-medium text-purple-300">
                Manage employees →
              </p>
            )}
          </button>
        );
      })}
    </div>
  );
};

export default AttendanceStats;