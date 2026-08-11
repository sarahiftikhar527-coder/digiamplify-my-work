import React from 'react';
import ServicesHero from './components/ServicesHero';
import ServicesInteractiveCircle from './components/ServicesInteractiveCircle';
import ServicesSolutions from './components/ServicesSolutions';
import ServicesCaseStudies from './components/ServicesCaseStudies';
import Newsletter from '@/components/ui/Newsletter';

export default function ServicesPage() {
  return (
    <div className="w-full bg-[#050505] min-h-screen font-poppins overflow-x-hidden text-white">
      <ServicesHero />
      <ServicesInteractiveCircle />
      <ServicesSolutions />
      <ServicesCaseStudies />
      <div className="max-w-[1200px] mx-auto px-6 lg:px-8 w-full pb-20">
        <Newsletter />
      </div>
    </div>
  );
}