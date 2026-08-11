import React from 'react';
import Image from 'next/image';
import Title from '@/components/ui/Title';
import { ArrowUpRight, ArrowRight } from 'lucide-react';

const caseStudies = [
  {
    title: "Scale Force SaaS",
    category: "B2B Software",
    challenge: "Complex navigation and outdated interfaces were causing user drop-offs, ultimately hurting their overall product adoption.",
    strategy: "Extensive UX research, rapid wireframing, and high-fidelity UI design to balance modern aesthetics with usability.",
    results: [
      { value: "98%", label: "Growth" },
      { value: "6.2%", label: "Reduction" },
      { value: "8 mo", label: "Time to Result" }
    ],
    image: "/assets/services/services-case-1.jpg"
  },
  {
    title: "Nexus Cloud ERP",
    category: "Enterprise Tech",
    challenge: "Disjointed legacy systems and slow processing speeds created massive operational bottlenecks for their global workforce.",
    strategy: "Agile development sprints, scalable cloud architecture, and streamlined data flows to ensure precision and reliability.",
    results: [
      { value: "150%", label: "Increase" },
      { value: "3.5x", label: "Engagement" },
      { value: "6 mo", label: "Time to Launch" }
    ],
    image: "/assets/services/services-case-2.jpg"
  }
];

export default function ServicesCaseStudies() {
  return (
    <section className="w-full relative pt-10 pb-4 bg-[#0a0a0a] overflow-hidden">
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_#1f1f1f_0%,_transparent_70%)] pointer-events-none z-0"></div>

      <div className="max-w-[1200px] mx-auto px-6 lg:px-8 relative z-10">

        <div className="flex flex-col lg:flex-row justify-between items-start lg:items-end gap-8 mb-16">
          <div className="max-w-[700px]">
            <Title as="h2" className="text-4xl sm:text-5xl lg:text-[50px] font-['Glacial'] leading-tight mb-6">
              Real Clients <span className="text-[#be0919]">Real Results</span>.
            </Title>
            <p className="text-[#ffffff] text-[15px] leading-[1.8]">
              Trusted by growing brands and established businesses alike, we focus on delivering measurable outcomes that make a lasting impact. Every project is driven by strategy, creativity, and performance, helping our clients achieve meaningful growth and long-term success.
            </p>
          </div>

          <button className="px-8 py-3 rounded-full border border-[#be0919] text-[#be0919] hover:bg-[#be0919] hover:text-white transition-all duration-300 text-sm tracking-wide whitespace-nowrap">
            Read All case study
          </button>
        </div>

        <div className="flex flex-col gap-8">
          {caseStudies.map((study, index) => (
            <div
              key={index}
              className="flex flex-col lg:flex-row bg-[#0c0c0c] border border-[#222] rounded-2xl overflow-hidden group hover:border-[#444] transition-colors duration-500"
            >

              <div className="w-full lg:w-[28%] relative h-[250px] lg:h-auto overflow-hidden">
                <Image
                  src={study.image}
                  alt={study.title}
                  fill
                  className="object-cover group-hover:scale-105 transition-transform duration-700"
                />
              </div>

              <div className="w-full lg:w-[72%] py-6 px-8 lg:py-7 lg:px-10 flex flex-col justify-between">

                <div className="flex justify-between items-start mb-8">
                  <div>
                    <h3 className="text-[25px] font-['Glacial'] text-white tracking-wide">
                      {study.title}
                    </h3>
                    <p className="text-[#be0919] text-[15px] mt-1">
                      {study.category}
                    </p>
                  </div>

                  <button className="hidden md:flex items-center gap-2 text-[#be0919] text-sm hover:text-white transition-colors group/link">
                    Read full case study
                    <ArrowUpRight className="w-4 h-4 group-hover/link:-translate-y-0.5 group-hover/link:translate-x-0.5 transition-transform" />
                  </button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-8 md:gap-12 mb-8">

                  <div>
                    <h4 className="text-white/50 text-[18px] font-['Glacial'] mb-3">Challenges</h4>
                    <p className="text-white/80 text-[13px] leading-relaxed">
                      {study.challenge}
                    </p>
                  </div>

                  <div>
                    <h4 className="text-white/50 text-[18px] font-['Glacial'] mb-3">Strategy</h4>
                    <p className="text-white/80 text-[13px] leading-relaxed">
                      {study.strategy}
                    </p>
                  </div>

                  <div>
                    <h4 className="text-white/50 text-[18px] font-['Glacial'] mb-3">Results</h4>
                    <div className="flex flex-col gap-2.5">
                      {study.results.map((res, i) => (
                        <div key={i} className="flex items-center gap-3">
                          <span className="text-[#be0919] font-medium w-[45px]">
                            {res.value}
                          </span>
                          <span className="text-white/80 text-[13px]">
                            {res.label}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                <div className="flex justify-end gap-3 mt-auto">
                  <button className="w-8 h-8 rounded-full bg-[#dfdfdf] flex items-center justify-center hover:bg-white transition-colors cursor-pointer"></button>
                  <button className="w-8 h-8 rounded-full bg-[#be0919] flex items-center justify-center hover:bg-red-700 transition-colors cursor-pointer">
                    <ArrowRight className="w-4 h-4 text-white -rotate-45" />
                  </button>
                </div>

              </div>
            </div>
          ))}
        </div>

        <div className="w-full h-[1.5px] bg-white/50 mt-14"></div>

      </div>

    </section>
  );
}
