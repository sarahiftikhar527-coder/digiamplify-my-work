import {
  ResponsiveContainer,
  BarChart,
  Bar,
  CartesianGrid,
  XAxis,
  YAxis,
  Tooltip,
  PieChart,
  Pie,
  Cell,
} from "recharts";
import { AlertTriangle, CalendarClock, CircleCheck, Flame } from "lucide-react";

const card = "min-w-0 rounded-md border border-[#1e1e1e] bg-[#0b0b0b] p-4";

const tooltipStyle = {
  background: "#151515",
  border: "1px solid #303030",
  borderRadius: "10px",
  color: "#ffffff",
  fontSize: 12,
};

const axisTick = { fill: "#9ca3af", fontSize: 11 };

const pad = (value) => String(value).padStart(2, "0");

const toISO = (date) =>
  `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`;

const formatShort = (iso) => {
  if (!iso) return "";
  const date = new Date(`${iso}T00:00:00`);
  return Number.isNaN(date.getTime())
    ? ""
    : date.toLocaleDateString("en-GB", { day: "numeric", month: "short" });
};

function Empty({ children }) {
  return (
    <div className="grid min-h-[120px] place-items-center text-center text-sm text-neutral-500">
      {children}
    </div>
  );
}

function Title({ children, hint }) {
  return (
    <div className="mb-3">
      <h3 className="text-xs font-medium text-white">{children}</h3>
      {hint && <p className="mt-0.5 text-[11px] text-neutral-500">{hint}</p>}
    </div>
  );
}

export function FocusStrip({ tasks = [], today, onJump }) {
  const open = tasks.filter((task) => task.status !== "completed");
  const dueToday = open.filter((task) => task.dueDate === today).length;
  const overdue = open.filter((task) => task.dueDate && task.dueDate < today).length;
  const next = open
    .filter((task) => task.dueDate && task.dueDate >= today)
    .sort((a, b) => a.dueDate.localeCompare(b.dueDate))[0];
  const inProgress = open.filter((task) => task.status === "in-progress").length;

  const items = [
    {
      label: "Due today",
      value: dueToday,
      icon: CalendarClock,
      tone: "text-sky-400",
      note: dueToday === 0 ? "Nothing due" : "Finish these first",
    },
    {
      label: "Overdue",
      value: overdue,
      icon: AlertTriangle,
      tone: overdue > 0 ? "text-red-400" : "text-neutral-500",
      note: overdue > 0 ? "Needs attention" : "You are on track",
    },
    {
      label: "In progress",
      value: inProgress,
      icon: Flame,
      tone: "text-amber-400",
      note: inProgress > 3 ? "Consider narrowing focus" : "Healthy workload",
    },
    {
      label: "Next deadline",
      value: next ? formatShort(next.dueDate) : "None",
      icon: CircleCheck,
      tone: "text-emerald-400",
      note: next ? next.title || next.name || "Upcoming task" : "No upcoming tasks",
      text: true,
    },
  ];

  return (
    <div className="grid grid-cols-2 gap-3 xl:grid-cols-4">
      {items.map(({ label, value, icon: Icon, tone, note, text }) => (
        <button
          key={label}
          type="button"
          onClick={() => onJump?.("tasks")}
          className="group min-w-0 rounded-md border border-[#1e1e1e] bg-[#0b0b0b] p-4 text-left transition-colors hover:border-white/20"
        >
          <div className="flex items-center justify-between">
            <p className="text-[11px] font-medium uppercase tracking-[0.12em] text-neutral-500">
              {label}
            </p>
            <Icon size={15} className={tone} />
          </div>
          <p className={`mt-2 truncate font-semibold tabular-nums text-white ${text ? "text-lg" : "text-2xl"}`}>
            {value}
          </p>
          <p className="mt-1 truncate text-[11px] text-neutral-500">{note}</p>
        </button>
      ))}
    </div>
  );
}

