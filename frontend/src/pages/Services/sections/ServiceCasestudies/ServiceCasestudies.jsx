import { motion } from 'framer-motion'
import { Link } from 'react-router-dom'
import { ArrowUpRight } from 'lucide-react'
import { caseStudiesHeader, caseStudies } from '@/data/services/caseStudies'

function InfoBlock({ heading, children, className = '' }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 18 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.25 }}
      transition={{ duration: 0.65, ease: [0.16, 1, 0.3, 1] }}
      className={className}
    >
      <motion.h4
        initial={{ opacity: 0, x: -10 }}
        whileInView={{ opacity: 1, x: 0 }}
        viewport={{ once: true, amount: 0.25 }}
        transition={{ duration: 0.55, ease: [0.16, 1, 0.3, 1] }}
        className="font-['Urbanist'] text-[16px] font-light text-white/60 lg:text-[clamp(12px,1.3vw,24px)]"
      >
        {heading}
      </motion.h4>
      {children}
    </motion.div>
  )
}

function CaseCard({ item, index }) {
  return (
    <motion.article
      initial={{ opacity: 0, y: 50, scale: 0.97 }}
      whileInView={{ opacity: 1, y: 0, scale: 1 }}
      viewport={{ once: true, amount: 0.15 }}
      transition={{
        duration: 0.85,
        delay: index * 0.12,
        ease: [0.16, 1, 0.3, 1],
      }}
      whileHover={{
        y: -8,
        transition: {
          duration: 0.35,
          ease: [0.16, 1, 0.3, 1],
        },
      }}
      className="group relative flex flex-col overflow-hidden rounded-xl border border-white/15 bg-gradient-to-br from-[#070707] via-[#151515] to-[#060606] transition-colors duration-500 hover:border-white/30 md:flex-row lg:min-h-[clamp(190px,20vw,390px)] lg:flex-row lg:rounded-lg"
    >
      <motion.div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 z-0 bg-[radial-gradient(circle_at_20%_50%,rgba(213,8,24,0.12),transparent_45%)] opacity-0 transition-opacity duration-700 group-hover:opacity-100"
      />

      {/* Image */}
      <motion.div
        className="relative z-10 aspect-[4/3] w-full shrink-0 overflow-hidden sm:aspect-[16/8] md:aspect-auto md:w-[34%] lg:w-[17.4%]"
        whileHover={{ scale: 1.015 }}
        transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
      >
        <motion.img
          src={item.image}
          alt={item.imageAlt}
          loading="lazy"
          initial={{ scale: 1.12, opacity: 0.7 }}
          whileInView={{ scale: 1, opacity: 1 }}
          viewport={{ once: true, amount: 0.2 }}
          transition={{
            duration: 1.1,
            delay: index * 0.12,
            ease: [0.16, 1, 0.3, 1],
          }}
          className="absolute inset-0 h-full w-full object-cover transition-transform duration-1000 group-hover:scale-110"
          draggable={false}
        />

        <motion.div
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 bg-gradient-to-r from-black/20 via-transparent to-transparent"
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
        />

        {/* Mobile / tablet: bottom fade into card */}
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-x-0 bottom-0 h-1/2 bg-gradient-to-t from-[#0b0b0b] via-[#0b0b0b]/40 to-transparent md:hidden"
        />

        {/* Mobile only: category chip on image */}
        <span className="absolute left-3 top-3 rounded-full border border-[#d50818]/50 bg-black/60 px-3 py-1 font-['Poppins'] text-[11px] text-[#ff4a5a] backdrop-blur-sm sm:hidden">
          {item.category}
        </span>
      </motion.div>

      {/* Content */}
      <div className="relative z-10 flex flex-1 flex-col p-5 sm:p-6 md:p-7 lg:pb-[clamp(10px,1.2vw,24px)] lg:pl-[2.2%] lg:pr-[2.4%] lg:pt-[clamp(14px,1.9vw,36px)]">
        {/* Title row */}
        <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
          <motion.div
            initial={{ opacity: 0, x: -18 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true, amount: 0.25 }}
            transition={{
              duration: 0.7,
              delay: index * 0.12 + 0.12,
              ease: [0.16, 1, 0.3, 1],
            }}
          >
            <h3 className="font-['Glacial Indifference'] text-[26px] font-light leading-tight text-white sm:text-[24px] lg:text-[clamp(14px,1.8vw,34px)]">
              {item.title}
            </h3>
            <motion.p
              initial={{ opacity: 0, y: 8 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.25 }}
              transition={{
                duration: 0.5,
                delay: index * 0.12 + 0.22,
              }}
              className="mt-2 hidden font-['Glacial Indifference'] text-[13px] text-[#d50818] sm:block lg:mt-[0.7vw] lg:text-[clamp(8px,1.05vw,20px)]"
            >
              {item.category}
            </motion.p>
          </motion.div>

          {/* Hidden on phones (full-width button is shown below instead) */}
          <motion.div
            initial={{ opacity: 0, x: 15 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true, amount: 0.25 }}
            transition={{
              duration: 0.65,
              delay: index * 0.12 + 0.2,
              ease: [0.16, 1, 0.3, 1],
            }}
            whileHover={{ x: 4 }}
            className="hidden sm:block"
          >
            <Link
              to={item.link}
              className="inline-flex items-center gap-1.5 font-['Glacial Indifference'] text-[14px] text-[#d50818] transition-opacity hover:opacity-70 lg:text-[clamp(10px,1.05vw,20px)]"
            >
              Read full case study
              <motion.span
                className="inline-flex"
                whileHover={{ x: 3, y: -3, scale: 1.08 }}
                transition={{ duration: 0.25 }}
              >
                <ArrowUpRight
                  className="h-[1em] w-[1em]"
                  strokeWidth={1.5}
                />
              </motion.span>
            </Link>
          </motion.div>
        </div>

        {/* Info columns */}
        <div className="mt-6 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:mt-[clamp(18px,2.3vw,44px)] lg:grid-cols-3 lg:gap-0">
          <InfoBlock
            heading="Challenges"
            className="border-l border-white/10 pl-4 lg:border-l-0 lg:pl-0"
          >
            <motion.p
              initial={{ opacity: 0, y: 12 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.2 }}
              transition={{
                duration: 0.65,
                delay: index * 0.08 + 0.15,
                ease: [0.16, 1, 0.3, 1],
              }}
              className="mt-2 max-w-[420px] font-['Poppins'] text-[13px] leading-[1.65] text-white/90 lg:mt-[1.3vw] lg:max-w-[88%] lg:text-[clamp(10px,1.05vw,20px)] lg:leading-[1.45]"
            >
              {item.challenges}
            </motion.p>
          </InfoBlock>

          <InfoBlock
            heading="Strategy"
            className="border-l border-white/10 pl-4 lg:border-l-0 lg:pl-0"
          >
            <motion.p
              initial={{ opacity: 0, y: 12 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.2 }}
              transition={{
                duration: 0.65,
                delay: index * 0.08 + 0.25,
                ease: [0.16, 1, 0.3, 1],
              }}
              className="mt-2 max-w-[420px] font-['Poppins'] text-[13px] leading-[1.65] text-white/90 lg:mt-[1.3vw] lg:max-w-[88%] lg:text-[clamp(10px,1.05vw,20px)] lg:leading-[1.45]"
            >
              {item.strategy}
            </motion.p>
          </InfoBlock>

          <InfoBlock heading="Results" className="sm:col-span-2 lg:col-span-1">
            {/* Mobile / tablet: 3 stat tiles. Desktop: original list */}
            <ul className="mt-3 grid grid-cols-3 gap-2 sm:gap-3 lg:mt-[1.1vw] lg:block lg:space-y-[0.35vw]">
              {item.results.map((r, resultIndex) => (
                <motion.li
                  key={r.label}
                  initial={{ opacity: 0, x: 14 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true, amount: 0.2 }}
                  transition={{
                    duration: 0.5,
                    delay: index * 0.08 + resultIndex * 0.08 + 0.2,
                    ease: [0.16, 1, 0.3, 1],
                  }}
                  className="flex flex-col items-center rounded-xl border border-white/10 bg-white/[0.04] px-2 py-3 text-center font-['Poppins'] text-[13px] lg:flex-row lg:items-baseline lg:rounded-none lg:border-0 lg:bg-transparent lg:p-0 lg:text-left lg:text-[clamp(10px,1.05vw,20px)]"
                >
                  <motion.span
                    initial={{ scale: 0.7, opacity: 0 }}
                    whileInView={{ scale: 1, opacity: 1 }}
                    viewport={{ once: true, amount: 0.2 }}
                    transition={{
                      duration: 0.45,
                      delay: index * 0.08 + resultIndex * 0.08 + 0.25,
                      ease: [0.16, 1, 0.3, 1],
                    }}
                    className="text-[22px] leading-none text-[#d50818] sm:text-[24px] lg:min-w-[3.3em] lg:text-[1.2em]"
                  >
                    {r.value}
                  </motion.span>
                  <span className="mt-1.5 text-[11px] leading-tight text-white/70 sm:text-[12px] lg:mt-0 lg:text-[1em] lg:text-white/90">
                    {r.label}
                  </span>
                </motion.li>
              ))}
            </ul>
          </InfoBlock>
        </div>

        {/* Mobile only: full-width CTA */}
        <Link
          to={item.link}
          className="mt-6 flex items-center justify-center gap-2 rounded-full bg-[#c50d1e] py-3 font-['Poppins'] text-[14px] font-medium text-white transition-colors duration-300 hover:bg-red-700 active:scale-[0.98] sm:hidden"
        >
          Read full case study
          <ArrowUpRight className="h-4 w-4" strokeWidth={1.8} />
        </Link>

        {/* Bottom controls (hidden on phones) */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.2 }}
          transition={{
            duration: 0.6,
            delay: index * 0.1 + 0.3,
            ease: [0.16, 1, 0.3, 1],
          }}
          className="mt-6 hidden items-center justify-end gap-2 sm:flex lg:mt-auto lg:gap-[0.5vw] lg:pt-[clamp(8px,1vw,20px)]"
        >
          <motion.span
            aria-hidden="true"
            whileHover={{ scale: 1.08, rotate: 6 }}
            transition={{ duration: 0.25 }}
            className="h-7 w-7 rounded-full bg-[#d9d9d9] lg:h-[clamp(20px,2.2vw,42px)] lg:w-[clamp(20px,2.2vw,42px)]"
          />

          <Link
            to={item.link}
            aria-label={`Read ${item.title} case study`}
            className="group/arrow flex h-7 w-7 items-center justify-center rounded-full bg-[#c50d1e] text-white transition-colors duration-300 hover:bg-red-700 lg:h-[clamp(20px,2.4vw,46px)] lg:w-[clamp(20px,2.4vw,46px)]"
          >
            <motion.span
              className="flex items-center justify-center"
              whileHover={{
                scale: 1.15,
                rotate: 45,
              }}
              transition={{
                duration: 0.3,
                ease: [0.16, 1, 0.3, 1],
              }}
            >
              <ArrowUpRight
                className="h-[55%] w-[55%]"
                strokeWidth={1.8}
              />
            </motion.span>
          </Link>
        </motion.div>
      </div>

      <motion.div
        aria-hidden="true"
        className="pointer-events-none absolute bottom-0 left-0 h-[2px] w-full origin-left bg-[#d50818]"
        initial={{ scaleX: 0 }}
        whileInView={{ scaleX: 1 }}
        viewport={{ once: true, amount: 0.15 }}
        transition={{
          duration: 1,
          delay: index * 0.12 + 0.25,
          ease: [0.16, 1, 0.3, 1],
        }}
      />
    </motion.article>
  )
}

