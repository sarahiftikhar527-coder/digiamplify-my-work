import { ArrowUpRight } from 'lucide-react'
import { Link } from 'react-router-dom'

export default function PageHero({
  eyebrow,
  title,
  highlight,
  description,
  image,
  imageAlt = '',
  action,
  className = '',
}) {
  return (
    <section
      className={`relative overflow-hidden border-b border-white/[0.08] bg-black py-24 sm:py-28 lg:py-32 ${className}`}
    >
      <div className="container-main relative z-10">
        <div className="grid items-center gap-10 lg:grid-cols-[1fr_0.8fr]">
          <div className="max-w-3xl">
            {eyebrow && (
              <div className="mb-5 text-[11px] font-medium uppercase tracking-[0.2em] text-digi-red">
                {eyebrow}
              </div>
            )}

            <h1 className="font-heading text-5xl font-light leading-[0.95] tracking-[-0.04em] text-white sm:text-6xl lg:text-7xl">
              {title}
              {highlight && (
                <>
                  {' '}
                  <span className="text-digi-red">{highlight}</span>
                </>
              )}
            </h1>

            {description && (
              <p className="mt-7 max-w-2xl text-sm leading-7 text-white/55 sm:text-base">
                {description}
              </p>
            )}

            {action && (
              <div className="mt-8">
                <Link
                  to={action.to}
                  className="inline-flex items-center gap-2 rounded-full bg-digi-red px-5 py-3 text-sm font-medium text-white transition hover:bg-[#b80010]"
                >
                  {action.label}
                  <ArrowUpRight size={16} />
                </Link>
              </div>
            )}
          </div>

          {image && (
            <div className="relative mx-auto w-full max-w-lg">
              <div className="absolute inset-10 rounded-full bg-digi-red/10 blur-[90px]" />
              <img
                src={image}
                alt={imageAlt}
                className="relative z-10 max-h-[420px] w-full object-contain"
              />
            </div>
          )}
        </div>
      </div>
    </section>
  )
}