import { useLayoutEffect, useRef, useState } from 'react'
import { motion } from 'framer-motion'

const HERO_IMAGE = '/images/about/hero/hero1.webp'

const ease = [0.16, 1, 0.3, 1]

const textReveal = {
  hidden: { opacity: 0, y: 45, filter: 'blur(8px)' },
  show: {
    opacity: 1,
    y: 0,
    filter: 'blur(0px)',
    transition: { duration: 1, ease },
  },
}

const imageReveal = {
  hidden: {
    opacity: 0,
    y: 70,
    scale: 1.12,
    clipPath: 'inset(100% 0% 0% 0%)',
  },
  show: {
    opacity: 1,
    y: 0,
    scale: 1,
    clipPath: 'inset(0% 0% 0% 0%)',
    transition: { duration: 1.35, ease },
  },
}

/* Ek card: andar poori image hai, sirf apna hissa nazar aata hai */
function SliceCard({
  alt,
  delay = 0,
  slotClass = '',
  cardClass = '',
  layout,
  index,
  slotRef,
}) {
  const slice = layout.slices[index]

  return (
    <div ref={slotRef} className={slotClass}>
      <motion.div
        initial="hidden"
        animate="show"
        variants={imageReveal}
        transition={{ delay }}
        whileHover={{
          scale: 1.02,
          transition: { duration: 0.5, ease: 'easeOut' },
        }}
        className={`relative h-full w-full overflow-hidden ${cardClass}`}
      >
        {slice && (
          <img
            src={HERO_IMAGE}
            alt={alt}
            draggable={false}
            className="absolute max-w-none object-cover grayscale"
            style={{
              width: layout.w,
              height: layout.h,
              left: -slice.left,
              top: -slice.top,
            }}
          />
        )}

        <motion.div
          initial={{ x: '-120%' }}
          animate={{ x: '120%' }}
          transition={{ duration: 1, delay: delay + 0.25, ease: 'easeInOut' }}
          className="pointer-events-none absolute inset-0 z-10 bg-gradient-to-r from-transparent via-white/10 to-transparent"
        />
      </motion.div>
    </div>
  )
}

