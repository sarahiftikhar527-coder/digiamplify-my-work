import Image from 'next/image';
import Title from '@/components/ui/Title';
import Newsletter from '@/components/ui/Newsletter';

import { 
  Briefcase, 
  LayoutTemplate, 
  Search, 
  Share2, 
  Bot, 
  Clapperboard, 
  PenTool,
  Lightbulb,
  Compass, 
  FileSearch, 
  Layers, 
  MousePointer2, 
  Gauge, 
  TrendingUp,
  ArrowUpRight,
  ArrowRight
} from 'lucide-react';

const servicesList = [
  { name: "B2B Marketing", icon: Briefcase, angle: 0 },
  { name: "UI/UX Design", icon: LayoutTemplate, angle: 51.43 },
  { name: "Google / Meta ADs", icon: Search, angle: 102.86 },
  { name: "Social Media Managing", icon: Share2, angle: 154.29 },
  { name: "AI Automation", icon: Bot, angle: 205.71 },
  { name: "Video Editing", icon: Clapperboard, angle: 257.14 },
  { name: "Graphic Design", icon: PenTool, angle: 308.57 },
];

const processSteps = [
  {
    num: "01",
    title: "Discovery",
    desc: "We dive deep into your business landscape, uncovering core challenges, identifying key opportunities, and defining the true purpose of your project.",
    icon: Compass,
  },
  {
    num: "02",
    title: "Research",
    desc: "We analyze market trends, study competitor strategies, and gather crucial user insights to ensure our decisions are backed by hard data.",
    icon: FileSearch,
  },
  {
    num: "03",
    title: "Strategy",
    desc: "We craft a comprehensive roadmap, aligning creative concepts with technical requirements to set a clear, actionable path toward your specific objectives.",
    icon: Layers,
  },
  {
    num: "04",
    title: "Execution",
    desc: "We bring the vision to life through precise design and rigorous development, building scalable solutions tailored exactly to your brand's needs.",
    icon: MousePointer2,
  },
  {
    num: "05",
    title: "Optimization",
    desc: "We continuously test, refine, and enhance performance metrics to ensure your digital assets are running at their absolute highest potential.",
    icon: Gauge,
  },
  {
    num: "06",
    title: "Growth",
    desc: "We leverage ongoing insights and advanced marketing tactics to scale your reach, maximize return on investment, and secure sustainable, long-term success.",
    icon: TrendingUp,
  },
];

const caseStudies = [
  {
    title: "Scale Force SaaS",
    category: "B2B Software",
    challenge: "Complex navigation and outdated interfaces were causing user drop-offs, ultimately hurting their overall product adoption.",
    strategy: "Extensive UX research, rapid wireframing, and high-fidelity UI design to balance modern aesthetics with usability.",
    results: [
      { value: "98%", label: "Growth" },
      { value: "6.2%", label: "Reduction" },
      { value: "8 mo", label: "Time to Result" }
    ],
    image: "/assets/services-case-1.jpg" 
  },
  {
    title: "Nexus Cloud ERP",
    category: "Enterprise Tech",
    challenge: "Disjointed legacy systems and slow processing speeds created massive operational bottlenecks for their global workforce.",
    strategy: "Agile development sprints, scalable cloud architecture, and streamlined data flows to ensure precision and reliability.",
    results: [
      { value: "150%", label: "Increase" },
      { value: "3.5x", label: "Engagement" },
      { value: "6 mo", label: "Time to Launch" }
    ],
    image: "/assets/services-case-2.jpg" 
  }
];

