import { motion } from "framer-motion";
import { AppWindow, CalendarCheck, Compass, PenTool } from "lucide-react";
import { fadeUp, red, section, wrap } from "../shared";

const icons = [Compass, CalendarCheck, PenTool, AppWindow];

function ServiceDetailsPhases({ phases }) {
  return (
    <section className={`${wrap} ${section} -mt-6 lg:-mt-3`}>
      <div className="flex flex-col gap-6 lg:flex-row lg:items-start lg:justify-between">
        <motion.h2
          {...fadeUp()}
          className="font-['Urbanist'] text-[clamp(30px,2.9vw,56px)] font-light leading-[1.1]"
        >
          {phases.heading}{" "}
          <span className={red}>{phases.highlight}</span>
        </motion.h2>

        <motion.p
          {...fadeUp(0.05)}
          className="max-w-[460px] font-['Urbanist'] text-[clamp(14px,1.2vw,22px)] font-light leading-[1.5] text-white/50"
        >
          {phases.text}
        </motion.p>
      </div>

      <div className="relative mt-14 lg:mt-[clamp(80px,9vw,170px)]">
        <span className="absolute left-0 right-0 top-[44px] hidden h-px bg-white/25 lg:block lg:top-[49px]" />

        <div className="relative grid grid-cols-1 gap-12 sm:grid-cols-2 lg:grid-cols-4 lg:gap-6">
          {phases.steps.map((step, i) => {
            const Icon = icons[i] ?? Compass;

            return (
              <motion.div
                key={step.number}
                {...fadeUp(i * 0.1)}
                className="flex flex-col items-center text-center"
              >
                <div className="flex h-[88px] w-[88px] flex-col items-center justify-center gap-1.5 rounded-[6px] border-2 border-[#d50818] bg-[#0b0b0b] shadow-[0_0_18px_rgba(213,8,24,0.45)] lg:h-[98px] lg:w-[98px]">
                  <span className={`text-[16px] font-medium ${red}`}>
                    {step.number}
                  </span>

                  <Icon
                    className={`h-5 w-5 ${red}`}
                    strokeWidth={1.6}
                  />
                </div>

                <p className="mt-6 text-[clamp(15px,1.15vw,22px)] font-semibold text-white">
                  {step.title}
                </p>

                <p className="mt-4 max-w-[330px] text-[clamp(12px,0.9vw,17px)] leading-[1.55] text-white/55">
                  {step.text}
                </p>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
}

export default ServiceDetailsPhases;