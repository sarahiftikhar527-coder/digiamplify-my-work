import { useEffect, useRef, useState } from 'react'
import { Minus, Plus } from 'lucide-react'
import { faqContent } from '@data/site/faq'

function useInView(threshold = 0.15) {
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

function FaqItem({ item, index, open, onToggle, play }) {
  return (
    <div
      className={`faq-slide-right-left ${
        play ? 'faq-visible' : ''
      }`}
      style={{
        transitionDelay: play ? `${index * 110}ms` : '0ms'
      }}
    >
      <div
        className={`group overflow-hidden rounded-2xl border bg-black transition-all duration-500 ${
          open
            ? 'border-digi-red/45 shadow-[0_15px_45px_-25px_rgba(208,16,31,0.55)]'
            : 'border-white/15 hover:border-digi-red/40 hover:shadow-[0_10px_30px_-15px_rgba(208,16,31,0.45)]'
        }`}
      >
        <button
          type="button"
          onClick={onToggle}
          aria-expanded={open}
          className="flex w-full items-start justify-between gap-4 px-5 py-5 text-left sm:px-6 sm:py-6 lg:px-8"
        >
          <span
            className={`pr-2 text-[14px] font-medium leading-relaxed transition-colors duration-300 sm:text-[15px] lg:text-[17px] ${
              open ? 'text-white' : 'text-white/95'
            }`}
          >
            {item.question}
          </span>

          <span
            className={`relative flex h-8 w-8 shrink-0 items-center justify-center rounded-full border transition-all duration-500 sm:h-9 sm:w-9 ${
              open
                ? 'rotate-180 border-digi-red bg-digi-red/10 text-digi-red'
                : 'border-white/30 text-white group-hover:border-digi-red group-hover:text-digi-red'
            }`}
          >
            {open ? <Minus size={15} /> : <Plus size={15} />}
          </span>
        </button>

        <div
          className={`grid transition-all duration-500 ease-[cubic-bezier(0.22,1,0.36,1)] ${
            open
              ? 'grid-rows-[1fr] opacity-100'
              : 'grid-rows-[0fr] opacity-0'
          }`}
        >
          <div className="overflow-hidden">
            <div className="px-5 pb-5 sm:px-6 sm:pb-6 lg:px-8 lg:pb-7">
              <div className="mb-4 h-px w-full bg-white/10" />

              <p className="max-w-[640px] text-[11px] leading-[1.8] text-white/80 sm:text-[12px] lg:text-[13px] lg:leading-relaxed">
                {item.answer}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default function FaqSection() {
  const {
    eyebrow,
    logo,
    title,
    highlight,
    description,
    items
  } = faqContent

  const [openIndex, setOpenIndex] = useState(0)
  const [sectionRef, sectionIn] = useInView(0.08)
  const [listRef, listIn] = useInView(0.1)

  const [before, after = ''] = title.split(highlight)

  const words = [
    ...before
      .trim()
      .split(' ')
      .filter(Boolean)
      .map((w) => ({
        w,
        red: false
      })),

    ...highlight
      .split(' ')
      .filter(Boolean)
      .map((w) => ({
        w,
        red: true
      })),

    ...after
      .trim()
      .split(' ')
      .filter(Boolean)
      .map((w) => ({
        w,
        red: false
      }))
  ]

  return (
    <section
      ref={sectionRef}
      className="relative overflow-hidden border-b border-white/10 bg-[radial-gradient(ellipse_at_30%_35%,#2b2b2b_0%,#111_45%,#000_100%)] pb-12 pt-2 sm:pb-14 lg:pb-16"
    >
      <style>{`
        @keyframes wordIn {
          from {
            opacity: 0;
            transform: translateX(-22px) translateY(12px);
            filter: blur(6px);
          }

          to {
            opacity: 1;
            transform: translateX(0) translateY(0);
            filter: blur(0);
          }
        }

        @keyframes leftToRight {
          from {
            opacity: 0;
            transform: translateX(-55px);
            filter: blur(5px);
          }

          to {
            opacity: 1;
            transform: translateX(0);
            filter: blur(0);
          }
        }

        @keyframes logoFloat {
          0%,
          100% {
            transform: translateY(0) rotate(0deg);
          }

          50% {
            transform: translateY(-5px) rotate(-3deg);
          }
        }

        @keyframes faqRightToLeft {
          from {
            opacity: 0;
            transform: translateX(100px);
            filter: blur(6px);
          }

          60% {
            opacity: 1;
          }

          to {
            opacity: 1;
            transform: translateX(0);
            filter: blur(0);
          }
        }

        @keyframes faqGlow {
          0%,
          100% {
            box-shadow: 0 0 0 rgba(208, 16, 31, 0);
          }

          50% {
            box-shadow: 0 10px 40px -30px rgba(208, 16, 31, 0.55);
          }
        }

        .word-in {
          opacity: 0;
          animation: wordIn 0.7s cubic-bezier(0.22, 1, 0.36, 1) forwards;
        }

        .left-content-animation {
          opacity: 0;
          transform: translateX(-55px);
        }

        .left-content-animation.left-visible {
          animation: leftToRight 0.85s cubic-bezier(0.22, 1, 0.36, 1) forwards;
        }

        .logo-float {
          animation: logoFloat 5s ease-in-out infinite;
        }

        .faq-slide-right-left {
          opacity: 0;
          transform: translateX(100px);
          filter: blur(6px);
        }

        .faq-slide-right-left.faq-visible {
          animation: faqRightToLeft 0.8s cubic-bezier(0.22, 1, 0.36, 1) forwards;
        }

        .faq-open-glow {
          animation: faqGlow 2.8s ease-in-out infinite;
        }

        @media (max-width: 1023px) {
          .faq-container {
            padding-left: 2rem;
            padding-right: 2rem;
          }

          .faq-layout {
            gap: 3rem;
          }

          .faq-heading {
            max-width: 620px;
          }
        }

        @media (max-width: 767px) {
          .faq-container {
            padding-left: 1rem;
            padding-right: 1rem;
          }

          .faq-layout {
            gap: 2.5rem;
          }

          .faq-heading {
            max-width: 100%;
            font-size: 28px !important;
            line-height: 1.25 !important;
          }

          .faq-description {
            margin-top: 2rem !important;
            max-width: 100% !important;
            font-size: 12px !important;
            line-height: 1.8 !important;
          }

          .faq-eyebrow {
            gap: 0.8rem;
          }

          .faq-logo {
            height: 40px !important;
          }

          .faq-eyebrow-text {
            font-size: 23px !important;
          }

          .faq-slide-right-left {
            transform: translateX(70px);
          }
        }

        @media (max-width: 480px) {
          .faq-heading {
            font-size: 25px !important;
          }

          .faq-description {
            font-size: 11px !important;
          }

          .faq-slide-right-left {
            transform: translateX(55px);
          }
        }

        @media (prefers-reduced-motion: reduce) {
          .word-in,
          .left-content-animation,
          .logo-float,
          .faq-slide-right-left,
          .faq-open-glow {
            animation: none !important;
            opacity: 1 !important;
            transform: none !important;
            filter: none !important;
          }
        }
      `}</style>

      <div className="pointer-events-none absolute inset-x-0 top-0 z-0 h-10 bg-gradient-to-b from-white/10 to-transparent" />

      <div className="faq-container container-main relative z-10 pt-12 sm:pt-14 lg:px-10 lg:pt-16 xl:px-14">
        <div
          className={`faq-eyebrow flex items-center gap-6 ${
            sectionIn ? 'left-content-animation left-visible' : 'left-content-animation'
          }`}
        >
          <img
            src={logo}
            alt=""
            aria-hidden="true"
            className="faq-logo logo-float h-10 w-auto object-contain sm:h-12 lg:h-14"
          />

          <span className="faq-eyebrow-text text-2xl font-light text-digi-red lg:text-[31px]">
            {eyebrow}
          </span>
        </div>

        <div className="faq-layout mt-6 grid gap-10 lg:grid-cols-[0.9fr_1.1fr] lg:gap-16 xl:gap-24">
          <div
            className={`${
              sectionIn
                ? 'left-content-animation left-visible'
                : 'left-content-animation'
            }`}
            style={{
              animationDelay: '180ms'
            }}
          >
            <h2 className="faq-heading max-w-[640px] text-[28px] font-light leading-[1.2] tracking-wide text-white sm:text-[31px] lg:text-[34px]">
              {words.map((item, i) => (
                <span
                  key={`${item.w}-${i}`}
                  className={`word-in mr-[0.25em] inline-block ${
                    item.red ? 'text-digi-red' : ''
                  }`}
                  style={{
                    animationDelay: `${i * 80 + 250}ms`
                  }}
                >
                  {item.w}
                </span>
              ))}
            </h2>

            <p
              className={`faq-description mt-10 max-w-[680px] text-[12px] leading-7 text-white sm:mt-12 sm:text-[13px] lg:mt-14 lg:text-[15px] ${
                sectionIn
                  ? 'left-content-animation left-visible'
                  : 'left-content-animation'
              }`}
              style={{
                animationDelay: '550ms'
              }}
            >
              {description}
            </p>
          </div>

          <div
            ref={listRef}
            className="space-y-3.5 sm:space-y-4"
          >
            {items.map((item, i) => (
              <FaqItem
                key={item.id}
                item={item}
                index={i}
                play={listIn}
                open={openIndex === i}
                onToggle={() =>
                  setOpenIndex(
                    openIndex === i ? -1 : i
                  )
                }
              />
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}