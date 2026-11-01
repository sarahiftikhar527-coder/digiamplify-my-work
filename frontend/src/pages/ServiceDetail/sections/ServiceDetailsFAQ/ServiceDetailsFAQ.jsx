import { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { ease, fadeUp, red, section, wrap } from "../shared";

/* Heading ke liye variants: parent ek baar trigger hota hai, words ek ke baad ek aate hain */
const headingVariants = {
  hidden: {},
  show: { transition: { staggerChildren: 0.07, delayChildren: 0.1 } },
};

const wordVariants = {
  hidden: { y: "115%", opacity: 0 },
  show: { y: 0, opacity: 1, transition: { duration: 0.8, ease } },
};

function ServiceDetailsFAQ({ faqs }) {
  const [open, setOpen] = useState(0);

  // Heading ko words mein todo, taake har word alag animate ho
  const words = [
    ...faqs.heading.split(" ").map((w) => ({ w, accent: false })),
    ...faqs.highlight.split(" ").map((w) => ({ w, accent: true })),
  ];

  return (
    <section className={`${wrap} ${section} -mt-6 lg:-mt-11`}>
      <div className="grid gap-12 lg:grid-cols-[44%_1fr] lg:gap-[5%]">
        {/* ============================ Left ============================ */}
        <div>
          {/* Logo + FAQs label */}
          <div className="flex items-center gap-3">
            <motion.svg
              viewBox="0 0 40 30"
              aria-hidden="true"
              className="h-auto w-[clamp(44px,3.6vw,76px)]"
              initial={{ opacity: 0, x: -30, rotate: -12 }}
              whileInView={{ opacity: 1, x: 0, rotate: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.9, ease }}
            >
              {/* Halka upar neeche tairta hua */}
              <motion.g
                animate={{ y: [0, -2.5, 0] }}
                transition={{
                  duration: 3.5,
                  repeat: Infinity,
                  ease: "easeInOut",
                }}
              >
                <path d="M0 0h40L27 13 17 30 14 11z" fill="#d50818" />
                <path d="M4 0h13L9 8z" fill="#4a4a4a" />
              </motion.g>
            </motion.svg>

            <motion.span
              initial={{ opacity: 0, x: -16 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.7, delay: 0.2, ease }}
              className={`font-['Urbanist'] text-[clamp(20px,1.8vw,36px)] ${red}`}
            >
              {faqs.label}
            </motion.span>
          </div>

          {/* Heading: word by word reveal
              👉 Trigger parent <h2> par hai (words par nahi), kyunke words overflow-hidden ke
                 andar chhupe hote hain aur browser unhein "visible" count nahi karta */}
          <motion.h2
            variants={headingVariants}
            initial="hidden"
            whileInView="show"
            viewport={{ once: true, amount: 0.3 }}
            className="mt-6 max-w-[720px] font-['Urbanist'] text-[clamp(34px,3.8vw,76px)] font-light leading-[1.15]"
          >
            {words.map((item, i) => (
              <span
                key={`${item.w}-${i}`}
                className="inline-block overflow-hidden py-[0.08em] align-bottom"
              >
                <motion.span
                  variants={wordVariants}
                  className={`inline-block ${item.accent ? red : ""}`}
                >
                  {item.w}
                  {"\u00A0"}
                </motion.span>
              </span>
            ))}
          </motion.h2>

          <motion.p
            {...fadeUp(0.4)}
            className="mt-8 max-w-[620px] text-[clamp(14px,1.2vw,23px)] leading-[1.7] text-white/75"
          >
            {faqs.text}
          </motion.p>
        </div>

        {/* ============================ Right ============================ */}
        <div className="space-y-3.5 lg:pt-[clamp(10px,2vw,40px)]">
          {faqs.items.map((item, i) => {
            const isOpen = open === i;

            return (
              <motion.div
                key={item.q}
                initial={{ opacity: 0, x: 50 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true, amount: 0.2 }}
                transition={{ duration: 0.8, delay: 0.1 + i * 0.09, ease }}
                whileHover={{ x: -4 }}
                className={`relative overflow-hidden rounded-xl border transition-colors duration-500 ${
                  isOpen
                    ? "border-white/20 bg-[#121212]"
                    : "border-white/15 bg-black hover:border-white/30"
                }`}
              >
                {/* Open card par red line jo upar se neeche bharti hai */}
                <motion.span
                  aria-hidden="true"
                  className="absolute left-0 top-0 h-full w-[3px] origin-top bg-[#d50818]"
                  initial={false}
                  animate={{ scaleY: isOpen ? 1 : 0 }}
                  transition={{ duration: 0.5, ease }}
                />

                <button
                  type="button"
                  onClick={() => setOpen(isOpen ? -1 : i)}
                  aria-expanded={isOpen}
                  className="flex w-full items-center justify-between gap-4 px-[clamp(18px,2vw,38px)] py-[clamp(18px,1.8vw,34px)] text-left"
                >
                  <span className="text-[clamp(14px,1.25vw,24px)] font-medium leading-snug text-white">
                    {item.q}
                  </span>

                  {/* Plus <-> Minus icon */}
                  <motion.span
                    initial={false}
                    animate={{ rotate: isOpen ? 180 : 0 }}
                    transition={{ duration: 0.5, ease }}
                    className={`relative flex h-[clamp(28px,2vw,42px)] w-[clamp(28px,2vw,42px)] shrink-0 items-center justify-center rounded-full border transition-colors duration-500 ${
                      isOpen
                        ? "border-white/70 bg-black"
                        : "border-white/20 bg-white/10"
                    }`}
                  >
                    {/* Horizontal line (hamesha) */}
                    <span className="absolute h-[1.5px] w-[42%] rounded-full bg-white" />
                    {/* Vertical line (open par gayab, to plus minus ban jata hai) */}
                    <motion.span
                      className="absolute h-[42%] w-[1.5px] rounded-full bg-white"
                      initial={false}
                      animate={{ scaleY: isOpen ? 0 : 1 }}
                      transition={{ duration: 0.35, ease }}
                    />
                  </motion.span>
                </button>

                {/* Answer: smooth height + fade + slide */}
                <AnimatePresence initial={false}>
                  {isOpen && (
                    <motion.div
                      key="answer"
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: "auto", opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.5, ease }}
                      className="overflow-hidden"
                    >
                      <motion.p
                        initial={{ y: -10 }}
                        animate={{ y: 0 }}
                        exit={{ y: -10 }}
                        transition={{ duration: 0.45, delay: 0.05, ease }}
                        className="max-w-[780px] px-[clamp(18px,2vw,38px)] pb-[clamp(18px,1.8vw,34px)] text-[clamp(12.5px,1vw,18px)] leading-[1.7] text-white/70"
                      >
                        {item.a}
                      </motion.p>
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
}

export default ServiceDetailsFAQ;