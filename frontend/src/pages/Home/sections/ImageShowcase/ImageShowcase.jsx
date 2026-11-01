import { useState } from 'react'
import { motion } from 'framer-motion'
import {
  Brain,
  Bot,
  Compass,
  Files,
  PenTool
} from 'lucide-react'
import { imageShowcase } from '@/data/home/imageShowcase'

const hoverIcons = {
  Innovative: Compass,
  Strategy: PenTool,
  Reliability: Bot,
  Scalability: Files,
  Performance: Brain
}

const topFrom = {
  hidden: {
    opacity: 0,
    y: -35,
    scale: 0.96
  },
  visible: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: {
      duration: 0.7,
      ease: [0.16, 1, 0.3, 1]
    }
  }
}

const bottomFrom = {
  hidden: {
    opacity: 0,
    y: 35,
    scale: 0.96
  },
  visible: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: {
      duration: 0.7,
      ease: [0.16, 1, 0.3, 1]
    }
  }
}

function BarChartIcon() {
  return (
    <svg
      width="18"
      height="18"
      viewBox="0 0 25 25"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <rect
        x="3"
        y="14"
        width="4"
        height="8"
        rx="1"
        stroke="currentColor"
        strokeWidth="1.6"
      />
      <rect
        x="10.5"
        y="5"
        width="4"
        height="17"
        rx="1"
        stroke="currentColor"
        strokeWidth="1.6"
      />
      <rect
        x="18"
        y="9"
        width="4"
        height="13"
        rx="1"
        stroke="currentColor"
        strokeWidth="1.6"
      />
    </svg>
  )
}

function ImageShowcase() {
  const images = imageShowcase.images || []
  const [activeId, setActiveId] = useState(null)

  const handleImageClick = (id) => {
    if (window.matchMedia('(max-width: 1023px)').matches) {
      setActiveId((current) => (current === id ? null : id))
    }
  }

  return (
    <section className="relative overflow-hidden bg-black py-14 sm:py-20 md:py-20 lg:py-24">
      <div className="section-container">
        <div className="mx-auto w-full px-5 sm:px-8 md:px-10 lg:px-0">
          <div className="mx-auto w-full max-w-[1080px]">
            {/* Section heading animation */}
            <motion.h2
              initial={{
                opacity: 0,
                y: 25
              }}
              whileInView={{
                opacity: 1,
                y: 0
              }}
              viewport={{
                once: true,
                amount: 0.2
              }}
              transition={{
                duration: 0.7,
                ease: [0.16, 1, 0.3, 1]
              }}
              className="text-[22px] font-light leading-[1.35] tracking-[-0.5px] text-white min-[400px]:text-[24px] sm:text-[26px] md:text-[28px] lg:text-[26px]"
            >
              <span className="block">
                {imageShowcase.title}
              </span>

              <span className="block">
                {imageShowcase.titleLine.split(
                  imageShowcase.highlight
                )[0]}

                <span className="text-[#d4112a]">
                  {imageShowcase.highlight}
                </span>
              </span>
            </motion.h2>

            <div className="mt-8 space-y-4 sm:mt-9 md:mt-10">
              {/* Top row */}
              <div className="grid grid-cols-1 gap-4 lg:grid-cols-[1.39fr_1.08fr_1fr]">
                {images.slice(0, 3).map((item, index) => (
                  <GalleryImage
                    key={item.id}
                    item={item}
                    activeId={activeId}
                    onClick={handleImageClick}
                    variant={index % 2 === 0 ? topFrom : bottomFrom}
                    delay={index * 0.1}
                  />
                ))}
              </div>

              {/* Bottom row */}
              <div className="grid grid-cols-1 gap-4 lg:grid-cols-[1fr_1.08fr_1.39fr]">
                {images.slice(3, 6).map((item, index) => (
                  <GalleryImage
                    key={item.id}
                    item={item}
                    activeId={activeId}
                    onClick={handleImageClick}
                    variant={index % 2 === 0 ? bottomFrom : topFrom}
                    delay={index * 0.1}
                  />
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}

function GalleryImage({
  item,
  activeId,
  onClick,
  variant,
  delay
}) {
  const Icon = hoverIcons[item.hoverTitle]
  const isActive = activeId === item.id

  return (
    <motion.div
      variants={variant}
      initial="hidden"
      whileInView="visible"
      viewport={{
        once: true,
        amount: 0.15
      }}
      transition={{
        delay,
        duration: 0.7,
        ease: [0.16, 1, 0.3, 1]
      }}
      onClick={() => onClick(item.id)}
      className={`group relative h-[210px] w-full cursor-pointer overflow-hidden rounded-[10px] border border-[#2a2a2a] sm:h-[225px] md:h-[240px] lg:h-[185px] lg:cursor-default ${
        isActive ? 'border-[#d4112a]/70' : ''
      }`}
    >
      {/* Image */}
      <motion.img
        src={item.image}
        alt={item.alt}
        initial={{
          scale: 1.08
        }}
        whileInView={{
          scale: 1
        }}
        viewport={{
          once: true,
          amount: 0.15
        }}
        transition={{
          duration: 0.9,
          delay: delay + 0.05,
          ease: 'easeOut'
        }}
        className="h-full w-full object-cover blur-[2px] transition-transform duration-500 lg:blur-0 lg:group-hover:scale-[1.03]"
      />

      {item.hoverTitle && item.hoverText && (
        <div
          className={`absolute inset-0 p-5 transition-all duration-300 sm:p-6 lg:bg-[#0a0a0a] lg:opacity-0 lg:group-hover:opacity-100 lg:group-focus:opacity-100 ${
            isActive
              ? 'visible opacity-100'
              : 'visible opacity-100'
          } bg-gradient-to-t from-black/95 via-black/65 to-black/15 lg:bg-none`}
        >
          <div className="flex h-full flex-col justify-end lg:justify-center">
            {/* Icon and number */}
            <div className="flex items-center justify-between gap-5">
              <motion.div
                initial={{
                  opacity: 0,
                  scale: 0.7
                }}
                whileInView={{
                  opacity: 1,
                  scale: 1
                }}
                viewport={{
                  once: true,
                  amount: 0.15
                }}
                transition={{
                  duration: 0.5,
                  delay: delay + 0.3,
                  ease: [0.16, 1, 0.3, 1]
                }}
                className="flex h-9 w-9 shrink-0 items-center justify-center rounded-[7px] border border-[#d4112a] text-[#d4112a]"
              >
                {item.hoverTitle === 'Creativity' ? (
                  <BarChartIcon />
                ) : (
                  Icon && <Icon size={18} strokeWidth={1.5} />
                )}
              </motion.div>

              <span className="text-[24px] font-medium tracking-[1px] text-[#666666] sm:text-[28px]">
                {String(item.id).padStart(2, '0')}
              </span>
            </div>

            {/* Text */}
            <motion.div
              initial={{
                opacity: 0,
                y: 15
              }}
              whileInView={{
                opacity: 1,
                y: 0
              }}
              viewport={{
                once: true,
                amount: 0.15
              }}
              transition={{
                duration: 0.5,
                delay: delay + 0.4,
                ease: 'easeOut'
              }}
              className="mt-4 max-w-[330px] text-left"
            >
              <h3 className="text-[18px] font-medium tracking-[-0.3px] text-white sm:text-[19px]">
                {item.hoverTitle}
              </h3>

              <p className="mt-2 text-[11px] leading-[1.7] text-white sm:text-[12px]">
                {item.hoverText}
              </p>
            </motion.div>
          </div>
        </div>
      )}
    </motion.div>
  )
}

export default ImageShowcase