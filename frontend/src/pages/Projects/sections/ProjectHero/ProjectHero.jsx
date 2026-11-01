import React from 'react'
import { motion, useReducedMotion } from 'framer-motion'
import heroData from '@/data/projects/hero'

const css = `
@import url("https://fonts.googleapis.com/css2?family=Outfit:wght@300;400&family=Poppins:wght@300;400&display=swap");

.ph {
  --ph-bg: #050506;
  --ph-red: #b3000f;
  --ph-gray: #2b2b2d;
  position: relative;
  width: 100%;
  aspect-ratio: 1024 / 493;
  min-height: 420px;
  background: var(--ph-bg);
  overflow: hidden;
  color: #fff;
}

.ph__img {
  position: absolute;
  top: 0;
  right: 0;
  width: 42%;
  height: 100%;
  clip-path: polygon(8% 0, 100% 0, 100% 100%, 40% 100%);
}

.ph__img img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  object-position: center;
  filter: grayscale(1) contrast(1.05) brightness(0.9);
  display: block;
}

.ph__shape {
  position: absolute;
}

.ph__red-top {
  left: 89.4%;
  top: 1.4%;
  width: 10%;
  height: 13.5%;
  background: var(--ph-red);
  clip-path: polygon(0 0, 100% 0, 100% 100%, 45% 100%);
}

.ph__bar {
  left: 3.4%;
  top: 82.6%;
  width: 61%;
  height: 6.3%;
  background: var(--ph-gray);
  clip-path: polygon(0 0, 97.5% 0, 100% 100%, 0 100%);
}

.ph__gray-para {
  left: 60.5%;
  top: 57.8%;
  width: 10%;
  height: 17%;
  background: var(--ph-gray);
  clip-path: polygon(0 0, 75% 0, 100% 100%, 25% 100%);
}

.ph__red-para {
  left: 64.5%;
  top: 76%;
  width: 10.5%;
  height: 18.5%;
  background: var(--ph-red);
  clip-path: polygon(0 0, 70% 0, 100% 100%, 28% 100%);
}

.ph__content {
  position: absolute;
  left: 7.1%;
  top: 17%;
  width: 54%;
  z-index: 2;
}

.ph__title {
  margin: 0;
  font-family: "Outfit", sans-serif;
  font-weight: 300;
  font-size: clamp(1.6rem, 3.4vw, 3.6rem);
  line-height: 1.25;
  letter-spacing: 0.01em;
  color: #fff;
}

.ph__title span {
  color: var(--ph-red);
}

.ph__text {
  margin: 2.6rem 0 0;
  max-width: 70ch;
  font-family: "Poppins", sans-serif;
  font-weight: 300;
  font-size: clamp(0.68rem, 0.95vw, 0.95rem);
  line-height: 1.6;
  color: #6d6d70;
}

.ph__glow {
  position: absolute;
  pointer-events: none;
  border-radius: 9999px;
  filter: blur(70px);
}

.ph__scan {
  position: absolute;
  pointer-events: none;
  top: -20%;
  left: -30%;
  width: 35%;
  height: 140%;
  background: linear-gradient(
    90deg,
    transparent,
    rgba(213, 8, 24, 0.1),
    rgba(255, 255, 255, 0.08),
    transparent
  );
  transform: rotate(12deg);
  z-index: 8;
}

@media (max-width: 720px) {
  .ph {
    aspect-ratio: auto;
    min-height: 640px;
  }

  .ph__img {
    width: 100%;
    height: 45%;
    top: auto;
    bottom: 0;
    clip-path: polygon(0 12%, 100% 0, 100% 100%, 0 100%);
  }

  .ph__content {
    position: relative;
    left: auto;
    top: auto;
    width: auto;
    padding: 3rem 1.5rem 0;
  }

  .ph__title {
    font-size: 2rem;
  }

  .ph__text {
    font-size: 0.8rem;
    margin-top: 1.5rem;
    max-width: none;
  }

  .ph__red-top,
  .ph__bar,
  .ph__gray-para,
  .ph__red-para {
    display: none;
  }

  .ph__scan {
    display: none;
  }
}

@media (min-width: 721px) and (max-width: 1100px) {
  .ph__content {
    width: 57%;
  }

  .ph__text {
    max-width: 65ch;
  }
}
`

