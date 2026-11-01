import React from "react";
import { motion } from "framer-motion";
import { contactHero as data } from "@/data/contact/hero";

const ContactHero = () => {
  return (
    <section className="relative w-full overflow-hidden bg-gradient-to-b from-[#1a1a1a] to-[#050505] text-white font-sans">
      <div className="mx-auto grid max-w-[1400px] grid-cols-1 gap-10 px-5 py-14 sm:px-8 md:py-20 lg:grid-cols-2 lg:gap-6 lg:px-12 lg:py-16">
        {/* LEFT: text + cube */}
        <div className="flex flex-col lg:pt-4">
          <motion.h1
            initial={{ opacity: 0, y: 45 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{
              duration: 0.9,
              ease: [0.22, 1, 0.36, 1],
            }}
            className="text-5xl font-normal leading-tight sm:text-6xl lg:ml-24 lg:text-7xl"
          >
            <motion.span
              initial={{ opacity: 0, x: -25 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.7, delay: 0.15 }}
            >
              {data.title.main}
            </motion.span>{" "}
            <motion.span
              initial={{ opacity: 0, x: 25 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.7, delay: 0.3 }}
              className="inline-block text-[#c1121f]"
            >
              {data.title.accent}
            </motion.span>
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 25 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{
              duration: 0.8,
              delay: 0.45,
              ease: "easeOut",
            }}
            className="mt-8 max-w-md text-[13px] font-normal leading-relaxed text-white lg:ml-0 lg:mt-14"
          >
            {data.intro}
          </motion.p>

          <div className="mt-10 flex flex-col items-start gap-6 sm:flex-row sm:items-center lg:mt-16 lg:gap-12">
            {/* Cube */}
            <motion.div
              initial={{ opacity: 0, x: -80, scale: 0.7 }}
              animate={{ opacity: 1, x: 0, scale: 1 }}
              transition={{
                duration: 1,
                delay: 0.55,
                ease: [0.22, 1, 0.36, 1],
              }}
              whileHover={{
                scale: 1.04,
              }}
              className="relative -ml-10 flex h-56 w-56 shrink-0 items-center justify-center sm:-ml-10 sm:h-60 sm:w-60 lg:-ml-4 lg:h-64 lg:w-64"
            >
              {/* Main red light coming from inside the cube */}
              <motion.div
                className="pointer-events-none absolute inset-[-28%] rounded-full bg-[radial-gradient(circle,rgba(193,18,31,0.55)_0%,rgba(193,18,31,0.30)_20%,rgba(193,18,31,0.14)_42%,rgba(193,18,31,0.05)_58%,transparent_75%)] blur-2xl"
                animate={{
                  opacity: [0.45, 0.9, 0.45],
                  scale: [0.88, 1.1, 0.88],
                }}
                transition={{
                  duration: 3,
                  repeat: Infinity,
                  ease: "easeInOut",
                }}
              />

              {/* Stronger inner glow directly behind the cube */}
              <motion.div
                className="pointer-events-none absolute inset-[8%] rounded-full bg-[#c1121f]/30 blur-[35px]"
                animate={{
                  opacity: [0.35, 0.85, 0.35],
                  scale: [0.85, 1.14, 0.85],
                }}
                transition={{
                  duration: 2.4,
                  repeat: Infinity,
                  ease: "easeInOut",
                }}
              />

              {/* Soft light spreading outward */}
              <motion.div
                className="pointer-events-none absolute inset-[-8%] rounded-full bg-[radial-gradient(circle,rgba(255,45,60,0.18)_0%,transparent_65%)] blur-3xl"
                animate={{
                  opacity: [0.25, 0.75, 0.25],
                  scale: [0.9, 1.18, 0.9],
                }}
                transition={{
                  duration: 3.6,
                  repeat: Infinity,
                  ease: "easeInOut",
                }}
              />

              {/* Fixed tilted cube */}
              <motion.img
                src={data.images.cube.src}
                alt={data.images.cube.alt}
                initial={{ opacity: 0, scale: 0.75, rotate: -24 }}
                animate={{
                  opacity: 1,
                  scale: 1,
                  rotate: -12,
                }}
                transition={{
                  duration: 1,
                  delay: 0.75,
                  ease: [0.22, 1, 0.36, 1],
                }}
                className="relative z-10 h-52 w-52 object-contain drop-shadow-[0_0_28px_rgba(193,18,31,0.85)] sm:h-56 sm:w-56 lg:h-60 lg:w-60"
              />
            </motion.div>

            {/* Commitment text */}
            <motion.p
              initial={{ opacity: 0, x: 45 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{
                duration: 0.8,
                delay: 0.85,
                ease: "easeOut",
              }}
              className="max-w-xs text-[13px] font-normal leading-relaxed text-white"
            >
              {data.commitment}
            </motion.p>
          </div>
        </div>

        {/* RIGHT: framed photo collage */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{
            duration: 0.8,
            delay: 0.25,
          }}
          className="relative mx-auto w-full max-w-[520px] pt-24 sm:pt-32 lg:ml-auto lg:mr-0 lg:max-w-[460px] lg:pt-0"
        >
          {/* Decorative background glow */}
          <motion.div
            initial={{ opacity: 0, scale: 0.7 }}
            animate={{ opacity: 0.35, scale: 1 }}
            transition={{
              duration: 1.2,
              delay: 0.4,
              ease: "easeOut",
            }}
            className="pointer-events-none absolute right-[5%] top-[15%] h-[70%] w-[70%] rounded-full bg-[#c1121f]/10 blur-[90px]"
          />

          {/* Small photo */}
          <motion.div
            initial={{ opacity: 0, x: -70, y: -35, rotate: -6 }}
            animate={{ opacity: 1, x: 0, y: 0, rotate: 0 }}
            transition={{
              duration: 1,
              delay: 0.55,
              ease: [0.22, 1, 0.36, 1],
            }}
            whileHover={{
              scale: 1.04,
              rotate: -2,
              zIndex: 20,
            }}
            className="absolute left-0 top-0 z-10 w-[42%] border-[5px] border-white bg-black shadow-[0_20px_50px_rgba(0,0,0,0.45)] sm:border-[6px] lg:-left-[18%] lg:-top-2 lg:w-[48%]"
          >
            <img
              src={data.images.small.src}
              alt={data.images.small.alt}
              className="aspect-[4/3] w-full object-cover"
            />
          </motion.div>

          {/* Large photo */}
          <motion.div
            initial={{ opacity: 0, x: 70, y: 50, scale: 0.9 }}
            animate={{ opacity: 1, x: 0, y: 0, scale: 1 }}
            transition={{
              duration: 1.1,
              delay: 0.7,
              ease: [0.22, 1, 0.36, 1],
            }}
            whileHover={{
              scale: 1.02,
              y: -6,
            }}
            className="relative ml-[18%] mt-0 border-[5px] border-white bg-black shadow-[0_25px_70px_rgba(0,0,0,0.55)] sm:border-[6px] lg:ml-0 lg:mt-24"
          >
            <img
              src={data.images.large.src}
              alt={data.images.large.alt}
              className="aspect-[4/4.5] w-full object-cover"
            />

            {/* Subtle red reflection */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: [0.05, 0.18, 0.05] }}
              transition={{
                duration: 4,
                repeat: Infinity,
                ease: "easeInOut",
              }}
              className="pointer-events-none absolute inset-0 bg-gradient-to-br from-[#c1121f]/20 via-transparent to-transparent"
            />
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
};

export default ContactHero;