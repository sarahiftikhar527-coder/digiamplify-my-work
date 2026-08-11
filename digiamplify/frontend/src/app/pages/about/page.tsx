import React from 'react';
import AboutHero from './components/AboutHero';
import AboutAgency from './components/AboutAgency';
import AboutTimeline from './components/AboutTimeline';
import AboutMissionVision from './components/AboutMissionVision';
import AboutCollage from './components/AboutCollage';
import AboutValues from './components/AboutValues';
import Newsletter from '@/components/ui/Newsletter';

export default function AboutPage() {
  return (
    <div className="w-full bg-[#0d0d0d] min-h-screen text-white font-poppins overflow-x-hidden">
      <div className="max-w-[1200px] mx-auto pt-24 pb-20 px-6 lg:px-8 w-full">
        <AboutHero />
        <AboutAgency />
        <AboutTimeline />
        <AboutMissionVision />
        <AboutCollage />
        <AboutValues />
        <Newsletter />
      </div>
    </div>
  );
}