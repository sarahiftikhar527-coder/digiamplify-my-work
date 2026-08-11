import React from 'react';
import Image from 'next/image';
import Button from '@/components/ui/Button';

export default function BlogSearch() {
  return (
    <div className="flex flex-col md:flex-row justify-between items-center gap-8 mb-16">
      
      <div className="relative w-full md:w-[420px]">
        <input 
          type="text" 
          placeholder="Search blog..." 
          className="bg-transparent border border-2 border-[#FFFFFF] text-white py-2 pl-10 pr-[140px] rounded-full w-full text-[16px] focus:outline-none focus:border-[#aaa] transition-colors font-poppins"
        />
     
        <Button 
          variant="primary" 
          className="absolute top-0 right-0 h-full px-10 rounded-full"
        >
          Search
        </Button>
      </div>

      <div className="hidden md:block shrink-0">
        <Image 
          src="/assets/blog/silver-ring.png" 
          alt="3D Silver Ring" 
          width={228} 
          height={222} 
          className="object-contain -rotate-100 n hover:scale-105 transition-transform duration-700 animate-[spin_30s_linear_infinite] -rotate-[25deg]"
        />
      </div>
    </div>
  );
}