function AboutHero() {
  const wrapperRef = useRef(null)
  const slotRefs = useRef([])
  const [layout, setLayout] = useState({ w: 0, h: 0, slices: [] })

  useLayoutEffect(() => {
    const measure = () => {
      const wrapper = wrapperRef.current
      if (!wrapper) return
      const wr = wrapper.getBoundingClientRect()

      const slices = slotRefs.current.map((el) => {
        if (!el) return null
        const r = el.getBoundingClientRect()
        return { left: r.left - wr.left, top: r.top - wr.top }
      })

      setLayout({ w: wr.width, h: wr.height, slices })
    }

    measure()

    const ro = new ResizeObserver(measure)
    ro.observe(wrapperRef.current)
    slotRefs.current.forEach((el) => el && ro.observe(el))
    window.addEventListener('resize', measure)

    return () => {
      ro.disconnect()
      window.removeEventListener('resize', measure)
    }
  }, [])

  const setSlot = (i) => (el) => {
    slotRefs.current[i] = el
  }

  return (
    <section className="relative overflow-hidden bg-[#0b0b0b] text-white">
      <motion.div
        initial="hidden"
        animate="show"
        className="mx-auto max-w-[1920px] px-5 pb-20 pt-12 sm:px-8 sm:pb-24 sm:pt-14 md:px-10 md:pb-28 md:pt-16 lg:pb-[117px] lg:pl-[6.5%] lg:pr-[7.7%] lg:pt-[75px]"
      >
        <div className="grid grid-cols-1 gap-8 sm:gap-10 lg:grid-cols-[30%_70%] lg:gap-0">
          <div className="relative z-30 flex flex-col lg:block lg:min-h-[768px]">
            <motion.p
              variants={textReveal}
              transition={{ duration: 1, delay: 0.25, ease }}
              className="order-2 mt-5 max-w-[340px] text-[14px] leading-[1.7] text-white/80 sm:mt-6 sm:max-w-[440px] sm:text-[15px] md:max-w-[540px] md:text-[16px] lg:absolute lg:left-0 lg:top-[155px] lg:order-none lg:mt-0 lg:max-w-[320px] lg:text-[12px] lg:leading-[1.5] lg:text-white"
            >
              We partner with ambitious brands to create meaningful digital
              experiences that drive growth and lasting impact. Through a blend
              of strategic thinking, creative excellence, and technical
              expertise, we deliver solutions designed to help businesses
              thrive in an increasingly digital world.
            </motion.p>

            <motion.h1
              initial={{ opacity: 0, y: 50, filter: 'blur(12px)' }}
              animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
              transition={{ duration: 1.15, delay: 0.45, ease }}
              whileHover={{
                scale: 1.02,
                transition: { duration: 0.3, ease: 'easeOut' },
              }}
              className="order-1 mt-0 text-[64px] font-normal leading-[0.9] tracking-[-0.04em] sm:text-[88px] md:text-[112px] lg:absolute lg:left-[22%] lg:top-[390px] lg:order-none lg:mt-0 lg:whitespace-nowrap lg:text-[clamp(80px,6.2vw,118px)]"
            >
              About{' '}
              <motion.span
                initial={{ opacity: 0, x: 35, scale: 0.8 }}
                animate={{ opacity: 1, x: 0, scale: 1 }}
                transition={{ duration: 0.9, delay: 0.75, ease }}
                className="inline-block text-[#d50818]"
              >
                Us
              </motion.span>
            </motion.h1>
          </div>

          {/* wrapper: is ki size/position par image split hoti hai */}
          <div
            ref={wrapperRef}
            className="relative mt-2 lg:mt-0 lg:flex lg:flex-row lg:items-start lg:gap-[18px] lg:pl-[35px]"
          >
            <div className="relative grid grid-cols-[0.88fr_1.12fr] items-start gap-3 sm:gap-4 md:gap-5 lg:contents">
              <SliceCard
                index={0}
                slotRef={setSlot(0)}
                layout={layout}
                alt="DigiAmplify creative work"
                delay={0.15}
                slotClass="aspect-[4/5] w-full lg:aspect-[320/416] lg:flex-[320_1_0%]"
                cardClass="rounded-2xl lg:rounded-none"
              />

              <SliceCard
                index={1}
                slotRef={setSlot(1)}
                layout={layout}
                alt="DigiAmplify digital experience"
                delay={0.35}
                slotClass="mt-10 aspect-[3/5] w-full sm:mt-14 lg:mt-0 lg:aspect-[365/726] lg:flex-[365_1_0%]"
                cardClass="rounded-2xl lg:rounded-none"
              />
            </div>

            <div className="mt-4 flex flex-col gap-4 sm:mt-5 sm:gap-5 md:mt-6 lg:mt-0 lg:block lg:w-full lg:flex-[338_1_0%]">
              <SliceCard
                index={2}
                slotRef={setSlot(2)}
                layout={layout}
                alt="DigiAmplify innovation"
                delay={0.55}
                slotClass="aspect-[4/3] w-full sm:aspect-[16/10] lg:aspect-[338/560]"
                cardClass="rounded-2xl lg:rounded-none"
              />

              <motion.p
                initial={{ opacity: 0, x: 25, filter: 'blur(7px)' }}
                animate={{ opacity: 1, x: 0, filter: 'blur(0px)' }}
                transition={{ duration: 0.9, delay: 1.1, ease }}
                className="border-l-2 border-[#d50818] pl-3 text-[13px] leading-[1.6] text-white/90 sm:max-w-[340px] sm:text-[14px] lg:ml-2 lg:mt-[38px] lg:max-w-[220px] lg:self-auto lg:border-l-0 lg:pb-0 lg:pl-0 lg:text-[11px]"
              >
                Empowering brands with strategic thinking, exceptional design,
                and results-driven innovation.
              </motion.p>
            </div>
          </div>
        </div>

        {/* Mobile and Tablet Decorative Glow */}
        <motion.div
          initial={{ opacity: 0, scale: 0.7 }}
          animate={{ opacity: [0, 0.12, 0], scale: [0.7, 1, 1.15] }}
          transition={{ duration: 3.5, delay: 1.2, repeat: Infinity, ease: 'easeOut' }}
          className="pointer-events-none absolute left-[8%] top-[28%] h-[160px] w-[160px] rounded-full bg-[#d50818] blur-[90px] sm:left-[15%] sm:top-[32%] sm:h-[210px] sm:w-[210px] sm:blur-[105px] md:left-[22%] md:top-[38%] md:h-[240px] md:w-[240px] md:blur-[110px] lg:hidden"
        />
      </motion.div>

      {/* Desktop Decorative Glow */}
      <motion.div
        initial={{ opacity: 0, scale: 0.6 }}
        animate={{ opacity: [0, 0.16, 0], scale: [0.6, 1, 1.25] }}
        transition={{ duration: 3.5, delay: 1, repeat: Infinity, ease: 'easeOut' }}
        className="pointer-events-none absolute left-[5%] top-[30%] hidden h-[170px] w-[170px] rounded-full bg-[#d50818] blur-[100px] sm:left-[15%] sm:top-[35%] sm:h-[210px] sm:w-[210px] md:left-[25%] md:top-[40%] md:h-[250px] md:w-[250px] lg:left-[32%] lg:top-[45%] lg:block lg:h-[220px] lg:w-[220px] lg:blur-[120px]"
      />
    </section>
  )
}

export default AboutHero