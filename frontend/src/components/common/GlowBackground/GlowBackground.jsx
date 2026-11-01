function GlowBackground({ className = '' }) {
  return (
    <div
      aria-hidden="true"
      className={`pointer-events-none absolute rounded-full bg-digi-red/10 blur-[100px] ${className}`}
    />
  )
}

export default GlowBackground