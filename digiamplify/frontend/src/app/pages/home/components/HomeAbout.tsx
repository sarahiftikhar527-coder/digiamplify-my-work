import React from 'react';
import Image from 'next/image';
import Title from '@/components/ui/Title';

export default function HomeAbout() {
    return (
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
                            src="/assets/home/home-pc-setup.jpg"
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
    );
}
