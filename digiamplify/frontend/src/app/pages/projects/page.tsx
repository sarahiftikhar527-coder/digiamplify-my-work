import React from 'react';
import ProjectsHero from './components/ProjectsHero';
import ProjectsRecentWork from './components/ProjectsRecentWork';
import ProjectsOther from './components/ProjectsOther';
import Newsletter from '@/components/ui/Newsletter';

export default function ProjectsPage() {
  return (
    <div className="w-full bg-[#0d0d0d] min-h-screen text-white font-poppins overflow-x-hidden">
      <ProjectsHero />
      <div className="max-w-[1200px] mx-auto px-6 lg:px-8 w-full pb-20">
        <ProjectsRecentWork />
        <ProjectsOther />
        <Newsletter />
      </div>
    </div>
  );
}