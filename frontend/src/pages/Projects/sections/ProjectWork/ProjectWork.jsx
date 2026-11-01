import React, { useMemo, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useNavigate } from "react-router-dom";
import {
  categories,
  projects,
  workHeading,
} from "../../../../data/projects/work";
import ProjectDetails from "../ProjectDetails/ProjectDetails";

const css = `
@import url("https://fonts.googleapis.com/css2?family=Outfit:wght@300;400&family=Poppins:wght@300;400;500&display=swap");

.pw {
  --pw-red: #b3000f;
  --pw-border: #232325;
  width: 100%;
  box-sizing: border-box;
  padding: 3rem 5.2%;
  background: linear-gradient(160deg, #171717 0%, #0b0b0b 55%, #090909 100%);
  color: #fff;
  font-family: "Poppins", sans-serif;
}

.pw *,
.pw *::before,
.pw *::after {
  box-sizing: border-box;
}

.pw__head {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 1.5rem;
  flex-wrap: wrap;
  margin-bottom: 1.6rem;
}

.pw__title {
  margin: 0;
  font-family: "Outfit", sans-serif;
  font-weight: 300;
  font-size: clamp(1.6rem, 2.4vw, 2.2rem);
  letter-spacing: 0.01em;
}

.pw__title span {
  color: var(--pw-red);
}

.pw__filters {
  display: flex;
  align-items: center;
  gap: 0.35rem;
  padding: 0.55rem;
  background: #0a0a0b;
  border: 1px solid var(--pw-border);
  border-radius: 14px;
  overflow-x: auto;
  max-width: 100%;
}

.pw__filter {
  border: 0;
  background: transparent;
  color: #fff;
  font: 400 0.8rem "Outfit", sans-serif;
  padding: 0.5rem 1.05rem;
  border-radius: 8px;
  cursor: pointer;
  white-space: nowrap;
  transition: background 0.2s ease, transform 0.2s ease;
}

.pw__filter:hover {
  background: #1a1a1c;
  transform: translateY(-1px);
}

.pw__filter[aria-pressed="true"] {
  background: var(--pw-red);
}

.pw__filter:focus-visible,
.pw__more:focus-visible {
  outline: 2px solid #fff;
  outline-offset: 2px;
}

.pw__featured {
  display: grid;
  grid-template-columns: 2.35fr 1fr;
  gap: 1rem;
}

.pw__media {
  position: relative;
  min-height: 340px;
  border-radius: 8px;
  overflow: hidden;
  background: #111;
}

.pw__media img {
  position: absolute;
  inset: 0;
  width: 100%;
  height: 100%;
  object-fit: cover;
  display: block;
}

.pw__media::after {
  content: "";
  position: absolute;
  inset: 0;
  pointer-events: none;
  background: linear-gradient(
    120deg,
    transparent 20%,
    rgba(255, 255, 255, 0.08) 50%,
    transparent 80%
  );
  transform: translateX(-120%);
  transition: transform 0.8s ease;
}

.pw__media:hover::after {
  transform: translateX(120%);
}

.pw__more-wrap {
  display: flex;
  justify-content: flex-end;
  margin-top: 1rem;
}

.pw__more {
  border: 1px solid #3a3a3d;
  background: #0d0d0e;
  color: #fff;
  padding: 0.65rem 1.2rem;
  border-radius: 9px;
  font: 400 0.78rem "Outfit", sans-serif;
  cursor: pointer;
  transition:
    background 0.25s ease,
    border-color 0.25s ease,
    transform 0.25s ease,
    box-shadow 0.25s ease;
}

.pw__more:hover {
  background: var(--pw-red);
  border-color: var(--pw-red);
  transform: translateY(-2px);
  box-shadow: 0 12px 30px rgba(179, 0, 15, 0.25);
}

@media (max-width: 900px) {
  .pw__featured {
    grid-template-columns: 1fr;
  }

  .pw__media {
    min-height: 240px;
  }
}

@media (max-width: 600px) {
  .pw {
    padding: 2.2rem 1rem;
  }

  .pw__filters {
    width: 100%;
  }

  .pw__filter {
    padding: 0.5rem 0.85rem;
  }

  .pw__media {
    min-height: 210px;
  }
}
`;

const slugify = (value) =>
  value
    .toLowerCase()
    .trim()
    .replace(/&/g, "and")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");

const filterContainer = {
  hidden: {
    opacity: 0,
    y: -12,
  },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.6,
      ease: [0.22, 1, 0.36, 1],
      staggerChildren: 0.07,
    },
  },
};

