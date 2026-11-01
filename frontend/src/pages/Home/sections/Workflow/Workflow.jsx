import { ArrowRight } from 'lucide-react'
import { workflowContent } from '@/data/home/workflow'
import { Reveal } from '@/components/common'

function StageCard({ stage, index, description }) {
  return (
    <div className="workflow-card group relative flex h-full min-h-[190px] flex-col overflow-hidden rounded-xl border border-white/15 bg-gradient-to-b from-[#1a1a1a] to-[#0b0b0b] p-3.5 transition-all duration-500 hover:-translate-y-1.5 hover:border-digi-red/50 hover:shadow-[0_20px_40px_-20px_rgba(208,16,31,0.5)] sm:min-h-[200px] sm:p-4 lg:min-h-[190px] lg:p-3.5">
      <div className="workflow-number relative overflow-hidden border-b border-white/10 pb-3">
        <p className="text-[38px] font-light leading-none tracking-wide text-digi-red transition-transform duration-500 group-hover:translate-x-1 sm:text-[42px]">
          {String(index + 1).padStart(2, '0')}
        </p>
      </div>

      <div className="mt-5 flex items-center justify-between gap-3">
        <h3 className="text-[13px] font-normal text-white sm:text-[14px] lg:text-[13px]">
          {stage.title}
        </h3>

        <ArrowRight
          size={18}
          className="shrink-0 text-white transition-all duration-300 group-hover:translate-x-1.5 group-hover:text-digi-red"
        />
      </div>

      <p className="mt-4 max-w-[280px] text-[10px] leading-[1.65] text-white/90 sm:text-[11px] lg:text-[10px]">
        {description}
      </p>

      <div className="absolute bottom-0 left-0 h-px w-0 bg-digi-red transition-all duration-500 group-hover:w-full" />

      <div className="pointer-events-none absolute -right-10 -top-10 h-24 w-24 rounded-full bg-digi-red/10 opacity-0 blur-2xl transition-opacity duration-500 group-hover:opacity-100" />
    </div>
  )
}

