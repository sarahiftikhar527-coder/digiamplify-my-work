import React from 'react';
import Title from '@/components/ui/Title';
import Button from '@/components/ui/Button';

export default function Newsletter() {
  return (
    <div className="w-full">
      <section className="mt-20 bg-[#0a0a0a] border border-[#1f1f1f] rounded-2xl py-10 px-8 lg:px-12 flex flex-col lg:flex-row justify-between items-start lg:items-center gap-8 w-full">
        <div className="max-w-xl">
          <Title as="h3" className="mb-2 text-white">
            The Quarterly note for ambitious brands
          </Title>
          <p className="text-[#a3a3a3] text-[0.85rem] leading-relaxed">
            Occasional insight in digital positioning, launch strategy and premium experience Design.
          </p>
        </div>
        <div className="flex flex-col sm:flex-row gap-4 w-full lg:w-auto shrink-0">
          <input 
            type="email" 
            placeholder="Enter your Email" 
            className="bg-transparent border border-[#333] text-white py-3 px-6 rounded-full w-full sm:w-[280px] text-[0.85rem] focus:outline-none focus:border-[#be0919]" 
          />
          <Button variant="subscribe" className="w-full sm:w-auto">
            Subscribe
          </Button>
        </div>
      </section>
      
      <p className="text-left text-[#555] text-[0.85rem] mt-6 px-2 lg:px-4 w-full">
        We respect your inbox. No noise. No spam. Only strategic perspective.
      </p>
    </div>
  );
}