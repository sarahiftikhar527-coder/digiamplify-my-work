const IMG = '/images/servicedetails';

/* ---------------- Sab services mein common ---------------- */
export const servicesCommon = {
  cta: { label: 'Book a service', href: '/contact' },

  // Hero ke neeche floating 3D shapes + features/stats wala cube
  shapes: [`${IMG}/shape-1.webp`, `${IMG}/shape-2.webp`],
  cube: `${IMG}/cube.webp`,

  phases: {
    heading: '4 Phases',
    highlight: 'Built for Success.',
    text: 'A repeatable proven system that delivers on time and above expectations.',
    steps: [
      {
        number: '01',
        title: 'Discovery',
        text: 'We analyze your goals, audience, and requirements to establish a clear foundation for success.',
      },
      {
        number: '02',
        title: 'Planning',
        text: 'We turn insights into a clear roadmap, defining structure, strategy, and priorities for successful execution.',
      },
      {
        number: '03',
        title: 'Execution',
        text: 'We bring the plan to life with precision, transforming strategy into a fully functional and impactful solution.',
      },
      {
        number: '04',
        title: 'Optimization',
        text: 'We refine and enhance every detail to ensure peak performance, efficiency, and continuous improvement.',
      },
    ],
  },

  faqs: {
    label: 'FAQs',
    heading: 'Clear answers for teams investing in serious',
    highlight: 'digital change.',
    text: 'Our engagements are thoughtfully designed to be high-touch, strategy-led, and results-focused, providing clarity, confidence, and seamless collaboration from day one. Every interaction is guided by expertise, transparency, and a commitment to delivering exceptional outcomes at every stage of the journey.',
    items: [
      {
        q: 'What kind of clients do you work with?',
        a: 'We partner with ambitious startups, premium consumer brands, and enterprise teams that need a sharper digital presence and cleaner market story.',
      },
      {
        q: 'How does your project process work?',
        a: 'Every project follows four phases: discovery, planning, execution, and optimization, with regular check-ins so you always know where things stand.',
      },
      {
        q: 'Do you work with startups and established businesses?',
        a: 'Yes. We scale our approach to fit your stage, from lean launches for startups to long-term programs for established brands.',
      },
      {
        q: 'How do you ensure project quality and performance?',
        a: 'We combine clear quality checkpoints, peer reviews, and measurable KPIs, then keep optimizing after launch.',
      },
      {
        q: 'Do you provide ongoing support and maintenance?',
        a: 'Absolutely. We offer flexible support plans so your work keeps improving long after the first delivery.',
      },
    ],
  },
}

/* ------- Default content (jis service ne override na kiya) ------- */
const defaults = {
  features: {
    highlight: 'Great work',
    rest: 'drives perception, trust, and growth.',
    items: [
      {
        icon: 'users',
        title: 'Client Centered Approach',
        text: 'We build every project around your audience and goals, ensuring clarity, simplicity, and meaningful results.',
      },
      {
        icon: 'pen',
        title: 'Creative Excellence',
        text: 'Original ideas and refined craft for work that stands out.',
      },
      {
        icon: 'enter',
        title: 'Rapid Turnaround',
        text: 'Fast, organized delivery without cutting quality.',
      },
      {
        icon: 'wrench',
        title: 'Conversion Focused',
        text: 'Every decision is made to move people toward action.',
      },
      {
        icon: 'layers',
        title: 'Scalable Systems',
        text: 'Consistent foundations that grow with your brand.',
      },
      {
        icon: 'trend',
        title: 'Data Driven Results',
        text: 'We track performance closely and optimize based on real numbers and insights, not guesswork.',
      },
    ],
  },

  whyChoose: {
    label: 'Why choose this',
    heading: 'A strategy led approach that delivers',
    highlight: 'real impact',
    items: [
      {
        title: 'End-to-End ownership',
        text: 'We take full ownership of every project from concept to completion, managing each stage with care, consistency, and attention to detail to ensure a smooth process and successful outcome.',
      },
      {
        title: 'Proven Track Record',
        text: 'We have a proven track record of delivering successful projects that consistently meet client goals and exceed expectations.',
      },
      {
        title: 'Metrics Backed Approach',
        text: 'We use metrics-backed decisions to improve experience, performance, and measurable results.',
      },
    ],
  },

  stats: {
    label: 'Results and Impact',
    heading: 'Numbers that define',
    highlight: 'Excellence',
    items: [
      { value: '94%', title: 'Client satisfaction score', text: 'Consistently delivering high client satisfaction.' },
      { value: '3.4x', title: 'Avg growth lift', text: 'After launch' },
      { value: '60%', title: 'Faster delivery', text: 'Streamlined workflows' },
      { value: '2 weeks', title: 'Avg kickoff to first draft', text: 'From brief to first draft' },
      { value: '500+', title: 'Projects delivered', text: 'Since 2023' },
      { value: '12x', title: 'Return on spend', text: 'Average client return' },
    ],
    performance: {
      title: 'Performance Score',
      trendTitle: 'Monthly Trend',
      items: [
        { label: 'Work Quality', value: 97 },
        { label: 'On time Delivery', value: 97 },
        { label: 'Client Retention', value: 97 },
        { label: 'NPS score', value: 97 },
      ],
    },
  },
}

