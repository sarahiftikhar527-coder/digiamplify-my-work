import React from 'react';
import Image from 'next/image';
import Title from '@/components/ui/Title';
import Button from '@/components/ui/Button';
import Newsletter from '@/components/ui/Newsletter';
import ContactForm from '@/components/ContactForm/ContactForm';

import { ArrowRight, Check, Share2, RotateCw, Settings, Rocket, Star, CheckCircle, Play, ArrowLeft, Plus, Minus } from 'lucide-react';

const heroStats = [
    { label: "Reach", value: "10K+", image: "/assets/reach-chart.png" },
    { label: "Projects", value: "500+", image: "/assets/projects-chart.png" },
    { label: "Clients", value: "120+", image: "/assets/clients-chart.png" },
    { label: "Satisfaction", value: "99%", image: "/assets/satisfaction-chart.png" },
];

const galleryImages = [
    { src: "/assets/home-gallery-pc.jpg", alt: "PC Hardware", span: "md:col-span-5" },
    { src: "/assets/home-gallery-abstract.jpg", alt: "Red Abstract Light", span: "md:col-span-4" },
    { src: "/assets/home-gallery-code.jpg", alt: "Code Editor", span: "md:col-span-3" },
    { src: "/assets/home-gallery-maze.jpg", alt: "Red Maze Pattern", span: "md:col-span-3" },
    { src: "/assets/home-gallery-keyboard.jpg", alt: "Custom Keyboard", span: "md:col-span-4" },
    { src: "/assets/home-gallery-dark.jpg", alt: "Dark Aesthetic", span: "md:col-span-5" },
];

const expertiseList = [
    "Tailored business solutions.",
    "Higher ranking results",
    "Continuous reliable support",
    "Intelligent workflow systems",
    "Reliable, optimized data",
    "Strong data protection",
    "Expert digital guidance"
];

const serviceCards = [
    {
        title: "Social Media Management",
        desc: "Crafting engaging content strategies, managing community growth, and executing data-driven campaigns to elevate brand presence across all social platforms.",
        span: "md:col-span-7"
    },
    {
        title: "Video Editing",
        desc: "Producing high-impact video content with seamless transitions, sound design, and color grading that turns raw footage into captivating brand narratives.",
        span: "md:col-span-5"
    },
    {
        title: "AI Automation",
        desc: "Integrating smart workflows, custom chatbots, and automated pipelines to optimize business processes, reduce overhead, and boost operational efficiency.",
        span: "md:col-span-5"
    },
    {
        title: "UI/UX & Graphic Designing",
        desc: "Conducting user research, wireframing, and crafting high-fidelity interface designs that combine visual aesthetics with intuitive digital usability.",
        span: "md:col-span-7"
    },
    {
        title: "Google / Meta Ads",
        desc: "Building targeted paid ad campaigns across Google and Meta platforms to maximize ROI, drive qualified traffic, and scale customer acquisition.",
        span: "md:col-span-7"
    },
    {
        title: "B2B, B2C Marketing",
        desc: "Developing comprehensive marketing strategies tailored for business and consumer audiences to foster brand loyalty, leads, and sustainable revenue.",
        span: "md:col-span-5"
    }
];

const metricsData = [
    {
        icon: Share2,
        title: "Qualified pipelines",
        value: "+214%",
        desc: "Accelerating inbound revenue opportunities through targeted outbound strategies and high-converting funnel optimizations."
    },
    {
        icon: RotateCw,
        title: "Retention Lift",
        value: "+37%",
        desc: "Improving customer lifetime value by optimizing user onboarding experiences and building engaging product feature flows."
    },
    {
        icon: Settings,
        title: "Lead Quality",
        value: "+62%",
        desc: "Filtering prospect traffic to deliver highly intent-driven leads directly to your sales development pipeline."
    },
    {
        icon: Rocket,
        title: "Launch velocity",
        value: "2.8x",
        desc: "Streamlining product development cycles to ship scalable digital products faster without sacrificing overall quality."
    }
];

// Helper Function to draw the 5 vertical bars 
const MiniBarChart = () => (
    <div className="flex items-end gap-1.5 h-14 mb-5">
        <div className="w-2.5 h-4 bg-[#2f2d2d] rounded-sm"></div>
        <div className="w-2.5 h-6 bg-[#474545] rounded-sm"></div>
        <div className="w-2.5 h-8 bg-[#606060] rounded-sm"></div>
        <div className="w-2.5 h-11 bg-[#be0919]/30 rounded-sm"></div>
        <div className="w-2.5 h-14 bg-[#be0919] rounded-sm shadow-[0_0_10px_rgba(190,9,25,0.5)]"></div>
    </div>
);

const workflowSteps = [
    {
        num: "01",
        title: "Discovery",
        desc: "We align closely with your stakeholders to uncover core business goals and ensure strategic clarity."
    },
    {
        num: "02",
        title: "Research",
        desc: "We analyze market dynamics and competitor landscapes to pinpoint unique opportunities for growth."
    },
    {
        num: "03",
        title: "Strategy",
        desc: "We architect a comprehensive roadmap bridging creative vision with technical execution for success."
    },
    {
        num: "04",
        title: "Design",
        desc: "We craft intuitive, aesthetic interfaces that elevate user experiences and align with your brand."
    },
    {
        num: "05",
        title: "Development",
        desc: "We engineer scalable, high-performance architectures to ensure robust and secure digital platforms."
    },
    {
        num: "06",
        title: "Launch",
        desc: "We execute seamless deployments with rigorous quality assurance to guarantee a flawless market entry."
    },
    {
        num: "07",
        title: "Optimization",
        desc: "We leverage user analytics to continuously refine performance and maximize your return on investment."
    }
];

