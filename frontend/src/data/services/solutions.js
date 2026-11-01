// src/data/services/solutions.js
import {
  Compass,
  FlaskConical,
  Layers,
  MousePointerClick,
  Settings,
  TrendingUp,
} from 'lucide-react'

export const solutionsHeader = {
  title: 'Solutions built for',
  accent: 'modern brands',
  description:
    'We combine strategy, creativity, and technology to build solutions that help brands grow with confidence. From marketing and design to automation and digital experiences, every service is crafted to deliver measurable impact. Our focus is on creating meaningful results that drive long term success and sustainable business growth.',

  // public/images/services/solutions/solution.webp
  image: '/images/services/solutions/solutions.webp',
  imageAlt: 'Rotating 3D metallic shape',
}

const text =
  'We use smart planning, innovation, and execution to create solutions that deliver measurable results and lasting impact.'

export const solutions = [
  { id: 'discovery', number: '01', title: 'Discovery', description: text, icon: Compass },
  { id: 'research', number: '02', title: 'Research', description: text, icon: FlaskConical },
  { id: 'strategy', number: '03', title: 'Strategy', description: text, icon: Layers },
  { id: 'execution', number: '04', title: 'Execution', description: text, icon: MousePointerClick },
  { id: 'optimization', number: '05', title: 'Optimization', description: text, icon: Settings },
  { id: 'growth', number: '06', title: 'Growth', description: text, icon: TrendingUp },
]