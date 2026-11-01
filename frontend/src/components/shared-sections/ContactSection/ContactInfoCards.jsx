
import { Mail, MapPin, Phone, Share2 } from 'lucide-react'
import { contactContent } from '@data/site/contact'

const icons = {
  Phone,
  Email: Mail,
  Office: MapPin,
  Social: Share2,
}

export default function ContactInfoCards() {
  return (
    <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
      {contactContent.info.map((item) => {
        const Icon = icons[item.label] || Mail

        return (
          <div
            key={item.label}
            className="group min-w-0 rounded-xl border border-white/15 bg-[#0d0d0d] px-3 py-3 transition-all duration-300 hover:-translate-y-1 hover:border-digi-red/50"
          >
            <div className="flex items-center gap-2 text-[10px] text-white/60">
              <Icon
                size={12}
                className="shrink-0 text-digi-red transition-transform duration-300 group-hover:scale-110"
              />

              <span className="truncate">{item.label}</span>
            </div>

            <p className="mt-2.5 break-words text-xs font-medium leading-5 text-white sm:text-[13px]">
              {item.value}
            </p>
          </div>
        )
      })}
    </div>
  )
}
