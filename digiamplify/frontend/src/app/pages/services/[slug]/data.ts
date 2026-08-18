export interface ServiceData {
  title: string;
  desc: string;
  folder: string;
  quote: string;
  subDesc2: string;
  tagline: string;
  header3: {
    redText: string;
    whiteText: string;
  };
  slides: {
    imageName: string;
    subTitle: string;
    subDesc: string;
  }[];
  phases: {
    title: string;
    desc: string;
  }[];
  cards: {
    title: string;
    desc: string;
    iconName: string;
  }[];
  faqs: {
    question: string;
    answer: string;
  }[];
  whyChoose: {
    heading: { white: string; red: string };
    image: string;
    items: {
      title: string;
      desc: string;
    }[];
  };
  resultsImpact: {
    heading: { white: string; red: string };
    metrics: {
      value: string;
      title: string;
      desc: string;
      isWide?: boolean;
    }[];
    performanceScores: {
      label: string;
      percentage: number;
    }[];
    monthlyTrend: number[];
  };
}

export const servicesData: Record<string, ServiceData> = {
  'ui-ux-design': {
    title: 'UI/UX Design',
    desc: 'UI/UX design focuses on creating intuitive, user-friendly, and visually engaging digital experiences. It ensures that every interaction is simple, efficient, and meaningful while aligning user needs with business goals.',
    folder: 'ui_ux',
    quote: 'Great design is not just about how it looks, but how it communicates, connects, and creates lasting impressions.',
    subDesc2: 'UI/UX design plays a vital role in creating seamless digital experiences that are both visually appealing and easy to use. By combining user-centered thinking with thoughtful design principles, it helps businesses improve engagement, build trust, and deliver meaningful interactions across every touchpoint.',
    tagline: 'Where strategy meets craft',
    header3: {
      redText: 'Great design',
      whiteText: 'drives perception, trust, and growth.'
    },
    slides: [
      { imageName: 'hero1.jpg', subTitle: 'UI/UX Designs', subDesc: 'User-focused intuitive interface design' },
      { imageName: 'hero2.jpg', subTitle: 'Interactive Prototypes', subDesc: 'Simplifying design flows & transitions' },
      { imageName: 'hero3.jpg', subTitle: 'Mobile Mockups', subDesc: 'Responsive mobile-first user interfaces' }
    ],
    phases: [
      { title: 'Research & Discovery', desc: 'We deep dive into your target audience, analyze competitors, and map out initial user persona profiles.' },
      { title: 'Wireframing & UX', desc: 'We design the skeletal framework of the interface to optimize user flows, navigation structures, and layouts.' },
      { title: 'UI Design & Prototyping', desc: 'We craft the visual interfaces with cohesive typography, color systems, and create interactive clickable prototypes.' },
      { title: 'Testing & Handover', desc: 'We run usability testing to refine details and deliver developer-ready assets with design tokens.' }
    ],
    cards: [
      { title: 'User Centered Approach', desc: 'We design every experience around user needs, ensuring simplicity, usability, and meaningful interactions.', iconName: 'Users' },
      { title: 'Design System', desc: 'We build consistent, scalable design systems for seamless user experiences.', iconName: 'Palette' },
      { title: 'Rapid Prototyping', desc: 'We create interactive wireframes to validate flows and concepts quickly.', iconName: 'Cpu' },
      { title: 'Conversion Focus', desc: 'We design intuitive paths to purchase to maximize marketing efficiency.', iconName: 'Wrench' },
      { title: 'Accessibility Compliance', desc: 'We implement WCAG standards to ensure design is accessible for everyone.', iconName: 'Layers' },
      { title: 'Dev ready handoff', desc: 'We provide clean documentations, design specs, and style tokens for developers.', iconName: 'BarChart3' }
    ],
    faqs: [
      { question: 'What kind of clients do you work with?', answer: 'We partner with ambitious startups, premium consumer brands, and enterprise teams that need a sharper digital presence and cleaner market story.' },
      { question: 'How does your project process work?', answer: 'Our process is highly collaborative, focusing on strategy, rapid prototyping, and high-fidelity execution to ensure alignment and quality at every step.' },
      { question: 'Do you work with startups and established businesses?', answer: 'Yes, we tailor our approach based on the scale of the company. Startups get agile speed, while enterprise clients get robust scalability.' },
      { question: 'How do you ensure project quality and performance?', answer: 'We employ rigorous QA testing, user feedback sessions, and modern performance checks to guarantee the final UI/UX design is flawless.' },
      { question: 'Do you provide ongoing design support and iterations?', answer: 'Absolutely. We offer flexible post-launch retainers to help refine features, update design libraries, and adapt to changing user behavior.' }
    ],
    whyChoose: {
      heading: { white: 'A strategy led approach that delivers', red: 'real impact' },
      image: 'why_choose_img.jpg',
      items: [
        { title: 'End-to-End Ownership', desc: 'We take full ownership of every project from concept to completion, managing each stage with care, consistency, and attention to detail to ensure a smooth process and successful outcome.' },
        { title: 'Proven Track Record', desc: 'We have a proven track record of delivering successful projects that consistently meet client goals and exceed expectations.' },
        { title: 'Metrics Backed Design', desc: 'We use metrics-backed design to make informed decisions that improve user experience, performance, and measurable results.' }
      ]
    },
    resultsImpact: {
      heading: { white: 'Numbers that define', red: 'Excellence' },
      metrics: [
        { value: '94%', title: 'User satisfaction score', desc: 'Consistently delivering high user satisfaction scores.', isWide: true },
        { value: '3.4x', title: 'Avg conversion lift', desc: 'After UI redesign', isWide: false },
        { value: '60%', title: 'Reduced Drop-off', desc: 'Improved onboarding flows', isWide: false },
        { value: '2 weeks', title: 'Avg design sprint', desc: 'From brief to prototype', isWide: false },
        { value: '500+', title: 'Products designed', desc: 'Since 2023', isWide: false },
        { value: '12x', title: 'Time on design spend', desc: 'Average client return', isWide: true }
      ],
      performanceScores: [
        { label: 'UI Quality', percentage: 97 },
        { label: 'On time Delivery', percentage: 97 },
        { label: 'Client Retention', percentage: 97 },
        { label: 'NPS score', percentage: 100 }
      ],
      monthlyTrend: [25, 45, 35, 60, 50, 75, 95]
    }
  },
  'graphic-design': {
    title: 'Graphic Design',
    desc: 'Graphic Design focuses on creating visual concepts that communicate ideas, inspire, and captivate audiences. We craft cohesive brand identities, stunning marketing collaterals, and layouts.',
    folder: 'graphic_design',
    quote: 'Visual communication is the language of your brand. We make sure it speaks with clarity, impact, and style.',
    subDesc2: 'Graphic design shapes how the world perceives your brand. By blending typography, color theory, and layout composition, we create designs that capture attention and build lasting brand loyalty across all digital and print mediums.',
    tagline: 'Crafting visual stories',
    header3: {
      redText: 'Stunning visuals',
      whiteText: 'capture attention, emotion, and identity.'
    },
    slides: [
      { imageName: 'hero2.jpg', subTitle: 'Brand Identity', subDesc: 'Cohesive and impactful visual identities' },
      { imageName: 'hero3.jpg', subTitle: 'Marketing Assets', subDesc: 'Social templates, flyers & presentations' },
      { imageName: 'hero1.jpg', subTitle: 'Digital Illustration', subDesc: 'Visual concepts & creative brand styling' }
    ],
    phases: [
      { title: 'Creative Brief', desc: 'We align on your brand voice, colors, stylistic preferences, and target platforms to build a moodboard.' },
      { title: 'Concept Drafting', desc: 'We sketch multiple initial concepts and visual layouts, exploring different typography and color palettes.' },
      { title: 'Refinement', desc: 'We iterate on the chosen design, polishing details and vector structures to ensure pixel-perfection.' },
      { title: 'Asset Export', desc: 'We export your custom designs in all required file formats (SVG, PNG, print-ready PDF) and style sheets.' }
    ],
    cards: [
      { title: 'Brand Identity System', desc: 'We establish complete brand styles, ensuring consistency across print and digital media.', iconName: 'Users' },
      { title: 'Visual Assets', desc: 'We design custom illustrations and graphics for marketing campaigns.', iconName: 'Palette' },
      { title: 'Typography Composition', desc: 'We match fonts and layouts to elevate readability and presence.', iconName: 'Cpu' },
      { title: 'Print Design', desc: 'We prepare clean packaging, flyers, and brochures for production.', iconName: 'Wrench' },
      { title: 'Color Harmony', desc: 'We select custom palettes that align with your industry expectations.', iconName: 'Layers' },
      { title: 'Digital Collaterals', desc: 'We build reusable design assets and social media kits for your team.', iconName: 'BarChart3' }
    ],
    faqs: [
      { question: 'What visual design assets do you deliver?', answer: 'We provide brand identity guidelines, marketing banners, social templates, vector assets, and print-ready documentations for your company.' },
      { question: 'Can you refresh our existing brand assets?', answer: 'Yes, we analyze your current branding and modernize the visual elements while maintaining your core identity and message.' },
      { question: 'Do we own the full copyright to designs?', answer: 'Absolutely. Once final payments are cleared, all visual copyrights and raw project vector files are transferred to you.' },
      { question: 'What file formats do you deliver designs in?', answer: 'We deliver fully editable source files (Figma, Adobe, SVG) along with optimized export files (PNG, high-res PDF) for ease.' },
      { question: 'How many rounds of review do we get?', answer: 'We include three revision cycles in our default pricing to ensure the final visual outputs align perfectly with expectations.' }
    ],
    whyChoose: {
      heading: { white: 'A creative vision that delivers', red: 'brand clarity' },
      image: 'why_choose_img.jpg',
      items: [
        { title: 'Pixel Perfect Execution', desc: 'We obsess over every detail from color balance to typographic spacing, ensuring every visual asset is polished, precise, and production ready.' },
        { title: 'Brand Consistency', desc: 'We build cohesive design systems that maintain visual consistency across every platform, touchpoint, and marketing channel.' },
        { title: 'Creative Versatility', desc: 'We deliver across formats from digital banners to print packaging, adapting styles while keeping your brand identity intact.' }
      ]
    },
    resultsImpact: {
      heading: { white: 'Numbers that define', red: 'Visual Impact' },
      metrics: [
        { value: '98%', title: 'Brand alignment score', desc: 'Across custom designs.', isWide: true },
        { value: '2.5x', title: 'Social engagement lift', desc: 'With premium graphics', isWide: false },
        { value: '40%', title: 'Faster design approval', desc: 'Streamlined brand guide', isWide: false },
        { value: '3 days', title: 'Avg banner turnaround', desc: 'From concept to finish', isWide: false },
        { value: '800+', title: 'Graphics delivered', desc: 'Since 2023', isWide: false },
        { value: '10x', title: 'Visual impact score', desc: 'Compared to standard templates', isWide: true }
      ],
      performanceScores: [
        { label: 'Graphic Quality', percentage: 95 },
        { label: 'Asset Consistency', percentage: 92 },
        { label: 'Creative Variety', percentage: 90 },
        { label: 'Deliverables Speed', percentage: 94 }
      ],
      monthlyTrend: [30, 50, 45, 70, 60, 80, 90]
    }
  },
  'b2b-marketing': {
    title: 'B2B Marketing',
    desc: 'B2B marketing focuses on building strategic funnels, lead generation, and outbound marketing strategies designed to drive sales pipelines and enterprise growth.',
    folder: 'b2b_marketing',
    quote: 'Marketing is not about finding customers. It is about creating value that makes customers find you.',
    subDesc2: 'B2B marketing requires a deep understanding of corporate buyers and complex decision-making processes. We design marketing funnels and generation strategies that target high-intent prospects and transform leads into long-term enterprise partnerships.',
    tagline: 'Driving predictable growth',
    header3: {
      redText: 'Targeted campaigns',
      whiteText: 'generate pipeline, velocity, and revenue.'
    },
    slides: [
      { imageName: 'hero1.jpg', subTitle: 'Sales Funnels', subDesc: 'High-conversion pipeline & lead generation' },
      { imageName: 'hero2.jpg', subTitle: 'Outbound Strategy', subDesc: 'Cold outreach automation & email setup' },
      { imageName: 'hero3.jpg', subTitle: 'Enterprise Growth', subDesc: 'Account-based marketing & analytics' }
    ],
    phases: [
      { title: 'Audience Profiling', desc: 'We identify your ideal customer profiles (ICP), map decision-maker personas, and locate high-intent segments.' },
      { title: 'Funnel Setup', desc: 'We design lead capture pages, draft cold email sequences, and set up tracking pixels across your channels.' },
      { title: 'Campaign Launch', desc: 'We initiate targeted outbound sequences and run account-based marketing campaigns across platforms.' },
      { title: 'Pipeline Scaling', desc: 'We monitor booking rates, optimize messaging copy, and scale qualified meetings for your sales team.' }
    ],
    cards: [
      { title: 'Account Based Strategy', desc: 'We align marketing and sales efforts to secure high-value enterprise accounts.', iconName: 'Users' },
      { title: 'Lead Generation', desc: 'We run multi-channel outbound outreach to capture qualified sales leads.', iconName: 'Palette' },
      { title: 'Content Marketing', desc: 'We draft insightful case studies and reports to build authority.', iconName: 'Cpu' },
      { title: 'Email Automation', desc: 'We build automated cold sequences that trigger responses and calls.', iconName: 'Wrench' },
      { title: 'Analytics Tracking', desc: 'We install full funnel data analytics to measure your ROI.', iconName: 'Layers' },
      { title: 'Sales Enablement', desc: 'We produce presentation decks and leave-behind assets to close deals faster.', iconName: 'BarChart3' }
    ],
    faqs: [
      { question: 'How do you generate high-quality B2B leads?', answer: 'We combine outbound email targeting, landing page optimizations, and detailed customer segment mapping to capture warm buyer interest.' },
      { question: 'What channels do you focus campaigns on?', answer: 'We target professional networking platforms like LinkedIn, run high-value direct cold emails, and optimize content for search engines.' },
      { question: 'Do you integrate campaigns with our CRM?', answer: 'Yes, we synchronize all campaign results and leads directly with Salesforce, HubSpot, or any custom tool you use.' },
      { question: 'How long until we see lead responses?', answer: 'Most outbound cold sequences begin booking meetings within two to three weeks of launch once campaigns are fully warmed.' },
      { question: 'Do you write the outreach content yourself?', answer: 'Yes, our team handles copywriting for your cold emails, landing pages, and lead magnets to ensure high conversion rates.' }
    ],
    whyChoose: {
      heading: { white: 'A data driven system that delivers', red: 'qualified pipeline' },
      image: 'why_choose_img.jpg',
      items: [
        { title: 'Full Funnel Ownership', desc: 'We manage every stage of the marketing funnel from initial awareness campaigns to lead qualification, nurturing sequences, and sales handoff.' },
        { title: 'Revenue Focused Strategy', desc: 'We align marketing activity directly with revenue targets, ensuring campaigns contribute to pipeline growth and measurable business outcomes.' },
        { title: 'Scalable Outbound Systems', desc: 'We build repeatable outreach frameworks that can scale with your team, targeting more segments without sacrificing personalization or quality.' }
      ]
    },
    resultsImpact: {
      heading: { white: 'Numbers that define', red: 'Outreach' },
      metrics: [
        { value: '88%', title: 'Email response rate', desc: 'Consistently high audience engagement.', isWide: true },
        { value: '4.0x', title: 'Lead volume increase', desc: 'After campaign launch', isWide: false },
        { value: '50%', title: 'Lower acquisition cost', desc: 'Targeted search campaigns', isWide: false },
        { value: '4 weeks', title: 'Funnel setup time', desc: 'Strategy to active lead generation', isWide: false },
        { value: '250+', title: 'Qualified leads', desc: 'Delivered since 2023', isWide: false },
        { value: '15x', title: 'Pipeline velocity', desc: 'Speeding up deal closures', isWide: true }
      ],
      performanceScores: [
        { label: 'Lead Quality', percentage: 92 },
        { label: 'Funnel Conversion', percentage: 89 },
        { label: 'Targeting Accuracy', percentage: 91 },
        { label: 'Campaign ROI', percentage: 95 }
      ],
      monthlyTrend: [20, 35, 45, 65, 55, 85, 95]
    }
  },
  'ads': {
    title: 'Google / Meta ADs',
    desc: 'Google & Meta Ads maximize ROI with highly optimized paid advertising campaigns. We build, manage, and scale ads on search and social platforms to target your exact buyer personas.',
    folder: 'googe_meta_ads',
    quote: 'Every click is a potential customer. We optimize your campaigns to ensure no opportunity is wasted.',
    subDesc2: 'Paid advertising is one of the fastest ways to scale your customer base. Our data-driven approach ensures your Meta and Google ad budgets are directed toward high-value audiences, maximizing conversion rates and keeping acquisition costs low.',
    tagline: 'Amplifying conversion value',
    header3: {
      redText: 'Optimized budgets',
      whiteText: 'maximize returns, traffic, and sales.'
    },
    slides: [
      { imageName: 'hero2.jpg', subTitle: 'Paid Campaigns', subDesc: 'Highly targeted advertising & ROI scaling' },
      { imageName: 'hero3.jpg', subTitle: 'A/B Ad Testing', subDesc: 'Optimizing creative assets & audience targeting' },
      { imageName: 'hero1.jpg', subTitle: 'Search Optimization', subDesc: 'Keyword bidding & intent-based ads' }
    ],
    phases: [
      { title: 'Account Audit', desc: 'We analyze previous campaign data, competitor positioning, and install accurate conversion tracking.' },
      { title: 'Ad Creation', desc: 'We write compelling copy and design high-performing image/video ad creatives optimized for conversion.' },
      { title: 'Bid Optimization', desc: 'We launch campaigns, manage custom budgets, and perform continuous A/B testing on audiences and copy.' },
      { title: 'Scaling ROI', desc: 'We scale budget on winning campaigns and implement retargeting strategies to maximize customer value.' }
    ],
    cards: [
      { title: 'Conversion Rate Focus', desc: 'We design dedicated landing pages to convert paid traffic into active buyers.', iconName: 'Users' },
      { title: 'Ad Copywriting', desc: 'We write compelling, high-converting ad copy for search and social.', iconName: 'Palette' },
      { title: 'A/B Creative Testing', desc: 'We test multiple banner layouts to discover lowest acquisition costs.', iconName: 'Cpu' },
      { title: 'Targeting Precision', desc: 'We define custom lookalike audiences to reach your ideal buyers.', iconName: 'Wrench' },
      { title: 'Bid Optimization', desc: 'We adjust bidding strategies daily to ensure maximum traffic efficiency.', iconName: 'Layers' },
      { title: 'Retargeting Systems', desc: 'We set up dynamic retargeting to win back warm website visitors.', iconName: 'BarChart3' }
    ],
    faqs: [
      { question: 'What budget size do you recommend starting?', answer: 'We recommend starting with a minimum monthly ad spend of one thousand dollars to gather sufficient target testing data.' },
      { question: 'How do you track campaign conversion values?', answer: 'We install Meta Pixel, Google Tag Manager, and custom conversions to track sales, signups, and customer actions accurately.' },
      { question: 'Do you create the ad creative assets?', answer: 'Yes, we design custom image banners and write high-converting copy specifically tailored for search and social placements.' },
      { question: 'How do you optimize bidding budget spend?', answer: 'We monitor conversions daily, shifting budget from low-performing ads to winning audiences to maximize your total campaign ROI.' },
      { question: 'Can we see live campaign performance reports?', answer: 'Yes, we provide custom real-time dashboards tracking impression counts, ad clicks, conversion rates, and acquisition costs clearly.' }
    ],
    whyChoose: {
      heading: { white: 'A performance approach that delivers', red: 'maximum ROI' },
      image: 'why_choose_img.jpg',
      items: [
        { title: 'Budget Efficiency', desc: 'We analyze every dollar of your ad spend, reallocating budgets from underperforming placements to high-converting audiences for maximum returns.' },
        { title: 'Data Driven Decisions', desc: 'We make every optimization backed by real conversion data, click analytics, and audience behavior insights rather than guesswork.' },
        { title: 'Transparent Reporting', desc: 'We provide real-time dashboards with full visibility into impressions, cost per acquisition, and campaign performance at all times.' }
      ]
    },
    resultsImpact: {
      heading: { white: 'Numbers that define', red: 'ROI' },
      metrics: [
        { value: '92%', title: 'ROAS improvement', desc: 'Exceeding monthly advertising targets.', isWide: true },
        { value: '5.2x', title: 'Return on ad spend', desc: 'Average across campaigns', isWide: false },
        { value: '45%', title: 'Reduced cost per click', desc: 'Optimized ad bids', isWide: false },
        { value: '48 hours', title: 'A/B test duration', desc: 'To identify winning copy', isWide: false },
        { value: '1.5M', title: 'Monthly ad impressions', desc: 'Reaching key buyers', isWide: false },
        { value: '20x', title: 'Ad conversion rate', desc: 'Driving predictable sales', isWide: true }
      ],
      performanceScores: [
        { label: 'Ad CTR', percentage: 88 },
        { label: 'Cost Efficiency', percentage: 93 },
        { label: 'Audience Match', percentage: 91 },
        { label: 'Campaign Scaling', percentage: 96 }
      ],
      monthlyTrend: [40, 60, 50, 75, 65, 85, 97]
    }
  },
  'social-media': {
    title: 'Social Media Managing',
    desc: 'Social Media Managing enhances your brand visibility and engagement. We manage social media presence, curate high-quality content, and grow communities across platforms.',
    folder: 'social_media_managing',
    quote: 'Social media is not a broadcast channel. It is a conversation that builds community and trust.',
    subDesc2: 'Managing a social presence is about consistency, voice, and value. We handle content curation, copywriting, and graphics planning to keep your audiences engaged, ensuring your brand stays top-of-mind across LinkedIn, Instagram, and beyond.',
    tagline: 'Growing digital communities',
    header3: {
      redText: 'Active presence',
      whiteText: 'builds relationship, loyalty, and brand.'
    },
    slides: [
      { imageName: 'hero3.jpg', subTitle: 'Social Management', subDesc: 'Brand growth & social community curation' },
      { imageName: 'hero1.jpg', subTitle: 'Content Curation', subDesc: 'Custom graphics, reels planning & copies' },
      { imageName: 'hero2.jpg', subTitle: 'Platform Strategy', subDesc: 'Platform-specific scheduling & performance analytics' }
    ],
    phases: [
      { title: 'Brand Voice Alignment', desc: 'We evaluate your current presence, define content pillars, and plan a custom aesthetic theme.' },
      { title: 'Content Calendar', desc: 'We curate, write, and design a month\'s worth of posts, including custom graphics and reels scripts.' },
      { title: 'Scheduling & Engagement', desc: 'We schedule posts at peak times, monitor comments, and engage with industry accounts to grow community.' },
      { title: 'Performance Reporting', desc: 'We analyze reach and engagement metrics to refine content strategy and increase organic growth.' }
    ],
    cards: [
      { title: 'Content Pillars Curation', desc: 'We establish clear brand topics, ensuring diverse, engaging, and high-value posts.', iconName: 'Users' },
      { title: 'Visual Styling', desc: 'We create cohesive, custom templates to highlight your feed style.', iconName: 'Palette' },
      { title: 'Copywriting & Voice', desc: 'We draft engaging captions that encourage discussion and community comments.', iconName: 'Cpu' },
      { title: 'Scheduling Routine', desc: 'We post content at peak audience hours to maximize reach.', iconName: 'Wrench' },
      { title: 'Community Growth', desc: 'We interact with relevant industry accounts to boost organic visibility.', iconName: 'Layers' },
      { title: 'Analytical Insights', desc: 'We track impressions, clicks, and follower growth to refine weekly strategies.', iconName: 'BarChart3' }
    ],
    faqs: [
      { question: 'Which platforms do you manage for brands?', answer: 'We manage major platforms including LinkedIn, Instagram, Facebook, and Twitter, tailoring content specifically to match each platform audience.' },
      { question: 'How often do you post content weekly?', answer: 'We post three to five times per week per platform, depending on the custom strategy selected for your brand.' },
      { question: 'Do we approve content before it publishes?', answer: 'Yes, we organize the monthly posts into a review calendar, and nothing goes live without your team\'s prior approval.' },
      { question: 'Do you respond to comments and messages?', answer: 'Yes, we monitor comments and direct messages during business hours, engaging with followers to build a warm community presence.' },
      { question: 'How do you measure organic social growth?', answer: 'We track reach statistics, profile clicks, follower count changes, and click-through metrics to gauge your organic audience progress.' }
    ],
    whyChoose: {
      heading: { white: 'A content system that delivers', red: 'organic growth' },
      image: 'why_choose_img.jpg',
      items: [
        { title: 'Consistent Brand Voice', desc: 'We maintain a unified tone and visual identity across every platform, ensuring your audience recognizes and trusts your brand instantly.' },
        { title: 'Engagement Focused Content', desc: 'We craft posts designed to spark conversations, encourage shares, and build lasting relationships with your target community.' },
        { title: 'Growth Analytics', desc: 'We track every metric that matters from follower growth rates to engagement ratios, refining strategy based on real performance data.' }
      ]
    },
    resultsImpact: {
      heading: { white: 'Numbers that define', red: 'Presence' },
      metrics: [
        { value: '85%', title: 'Organic reach growth', desc: 'Consistent follower growth rates.', isWide: true },
        { value: '3.5x', title: 'Community engagement', desc: 'Comments, likes and shares', isWide: false },
        { value: '55%', title: 'Inbound query increase', desc: 'Through social messages', isWide: false },
        { value: '5 days', title: 'Content plan cycle', desc: 'From ideas to scheduled posts', isWide: false },
        { value: '300+', title: 'Posts published', desc: 'Across major channels', isWide: false },
        { value: '8x', title: 'Brand visibility', desc: 'Within target industry circles', isWide: true }
      ],
      performanceScores: [
        { label: 'Post Quality', percentage: 92 },
        { label: 'Follower Growth', percentage: 90 },
        { label: 'Comment Activity', percentage: 88 },
        { label: 'Publish Frequency', percentage: 95 }
      ],
      monthlyTrend: [30, 45, 40, 65, 55, 80, 92]
    }
  },
  'ai-automation': {
    title: 'AI Automation',
    desc: 'AI Automation leverages the power of Artificial Intelligence to automate repetitive workflows, deploy intelligent chatbots, and integrate AI systems into your daily business operations.',
    folder: 'ai_automation',
    quote: 'Automation is not about replacing human creativity. It is about giving humans the time to create.',
    subDesc2: 'AI integrations transform how businesses operate by eliminating repetitive daily workflows and speeding up processing times. From intelligent support chatbots to automated sales notifications, we build systems that make your business run smoothly 24/7.',
    tagline: 'Automating the future today',
    header3: {
      redText: 'Intelligent workflows',
      whiteText: 'save time, errors, and cost.'
    },
    slides: [
      { imageName: 'hero1.jpg', subTitle: 'Workflow Automation', subDesc: 'AI integrations & business task automation' },
      { imageName: 'hero3.jpg', subTitle: 'AI Chatbots', subDesc: '24/7 automated customer support agents' },
      { imageName: 'hero2.jpg', subTitle: 'CRM Integrations', subDesc: 'Automating leads handling & notifications' }
    ],
    phases: [
      { title: 'Workflow Audit', desc: 'We map out your current business processes to identify manual bottlenecks that can be automated.' },
      { title: 'System Integration', desc: 'We design API connections and configure workflows between your CRM, email, and communication tools.' },
      { title: 'Agent Deployment', desc: 'We build custom AI chatbots and automate processing triggers for your customer support and sales teams.' },
      { title: 'Testing & Monitoring', desc: 'We run thorough error testing, fine-tune AI prompts, and monitor system runs for maximum reliability.' }
    ],
    cards: [
      { title: 'Custom AI Integrations', desc: 'We connect state-of-the-art LLMs to automate core operational tasks.', iconName: 'Users' },
      { title: 'Workflow Triggers', desc: 'We map automation loops to run your business tasks silently.', iconName: 'Palette' },
      { title: 'Support Chatbots', desc: 'We build custom agents to resolve customer queries around clock.', iconName: 'Cpu' },
      { title: 'Data Syncing', desc: 'We sync lead information across databases and CRMs instantly.', iconName: 'Wrench' },
      { title: 'Lead Routing', desc: 'We automate email qualification and notifications to your sales reps.', iconName: 'Layers' },
      { title: 'Legacy Modernization', desc: 'We replace slow manual entry tasks with fast, reliable software pipelines.', iconName: 'BarChart3' }
    ],
    faqs: [
      { question: 'What business workflows can you automate?', answer: 'We automate lead parsing, data entry, email routing, customer notifications, and sync contacts between your CRM and external platforms.' },
      { question: 'Do you use pre-built API integration tools?', answer: 'We leverage robust platforms like Make and Zapier, or write custom Node/Python scripts for complex proprietary systems as needed.' },
      { question: 'Are automated customer chatbots secure?', answer: 'Yes, we set clear operational boundaries for LLM responses and implement data encryption protocols to keep customer info safe.' },
      { question: 'How long does integration setup usually take?', answer: 'Simple integrations take about one to two weeks, while complex enterprise system automation takes four to six weeks.' },
      { question: 'What happens if an automation step breaks?', answer: 'We configure active error triggers that notify our support team instantly, ensuring any issues are resolved before impacting operations.' }
    ],
    whyChoose: {
      heading: { white: 'An intelligent system that delivers', red: 'operational speed' },
      image: 'why_choose_img.jpg',
      items: [
        { title: 'Zero Manual Bottlenecks', desc: 'We identify and eliminate repetitive manual tasks across your operations, freeing your team to focus on strategy and creative work.' },
        { title: 'Always On Reliability', desc: 'We build automated systems that run around the clock without interruption, ensuring your business processes never stop or slow down.' },
        { title: 'Secure Integrations', desc: 'We implement enterprise-grade encryption and access controls on every automation pipeline to protect your sensitive business data.' }
      ]
    },
    resultsImpact: {
      heading: { white: 'Numbers that define', red: 'Efficiency' },
      metrics: [
        { value: '99%', title: 'Automation uptime', desc: 'Consistently running workflows.', isWide: true },
        { value: '8.5x', title: 'Task speed scaling', desc: 'Compared to human operators', isWide: false },
        { value: '75%', title: 'Reduced entry error', desc: 'Validated automated entry', isWide: false },
        { value: '5 days', title: 'Avg workflow deploy', desc: 'Simple system integration', isWide: false },
        { value: '150+', title: 'Active integrations', desc: 'Connecting operations', isWide: false },
        { value: '30x', title: 'Processing efficiency', desc: 'Accelerating data loops', isWide: true }
      ],
      performanceScores: [
        { label: 'System Stability', percentage: 98 },
        { label: 'Integration Speed', percentage: 94 },
        { label: 'Error Mitigation', percentage: 93 },
        { label: 'Uptime Percentage', percentage: 99 }
      ],
      monthlyTrend: [25, 50, 45, 75, 65, 85, 98]
    }
  },
  'video-editing': {
    title: 'Video Editing',
    desc: 'Video Editing delivers high-impact video production and post-production services. We edit promotional videos, social media reels/shorts, and corporate explainers that capture attention.',
    folder: 'video_editing',
    quote: 'A great video is a story well told, where every frame and cut serves to capture and retain attention.',
    subDesc2: 'Video has become the most consumed and effective content format online. We turn raw footage into high-impact visual stories, integrating animations, transitions, color grading, and sound design to optimize viewer retention and drive engagement.',
    tagline: 'Bringing stories to life',
    header3: {
      redText: 'Professional editing',
      whiteText: 'drives retention, engagement, and views.'
    },
    slides: [
      { imageName: 'hero2.jpg', subTitle: 'Video Production', subDesc: 'Engaging storytelling & high-quality post-production' },
      { imageName: 'hero1.jpg', subTitle: 'Dynamic Reels', subDesc: 'Short-form content optimized for virality' },
      { imageName: 'hero3.jpg', subTitle: 'Sound & Grading', subDesc: 'Advanced sound effects, transitions & color correction' }
    ],
    phases: [
      { title: 'Asset Collection', desc: 'We review your raw video clips, read scripts/storyboards, and organize project file libraries.' },
      { title: 'Rough Cut', desc: 'We edit the main narrative structure, selecting the best takes, and aligning clips to the audio track.' },
      { title: 'FX & Color Grading', desc: 'We add custom text overlays, transitions, sound design, color correction, and dynamic zooms.' },
      { title: 'Final Render', desc: 'We export polished videos in optimized formats and dimensions ready for YouTube, reels, or ads.' }
    ],
    cards: [
      { title: 'Storytelling & Pacing', desc: 'We structure raw footage into clear, engaging stories that hold viewer interest.', iconName: 'Users' },
      { title: 'Color Grading', desc: 'We apply custom LUTs and corrections for a premium look.', iconName: 'Palette' },
      { title: 'Sound Design', desc: 'We integrate background tracks, sound effects, and level voice tracks.', iconName: 'Cpu' },
      { title: 'Dynamic Text', desc: 'We add custom motion graphic titles and subtitles to clarify.', iconName: 'Wrench' },
      { title: 'Platform Formats', desc: 'We deliver in vertical 9:16 and horizontal 16:9 aspect ratios.', iconName: 'Layers' },
      { title: 'Motion Graphics', desc: 'We design custom logo intros and call-to-action cards for endings.', iconName: 'BarChart3' }
    ],
    faqs: [
      { question: 'What raw footage files do you support?', answer: 'We support all standard formats (MP4, MOV, ProRes) and handle clips captured on professional cameras or mobile phones.' },
      { question: 'Do you provide stock clips and audio?', answer: 'We license high-quality background music, sound effects, and stock overlays to elevate the production value of videos.' },
      { question: 'What is the average project turnaround time?', answer: 'Short-form videos take two to three business days, while longer corporate presentations take five to seven days to complete.' },
      { question: 'Do you write scripts or edit storyboards?', answer: 'We can review your scripts and suggest edits to improve engagement, hooks, and retention before editing begins.' },
      { question: 'Can you edit vertical videos for TikTok?', answer: 'Yes, we format and edit vertical videos optimized for TikTok, Reels, and Shorts, complete with dynamic subtitles.' }
    ],
    whyChoose: {
      heading: { white: 'A production process that delivers', red: 'viewer retention' },
      image: 'why_choose_img.jpg',
      items: [
        { title: 'Cinematic Quality', desc: 'We apply professional color grading, sound mixing, and transition design to transform raw clips into polished, broadcast-quality content.' },
        { title: 'Fast Turnaround', desc: 'We deliver short-form content within days and long-form projects within a week, keeping your publishing schedule on track.' },
        { title: 'Platform Optimized', desc: 'We export every video in the exact dimensions, codecs, and aspect ratios optimized for YouTube, TikTok, Reels, and ad placements.' }
      ]
    },
    resultsImpact: {
      heading: { white: 'Numbers that define', red: 'Retention' },
      metrics: [
        { value: '90%', title: 'Video retention score', desc: 'Keeping viewers engaged to the end.', isWide: true },
        { value: '4.2x', title: 'Watch time increase', desc: 'On short and long-form video', isWide: false },
        { value: '65%', title: 'Higher viral potential', desc: 'Dynamic hooks and cuts', isWide: false },
        { value: '48 hours', title: 'Reel delivery time', desc: 'Quick vertical edits', isWide: false },
        { value: '500+', title: 'Videos produced', desc: 'For YouTube and Socials', isWide: false },
        { value: '12x', title: 'Audience growth lift', desc: 'Leveraging video content', isWide: true }
      ],
      performanceScores: [
        { label: 'Visual Quality', percentage: 94 },
        { label: 'Pacing & Story', percentage: 91 },
        { label: 'Sound Curation', percentage: 89 },
        { label: 'Viewers Retention', percentage: 96 }
      ],
      monthlyTrend: [35, 55, 45, 70, 60, 85, 95]
    }
  }
};
