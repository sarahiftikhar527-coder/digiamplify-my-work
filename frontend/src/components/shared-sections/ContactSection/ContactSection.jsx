import { contactContent } from '@data/site/contact'
import ContactForm from './ContactForm'
import ContactInfoCards from './ContactInfoCards'

export default function ContactSection() {
  const { heading, highlight, description, office, mapQuery, globeImage } =
    contactContent

  const mapSrc = `https://maps.google.com/maps?q=${encodeURIComponent(
    mapQuery
  )}&z=12&output=embed`

  const [before, after = ''] = heading.split(highlight)

  const words = [
    ...before
      .trim()
      .split(' ')
      .filter(Boolean)
      .map((w) => ({ w, red: false })),

    ...highlight
      .split(' ')
      .filter(Boolean)
      .map((w) => ({ w, red: true })),

    ...after
      .trim()
      .split(' ')
      .filter(Boolean)
      .map((w) => ({ w, red: false })),
  ]

  return (
    <section className="relative overflow-hidden border-b border-white/10 bg-[radial-gradient(ellipse_at_30%_80%,#222_0%,#111_45%,#0a0a0a_100%)]">
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

        @keyframes fadeUp {
          from {
            opacity: 0;
            transform: translateY(16px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        @keyframes mapIn {
          from {
            opacity: 0;
            transform: translateX(-60px);
            filter: blur(6px);
          }
          to {
            opacity: 1;
            transform: translateX(0);
            filter: blur(0);
          }
        }

        @keyframes globeSpin {
          from {
            transform: rotate(0deg);
          }
          to {
            transform: rotate(360deg);
          }
        }

        @keyframes globeFloat {
          0%,
          100% {
            transform: translateY(0);
          }
          50% {
            transform: translateY(-10px);
          }
        }

        .word-in {
          opacity: 0;
          animation: wordIn 0.7s ease-out forwards;
        }

        .fade-up {
          opacity: 0;
          animation: fadeUp 0.8s ease-out forwards;
        }

        .map-in {
          opacity: 0;
          animation: mapIn 1s ease-out forwards;
        }

        .globe-float {
          animation: globeFloat 6s ease-in-out infinite;
        }

        .globe-spin {
          animation: globeSpin 30s linear infinite;
        }

        .map-dark {
          filter: invert(92%) hue-rotate(180deg) contrast(0.95) saturate(0.8);
        }

        @media (max-width: 1023px) {
          .map-in {
            animation-name: mapIn;
          }
        }

        @media (max-width: 767px) {
          .map-in {
            min-height: 260px;
          }
        }

        @media (prefers-reduced-motion: reduce) {
          .word-in,
          .fade-up,
          .map-in,
          .globe-float,
          .globe-spin {
            animation: none !important;
            opacity: 1 !important;
          }
        }
      `}</style>

      <div className="container-main px-4 py-12 sm:px-6 sm:py-16 md:px-8 lg:px-6 lg:py-24 xl:px-10">
        <div className="grid gap-6 lg:grid-cols-[minmax(280px,355px)_minmax(0,1fr)] lg:gap-7 xl:gap-8">
          <div className="map-in relative min-h-[260px] overflow-hidden rounded-xl border border-white/10 bg-[#13222f] transition-colors duration-500 hover:border-digi-red/40 sm:min-h-[320px] lg:min-h-[617px]">
            <iframe
              title={`${office} map`}
              src={mapSrc}
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
              className="map-dark absolute inset-0 h-full w-full border-0"
            />
          </div>

          <div className="min-w-0">
            <div className="flex items-start justify-between gap-4 sm:gap-6">
              <div className="max-w-[540px] min-w-0">
                <h2 className="text-[28px] font-light leading-[1.2] text-white sm:text-4xl md:text-[38px] lg:text-[40px]">
                  {words.map((item, i) => (
                    <span
                      key={i}
                      className={`word-in mr-[0.25em] inline-block ${
                        item.red ? 'text-digi-red' : ''
                      }`}
                      style={{
                        animationDelay: `${i * 70}ms`,
                      }}
                    >
                      {item.w}
                    </span>
                  ))}
                </h2>

                <p
                  className="fade-up mt-5 max-w-[480px] text-xs leading-6 text-white/70 sm:mt-6 sm:text-sm"
                  style={{ animationDelay: '900ms' }}
                >
                  {description}
                </p>
              </div>

              <div className="globe-float hidden shrink-0 sm:block lg:mr-2 xl:mr-6">
                <img
                  src={globeImage}
                  alt=""
                  aria-hidden="true"
                  className="globe-spin h-24 w-24 object-contain md:h-28 md:w-28 lg:h-36 lg:w-36"
                />
              </div>
            </div>

            <div
              className="fade-up mt-6 sm:mt-7"
              style={{ animationDelay: '1000ms' }}
            >
              <ContactForm />
            </div>

            <div
              className="fade-up mt-4 sm:mt-5"
              style={{ animationDelay: '1150ms' }}
            >
              <ContactInfoCards />
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}