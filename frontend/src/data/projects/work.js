export const IMAGE_BASE = "/images/projects/work";

const img = (file) => `${IMAGE_BASE}/${file}`;

export const workHeading = {
  title: "Our recent",
  highlight: "work",
};

export const projects = [
  {
    id: "work-1",
    category: "Website",
    image: img("work1.webp"),
    imageAlt: "Modern website project showcase",
  },
  {
    id: "work-2",
    category: "Website",
    image: img("work2.webp"),
    imageAlt: "Futuristic website interface showcase",
  },
  {
    id: "work-3",
    category: "Design",
    image: img("work3.webp"),
    imageAlt: "Creative branding and typography design",
  },
  {
    id: "work-4",
    category: "Design",
    image: img("work4.webp"),
    imageAlt: "Modern visual identity design showcase",
  },
  {
    id: "work-5",
    category: "Poster",
    image: img("work5.webp"),
    imageAlt: "Premium advertising poster campaign",
  },
  {
    id: "work-6",
    category: "Poster",
    image: img("work6.webp"),
    imageAlt: "Creative outdoor poster campaign",
  },
  {
    id: "work-7",
    category: "AI campaign",
    image: img("work7.webp"),
    imageAlt: "AI powered marketing campaign",
  },
  {
    id: "work-8",
    category: "AI campaign",
    image: img("work8.webp"),
    imageAlt: "Artificial intelligence marketing campaign",
  },
];

export const categories = ["All", ...new Set(projects.map((p) => p.category))];