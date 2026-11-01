import {
  Bar,
  BarChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts'

export default function MiniBarChart({
  data = [],
  dataKey = 'value',
  xKey = 'name',
  height = 150,
  showAxis = true,
}) {
  return (
    <div className="w-full" style={{ height }}>
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={data} margin={{ top: 5, right: 5, left: -25, bottom: 0 }}>
          {showAxis && (
            <CartesianGrid
              vertical={false}
              stroke="rgba(255,255,255,0.06)"
            />
          )}

          {showAxis && (
            <XAxis
              dataKey={xKey}
              axisLine={false}
              tickLine={false}
              tick={{
                fill: 'rgba(255,255,255,0.35)',
                fontSize: 9,
              }}
            />
          )}

          {showAxis && (
            <YAxis
              axisLine={false}
              tickLine={false}
              tick={{
                fill: 'rgba(255,255,255,0.35)',
                fontSize: 9,
              }}
            />
          )}

          <Tooltip
            cursor={{ fill: 'rgba(217,0,18,0.05)' }}
            contentStyle={{
              background: '#111111',
              border: '1px solid rgba(255,255,255,0.1)',
              borderRadius: 8,
              color: '#fff',
              fontSize: 11,
            }}
          />

          <Bar
            dataKey={dataKey}
            fill="#D90012"
            radius={[4, 4, 0, 0]}
            maxBarSize={24}
          />
        </BarChart>
      </ResponsiveContainer>
    </div>
  )
}