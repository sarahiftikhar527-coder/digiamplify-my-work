export const ease = [0.16, 1, 0.3, 1];

export const fadeUp = (delay = 0) => ({
  initial: {
    opacity: 0,
    y: 28,
  },
  whileInView: {
    opacity: 1,
    y: 0,
  },
  viewport: {
    once: true,
    amount: 0.15,
  },
  transition: {
    duration: 0.8,
    delay,
    ease,
  },
});

export const red = "text-[#d50818]";

export const section = "py-[clamp(70px,8vw,150px)]";

export const wrap =
  "mx-auto w-full max-w-[1920px] px-5 sm:px-8 md:px-10 lg:px-[5.2%]";