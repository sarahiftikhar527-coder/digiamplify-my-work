import React from 'react';

const timeline = [
  {
    year: "2023",
    title: "The Beginning",
    desc: "Founded with a vision to create digital experiences that combine strategy, creativity, and measurable business impact."
  },
  {
    year: "2024",
    title: "Evolution",
    desc: "Expanded our capabilities, refined our processes, and delivered successful websites, applications, and marketing solutions across diverse industries."
  },
  {
    year: "2025",
    title: "Acceleration",
    desc: "Strengthened our reputation through high-performing digital products, long-term client partnerships, and a commitment to exceptional execution."
  },
  {
    year: "2026",
    title: "The Future Ahead",
    desc: "Focused on shaping what's next through strategy, technology, and category-defining digital solutions."
  }
];

export default function AboutTimeline() {
  return (
    <section className="mb-32">
      <div className="bg-[#050505] border border-[#1f1f1f] rounded-3xl p-8 lg:p-14 w-full">
        
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-16 gap-6">
          <h2 className="text-3xl lg:text-[38px] font-['Glacial'] text-white leading-tight">
            Our Journey from frustration to<br className="hidden md:block"/> industry Leadership.
          </h2>
          <div className="border border-[#333] px-6 py-2.5 rounded-full text-[12px] text-[#FFFFFF]">
            Founded in 2023
          </div>
        </div>

        <div className="relative w-full">
          <div className="hidden md:block absolute right-0 top-0 bottom-0 w-[1px] bg-[#1a1a1a]"></div>
          
          <div className="flex flex-col">
            {timeline.map((item, index) => (
              <div 
                key={index} 
                className="flex flex-col md:flex-row gap-8 lg:gap-16 items-start py-8 border-b border-[#1a1a1a] last:border-b-0 relative pr-0 md:pr-12"
              >
                <div className="text-[#be0919] font-['Glacial'] font-medium text-xl lg:text-2xl w-[80px] shrink-0 pt-1">
                  {item.year}
                </div>
                
                <div className="flex flex-col flex-grow">
                  <h3 className="text-white font-semibold text-[18px] mb-3 tracking-wide">{item.title}</h3>
                  <p className="text-[#FFFFFF] text-[14px] leading-relaxed max-w-3xl">
                    {item.desc}
                  </p>
                </div>

                <div className="hidden md:block absolute right-[-4px] top-[40px] w-[9px] h-[9px] bg-[#be0919] rounded-full shadow-[0_0_10px_rgba(190,9,25,0.8)]"></div>
              </div>
            ))}
          </div>
        </div>
        
      </div>
    </section>
  );
}
