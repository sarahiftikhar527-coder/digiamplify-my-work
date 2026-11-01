import { useState } from 'react'
import AccordionItem from './AccordionItem'

export default function Accordion({
  items = [],
  defaultOpen = 0,
  allowMultiple = false,
  className = '',
}) {
  const [openItems, setOpenItems] = useState(
    defaultOpen === null ? [] : [defaultOpen],
  )

  const toggle = (index) => {
    if (allowMultiple) {
      setOpenItems((current) =>
        current.includes(index)
          ? current.filter((item) => item !== index)
          : [...current, index],
      )
      return
    }

    setOpenItems((current) => (current[0] === index ? [] : [index]))
  }

  return (
    <div className={`divide-y divide-white/10 ${className}`}>
      {items.map((item, index) => (
        <AccordionItem
          key={item.id || index}
          {...item}
          open={openItems.includes(index)}
          onToggle={() => toggle(index)}
        />
      ))}
    </div>
  )
}