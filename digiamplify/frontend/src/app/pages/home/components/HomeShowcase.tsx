import React from 'react';
import Image from 'next/image';
import Title from '@/components/ui/Title';

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

export default function HomeShowcase() {
    return (
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
                                src="/assets/home/home-silver-fan.png"
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
                            src="/assets/home/home-red-setup.png"
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
    );
}
