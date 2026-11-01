import { motion } from "framer-motion";
import {
  Layers,
  LogIn,
  Pencil,
  TrendingUp,
  Users,
  Wrench,
} from "lucide-react";
import { fadeUp, red, section, wrap } from "../shared";

const icons = {
  users: Users,
  pen: Pencil,
  enter: LogIn,
  wrench: Wrench,
  layers: Layers,
  trend: TrendingUp,
};

// Bento layout: 8+4 / 4+4+4 / 8 + cube(4)
const spans = [
  "md:col-span-8",
  "md:col-span-4",
  "md:col-span-4",
  "md:col-span-4",
  "md:col-span-4",
  "md:col-span-8",
];

function ServiceDetailsFeatures({ data, cube }) {
  return (
    <section className={`${wrap} ${section} -mt-6 lg:-mt-11`}>
      {/* Heading */}
      <motion.h2
        {...fadeUp()}
        className="max-w-[760px] font-['Urbanist'] text-[clamp(32px,3.6vw,72px)] font-light leading-[1.15]"
      >
        <span className={red}>{data.highlight}</span> {data.rest}
      </motion.h2>

      {/* Cards */}
      <div className="mt-10 grid grid-cols-1 gap-3.5 md:grid-cols-12 lg:mt-[clamp(40px,4vw,80px)]">
        {data.items.map((item, i) => {
          const Icon = icons[item.icon] ?? Users;

          return (
            <motion.div
              key={item.title}
              {...fadeUp(i * 0.06)}
              whileHover={{ y: -4 }}
              className={`group rounded-xl border border-white/10 bg-[#0a0a0a] p-[clamp(22px,2.3vw,44px)] transition-colors duration-300 hover:border-[#d50818]/50 ${spans[i]}`}
            >
              {/* Icon: hover par halka ghoomta aur red hota hai */}
              <span className="flex h-[clamp(40px,3vw,60px)] w-[clamp(40px,3vw,60px)] items-center justify-center rounded-full bg-white/20 transition-all duration-500 group-hover:rotate-[360deg] group-hover:bg-[#d50818]">
                <Icon
                  className="h-[42%] w-[42%] text-white"
                  strokeWidth={1.6}
                />
              </span>

              <p className="mt-[clamp(24px,2.4vw,48px)] text-[clamp(16px,1.4vw,28px)] font-semibold text-white">
                {item.title}
              </p>

              <p className="mt-3 max-w-[560px] text-[clamp(13px,1vw,19px)] leading-[1.65] text-white/55">
                {item.text}
              </p>
            </motion.div>
          );
        })}

        {/* 3D cube + andar se aati red light */}
        {cube && (
          <motion.div
            {...fadeUp(0.2)}
            className="relative hidden items-center justify-center md:col-span-4 md:flex"
          >
            {/* Bahar tak phailti halki red roshni */}
            <motion.span
              aria-hidden="true"
              animate={{ opacity: [0.35, 0.7, 0.35], scale: [0.9, 1.08, 0.9] }}
              transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
              className="pointer-events-none absolute left-1/2 top-1/2 h-[75%] w-[75%] -translate-x-1/2 -translate-y-1/2 rounded-full bg-[#d50818]/45 blur-[70px]"
            />

            {/* Beech ki tez red light (cube ke andar se aati hui) */}
            <motion.span
              aria-hidden="true"
              animate={{ opacity: [0.5, 1, 0.5], scale: [0.85, 1, 0.85] }}
              transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
              className="pointer-events-none absolute left-1/2 top-1/2 h-[34%] w-[34%] -translate-x-1/2 -translate-y-1/2 rounded-full bg-[#ff1a2e]/70 blur-[40px]"
            />

            <img
              src={cube}
              alt=""
              aria-hidden="true"
              draggable={false}
              className="relative w-[62%] max-w-[360px] select-none object-contain drop-shadow-[0_0_28px_rgba(213,8,24,0.55)]"
            />
          </motion.div>
        )}
      </div>
    </section>
  );
}

export default ServiceDetailsFeatures;