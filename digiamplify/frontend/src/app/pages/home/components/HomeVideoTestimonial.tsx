import React from 'react';
import Title from '@/components/ui/Title';
import { Play, ArrowLeft, ArrowRight } from 'lucide-react';

export default function HomeVideoTestimonial() {
    return (
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
                            src="/assets/home/home-young-man.jpg"
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
    );
}
