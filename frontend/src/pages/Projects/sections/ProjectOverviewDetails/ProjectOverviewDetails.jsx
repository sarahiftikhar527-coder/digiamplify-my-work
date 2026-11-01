import React, { useEffect } from "react";
import { Link, useParams } from "react-router-dom";
import { motion } from "framer-motion";
import {
  ROUTE_BASE,
  detailHeadings,
  getProjectBySlug,
} from "../../../../data/projects/overview";
import ProjectOverview from "../ProjectOverview/ProjectOverview";

const css = `
@import url("https://fonts.googleapis.com/css2?family=Outfit:wght@300;400&family=Poppins:wght@300;400;500&display=swap");

.pdp {
  --pdp-red: #b3000f;
  --pdp-border: #232325;
  min-height: 100vh;
  box-sizing: border-box;
  padding: 2.2rem 5.2% 4rem;
  background: linear-gradient(160deg, #1b1b1b 0%, #0c0c0c 50%, #070707 100%);
  color: #fff;
  font-family: "Poppins", sans-serif;
  overflow: hidden;
}

.pdp *,
.pdp *::before,
.pdp *::after {
  box-sizing: border-box;
}

.pdp__top {
  display: grid;
  grid-template-columns: 2.35fr 1fr;
  gap: 1rem;
}

.pdp__media {
  position: relative;
  min-height: 340px;
  border-radius: 8px;
  overflow: hidden;
  background: transparent; /* gray background behind the image removed */
}

.pdp__media img {
  position: absolute;
  inset: 0;
  margin: 0 auto;
  /* IMAGE WIDTH: change this % to make the image wider or narrower.
     Height stays the same (100% of the card), so only the width changes. */
  width: 80%;
  height: 100%;
  object-fit: fill;
  display: block;
}

.pdp__side {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.pdp__card {
  flex: 1;
  position: relative;
  padding: 1.5rem 1.15rem;
  background: #0c0c0d;
  border: 1px solid var(--pdp-border);
  border-radius: 14px;
  overflow: hidden;
}

.pdp__card::before {
  content: "";
  position: absolute;
  inset: 0;
  background: linear-gradient(
    120deg,
    rgba(179, 0, 15, 0.06),
    transparent 50%
  );
  pointer-events: none;
}

.pdp__card-title {
  margin: 0;
  font-weight: 500;
  font-size: 0.95rem;
  color: var(--pdp-red);
}

.pdp__summary {
  margin: 1.9rem 0 0;
  font-weight: 300;
  font-size: 0.78rem;
  line-height: 1.65;
}

.pdp__result-title {
  margin: 0;
  font: 300 0.9rem "Outfit", sans-serif;
  color: #b5b5b8;
}

.pdp__stats {
  margin-top: 1rem;
  display: grid;
  gap: 0.7rem;
}

.pdp__value {
  font: 300 1.5rem/1.1 "Outfit", sans-serif;
  color: var(--pdp-red);
}

.pdp__label {
  margin-top: 0.2rem;
  font-weight: 300;
  font-size: 0.6rem;
  max-width: 60%;
}

.pdp__bars {
  position: absolute;
  right: 1.2rem;
  bottom: 1.1rem;
  height: 62px;
  display: flex;
  align-items: flex-end;
  gap: 6px;
}

/* Bar is always full height; scaleY (from framer-motion) sets the real height */
.pdp__bar {
  width: 10px;
  height: 100%;
  border-radius: 6px;
  transform-origin: bottom;
}

.pdp__section {
  margin-top: 2.6rem;
}

.pdp__h {
  margin: 0 0 1.1rem;
  padding-left: 0.65rem;
  border-left: 3px solid var(--pdp-red);
  font: 300 1.45rem/1.2 "Outfit", sans-serif;
}

.pdp__p {
  margin: 0 0 0.9rem;
  font-weight: 300;
  font-size: 0.8rem;
  line-height: 1.75;
  color: #d6d6d8;
  text-align: justify;
}

.pdp__more {
  margin-top: 3.2rem;
}

.pdp__missing {
  text-align: center;
  padding: 5rem 0;
}

.pdp__missing a {
  color: var(--pdp-red);
}

@media (max-width: 900px) {
  .pdp__top {
    grid-template-columns: 1fr;
  }

  .pdp__media {
    min-height: 240px;
  }

  /* IMAGE WIDTH on mobile: change this % to adjust the width */
  .pdp__media img {
    width: 90%;
  }

  .pdp__card {
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

const DEFAULT_BARS = [26, 45, 61, 84, 100];

const containerVariants = {
  hidden: {},
  visible: {
    transition: {
      staggerChildren: 0.12,
      delayChildren: 0.1,
    },
  },
};

const fadeUp = {
  hidden: {
    opacity: 0,
    y: 35,
  },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.75,
      ease: [0.22, 1, 0.36, 1],
    },
  },
};

const cardVariants = {
  hidden: {
    opacity: 0,
    x: 45,
    scale: 0.97,
  },
  visible: {
    opacity: 1,
    x: 0,
    scale: 1,
    transition: {
      duration: 0.8,
      ease: [0.22, 1, 0.36, 1],
    },
  },
};

const imageVariants = {
  hidden: {
    opacity: 0,
    scale: 1.12,
  },
  visible: {
    opacity: 1,
    scale: 1,
    transition: {
      duration: 1.2,
      ease: [0.22, 1, 0.36, 1],
    },
  },
};

const barVariants = {
  hidden: {
    scaleY: 0,
  },
  visible: (height) => ({
    scaleY: height / 100,
    transition: {
      duration: 0.8,
      delay: 0.5,
      ease: [0.22, 1, 0.36, 1],
    },
  }),
};

export default function ProjectDetailPage() {
  const { overview } = useParams();
  const project = getProjectBySlug(overview);

  useEffect(() => {
    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  }, [overview]);

  if (!project) {
    return (
      <main className="pdp">
        <style>{css}</style>

        <motion.div
          className="pdp__missing"
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7 }}
        >
          <h2>Project not found</h2>

          <Link to={ROUTE_BASE}>Back to projects</Link>
        </motion.div>
      </main>
    );
  }

  const stats = project.stats || [];

  // Use the project's own bars; if it has none, show the default bars
  const bars =
    project.bars && project.bars.length > 0 ? project.bars : DEFAULT_BARS;

  return (
    <main className="pdp">
      <style>{css}</style>

      <motion.div
        className="pdp__top"
        variants={containerVariants}
        initial="hidden"
        animate="visible"
      >
        <motion.div
          className="pdp__media"
          variants={imageVariants}
          whileHover={{
            scale: 1.015,
            transition: {
              duration: 0.5,
              ease: "easeOut",
            },
          }}
        >
          <motion.img
            src={project.detailImage || project.image}
            alt={project.title}
            initial={{ scale: 1.08 }}
            animate={{ scale: 1 }}
            transition={{
              duration: 1.5,
              ease: [0.22, 1, 0.36, 1],
            }}
          />
        </motion.div>

        <motion.div className="pdp__side" variants={containerVariants}>
          <motion.div
            className="pdp__card"
            variants={cardVariants}
            whileHover={{
              y: -5,
              borderColor: "rgba(179, 0, 15, 0.45)",
              transition: {
                duration: 0.3,
              },
            }}
          >
            <motion.h3
              className="pdp__card-title"
              initial={{ opacity: 0, x: -15 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{
                delay: 0.45,
                duration: 0.6,
              }}
            >
              {project.title}
            </motion.h3>

            <motion.p
              className="pdp__summary"
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{
                delay: 0.6,
                duration: 0.7,
              }}
            >
              {project.summary}
            </motion.p>
          </motion.div>

          <motion.div
            className="pdp__card"
            variants={cardVariants}
            whileHover={{
              y: -5,
              borderColor: "rgba(179, 0, 15, 0.45)",
              transition: {
                duration: 0.3,
              },
            }}
          >
            <motion.h3
              className="pdp__result-title"
              initial={{ opacity: 0, x: -15 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{
                delay: 0.55,
                duration: 0.6,
              }}
            >
              {detailHeadings.resultTitle}
            </motion.h3>

            <motion.div
              className="pdp__stats"
              variants={containerVariants}
              initial="hidden"
              animate="visible"
            >
              {stats.map((s, i) => (
                <motion.div
                  key={s.label}
                  variants={fadeUp}
                  whileHover={{
                    x: 5,
                    transition: {
                      duration: 0.2,
                    },
                  }}
                >
                  <motion.div
                    className="pdp__value"
                    initial={{
                      opacity: 0,
                      scale: 0.7,
                    }}
                    animate={{
                      opacity: 1,
                      scale: 1,
                    }}
                    transition={{
                      delay: 0.7 + i * 0.15,
                      duration: 0.6,
                      ease: [0.22, 1, 0.36, 1],
                    }}
                  >
                    {s.value}
                  </motion.div>

                  <div className="pdp__label">{s.label}</div>
                </motion.div>
              ))}
            </motion.div>

            {bars.length > 0 && (
              <div className="pdp__bars" aria-hidden="true">
                {bars.map((h, i) => (
                  <motion.span
                    key={i}
                    className="pdp__bar"
                    custom={h}
                    variants={barVariants}
                    initial="hidden"
                    animate="visible"
                    whileHover={{
                      scaleX: 1.35,
                      background:
                        i === bars.length - 1 ? "#d41427" : "#7a1019",
                      transition: {
                        duration: 0.2,
                      },
                    }}
                    style={{
                      background:
                        BAR_COLORS[i] ||
                        BAR_COLORS[BAR_COLORS.length - 1],
                    }}
                  />
                ))}
              </div>
            )}
          </motion.div>
        </motion.div>
      </motion.div>

      <motion.section
        className="pdp__section"
        variants={fadeUp}
        initial="hidden"
        whileInView="visible"
        viewport={{
          once: true,
          amount: 0.2,
        }}
      >
        <motion.h2
          className="pdp__h"
          initial={{
            opacity: 0,
            x: -35,
          }}
          whileInView={{
            opacity: 1,
            x: 0,
          }}
          viewport={{
            once: true,
            amount: 0.5,
          }}
          transition={{
            duration: 0.7,
            ease: [0.22, 1, 0.36, 1],
          }}
        >
          {detailHeadings.about}
        </motion.h2>

        <motion.p
          className="pdp__p"
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
            amount: 0.2,
          }}
          transition={{
            duration: 0.8,
            delay: 0.15,
            ease: [0.22, 1, 0.36, 1],
          }}
        >
          {project.about}
        </motion.p>
      </motion.section>

      <motion.section
        className="pdp__section"
        initial="hidden"
        whileInView="visible"
        viewport={{
          once: true,
          amount: 0.15,
        }}
        variants={containerVariants}
      >
        <motion.h2 className="pdp__h" variants={fadeUp}>
          {detailHeadings.description}
        </motion.h2>

        {project.description.map((para, i) => (
          <motion.p
            key={i}
            className="pdp__p"
            variants={fadeUp}
            whileHover={{
              x: 3,
              transition: {
                duration: 0.25,
              },
            }}
          >
            {para}
          </motion.p>
        ))}
      </motion.section>

      <motion.div
        className="pdp__more"
        initial={{
          opacity: 0,
          y: 60,
        }}
        whileInView={{
          opacity: 1,
          y: 0,
        }}
        viewport={{
          once: true,
          amount: 0.1,
        }}
        transition={{
          duration: 0.9,
          ease: [0.22, 1, 0.36, 1],
        }}
      >
        {/* key={project.slug}: remounts this section on every project change,
            so the cards play their animation again instead of staying hidden */}
        <ProjectOverview
          key={project.slug}
          bare
          align="left"
          limit={3}
          excludeSlug={project.slug}
          showViewAll
        />
      </motion.div>
    </main>
  );
}
