import React from 'react';
import Title from '@/components/ui/Title';
import { Star, CheckCircle } from 'lucide-react';

export default function HomeTestimonials() {
    return (
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
    );
}
