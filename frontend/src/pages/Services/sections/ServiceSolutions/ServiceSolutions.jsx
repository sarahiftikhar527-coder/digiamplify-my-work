import { motion, useReducedMotion } from 'framer-motion'
import { solutionsHeader, solutions } from '@/data/services/solutions'

function SolutionCard({ item, index }) {
  const Icon = item.icon

  return (
    <motion.article
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.2 }}
      transition={{
        duration: 0.7,
        delay: (index % 3) * 0.1,
        ease: 'easeOut',
      }}
      whileHover={{
        y: -6,
        transition: {
          duration: 0.3,
          ease: 'easeOut',
        },
      }}
      className="group relative grid grid-cols-[auto_1fr] items-start gap-x-4 overflow-hidden rounded-2xl border border-white/10 bg-[#101010] p-5 transition-colors duration-500 hover:bg-[#161616] sm:p-6 lg:block lg:min-h-[clamp(160px,14.8vw,285px)] lg:rounded-none lg:border-0 lg:p-[clamp(16px,1.1vw,28px)]"
    >
      {/* Mobile-only red corner glow */}
      <span className="pointer-events-none absolute -bottom-10 -left-10 h-28 w-28 rounded-full bg-[#d50818]/15 blur-2xl lg:hidden" />

      <motion.span
        initial={{ opacity: 0, x: 25 }}
        whileInView={{ opacity: 1, x: 0 }}
        viewport={{ once: true }}
        transition={{
          duration: 0.7,
          delay: (index % 3) * 0.1 + 0.2,
          ease: 'easeOut',
        }}
        className="pointer-events-none absolute -top-[2px] right-3 select-none font-['Poppins'] text-[52px] font-bold leading-none text-white/[0.12] transition-colors duration-500 group-hover:text-[#d50818]/30 sm:right-4 sm:text-[60px] lg:right-0 lg:text-[clamp(48px,5.4vw,104px)]"
      >
        {item.number}
      </motion.span>

      <motion.span
        initial={{ opacity: 0, scale: 0.6, rotate: -15 }}
        whileInView={{ opacity: 1, scale: 1, rotate: 0 }}
        viewport={{ once: true }}
        transition={{
          duration: 0.65,
          delay: (index % 3) * 0.1 + 0.25,
          ease: 'easeOut',
        }}
        whileHover={{
          scale: 1.12,
          rotate: 5,
          transition: {
            duration: 0.25,
          },
        }}
        className="relative row-span-2 flex h-12 w-12 items-center justify-center rounded-full border border-[#d50818]/60 bg-[#d50818]/15 transition-shadow duration-500 group-hover:shadow-[0_0_18px_rgba(213,8,24,0.6)] sm:h-[52px] sm:w-[52px] lg:h-[clamp(32px,2.9vw,56px)] lg:w-[clamp(32px,2.9vw,56px)]"
      >
        <motion.span
          animate={{
            scale: [1, 1.18, 1],
            opacity: [0.2, 0.45, 0.2],
          }}
          transition={{
            duration: 2.4,
            repeat: Infinity,
            ease: 'easeInOut',
            delay: index * 0.2,
          }}
          className="absolute inset-0 rounded-full bg-[#d50818]/20 blur-md"
        />

        <Icon
          className="relative z-10 h-[44%] w-[44%] text-[#d50818]"
          strokeWidth={1.5}
        />
      </motion.span>

      <motion.h3
        initial={{ opacity: 0, y: 18 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{
          duration: 0.6,
          delay: (index % 3) * 0.1 + 0.3,
          ease: 'easeOut',
        }}
        className="relative mt-1 pr-14 font-['Urbanist'] text-[20px] font-bold leading-tight text-white sm:pr-16 lg:mt-[clamp(14px,1.4vw,28px)] lg:pr-0 lg:text-[clamp(14px,1.25vw,24px)]"
      >
        {item.title}
      </motion.h3>

      <motion.p
        initial={{ opacity: 0, y: 15 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{
          duration: 0.6,
          delay: (index % 3) * 0.1 + 0.4,
          ease: 'easeOut',
        }}
        className="relative mt-1.5 font-['Poppins'] text-[13px] leading-[1.65] text-white/60 lg:mt-[clamp(6px,0.6vw,12px)] lg:text-[clamp(10px,0.9vw,17px)] lg:leading-[1.6] lg:text-white/50"
      >
        {item.description}
      </motion.p>

      <motion.div
        initial={{ scaleX: 0 }}
        whileHover={{ scaleX: 1 }}
        transition={{
          duration: 0.4,
          ease: 'easeOut',
        }}
        className="absolute bottom-0 left-0 h-[2px] w-full origin-left bg-[#d50818]"
      />
    </motion.article>
  )
}

