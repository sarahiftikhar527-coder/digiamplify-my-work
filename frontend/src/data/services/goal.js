
import {
  Briefcase,
  LayoutTemplate,
  Search,
  Share2,
  Atom,
  Film,
  PenTool,
} from 'lucide-react'

export const goalHeader = {
  title: 'Built Around Your Goals',
  description:
    '7 Interconnected services that work as one unified growth system for your business',
}

export const goalServices = [
  {
    id: 'b2b',
    label: 'B2B Marketing',
    slug: 'b2b-b2c',
    icon: Briefcase,
    angle: 0,
  },
  {
    id: 'uiux',
    label: 'UI/UX Design',
    slug: 'ui-ux-design',
    icon: LayoutTemplate,
    angle: 53,
  },
  {
    id: 'ads',
    label: 'Google / Meta Ads',
    slug: 'google-meta-ads',
    icon: Search,
    angle: 93,
  },
  {
    id: 'social',
    label: 'Social Media Managing',
    slug: 'social-media-management',
    icon: Share2,
    angle: 143,
  },
  {
    id: 'ai',
    label: 'AI Automation',
    slug: 'ai-automation',
    icon: Atom,
    angle: 211,
  },
  {
    id: 'video',
    label: 'Video Editing',
    slug: 'video-editing',
    icon: Film,
    angle: 266,
  },
  {
    id: 'graphic',
    label: 'Graphic Design',
    slug: 'graphic-designing',
    icon: PenTool,
    angle: 311,
  },
]