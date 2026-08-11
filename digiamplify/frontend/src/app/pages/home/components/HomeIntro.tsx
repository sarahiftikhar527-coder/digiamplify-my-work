import React from 'react';
import Image from 'next/image';
import Title from '@/components/ui/Title';

export default function HomeIntro() {
    return (
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
                                src="/assets/home/silver-ring.png"
                                alt="3D Silver Ring"
                                fill
                                className="object-contain hover:scale-105 transition-transform duration-700 animate-[spin_30s_linear_infinite] -rotate-[25deg]"
                            />
                        </div>
                    </div>

                </div>

            </div>
        </section>
    );
}
