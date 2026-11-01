export default function ProgressBar({
  value = 0,
  label,
  showValue = true,
  className = '',
}) {
  const safeValue = Math.min(Math.max(value, 0), 100)

  return (
    <div className={`space-y-2 ${className}`}>
      {(label || showValue) && (
        <div className="flex items-center justify-between text-xs">
          {label && <span className="text-white/60">{label}</span>}
          {showValue && <span className="text-white">{safeValue}%</span>}
        </div>
      )}

      <div className="h-1.5 overflow-hidden rounded-full bg-white/10">
        <div
          className="h-full rounded-full bg-digi-red transition-all duration-500"
          style={{ width: `${safeValue}%` }}
        />
      </div>
    </div>
  )
}