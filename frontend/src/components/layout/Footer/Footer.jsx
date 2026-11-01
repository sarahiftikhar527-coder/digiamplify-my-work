import { useState } from 'react'
import { footerColumns } from '@/data/site/footer'
import Logo from '@/components/layout/Logo'
import FooterColumn from './FooterColumn'

const descriptionLines = [
  'Empowering businesses with innovative',
  'digital solutions, strategic marketing,',
  'and technology-driven growth.',
]

function Footer() {
  const [openColumn, setOpenColumn] = useState(null)

  const handleToggle = (index) => {
    setOpenColumn((current) => (current === index ? null : index))
  }

  return (
    <footer className="relative overflow-hidden bg-black">
      <style>{`
        @keyframes footerFadeUp {
          from {
            opacity: 0;
            transform: translateY(18px);
          }

          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        .footer-in {
          opacity: 0;
          animation: footerFadeUp 0.8s ease-out forwards;
        }

        @media (prefers-reduced-motion: reduce) {
          .footer-in {
            animation: none !important;
            opacity: 1 !important;
          }
        }
      `}</style>

      <div className="pointer-events-none absolute inset-x-0 bottom-0 h-12 bg-gradient-to-t from-[#2a0207] to-transparent sm:h-14 lg:h-16" />

      <div className="container-shell relative px-4 pb-5 pt-2 sm:px-6 sm:pb-6 sm:pt-3 md:px-8 lg:px-8 lg:pb-8 lg:pt-0 xl:px-10">
        <div className="grid items-start gap-7 lg:grid-cols-[minmax(0,0.9fr)_minmax(0,2fr)] lg:gap-8">
          <div className="footer-in self-start">
            <Logo className="mb-3 lg:mb-4" />

            <p className="max-w-[360px] text-[12px] leading-5 text-white/70 sm:text-[13px] lg:text-white/80">
              {descriptionLines.map((line) => (
                <span
                  key={line}
                  className="block whitespace-normal sm:whitespace-nowrap"
                >
                  {line}
                </span>
              ))}
            </p>
          </div>

          <div className="grid grid-cols-1 border-t border-white/10 sm:grid-cols-2 sm:gap-x-8 sm:gap-y-2 sm:border-0 lg:grid-cols-4 lg:gap-x-5">
            {footerColumns.map((column, index) => (
              <div
                key={column.title}
                className="border-b border-white/10 last:border-b-0 sm:border-0"
              >
                <FooterColumn
                  title={column.title}
                  items={column.items}
                  index={index}
                  isOpen={openColumn === index}
                  onToggle={() => handleToggle(index)}
                />
              </div>
            ))}
          </div>
        </div>

        <p className="footer-in mt-5 border-t border-white/10 pt-3 text-[10px] tracking-wide text-white/40 lg:hidden">
          © 2026 DigiAmplify. All rights reserved.
        </p>
      </div>
    </footer>
  )
}

export default Footer