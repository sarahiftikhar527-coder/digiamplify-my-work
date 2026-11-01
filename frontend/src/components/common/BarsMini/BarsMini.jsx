export default function BarsMini({
  values = [30, 50, 40, 70, 55],
  height = 42,
  className = '',
}) {
  const max = Math.max(...values, 1)

  return (
    <div
      className={`flex items-end gap-1.5 ${className}`}
      style={{ height }}
      aria-hidden="true"
    >
      {values.map((value, index) => (
        <span
          key={index}
          className="w-1.5 rounded-t-sm bg-digi-red/80 transition-all duration-300 hover:bg-digi-red"
          style={{
            height: `${Math.max((value / max) * 100, 8)}%`,
          }}
        />
      ))}
    </div>
  )
}