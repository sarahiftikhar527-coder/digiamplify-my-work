import { Link } from "react-router-dom";
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  CartesianGrid,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  PieChart,
  Pie,
  Cell,
} from "recharts";
import {
  ArrowUpRight,
  CalendarDays,
  ClipboardList,
  MessageCircle,
  RefreshCw,
  Trophy,
  TriangleAlert,
  UserCheck,
} from "lucide-react";
import { initials, timeAgo } from "./adminInsightsUtils";

const card = "rounded-2xl border border-white/10 bg-[#0d0d0d] p-4 sm:p-5";

const tooltipStyle = {
  background: "#151515",
  border: "1px solid #303030",
  borderRadius: "10px",
  color: "#ffffff",
  fontSize: 12,
};

const axisTick = { fill: "#9ca3af", fontSize: 11 };

const toneDot = {
  green: "bg-emerald-500",
  amber: "bg-amber-500",
  red: "bg-primary-light",
};

function CardTitle({ title, hint, action }) {
  return (
    <div className="mb-4 flex items-start justify-between gap-3">
      <div className="min-w-0">
        <h3 className="text-[15px] font-semibold text-white">{title}</h3>
        {hint && <p className="mt-0.5 text-xs text-gray-500">{hint}</p>}
      </div>
      {action}
    </div>
  );
}

function Empty({ children }) {
  return (
    <div className="grid min-h-[140px] place-items-center text-center text-sm text-gray-500">
      {children}
    </div>
  );
}

function Person({ name }) {
  return (
    <span className="grid h-8 w-8 shrink-0 place-items-center rounded-full border border-white/10 bg-white/5 text-[11px] font-medium text-gray-200">
      {initials(name)}
    </span>
  );
}

export function CommandHeader({ userName, greeting, today, onRefresh, refreshing, pending }) {
  const actions = [
    { label: "Assign task", to: "/admin/task", icon: ClipboardList },
    { label: "Approvals", to: "/admin/approvals", icon: UserCheck, badge: pending },
    { label: "Schedule", to: "/admin/calendar", icon: CalendarDays },
    { label: "Messages", to: "/admin/chat", icon: MessageCircle },
  ];

  return (
    <header className="flex flex-wrap items-end justify-between gap-4">
      <div className="min-w-0">
        <p className="text-[11px] font-medium uppercase tracking-[0.14em] text-gray-500">
          {today}
        </p>
        <h1 className="mt-1 text-xl font-semibold sm:text-2xl">
          {greeting}, <span className="text-primary-light">{userName}</span>
        </h1>
        <p className="mt-1 text-xs text-gray-400">
          Here is what needs your attention across the organisation today.
        </p>
      </div>

      <div className="flex flex-wrap items-center gap-2">
        {actions.map(({ label, to, icon: Icon, badge }) => (
          <Link
            key={label}
            to={to}
            className="relative flex items-center gap-2 rounded-lg border border-white/10 bg-white/[0.03] px-3 py-2 text-xs text-gray-200 transition-colors hover:border-white/20 hover:bg-white/[0.07] hover:text-white"
          >
            <Icon size={14} />
            {label}
            {badge > 0 && (
              <span className="rounded-full bg-primary px-1.5 text-[10px] font-semibold tabular-nums text-white">
                {badge}
              </span>
            )}
          </Link>
        ))}

        <button
          type="button"
          onClick={onRefresh}
          disabled={refreshing}
          aria-label="Refresh dashboard"
          title="Refresh dashboard"
          className="grid h-8 w-8 place-items-center rounded-lg border border-white/10 text-gray-300 transition-colors hover:bg-white/10 hover:text-white disabled:opacity-60"
        >
          <RefreshCw size={14} className={refreshing ? "animate-spin" : ""} />
        </button>
      </div>
    </header>
  );
}

