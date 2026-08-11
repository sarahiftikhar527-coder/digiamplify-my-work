'use client';

import React, { useState } from 'react';
import Title from '@/components/ui/Title';
import { Plus, Minus } from 'lucide-react';

const faqData = [
    {
        question: "What kind of clients do you work with?",
        answer: "We partner with ambitious startups, premium consumer brands, and enterprise teams that need a sharper digital presence and cleaner market story."
    },
    {
        question: "How does your project process work?",
        answer: "Our process is highly collaborative, focusing on strategy, rapid prototyping, and high-fidelity execution to ensure alignment and quality at every step."
    },
    {
        question: "Do you work with startups and established businesses?",
        answer: "Yes, we tailor our approach based on the scale of the company. Startups get agile speed, while enterprise clients get robust scalability and structured governance."
    },
    {
        question: "How do you ensure project quality and performance?",
        answer: "We employ rigorous QA testing, performance audits, and modern deployment pipelines to guarantee that the final product is fast, secure, and visually flawless."
    },
    {
        question: "Do you provide ongoing support and maintenance?",
        answer: "Absolutely. We offer dedicated retention retainers to ensure your digital products continue to evolve, scale, and perform post-launch."
    }
];

export default function HomeFAQ() {
    const [openIndex, setOpenIndex] = useState<number | null>(0);

    const toggleFaq = (index: number) => {
        setOpenIndex(prev => (prev === index ? null : index));
    };

    return (
        <section className="w-full py-8 bg-[#1a1a1a] overflow-hidden">
            <div className="max-w-[1350px] mx-auto px-6 lg:px-12">

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 lg:gap-24 mb-24">

                    <div>
                        <div className="flex items-center gap-3 mb-8">
                            <img
                                src="/assets/home/home-faq.png"
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
                        {faqData.map((faq, index) => {
                            const isOpen = openIndex === index;
                            return (
                                <div
                                    key={index}
                                    className="border border-[#ffffff]/20 rounded-2xl overflow-hidden transition-colors duration-300"
                                >
                                    <div
                                        onClick={() => toggleFaq(index)}
                                        className="flex justify-between items-center p-6 cursor-pointer select-none"
                                    >
                                        <h4 className="text-[#ffffff] text-[15px] font-medium tracking-wide pr-4">
                                            {faq.question}
                                        </h4>
                                        <div className="p-1 rounded-full border border-white bg-[#333]/60 flex items-center justify-center">
                                            {isOpen ? (
                                                <Minus className="text-white flex-shrink-0" size={16} strokeWidth={2} />
                                            ) : (
                                                <Plus className="text-white flex-shrink-0" size={16} strokeWidth={2} />
                                            )}
                                        </div>
                                    </div>

                                    {isOpen && (
                                        <div className="px-6 pb-6 pt-2">
                                            <p className="text-[#ffffff] text-[11px] leading-[1.7]">
                                                {faq.answer}
                                            </p>
                                        </div>
                                    )}
                                </div>
                            );
                        })}
                    </div>

                </div>

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
    );
}
