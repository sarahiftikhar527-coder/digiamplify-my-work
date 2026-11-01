import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import { avatars, stats } from '@/data/about/AboutOverview'

function StoreIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      className="h-[55%] w-[55%]"
      fill="none"
      stroke="#d50818"
      strokeWidth="1.6"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M4 9l1.5-5h13L20 9" />
      <path d="M4 9a2.7 2.7 0 0 0 5.3 0 2.7 2.7 0 0 0 5.4 0A2.7 2.7 0 0 0 20 9" />
      <path d="M5 11.5V20h14v-8.5" />
      <path d="M10 20v-4.5h4V20" />
    </svg>
  )
}

function FingerprintIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      className="h-[55%] w-[55%]"
      fill="none"
      stroke="#d50818"
      strokeWidth="1.6"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M12 11v4c0 2-.5 3.5-1.5 5" />
      <path d="M8.5 14c0 2.5-.3 4-1 5.5" />
      <path d="M15.5 12.5c0 3-.4 5-1.4 7" />
      <path d="M5 10a7 7 0 0 1 14 0v1" />
      <path d="M8.5 10.5a3.5 3.5 0 0 1 7 0" />
      <path d="M5.5 15.5c-.3 1-.7 2-1.2 3" />
    </svg>
  )
}

function AnimatedNumber({ value, delay = 0 }) {
  const [count, setCount] = useState(0)
  const [started, setStarted] = useState(false)

  const number = parseInt(value.replace(/\D/g, ''), 10)
  const suffix = value.replace(/[0-9]/g, '')

  useEffect(() => {
    if (!started) return

    let startTime
    let animationFrame

    const duration = 1800

    const animate = (time) => {
      if (!startTime) startTime = time

      const progress = Math.min((time - startTime) / duration, 1)
      const easedProgress = 1 - Math.pow(1 - progress, 3)

      setCount(Math.floor(easedProgress * number))

      if (progress < 1) {
        animationFrame = requestAnimationFrame(animate)
      } else {
        setCount(number)
      }
    }

    const timer = setTimeout(() => {
      animationFrame = requestAnimationFrame(animate)
    }, delay * 1000)

    return () => {
      clearTimeout(timer)
      cancelAnimationFrame(animationFrame)
    }
  }, [started, number, delay])

  return (
    <motion.span
      initial={{ opacity: 0, scale: 0.7, y: 15 }}
      whileInView={{
        opacity: 1,
        scale: 1,
        y: 0,
      }}
      viewport={{ once: true, amount: 0.5 }}
      transition={{
        duration: 0.7,
        delay,
        ease: 'easeOut',
      }}
      onViewportEnter={() => setStarted(true)}
      className="font-['Urbanist'] text-[30px] font-light leading-none text-[#d50818] sm:text-[44px] lg:text-[clamp(32px,3.6vw,70px)]"
    >
      {count}
      {suffix}
    </motion.span>
  )
}