function ServiceCasestudies() {
  const { title, accent, description, buttonText, buttonLink } =
    caseStudiesHeader

  return (
    <section className="relative overflow-hidden bg-black bg-[radial-gradient(ellipse_at_85%_0%,#1f1f1f_0%,#0c0c0c_45%,#000_80%)] px-5 py-14 text-white sm:px-8 sm:py-16 md:px-10 lg:px-[5.5%] lg:py-[clamp(50px,4.5vw,90px)]">
      <motion.div
        aria-hidden="true"
        className="pointer-events-none absolute -right-[30%] top-[2%] h-[300px] w-[300px] rounded-full bg-[#d50818]/10 blur-[110px] sm:-right-[10%] sm:top-[5%] sm:h-[420px] sm:w-[420px] sm:blur-[130px]"
        animate={{
          opacity: [0.2, 0.4, 0.2],
          scale: [0.9, 1.08, 0.9],
        }}
        transition={{
          duration: 7,
          repeat: Infinity,
          ease: 'easeInOut',
        }}
      />

      <div className="mx-auto max-w-[1920px]">
        {/* Header */}
        <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between lg:gap-10">
          <div className="lg:max-w-[68%]">
            <motion.h2
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.3 }}
              transition={{
                duration: 0.9,
                ease: [0.16, 1, 0.3, 1],
              }}
              className="font-['Urbanist'] text-[34px] font-light leading-[1.12] text-white sm:text-[42px] md:text-[48px] lg:text-[clamp(30px,2.8vw,54px)] lg:leading-[1.15]"
            >
              {title} <span className="text-[#d50818]">{accent}</span>.
            </motion.h2>

            <motion.p
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.3 }}
              transition={{
                duration: 0.8,
                delay: 0.12,
                ease: [0.16, 1, 0.3, 1],
              }}
              className="mt-4 max-w-[560px] font-['Poppins'] text-[14px] leading-[1.75] text-white/80 sm:max-w-[640px] sm:text-[15px] md:max-w-[700px] md:text-[16px] lg:mt-[clamp(12px,1.3vw,24px)] lg:max-w-none lg:text-[clamp(12px,1.25vw,24px)] lg:leading-[1.55] lg:text-white"
            >
              {description}
            </motion.p>
          </div>

          <motion.div
            initial={{ opacity: 0, x: 25, scale: 0.92 }}
            whileInView={{ opacity: 1, x: 0, scale: 1 }}
            viewport={{ once: true, amount: 0.3 }}
            transition={{
              duration: 0.75,
              delay: 0.2,
              ease: [0.16, 1, 0.3, 1],
            }}
            whileHover={{
              scale: 1.04,
              y: -2,
            }}
            className="w-full sm:w-auto"
          >
            <Link
              to={buttonLink}
              className="inline-flex w-full items-center justify-center rounded-full border border-[#d50818] px-6 py-3 font-['Poppins'] text-[13px] text-[#d50818] transition-colors duration-300 hover:bg-[#d50818] hover:text-white sm:w-fit sm:py-2.5 lg:px-[clamp(20px,2.7vw,52px)] lg:py-[clamp(8px,0.9vw,18px)] lg:text-[clamp(10px,1.05vw,20px)]"
            >
              {buttonText}
            </Link>
          </motion.div>
        </div>

        {/* Cards */}
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true, amount: 0.05 }}
          transition={{ duration: 0.8, delay: 0.15 }}
          className="mt-10 flex flex-col gap-6 sm:mt-12 lg:mt-[clamp(28px,3.2vw,60px)] lg:gap-[clamp(18px,3.1vw,60px)]"
        >
          {caseStudies.map((item, i) => (
            <CaseCard key={item.id} item={item} index={i} />
          ))}
        </motion.div>

        {/* Bottom divider */}
        <motion.div
          initial={{ scaleX: 0, opacity: 0 }}
          whileInView={{ scaleX: 1, opacity: 1 }}
          viewport={{ once: true, amount: 0.3 }}
          transition={{
            duration: 1.1,
            delay: 0.2,
            ease: [0.16, 1, 0.3, 1],
          }}
          className="mt-14 h-px w-full origin-left bg-white/20 lg:mt-[clamp(40px,4.5vw,86px)]"
        />
      </div>
    </section>
  )
}

export default ServiceCasestudies