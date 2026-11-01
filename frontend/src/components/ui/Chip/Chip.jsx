export default function Chip({
  children,
  active = false,
  onClick,
  className = '',
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`rounded-full border px-4 py-2 text-xs font-medium transition-all duration-300 ${
        active
          ? 'border-digi-red bg-digi-red text-white'
          : 'border-white/10 bg-white/[0.03] text-white/60 hover:border-white/20 hover:text-white'
      } ${className}`}
    >
      {children}
    </button>
  )
}