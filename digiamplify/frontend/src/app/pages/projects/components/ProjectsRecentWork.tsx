'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import Title from '@/components/ui/Title';
import { Eye, EyeOff } from 'lucide-react';

export default function ProjectsRecentWork() {
  const [isExpanded, setIsExpanded] = useState(false);
  const filters = ["All", "Website", "Design", "Poster", "Ad campaign"];

  return (
    <section className="mb-25">
      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center mb-10 gap-6">
        <div className="flex items-center gap-4">
          <Title as="h2" className="text-3xl lg:text-[2.2rem] font-['Glacial']">
            Our recent <span className="text-[#be0919]">work</span>
          </Title>
          <button 
            onClick={() => setIsExpanded(!isExpanded)}
            className="w-10 h-10 rounded-full border border-[#be0919]/30 bg-[#050505] flex items-center justify-center text-[#be0919] hover:bg-[#be0919] hover:text-white hover:border-[#be0919] transition-all duration-300 shadow-[0_0_15px_rgba(190,9,25,0.15)] cursor-pointer"
            title={isExpanded ? "Hide details" : "Show details"}
          >
            {isExpanded ? <EyeOff size={18} /> : <Eye size={18} />}
          </button>
        </div>

        <div className="flex flex-wrap items-center gap-3 bg-[#050505] p-2 rounded-full border border-[#1f1f1f]">
          {filters.map((filter, idx) => (
            <button
              key={idx}
              className={`px-5 py-2 rounded-full text-[16px] transition-colors ${idx === 0
                ? 'bg-[#be0919] text-white font-medium shadow-[0_0_10px_rgba(190,9,25,0.4)]'
                : 'text-[#888] hover:text-white hover:bg-[#1a1a1a]'
                }`}
            >
              {filter}
            </button>
          ))}
        </div>
      </div>

      <div className="flex flex-col lg:flex-row gap-5 items-stretch">
        <div className="w-full lg:w-[65%] relative min-h-[350px] rounded-3xl overflow-hidden border border-[#222]">
          <Image src="/assets/projects/featured-code.jpg" alt="Featured code project" fill className="object-cover transition-transform duration-500 ease-out hover:scale-110" />
        </div>

        <div className="w-full lg:w-[35%] flex flex-col gap-5">

          <div className="bg-[#050505] border border-[#1f1f1f] rounded-3xl p-8 flex-grow flex flex-col justify-center relative">
            <div className="flex justify-between items-start mb-4">
              <h3 className="text-[#be0919] text-[18px] font-medium">Description</h3>
              <button 
                onClick={() => setIsExpanded(!isExpanded)}
                className="text-[#be0919]/70 hover:text-[#be0919] transition-colors"
                title={isExpanded ? "Hide full description" : "View full description"}
              >
                {isExpanded ? <EyeOff size={20} /> : <Eye size={20} />}
              </button>
            </div>
            <p className="text-white text-[14px] leading-relaxed">
              Transforming designs into responsive, user-centric interfaces with clean code delivering fast, aesthetic, and accessible experiences across all devices and browsers.
            </p>
          </div>

          <div className="bg-[#050505] border border-[#1f1f1f] rounded-3xl p-8 flex-grow flex flex-col justify-center relative overflow-hidden">
            <h3 className="text-[#777] text-[14px] mb-6">Platform Result</h3>

            <div className="flex flex-col gap-4">
              <div>
                <div className="text-[#be0919] text-[30px] font-['Glacial'] text-2xl font-light mb-1">4.9</div>
                <div className="text-[#FFFFFF] text-[12px]">Client Satisfaction score average</div>
              </div>
              <div>
                <div className="text-[#be0919] text-[30px] font-['Glacial'] text-2xl font-light mb-1">2.3 <span className="text-[12px]">x</span></div>
                <div className="text-[#FFFFFF] text-[12px]">Average actions past campaign</div>
              </div>
            </div>

            <div className="absolute bottom-8 right-8 flex items-end gap-[3px] h-10">
              <div className="w-2 h-[30%] bg-[#333] rounded-t-sm"></div>
              <div className="w-2 h-[50%] bg-[#555] rounded-t-sm"></div>
              <div className="w-2 h-[70%] bg-[#777] rounded-t-sm"></div>
              <div className="w-2 h-[85%] bg-[#be0919] rounded-t-sm"></div>
              <div className="w-2 h-[100%] bg-[#be0919] rounded-t-sm"></div>
            </div>
          </div>

        </div>
      </div>

      {isExpanded && (
        <div className="mt-8 p-8 bg-[#050505] border border-[#1f1f1f] rounded-3xl animate-[fadeIn_0.5s_ease-out] transition-all">
          {/* About Section */}
          <div className="mb-10">
            <div className="flex items-center border-l-[4px] border-[#be0919] pl-4 mb-4">
              <h3 className="text-2xl font-bold font-['Glacial'] text-white">About</h3>
            </div>
            <p className="text-white/70 text-[14px] leading-relaxed font-poppins">
              At DigiAmplify, our recent projects represent a synthesis of engineering excellence, user-centric interface design, and ROI-driven marketing campaigns. We partner with high-growth startups and mature enterprise companies to solve complex digital challenges. Every application, dashboard, and custom system we deploy is optimized for speed, scalability, accessibility, and clean code conventions, ensuring our clients achieve long-term competitive advantages.
            </p>
          </div>

          {/* Description Section */}
          <div>
            <div className="flex items-center border-l-[4px] border-[#be0919] pl-4 mb-4">
              <h3 className="text-2xl font-bold font-['Glacial'] text-white">Description</h3>
            </div>
            <div className="flex flex-col gap-5 text-white/70 text-[14px] leading-relaxed font-poppins">
              <p>
                Our design and engineering process is deeply collaborative, iterative, and metric-oriented. We begin by conducting comprehensive user research and competitor analyses to ensure we build interfaces that resonate with end-users. We design premium design systems from the ground up, avoiding cookie-cutter frameworks to maintain unique brand positioning and high-end visual aesthetics.
              </p>
              <p>
                On the development side, we specialize in high-performance frontends built with modern frameworks such as Next.js and Tailwind CSS. We ensure full cross-browser compatibility, responsive adaptivity across devices, and optimized page load times. By implementing clean semantic HTML and proper heading structures, we guarantee that all deliverables are highly optimized for search engine visibility and accessibility compliance.
              </p>
              <p>
                Beyond frontend visual execution, we integrate robust backend services, secure database structures, and comprehensive analytics architectures. This allows clients to track user behavior, transaction conversions, and overall platform health in real-time. The end result is a highly functional, secure, and beautiful digital presence that feels premium and accelerates business outcomes.
              </p>
              <p>
                Each showcased work demonstrates our capability to deliver not just software, but complete, market-ready products. We handle deployment pipelines, continuous testing, performance audits, and launch strategy to ensure a seamless transition from concept to production. We believe that true digital transformation occurs at the intersection of aesthetic brilliance and operational reliability.
              </p>
            </div>
          </div>
        </div>
      )}
    </section>
  );
}
