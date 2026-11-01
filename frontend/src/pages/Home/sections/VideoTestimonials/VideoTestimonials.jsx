import { useEffect, useRef, useState } from 'react'
import { ArrowLeft, ArrowRight, Play, X } from 'lucide-react'
import { videoTestimonials } from '@/data/home/videoTestimonials'
import { Reveal } from '@/components/common'

function VideoCard({ item, onOpen }) {
  const videoRef = useRef(null)
  const [playing, setPlaying] = useState(false)

  const handlePlay = async (event) => {
    event?.stopPropagation()

    const el = videoRef.current

    if (!el) return

    try {
      await el.play()
      setPlaying(true)
    } catch {
      setPlaying(false)
    }
  }

  const handlePause = () => {
    if (!videoRef.current?.ended) {
      setPlaying(false)
    }
  }

  return (
    <div
      onClick={onOpen}
      className="video-swap group relative aspect-[16/10] w-full cursor-pointer overflow-hidden rounded-[6px] border border-white/10 bg-[#111] shadow-[0_30px_80px_-35px_rgba(0,0,0,0.9)] transition-all duration-700 hover:border-white/20 sm:aspect-[3/2] md:w-[360px] lg:w-[460px] xl:w-[500px]"
    >
      <video
        ref={videoRef}
        src={item.video}
        poster={item.poster}
        playsInline
        preload="metadata"
        controls={playing}
        onEnded={() => setPlaying(false)}
        onPause={handlePause}
        onPlay={() => setPlaying(true)}
        onClick={(event) => {
          event.stopPropagation()
          onOpen()
        }}
        className="h-full w-full object-cover transition-transform duration-1000 group-hover:scale-[1.015]"
      />

      {!playing && (
        <>
          <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-black/10" />

          <div className="pointer-events-none absolute inset-0 opacity-0 transition-opacity duration-500 group-hover:opacity-100">
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(208,16,31,0.12),transparent_55%)]" />
          </div>

          <button
            type="button"
            onClick={handlePlay}
            aria-label={`Play ${item.name} testimonial`}
            className="play-button absolute left-1/2 top-1/2 flex h-14 w-14 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full bg-white text-black shadow-[0_15px_40px_rgba(0,0,0,0.35)] transition-all duration-500 hover:scale-110 hover:bg-digi-red hover:text-white focus:outline-none focus:ring-2 focus:ring-digi-red focus:ring-offset-2 focus:ring-offset-black sm:h-16 sm:w-16"
          >
            <span className="play-ring absolute inset-0 rounded-full border border-white/70" />

            <span className="play-ring-delay absolute inset-0 rounded-full border border-digi-red/40" />

            <Play
              size={22}
              className="relative ml-0.5 fill-current sm:h-6 sm:w-6"
            />
          </button>

          <div className="absolute bottom-0 left-0 right-0 flex items-end justify-between gap-3 p-4 sm:p-5">
            <div>
              <p className="text-[13px] font-semibold tracking-wide text-white sm:text-sm">
                {item.name}
              </p>

              {item.role && (
                <p className="mt-1 text-[10px] text-white/55 sm:text-[11px]">
                  {item.role}
                </p>
              )}
            </div>

            <span className="rounded-full border border-white/15 bg-black/20 px-2.5 py-1 text-[9px] uppercase tracking-[0.12em] text-white/70 backdrop-blur-sm">
              Video
            </span>
          </div>
        </>
      )}
    </div>
  )
}

function SidePanel({ item, size, onClick, children }) {
  const height =
    size === 'near'
      ? 'h-[190px] md:h-[215px] lg:h-[290px]'
      : 'h-[160px] md:h-[180px] lg:h-[245px]'

  return (
    <div
      onClick={onClick}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault()
          onClick()
        }
      }}
      aria-label={`Show ${item.name}`}
      className={`brushed side-panel relative hidden w-[38px] shrink-0 cursor-pointer flex-col items-center justify-between overflow-hidden rounded-md border border-white/10 py-4 transition-all duration-500 hover:-translate-y-1 hover:border-digi-red/50 hover:shadow-[0_15px_35px_-20px_rgba(208,16,31,0.7)] hover:brightness-125 focus:outline-none focus:ring-1 focus:ring-digi-red md:flex md:w-[42px] lg:w-[52px] ${height}`}
    >
      <span className="absolute inset-0 bg-gradient-to-b from-white/[0.05] via-transparent to-black/30 opacity-0 transition-opacity duration-500 hover:opacity-100" />

      <span className="relative flex flex-1 items-center justify-center">
        <span
          className="whitespace-nowrap text-[13px] font-light tracking-wide text-white/90 transition-colors duration-300 lg:text-[17px]"
          style={{
            writingMode: 'vertical-rl',
            transform: 'rotate(180deg)',
          }}
        >
          {item.name}
        </span>
      </span>

      <div className="relative">{children}</div>
    </div>
  )
}

