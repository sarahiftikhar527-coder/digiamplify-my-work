import { motion } from 'framer-motion'
import {
  journeyBadge,
  journey,
  journeyHeading,
} from '@/data/about/journey'

function AboutJourney() {
  return (
    <section className="relative overflow-hidden bg-black text-white">
      <div className="mx-auto max-w-[1920px] px-5 py-12 sm:px-10 lg:py-[clamp(40px,4.5vw,86px)] lg:pl-[3.8%] lg:pr-[9%]">
        <div className="flex flex-col gap-5 sm:gap-6 lg:flex-row lg:items-start lg:justify-between">
          <motion.h2
            initial={{ opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.3 }}
            transition={{ duration: 0.8, ease: 'easeOut' }}
            className="max-w-[460px] font-['Urbanist'] text-[28px] font-light leading-[1.3] text-white sm:text-[34px] lg:max-w-[38vw] lg:text-[clamp(28px,2.6vw,50px)]"
          >
            {journeyHeading}
          </motion.h2>

          <motion.span
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8, delay: 0.1 }}
            className="inline-flex w-fit items-center rounded-full border border-white/20 px-5 py-[7px] font-['Poppins'] text-[12px] text-white lg:mt-[0.8vw] lg:px-[clamp(20px,2.5vw,48px)] lg:py-[clamp(6px,0.6vw,12px)] lg:text-[clamp(10px,0.8vw,15px)]"
          >
            {journeyBadge}
          </motion.span>
        </div>

        <div className="relative mt-10 lg:mt-[clamp(40px,4.7vw,90px)]">
          <div className="absolute bottom-0 right-0 top-0 hidden w-px bg-white/15 lg:block" />

          {journey.map((item, i) => {
            const isFirst = i === 0
            const isLast = i === journey.length - 1

            return (
              <motion.div
                key={item.id}
                initial={{ opacity: 0, y: 24 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, amount: 0.3 }}
                transition={{
                  duration: 0.7,
                  delay: i * 0.08,
                  ease: 'easeOut',
                }}
                className="relative flex flex-col pl-7 sm:pl-9 lg:flex-row lg:pl-0"
              >
                {/* Mobile timeline line + dot (hidden on desktop) */}
                <span
                  className={`absolute left-[5px] w-px bg-white/15 sm:left-[7px] lg:hidden ${
                    isFirst ? 'top-[14px]' : 'top-0'
                  } ${isLast ? 'h-[14px]' : 'bottom-0'} ${
                    isFirst && isLast ? 'hidden' : ''
                  }`}
                />
                <span className="absolute left-0 top-[8px] h-[11px] w-[11px] rounded-full bg-[#d50818] shadow-[0_0_12px_rgba(213,8,24,0.7)] sm:left-[2px] lg:hidden" />

                <div className="pt-0 font-['Urbanist'] text-[22px] font-light leading-tight text-[#d50818] sm:text-[24px] lg:w-[11%] lg:shrink-0 lg:pl-[1.2%] lg:pt-[clamp(20px,2.3vw,44px)] lg:text-[clamp(20px,1.8vw,34px)]">
                  {item.year}
                </div>

                <div
                  className={`relative flex-1 pb-8 pt-3 lg:py-[clamp(20px,2.3vw,44px)] ${
                    isLast ? '' : 'lg:border-b lg:border-white/10'
                  }`}
                >
                  <h3 className="font-['Poppins'] text-[17px] font-medium leading-tight text-white lg:text-[clamp(15px,1.35vw,26px)]">
                    {item.title}
                  </h3>

                  <p className="mt-3 max-w-[880px] font-['Poppins'] text-[14px] leading-[1.65] text-white/85 lg:mt-[clamp(8px,0.9vw,18px)] lg:pr-[8%] lg:text-[clamp(11px,1.05vw,20px)] lg:leading-[1.6] lg:text-white/90">
                    {item.description}
                  </p>

                  <span className="absolute -right-[5px] top-[clamp(26px,2.9vw,56px)] hidden h-[10px] w-[10px] rounded-full bg-[#d50818] lg:block" />
                </div>
              </motion.div>
            )
          })}
        </div>
      </div>
    </section>
  )
}

export default AboutJourney
