import { heroContent } from '@/data/home/hero'

function Hero() {
  const stats = heroContent.stats || []

  return (
    <section className="relative overflow-hidden bg-[#000000] pt-4 sm:pt-6 lg:pt-8">
      <div className="pointer-events-none absolute left-[4%] top-[30%] h-[180px] w-[180px] rounded-full bg-[#c8101e]/[0.04] blur-[90px] sm:h-[240px] sm:w-[240px] lg:left-[8%] lg:h-[300px] lg:w-[300px] lg:blur-[120px]" />

      <div className="pointer-events-none absolute right-[2%] top-[45%] h-[240px] w-[240px] rounded-full bg-[#c8101e]/[0.06] blur-[100px] sm:h-[320px] sm:w-[320px] lg:right-[4%] lg:top-[25%] lg:h-[400px] lg:w-[400px] lg:blur-[150px]" />

      <div className="section-container relative z-10">
        <div className="grid items-center gap-5 pb-8 pt-4 sm:gap-7 sm:pb-10 sm:pt-5 md:gap-8 md:pb-12 lg:min-h-[calc(100vh-120px)] lg:grid-cols-[55%_45%] lg:gap-8 lg:py-4">
          <div className="relative z-10 px-5 sm:px-8 md:px-10 lg:px-0 lg:pl-16">
            <h1 className="max-w-[680px] text-[34px] font-bold leading-[1.1] tracking-[-1px] text-white min-[400px]:text-[40px] sm:text-[48px] sm:tracking-[-1.5px] md:text-[54px] md:tracking-[-2px] lg:text-[60px]">
              <span className="block">{heroContent.title}</span>

              <span className="block">{heroContent.titleLine}</span>

              <span className="block">
                {heroContent.highlight?.split(' ').slice(0, -1).join(' ')}{' '}
                <span className="text-[#c8101e]">
                  {heroContent.highlight?.split(' ').slice(-1)}
                </span>
              </span>
            </h1>

            <p className="hero-description mt-5 max-w-[560px] text-[13px] leading-[1.65] text-white/80 sm:mt-6 sm:max-w-[620px] sm:text-[14px] md:text-[14.5px] lg:max-w-[560px] lg:text-[13.5px]">
              Designing and developing intelligent software solutions that
              combine clean architecture, modern technology, and seamless user
              experiences to help businesses grow with confidence and
              scalability.
            </p>

            <div className="mt-9 grid grid-cols-2 justify-items-center gap-x-3 gap-y-4 sm:mt-11 sm:grid-cols-4 sm:justify-items-start sm:gap-x-4 sm:gap-y-0 md:mt-12 md:gap-x-5 lg:mt-14 lg:gap-x-5">
              {stats.map((stat) => (
                <div
                  key={stat.id}
                  className="relative h-[165px] w-[110px] sm:h-[175px] sm:w-[116px] md:h-[180px] md:w-[120px] lg:h-[180px] lg:w-[120px]"
                >
                  <img
                    src={stat.image}
                    alt={`${stat.title} statistic`}
                    className="absolute left-[5px] top-[9px] z-20 h-[84px] w-[100px] rounded-[9px] object-cover shadow-[0_12px_25px_rgba(0,0,0,0.55)] sm:left-[5px] sm:h-[89px] sm:w-[106px] md:left-[6px] md:top-[10px] md:h-[92px] md:w-[108px] lg:h-[92px] lg:w-[108px]"
                  />

                  <div className="absolute bottom-0 left-0 h-[100px] w-[110px] rounded-[10px] border-b-2 border-r-2 border-[#c8101e] bg-gradient-to-br from-[#1b1b1b] to-[#0b0b0b] px-3 pb-3 pt-[46px] sm:h-[105px] sm:w-[116px] sm:px-3.5 sm:pt-[49px] md:h-[108px] md:w-[120px] md:px-4 md:pb-4 md:pt-[51px] lg:h-[108px] lg:w-[120px] lg:pt-[51px]">
                    <p className="text-[11px] font-semibold leading-tight text-white sm:text-[12px] md:text-[14px]">
                      {stat.title}
                    </p>

                    <p className="mt-1 text-[10px] leading-tight text-[#9a9a9a] sm:text-[11px] md:text-[13px]">
                      {stat.value}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="relative mx-auto -mt-1 hidden h-[300px] w-full max-w-[330px] sm:-mt-1 sm:h-[370px] sm:max-w-[420px] md:h-[430px] md:max-w-[500px] lg:mx-auto lg:mt-0 lg:block lg:h-[540px] lg:max-w-[540px]">
            <div className="absolute left-1/2 top-1/2 h-[190px] w-[190px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-[#c8101e]/10 blur-[65px] sm:h-[240px] sm:w-[240px] sm:blur-[80px] md:h-[300px] md:w-[300px] md:blur-[95px] lg:h-[340px] lg:w-[340px] lg:blur-[110px]" />

            <img
              src={heroContent.visual.main}
              alt="Large glossy metallic red 3D twisted torus"
              className="hero-main-visual absolute left-1/2 top-1/2 z-10 w-[210px] -translate-x-1/2 -translate-y-1/2 object-contain min-[400px]:w-[225px] sm:w-[275px] md:w-[335px] lg:w-[410px]"
            />

            <img
              src={heroContent.visual.ring}
              alt="Small glass chrome ring"
              className="hero-ring-visual absolute left-[10%] top-[7%] z-20 w-[55px] object-contain min-[400px]:left-[8%] min-[400px]:w-[62px] sm:left-[5%] sm:top-[8%] sm:w-[82px] md:left-[5%] md:top-[7%] md:w-[100px] lg:left-[5%] lg:top-[7%] lg:w-[130px]"
            />

            <img
              src={heroContent.visual.cube}
              alt="Small silver 3D cube"
              className="hero-cube-visual absolute bottom-[7%] right-[8%] z-20 w-[55px] object-contain min-[400px]:right-[7%] min-[400px]:w-[63px] sm:right-[5%] sm:w-[78px] md:right-[5%] md:w-[98px] lg:right-[4%] lg:w-[125px]"
            />
          </div>
        </div>
      </div>

      <div className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-white/[0.08] to-transparent" />

      <style>{`
        .hero-main-visual {
          animation: heroMainRotate 16s linear infinite;
          filter: drop-shadow(0 30px 45px rgba(200, 16, 30, 0.2));
        }

        .hero-ring-visual {
          filter: drop-shadow(0 15px 20px rgba(255, 255, 255, 0.12));
        }

        .hero-cube-visual {
          filter: drop-shadow(0 18px 22px rgba(255, 255, 255, 0.14));
        }

        @keyframes heroMainRotate {
          0% {
            transform: translate(-50%, -50%) rotate(0deg);
          }

          100% {
            transform: translate(-50%, -50%) rotate(360deg);
          }
        }

        @media (prefers-reduced-motion: reduce) {
          .hero-main-visual {
            animation: none;
          }
        }
      `}</style>
    </section>
  )
}

export default Hero