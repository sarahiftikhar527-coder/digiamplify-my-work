import { useEffect, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion, useInView } from 'framer-motion'
import { Lightbulb } from 'lucide-react'
import { goalHeader, goalServices } from '@/data/services/goal'

const toRad = (deg) => (deg * Math.PI) / 180

const orbitStyles = `
  @keyframes orbit-spin {
    to { transform: rotate(360deg); }
  }

  @keyframes orbit-counter-spin {
    to { transform: rotate(-360deg); }
  }

  .orbit-spin {
    animation: orbit-spin 60s linear infinite;
  }

  .orbit-counter {
    animation: orbit-counter-spin 60s linear infinite;
  }

  @media (prefers-reduced-motion: reduce) {
    .orbit-spin,
    .orbit-counter {
      animation: none;
    }
  }
`

function Spoke({ angle, index }) {
  return (
    <div
      className="pointer-events-none absolute left-1/2 top-1/2 z-0 h-0 origin-left"
      style={{
        width: 'var(--r)',
        transform: `rotate(${angle - 90}deg)`,
      }}
    >
      <motion.div
        initial={{ scaleX: 0, opacity: 0 }}
        whileInView={{ scaleX: 1, opacity: 1 }}
        viewport={{ once: true, amount: 0.3 }}
        transition={{
          duration: 0.8,
          delay: 0.4 + index * 0.08,
          ease: [0.16, 1, 0.3, 1],
        }}
        className="h-0 origin-left border-t border-dashed border-[#d50818]/35"
      />
    </div>
  )
}

function OrbitNode({ item, index, paused, onHoverChange, onNavigate }) {
  const Icon = item.icon

  const sin = Math.sin(toRad(item.angle)).toFixed(4)
  const cos = Math.cos(toRad(item.angle)).toFixed(4)

  return (
    <div
      className="absolute left-1/2 top-1/2 z-20 -translate-x-1/2 -translate-y-1/2"
      style={{
        left: `calc(50% + var(--r) * ${sin})`,
        top: `calc(50% - var(--r) * ${cos})`,
      }}
      onPointerEnter={() => onHoverChange(true)}
      onPointerLeave={() => onHoverChange(false)}
    >
      <div
        className="orbit-counter"
        style={{ animationPlayState: paused ? 'paused' : 'running' }}
      >
        <motion.button
          type="button"
          onClick={() => onNavigate(item.slug)}
          aria-label={`View ${item.label} service`}
          whileHover={{ scale: 1.12 }}
          whileTap={{ scale: 0.95 }}
          transition={{ duration: 0.25 }}
          className="group relative flex cursor-pointer flex-col items-center border-0 bg-transparent p-0 outline-none focus-visible:ring-2 focus-visible:ring-[#d50818] focus-visible:ring-offset-4 focus-visible:ring-offset-black"
        >
          <span className="relative flex h-10 w-10 items-center justify-center rounded-full border border-[#d50818] bg-[#080808] shadow-[0_0_15px_rgba(213,8,24,0.5)] sm:h-10 sm:w-10">
            <motion.span
              className="absolute inset-0 rounded-full bg-[#d50818]/10"
              whileHover={{ scale: 1.6, opacity: 0.7 }}
              transition={{ duration: 0.25 }}
            />

            <Icon
              className="relative z-10 h-[18px] w-[18px] text-[#d50818] sm:h-[18px] sm:w-[18px]"
              strokeWidth={1.5}
            />
          </span>

          <span className="absolute left-1/2 top-full mt-1.5 w-[84px] -translate-x-1/2 text-center font-['Poppins'] text-[10.5px] font-medium leading-tight text-white/85 transition-colors duration-300 group-hover:text-white sm:w-auto sm:whitespace-nowrap sm:text-[11px] lg:text-[12px] lg:text-white/80">
            {item.label}
          </span>
        </motion.button>
      </div>
    </div>
  )
}

