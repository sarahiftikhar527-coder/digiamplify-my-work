import { useEffect, useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import { ArrowUpRight } from 'lucide-react'
import { projectsShowcase } from '@/data/home/projectsShowcase'
import { Reveal, SafeImage } from '@/components/common'

function useInView(threshold = 0.2) {
  const ref = useRef(null)
  const [inView, setInView] = useState(false)

  useEffect(() => {
    const el = ref.current
    if (!el) return

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setInView(true)
          observer.disconnect()
        }
      },
      { threshold }
    )

    observer.observe(el)

    return () => observer.disconnect()
  }, [threshold])

  return [ref, inView]
}

function AnimatedHeading({ before, highlight, after }) {
  const parts = [
    ...before
      .trim()
      .split(/\s+/)
      .filter(Boolean)
      .map((word) => ({
        word,
        red: false
      })),

    ...highlight
      .trim()
      .split(/\s+/)
      .filter(Boolean)
      .map((word) => ({
        word,
        red: true
      })),

    ...after
      .trim()
      .split(/\s+/)
      .filter(Boolean)
      .map((word) => ({
        word,
        red: false
      }))
  ]

  return (
    <h2 className="projects-heading text-[30px] font-light leading-[1.2] tracking-[-0.45px] text-white sm:text-[34px] md:text-[36px] lg:text-[38px]">
      {parts.map((item, index) => (
        <span
          key={`${item.word}-${index}`}
          className={`project-word inline-block mr-[0.25em] ${
            item.red ? 'text-digi-red' : ''
          }`}
          style={{
            animationDelay: `${index * 75}ms`
          }}
        >
          {item.word}
        </span>
      ))}
    </h2>
  )
}

function SlateItem({ item, index, play }) {
  return (
    <div
      className="project-slate-item group flex items-end justify-between gap-3 rounded-xl border border-white/15 bg-black px-4 py-3.5 transition-all duration-500 hover:-translate-y-1 hover:border-digi-red/50 hover:shadow-[0_10px_30px_-15px_rgba(208,16,31,0.5)] sm:px-5 sm:py-4"
      style={{
        opacity: play ? 1 : 0,
        transform: play
          ? 'translateX(0)'
          : 'translateX(50px)',
        transitionDelay: play
          ? `${300 + index * 140}ms`
          : '0ms'
      }}
    >
      <div className="min-w-0">
        <h3 className="text-[12px] font-medium text-white sm:text-[13px]">
          {item.title}
        </h3>

        <p className="mt-2 max-w-[330px] text-[10px] leading-[1.65] text-white/90 sm:text-[11px]">
          {item.text}
        </p>
      </div>

      <span className="project-value-pulse shrink-0 text-[11px] font-medium text-digi-red sm:text-xs">
        {item.value}
      </span>
    </div>
  )
}

