import Image from 'next/image';
import Title from '@/components/ui/Title';
import Newsletter from '@/components/ui/Newsletter';

export default function AboutPage() {

  const timeline = [
    {
      year: "2023",
      title: "The Beginning",
      desc: "Founded with a vision to create digital experiences that combine strategy, creativity, and measurable business impact."
    },
    {
      year: "2024",
      title: "Evolution",
      desc: "Expanded our capabilities, refined our processes, and delivered successful websites, applications, and marketing solutions across diverse industries."
    },
    {
      year: "2025",
      title: "Acceleration",
      desc: "Strengthened our reputation through high-performing digital products, long-term client partnerships, and a commitment to exceptional execution."
    },
    {
      year: "2026",
      title: "The Future Ahead",
      desc: "Focused on shaping what's next through strategy, technology, and category-defining digital solutions."
    }
  ];

  const valuesData = [
    {
      title: "Innovation",
      icon: (
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
          <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"></path>
          <polyline points="3.27 6.96 12 12.01 20.73 6.96"></polyline>
          <line x1="12" y1="22.08" x2="12" y2="12"></line>
        </svg>
      )
    },
    {
      title: "Collaboration",
      icon: (
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
          <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path>
          <circle cx="9" cy="7" r="4"></circle>
          <path d="M23 21v-2a4 4 0 0 0-3-3.87"></path>
          <path d="M16 3.13a4 4 0 0 1 0 7.75"></path>
        </svg>
      )
    },
    {
      title: "Transparency",
      icon: (
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
          <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path>
          <circle cx="12" cy="12" r="3"></circle>
        </svg>
      )
    },
    {
      title: "Excellence",
      icon: (
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
          <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"></polygon>
        </svg>
      )
    },
    {
      title: "Growth",
      icon: (
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
          <polyline points="23 6 13.5 15.5 8.5 10.5 1 18"></polyline>
          <polyline points="17 6 23 6 23 12"></polyline>
        </svg>
      )
    }
  ];

  return (
    <div className="w-full bg-[#0d0d0d] min-h-screen text-white font-poppins overflow-x-hidden">
      <div className="max-w-[1200px] mx-auto pt-24 pb-20 px-6 lg:px-8 w-full">
        
        {}
        <section className="flex flex-col lg:flex-row justify-between items-stretch gap-12 mb-32 relative min-h-[450px] lg:min-h-[550px]">
          
          <div className="w-full my-10 lg:w-[40%] flex flex-col justify-between z-20 py-6 lg:py-10">
            <p className="font-poppins text-[13px] leading-relaxed max-w-md text-[#FFFFFF]">
              We partner with ambitious brands to create meaningful digital experiences that drive growth and lasting impact. Through a blend of strategic thinking, creative excellence, and technical expertise, we deliver solutions designed to help businesses thrive in an increasingly digital world.
            </p>
            <Title as="h1" className="text-6xl font-inter pl-25 lg:text-[91px] tracking-wide mt-16 lg:mt-0 whitespace-nowrap">
              About <span className="text-[#be0919]">Us</span>
            </Title>
          </div>

          <div className="w-full lg:w-[55%] relative h-[400px] sm:h-[500px] lg:h-[550px] z-10">
            
            <div className="absolute inset-0 w-full h-full rounded-sm overflow-hidden">
              <Image 
                src="/assets/curled-black-chart.jpg" 
                alt="Curled dark paper geometry" 
                fill 
                className="object-cover object-center" 
                priority
              />
            </div>
            
            <div className="absolute top-0 left-[31%] w-[3.5%] h-full bg-[#0d0d0d] z-10"></div>
            
            <div className="absolute top-0 left-[65.5%] w-[3.5%] h-full bg-[#0d0d0d] z-10"></div>

            <div className="absolute bottom-0 left-0 w-[31%] h-[48%] bg-[#0d0d0d] z-10"></div>

            <div className="absolute bottom-0 right-0 w-[31%] h-[25%] bg-[#0d0d0d] z-10 flex items-start pt-5">
               <p className="text-[#FFFFFF] text-[12px] leading-relaxed pr-2 font-poppins">
                 Empowering brands with strategic thinking, exceptional design, and results-driven innovation.
               </p>
            </div>

          </div>
        </section>

        {}
        <section className="flex flex-col lg:flex-row gap-6 mb-32 items-stretch">
          
          <div className="w-full lg:w-[40%] flex flex-col gap-6">
            <div className="border border-[#222] bg-[#050505] rounded-2xl p-4 lg:p-6 flex-grow flex items-center justify-center">
              <div className="relative w-full h-full min-h-[350px] rounded-xl overflow-hidden">
                <Image 
                  src="/assets/team-collaboration.jpg" 
                  alt="Team collaborating" 
                  fill 
                  className="object-cover" 
                />
              </div>
            </div>
            
            <div className="border border-[#222] bg-[#050505] rounded-2xl p-5 flex items-center gap-4 shrink-0">
              <div className="flex -space-x-3 shrink-0">
                 <div className="w-10 h-10 rounded-full bg-gray-600 border-1 border-white relative z-10 overflow-hidden"><Image src="/assets/person-1.jpg" alt="user1" fill className="object-cover"/></div>
                 <div className="w-10 h-10 rounded-full bg-gray-500 border-2 border-white relative z-20 overflow-hidden"><Image src="/assets/person-2.jpg" alt="user2" fill className="object-cover"/></div>
                 <div className="w-10 h-10 rounded-full bg-gray-400 border-2 border-white relative z-30 overflow-hidden"><Image src="/assets/person-3.jpg" alt="user3" fill className="object-cover"/></div>
                 <div className="w-10 h-10 rounded-full bg-gray-300 border-2 border-white relative z-40 overflow-hidden"><Image src="/assets/person-4.jpg" alt="user4" fill className="object-cover"/></div>
              </div>
              <p className="text-[13px] text-[#FFFFFF] leading-relaxed pr-2">
                Yours crafting premium digital system for ambitious founders and enterprise teams.
              </p>
            </div>
          </div>

          <div className="w-full lg:w-[60%] flex flex-col gap-6">
            
            <div className="border border-[#222] bg-[#050505] rounded-2xl p-8 lg:p-10">
              <h2 className="text-xl lg:text-[28px] font-['Glacial'] leading-relaxed text-white">
                The agency behind category defining brands built to lead, influence, and leave a lasting impression not simply blend in.
              </h2>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 flex-grow">
              
              <div className="border border-[#222] bg-[#050505] rounded-2xl p-8 relative overflow-hidden flex flex-col">
                <div className="absolute top-0 right-0 w-32 h-32 bg-[#be0919]/15 blur-[50px] rounded-full pointer-events-none"></div>
                <div className="w-10 h-10 border border-[#333] rounded-xl flex items-center justify-center mb-5 relative z-10 bg-black/50">
                  <svg className="w-5 h-5 text-[#be0919]" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"></path></svg>
                </div>
                <h3 className="text-white font-bold text-lg mb-4 relative z-10">Background</h3>
                <p className="text-[#FFFFFF] text-[13px] leading-relaxed relative z-10">
                  Founded with a passion for innovation and digital excellence, our agency was built to help businesses navigate an increasingly competitive landscape. By combining strategic thinking, creative expertise, and advanced technology, we create solutions that not only solve challenges but unlock new opportunities for growth, performance, and long-term success.
                </p>
              </div>

              <div className="border border-[#222] bg-[#050505] rounded-2xl p-8 relative overflow-hidden flex flex-col">
                <div className="absolute top-0 right-0 w-32 h-32 bg-[#be0919]/15 blur-[50px] rounded-full pointer-events-none"></div>
                <div className="w-10 h-10 border border-[#333] rounded-xl flex items-center justify-center mb-5 relative z-10 bg-black/50">
                  <svg className="w-5 h-5 text-[#be0919]" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M12 11c0 3.517-1.009 6.799-2.753 9.571m-3.44-2.04l.054-.09A13.916 13.916 0 008 11a4 4 0 118 0c0 1.017-.07 2.019-.203 3m-2.118 6.844A21.88 21.88 0 0015.171 17m3.839 1.132c.645-2.266.99-4.659.99-7.132A8 8 0 008 4.07M3 15.364c.64-1.319 1-2.8 1-4.364 0-1.457.39-2.823 1.07-4"></path></svg>
                </div>
                <h3 className="text-white font-bold text-lg mb-4 relative z-10">Core Identity</h3>
                <p className="text-[#FFFFFF] text-[13px] leading-relaxed relative z-10">
                  At our core, we are a team of strategists, creatives, and technology experts driven by a shared commitment to excellence. Our identity is defined by innovation, precision, and a relentless focus on delivering meaningful digital experiences that create lasting impact for the brands we serve.
                </p>
              </div>
              
            </div>

            <div className="border border-[#222] bg-[#050505] rounded-2xl p-6 lg:p-8 flex flex-col shrink-0">
              <span className="text-white/50 text-[15px] mb-6">Company Overview</span>
              
              <div className="grid grid-cols-3 gap-0">
                <div className="flex flex-col items-center justify-center border-r border-[#222]">
                  <span className="text-[#be0919] text-3xl lg:text-[2.5rem] font-light mb-2">12+</span>
                  <span className="text-[#FFFFFF] text-[13px] capitalize tracking-wide">Years in business</span>
                </div>
                <div className="flex flex-col items-center justify-center border-r border-[#222]">
                  <span className="text-[#be0919] text-3xl lg:text-[2.5rem] font-light mb-2">500+</span>
                  <span className="text-[#FFFFFF] text-[13px] capitalize tracking-wide">Project Delivered</span>
                </div>
                <div className="flex flex-col items-center justify-center">
                  <span className="text-[#be0919] text-3xl lg:text-[2.5rem] font-light mb-2">200+</span>
                  <span className="text-[#FFFFFF] text-[13px] capitalize tracking-wide">Global connections</span>
                </div>
              </div>
            </div>

          </div>
        </section>

        {}
        <section className="mb-32">
          <div className="bg-[#050505] border border-[#1f1f1f] rounded-3xl p-8 lg:p-14 w-full">
            
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-16 gap-6">
              <h2 className="text-3xl lg:text-[38px] font-['Glacial'] text-white leading-tight">
                Our Journey from frustration to<br className="hidden md:block"/> industry Leadership.
              </h2>
              <div className="border border-[#333] px-6 py-2.5 rounded-full text-[12px] text-[#FFFFFF]">
                Founded in 2023
              </div>
            </div>

            <div className="relative w-full">
              <div className="hidden md:block absolute right-0 top-0 bottom-0 w-[1px] bg-[#1a1a1a]"></div>
              
              <div className="flex flex-col">
                {timeline.map((item, index) => (
                  <div 
                    key={index} 
                    className="flex flex-col md:flex-row gap-8 lg:gap-16 items-start py-8 border-b border-[#1a1a1a] last:border-b-0 relative pr-0 md:pr-12"
                  >
                    <div className="text-[#be0919] font-['Glacial'] font-medium text-xl lg:text-2xl w-[80px] shrink-0 pt-1">
                      {item.year}
                    </div>
                    
                    <div className="flex flex-col flex-grow">
                      <h3 className="text-white font-semibold text-[18px] mb-3 tracking-wide">{item.title}</h3>
                      <p className="text-[#FFFFFF] text-[14px] leading-relaxed max-w-3xl">
                        {item.desc}
                      </p>
                    </div>

                    <div className="hidden md:block absolute right-[-4px] top-[40px] w-[9px] h-[9px] bg-[#be0919] rounded-full shadow-[0_0_10px_rgba(190,9,25,0.8)]"></div>
                  </div>
                ))}
              </div>
            </div>
            
          </div>
        </section>


       {}
        <section className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-32">
          
          <div className="bg-[#050505] border border-[#1f1f1f] rounded-3xl p-10 lg:p-12 relative overflow-hidden flex flex-col min-h-[450px]">
            <div className="absolute top-[-50px] left-[-50px] w-56 h-56 bg-[#be0919]/20 blur-[70px] rounded-full pointer-events-none"></div>
            
            <div className="flex justify-between items-center mb-12 relative z-10">
              <span className="text-white/50 text-[18px] font-['Glacial'] tracking-wide">Our Mission</span>
              
              <div className="w-12 h-12 rounded-2xl border-[2px] border-[#be0919]/40 bg-[#be0919]/10 flex items-center justify-center text-[#e6192b] shadow-[0_0_15px_rgba(190,9,25,0.1)]">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <circle cx="7.5" cy="7.5" r="2.5"/>
                  <circle cx="16.5" cy="7.5" r="2.5"/>
                  <circle cx="7.5" cy="16.5" r="2.5"/>
                  <circle cx="16.5" cy="16.5" r="2.5"/>
                  <path d="M12 9.5v5M9.5 12h5 M5.7 5.7L3.5 3.5 M18.3 5.7L20.5 3.5 M5.7 18.3L3.5 20.5 M18.3 18.3L20.5 20.5"/>
                </svg>
              </div>
            </div>
            
            <div className="relative z-10 flex flex-col flex-grow">
              <h3 className="text-2xl lg:text-[41px] leading-[1.2] text-white font-['Glacial'] font-normal max-w-lg mb-10">
                Empowering Growth Through Innovation and Strategy Building Digital Solutions for Lasting Success
              </h3>
              <p className="text-[#FFFFFF] text-[17px] leading-relaxed pr-4 mt-auto">
                Our mission is to help businesses grow through strategic thinking, creativity, and innovative digital solutions that deliver real results and long-term value.
              </p>
            </div>
          </div>

          <div className="bg-[#050505] border border-[#1f1f1f] rounded-3xl p-10 lg:p-12 relative overflow-hidden flex flex-col min-h-[450px]">
            <div className="absolute top-[-50px] left-[-50px] w-56 h-56 bg-[#be0919]/20 blur-[70px] rounded-full pointer-events-none"></div>
            
            <div className="flex justify-between items-center mb-12 relative z-10">
              <span className="text-white/50 text-[18px] font-['Glacial'] tracking-wide">Our Vision</span>
              
              <div className="w-12 h-12 rounded-2xl border-[2px] border-[#be0919]/40 bg-[#be0919]/10 flex items-center justify-center text-[#e6192b] shadow-[0_0_15px_rgba(190,9,25,0.1)]">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M11.5 14.5L8 22M11.5 14.5L15 22" />
                  <g transform="rotate(-25 12 12)">
                    <rect x="4" y="10.5" width="4" height="3" rx="0.5" />
                    <rect x="8" y="9.5" width="5" height="5" rx="0.5" />
                    <rect x="13" y="8.5" width="7" height="7" rx="0.5" />
                  </g>
                </svg>
              </div>
            </div>
            
            <div className="relative z-10 flex flex-col flex-grow">
              <h3 className="text-2xl lg:text-[41px] leading-[1.2] text-white font-['Glacial'] font-normal max-w-lg mb-10">
                Shaping the Future of Digital Excellence Inspiring Growth Through Innovation and Purpose
              </h3>
              <p className="text-[#FFFFFF] text-[17px] leading-relaxed pr-4 mt-auto">
                Our vision is to become a leading digital partner delivering innovative solutions that drive growth and long-term impact.
              </p>
            </div>
          </div>

        </section>


        {}
        <section className="mb-32">
          <div className="bg-[#050505] border border-[#1f1f1f] rounded-3xl p-8 lg:p-12 w-full">
            
            <div className="mb-10">
              <span className="text-white/50 text-[18px] tracking-wide mb-2 block">
                What makes us Different
              </span>
              <Title as="h2" className="text-3xl lg:text-[38px] font-['Glacial'] text-white">
                Six discipline, one coherent System
              </Title>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 lg:gap-5 auto-rows-[180px] lg:auto-rows-[160px]">
              
              <div className="md:col-span-2 md:row-span-2 relative rounded-2xl overflow-hidden border border-[#222]">
                <Image src="/assets/collage-1.jpg" alt="Red keyboard" fill className="object-cover transition-transform duration-500 ease-out hover:scale-110" />
              </div>
              
              <div className="md:col-span-1 md:row-span-1 relative rounded-2xl overflow-hidden border border-[#222]">
                <Image src="/assets/collage-2.jpg" alt="Code screen" fill className="object-cover transition-transform duration-500 ease-out hover:scale-110" />
              </div>
              
              <div className="md:col-span-1 md:row-span-1 relative rounded-2xl overflow-hidden border border-[#222]">
                <Image src="/assets/collage-3.jpg" alt="Abstract red room" fill className="object-cover transition-transform duration-500 ease-out hover:scale-110" />
              </div>
              
              <div className="md:col-span-1 md:row-span-1 relative rounded-2xl overflow-hidden border border-[#222]">
                <Image src="/assets/collage-4.jpg" alt="3D shapes" fill className="object-cover transition-transform duration-500 ease-out hover:scale-110" />
              </div>
              
              <div className="md:col-span-1 md:row-span-1 relative rounded-2xl overflow-hidden border border-[#222]">
                <Image src="/assets/collage-5.jpg" alt="Red light grid" fill className="object-cover transition-transform duration-500 ease-out hover:scale-110" />
              </div>
              
              <div className="md:col-span-1 md:row-span-1 relative rounded-2xl overflow-hidden border border-[#222]">
                <Image src="/assets/collage-6.jpg" alt="AI Brain" fill className="object-cover transition-transform duration-500 ease-out hover:scale-110" />
              </div>
              
            </div>
          </div>
        </section>


        {}
        <section className="mb-32 relative flex flex-col items-center">
          
          <div className="absolute left-[-160px] lg:left-[-150px] bottom-[-120px] hidden lg:block opacity-90 z-0 pointer-events-none">
            <Image src="/assets/photoroom.png" alt="3D dark crystal left" width={380} height={380} className="object-contain" />
          </div>
          <div className="absolute right-[-100px] lg:right-[-140px] top-[-120px] hidden lg:block opacity-90 z-0 pointer-events-none">
            <Image src="/assets/photoroom.png" alt="3D dark crystal right" width={380} height={380} className="object-contain" />
          </div>

          <div className="relative z-10 flex flex-col items-center w-full">
            <span className="text-[#555] text-[0.8rem] tracking-wide mb-4 block text-center">Culture and Values</span>
            <Title as="h2" className="text-3xl lg:text-[2.5rem] text-center mb-16 font-['Glacial']">
              The Force that shape every decision we make
            </Title>

            <div className="flex flex-wrap justify-center gap-6 lg:gap-8 w-full max-w-[1000px]">
              {valuesData.map((val, i) => (
                <div 
                  key={i} 
                  className="w-[150px] h-[170px] lg:w-[160px] lg:h-[180px] bg-[#050505] border border-[#1f1f1f] rounded-2xl flex flex-col items-center justify-center gap-5 hover:border-[#333] hover:shadow-[0_0_30px_rgba(255,255,255,0.03)] transition-all duration-300 cursor-pointer group"
                >
                  <div className="w-12 h-12 rounded-full bg-[#1a1a1a] border border-[#2a2a2a] flex items-center justify-center text-[#be0919] group-hover:scale-110 transition-transform duration-300">
                    {val.icon}
                  </div>
                  
                  <div className="flex flex-col items-center gap-2">
                    <span className="text-[0.85rem] text-white font-poppins tracking-wide">
                      {val.title}
                    </span>
                    <div className="w-6 h-[2px] bg-[#be0919] rounded-full group-hover:w-8 transition-all duration-300"></div>
                  </div>
                </div>
              ))}
            </div>
          </div>
          
        </section>

        {}
        <Newsletter />

      </div>
    </div>
  );
}