function ServiceGoal() {
  const navigate = useNavigate()

  const sectionRef = useRef(null)
  const inView = useInView(sectionRef, { once: true, amount: 0.35 })

  // Starts OFF, then turns itself ON like a real bulb (with a flicker)
  // as soon as the section is visible, and then stays ON.
  // The bulb is decorative only: users cannot toggle it.
  const [lightOn, setLightOn] = useState(false)
  const [orbitPaused, setOrbitPaused] = useState(false)

  useEffect(() => {
    if (!inView) return

    const reduceMotion = window.matchMedia(
      '(prefers-reduced-motion: reduce)'
    ).matches

    // [time in ms, light state]
    const sequence = reduceMotion
      ? [[600, true]]
      : [
          [700, true],
          [850, false],
          [1000, true],
          [1100, false],
          [1250, true],
          [1330, false],
          [1550, true],
        ]

    const timers = sequence.map(([delay, state]) =>
      setTimeout(() => setLightOn(state), delay)
    )

    return () => timers.forEach(clearTimeout)
  }, [inView])

  const handleServiceNavigate = (slug) => {
    if (!slug) return

    setOrbitPaused(false)
    navigate(`/services/${slug}`)
  }

  return (
    <section
      ref={sectionRef}
      className="relative overflow-hidden bg-[radial-gradient(circle_at_50%_45%,#1a1a1a_0%,#111111_45%,#000000_100%)] px-4 py-14 text-white sm:px-8 sm:py-16 md:px-10 md:py-20 lg:px-[3.8%] lg:py-[clamp(50px,5vw,96px)]"
    >
      <style>{orbitStyles}</style>

      <div
        className={`pointer-events-none absolute left-1/2 top-[58%] h-[340px] w-[340px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-[#d50818]/15 blur-[110px] transition-opacity duration-700 sm:h-[480px] sm:w-[480px] lg:hidden ${
          lightOn ? 'opacity-100' : 'opacity-30'
        }`}
      />

      <div className="relative mx-auto max-w-[1920px]">
        <div className="flex flex-col gap-4 text-center md:flex-row md:items-start md:justify-between md:gap-8 md:text-left lg:items-start lg:justify-between lg:gap-10">
          <motion.h2
            initial={{ opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.3 }}
            transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
            className="font-['Glacial Indifference'] text-[32px] font-normal leading-[1.15] text-white sm:text-[40px] md:max-w-[58%] md:text-[44px] lg:max-w-none lg:text-[clamp(32px,3vw,58px)]"
          >
            {goalHeader.title}
          </motion.h2>

          <motion.p
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.3 }}
            transition={{
              duration: 0.8,
              delay: 0.1,
              ease: [0.16, 1, 0.3, 1],
            }}
            className="mx-auto max-w-[320px] font-['Glacial Indifference'] text-[14px] font-normal leading-[1.65] text-white/55 sm:max-w-[380px] sm:text-[15px] md:mx-0 md:max-w-[270px] lg:max-w-[clamp(240px,22vw,420px)] lg:text-[clamp(14px,0.95vw,18px)] lg:leading-[1.6] lg:text-white/50"
          >
            {goalHeader.description}
          </motion.p>
        </div>

        <div className="relative mx-auto mt-12 aspect-square w-full max-w-[420px] [--r:36%] sm:mt-14 sm:max-w-[560px] sm:[--r:38%] md:max-w-[620px] lg:mt-6 lg:max-w-[640px] lg:[--r:40%]">
          <motion.div
            initial={{ opacity: 0, scale: 0.82 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true, amount: 0.25 }}
            transition={{
              opacity: { duration: 1, ease: [0.16, 1, 0.3, 1] },
              scale: { duration: 1, ease: [0.16, 1, 0.3, 1] },
            }}
            className="absolute inset-0"
          >
            <motion.div
              animate={{
                borderColor: lightOn
                  ? 'rgba(213,8,24,0.7)'
                  : 'rgba(255,255,255,0.45)',
                boxShadow: lightOn
                  ? '0 0 25px rgba(213,8,24,0.25)'
                  : '0 0 0 rgba(0,0,0,0)',
              }}
              transition={{ duration: 0.5 }}
              className="pointer-events-none absolute left-1/2 top-1/2 aspect-square w-[calc(var(--r)*2)] -translate-x-1/2 -translate-y-1/2 rounded-full border"
            />

            <motion.div
              animate={{
                opacity: lightOn ? [0.25, 0.7, 0.25] : [0.15, 0.35, 0.15],
                borderColor: lightOn
                  ? 'rgba(213,8,24,0.5)'
                  : 'rgba(213,8,24,0.2)',
              }}
              transition={{
                duration: lightOn ? 1.5 : 3,
                repeat: Infinity,
                ease: 'easeInOut',
              }}
              className="pointer-events-none absolute left-1/2 top-1/2 aspect-square w-[calc(var(--r)*1.72)] -translate-x-1/2 -translate-y-1/2 rounded-full border"
            />

            <motion.div
              animate={{
                opacity: lightOn ? [0.2, 0.8, 0.2] : 0.15,
              }}
              transition={{
                opacity: {
                  duration: 1.8,
                  repeat: Infinity,
                  ease: 'easeInOut',
                },
              }}
              className="pointer-events-none absolute left-1/2 top-1/2 aspect-square w-[calc(var(--r)*2.12)] -translate-x-1/2 -translate-y-1/2 rounded-full border border-dashed border-[#d50818]/40"
            />

            <div
              className="orbit-spin absolute inset-0"
              style={{
                animationPlayState: orbitPaused ? 'paused' : 'running',
              }}
            >
              {goalServices.map((item, i) => (
                <Spoke key={item.id} angle={item.angle} index={i} />
              ))}

              {goalServices.map((item, i) => (
                <OrbitNode
                  key={item.id}
                  item={item}
                  index={i}
                  paused={orbitPaused}
                  onHoverChange={setOrbitPaused}
                  onNavigate={handleServiceNavigate}
                />
              ))}
            </div>
          </motion.div>

          <motion.div
            animate={{
              opacity: lightOn ? [0.3, 0.75, 0.35] : 0,
              scale: lightOn ? [0.8, 1.25, 0.95] : 0.7,
            }}
            transition={{
              duration: 2,
              repeat: lightOn ? Infinity : 0,
              ease: 'easeInOut',
            }}
            className="pointer-events-none absolute left-1/2 top-1/2 z-10 aspect-square w-[calc(var(--r)*1.05)] -translate-x-1/2 -translate-y-1/2 rounded-full bg-[#d50818]/25 blur-[45px] sm:blur-[65px]"
          />

          <div className="pointer-events-none absolute left-1/2 top-1/2 z-50 aspect-square w-[calc(var(--r)*0.8)] -translate-x-1/2 -translate-y-1/2 sm:w-[calc(var(--r)*0.68)] lg:w-[calc(var(--r)*0.66)]">
            {lightOn && (
              <>
                <motion.div
                  initial={{ opacity: 0.8, scale: 0.8 }}
                  animate={{ opacity: 0, scale: 1.9 }}
                  transition={{
                    duration: 1.8,
                    repeat: Infinity,
                    ease: 'easeOut',
                  }}
                  className="pointer-events-none absolute inset-0 rounded-full border border-[#d50818]/80"
                />

                <motion.div
                  initial={{ opacity: 0.6, scale: 0.8 }}
                  animate={{ opacity: 0, scale: 2.3 }}
                  transition={{
                    duration: 1.8,
                    delay: 0.6,
                    repeat: Infinity,
                    ease: 'easeOut',
                  }}
                  className="pointer-events-none absolute inset-0 rounded-full border border-[#d50818]/40"
                />
              </>
            )}

            {/* Bulb: decorative only, not clickable */}
            <motion.div
              aria-hidden="true"
              animate={{
                boxShadow: lightOn
                  ? [
                      '0 0 25px rgba(213,8,24,0.6)',
                      '0 0 55px rgba(213,8,24,0.95)',
                      '0 0 30px rgba(213,8,24,0.65)',
                    ]
                  : '0 0 20px rgba(213,8,24,0.4)',
              }}
              transition={{
                boxShadow: {
                  duration: 1.6,
                  repeat: lightOn ? Infinity : 0,
                  ease: 'easeInOut',
                },
              }}
              className="pointer-events-none relative flex h-full w-full items-center justify-center rounded-full border border-white/40 bg-[#070707] p-[8%]"
            >
              <motion.div
                animate={{
                  opacity: lightOn ? [0.3, 0.8, 0.3] : 0.2,
                  scale: lightOn ? [0.9, 1.12, 0.95] : 1,
                }}
                transition={{
                  duration: 1.5,
                  repeat: lightOn ? Infinity : 0,
                  ease: 'easeInOut',
                }}
                className="pointer-events-none absolute inset-[-5%] rounded-full bg-[#d50818]/35 blur-2xl"
              />

              <motion.div
                animate={{
                  borderColor: lightOn ? '#ff2438' : '#d50818',
                  backgroundColor: lightOn ? '#100303' : '#080808',
                }}
                transition={{ duration: 0.4 }}
                className="relative flex h-full w-full items-center justify-center rounded-full border-2"
              >
                <motion.div
                  animate={{
                    scale: lightOn ? [1, 1.12, 1] : 1,
                    filter: lightOn
                      ? [
                          'drop-shadow(0 0 5px rgba(213,8,24,0.7))',
                          'drop-shadow(0 0 18px rgba(255,25,45,1))',
                          'drop-shadow(0 0 8px rgba(213,8,24,0.8))',
                        ]
                      : 'drop-shadow(0 0 5px rgba(213,8,24,0.5))',
                  }}
                  transition={{
                    duration: 1.5,
                    repeat: lightOn ? Infinity : 0,
                    ease: 'easeInOut',
                  }}
                  className="flex h-full w-full items-center justify-center"
                >
                  <Lightbulb
                    className="h-[60%] w-[60%] text-[#d50818]"
                    strokeWidth={1.15}
                  />
                </motion.div>

                <motion.span
                  animate={{
                    opacity: lightOn ? [0.2, 1, 0.2] : 0.35,
                  }}
                  transition={{
                    duration: 1,
                    repeat: lightOn ? Infinity : 0,
                    ease: 'easeInOut',
                  }}
                  className="absolute left-[24%] top-[22%] h-2 w-2 rounded-full bg-[#ff5360] blur-[1px]"
                />
              </motion.div>
            </motion.div>
          </div>
        </div>
      </div>
    </section>
  )
}

export default ServiceGoal