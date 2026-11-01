import { motion } from "framer-motion";
import { Check } from "lucide-react";
import { ease, red, section, wrap } from "../shared";

// Right se aane wala animation (har text ke liye)
const fromRight = (delay = 0) => ({
  initial: { opacity: 0, x: 90 },
  whileInView: { opacity: 1, x: 0 },
  viewport: { once: true, amount: 0.3 },
  transition: { duration: 0.9, delay, ease },
});

function ServiceDetailsWhy({ data, image }) {
  return (
    <section className={`${wrap} ${section} overflow-x-clip -mt-6 lg:-mt-11`}>
      {/* ===================== Label + heading ===================== */}
      <motion.p
        {...fromRight()}
        className="font-['Urbanist'] text-[clamp(14px,1.2vw,22px)] text-white/55"
      >
        {data.label}
      </motion.p>

      <motion.h2
        {...fromRight(0.1)}
        className="mt-4 max-w-[900px] font-['Urbanist'] text-[clamp(32px,3.6vw,72px)] font-light leading-[1.15]"
      >
        {data.heading} <span className={red}>{data.highlight}</span>.
      </motion.h2>

      {/* ===================== Image + points ===================== */}
      <div className="mt-10 grid items-center gap-10 lg:mt-[clamp(36px,3.6vw,72px)] lg:grid-cols-[42%_1fr] lg:gap-[6%]">
        {/* Left: image (left se aati hai, taake right wale text se alag lage) */}
        <motion.div
          initial={{ opacity: 0, x: -70, scale: 0.96 }}
          whileInView={{ opacity: 1, x: 0, scale: 1 }}
          viewport={{ once: true, amount: 0.3 }}
          transition={{ duration: 1, ease }}
          className="aspect-[328/311] w-full overflow-hidden rounded-xl"
        >
          {image && (
            <img
              src={image}
              alt={data.heading}
              draggable={false}
              className="h-full w-full object-cover transition-transform duration-700 ease-out hover:scale-105"
            />
          )}
        </motion.div>

        {/* Right: points */}
        <div>
          {data.items.map((item, i) => (
            <motion.div
              key={item.title}
              {...fromRight(0.15 + i * 0.15)}
              className="group relative mb-6 pb-6 last:mb-0"
            >
              {/* Neeche ki line: left se right draw hoti hai */}
              <motion.span
                aria-hidden="true"
                className="absolute bottom-0 left-0 h-px w-full origin-left bg-white/15"
                initial={{ scaleX: 0 }}
                whileInView={{ scaleX: 1 }}
                viewport={{ once: true }}
                transition={{ duration: 1, delay: 0.5 + i * 0.15, ease }}
              />

              <div className="flex items-center gap-3.5">
                {/* Check: spring se pop hota hai */}
                <motion.span
                  initial={{ scale: 0, rotate: -90 }}
                  whileInView={{ scale: 1, rotate: 0 }}
                  viewport={{ once: true }}
                  transition={{
                    type: "spring",
                    stiffness: 200,
                    damping: 12,
                    delay: 0.45 + i * 0.15,
                  }}
                  className="flex h-[clamp(28px,2.1vw,42px)] w-[clamp(28px,2.1vw,42px)] shrink-0 items-center justify-center rounded-full bg-white/25 transition-colors duration-300 group-hover:bg-[#d50818]"
                >
                  <Check className="h-[55%] w-[55%] text-white" strokeWidth={2.4} />
                </motion.span>

                <p className="text-[clamp(18px,1.6vw,32px)] font-semibold text-white transition-colors duration-300 group-hover:text-[#ff1a2e]">
                  {item.title}
                </p>
              </div>

              <p className="mt-3 max-w-[680px] pl-[clamp(40px,3vw,56px)] text-[clamp(13px,1.05vw,20px)] leading-[1.65] text-white/60">
                {item.text}
              </p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}

export default ServiceDetailsWhy;