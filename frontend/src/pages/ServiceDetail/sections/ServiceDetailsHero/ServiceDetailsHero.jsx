import { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { ease } from "../shared";
import { servicesCommon } from "@/data/services/details";

// Images ab details.js se aati hain:
//  - Slides: public/images/servicedetails/<slug>/slide-1.webp, slide-2.webp ...
//  - Shapes: public/images/servicedetails/shape-1.webp, shape-2.webp

// Har image 41.3% wide, gap 4.3% (slider track ke hisab se)
const STEP = 45.6;

function ServiceDetailsHero({ service }) {
  const slides = service.slides ?? [];
  const [index, setIndex] = useState(0);

  const prev = () => setIndex((i) => (i - 1 + slides.length) % slides.length);
  const next = () => setIndex((i) => (i + 1) % slides.length);
  const current = slides[index];

  const [shapeOne, shapeTwo] = servicesCommon.shapes;

  return (
    <section className="relative">
      <div className="mx-auto grid w-full max-w-[1920px] items-start gap-14 px-5 pb-24 pt-14 sm:px-8 md:px-10 lg:grid-cols-[36%_1fr] lg:gap-[2%] lg:pb-[clamp(110px,10vw,190px)] lg:pl-[9.4%] lg:pr-[5.2%] lg:pt-[clamp(60px,5.2vw,100px)]">
        {/* Left */}
        <div className="lg:pt-[clamp(0px,1.6vw,30px)]">
          <motion.h1
            initial={{ opacity: 0, y: 35, filter: "blur(8px)" }}
            animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
            transition={{ duration: 1, ease }}
            className="text-[clamp(36px,3.2vw,64px)] font-light leading-[1.1]"
          >
            {service.title}
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.9, delay: 0.15, ease }}
            className="mt-10 max-w-[520px] text-[clamp(13px,0.95vw,17px)] leading-[1.65] text-white/55 lg:mt-[clamp(40px,4.4vw,84px)]"
          >
            {service.description}
          </motion.p>

          <motion.a
            href={servicesCommon.cta.href}
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.9, delay: 0.3, ease }}
            whileHover={{ scale: 1.03 }}
            whileTap={{ scale: 0.97 }}
            className="mt-9 inline-flex items-center justify-center rounded-[4px] border-2 border-[#c4000f] px-12 py-3.5 text-[clamp(13px,1vw,17px)] font-medium text-[#d50818] transition-colors duration-300 hover:bg-[#c4000f] hover:text-white lg:mt-[clamp(32px,3.4vw,64px)] lg:px-[clamp(40px,3.4vw,64px)]"
          >
            {servicesCommon.cta.label}
          </motion.a>
        </div>

        {/* Right: slider */}
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1, delay: 0.2, ease }}
          className="relative"
        >
          {/* Images (white card ke upar overlap karti hain) */}
          <div className="absolute left-[8%] right-0 top-0 z-10 overflow-hidden">
            <motion.div
              className="flex gap-[4.3%]"
              initial={false}
              animate={{ x: `-${index * STEP}%` }}
              transition={{ duration: 0.7, ease }}
            >
              {slides.map((slide, i) => (
                <img
                  key={i}
                  src={slide.image}
                  alt={slide.title}
                  draggable={false}
                  className="aspect-[390/265] w-[41.3%] shrink-0 select-none object-cover"
                />
              ))}
            </motion.div>
          </div>

          {/* White card */}
          <div className="relative mt-[15.5%] w-full rounded-[3px] bg-white pt-[11%] shadow-[0_10px_40px_rgba(0,0,0,0.4)] md:w-[59%]">
            <div className="flex items-end justify-between gap-4 px-[clamp(20px,2.2vw,42px)] pb-[clamp(20px,2.2vw,42px)]">
              <div className="min-w-0">
                <AnimatePresence mode="wait">
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -8 }}
                    transition={{ duration: 0.25 }}
                  >
                    <p className="text-[clamp(16px,1.25vw,24px)] font-medium text-black">
                      {current?.title}
                    </p>
                    <p className="mt-3 text-[clamp(12px,1vw,19px)] text-black/60">
                      {current?.text}
                    </p>
                  </motion.div>
                </AnimatePresence>
              </div>

              <div className="flex shrink-0 items-center gap-3 text-black">
                <button
                  type="button"
                  onClick={prev}
                  aria-label="Previous"
                  className="transition-transform duration-300 hover:-translate-x-0.5"
                >
                  <ChevronLeft className="h-5 w-5" strokeWidth={2.2} />
                </button>
                <button
                  type="button"
                  onClick={next}
                  aria-label="Next"
                  className="transition-transform duration-300 hover:translate-x-0.5"
                >
                  <ChevronRight className="h-5 w-5" strokeWidth={2.2} />
                </button>
              </div>
            </div>
          </div>

          {/* Floating 3D shapes */}
          <motion.img
            src={shapeOne}
            alt=""
            aria-hidden="true"
            draggable={false}
            animate={{ y: [0, -14, 0] }}
            transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
            className="pointer-events-none absolute right-[6%] top-[66%] hidden w-[11%] select-none lg:block"
          />
          <motion.img
            src={shapeTwo}
            alt=""
            aria-hidden="true"
            draggable={false}
            animate={{ y: [0, 12, 0] }}
            transition={{ duration: 7, repeat: Infinity, ease: "easeInOut" }}
            className="pointer-events-none absolute left-[75%] top-[108%] hidden w-[5.6%] select-none lg:block"
          />
        </motion.div>
      </div>
    </section>
  );
}

export default ServiceDetailsHero;