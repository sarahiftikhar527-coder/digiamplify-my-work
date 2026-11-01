import { useState } from 'react'
import { ShieldCheck, Star, ArrowLeft, ArrowRight } from 'lucide-react'
import { reviews, reviewsMeta } from '@/data/home/reviews'
import { Reveal } from '@/components/common'

function ClientReviews() {
  const [activeIndex, setActiveIndex] = useState(0)
  const activeReview = reviews[activeIndex]

  const { title, highlight, sentiment, badge, impact } = reviewsMeta

  const previous = () => {
    setActiveIndex(
      (current) => (current - 1 + reviews.length) % reviews.length
    )
  }

  const next = () => {
    setActiveIndex((current) => (current + 1) % reviews.length)
  }

  return (
    <section className="section-space relative overflow-hidden border-b border-white/10 bg-[radial-gradient(ellipse_at_center,#3a3a3a_0%,#1c1c1c_55%,#0a0a0a_100%)] pb-12 pt-8 sm:pb-16 sm:pt-12 lg:pb-24 lg:pt-16">
      <style>{`
        @keyframes reviewCardIn {
          0% {
            opacity: 0;
            transform: translateY(25px);
          }

          100% {
            opacity: 1;
            transform: translateY(0);
          }
        }

        @keyframes leftContentIn {
          0% {
            opacity: 0;
            transform: translateX(-30px);
          }

          100% {
            opacity: 1;
            transform: translateX(0);
          }
        }

        @keyframes middleContentIn {
          0% {
            opacity: 0;
            transform: translateY(25px);
          }

          100% {
            opacity: 1;
            transform: translateY(0);
          }
        }

        @keyframes rightContentIn {
          0% {
            opacity: 0;
            transform: translateX(30px);
          }

          100% {
            opacity: 1;
            transform: translateX(0);
          }
        }

        @keyframes reviewSwap {
          0% {
            opacity: 0;
            transform: translateY(12px);
            filter: blur(4px);
          }

          100% {
            opacity: 1;
            transform: translateY(0);
            filter: blur(0);
          }
        }

        @keyframes scoreIn {
          0% {
            opacity: 0;
            transform: translateY(12px);
          }

          100% {
            opacity: 1;
            transform: translateY(0);
          }
        }

        @keyframes starPop {
          0% {
            opacity: 0;
            transform: scale(0.5);
          }

          70% {
            transform: scale(1.12);
          }

          100% {
            opacity: 1;
            transform: scale(1);
          }
        }

        @keyframes impactItemIn {
          0% {
            opacity: 0;
            transform: translateY(10px);
          }

          100% {
            opacity: 1;
            transform: translateY(0);
          }
        }

        @keyframes buttonPulse {
          0%,
          100% {
            box-shadow: 0 0 0 0 rgba(208, 16, 31, 0);
          }

          50% {
            box-shadow: 0 0 0 5px rgba(208, 16, 31, 0.08);
          }
        }

        .review-main-box {
          animation: reviewCardIn 0.8s cubic-bezier(0.22, 1, 0.36, 1) both;
        }

        .left-review-content {
          animation: leftContentIn 0.8s cubic-bezier(0.22, 1, 0.36, 1) both;
        }

        .middle-review-content {
          animation: middleContentIn 0.8s cubic-bezier(0.22, 1, 0.36, 1) both;
        }

        .right-review-content {
          animation: rightContentIn 0.8s cubic-bezier(0.22, 1, 0.36, 1) both;
        }

        .review-swap {
          animation: reviewSwap 0.6s cubic-bezier(0.22, 1, 0.36, 1) both;
        }

        .score-in {
          animation: scoreIn 0.7s cubic-bezier(0.22, 1, 0.36, 1) 0.1s both;
        }

        .star-pop {
          opacity: 0;
          animation: starPop 0.5s cubic-bezier(0.22, 1, 0.36, 1) forwards;
        }

        .impact-item {
          animation: impactItemIn 0.55s cubic-bezier(0.22, 1, 0.36, 1) both;
        }

        .next-button {
          animation: buttonPulse 2.8s ease-in-out infinite;
        }

        @media (prefers-reduced-motion: reduce) {
          .review-main-box,
          .left-review-content,
          .middle-review-content,
          .right-review-content,
          .review-swap,
          .score-in,
          .star-pop,
          .impact-item,
          .next-button {
            animation: none !important;
            opacity: 1 !important;
            transform: none !important;
            filter: none !important;
          }
        }

        @media (max-width: 1199px) {
          .reviews-container {
            padding-left: 2rem;
            padding-right: 2rem;
          }

          .review-grid {
            grid-template-columns:
              minmax(0, 0.9fr)
              minmax(0, 1.35fr)
              minmax(0, 0.9fr);
          }

          .review-content-text {
            font-size: 29px !important;
          }
        }

        @media (max-width: 1023px) {
          .reviews-container {
            padding-left: 1.5rem;
            padding-right: 1.5rem;
          }

          .review-grid {
            grid-template-columns: repeat(2, minmax(0, 1fr));
            gap: 16px;
          }

          .review-card-middle {
            grid-column: span 1;
            grid-row: 1;
          }

          .review-card-left {
            grid-column: span 1;
            grid-row: 1;
          }

          .review-card-right {
            display: none;
          }

          .review-card-left,
          .review-card-middle {
            min-height: 360px;
          }

          .review-content-text {
            font-size: 27px !important;
            line-height: 1.3 !important;
          }

          .responsive-review-buttons {
            display: flex;
          }

          .desktop-review-buttons {
            display: none;
          }
        }

        @media (min-width: 1024px) {
          .responsive-review-buttons {
            display: none;
          }

          .desktop-review-buttons {
            display: flex;
          }
        }

        @media (max-width: 767px) {
          .reviews-container {
            padding-left: 1rem;
            padding-right: 1rem;
          }

          .review-grid {
            grid-template-columns: 1fr;
            gap: 12px;
          }

          .review-card-left,
          .review-card-middle {
            grid-column: span 1;
            grid-row: auto;
            min-height: auto;
            padding: 18px;
            border-radius: 15px;
          }

          .review-card-left {
            min-height: 285px;
          }

          .review-card-middle {
            min-height: 330px;
          }

          .review-card-right {
            display: none;
          }

          .review-content-text {
            font-size: 22px !important;
            line-height: 1.32 !important;
            letter-spacing: -0.5px !important;
          }

          .score-in {
            margin-top: 18px;
            font-size: 52px !important;
          }

          .review-card-left .mt-6 {
            margin-top: 16px;
          }

          .review-card-left p {
            font-size: 10.5px;
            line-height: 1.7;
          }

          .review-card-middle .review-swap.mt-7 {
            margin-top: 22px;
          }

          .review-author {
            gap: 10px;
          }

          .review-type {
            width: fit-content;
            max-width: 100%;
            white-space: normal;
            text-align: center;
          }

          .responsive-review-buttons {
            width: 100%;
            margin-top: 20px;
            gap: 8px;
          }

          .responsive-review-buttons button {
            min-height: 38px;
            flex: 1;
          }
        }

        @media (max-width: 480px) {
          .reviews-container {
            padding-left: 14px;
            padding-right: 14px;
          }

          .review-grid {
            gap: 10px;
          }

          .review-card-left {
            min-height: 275px;
          }

          .review-card-middle {
            min-height: 315px;
          }

          .review-card-left,
          .review-card-middle {
            padding: 17px;
          }

          .score-in {
            font-size: 48px !important;
            letter-spacing: -2px !important;
          }

          .review-card-left p {
            font-size: 10px;
            line-height: 1.65;
          }

          .review-content-text {
            font-size: 20px !important;
            line-height: 1.3 !important;
          }

          .review-card-middle .inline-flex {
            max-width: calc(100% - 30px);
            padding-left: 9px;
            padding-right: 9px;
            font-size: 7px;
          }

          .review-card-middle .review-author {
            align-items: flex-start;
            flex-direction: column;
          }

          .review-type {
            padding-left: 12px;
            padding-right: 12px;
          }

          .responsive-review-buttons {
            margin-top: 18px;
          }

          .responsive-review-buttons button {
            min-height: 36px;
            padding-left: 10px;
            padding-right: 10px;
            font-size: 8px;
          }
        }
      `}</style>

      <div className="pointer-events-none absolute inset-x-0 top-0 z-0 h-10 bg-gradient-to-b from-white/10 to-transparent" />

      <div className="pointer-events-none absolute inset-x-0 bottom-0 z-0 h-10 bg-gradient-to-t from-white/10 to-transparent" />

      <div className="reviews-container container-shell relative z-10 pt-4 sm:pt-6 lg:px-16 lg:pt-0 xl:px-24">
        <Reveal>
          <div className="text-center">
            <h2 className="text-3xl font-light tracking-[-0.7px] text-white sm:text-4xl lg:text-[40px]">
              {title}{' '}
              <span className="text-digi-red">{highlight}</span>
            </h2>

            <div className="mx-auto mt-4 h-px w-14 bg-digi-red/70" />
          </div>
        </Reveal>

        <Reveal delay={0.1}>
          <div className="review-main-box mt-8 sm:mt-10 lg:mt-12">
            <div className="review-grid grid items-stretch gap-4 lg:grid-cols-[minmax(0,0.9fr)_minmax(0,1.35fr)_minmax(0,0.9fr)] lg:gap-5">
              <div className="review-card-left left-review-content flex flex-col justify-between rounded-2xl border border-white/10 bg-[#0d0d0d] p-6 transition-all duration-500 hover:border-digi-red/30 hover:shadow-[0_20px_50px_-30px_rgba(208,16,31,0.45)] lg:min-h-[400px] lg:p-7">
                <div>
                  <div className="flex items-center justify-between">
                    <p className="text-[10px] uppercase tracking-[0.14em] text-white/45">
                      {sentiment.label}
                    </p>

                    <span className="h-1.5 w-1.5 rounded-full bg-digi-red shadow-[0_0_12px_rgba(208,16,31,0.8)]" />
                  </div>

                  <p className="score-in mt-6 text-6xl font-light tracking-[-3px] text-digi-red lg:text-[68px]">
                    {sentiment.score}
                  </p>

                  <div className="mt-3 flex items-center gap-1">
                    {[0, 1, 2, 3, 4].map((i) => (
                      <Star
                        key={i}
                        size={15}
                        strokeWidth={1.5}
                        className="star-pop text-white/45"
                        style={{
                          animationDelay: `${250 + i * 70}ms`,
                        }}
                      />
                    ))}
                  </div>

                  <p className="mt-6 max-w-[300px] text-[12px] leading-[1.75] text-white/70 lg:text-[13px]">
                    {sentiment.text}
                  </p>
                </div>

                <div>
                  <div className="mt-7 h-px w-full bg-white/10" />

                  <p className="mt-3 text-[9px] uppercase tracking-[0.16em] text-white/35">
                    Trusted by ambitious brands
                  </p>
                </div>
              </div>

              <div className="review-card-middle middle-review-content flex flex-col justify-between rounded-2xl border border-white/10 bg-[#0d0d0d] p-6 transition-all duration-500 hover:border-white/20 hover:shadow-[0_25px_70px_-35px_rgba(0,0,0,0.9)] lg:min-h-[400px] lg:p-7">
                <div>
                  <div className="flex items-center justify-between gap-3">
                    <div className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/[0.02] px-3 py-1.5 text-[9px] uppercase tracking-[0.08em] text-white/80 transition-all duration-300 hover:border-digi-red/40 hover:bg-digi-red/[0.04]">
                      <ShieldCheck
                        size={13}
                        strokeWidth={1.7}
                        className="shrink-0 text-digi-red"
                      />

                      <span>{badge}</span>
                    </div>

                    <span className="shrink-0 text-[8px] text-digi-red">
                      LIVE
                    </span>
                  </div>

                  <p
                    key={`review-${activeReview.id}`}
                    className="review-swap review-content-text mt-7 max-w-[580px] text-[28px] font-light leading-[1.25] tracking-[-0.8px] text-white lg:text-[32px]"
                  >
                    {activeReview.review}
                  </p>
                </div>

                <div
                  key={`author-${activeReview.id}`}
                  className="review-swap mt-7 border-t border-white/10 pt-5"
                >
                  <div className="review-author flex flex-wrap items-center justify-between gap-4">
                    <div className="flex min-w-0 items-center gap-3">
                      <div className="relative h-10 w-10 shrink-0 overflow-hidden rounded-full border border-white/10 bg-[#d9d9d9] sm:h-11 sm:w-11">
                        <div className="absolute inset-0 bg-gradient-to-br from-white/60 via-transparent to-black/20" />
                      </div>

                      <div className="min-w-0">
                        <p className="truncate text-[12px] font-semibold text-white">
                          {activeReview.name}
                        </p>

                        <p className="mt-0.5 truncate text-[10px] text-white/50 sm:text-[11px]">
                          {activeReview.email}
                        </p>
                      </div>
                    </div>

                    <span className="review-type rounded-full border border-white/15 px-4 py-1.5 text-[9px] uppercase tracking-[0.08em] text-white/70">
                      {activeReview.type}
                    </span>
                  </div>
                </div>

                <div className="responsive-review-buttons mt-5 hidden items-center justify-end gap-2 border-t border-white/10 pt-4">
                  <button
                    type="button"
                    onClick={previous}
                    className="group flex min-h-[38px] items-center justify-center gap-1.5 rounded-full border border-white/20 px-4 py-2 text-[9px] text-white/70 transition-all duration-300 hover:border-digi-red/60 hover:text-white"
                    aria-label="Previous review"
                  >
                    <ArrowLeft
                      size={12}
                      className="transition-transform duration-300 group-hover:-translate-x-0.5"
                    />

                    Previous
                  </button>

                  <button
                    type="button"
                    onClick={next}
                    className="next-button group flex min-h-[38px] items-center justify-center gap-1.5 rounded-full bg-digi-red px-4 py-2 text-[9px] text-white transition-all duration-300 hover:brightness-125"
                    aria-label="Next review"
                  >
                    Next

                    <ArrowRight
                      size={12}
                      className="transition-transform duration-300 group-hover:translate-x-0.5"
                    />
                  </button>
                </div>
              </div>

              <div className="review-card-right right-review-content flex flex-col rounded-2xl border border-white/10 bg-[#0d0d0d] p-6 transition-all duration-500 hover:border-digi-red/25 hover:shadow-[0_20px_50px_-30px_rgba(208,16,31,0.35)] lg:min-h-[400px] lg:p-7">
                <div>
                  <div className="flex items-center justify-between">
                    <p className="text-[10px] uppercase tracking-[0.14em] text-white/45">
                      {impact.label}
                    </p>

                    <span className="h-1.5 w-1.5 rounded-full bg-digi-red shadow-[0_0_12px_rgba(208,16,31,0.8)]" />
                  </div>

                  <div className="mt-8 space-y-6">
                    {impact.items.slice(0, 2).map((item, index) => (
                      <div
                        key={item.label}
                        className="impact-item border-b border-white/[0.08] pb-5 last:border-0 last:pb-0"
                        style={{
                          animationDelay: `${250 + index * 100}ms`,
                        }}
                      >
                        <p className="text-3xl font-light tracking-[-1px] text-digi-red lg:text-[38px]">
                          {item.value}
                        </p>

                        <p className="mt-1.5 max-w-[170px] text-[10px] leading-[1.6] text-white/55">
                          {item.label}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="desktop-review-buttons mt-8 items-center justify-end gap-2 border-t border-white/10 pt-5 sm:mt-auto">
                  <button
                    type="button"
                    onClick={previous}
                    className="group flex min-h-[38px] items-center justify-center gap-1.5 rounded-full border border-white/20 px-3.5 py-2 text-[9px] text-white/70 transition-all duration-300 hover:-translate-x-0.5 hover:border-digi-red/60 hover:text-white"
                    aria-label="Previous review"
                  >
                    <ArrowLeft
                      size={12}
                      className="transition-transform duration-300 group-hover:-translate-x-0.5"
                    />

                    Previous
                  </button>

                  <button
                    type="button"
                    onClick={next}
                    className="next-button group flex min-h-[38px] items-center justify-center gap-1.5 rounded-full bg-digi-red px-4 py-2 text-[9px] text-white transition-all duration-300 hover:-translate-y-0.5 hover:brightness-125"
                    aria-label="Next review"
                  >
                    Next

                    <ArrowRight
                      size={12}
                      className="transition-transform duration-300 group-hover:translate-x-0.5"
                    />
                  </button>
                </div>
              </div>
            </div>
          </div>
        </Reveal>

        <div className="mt-5 flex items-center justify-center gap-1.5">
          {reviews.map((review, index) => (
            <button
              key={review.id}
              type="button"
              onClick={() => setActiveIndex(index)}
              aria-label={`Go to review ${index + 1}`}
              className={`h-1.5 rounded-full transition-all duration-500 ${
                index === activeIndex
                  ? 'w-7 bg-digi-red'
                  : 'w-1.5 bg-white/25 hover:bg-white/50'
              }`}
            />
          ))}
        </div>
      </div>
    </section>
  )
}

export default ClientReviews