export default function ServicesPage() {
  return (
    <div className="w-full bg-[#050505] min-h-screen font-poppins overflow-x-hidden text-white">
      
      {/* Services Hero Section */}
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
                src="/assets/services-hero.jpg" 
                alt="Team joining hands" 
                fill 
                className="object-cover grayscale" 
                priority 
              />
           </div>

        </div>

      </section>

      {/* Goals Section */}

      <section className="w-full relative py-20 lg:py-16 bg-[#080808] overflow-hidden border-b border-[#1a1a1a]">
        
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_#2d2d2d_0%,_transparent_60%)] pointer-events-none"></div>

        <div className="max-w-[1200px] mx-auto px-6 lg:px-8 relative z-10">
          
          <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6 mb-24 lg:mb-32">
            <Title as="h2" className="text-4xl sm:text-5xl lg:text-[55px] font-['Glacial'] leading-tight tracking-wide">
              Built Around Your Goals
            </Title>
            <p className="text-white/70 text-sm md:text-[15px] leading-relaxed max-w-[320px]">
              7 Interconnected services that work as one unified growth system for your business
            </p>
          </div>

          <div className="relative w-[300px] h-[300px] sm:w-[450px] sm:h-[450px] md:w-[550px] md:h-[550px] lg:w-[650px] lg:h-[650px] mx-auto mt-10 mb-20">
            
            <div className="absolute inset-0 rounded-full border-[2px] border-white/30 z-0"></div>

            {servicesList.map((service, index) => (
              <div 
                key={index}
                className="absolute inset-0 z-10"
                style={{ transform: `rotate(${service.angle}deg)` }}
              >
                <div className="absolute top-0 left-1/2 w-[2px] h-[50%] border-l-[2px] border-dashed border-[#be0919]/40 -translate-x-1/2"></div>
                
                <div 
                  className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 flex flex-col items-center gap-3 w-[120px]"
                  style={{ transform: `rotate(-${service.angle}deg)` }} 
                >
                  <div className="w-[45px] h-[45px] lg:w-[50px] lg:h-[50px] rounded-full bg-[#0d0d0d] border-[2px] border-[#be0919]/50 flex items-center justify-center shadow-[0_0_15px_rgba(190,9,25,0.15)] group hover:border-[#be0919] hover:shadow-[0_0_20px_rgba(190,9,25,0.4)] transition-all duration-300 cursor-pointer">
                    <service.icon strokeWidth={1.5} className="w-5 h-5 text-[#be0919] " />
                  </div>
                  <span className="text-[11px] lg:text-[13px] text-[#cccccc] text-center font-light leading-tight">
                    {service.name}
                  </span>
                </div>
              </div>
            ))}

            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-20 flex items-center justify-center">
              <div className="w-[120px] h-[120px] sm:w-[140px] sm:h-[140px] lg:w-[160px] lg:h-[160px] rounded-full bg-[#0d0d0d] border-[2px] border-white/50 flex items-center justify-center p-2">
                <div className="w-full h-full rounded-full border-[2px] border-[#be0919] bg-[#0a0a0a] flex items-center justify-center shadow-[0_0_30px_rgba(190,9,25,0.2)] relative">
                  <Lightbulb strokeWidth={1.2} className="w-10 h-10 lg:w-12 lg:h-12 text-[#be0919]" />
                  <span className="absolute text-[#be0919] text-xl top-[35%] right-[32%] leading-none opacity-80">✦</span>
                </div>
              </div>
            </div>

          </div>
        </div>
      </section>


      {/* Solution Steps Section */}

      <section className="w-full relative pt-10 pb-18 bg-[#050505] border-t border-white/30">
        <div className="max-w-[1200px] mx-auto px-6 lg:px-8 relative z-10">
          
          <div className="flex flex-col lg:flex-row justify-between items-center gap-12 lg:gap-8 mb-20">
            
            <div className="w-full lg:w-[60%]">
              <Title as="h2" className="text-4xl sm:text-5xl lg:text-[45px] font-['Glacial'] leading-tight mb-6">
                Solutions built for <span className="text-[#be0919]">modern brands</span>.
              </Title>
              <p className="text-[#ffffff] text-[15px] leading-[1.8] max-w-[650px]">
                We combine strategy, creativity, and technology to build solutions that help brands grow with confidence. From marketing and design to automation and digital experiences, every service is crafted to deliver measurable impact. Our focus is on creating meaningful results that drive long term success and sustainable business growth.
              </p>
            </div>

            <div className="w-full lg:w-[40%] flex justify-center lg:justify-end">
              <div className="relative w-[100px] h-[100px] sm:w-[250px] sm:h-[250px]">
                <Image 
                  src="/assets/abstract-sphere.png" 
                  alt="Abstract 3D Shape" 
                  fill 
                  className="object-contain transition-transform duration-500 ease-out hover:scale-140"
                />
              </div>
            </div>

          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-[1px] bg-[#222] border border-[#222] rounded-2xl overflow-hidden">
            
            {processSteps.map((step, index) => (
              <div 
                key={index} 
                className="bg-[#0a0a0a] p-8 lg:p-10 relative flex flex-col group hover:bg-[#0f0f0f] transition-colors duration-300 transition-transform duration-500 ease-out hover:scale-110"
              >
                
                <span className="absolute top-4 right-6 text-[80px] leading-none font-black text-white/30 z-0 select-none pointer-events-none">
                  {step.num}
                </span>

                <div className="relative z-10 flex flex-col h-full">
                  
                  <div className="w-11 h-11 rounded-full border-[2px] border-[#be0919]/30 bg-[#be0919]/5 flex items-center justify-center mb-8">
                    <step.icon strokeWidth={1.5} className="w-7 h-7 text-[#be0919]" />
                  </div>

                  <h3 className="text-[19px] font-bold text-white mb-4 tracking-wide">
                    {step.title}
                  </h3>

                  <p className="text-white/70 text-[13px] leading-[1.7]">
                    {step.desc}
                  </p>
                  
                </div>

              </div>
            ))}

          </div>

        </div>
      </section>


      {/* Real Clients Real Results Section */}

      <section className="w-full relative pt-10 pb-4 bg-[#0a0a0a] overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_#1f1f1f_0%,_transparent_70%)] pointer-events-none z-0"></div>

        <div className="max-w-[1200px] mx-auto px-6 lg:px-8 relative z-10">
          
          <div className="flex flex-col lg:flex-row justify-between items-start lg:items-end gap-8 mb-16">
            <div className="max-w-[700px]">
              <Title as="h2" className="text-4xl sm:text-5xl lg:text-[50px] font-['Glacial'] leading-tight mb-6">
                Real Clients <span className="text-[#be0919]">Real Results</span>.
              </Title>
              <p className="text-[#ffffff] text-[15px] leading-[1.8]">
                Trusted by growing brands and established businesses alike, we focus on delivering measurable outcomes that make a lasting impact. Every project is driven by strategy, creativity, and performance, helping our clients achieve meaningful growth and long-term success.
              </p>
            </div>
            
            <button className="px-8 py-3 rounded-full border border-[#be0919] text-[#be0919] hover:bg-[#be0919] hover:text-white transition-all duration-300 text-sm tracking-wide whitespace-nowrap">
              Read All case study
            </button>
          </div>

          {/* Case Studies Cards */}
          <div className="flex flex-col gap-8">
            {caseStudies.map((study, index) => (
              <div 
                key={index} 
                className="flex flex-col lg:flex-row bg-[#0c0c0c] border border-[#222] rounded-2xl overflow-hidden group hover:border-[#444] transition-colors duration-500"
              >
                
                <div className="w-full lg:w-[28%] relative h-[250px] lg:h-auto overflow-hidden">
                  <Image 
                    src={study.image} 
                    alt={study.title} 
                    fill 
                    className="object-cover group-hover:scale-105 transition-transform duration-700"
                  />
                </div>

                <div className="w-full lg:w-[72%] py-6 px-8 lg:py-7 lg:px-10 flex flex-col justify-between">
                  
                  <div className="flex justify-between items-start mb-8">
                    <div>
                      <h3 className="text-[25px] font-['Glacial'] text-white tracking-wide">
                        {study.title}
                      </h3>
                      <p className="text-[#be0919] text-[15px] mt-1">
                        {study.category}
                      </p>
                    </div>
                    
                    <button className="hidden md:flex items-center gap-2 text-[#be0919] text-sm hover:text-white transition-colors group/link">
                      Read full case study 
                      <ArrowUpRight className="w-4 h-4 group-hover/link:-translate-y-0.5 group-hover/link:translate-x-0.5 transition-transform" />
                    </button>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-8 md:gap-12 mb-8">

                    <div>
                      <h4 className="text-white/50 text-[18px] font-['Glacial'] mb-3">Challenges</h4>
                      <p className="text-white/80 text-[13px] leading-relaxed">
                        {study.challenge}
                      </p>
                    </div>

                    <div>
                      <h4 className="text-white/50 text-[18px] font-['Glacial'] mb-3">Strategy</h4>
                      <p className="text-white/80 text-[13px] leading-relaxed">
                        {study.strategy}
                      </p>
                    </div>

                    <div>
                      <h4 className="text-white/50 text-[18px] font-['Glacial'] mb-3">Results</h4>
                      <div className="flex flex-col gap-2.5">
                        {study.results.map((res, i) => (
                          <div key={i} className="flex items-center gap-3">
                            <span className="text-[#be0919] font-medium w-[45px]">
                              {res.value}
                            </span>
                            <span className="text-white/80 text-[13px]">
                              {res.label}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>

                  <div className="flex justify-end gap-3 mt-auto">
                    <button className="w-8 h-8 rounded-full bg-[#dfdfdf] flex items-center justify-center hover:bg-white transition-colors cursor-pointer"></button>
                    <button className="w-8 h-8 rounded-full bg-[#be0919] flex items-center justify-center hover:bg-red-700 transition-colors cursor-pointer">
                      <ArrowRight className="w-4 h-4 text-white -rotate-45" />
                    </button>
                  </div>

                </div>
              </div>
            ))}
          </div>

          {/* Bottom Divider Line */}
          <div className="w-full h-[1.5px] bg-white/50 mt-14"></div>

        </div>
        
      </section>
    
    {/* Reusable Newsletter Section */}

    <div className="max-w-[1200px] mx-auto px-6 lg:px-8 w-full pb-20">
        <Newsletter />
    </div>

    </div>


  );
}