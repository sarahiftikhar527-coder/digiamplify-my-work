import { Cell, Pie, PieChart, ResponsiveContainer } from 'recharts'

export default function DonutChart({
  value = 99,
  size = 130,
  strokeWidth = 12,
  label,
}) {
  const data = [
    { name: 'completed', value },
    { name: 'remaining', value: Math.max(100 - value, 0) },
  ]

  return (
    <div
      className="relative"
      style={{
        width: size,
        height: size,
      }}
    >
      <ResponsiveContainer width="100%" height="100%">
        <PieChart>
          <Pie
            data={data}
            dataKey="value"
            startAngle={90}
            endAngle={-270}
            innerRadius={`calc(50% - ${strokeWidth}px)`}
            outerRadius="50%"
            paddingAngle={0}
            stroke="none"
          >
            <Cell fill="#D90012" />
            <Cell fill="rgba(255,255,255,0.08)" />
          </Pie>
        </PieChart>
      </ResponsiveContainer>

      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className="font-heading text-2xl font-light text-white">
          {value}%
        </span>

        {label && (
          <span className="mt-1 text-[9px] text-white/40">{label}</span>
        )}
      </div>
    </div>
  )
}