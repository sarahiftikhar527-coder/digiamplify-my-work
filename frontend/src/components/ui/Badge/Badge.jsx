export default function Badge({ children, variant = 'default', className = '' }) {
  const styles = {
    default: 'border-white/10 bg-white/[0.04] text-white/70',
    red: 'border-digi-red/30 bg-digi-red/10 text-digi-red',
    success: 'border-emerald-500/20 bg-emerald-500/10 text-emerald-400',
    warning: 'border-amber-500/20 bg-amber-500/10 text-amber-400',
  }

  return (
    <span
      className={`inline-flex items-center rounded-full border px-3 py-1 text-[11px] font-medium uppercase tracking-[0.12em] ${styles[variant]} ${className}`}
    >
      {children}
    </span>
  )
}