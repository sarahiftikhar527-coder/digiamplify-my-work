import React from 'react';

export default function AboutMissionVision() {
  return (
    <section className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-32">
      
      <div className="bg-[#050505] border border-[#1f1f1f] rounded-3xl p-10 lg:p-12 relative overflow-hidden flex flex-col min-h-[450px]">
        <div className="absolute top-[-50px] left-[-50px] w-56 h-56 bg-[#be0919]/20 blur-[70px] rounded-full pointer-events-none"></div>
        
        <div className="flex justify-between items-center mb-12 relative z-10">
          <span className="text-white/50 text-[18px] font-['Glacial'] tracking-wide">Our Mission</span>
          
          <div className="w-12 h-12 rounded-2xl border-[2px] border-[#be0919]/40 bg-[#be0919]/10 flex items-center justify-center text-[#e6192b] shadow-[0_0_15px_rgba(190,9,25,0.1)]">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="7.5" cy="7.5" r="2.5"/>
              <circle cx="16.5" cy="7.5" r="2.5"/>
              <circle cx="7.5" cy="16.5" r="2.5"/>
              <circle cx="16.5" cy="16.5" r="2.5"/>
              <path d="M12 9.5v5M9.5 12h5 M5.7 5.7L3.5 3.5 M18.3 5.7L20.5 3.5 M5.7 18.3L3.5 20.5 M18.3 18.3L20.5 20.5"/>
            </svg>
          </div>
        </div>
        
        <div className="relative z-10 flex flex-col flex-grow">
          <h3 className="text-2xl lg:text-[41px] leading-[1.2] text-white font-['Glacial'] font-normal max-w-lg mb-10">
            Empowering Growth Through Innovation and Strategy Building Digital Solutions for Lasting Success
          </h3>
          <p className="text-[#FFFFFF] text-[17px] leading-relaxed pr-4 mt-auto">
            Our mission is to help businesses grow through strategic thinking, creativity, and innovative digital solutions that deliver real results and long-term value.
          </p>
        </div>
      </div>

      <div className="bg-[#050505] border border-[#1f1f1f] rounded-3xl p-10 lg:p-12 relative overflow-hidden flex flex-col min-h-[450px]">
        <div className="absolute top-[-50px] left-[-50px] w-56 h-56 bg-[#be0919]/20 blur-[70px] rounded-full pointer-events-none"></div>
        
        <div className="flex justify-between items-center mb-12 relative z-10">
          <span className="text-white/50 text-[18px] font-['Glacial'] tracking-wide">Our Vision</span>
          
          <div className="w-12 h-12 rounded-2xl border-[2px] border-[#be0919]/40 bg-[#be0919]/10 flex items-center justify-center text-[#e6192b] shadow-[0_0_15px_rgba(190,9,25,0.1)]">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M11.5 14.5L8 22M11.5 14.5L15 22" />
              <g transform="rotate(-25 12 12)">
                <rect x="4" y="10.5" width="4" height="3" rx="0.5" />
                <rect x="8" y="9.5" width="5" height="5" rx="0.5" />
                <rect x="13" y="8.5" width="7" height="7" rx="0.5" />
              </g>
            </svg>
          </div>
        </div>
        
        <div className="relative z-10 flex flex-col flex-grow">
          <h3 className="text-2xl lg:text-[41px] leading-[1.2] text-white font-['Glacial'] font-normal max-w-lg mb-10">
            Shaping the Future of Digital Excellence Inspiring Growth Through Innovation and Purpose
          </h3>
          <p className="text-[#FFFFFF] text-[17px] leading-relaxed pr-4 mt-auto">
            Our vision is to become a leading digital partner delivering innovative solutions that drive growth and long-term impact.
          </p>
        </div>
      </div>

    </section>
  );
}
