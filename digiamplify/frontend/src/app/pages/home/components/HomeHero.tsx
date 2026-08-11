import React from 'react';
import Image from 'next/image';
import Title from '@/components/ui/Title';

const heroStats = [
    { label: "Reach", value: "10K+", image: "/assets/home/reach-chart.png" },
    { label: "Projects", value: "500+", image: "/assets/home/projects-chart.png" },
    { label: "Clients", value: "120+", image: "/assets/home/clients-chart.png" },
    { label: "Satisfaction", value: "99%", image: "/assets/home/satisfaction-chart.png" },
];

export default function HomeHero() {
    return (
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
                            <Image src="/assets/home/home-hero-red-gear.png" alt="3D Red Gear" fill className="object-contain" priority />
                        </div>
                        <div className="absolute top-[10%] left-0 w-[150px] h-[150px] z-20 animate-[bounce_4s_infinite_ease-in-out]">
                            <Image src="/assets/home/home-hero-silver-c.png" alt="Silver Shape" fill className="object-contain" />
                        </div>
                        <div className="absolute bottom-[5%] right-[-5%] w-[120px] h-[120px] z-20 animate-[bounce_5s_infinite_ease-in-out_reverse]">
                            <Image src="/assets/home/home-hero-cube.png" alt="Silver Cube" fill className="object-contain" />
                        </div>
                    </div>
                </div>
                <div className="w-full h-[1px] bg-white/20 mt-10"></div>
            </div>
        </section>
    );
}
