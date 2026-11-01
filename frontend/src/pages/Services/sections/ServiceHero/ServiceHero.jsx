import { motion } from 'framer-motion'
import { serviceHero } from '@/data/services/hero'

const ease = [0.16, 1, 0.3, 1]

const GRAY_CLIP =
  '[clip-path:polygon(18%_0,0_50%,18%_100%,100%_100%,100%_0)] lg:[clip-path:polygon(16%_0,0_35.2%,54%_100%,100%_100%,100%_0)]'

const PHOTO_CLIP =
  '[clip-path:polygon(26%_0,10%_50%,26%_100%,100%_100%,100%_0)] lg:[clip-path:polygon(27%_0,12.3%_35.2%,63.8%_100%,100%_100%,100%_0)]'

const RED_CLIP =
  '[clip-path:polygon(21%_0,24%_0,8%_50%,24%_100%,21%_100%,5%_50%)] lg:[clip-path:polygon(19.3%_10.6%,22.7%_10.6%,13.2%_34.7%,35%_63.8%,31%_64.3%,8.6%_34.7%)]'

function ServiceHero() {
  const { description, title, titleAccent, image, imageAlt } = serviceHero

  return (
    <section className="relative overflow-hidden bg-black pb-12 pt-8 text-white sm:pb-16 sm:pt-10 md:pb-20 md:pt-12 lg:pb-[10px] lg:pt-[28px]">
      {/* Left red edge glow */}
      <motion.div
        initial={{ opacity: 0, scaleY: 0 }}
        animate={{ opacity: 1, scaleY: 1 }}
        transition={{ duration: 1.4, delay: 0.15, ease }}
        className="pointer-events-none absolute inset-y-0 left-0 z-0 w-[8%] origin-left bg-gradient-to-r from-[#7a0714] via-[#2a0408]/60 to-transparent lg:w-[7.5%]"
      />

      {/* Subtle red ambient glow */}
      <motion.div
        initial={{ opacity: 0, scale: 0.5 }}
        animate={{ opacity: 0.45, scale: 1 }}
        transition={{ duration: 1.8, delay: 0.4, ease }}
        className="pointer-events-none absolute left-[-12%] top-[35%] h-[350px] w-[350px] rounded-full bg-[#d50818]/10 blur-[120px] sm:h-[500px] sm:w-[500px]"
      />

      {/* Mobile / tablet: extra top-right red glow */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 1.8, delay: 0.6, ease }}
        className="pointer-events-none absolute -right-20 top-[8%] h-[260px] w-[260px] rounded-full bg-[#d50818]/10 blur-[100px] sm:h-[340px] sm:w-[340px] lg:hidden"
      />

      <div className="relative mx-auto max-w-[1920px] lg:aspect-[1920/611]">
        {/* Text block */}
        <div className="relative z-20 flex flex-col px-5 pb-8 pt-14 sm:px-8 sm:pt-16 md:px-10 lg:contents">
          {/* Mobile / tablet: small red accent line above heading */}
          <motion.span
            initial={{ opacity: 0, scaleX: 0 }}
            animate={{ opacity: 1, scaleX: 1 }}
            transition={{ duration: 0.8, delay: 0.15, ease }}
            className="order-none mb-5 block h-[2px] w-14 origin-left bg-[#d50818] sm:mb-6 sm:w-16 lg:hidden"
          />

          {/* Main heading */}
          <motion.h1
            initial={{
              opacity: 0,
              y: 70,
              filter: 'blur(16px)',
              scale: 0.94,
            }}
            animate={{
              opacity: 1,
              y: 0,
              filter: 'blur(0px)',
              scale: 1,
            }}
            transition={{
              duration: 1.15,
              delay: 0.25,
              ease,
            }}
            className="order-1 whitespace-nowrap text-[15vw] font-normal leading-[0.95] tracking-[-0.05em] sm:text-[13vw] md:text-[104px] lg:absolute lg:left-[14.8%] lg:top-[58.5%] lg:whitespace-nowrap lg:text-[clamp(72px,6.6vw,127px)] lg:leading-none"
          >
            {title}{' '}

            {/* Red accent word */}
            <motion.span
              initial={{
                opacity: 0,
                x: 45,
                scale: 0.75,
                filter: 'blur(10px)',
              }}
              animate={{
                opacity: 1,
                x: 0,
                scale: 1,
                filter: 'blur(0px)',
              }}
              transition={{
                duration: 0.9,
                delay: 0.7,
                ease,
              }}
              className="relative inline-block text-[#d50818]"
            >
              {/* Accent glow */}
              <motion.span
                initial={{ opacity: 0 }}
                animate={{ opacity: [0, 0.7, 0] }}
                transition={{
                  duration: 2.2,
                  delay: 1.2,
                  repeat: Infinity,
                  repeatDelay: 3,
                  ease: 'easeInOut',
                }}
                className="absolute inset-0 -z-10 bg-[#d50818]/40 blur-[28px]"
              />

              {titleAccent}
            </motion.span>
          </motion.h1>

          {/* Description */}
          <motion.p
            initial={{
              opacity: 0,
              y: 40,
              filter: 'blur(10px)',
            }}
            animate={{
              opacity: 1,
              y: 0,
              filter: 'blur(0px)',
            }}
            transition={{
              duration: 1,
              delay: 0.5,
              ease,
            }}
            className="order-2 mt-6 max-w-[380px] border-l-2 border-[#d50818] pl-4 text-[14px] leading-[1.75] text-white/85 sm:mt-7 sm:max-w-[500px] sm:pl-5 sm:text-[15px] md:max-w-[620px] md:text-[17px] lg:absolute lg:left-[14.9%] lg:top-[17.2%] lg:mt-0 lg:w-[33.5%] lg:max-w-none lg:border-l-0 lg:pl-0 lg:text-[clamp(12px,0.9vw,17.5px)] lg:leading-[1.55] lg:text-white"
          >
            {description}
          </motion.p>

          {/* Small animated line beside description */}
          <motion.div
            initial={{ opacity: 0, scaleX: 0 }}
            animate={{ opacity: 1, scaleX: 1 }}
            transition={{
              duration: 0.8,
              delay: 0.85,
              ease,
            }}
            className="absolute left-[14.9%] top-[13.8%] hidden h-px w-[70px] origin-left bg-[#d50818] lg:block"
          />
        </div>

        {/* Image / Chevron composition */}
        <motion.div
          initial={{
            opacity: 0,
            x: 120,
            scale: 0.94,
          }}
          animate={{
            opacity: 1,
            x: 0,
            scale: 1,
          }}
          transition={{
            duration: 1.35,
            delay: 0.15,
            ease,
          }}
          whileHover={{
            scale: 1.008,
            transition: {
              duration: 0.5,
              ease,
            },
          }}
          className="group relative z-10 aspect-[4/3] w-full sm:aspect-[16/10] lg:absolute lg:right-[3%] lg:top-0 lg:aspect-[815/611] lg:h-full lg:w-auto"
        >
          {/* Dark gray band */}
          <motion.div
            initial={{
              opacity: 0,
              x: 60,
            }}
            animate={{
              opacity: 1,
              x: 0,
            }}
            transition={{
              duration: 1.2,
              delay: 0.35,
              ease,
            }}
            className={`absolute inset-0 bg-[#2b2b2b] ${GRAY_CLIP}`}
          />

          {/* Photo */}
          <div className={`absolute inset-0 overflow-hidden ${PHOTO_CLIP}`}>
            <motion.img
              src={image}
              alt={imageAlt}
              initial={{
                scale: 1.25,
                x: 30,
                filter: 'grayscale(100%) brightness(0.7)',
              }}
              animate={{
                scale: 1,
                x: 0,
                filter: 'grayscale(100%) brightness(1)',
              }}
              transition={{
                duration: 2,
                delay: 0.35,
                ease,
              }}
              whileHover={{
                scale: 1.045,
                filter: 'grayscale(85%) brightness(1.05)',
                transition: {
                  duration: 0.8,
                  ease: 'easeOut',
                },
              }}
              className="h-full w-full object-cover object-[65%_50%] lg:object-center"
            />

            {/* Image dark overlay */}
            <motion.div
              initial={{ opacity: 0.55 }}
              animate={{ opacity: 0 }}
              transition={{
                duration: 1.4,
                delay: 1,
                ease,
              }}
              className="pointer-events-none absolute inset-0 bg-black"
            />

            {/* Moving shine */}
            <motion.div
              initial={{
                x: '-120%',
                opacity: 0,
              }}
              animate={{
                x: '120%',
                opacity: [0, 0.35, 0],
              }}
              transition={{
                duration: 1.8,
                delay: 1.1,
                ease: 'easeInOut',
              }}
              className="pointer-events-none absolute inset-y-0 left-0 w-[35%] -skew-x-12 bg-gradient-to-r from-transparent via-white/20 to-transparent blur-md"
            />
          </div>

          {/* Red stripe */}
          <motion.div
            initial={{
              opacity: 0,
              scale: 0.7,
              x: -25,
            }}
            animate={{
              opacity: 1,
              scale: 1,
              x: 0,
            }}
            transition={{
              duration: 1,
              delay: 0.65,
              ease,
            }}
            className={`absolute inset-0 bg-[#c50d1e] ${RED_CLIP}`}
          />

          {/* Red stripe glow */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: [0, 0.8, 0.25] }}
            transition={{
              duration: 1.8,
              delay: 1,
              ease: 'easeInOut',
            }}
            className={`pointer-events-none absolute inset-0 bg-[#ff1528]/30 blur-[8px] ${RED_CLIP}`}
          />

          {/* Floating red light */}
          <motion.div
            initial={{
              opacity: 0,
              x: -30,
            }}
            animate={{
              opacity: [0, 0.7, 0.15],
              x: [0, 20, 0],
            }}
            transition={{
              duration: 3,
              delay: 1.4,
              repeat: Infinity,
              repeatDelay: 2,
              ease: 'easeInOut',
            }}
            className="pointer-events-none absolute left-[10%] top-[20%] h-16 w-16 rounded-full bg-[#d50818]/30 blur-3xl sm:h-24 sm:w-24"
          />

          {/* Mobile / tablet: soft fades so the image blends into the page */}
          <div className="pointer-events-none absolute inset-x-0 top-0 z-20 h-12 bg-gradient-to-b from-black to-transparent sm:h-16 lg:hidden" />
          <div className="pointer-events-none absolute inset-x-0 bottom-0 z-20 h-14 bg-gradient-to-t from-black to-transparent sm:h-20 lg:hidden" />
        </motion.div>

        {/* Decorative tiny red dot */}
        <motion.div
          initial={{
            opacity: 0,
            scale: 0,
          }}
          animate={{
            opacity: [0, 1, 0.4],
            scale: [0, 1, 0.8],
          }}
          transition={{
            duration: 1,
            delay: 1.4,
            ease,
          }}
          className="absolute right-[6%] top-[12%] z-30 hidden h-2 w-2 rounded-full bg-[#d50818] shadow-[0_0_20px_#d50818] lg:block"
        />
      </div>
    </section>
  )
}

export default ServiceHero