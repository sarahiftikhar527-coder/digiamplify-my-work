import React from 'react';
import Title from '@/components/ui/Title';
import { ArrowRight } from 'lucide-react';

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

export default function HomeWorkflow() {
    return (
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
    );
}
