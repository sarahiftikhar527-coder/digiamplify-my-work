import { motion } from "framer-motion";
import { TrendingUp } from "lucide-react";
import { ease, fadeUp, red, section, wrap } from "../shared";

// Bento layout: 8+4 / 4+4+4 / 8 + cube(4)
const spans = [
  "md:col-span-8",
  "md:col-span-4",
  "md:col-span-4",
  "md:col-span-4",
  "md:col-span-4",
  "md:col-span-8",
];

// Monthly Trend ke bars (height % mein)
const trendBars = [
  { h: 28, c: "bg-white/20" },
  { h: 45, c: "bg-white/35" },
  { h: 58, c: "bg-white/55" },
  { h: 78, c: "bg-[#5a0008]" },
  { h: 100, c: "bg-[#c4000f]" },
];

function ServiceDetailsStats({ data, cube }) {
  const perf = data.performance;

  return (
    <section className={`${wrap} ${section} -mt-6 lg:-mt-11`}>
      {/* Label + heading */}
      <motion.p
        {...fadeUp()}
        className="font-['Urbanist'] text-[clamp(12px,0.9vw,16px)] text-white/50"
      >
        {data.label}
      </motion.p>

      <motion.h2
        {...fadeUp(0.05)}
        className="mt-4 font-['Urbanist'] text-[clamp(26px,2.6vw,48px)] font-light leading-[1.2]"
      >
        {data.heading} <span className={red}>{data.highlight}</span>
      </motion.h2>

      <div className="mt-10 grid gap-3 lg:mt-[clamp(36px,3.4vw,64px)] lg:grid-cols-[1fr_28%]">
        {/* Left: bento */}
        <div className="grid grid-cols-1 gap-3 md:grid-cols-12">
          {data.items.map((stat, i) => (
            <motion.div
              key={stat.title}
              {...fadeUp(i * 0.06)}
              className={`relative overflow-hidden rounded-lg border border-white/10 bg-black/50 p-[clamp(20px,2vw,38px)] ${spans[i]}`}
            >
              {/* Corner ki halki red roshni */}
              <span className="pointer-events-none absolute -bottom-6 -right-6 h-24 w-24 rounded-full bg-[#d50818]/25 blur-2xl" />

              <p
                className={`relative font-['Urbanist'] text-[clamp(32px,3.3vw,64px)] font-light leading-none ${red}`}
              >
                {stat.value}
              </p>

              <p className="relative mt-5 text-[clamp(13px,0.95vw,17px)] font-semibold text-white">
                {stat.title}
              </p>

              <p className="relative mt-2 text-[clamp(11px,0.8vw,14px)] text-white/55">
                {stat.text}
              </p>
            </motion.div>
          ))}

          {/* 3D cube + andar se aati red light */}
          {cube && (
            <motion.div
              {...fadeUp(0.3)}
              className="relative hidden items-center justify-center md:col-span-4 md:flex"
            >
              {/* Bahar tak phailti halki red roshni */}
              <motion.span
                aria-hidden="true"
                animate={{
                  opacity: [0.35, 0.7, 0.35],
                  scale: [0.9, 1.08, 0.9],
                }}
                transition={{
                  duration: 4,
                  repeat: Infinity,
                  ease: "easeInOut",
                }}
                className="pointer-events-none absolute left-1/2 top-1/2 h-[75%] w-[75%] -translate-x-1/2 -translate-y-1/2 rounded-full bg-[#d50818]/45 blur-[70px]"
              />

              {/* Beech ki tez red light (cube ke andar se aati hui) */}
              <motion.span
                aria-hidden="true"
                animate={{ opacity: [0.5, 1, 0.5], scale: [0.85, 1, 0.85] }}
                transition={{
                  duration: 3,
                  repeat: Infinity,
                  ease: "easeInOut",
                }}
                className="pointer-events-none absolute left-1/2 top-1/2 h-[34%] w-[34%] -translate-x-1/2 -translate-y-1/2 rounded-full bg-[#ff1a2e]/70 blur-[40px]"
              />

              <img
                src={cube}
                alt=""
                aria-hidden="true"
                draggable={false}
                className="relative w-[60%] max-w-[260px] select-none object-contain drop-shadow-[0_0_28px_rgba(213,8,24,0.55)]"
              />
            </motion.div>
          )}
        </div>

        {/* Right: performance card */}
        <motion.div
          {...fadeUp(0.1)}
          className="flex flex-col rounded-lg border border-white/10 bg-[#0a0a0a] p-[clamp(20px,1.8vw,34px)]"
        >
          <p className="text-[clamp(14px,1.1vw,20px)] font-semibold text-white">
            {perf.title}
          </p>

          <div className="mt-7 space-y-5">
            {perf.items.map((item, i) => (
              <div key={item.label}>
                <div className="flex items-center justify-between text-[clamp(10px,0.75vw,13px)]">
                  <span className="text-white/70">{item.label}</span>
                  <span className="font-semibold text-[#d50818]">
                    {item.value}%
                  </span>
                </div>

                <div className="mt-2 h-[5px] w-full overflow-hidden rounded-full bg-white/25">
                  <motion.span
                    className="block h-full rounded-full bg-[#c4000f]"
                    initial={{ width: 0 }}
                    whileInView={{ width: `${item.value}%` }}
                    viewport={{ once: true }}
                    transition={{ duration: 1.1, delay: 0.2 + i * 0.1, ease }}
                  />
                </div>
              </div>
            ))}
          </div>

          <div className="my-7 h-px w-full bg-white/15" />

          <p className="text-[clamp(13px,0.95vw,17px)] font-semibold text-white">
            {perf.trendTitle}
          </p>

          {/* Monthly trend: bars + upar red arrow */}
          <div className="relative mt-4 flex min-h-[170px] flex-1 items-end justify-center">
            <div className="relative flex h-[130px] items-end gap-2.5">
              <TrendingUp
                className="absolute -top-9 left-[6%] h-8 w-8 text-[#d50818]"
                strokeWidth={2.2}
              />

              {trendBars.map((bar, i) => (
                <motion.span
                  key={i}
                  className={`w-[clamp(14px,1.3vw,24px)] rounded-[3px] ${bar.c}`}
                  initial={{ height: 0 }}
                  whileInView={{ height: `${bar.h}%` }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.9, delay: 0.3 + i * 0.1, ease }}
                />
              ))}
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}

export default ServiceDetailsStats;