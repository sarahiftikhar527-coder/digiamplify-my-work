import { useState } from 'react'

import { cta } from '@/data/site/cta'

export default function CTA() {
  const [email, setEmail] = useState('')
  const [success, setSuccess] = useState(false)

  const handleSubmit = (e) => {
    e.preventDefault()

    if (!email.trim()) return

    console.log('Subscribed:', email)
    setEmail('')
    setSuccess(true)

    setTimeout(() => {
      setSuccess(false)
    }, 3000)
  }

  return (
    <section className="px-0 pb-10 pt-8 lg:px-0 lg:pt-[min(3.5vw,67.2px)]">
      <div className="container-main px-4 sm:px-6 md:px-8 lg:px-6 xl:px-10">
        <div className="flex w-full flex-col gap-6 rounded-2xl border border-white/20 bg-[#141414] px-5 py-7 sm:px-8 sm:py-8 md:px-10 lg:h-[min(12.2vw,234.24px)] lg:flex-row lg:items-center lg:justify-between lg:gap-[min(2vw,38.4px)] lg:rounded-[min(1vw,19.2px)] lg:px-[min(2.4vw,46.08px)] lg:py-0">
          <div className="lg:-mt-[min(1vw,19.2px)]">
            <h2 className="text-[26px] font-light leading-tight text-white sm:text-3xl md:text-4xl lg:whitespace-nowrap lg:text-[length:min(2.0vw,38.4px)] lg:leading-[1.2]">
              {cta.title}
            </h2>

            <p className="mt-3 text-[14px] font-normal leading-6 text-white/90 sm:text-base md:text-lg lg:mt-[min(1vw,19.2px)] lg:whitespace-nowrap lg:text-[length:min(1.04vw,19.97px)] lg:leading-normal lg:text-white">
              {cta.description}
            </p>
          </div>

          <form
            onSubmit={handleSubmit}
            className="flex flex-col gap-3 md:flex-row md:items-center md:gap-4 lg:shrink-0 lg:gap-[min(1.9vw,36.48px)] lg:pr-[min(3.1vw,59.52px)]"
          >
            {success ? (
              <div className="flex h-[52px] w-full items-center rounded-full border border-green-500/30 bg-[#0e0e0e] px-6 text-base text-green-400 md:h-[53px] md:w-[380px] md:px-[34px] lg:h-[min(2.75vw,52.8px)] lg:w-[min(19.8vw,380.16px)] lg:px-[min(1.75vw,33.6px)] lg:text-[length:min(0.9vw,17.28px)]">
                Subscribed successfully!
              </div>
            ) : (
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder={cta.placeholder}
                className="h-[52px] w-full rounded-full border border-white/20 bg-[#0e0e0e] px-6 text-base text-white outline-none transition-colors placeholder:text-white/50 focus:border-red-600 md:h-[53px] md:w-[380px] md:px-[34px] lg:h-[min(2.75vw,52.8px)] lg:w-[min(19.8vw,380.16px)] lg:px-[min(1.75vw,33.6px)] lg:text-[length:min(0.9vw,17.28px)]"
              />
            )}

            <button
              type="submit"
              className="h-[52px] w-full rounded-full bg-[#c50d1e] px-8 text-base font-medium text-white transition-colors hover:bg-red-700 md:h-[48px] md:w-auto md:px-[41px] md:text-lg lg:h-[min(2.5vw,48px)] lg:px-[min(2.1vw,40.32px)] lg:text-[length:min(1.04vw,19.97px)]"
            >
              {success ? 'Subscribed' : cta.buttonText}
            </button>
          </form>
        </div>

        <p className="mt-4 text-[13px] font-normal leading-6 text-white/50 sm:text-sm md:text-base lg:mt-[min(0.8vw,15.36px)] lg:text-[length:min(1vw,19.2px)]">
          {cta.note}
        </p>

        <div className="mt-16 h-px w-full bg-white/20 md:mt-24 lg:mt-[min(6.8vw,130.56px)]" />
      </div>
    </section>
  )
}