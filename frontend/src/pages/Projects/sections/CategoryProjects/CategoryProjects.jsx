
import React from "react";
import { useParams, Link } from "react-router-dom";
import { projects } from "../../../../data/projects/work";
import ProjectDetails from "../ProjectDetails/ProjectDetails";



const css = `
@import url("https://fonts.googleapis.com/css2?family=Outfit:wght@300;400&family=Poppins:wght@300;400;500&display=swap");

.cp {
  min-height: 100vh;
  padding: 4rem 5.2%;
  background: linear-gradient(160deg, #171717 0%, #0b0b0b 55%, #090909 100%);
  color: #fff;
  font-family: "Poppins", sans-serif;
}

.cp__top {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 1rem;
  margin-bottom: 2rem;
}

.cp__back {
  color: #fff;
  text-decoration: none;
  font: 300 0.85rem "Outfit", sans-serif;
  border: 1px solid #303033;
  padding: 0.65rem 1rem;
  border-radius: 8px;
  transition: 0.25s ease;
}

.cp__back:hover {
  background: #b3000f;
  border-color: #b3000f;
}

.cp__title {
  margin: 0;
  font: 300 clamp(2rem, 4vw, 3.5rem) "Outfit", sans-serif;
}

.cp__title span {
  color: #b3000f;
}

.cp__count {
  margin: 0.5rem 0 0;
  color: #777;
  font-size: 0.8rem;
}

.cp__grid {
  display: grid;
  gap: 1.5rem;
}

.cp__item {
  display: grid;
  grid-template-columns: 1.7fr 1fr;
  gap: 1rem;
  padding: 1rem;
  background: #0c0c0d;
  border: 1px solid #232325;
  border-radius: 12px;
}

.cp__image {
  min-height: 360px;
  overflow: hidden;
  border-radius: 8px;
  background: #111;
}

.cp__image img {
  width: 100%;
  height: 100%;
  min-height: 360px;
  object-fit: cover;
  display: block;
}

@media (max-width: 900px) {
  .cp {
    padding: 2.5rem 1rem;
  }

  .cp__item {
    grid-template-columns: 1fr;
  }

  .cp__image,
  .cp__image img {
    min-height: 260px;
  }

  .cp__top {
    align-items: flex-start;
    flex-direction: column;
  }
}
`;

export default function CategoryProjects() {
  const { category } = useParams();

  const categoryName = category
    .split("-")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");

  const filteredProjects =
    category === "all"
      ? projects
      : projects.filter(
          (project) =>
            project.category?.toLowerCase() === categoryName.toLowerCase()
        );

  return (
    <main className="cp">
      <style>{css}</style>

      <div className="cp__top">
        <div>
          <h1 className="cp__title">
            {categoryName} <span>Projects</span>
          </h1>

          <p className="cp__count">
            {filteredProjects.length} project
            {filteredProjects.length !== 1 ? "s" : ""}
          </p>
        </div>

        <Link to="/projects" className="cp__back">
          Back to Projects
        </Link>
      </div>

      <div className="cp__grid">
        {filteredProjects.map((project) => (
          <article className="cp__item" key={project.id}>
            <div className="cp__image">
              <img
                src={project.image}
                alt={project.imageAlt || project.category}
              />
            </div>

            <ProjectDetails projectId={project.id} />
          </article>
        ))}
      </div>
    </main>
  );
}