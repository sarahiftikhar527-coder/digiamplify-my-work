import Chip from '../Chip'

export default function FilterPills({
  items = [],
  value,
  onChange,
  className = '',
}) {
  return (
    <div className={`flex flex-wrap gap-2 ${className}`}>
      {items.map((item) => {
        const option =
          typeof item === 'string'
            ? { value: item, label: item }
            : item

        return (
          <Chip
            key={option.value}
            active={value === option.value}
            onClick={() => onChange?.(option.value)}
          >
            {option.label}
          </Chip>
        )
      })}
    </div>
  )
}