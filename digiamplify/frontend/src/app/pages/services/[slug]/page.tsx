'use client';

import React, { use } from 'react';
import Image from 'next/image';
import Newsletter from '@/components/ui/Newsletter';
import { ChevronLeft, ChevronRight, Compass, CalendarDays, PenTool, Activity, Users, Palette, Layers, Wrench, BarChart3, Cpu, Plus, Minus, TrendingUp } from 'lucide-react';
import { servicesData } from './data';

const phaseIcons = [Compass, CalendarDays, PenTool, Activity];
const cardIcons: Record<string, any> = {
  Users: Users,
  Palette: Palette,
  Layers: Layers,
  Wrench: Wrench,
  BarChart3: BarChart3,
  Cpu: Cpu,
};

export default function ServiceSlugPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = use(params);
  const [order, setOrder] = React.useState([0, 1, 2]);
  const [openFaqIndex, setOpenFaqIndex] = React.useState<number | null>(0);
  const [animateProgress, setAnimateProgress] = React.useState(false);

  React.useEffect(() => {
    const timer = setTimeout(() => setAnimateProgress(true), 150);
    return () => clearTimeout(timer);
  }, []);

  const service = servicesData[slug];

  if (!service) {
    return (
      <div className="min-h-screen w-full bg-[#050505] flex flex-col items-center justify-center font-poppins text-white">
        <h1 className="text-4xl font-bold mb-4">Service Not Found</h1>
        <p className="text-white/60 mb-6">The requested service page does not exist.</p>
        <a href="/services" className="border border-[#be0919] text-[#be0919] hover:bg-[#be0919] hover:text-white px-6 py-2.5 rounded transition-all">
          Back to Services
        </a>
      </div>
    );
  }

  const handleNext = () => {
    setOrder((prev) => [prev[1], prev[2], prev[0]]);
  };

  const handlePrev = () => {
    setOrder((prev) => [prev[2], prev[0], prev[1]]);
  };

  const toggleFaq = (index: number) => {
    setOpenFaqIndex(prev => (prev === index ? null : index));
  };

  const frontSlide = service.slides[order[0]];
  const middleSlide = service.slides[order[1]];
  const backSlide = service.slides[order[2]];

  return (
    <div className="min-h-screen w-full font-poppins relative overflow-hidden bg-[#0d0d0d] pb-15 px-4">

      <main className="max-w-[1300px] mx-auto px-6 pt-12 lg:pt-20 pb-20 grid grid-cols-1 lg:grid-cols-12 gap-12 relative z-10 h-full items-center">
        <div className="lg:col-span-5 flex flex-col gap-6">
          <h1 className="text-4xl lg:text-[52px] font-medium text-white tracking-wide">
            {service.title}
          </h1>
          <p className="text-[#a3a3a3] text-[15px] leading-relaxed max-w-[90%] font-light mt-2">
            {service.desc}
          </p>

          <button className="mt-4 border border-[#be0919] text-[#be0919] hover:bg-[#be0919] hover:text-white bg-transparent px-8 py-3 rounded-[8px] w-fit font-medium text-[15px] transition-all duration-300">
            Book a service
          </button>
        </div>

        <div className="lg:col-span-7 relative h-[360px] w-full mt-10 lg:mt-0">

          <div className="absolute left-0 top-[135px] bg-white rounded-sm w-[425px] h-[150px] z-10 shadow-[0_20px_50px_rgba(0,0,0,0.3)] transition-all duration-500 ease-in-out p-7 relative">
            <div className="flex flex-col mt-[36px] w-[90%] overflow-hidden">
              <h3 className="text-black text-[19px] font-bold leading-tight">{frontSlide.subTitle}</h3>
              <p className="text-gray-500 text-[13px] font-medium mt-1.5">{frontSlide.subDesc}</p>
            </div>

            <div className="absolute right-[20px] bottom-4 flex items-center gap-3 text-black z-30">
              <button onClick={handlePrev} className="hover:text-[#be0919] transition-colors cursor-pointer p-1">
                <ChevronLeft strokeWidth={3} className="w-5 h-5" />
              </button>
              <button onClick={handleNext} className="hover:text-[#be0919] transition-colors cursor-pointer p-1">
                <ChevronRight strokeWidth={3} className="w-5 h-5" />
              </button>
            </div>
          </div>

          <div className="absolute left-[55px] top-0 w-[270px] h-[170px] z-30 shadow-[0_15px_35px_rgba(0,0,0,0.4)] transition-all duration-500 ease-in-out">
            <Image
              src={`/assets/services/${service.folder}/${frontSlide.imageName}`}
              alt={frontSlide.subTitle}
              fill
              className="object-cover rounded-sm transition-transform duration-500 hover:scale-110 cursor-pointer"
            />
          </div>

          <div className="absolute left-[375px] top-0 w-[270px] h-[170px] z-20 shadow-[0_15px_35px_rgba(0,0,0,0.3)] transition-all duration-500 ease-in-out">
            <Image
              src={`/assets/services/${service.folder}/${middleSlide.imageName}`}
              alt={middleSlide.subTitle}
              fill
              className="object-cover rounded-sm transition-transform duration-500 hover:scale-110 cursor-pointer"
            />
          </div>

          <div className="absolute left-[410px] top-[80px] w-[350px] h-[350px] z-25 pointer-events-none">
            <Image
              src={`/assets/services/${service.folder}/photoroom.png`}
              alt=""
              fill
              className="object-contain"
            />
          </div>

          <div className="absolute left-[390px] top-[280px] w-[150px] h-[150px] z-25 pointer-events-none">
            <Image
              src={`/assets/services/${service.folder}/photoroom.png`}
              alt=""
              fill
              className="object-contain"
            />
          </div>
        </div>
      </main>

      <section className="w-full bg-[#050505] border-t border-white/5 py-15 px-6 sm:px-8 lg:px-12 relative z-10">
        <div className="max-w-[1200px] py-8 mx-auto grid grid-cols-1 lg:grid-cols-2 lg:gap-0 gap-8 items-center">

          <div className="lg:pr-12 pr-0">
            <h2 className="text-2xl sm:text-3xl lg:text-[35px] font-light leading-snug text-white tracking-wide font-['Glacial']">
              {service.quote}
            </h2>
          </div>

          <div className="border-l-0 lg:border-l border-white/10 pl-0 lg:pl-12 flex flex-col gap-4 py-2">
            <p className="text-[#a3a3a3] text-[15px] leading-relaxed font-light font-poppins">
              {service.subDesc2}
            </p>
            <p className="text-[#be0919] text-[16px] font-medium tracking-wide mt-2 font-poppins">
              {service.tagline}
            </p>
          </div>
        </div>
      </section>

      <section className="w-full bg-[#1a1a1a] border-t border-white/5 py-18 px-6 sm:px-8 lg:px-12 relative z-10">
        <div className="max-w-[1200px] mx-auto">

          <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6 mb-20">
            <div>
              <h2 className="text-3xl sm:text-4xl lg:text-[45px] font-light leading-tight text-white tracking-wide font-['Glacial']">
                4 Phases <span className="text-[#be0919]">Built for Success.</span>
              </h2>
            </div>
            <p className="text-[#a3a3a3] text-[15px] leading-relaxed max-w-[360px] font-light font-poppins">
              A repeatable proven system that delivers on time and above expectations.
            </p>
          </div>

          <div className="relative mt-16">

            <div className="absolute top-[32px] left-0 right-0 h-[1px] bg-white/10 z-0 hidden md:block"></div>

            <div className="grid grid-cols-1 md:grid-cols-4 gap-12 relative z-10">
              {service.phases.map((phase, index) => {
                const IconComponent = phaseIcons[index];
                return (
                  <div key={index} className="flex flex-col items-center text-center group">

                    <div className="relative w-16 h-16 rounded-[10px] bg-[#0d0d0d] border border-[#be0919] flex flex-col items-center justify-center shadow-[0_0_15px_rgba(190,9,25,0.15)] group-hover:shadow-[0_0_25px_rgba(190,9,25,0.4)] group-hover:border-[#be0919] transition-all duration-300 mb-6 z-10">
                      <span className="text-[14px] font-bold text-[#be0919] absolute top-1.5">0{index + 1}</span>
                      <IconComponent className="w-[18px] h-[18px] text-[#be0919] mt-3 transition-transform duration-300 group-hover:scale-110" />
                    </div>

                    <h3 className="text-white text-base font-bold font-poppins mb-2 tracking-wide group-hover:text-[#be0919] transition-colors duration-300">
                      {phase.title}
                    </h3>
                    <p className="text-white/60 text-[13px] leading-relaxed font-light max-w-[240px] font-poppins">
                      {phase.desc}
                    </p>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </section>

      <section className="w-full bg-[#050505] border-t border-white/5 py-24 px-6 sm:px-8 lg:px-12 relative z-10">
        <div className="max-w-[1200px] mx-auto">

          <div className="mb-16">
            <h2 className="text-3xl sm:text-4xl lg:text-[45px] font-light leading-tight text-white tracking-wide font-['Glacial'] max-w-[70%]">
              <span className="text-[#be0919]">{service.header3.redText}</span> {service.header3.whiteText}
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {service.cards.map((card, index) => {
              const IconComp = cardIcons[card.iconName] || Users;

              const colSpanClass = (index === 0 || index === 5) ? 'md:col-span-2' : 'md:col-span-1';

              return (
                <div
                  key={index}
                  className={`${colSpanClass} bg-[#0a0a0a]/60 border border-[#ffffff]/20 hover:border-[#be0919]/35 hover:shadow-[0_10px_30px_rgba(190,9,25,0.05)] rounded-[12px] p-8 transition-all duration-300 flex flex-col items-start`}
                >
                  <div className="w-12 h-12 rounded-full bg-[#ffffff]/30 border border-white/10 flex items-center justify-center mb-6">
                    <IconComp className="w-5 h-5 text-white" />
                  </div>

                  <h3 className="text-white text-[18px] font-bold font-poppins mb-3 tracking-wide">{card.title}</h3>
                  <p className="text-white/60 text-[14px] leading-relaxed font-light font-poppins">{card.desc}</p>
                </div>
              );
            })}

            <div className="md:col-span-1 flex justify-center items-center relative min-h-[240px] md:min-h-0">
              <div className="relative w-[220px] h-[220px] md:w-[240px] md:h-[240px]">
                <Image
                  src={`/assets/services/${service.folder}/cube.png`}
                  alt="Decorative Cube"
                  fill
                  className="object-contain animate-[spin_20s_linear_infinite]"
                />
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="w-full border-t border-white/5 py-20 px-6 sm:px-8 lg:px-12 relative z-10" style={{ background: 'linear-gradient(to right, #242323 50%, #0d0d0d 70%, #050505 100%)' }}>

        <div className="max-w-[1200px] mx-auto">

          <p className="text-[#ffffff]/50 text-[18px] tracking-wider mb-4 font-['Glacial']">Why choose this</p>

          <h2 className="text-3xl sm:text-4xl lg:text-[42px] font-light leading-[1.2] tracking-tight text-white mb-14 font-['Glacial'] max-w-[600px]">
            {service.whyChoose.heading.white}{' '}
            <span className="text-[#be0919]">{service.whyChoose.heading.red}</span>.
          </h2>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-18 items-start">

            <div className="relative w-full h-[450px] rounded-sm overflow-hidden">
              <Image
                src={`/assets/services/${service.folder}/${service.whyChoose.image}`}
                alt="Why choose us"
                fill
                className="object-cover"
              />
            </div>

            <div className="flex flex-col gap-0">
              {service.whyChoose.items.map((item, index) => (
                <div key={index} className={`flex items-start gap-5 ${index === 0 ? 'pb-7' : 'py-7'} ${index < service.whyChoose.items.length - 1 ? 'border-b border-white/20' : ''}`}>
                  <div className="w-8 h-8 rounded-full bg-[#ffffff]/30 border border-white/15 flex items-center justify-center flex-shrink-0 mt-0.5">
                    <svg className="w-4 h-4 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                      <polyline points="20 6 9 17 4 12" />
                    </svg>
                  </div>
                  <div>
                    <h3 className="text-white text-[17px] font-bold font-poppins mb-2.5 tracking-wide">{item.title}</h3>
                    <p className="text-[#999999] text-[14px] leading-[1.7] font-light font-poppins max-w-[420px]">{item.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="max-w-[1200px] mx-auto mt-16 pt-8">
          <p className="text-[#ffffff]/50 text-[18px] tracking-wider mb-4 font-['Glacial']">Results and Impact</p>
          <h2 className="text-3xl sm:text-4xl lg:text-[42px] font-light leading-[1.2] tracking-tight text-white mb-14 font-['Glacial']">
            {service.resultsImpact.heading.white}{' '}
            <span className="text-[#be0919]">{service.resultsImpact.heading.red}</span>
          </h2>

          <div className="grid grid-cols-1 lg:grid-cols-[2.5fr_1fr] gap-8 items-start">

            <div className="grid grid-cols-1 md:grid-cols-12 gap-5">
              {service.resultsImpact.metrics.map((metric, idx) => {
                const isWide = metric.isWide;
                const colSpan = isWide ? 'md:col-span-8' : 'md:col-span-4';
                return (
                  <div
                    key={idx}
                    className={`${colSpan} bg-[#141414]/60 border border-white/20 rounded-[12px] p-8 flex flex-col justify-between min-h-[160px]`}
                  >
                    <div>
                      <p className="text-[#be0919] text-[42px] font-light font-['Glacial'] leading-none mb-3">
                        {metric.value}
                      </p>
                      <h4 className="text-white text-[15px] font-bold font-poppins mb-1.5 tracking-wide">
                        {metric.title}
                      </h4>
                    </div>
                    <p className="text-white/60 text-[13px] leading-relaxed font-regular font-poppins">
                      {metric.desc}
                    </p>
                  </div>
                );
              })}

              <div className="md:col-span-4 flex items-center justify-center min-h-[160px]">
                <div className="relative w-[200px] h-[200px]">
                  <Image
                    src={`/assets/services/${service.folder}/cube.png`}
                    alt="Decorative 3D Cube"
                    fill
                    className="object-contain animate-[spin_20s_linear_infinite]"
                  />
                </div>
              </div>
            </div>

            <div className="bg-[#141414]/60 border border-white/20 rounded-[12px] p-8 flex flex-col gap-12">
              <div>
                <h3 className="text-white text-[20px] font-bold font-poppins mb-6 tracking-wide">
                  Performance Score
                </h3>
                <div className="flex flex-col gap-6">
                  {service.resultsImpact.performanceScores.map((score, idx) => (
                    <div key={idx} className="flex flex-col">
                      <div className="flex justify-between items-center mb-2">
                        <span className="text-white/60 text-[13px] font-poppins">{score.label}</span>
                        <span className="text-white text-[13px] font-bold font-poppins">{score.percentage}%</span>
                      </div>
                      <div className="w-full h-[6px] bg-white/20 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-[#be0919] rounded-full transition-all duration-1000 ease-out"
                          style={{ width: animateProgress ? `${score.percentage}%` : '0%' }}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="border-t border-white/10 w-full" />

              <div>
                <h3 className="text-white text-[20px] font-bold font-poppins mb-6 tracking-wide">
                  Monthly Trend
                </h3>

                <div className="flex items-end justify-center gap-[14px] h-[140px] relative px-4 mt-16 pb-2">

                  <div className="absolute left-[18%] top-[-20px] z-10 pointer-events-none">
                    <svg className="w-[90px] h-[50px] text-[#be0919]" viewBox="0 0 100 60" fill="none" stroke="currentColor" strokeWidth="6" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M10 50 L40 25 L55 40 L90 10" />
                      <polyline points="65 10 90 10 90 35" />
                    </svg>
                  </div>

                  <div className="flex flex-col items-center h-full justify-end">
                    <div
                      className="w-[20px] rounded-full bg-[#3a3a3a] transition-all duration-[1.2s] ease-out"
                      style={{ height: animateProgress ? "25%" : "0%" }}
                    />
                  </div>
                  <div className="flex flex-col items-center h-full justify-end">
                    <div
                      className="w-[20px] rounded-full bg-[#595959] transition-all duration-[1.2s] ease-out"
                      style={{ height: animateProgress ? "45%" : "0%" }}
                    />
                  </div>
                  <div className="flex flex-col items-center h-full justify-end">
                    <div
                      className="w-[20px] rounded-full bg-[#7a7a7a] transition-all duration-[1.2s] ease-out"
                      style={{ height: animateProgress ? "65%" : "0%" }}
                    />
                  </div>
                  <div className="flex flex-col items-center h-full justify-end">
                    <div
                      className="w-[20px] rounded-full bg-[#4a0c13] transition-all duration-[1.2s] ease-out"
                      style={{ height: animateProgress ? "80%" : "0%" }}
                    />
                  </div>
                  <div className="flex flex-col items-center h-full justify-end">
                    <div
                      className="w-[20px] rounded-full bg-[#be0919] transition-all duration-[1.2s] ease-out"
                      style={{ height: animateProgress ? "100%" : "0%" }}
                    />
                  </div>
                </div>
              </div>
            </div>

          </div>
        </div>
      </section>

      <section className="w-full bg-[#050505] border-t border-white/5 py-18 px-6 sm:px-8 lg:px-12 relative z-10">
        <div className="max-w-[1200px] mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 lg:gap-24 items-start">

            <div>
              <div className="flex items-center gap-3.5 mb-8">
                <div className="relative w-14 h-14">
                  <Image
                    src={`/assets/services/${service.folder}/faq.png`}
                    alt="FAQs Logo"
                    fill
                    className="object-contain"
                  />
                </div>
                <span className="text-[#be0919] text-[28px] font-['Glacial'] tracking-wide">
                  FAQs
                </span>
              </div>

              <h2 className="text-3xl sm:text-4xl lg:text-[42px] font-light leading-[1.2] tracking-tight text-white mb-8 font-['Glacial']">
                Clear answers for teams investing in serious <span className="text-[#be0919]">digital change.</span>
              </h2>

              <p className="text-white text-[15px] leading-[1.8] max-w-[500px] font-light font-poppins">
                Our engagements are thoughtfully designed to be high-touch, strategy-led, and results-focused, providing clarity, confidence, and seamless collaboration from day one. Every interaction is guided by expertise, transparency, and a commitment to delivering exceptional outcomes at every stage of the journey.
              </p>
            </div>

            <div className="flex flex-col gap-4 mt-2">
              {service.faqs.map((faq, index) => {
                const isOpen = openFaqIndex === index;
                return (
                  <div
                    key={index}
                    className="border border-[#ffffff]/20 rounded-2xl overflow-hidden bg-[#0d0d0d]/40 transition-colors duration-300"
                  >
                    <div
                      onClick={() => toggleFaq(index)}
                      className="flex justify-between items-center p-6 cursor-pointer select-none"
                    >
                      <h4 className="text-white text-[15px] font-medium tracking-wide pr-4 font-poppins">
                        {faq.question}
                      </h4>
                      <div className="p-1 rounded-full border border-white/20 bg-white/[0.03] flex items-center justify-center transition-all duration-300 hover:border-[#be0919]">
                        {isOpen ? (
                          <Minus className="text-white flex-shrink-0" size={16} strokeWidth={2} />
                        ) : (
                          <Plus className="text-white flex-shrink-0" size={16} strokeWidth={2} />
                        )}
                      </div>
                    </div>

                    <div
                      className={`px-6 transition-all duration-300 ease-in-out overflow-hidden ${isOpen ? 'max-h-[200px] pb-6 pt-2 opacity-100' : 'max-h-0 opacity-0 pointer-events-none'
                        }`}
                    >
                      <p className="text-white/60 text-[13px] leading-[1.7] font-light font-poppins">
                        {faq.answer}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </section>

      {/* Newsletter Section */}
      <Newsletter />
    </div>
  );
}
