import { Link } from 'react-router-dom'
import { ctaContent } from '@data/home/cta'

export default function CtaCard() {
  const {
    eyebrow,
    title,
    description,
    primaryLabel,
    secondaryLabel,
    primaryLink,
    secondaryLink,
  } = ctaContent

  return (
    <section className="relative overflow-hidden bg-[radial-gradient(ellipse_at_30%_80%,#222_0%,#111_45%,#000_100%)]">
      <style>{`
        @keyframes ctaFadeUp {
          from {
            opacity: 0;
            transform: translateY(18px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        @keyframes ctaGlow {
          0%, 100% {
            opacity: 0.5;
            transform: scale(1);
          }
          50% {
            opacity: 0.9;
            transform: scale(1.2);
          }
        }

        .cta-in {
          opacity: 0;
          animation: ctaFadeUp 0.8s ease-out forwards;
        }

        .cta-glow {
          animation: ctaGlow 5s ease-in-out infinite;
        }

        @media (prefers-reduced-motion: reduce) {
          .cta-in,
          .cta-glow {
            animation: none !important;
            opacity: 1 !important;
          }
        }
      `}</style>

      <div className="container-main py-14 lg:px-10 lg:py-24 xl:px-14">
        <div className="group relative overflow-hidden rounded-2xl border border-white/15 bg-[#111]/80 p-6 transition-colors duration-500 hover:border-white/25 sm:p-8 lg:min-h-[310px] lg:px-10 lg:py-9">
          <div className="cta-glow pointer-events-none absolute right-[8%] top-[10%] h-60 w-60 rounded-full bg-digi-red/20 blur-[75px]" />

          <div className="relative z-10 grid items-center gap-7 lg:grid-cols-[minmax(0,1fr)_290px] lg:gap-12">
            <div>
              <p
                className="cta-in text-[11px] text-white/50"
                style={{ animationDelay: '0ms' }}
              >
                {eyebrow}
              </p>

              <h2
                className="cta-in mt-8 text-2xl font-light leading-tight text-white sm:text-[28px] lg:text-[34px]"
                style={{ animationDelay: '120ms' }}
              >
                Ready To Build Something Extraordinary?
              </h2>
              
              <p
              className="cta-in mt-4 max-w-[600px] text-[16px] leading-7 text-white/90 lg:text-[16px]"
              style={{ animationDelay: '240ms' }}>
                
               If your next Website, identity, or digital product needs to look like market leadership from day one, we should talk.
                </p>

            </div>

            <div
              className="cta-in flex flex-col gap-2.5 lg:pt-2"
              style={{ animationDelay: '360ms' }}
            >
              <Link
                to={primaryLink}
                className="flex items-center justify-center rounded-full bg-digi-red px-4 py-2 text-[13px] font-medium text-white transition-all duration-300 hover:-translate-y-0.5 hover:brightness-125 hover:shadow-[0_8px_22px_-10px_rgba(208,16,31,0.7)]"
              >
                {primaryLabel}
              </Link>

              <a
                href={secondaryLink}
                download
                className="flex items-center justify-center rounded-full border border-white/25 bg-black px-4 py-1.5 text-[11px] text-white transition-all duration-300 hover:-translate-y-0.5 hover:border-digi-red hover:text-digi-red"
              >
                {secondaryLabel}
              </a>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}