import React from 'react';
import { Check } from 'lucide-react';

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

export default function HomeServices() {
    return (
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
    );
}
