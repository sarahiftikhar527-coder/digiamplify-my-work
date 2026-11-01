import { motion } from 'framer-motion'
import { Lightbulb } from 'lucide-react'

const ease = [0.16, 1, 0.3, 1]

const fadeUp = (delay = 0) => ({
  initial: { opacity: 0, y: 28 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true, amount: 0.2 },
  transition: { duration: 0.8, delay, ease },
})

const paragraph =
  'text-[12px] leading-[1.8] text-white/50 sm:text-[12.5px] lg:text-[clamp(12px,0.85vw,15px)]'

function ArticleBody({ article }) {
  const { intro, quote, framework, insight, stats, closing, tags } = article

  return (
    <div className="mt-8">
      {/* Intro paragraph */}
      <motion.p {...fadeUp()} className={paragraph}>
        {intro}
      </motion.p>

      {/* Quote */}
      <motion.blockquote
        {...fadeUp(0.05)}
        className="mt-7 border-l-[3px] border-[#d50818] bg-white/[0.03] py-4 pl-5 pr-4"
      >
        <p className="text-[13px] font-semibold italic leading-[1.6] text-white sm:text-[14px]">
          {quote.text}
        </p>
        <p className="mt-2 text-[10px] text-white/55">{quote.author}</p>
      </motion.blockquote>

      {/* Framework heading */}
      <motion.h2
        {...fadeUp()}
        className="mt-9 text-[15px] font-medium text-white sm:text-[16px]"
      >
        {framework.heading}
      </motion.h2>

      <motion.p {...fadeUp(0.05)} className={`mt-3 ${paragraph}`}>
        {framework.description}
      </motion.p>

      {/* Step cards */}
      <div className="mt-6 space-y-3">
        {framework.steps.map((step, i) => (
          <motion.div
            key={step.number}
            {...fadeUp(i * 0.07)}
            whileHover={{ y: -3 }}
            className="flex items-center gap-4 rounded-md border border-white/10 bg-gradient-to-br from-white/[0.05] to-white/[0.01] px-4 py-4 transition-colors duration-300 hover:border-[#d50818]/50 sm:gap-6 sm:px-5"
          >
            <span className="w-[44px] shrink-0 text-center text-[30px] font-light leading-none text-[#d50818] sm:w-[56px] sm:text-[36px]">
              {step.number}
            </span>

            <div className="min-w-0">
              <p className="text-[12.5px] font-medium text-white">
                {step.title}
              </p>
              <p className="mt-1.5 text-[10.5px] leading-[1.6] text-white/45">
                {step.description}
              </p>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Key insight */}
      <motion.div
        {...fadeUp()}
        className="mt-12 flex items-start gap-4 rounded-md border border-white/10 bg-[#3f3f3f]/70 px-5 py-4 sm:gap-6"
      >
        <Lightbulb
          className="mt-0.5 h-5 w-5 shrink-0 text-white/60"
          strokeWidth={1.4}
        />

        <div>
          <p className="text-[12.5px] font-semibold text-white">
            {insight.title}
          </p>
          <p className="mt-1.5 text-[10.5px] leading-[1.65] text-white/65">
            {insight.text}
          </p>
        </div>
      </motion.div>

      {/* Stats */}
      <div className="mt-3 grid grid-cols-1 gap-3 sm:grid-cols-3">
        {stats.map((stat, i) => (
          <motion.div
            key={stat.value}
            {...fadeUp(i * 0.08)}
            className="rounded-md border border-white/10 bg-black/60 px-4 py-5 text-center"
          >
            <p className="text-[22px] font-semibold leading-none text-[#d50818] sm:text-[24px]">
              {stat.value}
            </p>
            <p className="mx-auto mt-3 max-w-[120px] text-[9.5px] leading-[1.5] text-white/80">
              {stat.label}
            </p>
          </motion.div>
        ))}
      </div>

      {/* Closing paragraph */}
      <motion.p {...fadeUp()} className={`mt-7 ${paragraph}`}>
        {closing}
      </motion.p>

      {/* Tagged */}
      <motion.div
        {...fadeUp()}
        className="mt-8 flex flex-wrap items-center gap-2 border-t border-white/10 pt-5"
      >
        <span className="mr-1 text-[11px] font-semibold text-white">
          Tagged:
        </span>

        {tags.map((tag, i) => (
          <span
            key={`${tag}-${i}`}
            className="cursor-pointer rounded-[3px] border border-white/20 bg-white/[0.04] px-3 py-1 text-[10.5px] text-white transition-colors duration-300 hover:border-[#d50818] hover:text-[#d50818]"
          >
            {tag}
          </span>
        ))}
      </motion.div>
    </div>
  )
}

export default ArticleBody