import { forwardRef } from 'react'

const Select = forwardRef(function Select(
  {
    label,
    options = [],
    error,
    required = false,
    placeholder = 'Select an option',
    className = '',
    id,
    ...props
  },
  ref,
) {
  const selectId = id || props.name

  return (
    <div className="space-y-2">
      {label && (
        <label
          htmlFor={selectId}
          className="block text-xs font-medium text-white/70"
        >
          {label}
          {required && <span className="ml-1 text-digi-red">*</span>}
        </label>
      )}

      <select
        ref={ref}
        id={selectId}
        className={`w-full appearance-none rounded-lg border border-white/10 bg-white/[0.03] px-4 py-3 text-sm text-white outline-none transition-all focus:border-digi-red/60 ${className}`}
        {...props}
      >
        <option value="" className="bg-[#0B0B0B]">
          {placeholder}
        </option>

        {options.map((option) => {
          const item =
            typeof option === 'string'
              ? { value: option, label: option }
              : option

          return (
            <option
              key={item.value}
              value={item.value}
              className="bg-[#0B0B0B]"
            >
              {item.label}
            </option>
          )
        })}
      </select>

      {error && <p className="text-xs text-red-400">{error}</p>}
    </div>
  )
})

export default Select