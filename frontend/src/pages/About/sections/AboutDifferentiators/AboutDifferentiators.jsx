import { motion } from 'framer-motion'
import { differentiators } from '@/data/about/differentiators'

const variants = {
  big: {
    pad: 'p-5 sm:p-6 md:p-8',
    icon: 'h-9 w-9 md:h-10 md:w-10',
    iconSvg: 'h-4 w-4',
    title: 'text-xl md:text-2xl',
    desc: 'text-[13px] md:text-sm',
  },

  compact: {
    pad: 'p-5 md:p-5',
    icon: 'h-9 w-9 md:h-6 md:w-6',
    iconSvg: 'h-4 w-4 md:h-2 md:w-2',
    title: 'text-lg md:text-base',
    desc: 'text-[13px] md:text-xs',
  },

  normal: {
    pad: 'p-5 md:p-6',
    icon: 'h-9 w-9 md:h-8 md:w-8',
    iconSvg: 'h-4 w-4',
    title: 'text-lg md:text-lg',
    desc: 'text-[13px] md:text-xs',
  },
}

function DifferentiatorCard({
  item,
  variant = 'normal',
  className = '',
  index = 0,
}) {
  const Icon = item.icon
  const v = variants[variant]

  return (
    <motion.div
      tabIndex={0}
      initial={{
        opacity: 0,
        y: 35,
        scale: 0.96,
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
        duration: 0.7,
        delay: index * 0.1,
        ease: [0.16, 1, 0.3, 1],
      }}
      className={`group relative min-h-0 overflow-hidden rounded-2xl border border-white/15 bg-black outline-none ${className}`}
    >
      <motion.img
        src={item.image}
        alt={item.title}
        loading="lazy"
        initial={{
          scale: 1.08,
        }}
        whileInView={{
          scale: 1,
        }}
        viewport={{
          once: true,
          amount: 0.2,
        }}
        transition={{
          duration: 1,
          delay: index * 0.1,
          ease: 'easeOut',
        }}
        className="absolute inset-0 h-full w-full object-cover transition-transform duration-500 lg:group-hover:scale-105"
      />

      {/* Mobile and tablet caption stays visible */}
      <div
        className={`absolute inset-0 flex flex-col justify-end overflow-hidden bg-gradient-to-t from-black/95 via-black/60 to-black/5 opacity-100 transition-opacity duration-500 lg:bg-none lg:bg-[#0a0a0a] lg:opacity-0 lg:group-hover:opacity-100 lg:group-focus:opacity-100 ${v.pad}`}
      >
        <motion.div
          initial={{
            opacity: 0,
            y: 20,
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
            duration: 0.6,
            delay: index * 0.1 + 0.2,
            ease: 'easeOut',
          }}
          className="pointer-events-none absolute -bottom-20 -right-20 h-64 w-64 rounded-full bg-red-600/30 blur-3xl"
        />

        <div className="relative z-10 flex flex-col gap-2 md:gap-4 lg:gap-4">
          {/* Icon animation */}
          <motion.div
            initial={{
              opacity: 0,
              scale: 0.7,
              y: 12,
            }}
            whileInView={{
              opacity: 1,
              scale: 1,
              y: 0,
            }}
            viewport={{
              once: true,
              amount: 0.2,
            }}
            transition={{
              duration: 0.5,
              delay: index * 0.1 + 0.25,
              ease: [0.16, 1, 0.3, 1],
            }}
            className={`flex items-center justify-center rounded-lg border border-red-600/60 bg-red-950/60 ${v.icon}`}
          >
            <Icon
              className={`text-red-500 ${v.iconSvg} ${
                variant === 'compact' ? 'md:translate-y-1' : ''
              }`}
            />
          </motion.div>

          {/* Title animation */}
          <motion.h3
            initial={{
              opacity: 0,
              y: 15,
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
              duration: 0.5,
              delay: index * 0.1 + 0.35,
              ease: 'easeOut',
            }}
            className={`font-light leading-tight text-white ${v.title}`}
          >
            {item.title}
          </motion.h3>

          {/* Description animation */}
          <motion.p
            initial={{
              opacity: 0,
              y: 12,
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
              duration: 0.5,
              delay: index * 0.1 + 0.45,
              ease: 'easeOut',
            }}
            className={`max-w-xl leading-relaxed text-white/80 ${v.desc}`}
          >
            {item.description}
          </motion.p>
        </div>
      </div>
    </motion.div>
  )
}

export default function AboutDifferentiators() {
  const [big, topRight, midRight, ...bottom] = differentiators
  const bottomIsOdd = bottom.length % 2 === 1

  return (
    <section className="bg-black px-4 py-14 sm:py-16 md:px-10 lg:px-[5.4vw]">
      <div className="mx-auto max-w-[1714px]">
        {/* Section heading animation */}
        <motion.div
          initial={{
            opacity: 0,
            y: 25,
          }}
          whileInView={{
            opacity: 1,
            y: 0,
          }}
          viewport={{
            once: true,
            amount: 0.3,
          }}
          transition={{
            duration: 0.7,
            ease: [0.16, 1, 0.3, 1],
          }}
        >
          <p className="mb-2 text-base font-light text-white/50 md:text-[14px]">
            What makes us Different
          </p>

          <h2 className="mb-8 font-['Glacial_Indifference'] text-[28px] font-light leading-tight text-white sm:text-3xl md:mb-12 md:text-3xl">
            Six discipline, one coherent System
          </h2>
        </motion.div>

        {/* Main cards */}
        <div className="grid grid-cols-1 gap-4 lg:grid-cols-[961fr_720fr] lg:gap-8">
          <DifferentiatorCard
            item={big}
            variant="big"
            index={0}
            className="aspect-[4/3] sm:aspect-[16/10] lg:aspect-[961/500]"
          />

          <div className="flex flex-col gap-4 lg:gap-10">
            {[topRight, midRight].map((item, index) => (
              <DifferentiatorCard
                key={item.id}
                item={item}
                variant="compact"
                index={index + 1}
                className="aspect-[4/3] sm:aspect-[16/10] lg:aspect-auto lg:flex-1"
              />
            ))}
          </div>
        </div>

        {/* Bottom cards */}
        <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:mt-8 lg:grid-cols-3 lg:gap-8">
          {bottom.map((item, i) => {
            const isOrphan = bottomIsOdd && i === bottom.length - 1

            return (
              <DifferentiatorCard
                key={item.id}
                item={item}
                variant="normal"
                index={i + 3}
                className={
                  isOrphan
                    ? 'aspect-[4/3] sm:col-span-2 sm:aspect-[16/8] lg:col-span-1 lg:aspect-[16/10]'
                    : 'aspect-[4/3] sm:aspect-square lg:aspect-[16/10]'
                }
              />
            )
          })}
        </div>
      </div>
    </section>
  )
}