export function WorkloadForecast({ tasks = [] }) {
  const days = Array.from({ length: 7 }).map((_, index) => {
    const date = new Date();
    date.setDate(date.getDate() + index);
    const iso = toISO(date);

    return {
      iso,
      label: index === 0 ? "Today" : date.toLocaleDateString("en-GB", { weekday: "short" }),
      tasks: tasks.filter((task) => task.status !== "completed" && task.dueDate === iso).length,
    };
  });

  const total = days.reduce((sum, day) => sum + day.tasks, 0);
  const busiest = days.reduce((best, day) => (day.tasks > best.tasks ? day : best), days[0]);

  return (
    <section className={card}>
      <Title hint="Open tasks by due date">Workload, next 7 days</Title>

      {total === 0 ? (
        <Empty>No deadlines this week.</Empty>
      ) : (
        <>
          <div className="h-44 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={days} margin={{ top: 4, right: 4, left: -24, bottom: 0 }}>
                <CartesianGrid stroke="rgba(255,255,255,0.06)" vertical={false} />
                <XAxis dataKey="label" tick={axisTick} axisLine={false} tickLine={false} />
                <YAxis allowDecimals={false} tick={axisTick} axisLine={false} tickLine={false} />
                <Tooltip
                  cursor={{ fill: "rgba(255,255,255,0.04)" }}
                  contentStyle={tooltipStyle}
                  formatter={(value) => [value, "Tasks due"]}
                />
                <Bar dataKey="tasks" radius={[4, 4, 0, 0]} maxBarSize={28}>
                  {days.map((day) => (
                    <Cell key={day.iso} fill={day.iso === busiest.iso ? "#E5383B" : "#C1121F99"} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
          <p className="mt-2 text-[11px] text-neutral-500">
            Busiest day: <span className="text-neutral-300">{busiest.label}</span> with {busiest.tasks} due.
          </p>
        </>
      )}
    </section>
  );
}

export function StatusMix({ tasks = [] }) {
  const completed = tasks.filter((task) => task.status === "completed").length;
  const inProgress = tasks.filter((task) => task.status === "in-progress").length;
  const pending = Math.max(0, tasks.length - completed - inProgress);

  const data = [
    { name: "Completed", value: completed, color: "#22C55E" },
    { name: "In progress", value: inProgress, color: "#3B82F6" },
    { name: "Pending", value: pending, color: "#6B7280" },
  ];

  const rate = tasks.length ? Math.round((completed / tasks.length) * 100) : 0;

  return (
    <section className={card}>
      <Title hint="All tasks assigned to you">Task status</Title>

      {tasks.length === 0 ? (
        <Empty>No tasks assigned yet.</Empty>
      ) : (
        <div className="flex items-center gap-4">
          <div className="relative h-[130px] w-[130px] shrink-0">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie data={data} dataKey="value" innerRadius={42} outerRadius={60} paddingAngle={2} stroke="none">
                  {data.map((entry) => (
                    <Cell key={entry.name} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip contentStyle={tooltipStyle} />
              </PieChart>
            </ResponsiveContainer>
            <div className="pointer-events-none absolute inset-0 grid place-items-center text-center">
              <div>
                <p className="text-xl font-semibold tabular-nums text-white">{rate}%</p>
                <p className="text-[9px] uppercase tracking-wider text-neutral-500">done</p>
              </div>
            </div>
          </div>

          <ul className="min-w-0 flex-1 space-y-2">
            {data.map((entry) => (
              <li key={entry.name} className="flex items-center justify-between text-xs">
                <span className="flex items-center gap-2 text-neutral-300">
                  <span className="h-2 w-2 rounded-full" style={{ background: entry.color }} />
                  {entry.name}
                </span>
                <span className="tabular-nums text-white">{entry.value}</span>
              </li>
            ))}
          </ul>
        </div>
      )}
    </section>
  );
}

const PRIORITIES = [
  { key: "high", label: "High", color: "bg-red-500" },
  { key: "medium", label: "Medium", color: "bg-amber-500" },
  { key: "low", label: "Low", color: "bg-emerald-500" },
];

export function PriorityMix({ tasks = [] }) {
  const open = tasks.filter((task) => task.status !== "completed");

  const rows = PRIORITIES.map((item) => ({
    ...item,
    count: open.filter((task) => String(task.priority || "").toLowerCase() === item.key).length,
  }));

  const max = Math.max(1, ...rows.map((row) => row.count));
  const known = rows.reduce((sum, row) => sum + row.count, 0);

  return (
    <section className={card}>
      <Title hint="Open tasks only">Priority mix</Title>

      {open.length === 0 ? (
        <Empty>Nothing open. Enjoy the quiet.</Empty>
      ) : known === 0 ? (
        <Empty>Tasks have no priority set.</Empty>
      ) : (
        <ul className="space-y-4">
          {rows.map((row) => (
            <li key={row.key}>
              <div className="mb-1.5 flex items-center justify-between text-xs">
                <span className="text-neutral-300">{row.label}</span>
                <span className="tabular-nums text-white">{row.count}</span>
              </div>
              <div className="h-1.5 overflow-hidden rounded-full bg-white/10">
                <div
                  className={`h-full rounded-full ${row.color} transition-all duration-700`}
                  style={{ width: `${(row.count / max) * 100}%` }}
                />
              </div>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}