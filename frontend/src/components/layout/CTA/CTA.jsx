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
    <section className="px-0 pb-10 pt-8 lg:px-0 lg:pt-[3.5vw]">
      <div className="container-main px-4 sm:px-6 md:px-8 lg:px-6 xl:px-10">
        <div className="flex w-full flex-col gap-6 rounded-2xl border border-white/20 bg-[#141414] px-5 py-7 sm:px-8 sm:py-8 md:px-10 lg:h-[12.2vw] lg:flex-row lg:items-center lg:justify-between lg:gap-[2vw] lg:rounded-[1vw] lg:px-[2.4vw] lg:py-0">
          <div className="lg:-mt-[1vw]">
            <h2 className="text-[26px] font-light leading-tight text-white sm:text-3xl md:text-4xl lg:whitespace-nowrap lg:text-[2.0vw] lg:leading-[1.2]">
              {cta.title}
            </h2>

            <p className="mt-3 text-[14px] font-normal leading-6 text-white/90 sm:text-base md:text-lg lg:mt-[1vw] lg:whitespace-nowrap lg:text-[1.04vw] lg:leading-normal lg:text-white">
              {cta.description}
            </p>
          </div>

          <form
            onSubmit={handleSubmit}
            className="flex flex-col gap-3 md:flex-row md:items-center md:gap-4 lg:shrink-0 lg:gap-[1.9vw] lg:pr-[3.1vw]"
          >
            {success ? (
              <div className="flex h-[52px] w-full items-center rounded-full border border-green-500/30 bg-[#0e0e0e] px-6 text-base text-green-400 md:h-[53px] md:w-[380px] md:px-[34px] lg:h-[2.75vw] lg:w-[19.8vw] lg:px-[1.75vw] lg:text-[0.9vw]">
                Subscribed successfully!
              </div>
            ) : (
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder={cta.placeholder}
                className="h-[52px] w-full rounded-full border border-white/20 bg-[#0e0e0e] px-6 text-base text-white outline-none transition-colors placeholder:text-white/50 focus:border-red-600 md:h-[53px] md:w-[380px] md:px-[34px] lg:h-[2.75vw] lg:w-[19.8vw] lg:px-[1.75vw] lg:text-[0.9vw]"
              />
            )}

            <button
              type="submit"
              className="h-[52px] w-full rounded-full bg-[#c50d1e] px-8 text-base font-medium text-white transition-colors hover:bg-red-700 md:h-[48px] md:w-auto md:px-[41px] md:text-lg lg:h-[2.5vw] lg:px-[2.1vw] lg:text-[1.04vw]"
            >
              {success ? 'Subscribed' : cta.buttonText}
            </button>
          </form>
        </div>

        <p className="mt-4 text-[13px] font-normal leading-6 text-white/50 sm:text-sm md:text-base lg:mt-[0.8vw] lg:text-[1vw]">
          {cta.note}
        </p>

        <div className="mt-16 h-px w-full bg-white/20 md:mt-24 lg:mt-[6.8vw]" />
      </div>
    </section>
  )
}