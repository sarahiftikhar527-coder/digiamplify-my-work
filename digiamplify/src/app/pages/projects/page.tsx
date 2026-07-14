import Image from 'next/image';
import Title from '@/components/ui/Title';
import Newsletter from '@/components/ui/Newsletter';

export default function ProjectsPage() {
  const filters = ["All", "Website", "Design", "Poster", "Ad campaign"];

  const otherProjects = [
    { id: "01", title: "Website Payment gateway", desc: "Develop a fully functional e-commerce website where users can browsers products.", image: "/assets/project-thumb-1.jpg" },
    { id: "02", title: "Website Payment gateway", desc: "Develop a fully functional e-commerce website where users can browsers products.", image: "/assets/project-thumb-2.jpg" },
    { id: "03", title: "Website Payment gateway", desc: "Develop a fully functional e-commerce website where users can browsers products.", image: "/assets/project-thumb-3.jpg" },
    { id: "04", title: "Website Payment gateway", desc: "Develop a fully functional e-commerce website where users can browsers products.", image: "/assets/project-thumb-4.jpg" },
    { id: "05", title: "Website Payment gateway", desc: "Develop a fully functional e-commerce website where users can browsers products.", image: "/assets/project-thumb-5.jpg" },
    { id: "06", title: "Website Payment gateway", desc: "Develop a fully functional e-commerce website where users can browsers products.", image: "/assets/project-thumb-6.jpg" },
  ];

  return (
    <div className="w-full bg-[#0d0d0d] min-h-screen text-white font-poppins overflow-x-hidden">

      {/* --- Hero Section --- */}
      <section className="relative w-full h-[550px] lg:h-[650px] bg-[#050505] overflow-hidden mb-20 mt-10">

        {/* Main Image */}
        <div
          className="absolute top-0 right-0 w-[42%] h-full overflow-hidden z-0"
          style={{ clipPath: 'polygon(0 0, 100% 0, 100% 100%, 236px 100%)' }}
        >
          <Image
            src="/assets/hero-projects.jpg"
            alt="Team working"
            fill
            className="object-cover"
            style={{ objectPosition: '75% center' }}
            priority
          />
          <div className="absolute inset-0 bg-[#050505]/20"></div>
        </div>

        {/* Top Right Red Bar */}
        <div
          className="absolute top-0 right-0 w-[130px] h-[90px] bg-[#be0919] z-10"
          style={{ clipPath: 'polygon(0 0, 100% 0, 100% 100%, 55px 100%)' }}
        ></div>

        {/* Text Content */}
        <div className="relative z-20 w-full max-w-[1200px] mx-auto px-6 lg:px-10 h-full flex flex-col justify-center">
          <div className="w-full lg:w-[55%] mb-30">
            <h1 className="text-4xl sm:text-5xl lg:text-[50px] font-['Glacial'] leading-[1.1] mb-8 text-white">
              A showcase of projects<br />
              crafted for real <span className="text-[#be0919]">business<br />impact</span>
            </h1>
            <p className="text-white/50 text-[13px] leading-relaxed max-w-md">
              Our portfolio showcases a carefully curated selection of projects that reflect our creativity, strategy, and technical expertise. Each work is designed with a focus on performance, user experience, and measurable results. We aim to deliver solutions that not only look exceptional but also create real business impact. This collection represents our commitment to quality, innovation, and continuous improvement.
            </p>
          </div>
        </div>

        {/* Bottom Geometric Bars */}
        <div className="absolute bottom-[8%] left-0 w-full z-30 pointer-events-none hidden lg:block">
          <div className="max-w-[1200px] mx-auto px-6 lg:px-8 relative h-[130px]">

            {/* Grey horizontal bar */}
            <div className="absolute left-0 bottom-0 w-[300px] lg:w-[750px] h-[40px] bg-[#2a2a2a]"
            style={{ clipPath: 'polygon(0 0, calc(100% - 15px) 0, 100% 100%, 0 100%)' }}
            ></div>

            {/* Vertical slanted boxes */}
            <div className="absolute left-[360px] lg:left-[730px] bottom-0 flex flex-col items-start">
              <div className="w-[70px] h-[90px] bg-[#333] skew-x-[20deg] ml-[40px]"></div>
              <div className="w-[70px] h-[90px] bg-[#be0919] skew-x-[20deg] mt-[10px] ml-[75px]"></div>
            </div>

          </div>
        </div>

      </section>

      <div className="max-w-[1200px] mx-auto px-6 lg:px-8 w-full pb-20">

        {/* --- Recent Work Section --- */}
        <section className="mb-25">
          {/* Section Header & Filters */}
          <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center mb-10 gap-6">
            <Title as="h2" className="text-3xl lg:text-[2.2rem] font-['Glacial']">
              Our recent <span className="text-[#be0919]">work</span>
            </Title>

            <div className="flex flex-wrap items-center gap-3 bg-[#050505] p-2 rounded-full border border-[#1f1f1f]">
              {filters.map((filter, idx) => (
                <button
                  key={idx}
                  className={`px-5 py-2 rounded-full text-[16px] transition-colors ${idx === 0
                    ? 'bg-[#be0919] text-white font-medium shadow-[0_0_10px_rgba(190,9,25,0.4)]'
                    : 'text-[#888] hover:text-white hover:bg-[#1a1a1a]'
                    }`}
                >
                  {filter}
                </button>
              ))}
            </div>
          </div>

          {/* Featured Project Bento Box */}
          <div className="flex flex-col lg:flex-row gap-5 items-stretch">
            {/* Left: Main Image */}
            <div className="w-full lg:w-[65%] relative min-h-[350px] rounded-3xl overflow-hidden border border-[#222]">
              <Image src="/assets/featured-code.jpg" alt="Featured code project" fill className="object-cover" />
            </div>

            {/* Right: Info Cards */}
            <div className="w-full lg:w-[35%] flex flex-col gap-5">

              {/* Description Card */}
              <div className="bg-[#050505] border border-[#1f1f1f] rounded-3xl p-8 flex-grow flex flex-col justify-center">
                <h3 className="text-[#be0919] text-[18px] font-medium mb-4">Description</h3>
                <p className="text-white text-[14px] leading-relaxed">
                  Transforming designs into responsive, user-centric interfaces with clean code delivering fast, aesthetic, and accessible experiences across all devices and browsers.
                </p>
              </div>

              {/* Platform Result Card */}
              <div className="bg-[#050505] border border-[#1f1f1f] rounded-3xl p-8 flex-grow flex flex-col justify-center relative overflow-hidden">
                <h3 className="text-[#777] text-[14px] mb-6">Platform Result</h3>

                <div className="flex flex-col gap-4">
                  <div>
                    <div className="text-[#be0919] text-[30px] font-['Glacial'] text-2xl font-light mb-1">4.9</div>
                    <div className="text-[#FFFFFF] text-[12px]">Client Satisfaction score average</div>
                  </div>
                  <div>
                    <div className="text-[#be0919] text-[30px] font-['Glacial'] text-2xl font-light mb-1">2.3 <span className="text-[12px]">x</span></div>
                    <div className="text-[#FFFFFF] text-[12px]">Average actions past campaign</div>
                  </div>
                </div>

                {/* Tiny CSS Bar Chart simulating the design */}
                <div className="absolute bottom-8 right-8 flex items-end gap-[3px] h-10">
                  <div className="w-2 h-[30%] bg-[#333] rounded-t-sm"></div>
                  <div className="w-2 h-[50%] bg-[#555] rounded-t-sm"></div>
                  <div className="w-2 h-[70%] bg-[#777] rounded-t-sm"></div>
                  <div className="w-2 h-[85%] bg-[#be0919] rounded-t-sm"></div>
                  <div className="w-2 h-[100%] bg-[#be0919] rounded-t-sm"></div>
                </div>
              </div>

            </div>
          </div>
        </section>


        {/* --- Other Projects Section --- */}
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
                {/* Background Image Setup */}
                <Image
                  src={project.image}
                  alt={project.title}
                  fill
                  className="object-cover group-hover:scale-105 transition-transform duration-500"
                />

                {/* Dark Gradient Overlay */}
                <div className="absolute inset-0 bg-gradient-to-t from-[#111111] via-[#1a1a1a]/85 to-[#262626]/50"></div>

                {/* Content */}
                <div className="absolute inset-0 p-6 flex flex-col justify-end">
                  <span className="text-white text-[63px] font-['Glacial'] text-4xl font-bold mb-2">{project.id}</span>
                  <h4 className="text-white text-[22px] font-medium mb-2">{project.title}</h4>
                  <p className="text-[#FFFFFF] text-[16px] font-poppins leading-relaxed mb-5 pr-4">
                    {project.desc}
                  </p>

                  {/* Red Arrow Button */}
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

        {/* --- Newsletter Component --- */}
        <Newsletter />

      </div>
    </div>
  );
}