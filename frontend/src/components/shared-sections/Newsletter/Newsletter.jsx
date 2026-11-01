import { Check } from 'lucide-react'
import { newsletterContent } from '@data/site/newsletter'
import { useNewsletter } from './useNewsletter'

export default function Newsletter() {
  const {
    title,
    description,
    placeholder,
    button,
    note,
    successMessage,
  } = newsletterContent

  const { email, setEmail, submitted, error, submit } = useNewsletter()

  const handleSubmit = (event) => {
    event.preventDefault()

    if (submit()) {
      setEmail('')
    }
  }

  return (
    <section
      id="newsletter"
      className="relative overflow-hidden bg-[radial-gradient(ellipse_at_30%_20%,#222_0%,#111_45%,#000_100%)]"
    >
      <style>{`
        @keyframes nlFadeUp {
          from {
            opacity: 0;
            transform: translateY(18px);
          }

          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        .nl-in {
          opacity: 0;
          animation: nlFadeUp 0.8s ease-out forwards;
        }

        @media (max-width: 639px) {
          .newsletter-card {
            border-radius: 16px;
          }
        }

        @media (prefers-reduced-motion: reduce) {
          .nl-in {
            animation: none !important;
            opacity: 1 !important;
          }
        }
      `}</style>

      <div className="container-main px-4 py-12 sm:px-6 sm:py-14 md:px-8 lg:px-6 lg:py-20 xl:px-10">
        <div className="newsletter-card group rounded-2xl border border-white/15 bg-[#111]/80 px-4 py-7 transition-colors duration-500 hover:border-white/25 sm:px-7 sm:py-8 md:px-8 lg:min-h-[210px] lg:px-10 lg:py-8">
          <div className="grid items-center gap-8 sm:gap-9 md:gap-10 lg:min-h-[140px] lg:grid-cols-[minmax(0,1fr)_minmax(0,520px)] lg:gap-8">
            <div className="min-w-0">
              <h2
                className="nl-in text-xl font-light leading-[1.25] text-white sm:text-2xl md:text-[28px] lg:text-[31px]"
                style={{ animationDelay: '0ms' }}
              >
                {title}
              </h2>

              <p
                className="nl-in mt-3 max-w-[620px] text-[11px] leading-5 text-white/80 sm:text-[12px] md:text-[13px]"
                style={{ animationDelay: '150ms' }}
              >
                {description}
              </p>
            </div>

            <div
              className="nl-in w-full min-w-0"
              style={{ animationDelay: '300ms' }}
            >
              {submitted ? (
                <div className="flex min-h-[48px] w-full items-center gap-2 rounded-2xl border border-emerald-500/30 bg-emerald-500/5 px-4 py-2.5 sm:min-h-[42px] sm:rounded-full">
                  <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-emerald-500/10 text-emerald-400">
                    <Check size={13} />
                  </span>

                  <p className="min-w-0 text-[10px] leading-5 text-white/80 sm:text-[11px]">
                    {successMessage}
                  </p>
                </div>
              ) : (
                <form onSubmit={handleSubmit} noValidate className="w-full">
                  <div className="flex w-full flex-col gap-3 sm:flex-row sm:items-center sm:gap-4 lg:gap-5">
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder={placeholder}
                      aria-label="Email address"
                      className="h-12 min-h-[48px] min-w-0 w-full flex-1 rounded-full border border-white/25 bg-transparent px-5 text-xs text-white outline-none transition-all duration-300 placeholder:text-white/50 focus:border-digi-red/70 focus:shadow-[0_0_0_3px_rgba(208,16,31,0.15)] sm:h-11 sm:min-h-[44px] sm:px-5 sm:text-[11px] md:h-11 lg:h-10"
                    />

                    <button
                      type="submit"
                      className="h-11 min-h-[44px] w-full shrink-0 rounded-full bg-digi-red px-7 text-xs font-medium text-white transition-all duration-300 hover:-translate-y-0.5 hover:brightness-125 hover:shadow-[0_8px_20px_-10px_rgba(208,16,31,0.7)] active:translate-y-0 sm:h-10 sm:min-h-[40px] sm:w-auto sm:px-6 sm:text-[11px]"
                    >
                      {button}
                    </button>
                  </div>

                  {error && (
                    <p className="mt-2 px-3 text-[10px] leading-5 text-red-400">
                      {error}
                    </p>
                  )}
                </form>
              )}
            </div>
          </div>
        </div>

        <p
          className="nl-in mt-3 px-1 text-[10px] leading-5 text-white/50 sm:mt-2 sm:text-[11px]"
          style={{ animationDelay: '450ms' }}
        >
          {note}
        </p>

        <div className="mt-14 border-t border-white/15 sm:mt-16 md:mt-20 lg:mt-24" />
      </div>
    </section>
  )
}