import React from 'react';
import Image from 'next/image';
import Title from '@/components/ui/Title';

const valuesData = [
  {
    title: "Innovation",
    icon: (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"></path>
        <polyline points="3.27 6.96 12 12.01 20.73 6.96"></polyline>
        <line x1="12" y1="22.08" x2="12" y2="12"></line>
      </svg>
    )
  },
  {
    title: "Collaboration",
    icon: (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path>
        <circle cx="9" cy="7" r="4"></circle>
        <path d="M23 21v-2a4 4 0 0 0-3-3.87"></path>
        <path d="M16 3.13a4 4 0 0 1 0 7.75"></path>
      </svg>
    )
  },
  {
    title: "Transparency",
    icon: (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path>
        <circle cx="12" cy="12" r="3"></circle>
      </svg>
    )
  },
  {
    title: "Excellence",
    icon: (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"></polygon>
      </svg>
    )
  },
  {
    title: "Growth",
    icon: (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <polyline points="23 6 13.5 15.5 8.5 10.5 1 18"></polyline>
        <polyline points="17 6 23 6 23 12"></polyline>
      </svg>
    )
  }
];

export default function AboutValues() {
  return (
    <section className="mb-32 relative flex flex-col items-center">
      
      <div className="absolute left-[-160px] lg:left-[-150px] bottom-[-120px] hidden lg:block opacity-90 z-0 pointer-events-none">
        <Image src="/assets/about/photoroom.png" alt="3D dark crystal left" width={380} height={380} className="object-contain" />
      </div>
      <div className="absolute right-[-100px] lg:right-[-140px] top-[-120px] hidden lg:block opacity-90 z-0 pointer-events-none">
        <Image src="/assets/about/photoroom.png" alt="3D dark crystal right" width={380} height={380} className="object-contain" />
      </div>

      <div className="relative z-10 flex flex-col items-center w-full">
        <span className="text-[#555] text-[0.8rem] tracking-wide mb-4 block text-center">Culture and Values</span>
        <Title as="h2" className="text-3xl lg:text-[2.5rem] text-center mb-16 font-['Glacial']">
          The Force that shape every decision we make
        </Title>

        <div className="flex flex-wrap justify-center gap-6 lg:gap-8 w-full max-w-[1000px]">
          {valuesData.map((val, i) => (
            <div 
              key={i} 
              className="w-[150px] h-[170px] lg:w-[160px] lg:h-[180px] bg-[#050505] border border-[#1f1f1f] rounded-2xl flex flex-col items-center justify-center gap-5 hover:border-[#333] hover:shadow-[0_0_30px_rgba(255,255,255,0.03)] transition-all duration-300 cursor-pointer group"
            >
              <div className="w-12 h-12 rounded-full bg-[#1a1a1a] border border-[#2a2a2a] flex items-center justify-center text-[#be0919] group-hover:scale-110 transition-transform duration-300">
                {val.icon}
              </div>
              
              <div className="flex flex-col items-center gap-2">
                <span className="text-[0.85rem] text-white font-poppins tracking-wide">
                  {val.title}
                </span>
                <div className="w-6 h-[2px] bg-[#be0919] rounded-full group-hover:w-8 transition-all duration-300"></div>
              </div>
            </div>
          ))}
        </div>
      </div>
      
    </section>
  );
}
