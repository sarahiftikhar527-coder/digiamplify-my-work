import { motion } from "framer-motion";
import { fadeUp, red, wrap } from "../shared";

function ServiceDetailsIntro({ intro }) {
  return (
    <section className={wrap}>
      <motion.div
        {...fadeUp()}
        className="border-b border-white/10 bg-black px-6 py-12 sm:px-10 lg:px-[4.5%] lg:py-[clamp(60px,5.6vw,108px)]"
      >
        <div className="grid items-stretch gap-10 lg:grid-cols-2">
          {/* Left: quote */}
          <div className="flex items-center lg:pr-[4%]">
            <p className="font-['Urbanist'] text-[clamp(24px,2.5vw,48px)] font-light leading-[1.18] text-white">
              {intro.quote}
            </p>
          </div>

          {/* Right: text + tagline (beech mein vertical line) */}
          <div className="flex flex-col justify-center lg:border-l lg:border-white/20 lg:py-16 lg:pl-[6%]">
            <p className="max-w-[640px] text-[clamp(12px,0.85vw,16px)] leading-[1.7] text-white/55">
              {intro.text}
            </p>

            <p
              className={`mt-8 text-[clamp(13px,1vw,18px)] font-medium ${red}`}
            >
              {intro.tagline}
            </p>
          </div>
        </div>
      </motion.div>
    </section>
  );
}

export default ServiceDetailsIntro;