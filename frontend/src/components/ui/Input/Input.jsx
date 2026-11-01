import { forwardRef } from 'react'

const Input = forwardRef(function Input(
  {
    label,
    error,
    hint,
    required = false,
    className = '',
    id,
    ...props
  },
  ref,
) {
  const inputId = id || props.name

  return (
    <div className="space-y-2">
      {label && (
        <label
          htmlFor={inputId}
          className="block text-xs font-medium text-white/70"
        >
          {label}
          {required && <span className="ml-1 text-digi-red">*</span>}
        </label>
      )}

      <input
        ref={ref}
        id={inputId}
        className={`w-full rounded-lg border bg-white/[0.03] px-4 py-3 text-sm text-white outline-none transition-all placeholder:text-white/30 ${
          error
            ? 'border-red-500/70 focus:border-red-500'
            : 'border-white/10 focus:border-digi-red/60'
        } ${className}`}
        {...props}
      />

      {error && <p className="text-xs text-red-400">{error}</p>}
      {!error && hint && <p className="text-xs text-white/40">{hint}</p>}
    </div>
  )
})

export default Input