const build = (slug, { slides, ...rest }) => ({
  slug,
  ...defaults,
  ...rest,
  slides: slides.map((s, i) => ({
    ...s,
    image: `${IMG}/${slug}/slide-${i + 1}.webp`,
  })),
  whyImage: `${IMG}/${slug}/why.webp`,
})

/* ------------------------- Services ------------------------- */
export const services = [
  build('b2b-b2c', {
    label: 'B2B, B2C',
    title: 'B2B & B2C Marketing',
    description:
      'We build marketing strategies for businesses that sell to businesses and to consumers, attracting the right audience, nurturing interest, and turning attention into lasting customer relationships.',
    slides: [
      { title: 'B2B Lead Generation', text: 'Targeted campaigns for qualified leads' },
      { title: 'B2C Brand Growth', text: 'Audience-first campaigns that drive demand' },
      { title: 'Funnel Optimization', text: 'Journeys that turn interest into customers' },
    ],
    intro: {
      quote:
        'Great marketing is not about reaching everyone, but about reaching the right people with the right message.',
      text: 'Whether you sell to teams or to individuals, strong marketing starts with understanding who you are talking to. By combining research, positioning, and data-led campaigns, we help brands build trust, generate demand, and grow steadily.',
      tagline: 'Where strategy meets craft',
    },
  }),

  build('video-editing', {
    label: 'Video Editing',
    title: 'Video Editing',
    description:
      'Video editing shapes raw footage into engaging stories. We craft polished, on-brand videos with sharp pacing, clean motion, and sound that keep your audience watching.',
    slides: [
      { title: 'Brand Videos', text: 'Cinematic edits that tell your story' },
      { title: 'Social Reels', text: 'Short-form content built to be watched' },
      { title: 'Ad Creatives', text: 'Scroll-stopping video ads that convert' },
    ],
    intro: {
      quote:
        'Great video is not just about what is shown, but how it moves, feels, and holds attention.',
      text: 'Strong editing turns ideas into experiences. With thoughtful pacing, motion, color, and sound, we create videos that communicate clearly, build emotion, and leave a lasting impression across every platform.',
      tagline: 'Where strategy meets craft',
    },
  }),

  build('google-meta-ads', {
    label: 'Google / Meta Ads',
    title: 'Google / Meta Ads',
    description:
      'We plan, launch, and optimize paid campaigns across Google and Meta, reaching the right people at the right moment and turning ad spend into measurable growth.',
    slides: [
      { title: 'Search Campaigns', text: 'Reach people the moment they search' },
      { title: 'Social Ads', text: 'Targeted campaigns across Meta platforms' },
      { title: 'Retargeting', text: 'Bring interested visitors back to convert' },
    ],
    intro: {
      quote:
        'Great advertising is not about spending more, but about spending smarter on people who are ready to act.',
      text: 'Performance marketing works best when creative, targeting, and tracking move together. We test, measure, and refine every campaign so your budget keeps working harder and delivering real returns.',
      tagline: 'Where strategy meets craft',
    },
  }),

  build('ai-automation', {
    label: 'AI Automation',
    title: 'AI Automation',
    description:
      'We design intelligent workflows that remove repetitive tasks, speed up operations, and give your team more time for the work that matters.',
    slides: [
      { title: 'Workflow Automation', text: 'Remove repetitive tasks from your day' },
      { title: 'AI Chatbots', text: 'Instant, intelligent customer conversations' },
      { title: 'Smart Integrations', text: 'Connect your tools into one system' },
    ],
    intro: {
      quote:
        'Great automation is not about replacing people, but about freeing them to do their best work.',
      text: 'By combining AI with well-designed processes, we help businesses respond faster, reduce errors, and scale without adding complexity, all while keeping the human touch where it counts.',
      tagline: 'Where strategy meets craft',
    },
  }),

  build('graphic-designing', {
    label: 'Graphic Designing',
    title: 'Graphic Designing',
    description:
      'Graphic design gives your brand a clear visual voice. We create distinctive, consistent designs that capture attention and communicate your message instantly.',
    slides: [
      { title: 'Brand Identity', text: 'Logos and visual systems that stand out' },
      { title: 'Marketing Creatives', text: 'Designs that capture attention instantly' },
      { title: 'Print & Packaging', text: 'Polished designs ready for the real world' },
    ],
    intro: {
      quote:
        'Great graphics do not just decorate a message, they make it impossible to ignore.',
      text: 'From identity to campaigns, thoughtful design builds recognition and trust. We combine layout, color, and typography with strategy so every piece looks sharp and works hard for your brand.',
      tagline: 'Where strategy meets craft',
    },
  }),

  build('ui-ux-design', {
    label: 'UI/UX Design',
    title: 'UI/UX Design',
    description:
      'UI/UX design focuses on creating intuitive, user-friendly, and visually engaging digital experiences. It ensures that every interaction is simple, efficient, and meaningful while aligning user needs with business goals.',
    slides: [
      { title: 'UI/UX Designs', text: 'User-focused intuitive interface design' },
      { title: 'Design Flows', text: 'Simplifying journeys with clear flows' },
      { title: 'Web Experiences', text: 'Modern, responsive website design' },
    ],
    intro: {
      quote:
        'Great design is not just about how it looks, but how it communicates, connects, and creates lasting impressions.',
      text: 'UI/UX design plays a vital role in creating seamless digital experiences that are both visually appealing and easy to use. By combining user-centered thinking with thoughtful design principles, it helps businesses improve engagement, build trust, and deliver meaningful interactions across every touchpoint.',
      tagline: 'Where strategy meets craft',
    },
    features: {
      highlight: 'Great design',
      rest: 'drives perception, trust, and growth.',
      items: [
        {
          icon: 'users',
          title: 'User Centered Approach',
          text: 'We design every experience around user needs, ensuring simplicity, usability, and meaningful interactions.',
        },
        {
          icon: 'pen',
          title: 'Design System',
          text: 'We build consistent, scalable design systems for seamless user experiences.',
        },
        {
          icon: 'enter',
          title: 'Rapid Prototyping',
          text: 'We turn ideas into clickable prototypes quickly, so decisions are made early.',
        },
        {
          icon: 'wrench',
          title: 'Conversion',
          text: 'Interfaces designed to guide users toward the actions that matter.',
        },
        {
          icon: 'layers',
          title: 'Accessibility',
          text: 'Inclusive design that works for everyone, on every device.',
        },
        {
          icon: 'trend',
          title: 'Dev ready handoff',
          text: 'We deliver organized files and specs so development starts smoothly, with nothing lost in translation.',
        },
      ],
    },
    stats: {
      label: 'Results and Impact',
      heading: 'Numbers that define',
      highlight: 'Excellence',
      items: [
        { value: '94%', title: 'User satisfaction score', text: 'Consistently delivering high user satisfaction scores.' },
        { value: '3.4x', title: 'Avg conversion lift', text: 'After UI redesign' },
        { value: '60%', title: 'Reduced Drop-off', text: 'Improved onboarding flows' },
        { value: '2 weeks', title: 'Avg design sprint', text: 'From brief to prototype' },
        { value: '500+', title: 'Products designed', text: 'Since 2023' },
        { value: '12x', title: 'Time on design spend', text: 'Average client return' },
      ],
      performance: {
        title: 'Performance Score',
        trendTitle: 'Monthly Trend',
        items: [
          { label: 'UI Quality', value: 97 },
          { label: 'On time Delivery', value: 97 },
          { label: 'Client Retention', value: 97 },
          { label: 'NPS score', value: 97 },
        ],
      },
    },
  }),

  build('social-media-management', {
    label: 'Social Media Management',
    title: 'Social Media Management',
    description:
      'We manage your social presence end to end, from content planning and publishing to community engagement and reporting, so your brand shows up consistently and grows.',
    slides: [
      { title: 'Content Planning', text: 'Calendars built around your audience' },
      { title: 'Community Growth', text: 'Engage followers and build loyalty' },
      { title: 'Analytics & Reporting', text: 'Clear insights to guide every post' },
    ],
    intro: {
      quote:
        'Great social media is not about posting more, but about showing up consistently with something worth following.',
      text: 'A strong social presence builds trust over time. With a clear voice, a smart content rhythm, and honest engagement, we help brands grow communities that care about what they have to say.',
      tagline: 'Where strategy meets craft',
    },
  }),
]

export const getService = (slug) => services.find((s) => s.slug === slug)

// Footer ke links ke liye
export const serviceList = services.map(({ slug, label }) => ({ slug, label }))