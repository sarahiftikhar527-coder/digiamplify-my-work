import {
  ResponsiveContainer,
  BarChart,
  Bar,
  CartesianGrid,
  XAxis,
  YAxis,
  Tooltip,
} from "recharts";

export default function MonthlyPerformanceChart({ data = [] }) {
  const totalCompleted = data.reduce(
    (total, item) => total + (Number(item.completed) || 0),
    0
  );

  return (
    <section className="h-full rounded-2xl border border-white/10 bg-[#0d0d0d] p-4 text-white sm:p-5">
      <div className="mb-5">
        <h2 className="text-lg font-semibold">
          Daily Task Completion
        </h2>
        <p className="mt-1 text-sm text-gray-400">
          Tasks completed this month, based on saved completion dates.
        </p>
      </div>

      <div className="mb-4">
        <p className="text-xs text-gray-400">
          Completed tasks this month
        </p>
        <p className="mt-1 text-2xl font-semibold">
          {totalCompleted}
        </p>
      </div>

      {data.length === 0 ? (
        <div className="grid h-56 place-items-center text-sm text-gray-500">
          No task completion data available.
        </div>
      ) : (
        <div className="h-64 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={data}
              margin={{ top: 8, right: 8, left: -20, bottom: 0 }}
            >
              <CartesianGrid
                stroke="rgba(255,255,255,0.08)"
                vertical={false}
              />

              <XAxis
                dataKey="day"
                tick={{ fill: "#9ca3af", fontSize: 10 }}
                axisLine={{ stroke: "#303030" }}
                tickLine={false}
                interval="preserveStartEnd"
              />

              <YAxis
                allowDecimals={false}
                tick={{ fill: "#9ca3af", fontSize: 11 }}
                axisLine={false}
                tickLine={false}
              />

              <Tooltip
                cursor={{ fill: "rgba(255,255,255,0.04)" }}
                contentStyle={{
                  background: "#151515",
                  border: "1px solid #303030",
                  borderRadius: "10px",
                  color: "#ffffff",
                }}
                formatter={(value) => [value, "Completed tasks"]}
              />

              <Bar
                dataKey="completed"
                name="Completed tasks"
                fill="#c1121f"
                radius={[4, 4, 0, 0]}
                maxBarSize={24}
              />
            </BarChart>
          </ResponsiveContainer>
        </div>
      )}
    </section>
  );
}