function Workflow() {
  const {
    title,
    highlight,
    description,
    badge,
    stageDescription,
    stages
  } = workflowContent

  const rest = title.startsWith(highlight)
    ? title.slice(highlight.length)
    : title

  return (
    <section className="workflow-section section-space relative overflow-hidden border-b border-white/10 bg-black pb-16 pt-16 sm:pb-20 sm:pt-20 md:pb-20 md:pt-20 lg:pb-24 lg:pt-24">
      <style>{`
        @keyframes workflowTitleIn {
          0% {
            opacity: 0;
            transform: translateX(-45px);
            filter: blur(8px);
          }
          100% {
            opacity: 1;
            transform: translateX(0);
            filter: blur(0);
          }
        }

        @keyframes workflowDescriptionIn {
          0% {
            opacity: 0;
            transform: translateX(-35px);
            filter: blur(5px);
          }
          100% {
            opacity: 1;
            transform: translateX(0);
            filter: blur(0);
          }
        }

        @keyframes workflowBadgeIn {
          0% {
            opacity: 0;
            transform: translateX(35px);
            filter: blur(5px);
          }
          100% {
            opacity: 1;
            transform: translateX(0);
            filter: blur(0);
          }
        }

        @keyframes workflowCardIn {
          0% {
            opacity: 0;
            transform: translateX(-45px) translateY(18px);
            filter: blur(7px);
          }
          100% {
            opacity: 1;
            transform: translateX(0) translateY(0);
            filter: blur(0);
          }
        }

        @keyframes workflowLineIn {
          0% {
            transform: scaleX(0);
            transform-origin: left;
            opacity: 0;
          }
          100% {
            transform: scaleX(1);
            transform-origin: left;
            opacity: 1;
          }
        }

        .workflow-title-animation {
          animation: workflowTitleIn 0.85s cubic-bezier(0.22, 1, 0.36, 1) both;
        }

        .workflow-description-animation {
          animation: workflowDescriptionIn 0.85s cubic-bezier(0.22, 1, 0.36, 1) 0.12s both;
        }

        .workflow-badge-animation {
          animation: workflowBadgeIn 0.8s cubic-bezier(0.22, 1, 0.36, 1) 0.25s both;
        }

        .workflow-card-animation {
          animation: workflowCardIn 0.8s cubic-bezier(0.22, 1, 0.36, 1) both;
        }

        .workflow-top-line {
          animation: workflowLineIn 1.1s cubic-bezier(0.22, 1, 0.36, 1) 0.15s both;
        }

        .workflow-card:nth-child(1) {
          animation-delay: 0.15s;
        }

        .workflow-card:nth-child(2) {
          animation-delay: 0.25s;
        }

        .workflow-card:nth-child(3) {
          animation-delay: 0.35s;
        }

        .workflow-card:nth-child(4) {
          animation-delay: 0.45s;
        }

        .workflow-card:nth-child(5) {
          animation-delay: 0.55s;
        }

        .workflow-card:nth-child(6) {
          animation-delay: 0.65s;
        }

        .workflow-card:nth-child(7) {
          animation-delay: 0.75s;
        }

        @media (max-width: 1023px) {
          .workflow-section .container-shell {
            padding-left: 24px;
            padding-right: 24px;
          }

          .workflow-heading {
            max-width: 600px;
          }

          .workflow-description-row {
            gap: 24px;
          }

          .workflow-description {
            max-width: 650px;
          }

          .workflow-badge {
            align-self: flex-start;
          }
        }

        @media (max-width: 767px) {
          .workflow-section .container-shell {
            padding-left: 18px;
            padding-right: 18px;
          }

          .workflow-heading {
            max-width: 500px;
            font-size: 32px;
            line-height: 1.2;
            letter-spacing: -0.4px;
          }

          .workflow-description {
            max-width: 100%;
            font-size: 13px;
            line-height: 1.75;
          }

          .workflow-badge {
            padding: 10px 18px;
            font-size: 11px;
          }

          .workflow-cards {
            gap: 12px;
          }

          .workflow-card {
            min-height: 185px;
          }
        }

        @media (max-width: 480px) {
          .workflow-section {
            padding-top: 62px;
            padding-bottom: 62px;
          }

          .workflow-section .container-shell {
            padding-left: 16px;
            padding-right: 16px;
          }

          .workflow-heading {
            font-size: 29px;
            line-height: 1.22;
          }

          .workflow-description-row {
            margin-top: 28px;
          }

          .workflow-description {
            font-size: 12.5px;
            line-height: 1.8;
          }

          .workflow-card {
            min-height: 180px;
            padding: 14px;
          }

          .workflow-card h3 {
            font-size: 12.5px;
          }

          .workflow-card p {
            font-size: 10px;
          }
        }

        @media (prefers-reduced-motion: reduce) {
          .workflow-title-animation,
          .workflow-description-animation,
          .workflow-badge-animation,
          .workflow-card-animation,
          .workflow-top-line {
            animation: none !important;
            opacity: 1 !important;
            transform: none !important;
            filter: none !important;
          }
        }
      `}</style>

      <div className="pointer-events-none absolute inset-x-0 top-0 z-0 h-12 bg-gradient-to-b from-white/10 via-white/[0.04] to-transparent lg:h-[60px]" />

      <div className="pointer-events-none absolute inset-x-0 bottom-0 z-0 h-12 bg-gradient-to-t from-white/10 via-white/[0.04] to-transparent lg:h-[60px]" />

      <div className="workflow-top-line pointer-events-none absolute left-0 top-0 z-10 h-px w-full bg-gradient-to-r from-transparent via-digi-red/40 to-transparent" />

      <div className="container-shell relative z-10 lg:px-10 xl:px-16">
        <Reveal>
          <h2 className="workflow-heading workflow-title-animation max-w-[540px] text-3xl font-light leading-[1.2] text-white sm:text-4xl lg:text-[40px]">
            <span className="text-digi-red">{highlight}</span>
            {rest}
          </h2>
        </Reveal>

        <Reveal delay={0.1}>
          <div className="workflow-description-row mt-8 flex flex-col gap-6 lg:mt-10 lg:flex-row lg:items-center lg:justify-between lg:gap-10">
            <p className="workflow-description workflow-description-animation max-w-[760px] text-[14px] leading-[1.75] text-white sm:text-[15px] sm:leading-relaxed">
              {description}
            </p>

            <div className="workflow-badge workflow-badge-animation inline-flex w-fit shrink-0 items-center rounded-full border border-white/25 px-5 py-2.5 text-[11px] text-white transition-all duration-300 hover:border-digi-red/50 hover:bg-digi-red/5 sm:px-6 sm:py-3 sm:text-xs lg:mr-4">
              {badge}
            </div>
          </div>
        </Reveal>

        <div className="workflow-cards relative z-10 mt-9 grid grid-cols-1 gap-4 sm:mt-10 sm:grid-cols-2 sm:gap-4 lg:grid-cols-4 lg:gap-5 xl:grid-cols-7 xl:gap-7">
          {stages.map((stage, index) => (
            <Reveal
              key={stage.title}
              delay={index * 0.06}
            >
              <div className="workflow-card-animation h-full">
                <StageCard
                  stage={stage}
                  index={index}
                  description={stageDescription}
                />
              </div>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  )
}

export default Workflow