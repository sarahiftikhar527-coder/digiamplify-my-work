const stepText =
  'A strategic approach that combines research, creative thinking, clear execution, and continuous optimization to create digital experiences that deliver measurable business results.'

const bodyText =
  'Successful digital growth starts with understanding the audience, defining the right strategy, and creating experiences that genuinely connect with people. From strong visual identities and engaging content to intelligent automation and performance-driven campaigns, every element plays an important role. At DigiAmplify, we combine creativity, technology, and strategy to help modern brands build stronger digital experiences and achieve sustainable growth.'

export const blogSidebar = {
  searchPlaceholder: 'Search...',

  categories: [
    { label: 'B2B, B2C', count: 18 },
    { label: 'Video Editing', count: 12 },
    { label: 'Google / Meta Ads', count: 16 },
    { label: 'AI Automation', count: 11 },
    { label: 'Graphic Designing', count: 22 },
    { label: 'UI/UX Design', count: 12 },
    { label: 'Social Media Management', count: 8 },
  ],

  recent: [
    {
      id: 1,
      slug: 'how-great-ui-ux-design-builds-better-digital-products',
      image: '/images/blog/details/recent1.webp',
      title: 'How Great UI/UX Design Builds Better Digital Products',
      date: '10 June 2026',
    },
    {
      id: 2,
      slug: 'ai-automation-transforming-modern-business',
      image: '/images/blog/details/recent2.webp',
      title: 'How AI Automation Is Transforming Modern Businesses',
      date: '14 June 2026',
    },
    {
      id: 3,
      slug: 'social-media-strategies-that-grow-brands',
      image: '/images/blog/details/recent3.webp',
      title: 'Social Media Strategies That Actually Grow Brands',
      date: '18 June 2026',
    },
  ],

  tags: [
    'Design',
    'Marketing',
    'AI',
    'Automation',
    'Branding',
    'Social Media',
    'UI/UX',
    'Growth',
  ],

  cta: {
    title: 'Ready to scale your digital presence?',
    text: 'Talk to our strategy team today.',
    button: 'Book a Call',
    href: '/contact',
  },
}

export const blogArticle = {
  category: 'UI/UX Design',
  readTime: '8 minute Read',
  date: '10 June 2026',
  title: 'How Great UI/UX Design Builds Better Digital Products',

  excerpt:
    'Discover how thoughtful UI/UX design can transform digital products by improving usability, creating stronger visual experiences, and helping businesses turn visitors into loyal customers.',

  ringImage: '/images/blog/details/ring.webp',
  coverImage: '/images/blog/details/cover.webp',

  author: {
    name: 'Jhon Mari',
    role: 'Creative Director',
    avatar: '',
  },

  views: '4,950 views',
  commentsLabel: '8 Comments',

  intro: bodyText,

  quote: {
    text: 'Great digital experiences are created when creativity, usability, and strategy work together.',
    author: 'Jhon Mari, Creative Director at DigiAmplify',
  },

  framework: {
    heading: 'The Four Phase Digital Growth Framework',

    description:
      'A practical methodology designed to help businesses move from ideas to measurable digital growth. By combining research, strategy, creative execution, and continuous optimization, brands can create stronger experiences and achieve long-term results.',

    steps: [
      {
        number: '01',
        title: 'Research & Discover',
        description: stepText,
      },
      {
        number: '02',
        title: 'Plan & Strategize',
        description: stepText,
      },
      {
        number: '03',
        title: 'Design & Execute',
        description: stepText,
      },
      {
        number: '04',
        title: 'Measure & Optimize',
        description: stepText,
      },
    ],
  },

  insight: {
    title: 'Key Insight',
    text: 'The strongest digital products are not simply attractive. They are designed around real user needs, clear business goals, and seamless interactions. When design and strategy work together, businesses can create experiences that build trust and drive meaningful results.',
  },

  stats: [
    {
      value: '67%',
      label: 'Higher engagement through optimized digital experiences',
    },
    {
      value: '3.3x',
      label: 'Average improvement in user interaction',
    },
    {
      value: '30 Day',
      label: 'Typical timeline for a focused digital strategy',
    },
  ],

  closing: bodyText,

  tags: [
    'Design',
    'UI/UX',
    'Digital Products',
    'Marketing',
    'Branding',
    'Growth',
    'Strategy',
    'User Experience',
  ],
}

export const blogComments = [
  {
    id: 1,
    name: 'Sarkti Jhon',
    role: 'Head of Company · June 10, 2026',
    avatar: '',
    text: 'This was a highly insightful read. The ideas around user experience and digital product strategy provide valuable perspective for businesses looking to create stronger and more effective digital experiences.',
    likes: 21,
  },
  {
    id: 2,
    name: 'Sarkti Jhon',
    role: 'Head of Company · June 10, 2026',
    avatar: '',
    text: 'A great breakdown of how thoughtful design can influence business growth. The practical framework makes the process easy to understand and apply.',
    likes: 17,
  },
]

const relatedText =
  'Discover practical strategies that can help modern businesses strengthen their digital presence, improve engagement, and turn online visitors into loyal customers.'

export const keepReading = {
  title: 'Keep Reading',
  linkLabel: 'View all Articles',
  linkHref: '/blog',

  posts: [
    {
      id: 1,
      slug: 'ai-automation-transforming-modern-business',
      image: '/images/blog/details/related1.webp',
      category: 'AI Automation',
      title: 'How AI Automation Is Transforming Modern Businesses',
      description: relatedText,
      date: 'June 14, 2026',
      readTime: '7 min',
    },
    {
      id: 2,
      slug: 'social-media-strategies-that-grow-brands',
      image: '/images/blog/details/related2.webp',
      category: 'Social Media',
      title: 'Social Media Strategies That Actually Grow Brands',
      description: relatedText,
      date: 'June 18, 2026',
      readTime: '6 min',
    },
    {
      id: 3,
      slug: 'digital-marketing-trends-every-business-should-know',
      image: '/images/blog/details/related3.webp',
      category: 'Marketing',
      title: 'Digital Marketing Trends Every Business Should Know',
      description: relatedText,
      date: 'June 22, 2026',
      readTime: '8 min',
    },
    {
      id: 4,
      slug: 'video-content-strategy-for-modern-brands',
      image: '/images/blog/details/related4.webp',
      category: 'Video Editing',
      title: 'Why Video Content Is Essential for Modern Brands',
      description: relatedText,
      date: 'June 26, 2026',
      readTime: '5 min',
    },
  ],
}