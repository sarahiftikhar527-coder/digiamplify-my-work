export default function GlowCard({
  children,
  className = '',
  intensity = 'normal',
}) {
  const glow =
    intensity === 'strong'
      ? 'before:bg-digi-red/[0.12]'
      : 'before:bg-digi-red/[0.06]'

  return (
    <div
      className={`group relative overflow-hidden rounded-xl border border-white/[0.08] bg-[#0B0B0B] p-5 transition-all duration-300 hover:border-digi-red/30 ${className}`}
    >
      <div
        className={`pointer-events-none absolute inset-0 opacity-0 blur-3xl transition-opacity duration-500 group-hover:opacity-100 before:absolute before:inset-0 ${glow}`}
      />
      <div className="relative z-10">{children}</div>
    </div>
  )
}