const filterItem = {
  hidden: {
    opacity: 0,
    scale: 0.8,
  },
  visible: {
    opacity: 1,
    scale: 1,
    transition: {
      duration: 0.45,
      ease: [0.22, 1, 0.36, 1],
    },
  },
};

const contentVariants = {
  hidden: {
    opacity: 0,
    y: 35,
  },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.8,
      ease: [0.22, 1, 0.36, 1],
    },
  },
};

export default function ProjectWork() {
  const navigate = useNavigate();

  const [category, setCategory] = useState("All");
  const [index, setIndex] = useState(0);

  const visible = useMemo(
    () =>
      category === "All"
        ? projects
        : projects.filter((p) => p.category === category),
    [category]
  );

  const current = visible[index] || visible[0];

  const selectCategory = (name) => {
    setCategory(name);
    setIndex(0);
  };

  const openCategoryPage = () => {
    navigate(`/projects/category/${slugify(category)}`);
  };

  return (
    <section className="pw">
      <style>{css}</style>

      <motion.div
        className="pw__head"
        initial={{ opacity: 0, y: -25 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, amount: 0.3 }}
        transition={{
          duration: 0.8,
          ease: [0.22, 1, 0.36, 1],
        }}
      >
        <motion.h2
          className="pw__title"
          initial={{ opacity: 0, x: -35 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true }}
          transition={{
            duration: 0.8,
            delay: 0.1,
            ease: [0.22, 1, 0.36, 1],
          }}
        >
          {workHeading.title} <span>{workHeading.highlight}</span>
        </motion.h2>

        <motion.div
          className="pw__filters"
          variants={filterContainer}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          role="group"
          aria-label="Filter projects"
        >
          {categories.map((name) => (
            <motion.button
              key={name}
              type="button"
              className="pw__filter"
              aria-pressed={category === name}
              variants={filterItem}
              whileHover={{
                scale: 1.04,
                y: -2,
              }}
              whileTap={{
                scale: 0.94,
              }}
              onClick={() => selectCategory(name)}
            >
              {name}
            </motion.button>
          ))}
        </motion.div>
      </motion.div>

      <AnimatePresence mode="wait">
        {current && (
          <motion.div
            key={`${category}-${current.id}`}
            initial="hidden"
            animate="visible"
            exit={{
              opacity: 0,
              y: 25,
              scale: 0.985,
              transition: {
                duration: 0.3,
                ease: "easeInOut",
              },
            }}
            variants={contentVariants}
          >
            <div className="pw__featured">
              <motion.div
                className="pw__media"
                initial={{
                  opacity: 0,
                  scale: 0.94,
                  x: -35,
                }}
                animate={{
                  opacity: 1,
                  scale: 1,
                  x: 0,
                }}
                transition={{
                  duration: 0.9,
                  delay: 0.12,
                  ease: [0.22, 1, 0.36, 1],
                }}
                whileHover={{
                  scale: 1.012,
                }}
              >
                <motion.img
                  src={current.image}
                  alt={current.imageAlt || current.category}
                  initial={{
                    scale: 1.12,
                  }}
                  animate={{
                    scale: 1,
                  }}
                  transition={{
                    duration: 1.2,
                    ease: [0.22, 1, 0.36, 1],
                  }}
                  whileHover={{
                    scale: 1.06,
                  }}
                />
              </motion.div>

              <motion.div
                initial={{
                  opacity: 0,
                  x: 35,
                }}
                animate={{
                  opacity: 1,
                  x: 0,
                }}
                transition={{
                  duration: 0.8,
                  delay: 0.2,
                  ease: [0.22, 1, 0.36, 1],
                }}
              >
                <ProjectDetails
                  projectId={current.id}
                  animationKey={`${category}-${current.id}`}
                />
              </motion.div>
            </div>

            {visible.length > 1 && (
              <motion.div
                className="pw__more-wrap"
                initial={{
                  opacity: 0,
                  y: 15,
                }}
                animate={{
                  opacity: 1,
                  y: 0,
                }}
                transition={{
                  duration: 0.6,
                  delay: 0.45,
                }}
              >
                <motion.button
                  type="button"
                  className="pw__more"
                  onClick={openCategoryPage}
                  whileHover={{
                    scale: 1.04,
                    y: -3,
                    boxShadow: "0 12px 30px rgba(179, 0, 15, 0.25)",
                  }}
                  whileTap={{
                    scale: 0.96,
                  }}
                >
                  Show More {category}
                </motion.button>
              </motion.div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </section>
  );
}