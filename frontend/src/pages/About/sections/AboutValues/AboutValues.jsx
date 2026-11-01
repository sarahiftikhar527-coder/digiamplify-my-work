import { motion } from 'framer-motion'
import { valueHeader, valueImages, values } from '@/data/about/values'
import CTA from '@/components/layout/CTA/CTA'

function ValueCard({ item, index }) {
  const Icon = item.icon

  return (
    <motion.div
      initial={{ opacity: 0, y: 35, scale: 0.94 }}
      whileInView={{ opacity: 1, y: 0, scale: 1 }}
      viewport={{ once: true, amount: 0.25 }}
      transition={{
        duration: 0.7,
        delay: index * 0.1,
        ease: 'easeOut',
      }}
      whileHover={{
        y: -8,
        scale: 1.03,
        transition: { duration: 0.25 },
      }}
      className="flex h-[140px] w-full flex-col items-center rounded-2xl border border-white/15 bg-[#0e0e0e] pt-5 transition-colors duration-300 hover:border-red-600/50 sm:h-[150px] sm:w-[125px] sm:pt-[25px] lg:h-[155px] lg:w-[140px] lg:pt-[30px]"
    >
      <motion.div
        whileHover={{ rotate: 8, scale: 1.08 }}
        transition={{ duration: 0.25 }}
        className="flex h-[44px] w-[44px] items-center justify-center rounded-full bg-[#222]"
      >
        <Icon className="h-4 w-4 text-red-600" strokeWidth={1.5} />
      </motion.div>

      <p className="mt-[12px] px-2 text-center text-[13px] font-normal leading-5 text-white sm:mt-[13px] sm:text-sm sm:leading-6 lg:text-base">
        {item.title}
      </p>

      <span className="mt-[10px] h-px w-[40px] bg-red-600" />
    </motion.div>
  )
}

export default function AboutValues() {
  return (
    <>
      {/* Main Values Section */}
      <section className="relative overflow-hidden bg-black bg-[radial-gradient(ellipse_at_50%_75%,#2e2e2e_0%,#161616_40%,#000000_75%)] px-4 pb-0 pt-20 sm:pt-24 lg:pt-[100px]">
        {/* Top Right Decorative Image */}
        <motion.img
          initial={{ opacity: 0, x: 40, rotate: -15 }}
          whileInView={{ opacity: 1, x: 0, rotate: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 1, ease: 'easeOut' }}
          src={valueImages.topRight}
          alt=""
          aria-hidden="true"
          className="pointer-events-none absolute right-[2%] top-2 z-0 w-24 animate-[spin_40s_linear_infinite] object-contain opacity-70 sm:w-36 sm:opacity-100 lg:left-[65%] lg:top-[35px] lg:w-[46vw]"
        />

        {/* Bottom Left Decorative Image */}
        <motion.img
          initial={{ opacity: 0, x: -40, rotate: 15 }}
          whileInView={{ opacity: 1, x: 0, rotate: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 1, delay: 0.15, ease: 'easeOut' }}
          src={valueImages.bottomLeft}
          alt=""
          aria-hidden="true"
          className="pointer-events-none absolute left-[2%] top-[48%] z-0 hidden w-36 animate-[spin_40s_linear_infinite_reverse] object-contain sm:block lg:left-[-11%] lg:top-[38%] lg:w-[46vw]"
        />

        <div className="relative z-10 mx-auto max-w-[1050px]">
          {/* Values Heading */}
          <motion.div
            initial={{ opacity: 0, y: 25 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8, ease: 'easeOut' }}
            className="text-center"
          >
            <p className="mb-3 text-[14px] font-light text-white/50 sm:mb-[18px] md:text-[14px]">
              {valueHeader.label}
            </p>

            <h2 className="mx-auto max-w-[700px] text-[22px] font-light leading-[1.4] text-white sm:text-2xl md:text-2xl lg:text-[30px] lg:leading-[50px]">
              {valueHeader.title}
            </h2>
          </motion.div>

          {/* Values Cards */}
          <div className="mx-auto mt-10 grid max-w-[420px] grid-cols-3 gap-3 sm:mt-12 sm:flex sm:max-w-none sm:flex-wrap sm:justify-center sm:gap-4 lg:mt-[95px] lg:gap-[32px]">
            {values.map((item, index) => (
              <ValueCard key={item.id} item={item} index={index} />
            ))}
          </div>

          {/* Space Between Values Cards and CTA */}
          <div className="relative z-10 mt-24 w-full sm:mt-32 lg:mt-[260px] lg:w-[calc(100%+180px)] lg:-ml-[90px]">
            <CTA />
          </div>
        </div>
      </section>

      {/* Black Space Before Footer */}
      <div className="h-24 bg-black sm:h-28 lg:h-[100px]" />
    </>
  )
}