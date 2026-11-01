// src/data/services/caseStudies.js

export const caseStudiesHeader = {
  title: 'Real Clients',
  accent: 'Real Results',
  description:
    'Trusted by growing brands and established businesses alike, we focus on delivering measurable outcomes that make a lasting impact. Every project is driven by strategy, creativity, and performance, helping our clients achieve meaningful growth and long-term success.',
  buttonText: 'Read All case study',
  buttonLink: '/projects',
}

const challenges =
  'UX research, wireframes, and high fidelity UI that balances aesthetic and usability. Transforming'

const strategy =
  'UX research, wireframes, and high fidelity UI that balances aesthetic and usability. Transforming'

const results = [
  { value: '98%', label: 'Growth' },
  { value: '6.2%', label: 'Reduction' },
  { value: '8 mo', label: 'Time to Result' },
]

// public/images/services/casestudies/casestudy1.webp
export const caseStudies = [
  {
    id: 1,
    title: 'Scale Force SaaS',
    category: 'B2B Software',
    image: '/images/services/casestudies/casestudy1.webp',
    imageAlt: 'Scale Force SaaS team working together',
    challenges,
    strategy,
    results,
    link: '/projects',
  },
  {
    id: 2,
    title: 'Scale Force SaaS',
    category: 'B2B Software',
    image: '/images/services/casestudies/casestudy2.webp',
    imageAlt: 'Scale Force SaaS team in a meeting',
    challenges,
    strategy,
    results,
    link: '/projects',
  },
]