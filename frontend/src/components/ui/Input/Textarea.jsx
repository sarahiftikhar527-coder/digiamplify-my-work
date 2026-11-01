import { forwardRef } from 'react'

const Textarea = forwardRef(function Textarea(
  {
    label,
    error,
    required = false,
    className = '',
    id,
    rows = 5,
    ...props
  },
  ref,
) {
  const textareaId = id || props.name

  return (
    <div className="space-y-2">
      {label && (
        <label
          htmlFor={textareaId}
          className="block text-xs font-medium text-white/70"
        >
          {label}
          {required && <span className="ml-1 text-digi-red">*</span>}
        </label>
      )}

      <textarea
        ref={ref}
        id={textareaId}
        rows={rows}
        className={`w-full resize-none rounded-lg border bg-white/[0.03] px-4 py-3 text-sm text-white outline-none transition-all placeholder:text-white/30 ${
          error
            ? 'border-red-500/70 focus:border-red-500'
            : 'border-white/10 focus:border-digi-red/60'
        } ${className}`}
        {...props}
      />

      {error && <p className="text-xs text-red-400">{error}</p>}
    </div>
  )
})

export default Textarea