const launchSlateData = [
    {
        title: "Cocobeanz",
        desc: "Projects are presented like flagship product launches, showcasing websites and applications built with design, functionality, and impact.",
        metric: "+99%"
    },
    {
        title: "Euro Installation",
        desc: "Projects are presented like flagship product launches, showcasing websites and applications built with design, functionality, and impact.",
        metric: "+99%"
    },
    {
        title: "Enable",
        desc: "Projects are presented like flagship product launches, showcasing websites and applications built with design, functionality, and impact.",
        metric: "+99%"
    }
];

const faqData = [
    {
        question: "What kind of clients do you work with?",
        answer: "We partner with ambitious startups, premium consumer brands, and enterprise teams that need a sharper digital presence and cleaner market story.",
        isOpen: true
    },
    {
        question: "How does your project process work?",
        answer: "Our process is highly collaborative, focusing on strategy, rapid prototyping, and high-fidelity execution to ensure alignment and quality at every step.",
        isOpen: false
    },
    {
        question: "Do you work with startups and established businesses?",
        answer: "Yes, we tailor our approach based on the scale of the company. Startups get agile speed, while enterprise clients get robust scalability and structured governance.",
        isOpen: false
    },
    {
        question: "How do you ensure project quality and performance?",
        answer: "We employ rigorous QA testing, performance audits, and modern deployment pipelines to guarantee that the final product is fast, secure, and visually flawless.",
        isOpen: false
    },
    {
        question: "Do you provide ongoing support and maintenance?",
        answer: "Absolutely. We offer dedicated retention retainers to ensure your digital products continue to evolve, scale, and perform post-launch.",
        isOpen: false
    }
];