function ProjectsShowcase() {
  const {
    title,
    highlight,
    description,
    wheel,
    mainImage,
    slate,
    horizontal
  } = projectsShowcase

  const titleParts = title.split(highlight)
  const before = titleParts[0] || ''
  const after = titleParts[1] || ''

  const [headerRef, headerIn] = useInView(0.2)
  const [imgRef, imgIn] = useInView(0.2)
  const [slateRef, slateIn] = useInView(0.2)
  const [horizontalRef, horizontalIn] = useInView(0.2)

  return (
    <section className="projects-showcase section-space relative overflow-hidden border-b border-white/10 bg-black pb-16 pt-16 sm:pb-20 sm:pt-20 lg:pb-24 lg:pt-28">
      <style>{`
        @keyframes projectWordIn {
          0% {
            opacity: 0;
            transform: translateX(-35px) translateY(12px);
            filter: blur(7px);
          }

          100% {
            opacity: 1;
            transform: translateX(0) translateY(0);
            filter: blur(0);
          }
        }

        @keyframes projectDescriptionIn {
          0% {
            opacity: 0;
            transform: translateX(-40px);
            filter: blur(6px);
          }

          100% {
            opacity: 1;
            transform: translateX(0);
            filter: blur(0);
          }
        }

        @keyframes wheelEntrance {
          0% {
            opacity: 0;
            transform: translateX(60px) scale(0.72);
            filter: blur(10px);
          }

          100% {
            opacity: 1;
            transform: translateX(0) scale(1);
            filter: blur(0);
          }
        }

        @keyframes wheelRotate {
          from {
            transform: rotate(0deg);
          }

          to {
            transform: rotate(360deg);
          }
        }

        @keyframes wheelFloat {
          0%,
          100% {
            transform: translateY(0);
          }

          50% {
            transform: translateY(-10px);
          }
        }

        @keyframes imageEntrance {
          0% {
            opacity: 0;
            transform: translateX(-100px) scale(0.96);
            filter: blur(8px);
          }

          100% {
            opacity: 1;
            transform: translateX(0) scale(1);
            filter: blur(0);
          }
        }

        @keyframes panelEntrance {
          0% {
            opacity: 0;
            transform: translateX(70px);
            filter: blur(7px);
          }

          100% {
            opacity: 1;
            transform: translateX(0);
            filter: blur(0);
          }
        }

        @keyframes horizontalEntrance {
          0% {
            opacity: 0;
            transform: translateX(45px);
          }

          100% {
            opacity: 1;
            transform: translateX(0);
          }
        }

        @keyframes valuePulse {
          0%,
          100% {
            opacity: 1;
          }

          50% {
            opacity: 0.5;
          }
        }

        @keyframes redGlow {
          0%,
          100% {
            opacity: 0.12;
          }

          50% {
            opacity: 0.35;
          }
        }

        .project-word {
          opacity: 0;
          animation: projectWordIn 0.72s cubic-bezier(0.22, 1, 0.36, 1) forwards;
        }

        .project-description {
          opacity: 0;
          animation: projectDescriptionIn 0.8s cubic-bezier(0.22, 1, 0.36, 1) 0.45s forwards;
        }

        .project-wheel-entrance {
          opacity: 0;
          animation: wheelEntrance 0.95s cubic-bezier(0.22, 1, 0.36, 1) 0.35s forwards;
        }

        .project-wheel-float {
          animation: wheelFloat 6s ease-in-out infinite;
        }

        .project-wheel-rotate {
          animation: wheelRotate 18s linear infinite;
        }

        .project-image-entrance {
          opacity: 0;
          animation: imageEntrance 1s cubic-bezier(0.22, 1, 0.36, 1) forwards;
        }

        .project-panel-entrance {
          opacity: 0;
          animation: panelEntrance 0.9s cubic-bezier(0.22, 1, 0.36, 1) 0.15s forwards;
        }

        .project-horizontal-entrance {
          opacity: 0;
          animation: horizontalEntrance 0.8s cubic-bezier(0.22, 1, 0.36, 1) forwards;
        }

        .project-value-pulse {
          animation: valuePulse 2.4s ease-in-out infinite;
        }

        .project-red-glow {
          animation: redGlow 4s ease-in-out infinite;
        }

        @media (max-width: 1023px) {
          .projects-showcase .container-shell {
            padding-left: 28px;
            padding-right: 28px;
          }

          .projects-top {
            gap: 28px;
          }

          .projects-copy {
            max-width: 540px;
          }

          .projects-wheel-area {
            margin-right: 0;
          }

          .projects-wheel-image {
            width: 150px;
            height: 150px;
          }
        }

        @media (max-width: 767px) {
          .projects-showcase .container-shell {
            padding-left: 20px;
            padding-right: 20px;
          }

          .projects-top {
            gap: 20px;
          }

          .projects-heading {
            max-width: 500px;
            font-size: 31px;
            line-height: 1.2;
          }

          .projects-description {
            margin-top: 22px;
            max-width: 100%;
            font-size: 13px;
            line-height: 1.8;
          }

          .projects-wheel-area {
            display: flex;
            width: 100%;
            justify-content: flex-end;
            margin-top: -4px;
          }

          .projects-wheel-image {
            width: 125px;
            height: 125px;
          }

          .projects-content-grid {
            grid-template-columns: 1fr;
            gap: 14px;
          }

          .projects-main-image {
            min-height: 320px;
          }

          .projects-side-panel,
          .projects-horizontal {
            padding: 20px;
          }
        }

        @media (max-width: 480px) {
          .projects-showcase {
            padding-top: 58px;
            padding-bottom: 62px;
          }

          .projects-showcase .container-shell {
            padding-left: 16px;
            padding-right: 16px;
          }

          .projects-top {
            gap: 18px;
          }

          .projects-heading {
            font-size: 28px;
            line-height: 1.22;
            letter-spacing: -0.4px;
          }

          .projects-description {
            margin-top: 20px;
            font-size: 12.5px;
            line-height: 1.8;
          }

          .projects-wheel-area {
            margin-top: -2px;
          }

          .projects-wheel-image {
            width: 108px;
            height: 108px;
          }

          .projects-content-grid {
            margin-top: 38px;
            gap: 12px;
          }

          .projects-main-image {
            min-height: 275px;
          }

          .projects-side-panel,
          .projects-horizontal {
            padding: 16px;
          }

          .projects-side-items {
            margin-top: 22px;
          }

          .project-slate-item {
            padding: 13px;
          }
        }

        @media (prefers-reduced-motion: reduce) {
          .project-word,
          .project-description,
          .project-wheel-entrance,
          .project-wheel-float,
          .project-wheel-rotate,
          .project-image-entrance,
          .project-panel-entrance,
          .project-horizontal-entrance,
          .project-value-pulse,
          .project-red-glow {
            animation: none !important;
            opacity: 1 !important;
            transform: none !important;
            filter: none !important;
          }
        }
      `}</style>

      <div className="pointer-events-none absolute inset-x-0 bottom-0 z-0 h-10 bg-gradient-to-t from-white/10 to-transparent sm:h-12" />

      <div className="container-shell relative z-10 lg:px-10 xl:px-14">
        <div
          ref={headerRef}
          className="projects-top flex flex-col gap-5 lg:flex-row lg:items-start lg:justify-between"
        >
          <div className="projects-copy max-w-[540px]">
            <AnimatedHeading
              before={before}
              highlight={highlight}
              after={after}
            />

            <p className="projects-description mt-7 max-w-[480px] text-[14px] leading-[1.75] text-white sm:mt-8 sm:leading-relaxed">
              {description}
            </p>
          </div>

          <div className="projects-wheel-area project-wheel-entrance shrink-0 lg:mr-8 lg:mt-0">
            <div className="project-wheel-float">
              <img
                src={wheel}
                alt=""
                aria-hidden="true"
                className="projects-wheel-image project-wheel-rotate h-40 w-40 object-contain drop-shadow-[0_0_30px_rgba(255,255,255,0.08)] sm:h-44 sm:w-44 md:h-48 md:w-48 lg:h-56 lg:w-56"
              />
            </div>
          </div>
        </div>

        <div className="projects-content-grid relative z-10 mt-11 grid items-stretch gap-5 sm:mt-14 lg:mt-16 lg:grid-cols-[1.35fr_1fr]">
          <div
            ref={imgRef}
            className={`project-image-entrance h-full ${
              imgIn ? '' : 'opacity-0'
            }`}
          >
            <Link to="/projects" className="group block h-full">
              <div className="projects-main-image relative h-full min-h-[300px] overflow-hidden rounded-xl border border-white/10 bg-[#0B0B0B] transition-all duration-500 group-hover:border-digi-red/40 group-hover:shadow-[0_20px_50px_-20px_rgba(208,16,31,0.5)] sm:min-h-[350px] lg:min-h-[435px]">
                <div
                  className="absolute inset-0 transition-transform duration-[1600ms] ease-out"
                  style={{
                    transform: imgIn ? 'scale(1)' : 'scale(1.18)'
                  }}
                >
                  <SafeImage
                    src={mainImage}
                    alt="Featured DigiAmplify project"
                    className="h-full w-full object-cover transition duration-700 group-hover:scale-105"
                  />
                </div>

                <div className="project-red-glow pointer-events-none absolute inset-0 bg-gradient-to-tr from-digi-red/10 via-transparent to-transparent" />

                <div className="pointer-events-none absolute inset-x-0 bottom-0 h-24 bg-gradient-to-t from-black/50 to-transparent" />

                <span className="absolute right-4 top-4 flex h-10 w-10 items-center justify-center rounded-full bg-digi-red text-white opacity-0 shadow-[0_0_25px_rgba(208,16,31,0.35)] transition-all duration-500 group-hover:rotate-12 group-hover:opacity-100 sm:right-5 sm:top-5">
                  <ArrowUpRight size={18} />
                </span>
              </div>
            </Link>
          </div>

          <div
            ref={slateRef}
            className="flex flex-col gap-4"
          >
            <div
              className="projects-side-panel project-panel-entrance rounded-xl bg-[#0d0d0d] p-5 sm:px-7 sm:py-6"
              style={{
                opacity: slateIn ? 1 : 0
              }}
            >
              <p className="text-xs text-white/50">
                {slate.label}
              </p>

              <div className="projects-side-items mt-6 space-y-3.5 sm:mt-7">
                {slate.items.map((item, index) => (
                  <SlateItem
                    key={item.id}
                    item={item}
                    index={index}
                    play={slateIn}
                  />
                ))}
              </div>
            </div>

            <div
              ref={horizontalRef}
              className={`projects-horizontal rounded-xl bg-[#0d0d0d] p-5 transition-colors duration-500 hover:bg-[#121212] sm:px-7 sm:py-6 ${
                horizontalIn
                  ? 'project-horizontal-entrance'
                  : 'opacity-0'
              }`}
            >
              <p className="text-xs text-white/50">
                {horizontal.label}
              </p>

              <p className="mt-3 text-[12px] leading-[1.75] text-white sm:text-[13px] sm:leading-relaxed">
                {horizontal.text}
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}

export default ProjectsShowcase