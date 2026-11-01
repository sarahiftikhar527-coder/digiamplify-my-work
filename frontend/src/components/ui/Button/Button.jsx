import { Link } from 'react-router-dom'
import { ArrowUpRight, Loader2 } from 'lucide-react'

const variants = {
  primary:
    'bg-digi-red text-white border border-digi-red hover:bg-[#b80010] hover:border-[#b80010]',
  secondary:
    'bg-transparent text-white border border-white/15 hover:border-digi-red hover:text-digi-red',
  light:
    'bg-white text-black border border-white hover:bg-white/90',
  ghost:
    'bg-transparent text-white border border-transparent hover:text-digi-red',
}

const sizes = {
  sm: 'px-4 py-2 text-xs',
  md: 'px-5 py-2.5 text-sm',
  lg: 'px-6 py-3 text-sm',
}

export default function Button({
  children,
  variant = 'primary',
  size = 'md',
  to,
  href,
  type = 'button',
  loading = false,
  disabled = false,
  icon,
  arrow = false,
  className = '',
  onClick,
  ...props
}) {
  const classes = `inline-flex items-center justify-center gap-2 rounded-full font-medium transition-all duration-300 disabled:cursor-not-allowed disabled:opacity-50 ${variants[variant]} ${sizes[size]} ${className}`

  const content = (
    <>
      {loading && <Loader2 size={16} className="animate-spin" />}
      {children}
      {!loading && arrow && <ArrowUpRight size={16} />}
      {!loading && icon}
    </>
  )

  if (to) {
    return (
      <Link to={to} className={classes} {...props}>
        {content}
      </Link>
    )
  }

  if (href) {
    return (
      <a href={href} className={classes} {...props}>
        {content}
      </a>
    )
  }

  return (
    <button
      type={type}
      disabled={disabled || loading}
      className={classes}
      onClick={onClick}
      {...props}
    >
      {content}
    </button>
  )
}