function InfoCard({ icon, title, text, delay }) {
  return (
    <motion.article
      initial={{
        opacity: 0,
        y: 50,
        scale: 0.97,
      }}
      whileInView={{
        opacity: 1,
        y: 0,
        scale: 1,
      }}
      viewport={{
        once: true,
        amount: 0.15,
      }}
      transition={{
        duration: 0.85,
        delay,
        ease: 'easeOut',
      }}
      whileHover={{
        y: -6,
        transition: {
          duration: 0.3,
          ease: 'easeOut',
        },
      }}
      className="relative flex flex-col overflow-hidden rounded-[18px] border border-white/20 bg-[#020202] p-5 shadow-[0_0_25px_rgba(255,255,255,0.08),inset_0_0_20px_rgba(255,255,255,0.025)] transition-all duration-500 hover:border-white/35 hover:shadow-[0_0_40px_rgba(255,255,255,0.14),inset_0_0_25px_rgba(255,255,255,0.04)] sm:p-6 lg:p-[clamp(16px,1.9vw,36px)]"
    >
      <motion.div
        initial={{ scale: 0.5, opacity: 0 }}
        whileInView={{ scale: 1, opacity: 1 }}
        viewport={{ once: true }}
        transition={{
          duration: 0.6,
          delay: delay + 0.15,
          ease: 'easeOut',
        }}
        className="pointer-events-none absolute -right-6 -top-6 h-24 w-24 rounded-full bg-[#d50818]/20 blur-2xl"
      />

      <motion.div
        initial={{ opacity: 0, scale: 0.7, rotate: -10 }}
        whileInView={{
          opacity: 1,
          scale: 1,
          rotate: 0,
        }}
        viewport={{ once: true }}
        transition={{
          duration: 0.7,
          delay: delay + 0.2,
          ease: 'easeOut',
        }}
        className="relative flex h-[40px] w-[40px] items-center justify-center rounded-lg border border-[#d50818]/40 bg-[#d50818]/15 sm:h-[44px] sm:w-[44px] lg:h-[clamp(34px,3.1vw,60px)] lg:w-[clamp(34px,3.1vw,60px)]"
      >
        {icon}
      </motion.div>

      <motion.h3
        initial={{ opacity: 0, x: -20 }}
        whileInView={{ opacity: 1, x: 0 }}
        viewport={{ once: true }}
        transition={{
          duration: 0.7,
          delay: delay + 0.3,
          ease: 'easeOut',
        }}
        className="mt-4 font-['Urbanist'] text-[22px] font-bold leading-tight text-white lg:mt-[clamp(14px,1.6vw,30px)] lg:text-[clamp(18px,1.63vw,32px)]"
      >
        {title}
      </motion.h3>

      <motion.p
        initial={{ opacity: 0, y: 15 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{
          duration: 0.7,
          delay: delay + 0.4,
          ease: 'easeOut',
        }}
        className="mt-2 font-['Poppins'] text-[14px] leading-[1.65] text-white/85 lg:mt-[clamp(8px,0.8vw,16px)] lg:text-[clamp(11px,0.95vw,18px)] lg:text-white/90"
      >
        {text}
      </motion.p>
    </motion.article>
  )
}

function AboutOverview() {
  return (
    <motion.section
      initial={{ opacity: 0, y: 70 }}
      whileInView={{
        opacity: 1,
        y: 0,
      }}
      viewport={{
        once: true,
        amount: 0.05,
      }}
      transition={{
        duration: 1,
        ease: 'easeOut',
      }}
      className="relative z-10 -mt-8 overflow-hidden rounded-t-[28px] bg-[radial-gradient(ellipse_at_85%_70%,#262626_0%,#111_45%,#050505_100%)] pb-[64px] text-white sm:-mt-[60px] sm:rounded-t-[36px] sm:pb-[80px] md:-mt-[80px] lg:-mt-[250px] lg:rounded-none lg:pb-[clamp(80px,7vw,135px)]"
    >
      <div className="mx-auto max-w-[1920px] px-4 py-10 sm:px-10 sm:py-12 lg:px-[1.8%] lg:py-[clamp(30px,2.7vw,52px)]">
        <div className="grid grid-cols-1 gap-4 sm:gap-[18px] lg:h-[clamp(520px,53.5vw,1030px)] lg:grid-cols-[35%_1fr] lg:gap-[clamp(14px,1.6vw,30px)]">
          <div className="grid gap-4 sm:gap-[18px] lg:grid-rows-[497fr_77fr]">
            <motion.div
              initial={{
                opacity: 0,
                x: -60,
                scale: 0.97,
              }}
              whileInView={{
                opacity: 1,
                x: 0,
                scale: 1,
              }}
              viewport={{
                once: true,
                amount: 0.15,
              }}
              transition={{
                duration: 0.9,
                ease: 'easeOut',
              }}
              className="rounded-[18px] border border-white/15 bg-[#020202] p-3 shadow-[0_0_28px_rgba(255,255,255,0.07),inset_0_0_22px_rgba(255,255,255,0.025)] transition-all duration-500 hover:border-white/30 hover:shadow-[0_0_38px_rgba(255,255,255,0.12),inset_0_0_25px_rgba(255,255,255,0.04)] sm:p-4 lg:p-[6%]"
            >
              <motion.img
                initial={{
                  scale: 1.08,
                }}
                whileInView={{
                  scale: 1,
                }}
                viewport={{
                  once: true,
                  amount: 0.15,
                }}
                transition={{
                  duration: 1.2,
                  ease: 'easeOut',
                }}
                src="/images/about/overview/AboutOverview.webp"
                alt="DigiAmplify team in a meeting"
                className="aspect-[4/5] w-full rounded-[14px] object-cover sm:aspect-[16/10] lg:aspect-auto lg:h-full lg:rounded-[18px]"
              />
            </motion.div>

            <motion.div
              initial={{
                opacity: 0,
                y: 35,
              }}
              whileInView={{
                opacity: 1,
                y: 0,
              }}
              viewport={{
                once: true,
                amount: 0.2,
              }}
              transition={{
                duration: 0.8,
                delay: 0.1,
                ease: 'easeOut',
              }}
              className="flex items-center gap-4 rounded-[28px] border border-white/20 bg-[#020202] px-5 py-4 shadow-[0_0_22px_rgba(255,255,255,0.07),inset_0_0_18px_rgba(255,255,255,0.025)] transition-all duration-500 hover:border-white/35 hover:shadow-[0_0_34px_rgba(255,255,255,0.12)] lg:rounded-[32px] lg:px-[5%] lg:py-0"
            >
              <div className="flex shrink-0 -space-x-3">
                {avatars.map((src, i) => (
                  <motion.img
                    key={src}
                    initial={{
                      opacity: 0,
                      scale: 0.5,
                      x: 15,
                    }}
                    whileInView={{
                      opacity: 1,
                      scale: 1,
                      x: 0,
                    }}
                    viewport={{
                      once: true,
                    }}
                    transition={{
                      duration: 0.5,
                      delay: 0.2 + i * 0.1,
                      ease: 'easeOut',
                    }}
                    src={src}
                    alt=""
                    className="h-10 w-10 rounded-full border-2 border-[#020202] object-cover lg:h-[clamp(34px,3vw,58px)] lg:w-[clamp(34px,3vw,58px)]"
                    style={{ zIndex: i }}
                  />
                ))}
              </div>

              <motion.p
                initial={{
                  opacity: 0,
                  x: 20,
                }}
                whileInView={{
                  opacity: 1,
                  x: 0,
                }}
                viewport={{
                  once: true,
                }}
                transition={{
                  duration: 0.7,
                  delay: 0.5,
                  ease: 'easeOut',
                }}
                className="font-['Poppins'] text-[13px] leading-[1.45] text-white lg:text-[clamp(10px,0.95vw,18px)]"
              >
                Yours crafting premium digital system for ambitious founders
                and enterprise teams.
              </motion.p>
            </motion.div>
          </div>

          <div className="grid gap-4 sm:gap-[18px] lg:grid-rows-[147fr_263fr_144fr] lg:gap-[clamp(14px,1.6vw,30px)]">
            <motion.div
              initial={{
                opacity: 0,
                x: 60,
              }}
              whileInView={{
                opacity: 1,
                x: 0,
              }}
              viewport={{
                once: true,
                amount: 0.15,
              }}
              transition={{
                duration: 0.9,
                delay: 0.1,
                ease: 'easeOut',
              }}
              className="flex items-center rounded-[18px] border border-white/20 bg-[#020202] px-5 py-7 shadow-[0_0_25px_rgba(255,255,255,0.08),inset_0_0_20px_rgba(255,255,255,0.025)] transition-all duration-500 hover:border-white/35 hover:shadow-[0_0_40px_rgba(255,255,255,0.14),inset_0_0_25px_rgba(255,255,255,0.04)] sm:px-6 sm:py-8 lg:px-[3.8%] lg:py-0"
            >
              <p className="font-['Glacial_Indifference'] text-[21px] font-medium leading-[1.35] text-white sm:text-[26px] lg:text-[clamp(16px,1.9vw,37px)] lg:leading-[1.4]">
                The agency behind category defining brands built to lead,
                influence, and leave a lasting impression not simply blend in.
              </p>
            </motion.div>

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 sm:gap-[18px] lg:gap-[clamp(14px,1.6vw,30px)]">
              <InfoCard
                delay={0.15}
                icon={<StoreIcon />}
                title="Background"
                text="Founded with a passion for innovation and digital excellence, our agency was built to help businesses navigate an increasingly competitive landscape. By combining strategic thinking, creative expertise, and advanced technology, we create solutions that not only solve challenges but unlock new opportunities for growth, performance, and long-term success."
              />

              <InfoCard
                delay={0.25}
                icon={<FingerprintIcon />}
                title="Core Identity"
                text="At our core, we are a team of strategists, creatives, and technology experts driven by a shared commitment to excellence. Our identity is defined by innovation, precision, and a relentless focus on delivering meaningful digital experiences that create lasting impact for the brands we serve."
              />
            </div>

            <motion.div
              initial={{
                opacity: 0,
                y: 40,
                scale: 0.98,
              }}
              whileInView={{
                opacity: 1,
                y: 0,
                scale: 1,
              }}
              viewport={{
                once: true,
                amount: 0.2,
              }}
              transition={{
                duration: 0.9,
                delay: 0.2,
                ease: 'easeOut',
              }}
              className="flex flex-col rounded-[18px] border border-white/20 bg-[#020202] px-4 py-5 shadow-[0_0_25px_rgba(255,255,255,0.08),inset_0_0_20px_rgba(255,255,255,0.025)] transition-all duration-500 hover:border-white/35 hover:shadow-[0_0_40px_rgba(255,255,255,0.14),inset_0_0_25px_rgba(255,255,255,0.04)] sm:px-6 sm:py-6 lg:px-[3.8%] lg:py-[1.6%]"
            >
              <motion.p
                initial={{
                  opacity: 0,
                  y: 10,
                }}
                whileInView={{
                  opacity: 1,
                  y: 0,
                }}
                viewport={{
                  once: true,
                }}
                transition={{
                  duration: 0.6,
                  delay: 0.35,
                }}
                className="font-['Urbanist'] text-[14px] text-white/50 lg:text-[clamp(11px,0.95vw,18px)]"
              >
                Company Overview
              </motion.p>

              <div className="mt-5 grid flex-1 grid-cols-3 lg:mt-0">
                {stats.map((s, i) => (
                  <div
                    key={s.label}
                    className={`flex flex-col items-center justify-center px-1 text-center ${
                      i > 0 ? 'border-l border-white/10' : ''
                    }`}
                  >
                    <AnimatedNumber
                      value={s.value}
                      delay={0.4 + i * 0.2}
                    />

                    <motion.span
                      initial={{
                        opacity: 0,
                        y: 10,
                      }}
                      whileInView={{
                        opacity: 1,
                        y: 0,
                      }}
                      viewport={{
                        once: true,
                      }}
                      transition={{
                        duration: 0.6,
                        delay: 0.7 + i * 0.15,
                      }}
                      className="mt-2 font-['Poppins'] text-[11px] leading-tight text-white/90 sm:text-[13px] lg:mt-[0.8vw] lg:text-[clamp(10px,0.85vw,16px)] lg:leading-normal lg:text-white"
                    >
                      {s.label}
                    </motion.span>
                  </div>
                ))}
              </div>
            </motion.div>
          </div>
        </div>
      </div>
    </motion.section>
  )
}

export default AboutOverview
