import React from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import {
  ROUTE_BASE,
  overviewHeading,
  overviewProjects,
  viewAllLabel,
} from "../../../../data/projects/overview";

const css = `
@import url("https://fonts.googleapis.com/css2?family=Outfit:wght@300;400&family=Poppins:wght@300;400;600&display=swap");

.po {
  --po-red: #c00a1c;
  width: 100%;
  box-sizing: border-box;
  padding: 3rem 5.2%;
  background: linear-gradient(160deg, #111 0%, #060606 100%);
  color: #fff;
  font-family: "Poppins", sans-serif;
  overflow: hidden;
}

.po--bare {
  padding: 0;
  background: transparent;
}

.po *,
.po *::before,
.po *::after {
  box-sizing: border-box;
}

.po__head {
  margin-bottom: 1.6rem;
}

.po__head--center {
  text-align: center;
}

.po__head--left {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 1rem;
}

.po__title {
  margin: 0;
  font-family: "Outfit", sans-serif;
  font-weight: 300;
  font-size: clamp(1.5rem, 2.4vw, 2.2rem);
}

.po__title span {
  color: var(--po-red);
}

.po__all {
  color: #fff;
  text-decoration: none;
  font-size: 0.8rem;
  font-weight: 400;
  transition: color 0.25s ease;
}

.po__all:hover {
  color: var(--po-red);
}

.po__grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 2rem 1.2rem;
}

/* Whole card is a link: image on top, name centered below */
.po__card {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.9rem;
  color: #fff;
  text-decoration: none;
}

.po__card:focus-visible {
  outline: 2px solid #fff;
  outline-offset: 4px;
}

/* Image only - nothing is written on top of it */
.po__image-wrap {
  width: 100%;
  aspect-ratio: 403 / 322;
  overflow: hidden;
  border-radius: 1.7rem;
  background: #111;
}

.po__img {
  display: block;
  width: 100%;
  height: 100%;
  object-fit: cover;
  transition: transform 0.7s cubic-bezier(0.22, 1, 0.36, 1);
}

.po__card:hover .po__img {
  transform: scale(1.05);
}

/* Only the project name, centered under the image */
.po__card-title {
  margin: 0;
  text-align: center;
  font-weight: 600;
  font-size: clamp(0.95rem, 1.4vw, 1.1rem);
  transition: color 0.3s ease;
}

.po__card:hover .po__card-title {
  color: var(--po-red);
}

@media (max-width: 900px) {
  .po__grid {
    grid-template-columns: repeat(2, 1fr);
  }
}

@media (max-width: 600px) {
  .po__grid {
    grid-template-columns: 1fr;
  }
}

@media (prefers-reduced-motion: reduce) {
  .po__img,
  .po__card-title {
    transition: none;
  }
}
`;

const headingVariants = {
  hidden: { opacity: 0, y: 30 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.75, ease: [0.22, 1, 0.36, 1] },
  },
};

const gridVariants = {
  hidden: {},
  visible: {
    transition: { staggerChildren: 0.12, delayChildren: 0.1 },
  },
};

const cardVariants = {
  hidden: { opacity: 0, y: 40 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.7, ease: [0.22, 1, 0.36, 1] },
  },
};

export default function ProjectOverview({
  limit,
  excludeSlug,
  align = "center",
  showViewAll = false,
  bare = false,
}) {
  const list = overviewProjects
    .filter((p) => p.slug !== excludeSlug)
    .slice(0, limit || overviewProjects.length);

  return (
    <section className={`po${bare ? " po--bare" : ""}`}>
      <style>{css}</style>

      <motion.div
        className={`po__head po__head--${align}`}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, amount: 0.3 }}
        variants={headingVariants}
      >
        <h2 className="po__title">
          {overviewHeading.title} <span>{overviewHeading.highlight}</span>
        </h2>

        {showViewAll && (
          <Link to={ROUTE_BASE} className="po__all">
            {viewAllLabel} &#8599;
          </Link>
        )}
      </motion.div>

      <motion.div
        className="po__grid"
        variants={gridVariants}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, amount: 0.08 }}
      >
        {list.map((p) => (
          <motion.div key={p.slug} variants={cardVariants}>
            <Link
              to={`${ROUTE_BASE}/overview/${p.slug}`}
              className="po__card"
              aria-label={`Open project: ${p.title}`}
            >
              <div className="po__image-wrap">
                <img
                  className="po__img"
                  src={p.image}
                  alt={p.title}
                  loading="lazy"
                />
              </div>

              <h3 className="po__card-title">{p.title}</h3>
            </Link>
          </motion.div>
        ))}
      </motion.div>
    </section>
  );
}
