import {
  Area,
  AreaChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts'

export default function MiniAreaChart({
  data = [],
  dataKey = 'value',
  xKey = 'name',
  height = 150,
  showAxis = true,
}) {
  return (
    <div className="w-full" style={{ height }}>
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={data} margin={{ top: 5, right: 5, left: -25, bottom: 0 }}>
          <defs>
            <linearGradient id="redAreaGradient" x1="0" y1="0" x2="0" y2="1">
              <stop
                offset="0%"
                stopColor="#D90012"
                stopOpacity={0.35}
              />
              <stop
                offset="100%"
                stopColor="#D90012"
                stopOpacity={0}
              />
            </linearGradient>
          </defs>

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
            cursor={{ stroke: 'rgba(217,0,18,0.4)' }}
            contentStyle={{
              background: '#111111',
              border: '1px solid rgba(255,255,255,0.1)',
              borderRadius: 8,
              color: '#fff',
              fontSize: 11,
            }}
          />

          <Area
            type="monotone"
            dataKey={dataKey}
            stroke="#D90012"
            strokeWidth={2}
            fill="url(#redAreaGradient)"
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  )
}