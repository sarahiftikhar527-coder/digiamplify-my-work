import React from 'react';
import Image from 'next/image';
import Title from '@/components/ui/Title';
import { Compass, FileSearch, Layers, MousePointer2, Gauge, TrendingUp } from 'lucide-react';

const processSteps = [
  {
    num: "01",
    title: "Discovery",
    desc: "We dive deep into your business landscape, uncovering core challenges, identifying key opportunities, and defining the true purpose of your project.",
    icon: Compass,
  },
  {
    num: "02",
    title: "Research",
    desc: "We analyze market trends, study competitor strategies, and gather crucial user insights to ensure our decisions are backed by hard data.",
    icon: FileSearch,
  },
  {
    num: "03",
    title: "Strategy",
    desc: "We craft a comprehensive roadmap, aligning creative concepts with technical requirements to set a clear, actionable path toward your specific objectives.",
    icon: Layers,
  },
  {
    num: "04",
    title: "Execution",
    desc: "We bring the vision to life through precise design and rigorous development, building scalable solutions tailored exactly to your brand's needs.",
    icon: MousePointer2,
  },
  {
    num: "05",
    title: "Optimization",
    desc: "We continuously test, refine, and enhance performance metrics to ensure your digital assets are running at their absolute highest potential.",
    icon: Gauge,
  },
  {
    num: "06",
    title: "Growth",
    desc: "We leverage ongoing insights and advanced marketing tactics to scale your reach, maximize return on investment, and secure sustainable, long-term success.",
    icon: TrendingUp,
  },
];

export default function ServicesSolutions() {
  return (
    <section className="w-full relative pt-10 pb-18 bg-[#050505] border-t border-white/30">
      <div className="max-w-[1200px] mx-auto px-6 lg:px-8 relative z-10">

        <div className="flex flex-col lg:flex-row justify-between items-center gap-12 lg:gap-8 mb-20">

          <div className="w-full lg:w-[60%]">
            <Title as="h2" className="text-4xl sm:text-5xl lg:text-[45px] font-['Glacial'] leading-tight mb-6">
              Solutions built for <span className="text-[#be0919]">modern brands</span>.
            </Title>
            <p className="text-[#ffffff] text-[15px] leading-[1.8] max-w-[650px]">
              We combine strategy, creativity, and technology to build solutions that help brands grow with confidence. From marketing and design to automation and digital experiences, every service is crafted to deliver measurable impact. Our focus is on creating meaningful results that drive long term success and sustainable business growth.
            </p>
          </div>

          <div className="w-full lg:w-[40%] flex justify-center lg:justify-end">
            <div className="relative w-[100px] h-[100px] sm:w-[250px] sm:h-[250px]">
              <Image
                src="/assets/services/abstract-sphere.png"
                alt="Abstract 3D Shape"
                fill
                className="object-contain transition-transform duration-500 ease-out hover:scale-140"
              />
            </div>
          </div>

        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-[1px] bg-[#222] border border-[#222] rounded-2xl overflow-hidden">

          {processSteps.map((step, index) => (
            <div
              key={index}
              className="bg-[#0a0a0a] p-8 lg:p-10 relative flex flex-col group hover:bg-[#0f0f0f] transition-colors duration-300 transition-transform duration-500 ease-out hover:scale-110"
            >

              <span className="absolute top-4 right-6 text-[80px] leading-none font-black text-white/30 z-0 select-none pointer-events-none">
                {step.num}
              </span>

              <div className="relative z-10 flex flex-col h-full">

                <div className="w-11 h-11 rounded-full border-[2px] border-[#be0919]/30 bg-[#be0919]/5 flex items-center justify-center mb-8">
                  <step.icon strokeWidth={1.5} className="w-7 h-7 text-[#be0919]" />
                </div>

                <h3 className="text-[19px] font-bold text-white mb-4 tracking-wide">
                  {step.title}
                </h3>

                <p className="text-white/70 text-[13px] leading-[1.7]">
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
