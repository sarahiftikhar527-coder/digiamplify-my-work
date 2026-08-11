import React from 'react';
import Image from 'next/image';
import Title from '@/components/ui/Title';

export default function ServicesHero() {
  return (
    <section className="relative w-full h-[450px] lg:h-[500px] bg-[#050505] overflow-hidden mb-15 mt-10 flex items-center border-b border-[#1a1a1a]">

      <div className="absolute top-0 left-0 w-[200px] lg:w-[300px] h-full bg-gradient-to-r from-[#be0919]/40 via-[#be0919]/5 to-transparent pointer-events-none z-0"></div>

      <div className="relative z-20 w-full max-w-[1200px] mx-auto px-6 lg:px-8 h-full flex flex-col justify-center">

        <div className="w-full lg:w-[50%] flex flex-col justify-center gap-10 lg:gap-16 relative z-30 lg:pl-12 mb-16">

          <p className="text-[#FFFFFF] text-[13px] leading-[1.8] max-w-[420px]">
            We partner with ambitious brands to create meaningful digital experiences that drive growth and lasting impact. Through a blend of strategic thinking, creative excellence, and technical expertise, we deliver solutions designed to help businesses thrive in an increasingly digital world.
          </p>

          <Title as="h1" className="text-5xl sm:text-6xl lg:text-[91px] font-['Glacial'] leading-none whitespace-nowrap">
            Our <span className="text-[#be0919]">Services</span>
          </Title>

        </div>
      </div>

      <div className="absolute top-0 right-0 w-[55%] lg:w-[40%] h-full z-10 pointer-events-none hidden md:block">

        <div
          className="absolute inset-0 right-[-100px] bg-[#1a1a1a]"
          style={{ clipPath: 'polygon(120px 0, 100% 0, 100% 100%, 120px 100%, 0 35%)' }}
        ></div>

        <div
          className="absolute inset-0 right-[-100px]"
          style={{
            clipPath: 'polygon(120px 0, 100% 0, 100% 100%, 120px 100%, 0 35%)',
            transform: 'translateX(40px)',
            background: 'linear-gradient(to bottom, transparent 22%, #be0919 22%, #be0919 78%, transparent 78%)'
          }}
        ></div>

        <div
          className="absolute inset-0 right-[-100px]"
          style={{
            clipPath: 'polygon(120px 0, 100% 0, 100% 100%, 120px 100%, 0 35%)',
            transform: 'translateX(70px)'
          }}
        >
          <Image
            src="/assets/services/services-hero.jpg"
            alt="Team joining hands"
            fill
            className="object-cover grayscale"
            priority
          />
        </div>

      </div>

    </section>
  );
}
