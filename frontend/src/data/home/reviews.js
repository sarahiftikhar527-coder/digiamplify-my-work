const reviews = [
  {
    id: 1,
    name: 'Jhon wlton',
    email: 'Jhonwlton@gmail.com',
    role: 'CEO, TechVision',
    company: 'TechVision',
    type: 'Software company',
    rating: 5,
    review: 'We exist to make high-growth companies feel inevitable',
  },
  {
    id: 2,
    name: 'Sarah Mitchell',
    email: 'sarah.mitchell@nova.com',
    role: 'Marketing Director, Nova',
    company: 'Nova',
    type: 'Marketing agency',
    rating: 5,
    review:
      'The team understood our goals from day one and delivered a digital experience that feels premium, fast, and genuinely easy to use.',
  },
  {
    id: 3,
    name: 'Michael Anderson',
    email: 'michael@vertex.com',
    role: 'Founder, Vertex',
    company: 'Vertex',
    type: 'Tech startup',
    rating: 5,
    review:
      'From branding to development, DigiAmplify brought everything together beautifully. Their attention to detail made a huge difference.',
  },
  {
    id: 4,
    name: 'Emily Carter',
    email: 'emily@elevate.com',
    role: 'Product Manager, Elevate',
    company: 'Elevate',
    type: 'Product company',
    rating: 5,
    review:
      'Professional, creative, and reliable. The final product exceeded our expectations and gave our brand a much stronger digital identity.',
  },
]

const reviewsMeta = {
  title: 'Our Clients',
  highlight: 'Review',
  sentiment: {
    label: 'Client Sentiment',
    score: '4.9',
    text: 'UX research, wireframes, and high-fidelity UI that balances aesthetic and usability. Transforming ideas into seamless, intuitive, and visually captivating digital experiences..',
  },
  badge: 'Verified Client Review',
  impact: {
    label: 'Impact after Launch',
    items: [
      { value: '+62%', label: 'High Demo conversion' },
      { value: '3 weeks', label: 'Faster stakeholder alignment' },
    ],
  },
}

export { reviews, reviewsMeta }
export default reviews