'use client';

import Image from 'next/image';
import Title from '@/components/ui/Title';
import Button from '@/components/ui/Button';

export default function ContactForm() {
  return (
    <div className="bg-[#0d0d0d] border border-[#1f1f1f] rounded-[24px] p-4 lg:p-8 flex flex-col lg:flex-row gap-8 w-full mt-10">
      
      {/* Left Side: Live Google Map */}
      <div className="relative w-full lg:w-[40%] min-h-[400px] lg:min-h-full rounded-[16px] overflow-hidden border border-[#222]">
        <iframe
          src="https://maps.google.com/maps?q=51.50101,-0.141563&t=&z=15&ie=UTF8&iwloc=&output=embed"
          width="100%"
          height="100%"
          style={{ border: 0, position: 'absolute', top: 0, left: 0 }}
          allowFullScreen={false}
          loading="lazy"
          referrerPolicy="no-referrer-when-downgrade"
        ></iframe>
      </div>

      {/* Right Side: Form and Info Cards */}
      <div className="w-full lg:w-[60%] flex flex-col justify-between">
        
        {/* Title Section */}
        <div className="flex justify-between items-center gap-6 mb-8">
          <div className="max-w-[75%]">
            <Title as="h2" className="mb-4">
              Let's turn your next launch into a category defining <span className="text-[#be0919]">digital</span> <br className="hidden lg:block" />
              <span className="text-[#be0919]">presence.</span>
            </Title>
            <p className="text-[#FFFFFF] font-Poppins text-[0.90rem] leading-relaxed pt-5">
              Share the ambition, timeline, and scope. We will recommend the right engagement model.
            </p>
          </div>
          <div className="shrink-0 hidden sm:block">
            <Image 
              src="/assets/silver-sphere.png" 
              alt="3D Silver Sphere" 
              width={140} 
              height={140} 
              className="object-contain transition-transform duration-500 ease-out hover:scale-130"
            />
          </div>
        </div>

        {/* Form Fields */}
        <form onSubmit={(e) => e.preventDefault()} className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-8">
          {/* Left Inputs */}
          <div className="bg-[#050505] border border-[#1f1f1f] rounded-xl p-5 flex flex-col gap-5">
            <div className="flex flex-col gap-2">
              <label className="font-['Poppins',_sans-serif] text-[0.9rem] text-[#777]">Project Type</label>
              <input 
                type="text" 
                placeholder="SEO of website" 
                required
                className="bg-[#000000] border border-[#222] text-white py-3 px-4 rounded-lg text-[0.85rem] focus:outline-none focus:border-[#be0919] placeholder-[#FFFFFF]"
              />
            </div>
            
            <div className="flex flex-col gap-2">
              <label className="font-['Poppins',_sans-serif] text-[0.9rem] text-[#777]">Company Name</label>
              <input 
                type="text" 
                placeholder="your company name" 
                required
                className="bg-[#000000] border border-[#222] text-white py-3 px-4 rounded-lg text-[0.85rem] focus:outline-none focus:border-[#be0919] placeholder-[#FFFFFF]"
              />
            </div>

            <div className="flex flex-col gap-2">
              <label className="font-['Poppins',_sans-serif] text-[0.9rem] text-[#777]">Email</label>
              <input 
                type="email" 
                placeholder="name@gmail.com" 
                required
                className="bg-[#000000] border border-[#222] text-white py-3 px-4 rounded-lg text-[0.85rem] focus:outline-none focus:border-[#be0919] placeholder-[#FFFFFF]"
              />
            </div>
          </div>

          {/* Right Textarea & Button */}
          <div className="bg-[#050505] border border-[#1f1f1f] rounded-xl p-5 flex flex-col justify-between gap-4">
            <div className="flex flex-col gap-2 h-full">
              <label className="font-['Poppins',_sans-serif] text-[0.9rem] text-[#777]">Project Description</label>
              <textarea 
                placeholder="Share the ambition, timeline, and scope. We will recommend the right engagement model."
                required
                className="bg-[#000000] border border-[#222] text-white py-4 px-5 rounded-lg text-[0.85rem] focus:outline-none focus:border-[#be0919] placeholder-[#FFFFFF] resize-none h-full min-h-[120px]"
              />
            </div>
            <Button type="submit" variant="primary" className="w-full mt-2">
              Send Inquiry
            </Button>
          </div>
        </form>

        {/* 4 Info Cards Grid */}
        <div className="grid grid-cols-2 lg:grid-cols-[1fr_1.3fr_0.9fr_1.7fr] gap-3 w-full">
          
          <div className="bg-[#050505] border border-[#1f1f1f] p-4 rounded-xl flex flex-col justify-center gap-1.5">
            <div className="flex items-center gap-2 mb-1">
              <svg className="w-[14px] h-[14px] text-[#be0919]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"></path>
              </svg>
              <span className="text-[0.75rem] text-[#888] font-medium tracking-wide">Phone</span>
            </div>
            <p className="text-[0.85rem] font-medium text-white whitespace-nowrap">12345678900</p>
          </div>

          <div className="bg-[#050505] border border-[#1f1f1f] p-4 rounded-xl flex flex-col justify-center gap-1.5">
            <div className="flex items-center gap-2 mb-1">
              <svg className="w-[14px] h-[14px] text-[#be0919]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"></path>
                <polyline points="22,6 12,13 2,6"></polyline>
              </svg>
              <span className="text-[0.75rem] text-[#888] font-medium tracking-wide">Email</span>
            </div>
            <p className="text-[0.85rem] font-medium text-white whitespace-nowrap">name@gmail.com</p>
          </div>

          <div className="bg-[#050505] border border-[#1f1f1f] p-4 rounded-xl flex flex-col justify-center gap-1.5">
            <div className="flex items-center gap-2 mb-1">
              <svg className="w-[14px] h-[14px] text-[#be0919]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path>
                <circle cx="12" cy="10" r="3"></circle>
              </svg>
              <span className="text-[0.75rem] text-[#888] font-medium tracking-wide">Office</span>
            </div>
            <p className="text-[0.85rem] font-medium text-white whitespace-nowrap">London</p>
          </div>

          <div className="bg-[#050505] border border-[#1f1f1f] p-4 rounded-xl flex flex-col justify-center gap-1.5">
            <div className="flex items-center gap-2 mb-1">
              <svg className="w-[14px] h-[14px] text-[#be0919]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <rect x="2" y="2" width="20" height="20" rx="5" ry="5"></rect>
                <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"></path>
                <line x1="17.5" y1="6.5" x2="17.51" y2="6.5"></line>
              </svg>
              <span className="text-[0.75rem] text-[#888] font-medium tracking-wide">Social</span>
            </div>
            <p className="text-[0.85rem] font-medium text-white whitespace-nowrap">LinkedIn, Instagram</p>
          </div>

        </div>

      </div>
    </div>
  );
}