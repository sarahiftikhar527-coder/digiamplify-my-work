import React from 'react';
import Image from 'next/image';
import Title from '@/components/ui/Title';

const otherProjects = [
  { id: "01", title: "AI Analytics Dashboard", desc: "Build an intuitive real-time dashboard for tracking complex platform metrics.", image: "/assets/projects/project-thumb-1.jpg" },
  { id: "02", title: "E-Commerce Shopping App", desc: "Design a modern mobile store with seamless checkout and product discovery.", image: "/assets/projects/project-thumb-2.jpg" },
  { id: "03", title: "SaaS Workflow Manager", desc: "Create a scalable automation platform to streamline team task management.", image: "/assets/projects/project-thumb-3.jpg" },
  { id: "04", title: "Fintech Mobile Wallet", desc: "Engineer a secure digital wallet supporting instant peer-to-peer transfers.", image: "/assets/projects/project-thumb-4.jpg" },
  { id: "05", title: "Healthcare Booking Hub", desc: "Develop a secure healthcare platform for effortless appointment scheduling.", image: "/assets/projects/project-thumb-5.jpg" },
  { id: "06", title: "Real Estate Portal App", desc: "Construct an interactive property platform featuring advanced filter search.", image: "/assets/projects/project-thumb-6.jpg" },
];

export default function ProjectsOther() {
  return (
    <section className="mb-20">
      <div className="flex justify-center mb-12">
        <Title as="h2" className="text-3xl lg:text-[37px] font-['Glacial']">
          Other <span className="text-[#be0919]">Projects</span>
        </Title>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {otherProjects.map((project, idx) => (
          <div
            key={idx}
            className="relative h-[280px] lg:h-[320px] rounded-2xl overflow-hidden group border border-[#1f1f1f] cursor-pointer"
          >
            <Image
              src={project.image}
              alt={project.title}
              fill
              className="object-cover group-hover:scale-105 transition-transform duration-500"
            />

            <div className="absolute inset-0 bg-gradient-to-t from-[#111111] via-[#1a1a1a]/85 to-[#262626]/50"></div>

            <div className="absolute inset-0 p-6 flex flex-col justify-end">
              <span className="text-white text-[63px] font-['Glacial'] text-4xl font-bold mb-2">{project.id}</span>
              <h4 className="text-white text-[22px] font-medium mb-2">{project.title}</h4>
              <p className="text-[#FFFFFF] text-[16px] font-poppins leading-relaxed mb-5 pr-4">
                {project.desc}
              </p>

              <button className="w-10 h-7 bg-[#be0919] rounded flex items-center justify-center hover:bg-white hover:text-[#be0919] transition-colors text-white mt-auto self-start">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M5 12h14M12 5l7 7-7 7" />
                </svg>
              </button>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