export default function ProjectHero() {
  const reduceMotion = useReducedMotion()

  const reveal = {
    initial: reduceMotion
      ? { opacity: 1 }
      : { opacity: 0, y: 35 },
    animate: {
      opacity: 1,
      y: 0,
    },
  }

  return (
    <section className="ph">
      <style>{css}</style>

      <motion.div
        className="ph__glow"
        initial={{ opacity: 0, scale: 0.6 }}
        animate={
          reduceMotion
            ? { opacity: 0.25 }
            : {
                opacity: [0.15, 0.32, 0.15],
                scale: [0.8, 1.15, 0.9],
              }
        }
        transition={
          reduceMotion
            ? { duration: 0 }
            : {
                duration: 5,
                repeat: Infinity,
                ease: 'easeInOut',
              }
        }
        style={{
          left: '31%',
          top: '18%',
          width: '360px',
          height: '260px',
          background: 'rgba(179,0,15,0.16)',
        }}
      />

      <motion.div
        className="ph__glow"
        initial={{ opacity: 0 }}
        animate={
          reduceMotion
            ? { opacity: 0.12 }
            : {
                opacity: [0.08, 0.2, 0.08],
              }
        }
        transition={
          reduceMotion
            ? { duration: 0 }
            : {
                duration: 4,
                repeat: Infinity,
                ease: 'easeInOut',
                delay: 1,
              }
        }
        style={{
          right: '12%',
          bottom: '-10%',
          width: '300px',
          height: '240px',
          background: 'rgba(179,0,15,0.2)',
        }}
      />

      <motion.div
        className="ph__scan"
        initial={{ x: '-30%', opacity: 0 }}
        animate={
          reduceMotion
            ? { opacity: 0 }
            : {
                x: ['0%', '420%'],
                opacity: [0, 0.7, 0],
              }
        }
        transition={
          reduceMotion
            ? { duration: 0 }
            : {
                duration: 2.4,
                delay: 1.2,
                repeat: Infinity,
                repeatDelay: 4,
                ease: 'easeInOut',
              }
        }
      />

      <motion.div
        className="ph__img"
        initial={
          reduceMotion
            ? { opacity: 1 }
            : {
                opacity: 0,
                x: 100,
                scale: 1.08,
              }
        }
        animate={
          reduceMotion
            ? { opacity: 1 }
            : {
                opacity: 1,
                x: 0,
                scale: 1,
              }
        }
        transition={{
          duration: 1.25,
          delay: 0.15,
          ease: [0.16, 1, 0.3, 1],
        }}
      >
        <motion.img
          src={heroData.image}
          alt={heroData.imageAlt}
          initial={reduceMotion ? false : { scale: 1.12 }}
          animate={
            reduceMotion
              ? undefined
              : {
                  scale: [1.12, 1.03, 1.08],
                  x: [0, -6, 0],
                }
          }
          transition={
            reduceMotion
              ? undefined
              : {
                  duration: 10,
                  repeat: Infinity,
                  repeatType: 'mirror',
                  ease: 'easeInOut',
                }
          }
        />
      </motion.div>

      <motion.div
        className="ph__shape ph__red-top"
        initial={reduceMotion ? false : { opacity: 0, x: 35, y: -25 }}
        animate={{ opacity: 1, x: 0, y: 0 }}
        transition={{
          duration: 0.8,
          delay: 0.35,
          ease: [0.16, 1, 0.3, 1],
        }}
      />

      <motion.div
        className="ph__shape ph__bar"
        initial={reduceMotion ? false : { opacity: 0, scaleX: 0 }}
        animate={{ opacity: 1, scaleX: 1 }}
        style={{ transformOrigin: 'left center' }}
        transition={{
          duration: 1,
          delay: 0.65,
          ease: [0.16, 1, 0.3, 1],
        }}
      />

      <motion.div
        className="ph__shape ph__gray-para"
        initial={reduceMotion ? false : { opacity: 0, x: 30, y: 25 }}
        animate={
          reduceMotion
            ? { opacity: 1 }
            : {
                opacity: [0.7, 1, 0.7],
                x: [30, 0, 5],
                y: [25, 0, 3],
              }
        }
        transition={
          reduceMotion
            ? { duration: 0 }
            : {
                opacity: {
                  duration: 4,
                  repeat: Infinity,
                  ease: 'easeInOut',
                  delay: 1.3,
                },
                x: {
                  duration: 1,
                  delay: 0.55,
                  ease: [0.16, 1, 0.3, 1],
                },
                y: {
                  duration: 1,
                  delay: 0.55,
                  ease: [0.16, 1, 0.3, 1],
                },
              }
        }
      />

      <motion.div
        className="ph__shape ph__red-para"
        initial={reduceMotion ? false : { opacity: 0, x: 35, y: 35, scale: 0.85 }}
        animate={
          reduceMotion
            ? { opacity: 1 }
            : {
                opacity: [0.75, 1, 0.75],
                x: [35, 0, 4],
                y: [35, 0, 3],
                scale: [0.85, 1, 1.02],
              }
        }
        transition={
          reduceMotion
            ? { duration: 0 }
            : {
                opacity: {
                  duration: 3.5,
                  repeat: Infinity,
                  ease: 'easeInOut',
                  delay: 1.5,
                },
                x: {
                  duration: 0.9,
                  delay: 0.7,
                  ease: [0.16, 1, 0.3, 1],
                },
                y: {
                  duration: 0.9,
                  delay: 0.7,
                  ease: [0.16, 1, 0.3, 1],
                },
                scale: {
                  duration: 0.9,
                  delay: 0.7,
                  ease: [0.16, 1, 0.3, 1],
                },
              }
        }
      />

      <motion.div
        className="ph__content"
        initial={reduceMotion ? false : { opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{
          duration: 0.6,
          delay: 0.25,
        }}
      >
        <motion.h1
          {...reveal}
          transition={{
            duration: 0.95,
            delay: 0.45,
            ease: [0.16, 1, 0.3, 1],
          }}
          className="ph__title"
        >
          {heroData.title}{' '}
          <motion.span
            initial={reduceMotion ? false : { opacity: 0, filter: 'blur(12px)' }}
            animate={{ opacity: 1, filter: 'blur(0px)' }}
            transition={{
              duration: 0.8,
              delay: 0.9,
              ease: 'easeOut',
            }}
          >
            {heroData.highlight}
          </motion.span>
        </motion.h1>

        <motion.p
          {...reveal}
          transition={{
            duration: 0.9,
            delay: 1.05,
            ease: [0.16, 1, 0.3, 1],
          }}
          className="ph__text"
        >
          {heroData.description}
        </motion.p>
      </motion.div>

      <motion.div
        initial={reduceMotion ? false : { opacity: 0, scaleX: 0 }}
        animate={{ opacity: 1, scaleX: 1 }}
        style={{
          position: 'absolute',
          left: '7.1%',
          top: '76%',
          width: '16%',
          height: '1px',
          background: 'rgba(213,8,24,0.45)',
          transformOrigin: 'left center',
          zIndex: 3,
          pointerEvents: 'none',
        }}
        transition={{
          duration: 1.2,
          delay: 1.25,
          ease: [0.16, 1, 0.3, 1],
        }}
      />
    </section>
  )
}