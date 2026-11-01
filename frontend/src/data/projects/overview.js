
export const ROUTE_BASE = "/projects";

export const IMAGE_BASE = "/images/projects/overview";

const img = (file) => `${IMAGE_BASE}/${file}`;

export const overviewHeading = {
  title: "Other",
  highlight: "Projects",
};

export const viewAllLabel = "View All";

export const detailHeadings = {
  about: "About",
  description: "Description",
  resultTitle: "Platform Result",
};

export const projectCategories = [
  "All",
  "Graphic Designing",
  "Web Development",
];

export const overviewProjects = [
  {
    slug: "digiamplify-post-2",
    title: "DigiAmplify Post 2",
    category: "Graphic Designing",
    text: "A graphic design project showcasing DigiAmplify's visual content and creative design work.",
    image: img("overview1.webp"),

    summary:
      "A graphic design portfolio project created for DigiAmplify, showcasing visual content and brand-focused creative presentation.",

    about:
      "DigiAmplify Post 2 is part of the agency's graphic design portfolio. It represents the visual content work displayed in the Graphic Designing category.",

    description: [
      "This project is presented as part of DigiAmplify's graphic design work. It showcases a visual creative piece in the agency's portfolio.",

      "The design is included in the Graphic Designing collection alongside other visual content projects.",

      "Explore the project to view the creative work and its visual presentation.",
    ],

    stats: [],
    bars: [],
  },

  {
    slug: "digiamplify-post-1",
    title: "DigiAmplify Post 1",
    category: "Graphic Designing",
    text: "A graphic design portfolio piece featuring DigiAmplify's creative visual content.",
    image: img("overview2.webp"),

    summary:
      "A visual design project featured in DigiAmplify's Graphic Designing portfolio.",

    about:
      "DigiAmplify Post 1 is another creative project displayed in DigiAmplify's Graphic Designing collection.",

    description: [
      "This project showcases a graphic design piece included in the agency's portfolio.",

      "It forms part of DigiAmplify's visual content work and is displayed in the Graphic Designing category.",

      "The project highlights the agency's creative design portfolio.",
    ],

    stats: [],
    bars: [],
  },

  {
    slug: "prime-engineering",
    title: "Prime-engineering",
    category: "Web Development",
    text: "A web development project featured in DigiAmplify's portfolio.",
    image: img("overview3.webp"),

    summary:
      "A website project showcased in DigiAmplify's Web Development portfolio.",

    about:
      "Prime-engineering is featured in DigiAmplify's Web Development collection as one of its website projects.",

    description: [
      "This project is listed in the Web Development category of DigiAmplify's portfolio.",

      "It represents a website development project included in the agency's selected work.",

      "The project is part of DigiAmplify's web development portfolio.",
    ],

    stats: [],
    bars: [],
  },

  {
    slug: "legal-help-uk",
    title: "Legal help.uk",
    category: "Web Development",
    text: "A website project for Legal help.uk, featured in DigiAmplify's Web Development portfolio.",
    image: img("overview4.webp"),

    summary:
      "Legal help.uk is a web development project displayed in DigiAmplify's selected portfolio.",

    about:
      "Legal help.uk appears in DigiAmplify's Web Development portfolio as one of the agency's featured website projects.",

    description: [
      "This project is included in the Web Development collection on DigiAmplify's portfolio.",

      "The website is presented as part of the agency's selected web development work.",

      "Explore the project to see its website design and presentation.",
    ],

    stats: [],
    bars: [],
  },

  {
    slug: "norde-scotia",
    title: "Norde-Scotia",
    category: "Web Development",
    text: "A web development project featured in DigiAmplify's selected website portfolio.",
    image: img("overview5.webp"),

    summary:
      "Norde-Scotia is listed among DigiAmplify's Web Development projects.",

    about:
      "Norde-Scotia is one of the website projects displayed in DigiAmplify's Web Development portfolio.",

    description: [
      "This project is featured in DigiAmplify's website development collection.",

      "It forms part of the agency's selected web development portfolio.",

      "The project is presented as an example of the website work listed by DigiAmplify.",
    ],

    stats: [],
    bars: [],
  },

  {
    slug: "euro-installations",
    title: "Euro-Installations",
    category: "Web Development",
    text: "A website project included in DigiAmplify's Web Development portfolio.",
    image: img("overview6.webp"),

    summary:
      "Euro-Installations is featured in DigiAmplify's Web Development portfolio.",

    about:
      "Euro-Installations is one of the projects listed in the Web Development category on DigiAmplify's portfolio.",

    description: [
      "This project is included in the agency's Web Development collection.",

      "It is presented as one of DigiAmplify's selected website projects.",

      "Explore the project to view its website presentation.",
    ],

    stats: [],
    bars: [],
  },
];

export const getProjectBySlug = (slug) =>
  overviewProjects.find((project) => project.slug === slug);

export const getProjectsByCategory = (category = "All") => {
  if (category === "All") {
    return overviewProjects;
  }

  return overviewProjects.filter(
    (project) => project.category === category
  );
};
