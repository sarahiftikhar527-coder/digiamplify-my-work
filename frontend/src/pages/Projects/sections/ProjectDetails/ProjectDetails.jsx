import React from "react";
import { motion } from "framer-motion";
import {
  detailLabels,
  projectDetails,
} from "../../../../data/projects/projectDetailText";

const css = `
.pd {
  --pd-red: #b3000f;
  --pd-border: #232325;
  --pd-card: #0c0c0d;
  display: flex;
  flex-direction: column;
  gap: 1rem;
  font-family: "Poppins", sans-serif;
  color: #fff;
}

.pd *,
.pd *::before,
.pd *::after {
  box-sizing: border-box;
}

.pd__card {
  flex: 1;
  position: relative;
  padding: 1.5rem 1.15rem;
  background: var(--pd-card);
  border: 1px solid var(--pd-border);
  border-radius: 14px;
  overflow: hidden;
}

.pd__card::before {
  content: "";
  position: absolute;
  top: 0;
  left: -120%;
  width: 80%;
  height: 1px;
  background: linear-gradient(
    90deg,
    transparent,
    rgba(179, 0, 15, 0.9),
    transparent
  );
  transition: left 0.9s ease;
}

.pd__card:hover::before {
  left: 120%;
}

.pd__card-title {
  margin: 0;
  font-weight: 500;
  font-size: 0.95rem;
  color: var(--pd-red);
}

.pd__desc {
  margin: 1.9rem 0 0;
  font-weight: 300;
  font-size: 0.78rem;
  line-height: 1.65;
}

.pd__result-title {
  margin: 0;
  font: 300 0.9rem "Outfit", sans-serif;
  color: #b5b5b8;
}

.pd__stats {
  margin-top: 1rem;
  display: grid;
  gap: 0.7rem;
}

.pd__value {
  font: 300 1.5rem/1.1 "Outfit", sans-serif;
  color: var(--pd-red);
}

.pd__label {
  margin-top: 0.2rem;
  font-weight: 300;
  font-size: 0.6rem;
  max-width: 60%;
}

.pd__bars {
  position: absolute;
  right: 1.2rem;
  bottom: 1.1rem;
  height: 62px;
  display: flex;
  align-items: flex-end;
  gap: 6px;
}

.pd__bar {
  width: 10px;
  border-radius: 6px;
  transform-origin: bottom;
}

@media (max-width: 900px) {
  .pd__card {
    min-height: 170px;
  }
}
`;

const BAR_COLORS = [
  "#3b3b3d",
  "#4a4a4c",
  "#5c5c5f",
  "#5a0e16",
  "#b3000f",
];

const cardVariants = {
  hidden: {
    opacity: 0,
    y: 30,
    scale: 0.97,
  },
  visible: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: {
      duration: 0.7,
      ease: [0.22, 1, 0.36, 1],
    },
  },
};

const statContainer = {
  hidden: {},
  visible: {
    transition: {
      delayChildren: 0.25,
      staggerChildren: 0.14,
    },
  },
};

const statItem = {
  hidden: {
    opacity: 0,
    x: -18,
  },
  visible: {
    opacity: 1,
    x: 0,
    transition: {
      duration: 0.55,
      ease: [0.22, 1, 0.36, 1],
    },
  },
};

export default function ProjectDetails({ projectId, animationKey }) {
  const detail = projectDetails[projectId];

  if (!detail) return null;

  return (
    <aside className="pd" key={animationKey || projectId}>
      <style>{css}</style>

      <motion.div
        className="pd__card"
        variants={cardVariants}
        initial="hidden"
        animate="visible"
        whileHover={{
          y: -4,
          borderColor: "rgba(179, 0, 15, 0.35)",
          boxShadow: "0 18px 45px rgba(0, 0, 0, 0.28)",
          transition: {
            duration: 0.3,
          },
        }}
      >
        <motion.h3
          className="pd__card-title"
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{
            duration: 0.5,
            delay: 0.15,
          }}
        >
          {detailLabels.descriptionTitle}
        </motion.h3>

        <motion.p
          className="pd__desc"
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{
            duration: 0.65,
            delay: 0.28,
            ease: [0.22, 1, 0.36, 1],
          }}
        >
          {detail.description}
        </motion.p>
      </motion.div>

      <motion.div
        className="pd__card"
        variants={cardVariants}
        initial="hidden"
        animate="visible"
        transition={{
          delay: 0.12,
        }}
        whileHover={{
          y: -4,
          borderColor: "rgba(179, 0, 15, 0.35)",
          boxShadow: "0 18px 45px rgba(0, 0, 0, 0.28)",
          transition: {
            duration: 0.3,
          },
        }}
      >
        <motion.h3
          className="pd__result-title"
          initial={{ opacity: 0, y: -8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{
            duration: 0.5,
            delay: 0.25,
          }}
        >
          {detailLabels.resultTitle}
        </motion.h3>

        <motion.div
          className="pd__stats"
          variants={statContainer}
          initial="hidden"
          animate="visible"
        >
          {detail.stats.map((s) => (
            <motion.div
              key={s.label}
              variants={statItem}
            >
              <motion.div
                className="pd__value"
                initial={{
                  opacity: 0,
                  scale: 0.75,
                }}
                animate={{
                  opacity: 1,
                  scale: 1,
                }}
                transition={{
                  duration: 0.55,
                  ease: [0.22, 1, 0.36, 1],
                }}
              >
                {s.value}
              </motion.div>

              <motion.div
                className="pd__label"
                initial={{
                  opacity: 0,
                }}
                animate={{
                  opacity: 1,
                }}
                transition={{
                  duration: 0.45,
                  delay: 0.12,
                }}
              >
                {s.label}
              </motion.div>
            </motion.div>
          ))}
        </motion.div>

        <div className="pd__bars" aria-hidden="true">
          {detail.bars.map((h, i) => (
            <motion.span
              key={i}
              className="pd__bar"
              initial={{
                height: 0,
                opacity: 0,
                scaleY: 0,
              }}
              animate={{
                height: `${h}%`,
                opacity: 1,
                scaleY: 1,
              }}
              transition={{
                duration: 0.75,
                delay: 0.45 + i * 0.1,
                ease: [0.22, 1, 0.36, 1],
              }}
              whileHover={{
                scaleX: 1.35,
                filter: "brightness(1.35)",
              }}
              style={{
                background:
                  BAR_COLORS[i] ||
                  BAR_COLORS[BAR_COLORS.length - 1],
              }}
            />
          ))}
        </div>
      </motion.div>
    </aside>
  );
}