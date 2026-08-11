import React from 'react';
import Image from 'next/image';

export default function ProjectsHero() {
  return (
    <section className="relative w-full h-[550px] lg:h-[650px] bg-[#050505] overflow-hidden mb-20 mt-10">

      <div
        className="absolute top-0 right-0 w-[42%] h-full overflow-hidden z-0"
        style={{ clipPath: 'polygon(0 0, 100% 0, 100% 100%, 236px 100%)' }}
      >
        <Image
          src="/assets/projects/hero-projects.jpg"
          alt="Team working"
          fill
          className="object-cover"
          style={{ objectPosition: '75% center' }}
          priority
        />
        <div className="absolute inset-0 bg-[#050505]/20"></div>
      </div>

      <div
        className="absolute top-0 right-0 w-[130px] h-[90px] bg-[#be0919] z-10"
        style={{ clipPath: 'polygon(0 0, 100% 0, 100% 100%, 55px 100%)' }}
      ></div>

      <div className="relative z-20 w-full max-w-[1200px] mx-auto px-6 lg:px-10 h-full flex flex-col justify-center">
        <div className="w-full lg:w-[55%] mb-30">
          <h1 className="text-4xl sm:text-5xl lg:text-[50px] font-['Glacial'] leading-[1.1] mb-8 text-white">
            A showcase of projects<br />
            crafted for real <span className="text-[#be0919]">business<br />impact</span>
          </h1>
          <p className="text-white/50 text-[13px] leading-relaxed max-w-md">
            Our portfolio showcases a carefully curated selection of projects that reflect our creativity, strategy, and technical expertise. Each work is designed with a focus on performance, user experience, and measurable results. We aim to deliver solutions that not only look exceptional but also create real business impact. This collection represents our commitment to quality, innovation, and continuous improvement.
          </p>
        </div>
      </div>

      <div className="absolute bottom-[8%] left-0 w-full z-30 pointer-events-none hidden lg:block">
        <div className="max-w-[1200px] mx-auto px-6 lg:px-8 relative h-[130px]">

          <div className="absolute left-0 bottom-0 w-[300px] lg:w-[750px] h-[40px] bg-[#2a2a2a]"
          style={{ clipPath: 'polygon(0 0, calc(100% - 15px) 0, 100% 100%, 0 100%)' }}
          ></div>

          <div className="absolute left-[360px] lg:left-[730px] bottom-0 flex flex-col items-start">
            <div className="w-[70px] h-[90px] bg-[#333] skew-x-[20deg] ml-[40px]"></div>
            <div className="w-[70px] h-[90px] bg-[#be0919] skew-x-[20deg] mt-[10px] ml-[75px]"></div>
          </div>

        </div>
      </div>

    </section>
  );
}
