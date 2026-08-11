import React from 'react';
import Title from '@/components/ui/Title';
import {
  Briefcase,
  LayoutTemplate,
  Search,
  Share2,
  Bot,
  Clapperboard,
  PenTool,
  Lightbulb
} from 'lucide-react';

const servicesList = [
  { name: "B2B Marketing", icon: Briefcase, angle: 0 },
  { name: "UI/UX Design", icon: LayoutTemplate, angle: 51.43 },
  { name: "Google / Meta ADs", icon: Search, angle: 102.86 },
  { name: "Social Media Managing", icon: Share2, angle: 154.29 },
  { name: "AI Automation", icon: Bot, angle: 205.71 },
  { name: "Video Editing", icon: Clapperboard, angle: 257.14 },
  { name: "Graphic Design", icon: PenTool, angle: 308.57 },
];

export default function ServicesInteractiveCircle() {
  return (
    <section className="w-full relative py-20 lg:py-16 bg-[#080808] overflow-hidden border-b border-[#1a1a1a]">

      <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_#2d2d2d_0%,_transparent_60%)] pointer-events-none"></div>

      <div className="max-w-[1200px] mx-auto px-6 lg:px-8 relative z-10">

        <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6 mb-24 lg:mb-32">
          <Title as="h2" className="text-4xl sm:text-5xl lg:text-[55px] font-['Glacial'] leading-tight tracking-wide">
            Built Around Your Goals
          </Title>
          <p className="text-white/70 text-sm md:text-[15px] leading-relaxed max-w-[320px]">
            7 Interconnected services that work as one unified growth system for your business
          </p>
        </div>

        <div className="relative w-[300px] h-[300px] sm:w-[450px] sm:h-[450px] md:w-[550px] md:h-[550px] lg:w-[650px] lg:h-[650px] mx-auto mt-10 mb-20">

          <div className="absolute inset-0 rounded-full border-[2px] border-white/30 z-0"></div>

          {servicesList.map((service, index) => (
            <div
              key={index}
              className="absolute inset-0 z-10"
              style={{ transform: `rotate(${service.angle}deg)` }}
            >
              <div className="absolute top-0 left-1/2 w-[2px] h-[50%] border-l-[2px] border-dashed border-[#be0919]/40 -translate-x-1/2"></div>

              <div
                className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 flex flex-col items-center gap-3 w-[120px]"
                style={{ transform: `rotate(-${service.angle}deg)` }}
              >
                <div className="w-[45px] h-[45px] lg:w-[50px] lg:h-[50px] rounded-full bg-[#0d0d0d] border-[2px] border-[#be0919]/50 flex items-center justify-center shadow-[0_0_15px_rgba(190,9,25,0.15)] group hover:border-[#be0919] hover:shadow-[0_0_20px_rgba(190,9,25,0.4)] transition-all duration-300 cursor-pointer">
                  <service.icon strokeWidth={1.5} className="w-5 h-5 text-[#be0919] " />
                </div>
                <span className="text-[11px] lg:text-[13px] text-[#cccccc] text-center font-light leading-tight">
                  {service.name}
                </span>
              </div>
            </div>
          ))}

          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-20 flex items-center justify-center">
            <div className="w-[120px] h-[120px] sm:w-[140px] sm:h-[140px] lg:w-[160px] lg:h-[160px] rounded-full bg-[#0d0d0d] border-[2px] border-white/50 flex items-center justify-center p-2">
              <div className="w-full h-full rounded-full border-[2px] border-[#be0919] bg-[#0a0a0a] flex items-center justify-center shadow-[0_0_30px_rgba(190,9,25,0.2)] relative">
                <Lightbulb strokeWidth={1.2} className="w-10 h-10 lg:w-12 lg:h-12 text-[#be0919]" />
                <span className="absolute text-[#be0919] text-xl top-[35%] right-[32%] leading-none opacity-80">✦</span>
              </div>
            </div>
          </div>

        </div>
      </div>
    </section>
  );
}
