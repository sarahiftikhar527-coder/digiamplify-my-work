export default function IconBox({
  icon: Icon,
  size = 'md',
  variant = 'red',
  className = '',
}) {
  const sizes = {
    sm: 'h-8 w-8',
    md: 'h-10 w-10',
    lg: 'h-12 w-12',
  }

  const variants = {
    red: 'border-digi-red/20 bg-digi-red/10 text-digi-red',
    white: 'border-white/10 bg-white/5 text-white',
    dark: 'border-white/10 bg-black text-white',
  }

  return (
    <div
      className={`flex shrink-0 items-center justify-center rounded-lg border ${sizes[size]} ${variants[variant]} ${className}`}
    >
      {Icon && <Icon size={size === 'sm' ? 15 : size === 'lg' ? 21 : 18} />}
    </div>
  )
}