function VideoTestimonials() {
  const { title, description, items } = videoTestimonials
  const [active, setActive] = useState(0)
  const [direction, setDirection] = useState('next')
  const [mobileOpen, setMobileOpen] = useState(false)

  const total = items.length
  const activeItem = items[active]

  const at = (offset) => {
    return items[(active + offset + total) % total]
  }

  const previous = () => {
    setDirection('previous')
    setActive((current) => (current - 1 + total) % total)
  }

  const next = () => {
    setDirection('next')
    setActive((current) => (current + 1) % total)
  }

  const goTo = (offset) => {
    setDirection(offset > 0 ? 'next' : 'previous')
    setActive((current) => (current + offset + total) % total)
  }

  const goToIndex = (index) => {
    if (index === active) return

    setDirection(index > active ? 'next' : 'previous')
    setActive(index)
  }

  const arrowBtn =
    'flex h-8 w-8 items-center justify-center text-white/80 transition-all duration-300 hover:text-digi-red focus:outline-none focus:text-digi-red lg:h-9 lg:w-9'

  useEffect(() => {
    if (!mobileOpen) return

    document.body.style.overflow = 'hidden'

    return () => {
      document.body.style.overflow = ''
    }
  }, [mobileOpen])

  useEffect(() => {
    const handleKeyDown = (event) => {
      if (!mobileOpen) return

      if (event.key === 'Escape') {
        setMobileOpen(false)
      }

      if (event.key === 'ArrowLeft') {
        previous()
      }

      if (event.key === 'ArrowRight') {
        next()
      }
    }

    window.addEventListener('keydown', handleKeyDown)

    return () => {
      window.removeEventListener('keydown', handleKeyDown)
    }
  }, [mobileOpen])

  return (
    <section className="section-space relative overflow-hidden border-b border-white/10 bg-black pb-16 pt-10 sm:pb-20 sm:pt-14 lg:pb-24 lg:pt-16">
      <style>{`
        @keyframes videoSwap {
          0% {
            opacity: 0;
            transform: scale(0.94) translateY(12px);
            filter: blur(7px);
          }

          60% {
            opacity: 1;
          }

          100% {
            opacity: 1;
            transform: scale(1) translateY(0);
            filter: blur(0);
          }
        }

        @keyframes videoNext {
          0% {
            opacity: 0;
            transform: translateX(45px) scale(0.97);
            filter: blur(5px);
          }

          100% {
            opacity: 1;
            transform: translateX(0) scale(1);
            filter: blur(0);
          }
        }

        @keyframes videoPrevious {
          0% {
            opacity: 0;
            transform: translateX(-45px) scale(0.97);
            filter: blur(5px);
          }

          100% {
            opacity: 1;
            transform: translateX(0) scale(1);
            filter: blur(0);
          }
        }

        @keyframes headingIn {
          0% {
            opacity: 0;
            transform: translateY(20px);
            filter: blur(5px);
          }

          100% {
            opacity: 1;
            transform: translateY(0);
            filter: blur(0);
          }
        }

        @keyframes playRing {
          0% {
            transform: scale(1);
            opacity: 0.7;
          }

          75%,
          100% {
            transform: scale(1.75);
            opacity: 0;
          }
        }

        @keyframes playRingDelay {
          0% {
            transform: scale(1);
            opacity: 0.45;
          }

          75%,
          100% {
            transform: scale(1.5);
            opacity: 0;
          }
        }

        @keyframes playFloat {
          0%,
          100% {
            transform: translate(-50%, -50%) translateY(0);
          }

          50% {
            transform: translate(-50%, -50%) translateY(-3px);
          }
        }

        @keyframes panelIn {
          0% {
            opacity: 0;
            transform: translateY(15px);
          }

          100% {
            opacity: 1;
            transform: translateY(0);
          }
        }

        @keyframes dotActive {
          0% {
            transform: scaleX(0.7);
            opacity: 0.6;
          }

          100% {
            transform: scaleX(1);
            opacity: 1;
          }
        }

        @keyframes mobileVideoIn {
          0% {
            opacity: 0;
            transform: scale(0.94);
          }

          100% {
            opacity: 1;
            transform: scale(1);
          }
        }

        .video-swap {
          animation: videoSwap 0.7s cubic-bezier(0.22, 1, 0.36, 1) both;
        }

        .video-next {
          animation: videoNext 0.55s cubic-bezier(0.22, 1, 0.36, 1) both;
        }

        .video-previous {
          animation: videoPrevious 0.55s cubic-bezier(0.22, 1, 0.36, 1) both;
        }

        .video-heading {
          animation: headingIn 0.8s cubic-bezier(0.22, 1, 0.36, 1) both;
        }

        .play-ring {
          animation: playRing 2.5s ease-out infinite;
        }

        .play-ring-delay {
          animation: playRingDelay 2.5s ease-out 0.8s infinite;
        }

        .play-button {
          animation: playFloat 3s ease-in-out infinite;
        }

        .side-panel {
          animation: panelIn 0.7s cubic-bezier(0.22, 1, 0.36, 1) both;
        }

        .active-dot {
          animation: dotActive 0.35s ease-out both;
        }

        .mobile-video-overlay {
          animation: mobileVideoIn 0.35s cubic-bezier(0.22, 1, 0.36, 1) both;
        }

        .brushed {
          background:
            repeating-linear-gradient(
              90deg,
              rgba(255,255,255,0.025) 0 1px,
              transparent 1px 3px
            ),
            linear-gradient(
              180deg,
              #2a2a2a 0%,
              #141414 55%,
              #0a0a0a 100%
            );
        }

        @media (max-width: 1023px) {
          .video-carousel {
            gap: 10px;
          }

          .responsive-video-card {
            width: 100%;
            max-width: 760px;
          }
        }

        @media (max-width: 767px) {
          .video-carousel {
            margin-top: 32px;
          }

          .responsive-video-card {
            max-width: 100%;
          }
        }

        @media (max-width: 480px) {
          .video-carousel {
            padding-left: 0;
            padding-right: 0;
          }

          .video-description {
            max-width: 330px;
            font-size: 10px;
            line-height: 1.8;
          }
        }

        @media (min-width: 768px) and (max-width: 1023px) {
          .video-responsive-main {
            width: min(100%, 680px);
          }

          .video-responsive-main .video-swap {
            aspect-ratio: 16 / 10;
          }
        }

        @media (prefers-reduced-motion: reduce) {
          .video-swap,
          .video-next,
          .video-previous,
          .video-heading,
          .play-ring,
          .play-ring-delay,
          .play-button,
          .side-panel,
          .active-dot,
          .mobile-video-overlay {
            animation: none !important;
          }
        }
      `}</style>

      <div className="pointer-events-none absolute inset-x-0 top-0 z-0 h-10 bg-gradient-to-b from-white/10 to-transparent" />

      <div className="pointer-events-none absolute inset-x-0 bottom-0 z-0 h-10 bg-gradient-to-t from-white/10 to-transparent" />

      <div className="container-shell relative z-10 pt-8 sm:pt-10 lg:pt-16">
        <Reveal>
          <div className="video-heading text-center">
            <h2 className="text-3xl font-light tracking-[-0.6px] text-white sm:text-[34px] md:text-[38px] lg:text-[40px]">
              {title}
            </h2>

            <div className="mx-auto mt-4 h-px w-12 bg-digi-red/70" />

            <p className="video-description mx-auto mt-4 max-w-[520px] text-[10px] leading-[1.8] text-white/80 sm:text-[11px]">
              {description}
            </p>
          </div>
        </Reveal>

        <Reveal delay={0.1}>
          <div className="video-carousel mt-8 flex items-center justify-center gap-2 sm:mt-10 sm:gap-3 lg:mt-12 lg:gap-4">
            <SidePanel
              item={at(-2)}
              size="far"
              onClick={() => goTo(-2)}
            />

            <SidePanel
              item={at(-1)}
              size="near"
              onClick={() => goTo(-1)}
            >
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation()
                  previous()
                }}
                aria-label="Previous testimonial"
                className={`${arrowBtn} hover:-translate-x-1`}
              >
                <ArrowLeft size={18} />
              </button>
            </SidePanel>

            <div
              key={`${activeItem.id}-${direction}`}
              className={`responsive-video-card video-responsive-main min-w-0 md:flex-none ${
                direction === 'next' ? 'video-next' : 'video-previous'
              }`}
            >
              <VideoCard
                item={activeItem}
                onOpen={() => {
                  if (window.innerWidth < 1024) {
                    setMobileOpen(true)
                  }
                }}
              />
            </div>

            <SidePanel
              item={at(1)}
              size="near"
              onClick={() => goTo(1)}
            >
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation()
                  next()
                }}
                aria-label="Next testimonial"
                className={`${arrowBtn} hover:translate-x-1`}
              >
                <ArrowRight size={18} />
              </button>
            </SidePanel>

            <SidePanel
              item={at(2)}
              size="far"
              onClick={() => goTo(2)}
            />
          </div>
        </Reveal>

        <div className="mt-6 flex items-center justify-center gap-3 md:hidden">
          <button
            type="button"
            onClick={previous}
            aria-label="Previous testimonial"
            className="group flex h-10 w-10 items-center justify-center rounded-full border border-white/15 bg-white/[0.02] text-white transition-all duration-300 hover:-translate-x-1 hover:border-digi-red hover:text-digi-red focus:outline-none focus:ring-1 focus:ring-digi-red"
          >
            <ArrowLeft
              size={17}
              className="transition-transform duration-300 group-hover:-translate-x-0.5"
            />
          </button>

          <div className="flex items-center gap-1.5">
            {items.map((item, index) => (
              <button
                key={item.id}
                type="button"
                onClick={() => goToIndex(index)}
                aria-label={`Show testimonial ${index + 1}`}
                className={`transition-all duration-500 ${
                  index === active
                    ? 'active-dot h-1.5 w-7 rounded-full bg-digi-red'
                    : 'h-1.5 w-1.5 rounded-full bg-white/25 hover:bg-white/50'
                }`}
              />
            ))}
          </div>

          <button
            type="button"
            onClick={next}
            aria-label="Next testimonial"
            className="group flex h-10 w-10 items-center justify-center rounded-full border border-white/15 bg-white/[0.02] text-white transition-all duration-300 hover:translate-x-1 hover:border-digi-red hover:text-digi-red focus:outline-none focus:ring-1 focus:ring-digi-red"
          >
            <ArrowRight
              size={17}
              className="transition-transform duration-300 group-hover:translate-x-0.5"
            />
          </button>
        </div>

        <div className="mt-5 hidden items-center justify-center gap-1.5 md:flex">
          {items.map((item, index) => (
            <button
              key={item.id}
              type="button"
              onClick={() => goToIndex(index)}
              aria-label={`Show testimonial ${index + 1}`}
              className={`transition-all duration-500 ${
                index === active
                  ? 'active-dot h-1.5 w-8 rounded-full bg-digi-red'
                  : 'h-1.5 w-1.5 rounded-full bg-white/20 hover:bg-white/50'
              }`}
            />
          ))}
        </div>
      </div>

      {mobileOpen && (
        <div className="fixed inset-0 z-[999] flex items-center justify-center bg-black/95 p-4 backdrop-blur-md sm:p-6">
          <div
            className="mobile-video-overlay relative flex w-full max-w-5xl items-center justify-center"
            key={`${activeItem.id}-${direction}`}
          >
            <video
              key={activeItem.id}
              src={activeItem.video}
              poster={activeItem.poster}
              autoPlay
              controls
              playsInline
              className={`max-h-[85vh] w-full rounded-lg border border-white/10 bg-black object-contain shadow-[0_30px_100px_-30px_rgba(208,16,31,0.35)] ${
                direction === 'next'
                  ? 'video-next'
                  : 'video-previous'
              }`}
            />

            <button
              type="button"
              onClick={() => setMobileOpen(false)}
              aria-label="Close video"
              className="absolute right-2 top-2 z-20 flex h-10 w-10 items-center justify-center rounded-full border border-white/15 bg-black/70 text-white transition-all duration-300 hover:border-digi-red hover:bg-digi-red sm:right-3 sm:top-3"
            >
              <X size={18} />
            </button>

            <button
              type="button"
              onClick={previous}
              aria-label="Previous testimonial"
              className="absolute left-1 top-1/2 z-20 flex h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full border border-white/15 bg-black/70 text-white transition-all duration-300 hover:border-digi-red hover:bg-digi-red sm:left-3 sm:h-11 sm:w-11"
            >
              <ArrowLeft size={18} />
            </button>

            <button
              type="button"
              onClick={next}
              aria-label="Next testimonial"
              className="absolute right-1 top-1/2 z-20 flex h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full border border-white/15 bg-black/70 text-white transition-all duration-300 hover:border-digi-red hover:bg-digi-red sm:right-3 sm:h-11 sm:w-11"
            >
              <ArrowRight size={18} />
            </button>

            <div className="absolute bottom-3 left-1/2 z-20 flex -translate-x-1/2 items-center gap-1.5">
              {items.map((item, index) => (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => goToIndex(index)}
                  aria-label={`Show testimonial ${index + 1}`}
                  className={`transition-all duration-500 ${
                    index === active
                      ? 'h-1.5 w-7 rounded-full bg-digi-red'
                      : 'h-1.5 w-1.5 rounded-full bg-white/30'
                  }`}
                />
              ))}
            </div>
          </div>
        </div>
      )}
    </section>
  )
}

export default VideoTestimonials