export default function HomePage() {
    return (
        <div className="w-full min-h-screen bg-[#050505] text-white font-poppins selection:bg-[#be0919] selection:text-white overflow-hidden">

            {/* Hero Section */}

            <section className="w-full relative min-h-screen flex items-center pt-15 pb-20">
                <div className="absolute right-0 top-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-[#be0919]/5 rounded-full blur-[120px] pointer-events-none"></div>
                <div className="max-w-[1350px] mx-auto px-6 lg:px-12 w-full relative z-10">
                    <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">

                        <div className="lg:col-span-7 flex flex-col justify-center">
                            <Title as="h1" className="text-5xl sm:text-6xl lg:text-[57px] font-['Glacial'] font-medium leading-[1.05] tracking-tight mb-8">
                                More Than Development<br />Pure Digital<br />
                                <span className="text-[#be0919] font-normal">Craftsmanship</span>
                            </Title>
                            <p className="text-[#ffffff] text-[16px] leading-[1.8] max-w-[600px] mb-16">
                                Designing and developing intelligent software solutions that combine clean architecture, modern technology, and seamless user experiences to help businesses grow with confidence and scalability.
                            </p>

                            {/* Stats Cards */}
                            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 sm:gap-5 max-w-[720px] mt-12">
                                {heroStats.map((stat, index) => (
                                    <div
                                        key={index}
                                        className="bg-gradient-to-b from-[#2a2a2a] to-[#050505] rounded-2xl px-3 pb-4 shadow-[4px_4px_0px_0px_#be0919] border border-white/5 flex flex-col hover:-translate-y-1 hover:-translate-x-1 hover:shadow-[6px_6px_0px_0px_#be0919] transition-all duration-300 cursor-default"
                                    >
                                        <div className="relative w-full aspect-square rounded-xl overflow-hidden -mt-10 mb-4 shadow-[0_10px_20px_rgba(0,0,0,0.5)] border border-white/5 bg-[#111]">
                                            <Image
                                                src={stat.image}
                                                alt={stat.label}
                                                fill
                                                className="object-cover"
                                            />
                                        </div>

                                        <div className="px-1">
                                            <h4 className="text-white font-bold text-[16px] sm:text-[18px] leading-tight mb-1">
                                                {stat.label}
                                            </h4>
                                            <p className="text-white/50 font-['Glacial'] text-[13px] sm:text-[14px]">
                                                {stat.value}
                                            </p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>

                        <div className="lg:col-span-5 relative h-[500px] lg:h-[650px] flex items-center justify-center">
                            <div className="relative w-[450px] h-[450px] lg:w-[550px] lg:h-[550px] z-10">
                                <Image src="/assets/home-hero-red-gear.png" alt="3D Red Gear" fill className="object-contain" priority />
                            </div>
                            <div className="absolute top-[10%] left-0 w-[150px] h-[150px] z-20 animate-[bounce_4s_infinite_ease-in-out]">
                                <Image src="/assets/home-hero-silver-c.png" alt="Silver Shape" fill className="object-contain" />
                            </div>
                            <div className="absolute bottom-[5%] right-[-5%] w-[120px] h-[120px] z-20 animate-[bounce_5s_infinite_ease-in-out_reverse]">
                                <Image src="/assets/home-hero-cube.png" alt="Silver Cube" fill className="object-contain" />
                            </div>
                        </div>
                    </div>
                    <div className="w-full h-[1px] bg-white/20 mt-10"></div>
                </div>
            </section>


            {/* Mission Section */}
            <section className="w-full py-16 bg-[#050505] text-white overflow-hidden">
                <div className="max-w-[1350px] mx-auto px-6 lg:px-12">

                    <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 mb-5 items-stretch">

                        <div className="lg:col-span-4 flex flex-col justify-center py-4 lg:pr-8">
                            <Title as="h2" className="text-4xl sm:text-5xl lg:text-[52px] font-medium font-['Glacial'] leading-[1.1] tracking-tight">
                                <span className="block">We exist to make</span>
                                <span className="block text-[#be0919]">high growth</span>
                                <span className="block">companies feel</span>
                                <span className="block">inevitable</span>
                            </Title>
                        </div>

                        <div className="lg:col-span-5 bg-transparent border border-white/20 rounded-3xl p-8 lg:p-10 flex flex-col justify-center gap-8">
                            <div>
                                <h3 className="text-[#be0919] text-[19px] font-medium mb-3">
                                    Who are we
                                </h3>
                                <p className="text-[#ffffff] text-[13px] leading-[1.7]">
                                    We are a passionate team of digital marketing and IT professionals committed to transforming ideas into successful digital experiences. Through innovative strategies, cutting-edge technology, and client-focused solutions, we help businesses build a stronger online presence and achieve sustainable growth.
                                </p>
                            </div>

                            <div>
                                <h3 className="text-[#be0919] text-[19px] font-medium mb-3">
                                    Our Mission
                                </h3>
                                <p className="text-[#ffffff] text-[13px] leading-[1.7]">
                                    Our mission is to help businesses grow through creative marketing, advanced technology, and customer-focused solutions that deliver measurable results and long-term success.
                                </p>
                            </div>
                        </div>

                        <div className="lg:col-span-3 relative min-h-[300px] lg:min-h-full rounded-3xl overflow-hidden border border-white/20">
                            <Image
                                src="/assets/home-pc-setup.jpg"
                                alt="Workspace Setup"
                                fill
                                className="object-cover opacity-80"
                            />
                        </div>

                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-12 gap-5 items-stretch">

                        <div className="lg:col-span-2 border border-[#222] rounded-3xl py-6 px-7 lg:py-7 lg:px-8 flex flex-col hover:border-[#be0919]/50 transition-colors">
                            <h3 className="text-[#be0919] text-2xl text-[26px] font-semibold mb-4">
                                12 +
                            </h3>
                            <p className="text-[#ffffff] text-[13px] leading-[1.6]">
                                Yours crafting premium digital system for ambitious founders and enterprise teams.
                            </p>
                        </div>

                        <div className="lg:col-span-2 border border-[#222] rounded-3xl py-6 px-7 lg:py-7 lg:px-8 flex flex-col hover:border-[#be0919]/50 transition-colors">
                            <h3 className="text-[#be0919] text-[26px] font-semibold mb-4">
                                Global
                            </h3>
                            <p className="text-[#ffffff] text-[13px] leading-[1.6]">
                                Distributed creative leadership with global brands perspective and local nuance
                            </p>
                        </div>

                        <div className="lg:col-span-8 border border-[#222] rounded-3xl py-6 px-7 lg:py-7 lg:px-10 hover:border-[#be0919]/50 transition-colors">

                            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 md:gap-12 h-full">

                                <div>
                                    <h3 className="text-[#be0919] text-[20px] font-medium mb-3">
                                        Vision
                                    </h3>
                                    <p className="text-[#ffffff] text-[13px] leading-[1.7]">
                                        To empower businesses worldwide with innovative digital and technology solutions that inspire growth, success, and lasting impact.
                                    </p>
                                </div>

                                <div>
                                    <h3 className="text-[#be0919] text-[20px] font-medium mb-3">
                                        Philosophy
                                    </h3>
                                    <p className="text-[#ffffff] text-[13px] leading-[1.7]">
                                        We believe in innovation, integrity, and creating solutions that deliver real value.Through creativity and technology, we help businesses achieve lasting growth.
                                    </p>
                                </div>

                                <div>
                                    <h3 className="text-[#be0919] text-[20px] font-medium mb-3">
                                        Why we exist
                                    </h3>
                                    <p className="text-[#ffffff] text-[13px] leading-[1.7]">
                                        We exist to help businesses navigate the digital world with confidence, providing innovative solutions that drive growth and success.
                                    </p>
                                </div>

                            </div>
                        </div>

                    </div>

                </div>
            </section>


            {/* Gallery Section */}

            <section className="w-full py-8 bg-[#050505] overflow-hidden">
                <div className="max-w-[1350px] mx-auto px-6 lg:px-12">

                    <div className="mb-14">
                        <Title as="h2" className="text-3xl sm:text-4xl lg:text-[38px] font-medium leading-[1.3] tracking-tight text-white">
                            <span className="block">Enterprise discipline. Boutique taste</span>
                            <span className="block">Category level <span className="text-[#be0919]">output.</span></span>
                        </Title>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-12 gap-4 lg:gap-5">
                        {galleryImages.map((img, index) => (
                            <div
                                key={index}
                                className={`relative w-full h-[250px] lg:h-[200px] rounded-2xl overflow-hidden border border-white/20 group hover:border-[#be0919]/50 transition-colors duration-300 ${img.span}`}
                            >
                                <Image
                                    src={img.src}
                                    alt={img.alt}
                                    fill
                                    className="object-cover opacity-80 group-hover:opacity-100 group-hover:scale-105 transition-all duration-700"
                                />
                            </div>
                        ))}
                    </div>

                </div>
            </section>


            {/* Capabilities Intro Section */}

            <section className="w-full py-7 bg-gradient-to-b from-[#141414] to-[#0a0a0a] border-t border-[#1a1a1a] overflow-hidden">
                <div className="max-w-[1350px] mx-auto px-6 lg:px-12">

                    <div className="flex flex-col lg:flex-row justify-between items-center gap-12 lg:gap-8">

                        <div className="w-full lg:w-2/3">
                            <Title as="h2" className="text-4xl sm:text-5xl lg:text-[42px] font-medium leading-[1.2] tracking-tight text-white mb-6">
                                Capabilities built for <span className="text-[#be0919]">impact</span>.
                            </Title>

                            <p className="text-white text-[17px] sm:text-[16px] leading-[1.8] max-w-[750px]">
                                We combine enterprise-level discipline with a refined creative approach to deliver high-quality digital solutions, ensuring every project is executed with precision, attention to detail, and a strong focus on performance to achieve category-leading results.
                            </p>
                        </div>

                        <div className="w-full lg:w-1/3 flex justify-center lg:justify-end">
                            <div className="relative w-[200px] h-[200px] sm:w-[250px] sm:h-[250px] lg:w-[250px] lg:h-[250px]">
                                <Image
                                    src="/assets/silver-ring.png"
                                    alt="3D Silver Ring"
                                    fill
                                    className="object-contain hover:scale-105 transition-transform duration-700 animate-[spin_30s_linear_infinite] -rotate-[25deg]"
                                />
                            </div>
                        </div>

                    </div>

                </div>
            </section>


            {/* Expertise & Services Section */}

            <section className="w-full pb-10 bg-[#0a0a0a] overflow-hidden">
                <div className="max-w-[1350px] mx-auto px-6 lg:px-12">

                    <div className="bg-[#0c0c0c] rounded-[32px] p-4 sm:p-5 lg:p-6 border border-[#1a1a1a]">

                        <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-stretch">

                            <div className="lg:col-span-4 bg-gradient-to-b from-[#0a0a0a] to-[#1c1c1c] rounded-3xl p-8 lg:p-10 flex flex-col border border-white/20">

                                <h3 className="text-white text-2xl lg:text-[20px] font-semibold leading-[1.3] mb-5 tracking-wide">
                                    <span className="block">End- to-end expertise,</span>
                                    <span className="block">aligned to outcomes</span>
                                </h3>

                                <p className="text-[#ffffff] text-[13px] leading-relaxed mb-10">
                                    From strategy to shipping, we combine design and engineering to deliver measurable business results.
                                </p>

                                <div className="flex flex-col gap-4.5 mb-4">
                                    {expertiseList.map((item, i) => (
                                        <div key={i} className="flex items-center gap-4">
                                            <div className="w-[22px] h-[22px] rounded-full bg-[#be0919] flex items-center justify-center flex-shrink-0">
                                                <Check className="w-3.5 h-3.5 text-black" strokeWidth={3} />
                                            </div>
                                            <span className="text-[#ffffff] text-[14px] font-light tracking-wide">{item}</span>
                                        </div>
                                    ))}
                                </div>

                            </div>

                            <div className="lg:col-span-8">
                                <div className="grid grid-cols-1 md:grid-cols-12 gap-5 h-full">
                                    {serviceCards.map((card, i) => (
                                        <div
                                            key={i}
                                            className={`bg-transparent border border-white/20 rounded-3xl p-7 lg:p-8 flex flex-col justify-between group hover:border-[#be0919]/40 transition-colors duration-500 ${card.span}`}
                                        >
                                            <div>
                                                <h4 className="text-[#be0919] text-[17px] font-medium mb-4 tracking-wide">
                                                    {card.title}
                                                </h4>
                                                <p className="text-[#ffffff] text-[13px] leading-[1.7] mb-8">
                                                    {card.desc}
                                                </p>
                                            </div>

                                            <div>
                                                <button className="px-6 py-2 rounded-full border border-[#be0919] text-[#be0919] text-[13px] font-medium group-hover:bg-[#be0919] group-hover:text-white transition-all duration-300 w-fit">
                                                    Learn More
                                                </button>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>

                        </div>
                    </div>

                </div>
            </section>


            {/* Subtle Divider */}

            <section className="w-full bg-[#050505] py-8 lg:py-2">
                <div className="w-full h-[60px] md:h-[80px] lg:h-[100px] bg-gradient-to-r from-[#222222] to-[#050505] border-y border-[#1a1a1a]"></div>
            </section>


            {/* Numbers & Metrics Section */}

            <section className="w-full py-15 bg-[#050505] overflow-hidden">
                <div className="max-w-[1350px] mx-auto px-6 lg:px-12">

                    <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-8 items-center">

                        <div className="lg:col-span-4 flex flex-col justify-between pr-0 lg:pr-6">

                            <div>
                                <Title as="h2" className="text-3xl sm:text-4xl lg:text-[41px] font-medium leading-[1.2] tracking-tight text-white mb-8">
                                    <span className="block">Numbers Presented</span>
                                    <span className="block">with the same</span>
                                    <span className="block">confidence as the</span>
                                    <span className="block text-[#be0919]">visuals system.</span>
                                </Title>

                                <p className="text-[#ffffff] text-[15px] leading-[1.7] mb-12 max-w-[400px]">
                                    We combine enterprise-level discipline with a refined creative approach to deliver high-quality digital solutions, ensuring every project is executed
                                </p>
                            </div>

                            <div className="bg-[#0a0a0a] border border-white/20 rounded-2xl p-6 w-full">
                                <p className="text-white/60 text-[12px] mb-6">Performance</p>

                                <div className="grid grid-cols-2 gap-6">

                                    <div className="flex flex-col items-center text-center">
                                        <h4 className="text-[#be0919] text-3xl text-[30px] font-semibold mb-3">4.2 X</h4>
                                        <p className="text-[#ffffff] text-[10px] font-medium tracking-wide whitespace-nowrap mb-5">
                                            Average conversation uplift
                                        </p>
                                    </div>

                                    <div className="flex flex-col items-center text-center">
                                        <h4 className="text-[#be0919] text-3xl text-[30px] font-semibold mb-3">91%</h4>
                                        <p className="text-[#ffffff] text-[10px] font-medium tracking-wide">
                                            Repeat engagement rate
                                        </p>
                                    </div>

                                </div>
                            </div>

                        </div>

                        <div className="lg:col-span-8">
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">

                                {metricsData.map((metric, index) => {
                                    const Icon = metric.icon;
                                    return (
                                        <div
                                            key={index}
                                            className="relative bg-[#0a0a0a] border border-white/20 rounded-3xl p-7 lg:px-8 py-4 overflow-hidden group hover:border-[#be0919]/50 transition-colors duration-300"
                                        >
                                            <div className="absolute -top-12 -right-12 w-48 h-48 bg-[#be0919] opacity-[0.08] blur-[50px] rounded-full pointer-events-none group-hover:opacity-[0.15] transition-opacity duration-500"></div>

                                            <div className="flex items-center gap-3 mb-6 relative z-10">
                                                <div className="w-10 h-10 rounded-full border border-[#be0919]/30 flex items-center justify-center bg-[#be0919]/5 text-[#be0919]">
                                                    <Icon size={20} strokeWidth={1.5} />
                                                </div>
                                                <span className="text-[#ffffff] text-[16px] font-regular font-['Glacial']">{metric.title}</span>
                                            </div>

                                            <div className="flex justify-between items-end relative z-10">
                                                <div className="max-w-[180px] xl:max-w-[220px]">
                                                    <h3 className="text-white text-4xl lg:text-[46px] font-medium font-['Glacial'] mb-4">
                                                        {metric.value}
                                                    </h3>
                                                    <p className="text-[#ffffff] text-[14px] leading-[1.7] max-w-[190px]">
                                                        {metric.desc}
                                                    </p>
                                                </div>

                                                <MiniBarChart />
                                            </div>

                                        </div>
                                    );
                                })}

                            </div>
                        </div>

                    </div>
                </div>
            </section>


            {/* Workflow Section */}

            <section className="w-full py-13 bg-gradient-to-r from-[#2a2a2a] to-[#050505] overflow-hidden">
                <div className="max-w-[1350px] mx-auto px-6 lg:px-12">

                    <div className="flex flex-col xl:flex-row justify-between items-start xl:items-end mb-16 gap-8">

                        <div className="max-w-[800px]">
                            <Title as="h2" className="text-3xl sm:text-4xl lg:text-[39px] font-medium leading-[1.2] tracking-tight text-white mb-7">
                                <span className="block"><span className="text-[#be0919]">A luxury workflow</span> with strategic</span>
                                <span className="block">rigor from the first call to post-</span>
                                <span className="block">launch optimization</span>
                            </Title>

                            <p className="text-[#ffffff] text-[17px] leading-[1.7] max-w-[700px]">
                                We combine enterprise-level discipline with a refined creative approach to deliver high-quality digital solutions, ensuring every project is executed with precision, attention to detail, and a strong focus on performance to achieve category-leading results.
                            </p>
                        </div>

                        <div className="flex-shrink-0">
                            <div className="px-6 py-2.5 rounded-full border border-[#ffffff]/50 text-[#ffffff] text-[12px] tracking-wide hover:border-[#be0919]/50 transition-colors cursor-default">
                                7-stage delivery framework
                            </div>
                        </div>

                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 xl:grid-cols-7 gap-4 lg:gap-5 items-stretch">
                        {workflowSteps.map((step, index) => (
                            <div
                                key={index}
                                className="bg-[#0a0a0a] border border-[#ffffff]/20 rounded-2xl flex flex-col group hover:border-[#be0919]/50 transition-colors duration-300"
                            >

                                <div className="py-4 text-center border-b border-[#ffffff]/10 group-hover:border-[#be0919]/20 transition-colors duration-300">
                                    <span className="text-[#be0919] text-[32px] lg:text-[44px] font-light font-['Glacial']">
                                        {step.num}
                                    </span>
                                </div>

                                <div className="p-5 xl:p-6 flex flex-col flex-grow gap-2">

                                    <div className="flex justify-between items-center mb-4">
                                        <h4 className="text-white text-[14px] font-medium tracking-wide">
                                            {step.title}
                                        </h4>
                                        <ArrowRight size={18} className="text-white group-hover:translate-x-1 transition-transform duration-300 flex-shrink-0" />
                                    </div>

                                    <p className="text-[#ffffff] text-[11px] leading-[1.6]">
                                        {step.desc}
                                    </p>

                                </div>

                            </div>
                        ))}
                    </div>

                </div>
            </section>


            {/* Flagship Projects Section */}

            <section className="w-full py-13 bg-black overflow-hidden">
                <div className="max-w-[1350px] mx-auto px-6 lg:px-12">

                    <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center mb-16">

                        <div className="lg:col-span-8 max-w-[800px]">
                            <Title as="h2" className="text-3xl sm:text-4xl lg:text-[39px] font-medium leading-[1.2] tracking-tight text-white mb-6">
                                <span className="block">Project presented like flagship</span>
                                <span className="block">products launches, not <span className="text-[#be0919]">portfolio</span></span>
                                <span className="block">thumbnails,</span>
                            </Title>

                            <p className="text-[#ffffff] text-[18px] leading-[1.7] max-w-[650px]">
                                Projects are presented with the attention, strategy, and storytelling of flagship product launches, transforming each delivery into a compelling showcase of innovation, impact, and measurable business value.
                            </p>
                        </div>

                        <div className="lg:col-span-4 flex justify-center lg:justify-start lg:pl-10">
                            <div className="relative w-[180px] h-[180px] sm:w-[220px] sm:h-[220px] lg:w-[280px] lg:h-[280px]">
                                <Image
                                    src="/assets/home-silver-fan.png"
                                    alt="3D Silver Fan"
                                    fill
                                    className="object-contain drop-shadow-[0_0_20px_rgba(255,255,255,0.05)] transition-transform duration-500 ease-out hover:scale-110"
                                />
                            </div>
                        </div>

                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">

                        <div className="lg:col-span-7 relative w-full min-h-[400px] lg:min-h-[400px] rounded-[32px] overflow-hidden border border-[#ffffff]/30">
                            <Image
                                src="/assets/home-red-setup.png"
                                alt="Flagship Project Showcase"
                                fill
                                className="object-cover"
                            />
                        </div>

                        <div className="lg:col-span-5 flex flex-col gap-4 h-full">

                            <div className="bg-[#080808] border border-[#1a1a1a] rounded-[32px] p-7 lg:p-6 flex-grow">
                                <p className="text-[#ffffff]/50 text-[15px] mb-6 tracking-wide">
                                    Launch Slate
                                </p>

                                <div className="flex flex-col gap-4">
                                    {launchSlateData.map((item, index) => (
                                        <div
                                            key={index}
                                            className="border border-white/20 rounded-2xl p-5 bg-black/40 hover:border-[#be0919]/30 transition-colors duration-300"
                                        >
                                            <h4 className="text-[#ffffff] text-[15px] font-medium mb-2">
                                                {item.title}
                                            </h4>
                                            <div className="flex justify-between items-end gap-4">
                                                <p className="text-[#ffffff] text-[11px] leading-[1.6]">
                                                    {item.desc}
                                                </p>
                                                <span className="text-[#be0919] text-[16px] font-bold font-['Glacial'] tracking-wider flex-shrink-0">
                                                    {item.metric}
                                                </span>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            <div className="bg-[#080808] border border-[#1a1a1a] rounded-[32px] p-7 lg:p-9">
                                <p className="text-[#ffffff]/50 text-[15px] mb-3 tracking-wide">
                                    Horizontal Showcase
                                </p>
                                <p className="text-[#ffffff] text-[15px] leading-[1.7]">
                                    A structured layout designed to present projects in a clean, modern flow that highlights websites and applications with clarity and balance. It delivers a premium experience focused on quality and presentation.
                                </p>
                            </div>

                        </div>

                    </div>

                </div>
            </section>


            {/* Client Review Section */}

            <section className="w-full py-15 bg-gradient-to-r from-[#2a2a2a] to-[#050505] overflow-hidden">
                <div className="max-w-[1350px] mx-auto px-6 lg:px-12">

                    <div className="text-center mb-12">
                        <Title as="h2" className="text-4xl sm:text-5xl lg:text-[40px] font-medium tracking-tight text-white">
                            Our Clients <span className="text-[#be0919]">Review</span>
                        </Title>
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">

                        <div className="lg:col-span-4 min-h-[600px] bg-gradient-to-b from-[#0a0a0a] to-[#262626] border border-[#1f1f1f] rounded-[24px] lg:rounded-[32px] p-8 lg:p-10 flex flex-col">
                            <p className="text-[#ffffff]/50 text-[14px] font-medium tracking-wide mb-8">
                                Client Sentiment
                            </p>

                            <h3 className="text-[#be0919] font-['Glacial'] text-[32px] lg:text-[56px] font-light leading-none mb-4">
                                4.9
                            </h3>

                            <div className="flex gap-2 mb-8">
                                {[1, 2, 3, 4, 5].map((i) => (
                                    <Star key={i} className="w-6 h-6 text-[#be0919]" strokeWidth={1.5} />
                                ))}
                            </div>

                            <p className="text-[#ffffff] text-[14px] leading-[1.8]">
                                UX research, wireframes, and high-fidelity UI that balances aesthetic and usability. Transforming ideas into seamless, intuitive, and visually captivating digital experiences..
                            </p>
                        </div>

                        <div className="lg:col-span-8 bg-gradient-to-b from-[#0a0a0a] to-[#232323] border border-[#1f1f1f] rounded-[24px] lg:rounded-[32px] p-6 lg:p-10 flex flex-col xl:flex-row gap-10 xl:gap-8">

                            <div className="flex-1 flex flex-col justify-between">
                                <div>
                                    <div className="inline-flex items-center gap-2 border border-[#ffffff]/20 rounded-full px-4 py-1.5 mb-10">
                                        <CheckCircle className="w-3.5 h-3.5 text-[#be0919]" strokeWidth={2} />
                                        <span className="text-[#ffffff] text-[12px] font-medium tracking-wide">
                                            Verified Client Review
                                        </span>
                                    </div>

                                    <h3 className="text-white font-['Glacial'] text-3xl sm:text-4xl xl:text-[42px] font-medium leading-[1.25] tracking-tight mb-14">
                                        We exist to make high-growth companies feel inevitable
                                    </h3>
                                </div>

                                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6">
                                    <div className="flex items-center gap-4">
                                        <div className="w-12 h-12 bg-[#d9d9d9] rounded-full flex-shrink-0"></div>
                                        <div>
                                            <h5 className="text-white text-[14px] font-bold tracking-wide">Jhon wlton</h5>
                                            <p className="text-white text-[12px]">Jhonwlton@gmail.com</p>
                                        </div>
                                    </div>

                                    <div className="border border-[#ffffff]/20 rounded-full px-5 py-2 flex-shrink-0">
                                        <span className="text-[#ffffff] text-[12px] tracking-wide whitespace-nowrap">Software company</span>
                                    </div>
                                </div>
                            </div>

                            <div className="xl:w-[300px] flex-shrink-0 border border-[#ffffff]/20 rounded-[24px] p-6 lg:p-8 flex flex-col justify-between">
                                <div>
                                    <p className="text-[#ffffff]/50 text-[12px] font-medium tracking-wide mb-8">
                                        Impact after Launch
                                    </p>

                                    <div className="mb-5">
                                        <h4 className="text-[#be0919] text-[32px] font-['Glacial'] font-light mb-1">+62%</h4>
                                        <p className="text-[#ffffff] text-[13px]">High Demo conversion</p>
                                    </div>

                                    <div>
                                        <h4 className="text-[#be0919] text-[32px] font-['Glacial'] font-light mb-1">3 weeks</h4>
                                        <p className="text-[#ffffff] text-[13px]">Faster stakeholder alignment</p>
                                    </div>
                                </div>

                                <div className="flex gap-3 mt-12">
                                    <button className="flex-1 border border-[#333] rounded-full py-2.5 text-white text-[12px] font-medium hover:bg-[#111] transition-colors duration-300">
                                        Previous
                                    </button>
                                    <button className="flex-1 bg-[#be0919] rounded-full py-2.5 text-white text-[12px] font-medium hover:bg-[#a00715] transition-colors duration-300 shadow-[0_0_15px_rgba(190,9,25,0.3)]">
                                        Next
                                    </button>
                                </div>
                            </div>

                        </div>

                    </div>
                </div>
            </section>


            {/* Video Section */}

            <section className="w-full py-20 bg-black overflow-hidden">
                <div className="max-w-[1200px] mx-auto px-6">

                    <div className="text-center mb-16">
                        <Title as="h2" className="text-4xl lg:text-[40px] font-medium text-white mb-4">
                            Over 1000 + people trust us
                        </Title>
                        <p className="text-[#ffffff] text-[14px] max-w-[500px] mx-auto">
                            Hear from our clients about their experience working with us and the results they've achieved. Their stories reflect the trust, quality, and value we bring to every project.
                        </p>
                    </div>

                    <div className="flex justify-center items-center gap-4 lg:gap-8">

                        <div className="hidden md:flex gap-4 items-center">
                            <div className="w-16 h-65 bg-gradient-to-b from-[#1a1a1a] to-[#0a0a0a] border border-[#ffffff]/20 rounded-none flex items-center justify-center">
                                <span className="text-[#ffffff] text-[22px] tracking-widest [writing-mode:vertical-rl] rotate-180">Anab larnet</span>
                            </div>

                            <div className="w-16 h-85 bg-gradient-to-b from-[#1a1a1a] to-[#0a0a0a] border border-[#ffffff]/20 rounded-none flex flex-col items-center justify-between py-4">
                                <span className="mt-19 text-[#ffffff] text-[22px] tracking-widest [writing-mode:vertical-rl] rotate-180">Anab larnet</span>
                                <ArrowLeft size={19} className="text-white" />
                            </div>
                        </div>

                        <div className="relative w-full max-w-[600px] min-h-[400px] aspect-video rounded-none overflow-hidden border border-[#1f1f1f] shadow-2xl">

                            <img
                                src="/assets/home-young-man.jpg"
                                alt="Client Testimonial"
                                className="w-full h-full object-cover"
                            />

                            <div className="absolute inset-0 bg-black/20"></div>

                            <div className="absolute inset-0 flex items-center justify-center">
                                <button className="w-16 h-16 bg-white/90 rounded-full flex items-center justify-center hover:scale-110 transition-transform shadow-xl">
                                    <Play size={24} className="text-black fill-black" />
                                </button>
                            </div>

                            <div className="absolute bottom-6 left-6 text-black font-bold text-[16px]">
                                Jhon Walton
                            </div>
                        </div>

                        <div className="hidden md:flex gap-4 items-center">
                            <div className="w-16 h-85 bg-gradient-to-b from-[#1a1a1a] to-[#0a0a0a] border border-[#ffffff]/20 rounded-none flex flex-col items-center justify-between py-4">
                                <span className="mt-19 text-[#ffffff] text-[22px] tracking-widest [writing-mode:vertical-rl] rotate-180">Anab larnet</span>
                                <ArrowRight size={19} className="text-white" />
                            </div>

                            <div className="w-16 h-65 bg-gradient-to-b from-[#1a1a1a] to-[#0a0a0a] border border-[#ffffff]/20 rounded-none flex items-center justify-center">
                                <span className="text-[#ffffff] text-[22px] tracking-widest [writing-mode:vertical-rl] rotate-180">Anab larnet</span>
                            </div>
                        </div>
                    </div>

                </div>
            </section>


            {/* FAQ Section */}

            <section className="w-full py-8 bg-[#1a1a1a] overflow-hidden">
                <div className="max-w-[1350px] mx-auto px-6 lg:px-12">

                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 lg:gap-24 mb-24">

                        <div>
                            <div className="flex items-center gap-3 mb-8">
                                <img
                                    src="/assets/home-faq.png"
                                    alt="FAQ Icon"
                                    className="w-12 h-12 object-contain"
                                />
                                <span className="text-[#be0919] text-[30px] font-medium tracking-wide">
                                    FAQs
                                </span>
                            </div>

                            <Title as="h2" className="text-4xl sm:text-5xl lg:text-[42px] font-medium leading-[1.2] tracking-tight text-white mb-8">
                                <span className="block">Clear answers for teams</span>
                                <span className="block">investing in serious <span className="text-[#be0919]">digital</span></span>
                                <span className="block text-[#be0919]">change.</span>
                            </Title>

                            <p className="text-[#ffffff] text-[16px] leading-[1.8] max-w-[500px]">
                                Our engagements are thoughtfully designed to be high-touch, strategy-led, and results-focused, providing clarity, confidence, and seamless collaboration from day one. Every interaction is guided by expertise, transparency, and a commitment to delivering exceptional outcomes at every stage of the journey.
                            </p>
                        </div>

                        <div className="flex flex-col gap-4 mt-2">
                            {faqData.map((faq, index) => (
                                <div
                                    key={index}
                                    className={"border border-[#ffffff]/20 rounded-2xl overflow-hidden transition-colors duration-300"}
                                >
                                    <div className="flex justify-between items-center p-6 cursor-pointer select-none">
                                        <h4 className="text-[#ffffff] text-[15px] font-medium tracking-wide pr-4">
                                            {faq.question}
                                        </h4>
                                        <div className="p-1 rounded-full border border-white bg-[#333]/60 flex items-center justify-center">
                                            {faq.isOpen ? (
                                                <Minus className="text-white flex-shrink-0" size={16} strokeWidth={2} />
                                            ) : (
                                                <Plus className="text-white flex-shrink-0" size={16} strokeWidth={2} />
                                            )}
                                        </div>
                                    </div>

                                    {faq.isOpen && (
                                        <div className="px-6 pb-6 pt-2">
                                            <p className="text-[#ffffff] text-[11px] leading-[1.7]">
                                                {faq.answer}
                                            </p>
                                        </div>
                                    )}
                                </div>
                            ))}
                        </div>

                    </div>

                    {/* CTA Card */}

                    <div className="w-full bg-gradient-to-br from-[#161616] to-[#111111] border border-[#ffffff]/20 rounded-[15px] p-10 lg:p-16 flex flex-col lg:flex-row items-start lg:items-center justify-between gap-12 relative overflow-hidden">

                        <div className="absolute top-1/2 right-1/4 -translate-y-1/2 w-[300px] h-[300px] bg-[#be0919]/5 blur-[100px] rounded-full pointer-events-none"></div>

                        <div className="max-w-[700px] relative z-10">
                            <p className="text-[#ffffff]/50 text-[14px] font-regular font-['Open Sans'] tracking-wide mb-6">
                                Ready when you are
                            </p>
                            <h3 className="text-white text-3xl sm:text-4xl lg:text-[38px] font-medium font-['Glacial'] tracking-tight mb-6">
                                Ready To Build Something Extraordinary?
                            </h3>
                            <p className="text-[#ffffff] text-[16px] leading-[1.7] max-w-[600px]">
                                If your next Website, identity, or digital product needs to look like market leadership from day one, we should talk.
                            </p>
                        </div>

                        <div className="flex flex-col gap-4 w-full sm:w-auto min-w-[280px] relative z-10">
                            <button className="w-full bg-[#be0919] text-white rounded-full py-3.5 text-[15px] font-medium hover:bg-[#a00715] transition-colors duration-300 shadow-[0_0_20px_rgba(190,9,25,0.2)]">
                                Start the Conversation
                            </button>

                            <button className="w-full bg-transparent border border-[#ffffff]/20 text-[#ffffff] rounded-full py-3.5 text-[12px] font-regular hover:bg-[#111] hover:border-[#555] transition-colors duration-300">
                                Download Capabilities Deck
                            </button>
                        </div>

                    </div>

                </div>
            </section>


            {/* Contact Form Section */}
            <ContactForm />

            {/* Newsletter Section */}
            <div className="max-w-[1350px] mx-auto px-6 lg:px-12 w-full pt-12 pb-8 border-t border-[#1a1a1a]">
                <Newsletter />

            </div>

        </div>
    );
}