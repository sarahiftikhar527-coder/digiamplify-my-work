import React from 'react';
import Image from 'next/image';
import Title from '@/components/ui/Title';

export default function AboutHero() {
  return (
    <section className="flex flex-col lg:flex-row justify-between items-stretch gap-12 mb-32 relative min-h-[450px] lg:min-h-[550px]">
      
      <div className="w-full my-10 lg:w-[40%] flex flex-col justify-between z-20 py-6 lg:py-10">
        <p className="font-poppins text-[13px] leading-relaxed max-w-md text-[#FFFFFF]">
          We partner with ambitious brands to create meaningful digital experiences that drive growth and lasting impact. Through a blend of strategic thinking, creative excellence, and technical expertise, we deliver solutions designed to help businesses thrive in an increasingly digital world.
        </p>
        <Title as="h1" className="text-6xl font-inter pl-25 lg:text-[91px] tracking-wide mt-16 lg:mt-0 whitespace-nowrap">
          About <span className="text-[#be0919]">Us</span>
        </Title>
      </div>

      <div className="w-full lg:w-[55%] relative h-[400px] sm:h-[500px] lg:h-[550px] z-10">
        
        <div className="absolute inset-0 w-full h-full rounded-sm overflow-hidden">
          <Image 
            src="/assets/about/curled-black-chart.jpg" 
            alt="Curled dark paper geometry" 
            fill 
            className="object-cover object-center" 
            priority
          />
        </div>
        
        <div className="absolute top-0 left-[31%] w-[3.5%] h-full bg-[#0d0d0d] z-10"></div>
        
        <div className="absolute top-0 left-[65.5%] w-[3.5%] h-full bg-[#0d0d0d] z-10"></div>

        <div className="absolute bottom-0 left-0 w-[31%] h-[48%] bg-[#0d0d0d] z-10"></div>

        <div className="absolute bottom-0 right-0 w-[31%] h-[25%] bg-[#0d0d0d] z-10 flex items-start pt-5">
           <p className="text-[#FFFFFF] text-[12px] leading-relaxed pr-2 font-poppins">
             Empowering brands with strategic thinking, exceptional design, and results-driven innovation.
           </p>
        </div>

      </div>
    </section>
  );
}