function Kpi({ label, value, suffix = "", sub, bar, tone = "bg-primary-light" }) {
  return (
    <div className="rounded-xl border border-white/10 bg-[#0d0d0d] p-4">
      <p className="text-[11px] font-medium uppercase tracking-[0.12em] text-gray-500">
        {label}
      </p>
      <p className="mt-2 text-2xl font-semibold tabular-nums text-white">
        {value}
        <span className="ml-0.5 text-sm font-normal text-gray-400">{suffix}</span>
      </p>
      {typeof bar === "number" && (
        <div className="mt-3 h-1 overflow-hidden rounded-full bg-white/10">
          <div
            className={`h-full rounded-full ${tone} transition-all duration-700`}
            style={{ width: `${Math.min(100, Math.max(0, bar))}%` }}
          />
        </div>
      )}
      {sub && <p className="mt-2 text-xs text-gray-500">{sub}</p>}
    </div>
  );
}

export function ExecutiveKpis({ insights }) {
  const hasTasks = insights.assigned > 0;

  return (
    <div className="grid grid-cols-2 gap-3 xl:grid-cols-4">
      <Kpi
        label="Completion rate"
        value={hasTasks ? insights.completionRate : "—"}
        suffix={hasTasks ? "%" : ""}
        bar={hasTasks ? insights.completionRate : undefined}
        tone="bg-emerald-500"
        sub={`${insights.completed} of ${insights.assigned} assigned tasks`}
      />
      <Kpi
        label="On-track delivery"
        value={hasTasks ? insights.onTrackRate : "—"}
        suffix={hasTasks ? "%" : ""}
        bar={hasTasks ? insights.onTrackRate : undefined}
        tone="bg-sky-500"
        sub={`${insights.delayed} overdue right now`}
      />
      <Kpi
        label="Review coverage"
        value={insights.reviewedRate}
        suffix="%"
        bar={insights.reviewedRate}
        tone="bg-amber-500"
        sub={`${insights.pendingReports} reports waiting`}
      />
      <Kpi
        label="Pending leave"
        value={insights.pendingLeaves}
        sub={insights.pendingLeaves === 1 ? "1 request to decide" : `${insights.pendingLeaves} requests to decide`}
      />
    </div>
  );
}

