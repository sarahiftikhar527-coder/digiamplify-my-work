import { Compass, PenTool, Bot, Files, Brain, Layers } from 'lucide-react'

const BASE = '/images/about/differentiators'

const description =
  'UX research, wireframes, and high-fidelity UI that balances aesthetic and usability. Transforming ideas into seamless, intuitive, and visually captivating digital experiences.'

export const differentiators = [
  {
    id: 1,
    key: 'Innovative',
    icon: Compass,
    title: 'Strategic Thinking',
    description,
    image: `${BASE}/differentiator1.webp`,
    titleSize: 'text-2xl md:text-5xl',
  },
  {
    id: 2,
    key: 'Strategy',
    icon: PenTool,
    title: 'Creative Excellence',
    description:
      'We deliver creative excellence through innovative ideas, refined design and impactful execution that elevates every digital experience.',
    image: `${BASE}/differentiator2.webp`,
    titleSize: 'text-lg md:text-xl',
  },
  {
    id: 3,
    key: 'Reliability',
    icon: Bot,
    title: 'Marketing Intelligence',
    description:
      'We use marketing intelligence to turn data insights and strategy into campaigns that drive smarter.',
    image: `${BASE}/differentiator3.webp`,
    titleSize: 'text-lg md:text-xl',
  },
  {
    id: 4,
    key: 'Scalability',
    icon: Files,
    title: 'Conversion optimization',
    description:
      'We optimize every touchpoint to increase conversions through data-driven strategies, user-focused design, and continuous performance improvement.',
    image: `${BASE}/differentiator4.webp`,
    titleSize: 'text-lg md:text-xl',
  },
  {
    id: 5,
    key: 'Performance',
    icon: Brain,
    title: 'Scalable Systems',
    description:
      'We build scalable systems designed to grow with your business, ensuring flexibility, performance, long-term reliability and seamless expansion for future growth.',
    image: `${BASE}/differentiator5.webp`,
    titleSize: 'text-lg md:text-xl',
  },
  {
    id: 6,
    key: 'Design',
    icon: Layers,
    title: 'AI Powered Solutions',
    description:
      'We deliver AI-powered solutions that automate processes, enhance decision making, optimize performance, improve efficiency and drive smarter business outcomes.',
    image: `${BASE}/differentiator6.webp`,
    titleSize: 'text-lg md:text-xl',
  },
]