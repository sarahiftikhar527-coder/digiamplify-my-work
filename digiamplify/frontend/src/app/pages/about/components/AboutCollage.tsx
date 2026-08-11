import React from 'react';
import Image from 'next/image';
import Title from '@/components/ui/Title';

export default function AboutCollage() {
  return (
    <section className="mb-32">
      <div className="bg-[#050505] border border-[#1f1f1f] rounded-3xl p-8 lg:p-12 w-full">
        
        <div className="mb-10">
          <span className="text-white/50 text-[18px] tracking-wide mb-2 block">
            What makes us Different
          </span>
          <Title as="h2" className="text-3xl lg:text-[38px] font-['Glacial'] text-white">
            Six discipline, one coherent System
          </Title>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 lg:gap-5 auto-rows-[180px] lg:auto-rows-[160px]">
          
          <div className="md:col-span-2 md:row-span-2 relative rounded-2xl overflow-hidden border border-[#222]">
            <Image src="/assets/about/collage-1.jpg" alt="Red keyboard" fill className="object-cover transition-transform duration-500 ease-out hover:scale-110" />
          </div>
          
          <div className="md:col-span-1 md:row-span-1 relative rounded-2xl overflow-hidden border border-[#222]">
            <Image src="/assets/about/collage-2.jpg" alt="Code screen" fill className="object-cover transition-transform duration-500 ease-out hover:scale-110" />
          </div>
          
          <div className="md:col-span-1 md:row-span-1 relative rounded-2xl overflow-hidden border border-[#222]">
            <Image src="/assets/about/collage-3.jpg" alt="Abstract red room" fill className="object-cover transition-transform duration-500 ease-out hover:scale-110" />
          </div>
          
          <div className="md:col-span-1 md:row-span-1 relative rounded-2xl overflow-hidden border border-[#222]">
            <Image src="/assets/about/collage-4.jpg" alt="3D shapes" fill className="object-cover transition-transform duration-500 ease-out hover:scale-110" />
          </div>
          
          <div className="md:col-span-1 md:row-span-1 relative rounded-2xl overflow-hidden border border-[#222]">
            <Image src="/assets/about/collage-5.jpg" alt="Red light grid" fill className="object-cover transition-transform duration-500 ease-out hover:scale-110" />
          </div>
          
          <div className="md:col-span-1 md:row-span-1 relative rounded-2xl overflow-hidden border border-[#222]">
            <Image src="/assets/about/collage-6.jpg" alt="AI Brain" fill className="object-cover transition-transform duration-500 ease-out hover:scale-110" />
          </div>
          
        </div>
      </div>
    </section>
  );
}
