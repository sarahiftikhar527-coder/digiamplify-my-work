import React from 'react';
import Image from 'next/image';

export default function AboutAgency() {
  return (
    <section className="flex flex-col lg:flex-row gap-6 mb-32 items-stretch">
      
      <div className="w-full lg:w-[40%] flex flex-col gap-6">
        <div className="border border-[#222] bg-[#050505] rounded-2xl p-4 lg:p-6 flex-grow flex items-center justify-center">
          <div className="relative w-full h-full min-h-[350px] rounded-xl overflow-hidden">
            <Image 
              src="/assets/about/team-collaboration.jpg" 
              alt="Team collaborating" 
              fill 
              className="object-cover" 
            />
          </div>
        </div>
        
        <div className="border border-[#222] bg-[#050505] rounded-2xl p-5 flex items-center gap-4 shrink-0">
          <div className="flex -space-x-3 shrink-0">
             <div className="w-10 h-10 rounded-full bg-gray-600 border-1 border-white relative z-10 overflow-hidden"><Image src="/assets/about/person-1.jpg" alt="user1" fill className="object-cover"/></div>
             <div className="w-10 h-10 rounded-full bg-gray-500 border-2 border-white relative z-20 overflow-hidden"><Image src="/assets/about/person-2.jpg" alt="user2" fill className="object-cover"/></div>
             <div className="w-10 h-10 rounded-full bg-gray-400 border-2 border-white relative z-30 overflow-hidden"><Image src="/assets/about/person-3.jpg" alt="user3" fill className="object-cover"/></div>
             <div className="w-10 h-10 rounded-full bg-gray-300 border-2 border-white relative z-40 overflow-hidden"><Image src="/assets/about/person-4.jpg" alt="user4" fill className="object-cover"/></div>
          </div>
          <p className="text-[13px] text-[#FFFFFF] leading-relaxed pr-2">
            Yours crafting premium digital system for ambitious founders and enterprise teams.
          </p>
        </div>
      </div>

      <div className="w-full lg:w-[60%] flex flex-col gap-6">
        
        <div className="border border-[#222] bg-[#050505] rounded-2xl p-8 lg:p-10">
          <h2 className="text-xl lg:text-[28px] font-['Glacial'] leading-relaxed text-white">
            The agency behind category defining brands built to lead, influence, and leave a lasting impression not simply blend in.
          </h2>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 flex-grow">
          
          <div className="border border-[#222] bg-[#050505] rounded-2xl p-8 relative overflow-hidden flex flex-col">
            <div className="absolute top-0 right-0 w-32 h-32 bg-[#be0919]/15 blur-[50px] rounded-full pointer-events-none"></div>
            <div className="w-10 h-10 border border-[#333] rounded-xl flex items-center justify-center mb-5 relative z-10 bg-black/50">
              <svg className="w-5 h-5 text-[#be0919]" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"></path></svg>
            </div>
            <h3 className="text-white font-bold text-lg mb-4 relative z-10">Background</h3>
            <p className="text-[#FFFFFF] text-[13px] leading-relaxed relative z-10">
              Founded with a passion for innovation and digital excellence, our agency was built to help businesses navigate an increasingly competitive landscape. By combining strategic thinking, creative expertise, and advanced technology, we create solutions that not only solve challenges but unlock new opportunities for growth, performance, and long-term success.
            </p>
          </div>

          <div className="border border-[#222] bg-[#050505] rounded-2xl p-8 relative overflow-hidden flex flex-col">
            <div className="absolute top-0 right-0 w-32 h-32 bg-[#be0919]/15 blur-[50px] rounded-full pointer-events-none"></div>
            <div className="w-10 h-10 border border-[#333] rounded-xl flex items-center justify-center mb-5 relative z-10 bg-black/50">
              <svg className="w-5 h-5 text-[#be0919]" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M12 11c0 3.517-1.009 6.799-2.753 9.571m-3.44-2.04l.054-.09A13.916 13.916 0 008 11a4 4 0 118 0c0 1.017-.07 2.019-.203 3m-2.118 6.844A21.88 21.88 0 0015.171 17m3.839 1.132c.645-2.266.99-4.659.99-7.132A8 8 0 008 4.07M3 15.364c.64-1.319 1-2.8 1-4.364 0-1.457.39-2.823 1.07-4"></path></svg>
            </div>
            <h3 className="text-white font-bold text-lg mb-4 relative z-10">Core Identity</h3>
            <p className="text-[#FFFFFF] text-[13px] leading-relaxed relative z-10">
              At our core, we are a team of strategists, creatives, and technology experts driven by a shared commitment to excellence. Our identity is defined by innovation, precision, and a relentless focus on delivering meaningful digital experiences that create lasting impact for the brands we serve.
            </p>
          </div>
          
        </div>

        <div className="border border-[#222] bg-[#050505] rounded-2xl p-6 lg:p-8 flex flex-col shrink-0">
          <span className="text-white/50 text-[15px] mb-6">Company Overview</span>
          
          <div className="grid grid-cols-3 gap-0">
            <div className="flex flex-col items-center justify-center border-r border-[#222]">
              <span className="text-[#be0919] text-3xl lg:text-[2.5rem] font-light mb-2">12+</span>
              <span className="text-[#FFFFFF] text-[13px] capitalize tracking-wide">Years in business</span>
            </div>
            <div className="flex flex-col items-center justify-center border-r border-[#222]">
              <span className="text-[#be0919] text-3xl lg:text-[2.5rem] font-light mb-2">500+</span>
              <span className="text-[#FFFFFF] text-[13px] capitalize tracking-wide">Project Delivered</span>
            </div>
            <div className="flex flex-col items-center justify-center">
              <span className="text-[#be0919] text-3xl lg:text-[2.5rem] font-light mb-2">200+</span>
              <span className="text-[#FFFFFF] text-[13px] capitalize tracking-wide">Global connections</span>
            </div>
          </div>
        </div>

      </div>
    </section>
  );
}
