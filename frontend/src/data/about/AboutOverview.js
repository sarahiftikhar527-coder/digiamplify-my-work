export const stats = [
  { value: '12+', label: 'Years in buisness' },
  { value: '500+', label: 'Project Delivered' },
  { value: '200+', label: 'Global connections' },
]

export const avatars = [
  '/images/about/overview/avatar1.webp',
  '/images/about/overview/avatar2.webp',
  '/images/about/overview/avatar3.webp',
  '/images/about/overview/avatar4.webp',
]

export const fade = (delay = 0) => ({
  initial: { opacity: 0, y: 24 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true, amount: 0.2 },
  transition: {
    duration: 0.8,
    delay,
    ease: 'easeOut',
  },
})