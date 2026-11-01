export default function Card({
  children,
  className = '',
  hover = true,
  padding = true,
}) {
  return (
    <div
      className={`rounded-xl border border-white/[0.08] bg-[#0B0B0B] ${
        hover
          ? 'transition-all duration-300 hover:border-digi-red/30 hover:shadow-red-glow'
          : ''
      } ${padding ? 'p-5' : ''} ${className}`}
    >
      {children}
    </div>
  )
}