import { useEffect, useRef, useState } from 'react'
import { Gauge, Rocket, Smile, Users } from 'lucide-react'
import { numbersContent } from '@/data/home/numbers'
import { Reveal } from '@/components/common'

const icons = {
  users: Users,
  gauge: Gauge,
  smile: Smile,
  rocket: Rocket
}

const barColors = ['#2a2a2a', '#4a4a4a', '#777777', '#4a0a0f', '#D0101F']

function useInView(threshold = 0.3) {
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

function useCountUp(text, start, duration = 1600) {
  const parsed = String(text).match(/^([^\d]*)([\d.]+)(.*)$/)

  const prefix = parsed ? parsed[1] : ''
  const target = parsed ? parseFloat(parsed[2]) : 0
  const suffix = parsed ? parsed[3] : ''

  const decimals =
    parsed && parsed[2].includes('.')
      ? parsed[2].split('.')[1].length
      : 0

  const [value, setValue] = useState(0)

  useEffect(() => {
    if (!start || !parsed) return

    let raf
    const startTime = performance.now()

    const tick = (now) => {
      const progress = Math.min(
        (now - startTime) / duration,
        1
      )

      const eased =
        1 - Math.pow(1 - progress, 3)

      setValue(target * eased)

      if (progress < 1) {
        raf = requestAnimationFrame(tick)
      } else {
        setValue(target)
      }
    }

    raf = requestAnimationFrame(tick)

    return () => {
      if (raf) cancelAnimationFrame(raf)
    }
  }, [start, target, duration])

  if (!parsed) return text

  return `${prefix}${value.toFixed(decimals)}${suffix}`
}

function CountText({ text, start }) {
  return <>{useCountUp(text, start)}</>
}

function AnimatedHeading({ start, highlight }) {
  const words = start.trim().split(/\s+/)
  const highlightWords = highlight.trim().split(/\s+/)

  const all = [
    ...words.map((word) => ({
      word,
      red: false
    })),
    ...highlightWords.map((word) => ({
      word,
      red: true
    }))
  ]

  return (
    <h2 className="numbers-heading max-w-[720px] text-[34px] font-light leading-[1.15] tracking-[-0.6px] text-white min-[400px]:text-[36px] sm:text-[39px] md:text-[42px] lg:text-[40px] xl:text-[44px]">
      {all.map((item, index) => (
        <span
          key={`${item.word}-${index}`}
          className={`word-in mr-[0.28em] inline-block ${
            item.red ? 'text-digi-red' : ''
          }`}
          style={{
            animationDelay: `${index * 90}ms`
          }}
        >
          {item.word}
          {item.red && index === all.length - 1 && (
            <span className="text-white">.</span>
          )}
        </span>
      ))}
    </h2>
  )
}

function AnimatedDescription({ text }) {
  const words = text.trim().split(/\s+/)

  return (
    <p className="numbers-description mt-7 max-w-[430px] text-[14px] leading-[1.8] text-white sm:mt-9 sm:max-w-[500px] sm:text-[15px] lg:mt-11 lg:max-w-[300px]">
      {words.map((word, index) => (
        <span
          key={`${word}-${index}`}
          className="description-word mr-[0.28em] inline-block"
          style={{
            animationDelay: `${index * 30 + 300}ms`
          }}
        >
          {word}
        </span>
      ))}
    </p>
  )
}

function Bars({ values, play }) {
  return (
    <div className="numbers-bars flex h-[88px] items-end gap-[5px] sm:h-[96px] sm:gap-1.5 md:h-[105px]">
      {values.map((value, index) => (
        <div
          key={index}
          className="w-[8px] origin-bottom rounded-full transition-[height,filter] duration-[900ms] group-hover:brightness-125 sm:w-[10px] md:w-[12px]"
          style={{
            height: play ? `${value}%` : '0%',
            backgroundColor: barColors[index],
            transitionTimingFunction:
              'cubic-bezier(0.34, 1.56, 0.64, 1)',
            transitionDelay: `${index * 110}ms`
          }}
        />
      ))}
    </div>
  )
}

function StatCard({ metric, description }) {
  const Icon = icons[metric.icon]
  const [ref, inView] = useInView(0.15)

  return (
    <div
      ref={ref}
      className="group relative flex h-full min-h-[225px] flex-col overflow-hidden rounded-[18px] border border-white/10 bg-[#0a0a0a] p-5 opacity-0 transition-all duration-500 hover:-translate-y-1.5 hover:border-digi-red/40 hover:shadow-[0_20px_50px_-20px_rgba(208,16,31,0.4)] animate-number-card sm:min-h-[240px] sm:p-5 md:min-h-[250px] md:p-6"
    >
      <div className="glow-pulse pointer-events-none absolute -right-8 -top-8 h-32 w-32 rounded-full bg-digi-red/20 blur-3xl" />

      <div className="relative flex items-center gap-3">
        <span className="relative flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-digi-red/60 bg-[#2a0508]">
          <span className="ring-ping absolute inset-0 rounded-full border border-digi-red/50" />

          <Icon
            size={17}
            strokeWidth={1.6}
            className="text-digi-red transition-transform duration-500 group-hover:scale-110 group-hover:rotate-6"
          />
        </span>

        <p className="text-[13px] font-normal text-white sm:text-sm">
          {metric.title}
        </p>
      </div>

      <div className="relative mt-auto flex items-end justify-between gap-4 pt-8">
        <div className="min-w-0">
          <p className="text-[34px] font-light leading-none tabular-nums tracking-[-1px] text-white sm:text-[38px]">
            <CountText
              text={metric.value}
              start={inView}
            />
          </p>

          <p className="mt-4 max-w-[185px] text-[11px] leading-[1.7] text-white/80 sm:text-[12px]">
            {description}
          </p>
        </div>

        <div className="shrink-0">
          <Bars
            values={metric.values}
            play={inView}
          />
        </div>
      </div>
    </div>
  )
}

function PerformanceCard({ performance }) {
  const [ref, inView] = useInView(0.2)

  return (
    <div
      ref={ref}
      className="group rounded-[14px] border border-white/10 bg-[#0b0b0b] p-4 transition-all duration-500 hover:border-digi-red/35 hover:bg-[#0d0d0d] hover:shadow-[0_12px_35px_-18px_rgba(208,16,31,0.5)] sm:p-5"
    >
      <div className="flex items-center justify-between gap-4">
        <p className="text-[10px] uppercase tracking-[0.12em] text-white/45 sm:text-[11px]">
          {performance.label}
        </p>

        <span className="h-1.5 w-1.5 rounded-full bg-digi-red shadow-[0_0_10px_rgba(208,16,31,0.8)]" />
      </div>

      <div className="mt-5 grid grid-cols-2 gap-3 sm:gap-5">
        {performance.items.map((item) => (
          <div
            key={item.label}
            className="rounded-lg border border-white/[0.06] bg-white/[0.02] px-3 py-3 text-center"
          >
            <p className="text-[21px] font-medium tabular-nums text-digi-red sm:text-2xl">
              <CountText
                text={item.value}
                start={inView}
              />
            </p>

            <p className="mt-1 text-[9px] text-white/75 sm:text-[10px]">
              {item.label}
            </p>
          </div>
        ))}
      </div>
    </div>
  )
}

function Numbers() {
  const {
    titleStart,
    highlight,
    description,
    performance,
    metricDescription,
    metrics
  } = numbersContent

  return (
    <section className="section-space relative overflow-hidden border-b border-white/10 bg-black pb-16 pt-16 sm:pb-20 sm:pt-20 md:pb-20 md:pt-20 lg:pb-24 lg:pt-24">
      <style>{`
        @keyframes wordIn {
          from {
            opacity: 0;
            transform: translateY(18px);
            filter: blur(6px);
          }

          to {
            opacity: 1;
            transform: translateY(0);
            filter: blur(0);
          }
        }

        @keyframes descriptionIn {
          from {
            opacity: 0;
            transform: translateX(-22px);
            filter: blur(4px);
          }

          to {
            opacity: 1;
            transform: translateX(0);
            filter: blur(0);
          }
        }

        @keyframes numberCardIn {
          from {
            opacity: 0;
            transform: translateX(35px) translateY(12px);
            filter: blur(5px);
          }

          to {
            opacity: 1;
            transform: translateX(0) translateY(0);
            filter: blur(0);
          }
        }

        @keyframes performanceIn {
          from {
            opacity: 0;
            transform: translateX(-25px);
          }

          to {
            opacity: 1;
            transform: translateX(0);
          }
        }

        @keyframes glowPulse {
          0%, 100% {
            opacity: 0.35;
            transform: scale(1);
          }

          50% {
            opacity: 0.75;
            transform: scale(1.2);
          }
        }

        @keyframes ringPing {
          0% {
            transform: scale(1);
            opacity: 0.7;
          }

          80%, 100% {
            transform: scale(1.7);
            opacity: 0;
          }
        }

        .word-in {
          opacity: 0;
          animation: wordIn 0.7s ease-out forwards;
        }

        .description-word {
          opacity: 0;
          animation: descriptionIn 0.65s cubic-bezier(0.22, 1, 0.36, 1) forwards;
        }

        .animate-number-card {
          animation: numberCardIn 0.8s cubic-bezier(0.22, 1, 0.36, 1) forwards;
        }

        .glow-pulse {
          animation: glowPulse 4s ease-in-out infinite;
        }

        .ring-ping {
          animation: ringPing 2.6s ease-out infinite;
        }

        .performance-animate {
          animation: performanceIn 0.8s cubic-bezier(0.22, 1, 0.36, 1) forwards;
        }

        @media (prefers-reduced-motion: reduce) {
          .word-in,
          .description-word,
          .animate-number-card,
          .glow-pulse,
          .ring-ping,
          .performance-animate {
            animation: none !important;
            opacity: 1 !important;
            transform: none !important;
            filter: none !important;
          }
        }

        @media (max-width: 1023px) {
          .numbers-content {
            width: 100%;
          }

          .numbers-heading {
            max-width: 700px;
          }

          .numbers-description {
            max-width: 560px !important;
          }

          .numbers-performance {
            max-width: 440px;
          }
        }

        @media (max-width: 767px) {
          .numbers-heading {
            max-width: 520px !important;
          }

          .numbers-performance {
            max-width: 100%;
          }
        }

        @media (max-width: 640px) {
          .numbers-heading {
            font-size: 31px !important;
            line-height: 1.2 !important;
            letter-spacing: -0.45px !important;
          }

          .numbers-description {
            max-width: 340px !important;
            font-size: 13px !important;
            line-height: 1.75 !important;
          }

          .numbers-bars {
            height: 76px !important;
            gap: 5px !important;
          }

          .numbers-bars > div {
            width: 7px !important;
          }
        }
      `}</style>

      <div className="pointer-events-none absolute inset-x-0 top-0 h-12 bg-gradient-to-b from-white/10 to-transparent" />

      <div className="pointer-events-none absolute inset-x-0 bottom-0 h-12 bg-gradient-to-t from-white/10 to-transparent" />

      <div className="container-shell relative z-10">
        <div className="numbers-content grid items-stretch gap-9 lg:grid-cols-[minmax(0,1.15fr)_minmax(0,2fr)] lg:gap-7 xl:grid-cols-[520px_minmax(0,1fr)]">

          <div className="numbers-left flex h-full flex-col justify-between gap-9 pl-4 sm:pl-6 md:pl-8 lg:pl-16">

            <div>
              <AnimatedHeading
                start={titleStart}
                highlight={highlight}
              />

              <AnimatedDescription text={description} />
            </div>

            <div className="numbers-performance performance-animate">
              <PerformanceCard
                performance={performance}
              />
            </div>

          </div>

          <div className="grid gap-4 sm:grid-cols-2 sm:gap-5">
            {metrics.map((metric, index) => (
              <Reveal
                key={metric.title}
                delay={index * 0.1}
              >
                <StatCard
                  metric={metric}
                  description={metricDescription}
                />
              </Reveal>
            ))}
          </div>

        </div>
      </div>
    </section>
  )
}

export default Numbers