function ServiceSolutions() {
  const reduceMotion = useReducedMotion()
  const { title, accent, description, image, imageAlt } = solutionsHeader

  return (
    <section className="relative overflow-hidden bg-black px-5 py-14 text-white sm:px-8 sm:py-16 md:px-10 lg:px-[4.2%] lg:py-[clamp(50px,4.5vw,90px)]">
      {/* Mobile / tablet top glow */}
      <div className="pointer-events-none absolute -top-24 left-1/2 h-64 w-64 -translate-x-1/2 rounded-full bg-[#d50818]/10 blur-3xl lg:hidden" />

      <div className="relative mx-auto max-w-[1920px]">
        {/* Header */}
        <div className="flex flex-col gap-8 md:flex-row md:items-center md:justify-between md:gap-8 lg:items-start lg:gap-10">
          <div className="text-center md:max-w-[60%] md:text-left lg:max-w-[62%]">
            <motion.h2
              initial={{ opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.3 }}
              transition={{
                duration: 0.8,
                ease: 'easeOut',
              }}
              className="font-['Glacial Indifference'] text-[32px] font-light leading-[1.15] text-white sm:text-[42px] md:text-[44px] lg:text-[clamp(28px,3vw,58px)]"
            >
              {title} <span className="text-[#d50818]">{accent}</span>.
            </motion.h2>

            <motion.p
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.3 }}
              transition={{
                duration: 0.8,
                delay: 0.1,
                ease: 'easeOut',
              }}
              className="mx-auto mt-4 max-w-[520px] font-['Glacial Indifference'] text-[14px] leading-[1.7] text-white/80 sm:max-w-[600px] sm:text-[15px] md:mx-0 md:text-[16px] lg:mt-[clamp(14px,1.3vw,26px)] lg:max-w-none lg:text-[clamp(16px,1.17vw,22px)] lg:leading-[1.6] lg:text-white"
            >
              {description}
            </motion.p>
          </div>

          {/* Rotating image */}
          <motion.div
            initial={{ opacity: 0, scale: 0.8, rotate: -12 }}
            whileInView={{ opacity: 1, scale: 1, rotate: 0 }}
            viewport={{ once: true, amount: 0.3 }}
            transition={{
              duration: 1,
              ease: 'easeOut',
            }}
            whileHover={
              reduceMotion
                ? undefined
                : {
                    scale: 1.05,
                  }
            }
            className="relative order-first mx-auto w-[170px] shrink-0 sm:w-[210px] md:order-none md:mx-0 md:w-[230px] lg:order-none lg:mx-0 lg:mr-[6%] lg:w-[clamp(120px,14.5vw,280px)]"
          >
            {/* Mobile / tablet decorative rings */}
            <div className="pointer-events-none absolute inset-[-10%] rounded-full border border-white/10 lg:hidden" />
            <div className="pointer-events-none absolute inset-[-22%] rounded-full border border-dashed border-[#d50818]/20 lg:hidden" />

            <motion.div
              animate={
                reduceMotion
                  ? undefined
                  : {
                      scale: [1, 1.15, 1],
                      opacity: [0.2, 0.4, 0.2],
                    }
              }
              transition={{
                duration: 3,
                repeat: Infinity,
                ease: 'easeInOut',
              }}
              className="pointer-events-none absolute inset-[10%] rounded-full bg-[#d50818]/25 blur-3xl"
            />

            <motion.img
              src={image}
              alt={imageAlt}
              animate={
                reduceMotion
                  ? undefined
                  : {
                      rotate: 360,
                    }
              }
              transition={{
                duration: 30,
                ease: 'linear',
                repeat: Infinity,
              }}
              className="relative block h-auto w-full select-none object-contain"
              draggable={false}
            />
          </motion.div>
        </div>

        {/* Cards grid: separate cards on mobile/tablet, joined block on lg */}
        <motion.div
          initial={{ opacity: 0, y: 35 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.05 }}
          transition={{
            duration: 0.8,
            ease: 'easeOut',
          }}
          className="mt-10 grid grid-cols-1 gap-3 sm:mt-12 sm:grid-cols-2 sm:gap-4 lg:mx-auto lg:mt-[clamp(32px,5.4vw,100px)] lg:w-[82%] lg:grid-cols-3 lg:gap-px lg:overflow-hidden lg:rounded-[clamp(12px,1vw,20px)] lg:border lg:border-white/5 lg:bg-white/10"
        >
          {solutions.map((item, i) => (
            <SolutionCard
              key={item.id}
              item={item}
              index={i}
            />
          ))}
        </motion.div>
      </div>
    </section>
  )
}

export default ServiceSolutions