import { motion } from 'framer-motion'
import { missionData } from '@/data/about/mission'

const icons = {
  mission: (
    <svg
      viewBox="0 0 24 24"
      className="h-[58%] w-[58%]"
      fill="none"
      stroke="#d50818"
      strokeWidth="1.6"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M4 9V4h5" />
      <path d="M20 9V4h-5" />
      <path d="M4 15v5h5" />
      <path d="M20 15v5h-5" />
      <rect x="9" y="9" width="6" height="6" rx="1" />
    </svg>
  ),
  vision: (
    <svg
      viewBox="0 0 24 24"
      className="h-[58%] w-[58%]"
      fill="none"
      stroke="#d50818"
      strokeWidth="1.6"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M10.5 6.5l7-3 2 5-7 3z" />
      <path d="M8.5 11.5l-3.5 1.5 1.5 3 3.5-1.5z" />
      <path d="M12 12l3 8" />
      <path d="M11 13.5L8.5 20" />
    </svg>
  ),
}

const container = {
  hidden: {},
  show: {
    transition: {
      staggerChildren: 0.18,
    },
  },
}

const card = {
  hidden: {
    opacity: 0,
    y: 50,
  },
  show: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.9,
      ease: 'easeOut',
    },
  },
}

const inner = {
  hidden: {},
  show: {
    transition: {
      staggerChildren: 0.12,
      delayChildren: 0.35,
    },
  },
}

const line = {
  hidden: {
    opacity: 0,
    y: 24,
  },
  show: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.7,
      ease: 'easeOut',
    },
  },
}

function AboutMission() {
  return (
    <section className="relative overflow-hidden bg-[radial-gradient(ellipse_at_50%_100%,#262626_0%,#0f0f0f_45%,#000_100%)] text-white">
      <motion.div
        variants={container}
        initial="hidden"
        whileInView="show"
        viewport={{ once: true, amount: 0.15 }}
        className="mx-auto grid max-w-[1920px] grid-cols-1 gap-4 px-4 py-10 sm:gap-6 sm:px-8 sm:py-12 lg:grid-cols-2 lg:gap-[3.2%] lg:px-[8.7%] lg:py-[clamp(30px,1.5vw,40px)]"
      >
        {missionData.map((item) => (
          <motion.article
            key={item.id}
            variants={card}
            className="relative flex min-h-[320px] flex-col overflow-hidden rounded-[16px] border border-white/10 bg-gradient-to-br from-[#1b1b1b] via-[#0d0d0d] to-[#050505] p-6 sm:min-h-[340px] sm:p-8 lg:min-h-0 lg:rounded-[14px] lg:aspect-[424/456] lg:p-[clamp(24px,4vw,76px)] lg:pt-[clamp(24px,2.8vw,54px)]"
          >
            <motion.div
              animate={{
                opacity: [0.55, 1, 0.55],
                scale: [1, 1.12, 1],
              }}
              transition={{
                duration: 5,
                repeat: Infinity,
                ease: 'easeInOut',
              }}
              className="pointer-events-none absolute -left-10 -top-10 h-44 w-44 rounded-full bg-[#d50818]/35 blur-3xl lg:h-[16vw] lg:w-[16vw]"
            />

            <motion.div
              variants={line}
              className="relative flex items-center justify-between lg:pl-[clamp(0px,1.8vw,34px)]"
            >
              <span className="font-['Glacial_Indifference'] text-[14px] text-white/60 lg:text-[clamp(12px,1.15vw,22px)]">
                {item.label}
              </span>

              <motion.span
                whileHover={{
                  rotate: 8,
                  scale: 1.08,
                }}
                transition={{
                  type: 'spring',
                  stiffness: 300,
                  damping: 15,
                }}
                className="flex h-[38px] w-[38px] items-center justify-center rounded-md border border-[#d50818]/50 bg-[#d50818]/15 lg:h-[clamp(32px,2.85vw,54px)] lg:w-[clamp(32px,2.85vw,54px)]"
              >
                {icons[item.icon]}
              </motion.span>
            </motion.div>

            <motion.div
              variants={inner}
              className="relative mt-8 flex flex-1 flex-col sm:mt-10 lg:mt-[clamp(30px,5.5vw,100px)]"
            >
              <h2 className="font-['Glacial_Indifference'] text-[28px] font-light leading-[1.2] text-white sm:text-[36px] lg:text-[clamp(26px,2.83vw,54px)] lg:leading-[1.22]">
                {item.heading.map((text, i) => (
                  <motion.span
                    key={i}
                    variants={line}
                    className="block"
                  >
                    {text}
                  </motion.span>
                ))}
              </h2>

              <motion.p
                variants={line}
                className="mt-6 border-t border-white/10 pt-6 font-['Poppins'] text-[14px] leading-[1.7] text-white/90 sm:mt-8 sm:pt-7 sm:text-[15px] lg:mt-[clamp(50px,5vw,95px)] lg:border-t-0 lg:pb-0 lg:pt-0 lg:text-[clamp(11px,1.13vw,21px)] lg:leading-[1.6] lg:text-white/95"
              >
                {item.description}
              </motion.p>
            </motion.div>
          </motion.article>
        ))}
      </motion.div>
    </section>
  )
}

export default AboutMission