export function WorkforceHealth({ insights }) {
  const score = insights.healthScore;
  const radius = 52;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference * (1 - (score || 0) / 100);

  const label =
    score === null ? "No data yet" : score >= 80 ? "Healthy" : score >= 60 ? "Watch closely" : "Needs attention";
  const stroke = score === null ? "#374151" : score >= 80 ? "#22C55E" : score >= 60 ? "#F59E0B" : "#E5383B";

  return (
    <section className={card}>
      <CardTitle title="Workforce health" hint="Delivery, deadlines and review discipline" />

      <div className="flex items-center gap-5">
        <div className="relative h-[132px] w-[132px] shrink-0">
          <svg viewBox="0 0 132 132" className="h-full w-full -rotate-90">
            <circle cx="66" cy="66" r={radius} fill="none" stroke="rgba(255,255,255,0.08)" strokeWidth="9" />
            <circle
              cx="66"
              cy="66"
              r={radius}
              fill="none"
              stroke={stroke}
              strokeWidth="9"
              strokeLinecap="round"
              strokeDasharray={circumference}
              strokeDashoffset={offset}
              style={{ transition: "stroke-dashoffset 900ms ease" }}
            />
          </svg>
          <div className="absolute inset-0 grid place-items-center text-center">
            <div>
              <p className="text-3xl font-semibold tabular-nums">{score === null ? "—" : score}</p>
              <p className="text-[10px] uppercase tracking-wider text-gray-500">score</p>
            </div>
          </div>
        </div>

        <div className="min-w-0 flex-1 space-y-3">
          <p className="text-sm font-medium" style={{ color: stroke }}>{label}</p>
          {[
            ["Active staff", `${insights.activeCount}/${insights.headcount}`],
            ["Tasks in progress", insights.inProgress],
            ["Overdue", insights.delayed],
          ].map(([name, value]) => (
            <div key={name} className="flex items-center justify-between text-xs">
              <span className="text-gray-400">{name}</span>
              <span className="font-medium tabular-nums text-white">{value}</span>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

export function DepartmentBreakdown({ insights }) {
  const { departments } = insights;
  const max = Math.max(1, ...departments.map((d) => d.headcount));

  return (
    <section className={card}>
      <CardTitle title="Departments" hint="Headcount and task completion" />

      {departments.length === 0 ? (
        <Empty>No employees found.</Empty>
      ) : (
        <ul className="space-y-4">
          {departments.slice(0, 6).map((dept) => (
            <li key={dept.name}>
              <div className="mb-1.5 flex items-center justify-between text-xs">
                <span className="truncate text-gray-200">{dept.name}</span>
                <span className="shrink-0 tabular-nums text-gray-400">
                  {dept.headcount} {dept.headcount === 1 ? "person" : "people"}
                  {dept.assigned > 0 && <span className="ml-2 text-gray-500">{dept.rate}% done</span>}
                </span>
              </div>
              <div className="h-1.5 overflow-hidden rounded-full bg-white/10">
                <div
                  className="h-full rounded-full bg-primary-light/90 transition-all duration-700"
                  style={{ width: `${(dept.headcount / max) * 100}%` }}
                />
              </div>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}

export function TopPerformers({ insights }) {
  const rows = insights.topPerformers;

  return (
    <section className={card}>
      <CardTitle
        title="Top performers"
        hint="Ranked by tasks completed"
        action={<Trophy size={16} className="text-amber-400" />}
      />

      {rows.length === 0 ? (
        <Empty>Rankings appear once tasks are assigned.</Empty>
      ) : (
        <ol className="space-y-3">
          {rows.map((row, index) => (
            <li key={row.id} className="flex items-center gap-3">
              <span className="w-4 text-center text-xs tabular-nums text-gray-500">{index + 1}</span>
              <Person name={row.name} />
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm text-white">{row.name}</p>
                <p className="truncate text-[11px] text-gray-500">{row.designation}</p>
              </div>
              <div className="text-right">
                <p className="text-sm font-medium tabular-nums text-white">{row.completed}</p>
                <p className="text-[11px] tabular-nums text-gray-500">{row.rate}%</p>
              </div>
            </li>
          ))}
        </ol>
      )}
    </section>
  );
}

export function AtRiskEmployees({ insights }) {
  const rows = insights.atRisk;

  return (
    <section className={card}>
      <CardTitle
        title="Delivery risk"
        hint="People with overdue tasks"
        action={<TriangleAlert size={16} className="text-primary-light" />}
      />

      {rows.length === 0 ? (
        <Empty>Nobody has overdue work. Nice.</Empty>
      ) : (
        <ul className="space-y-3">
          {rows.map((row) => (
            <li key={row.id} className="flex items-center gap-3">
              <Person name={row.name} />
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm text-white">{row.name}</p>
                <p className="truncate text-[11px] text-gray-500">{row.department}</p>
              </div>
              <span className="rounded-full border border-primary/40 bg-primary/10 px-2.5 py-0.5 text-[11px] font-medium tabular-nums text-primary-light">
                {row.delayed} overdue
              </span>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}

export function ActivityTimeline({ insights }) {
  const items = insights.activity;

  return (
    <section className={card}>
      <CardTitle title="Recent activity" hint="Reports and leave requests" />

      {items.length === 0 ? (
        <Empty>Nothing has happened yet.</Empty>
      ) : (
        <ul className="relative space-y-4 before:absolute before:bottom-2 before:left-[5px] before:top-2 before:w-px before:bg-white/10">
          {items.map((item) => (
            <li key={item.id} className="relative flex gap-3 pl-5">
              <span
                className={`absolute left-0 top-1.5 h-[11px] w-[11px] rounded-full border-2 border-[#0d0d0d] ${toneDot[item.tone]}`}
              />
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm text-gray-100">{item.title}</p>
                <p className="mt-0.5 text-[11px] text-gray-500">
                  {item.meta} · {timeAgo(item.at)}
                </p>
              </div>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}

function Donut({ data, centerLabel, centerValue }) {
  const total = data.reduce((sum, item) => sum + item.value, 0);

  if (total === 0) return <Empty>No data to chart yet.</Empty>;

  return (
    <div className="flex flex-col items-center gap-4 sm:flex-row">
      <div className="relative h-[170px] w-[170px] shrink-0">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={data}
              dataKey="value"
              nameKey="name"
              innerRadius={56}
              outerRadius={78}
              paddingAngle={2}
              stroke="none"
            >
              {data.map((entry) => (
                <Cell key={entry.name} fill={entry.color} />
              ))}
            </Pie>
            <Tooltip contentStyle={tooltipStyle} />
          </PieChart>
        </ResponsiveContainer>
        <div className="pointer-events-none absolute inset-0 grid place-items-center text-center">
          <div>
            <p className="text-2xl font-semibold tabular-nums">{centerValue ?? total}</p>
            <p className="text-[10px] uppercase tracking-wider text-gray-500">{centerLabel}</p>
          </div>
        </div>
      </div>

      <ul className="w-full space-y-2.5">
        {data.map((entry) => (
          <li key={entry.name} className="flex items-center justify-between text-xs">
            <span className="flex items-center gap-2 text-gray-300">
              <span className="h-2 w-2 rounded-full" style={{ background: entry.color }} />
              {entry.name}
            </span>
            <span className="tabular-nums text-white">{entry.value}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}

export function AnalyticsBoard({ insights }) {
  return (
    <div className="grid gap-4 lg:grid-cols-2">
      <section className={`${card} lg:col-span-2`}>
        <CardTitle title="Workload by employee" hint="Top eight by assigned tasks" />

        {insights.workload.length === 0 ? (
          <Empty>Assign tasks to see the workload split.</Empty>
        ) : (
          <div className="h-72 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={insights.workload} margin={{ top: 4, right: 8, left: -18, bottom: 0 }}>
                <CartesianGrid stroke="rgba(255,255,255,0.07)" vertical={false} />
                <XAxis dataKey="name" tick={axisTick} axisLine={{ stroke: "#303030" }} tickLine={false} />
                <YAxis allowDecimals={false} tick={axisTick} axisLine={false} tickLine={false} />
                <Tooltip
                  cursor={{ fill: "rgba(255,255,255,0.04)" }}
                  contentStyle={tooltipStyle}
                  labelFormatter={(_, payload) => payload?.[0]?.payload?.fullName}
                />
                <Legend wrapperStyle={{ fontSize: 12, color: "#9ca3af" }} iconType="circle" iconSize={8} />
                <Bar dataKey="Completed" stackId="a" fill="#22C55E" maxBarSize={34} />
                <Bar dataKey="In progress" stackId="a" fill="#3B82F6" maxBarSize={34} />
                <Bar dataKey="Queued" stackId="a" fill="#4B5563" maxBarSize={34} />
                <Bar dataKey="Overdue" stackId="a" fill="#E5383B" radius={[4, 4, 0, 0]} maxBarSize={34} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        )}
      </section>

      <section className={card}>
        <CardTitle title="Task pipeline" hint="Where all assigned work sits" />
        <Donut data={insights.taskStatus} centerLabel="tasks" centerValue={insights.assigned} />
      </section>

      <section className={card}>
        <CardTitle title="Progress reports" hint="Review status this period" />
        <Donut data={insights.reportStatus} centerLabel="reports" />
      </section>

      <section className={`${card} lg:col-span-2`}>
        <CardTitle title="Department completion" hint="Share of assigned tasks finished" />

        {insights.departments.filter((d) => d.assigned > 0).length === 0 ? (
          <Empty>No department has assigned tasks yet.</Empty>
        ) : (
          <div className="h-56 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={insights.departments.filter((d) => d.assigned > 0)}
                layout="vertical"
                margin={{ top: 0, right: 16, left: 8, bottom: 0 }}
              >
                <CartesianGrid stroke="rgba(255,255,255,0.07)" horizontal={false} />
                <XAxis type="number" domain={[0, 100]} unit="%" tick={axisTick} axisLine={false} tickLine={false} />
                <YAxis type="category" dataKey="name" width={96} tick={axisTick} axisLine={false} tickLine={false} />
                <Tooltip
                  cursor={{ fill: "rgba(255,255,255,0.04)" }}
                  contentStyle={tooltipStyle}
                  formatter={(value) => [`${value}%`, "Completed"]}
                />
                <Bar dataKey="rate" fill="#C1121F" radius={[0, 4, 4, 0]} maxBarSize={18} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        )}
      </section>
    </div>
  );
}

export function SectionLink({ to, children }) {
  return (
    <Link to={to} className="inline-flex items-center gap-1 text-xs text-gray-400 transition-colors hover:text-white">
      {children}
      <ArrowUpRight size={13} />
    </Link>
  );
}