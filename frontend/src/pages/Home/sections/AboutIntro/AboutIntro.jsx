import { motion } from 'framer-motion'
import { aboutIntro } from '@/data/home/aboutIntro'

const topFrom = {
  hidden: {
    opacity: 0,
    y: -70
  },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.7,
      ease: [0.22, 1, 0.36, 1]
    }
  }
}

const bottomFrom = {
  hidden: {
    opacity: 0,
    y: 70
  },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.7,
      ease: [0.22, 1, 0.36, 1]
    }
  }
}

const topFromSlow = {
  hidden: {
    opacity: 0,
    y: -70
  },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.8,
      delay: 0.12,
      ease: [0.22, 1, 0.36, 1]
    }
  }
}

const bottomFromSlow = {
  hidden: {
    opacity: 0,
    y: 70
  },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.8,
      delay: 0.12,
      ease: [0.22, 1, 0.36, 1]
    }
  }
}

function AboutIntro() {
  const headingParts = aboutIntro.title.split(aboutIntro.highlight)

  return (
    <section className="relative overflow-hidden bg-gradient-to-br from-[#000000] via-[#080808] to-[#141414] py-14 sm:py-18 md:py-20 lg:py-28">
      <div className="section-container">
        <div className="px-5 sm:px-8 md:px-10 lg:px-16">
          <div className="grid gap-6 sm:gap-7 md:gap-8 lg:grid-cols-[33%_45%_22%] lg:gap-4">
            <motion.div
              variants={topFrom}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, amount: 0.15 }}
              className="flex items-start lg:pr-4"
            >
              <h2 className="max-w-[330px] text-[32px] font-light leading-[1.25] tracking-[-1.2px] text-white min-[400px]:text-[35px] sm:text-[40px] md:text-[42px] lg:text-[38px] lg:leading-[1.3] lg:tracking-[-1.5px]">
                {headingParts[0]}
                <span className="text-[#c8101e]">
                  {aboutIntro.highlight}
                </span>
                {headingParts[1]}
              </h2>
            </motion.div>

            <motion.div
              variants={bottomFromSlow}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, amount: 0.15 }}
              className="w-full rounded-xl border border-[#2b2b2b] bg-gradient-to-br from-[#161616] to-[#0a0a0a] p-5 sm:p-6 md:p-7 lg:-translate-x-2 lg:p-6"
            >
              <div>
                <h3 className="text-[14px] font-medium text-[#c8101e] sm:text-[15px]">
                  Who are we
                </h3>

                <p className="mt-3 max-w-[590px] text-[11px] leading-[1.7] text-[#d9d9d9] sm:text-[12px]">
                  {aboutIntro.whoAreWe}
                </p>
              </div>

              <div className="mt-5 sm:mt-6">
                <h3 className="text-[14px] font-medium text-[#c8101e] sm:text-[15px]">
                  Our Mission
                </h3>

                <p className="mt-3 max-w-[590px] text-[11px] leading-[1.7] text-[#d9d9d9] sm:text-[12px]">
                  {aboutIntro.mission}
                </p>
              </div>
            </motion.div>

            <motion.div
              variants={topFromSlow}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, amount: 0.15 }}
              className="relative mx-auto h-[220px] w-full max-w-[520px] overflow-hidden rounded-xl sm:h-[260px] md:h-[300px] lg:mx-0 lg:h-[280px] lg:max-w-none lg:-translate-x-3"
            >
              <img
                src={aboutIntro.image}
                alt="Dark futuristic computer interior"
                className="absolute inset-0 h-full w-full object-cover object-center sm:object-center md:object-center lg:object-center"
              />
            </motion.div>
          </div>

          <div className="mt-6 grid gap-4 sm:mt-7 md:grid-cols-2 lg:mt-7 lg:grid-cols-[165px_165px_1fr]">
            {aboutIntro.cards.map((card, index) => (
              <motion.div
                key={card.id}
                variants={index === 0 ? bottomFrom : topFrom}
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true, amount: 0.15 }}
                className="min-h-[120px] rounded-xl border border-[#2b2b2b] bg-gradient-to-br from-[#161616] to-[#0a0a0a] p-5"
              >
                <h3 className="text-[17px] font-semibold text-[#c8101e] sm:text-[18px]">
                  {card.value}
                </h3>

                <p className="mt-3 text-[11px] leading-[1.6] text-[#d9d9d9] sm:text-[12px]">
                  {card.description}
                </p>
              </motion.div>
            ))}

            <motion.div
              variants={bottomFromSlow}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, amount: 0.15 }}
              className="grid min-h-[120px] gap-5 rounded-xl border border-[#2b2b2b] bg-gradient-to-br from-[#161616] to-[#0a0a0a] p-5 sm:grid-cols-2 sm:gap-6 md:col-span-2 lg:col-span-1 lg:mr-5 lg:grid-cols-3 lg:gap-6"
            >
              {aboutIntro.columns.map((column) => (
                <div key={column.id}>
                  <h3 className="text-[14px] font-medium text-[#c8101e] sm:text-[15px]">
                    {column.title}
                  </h3>

                  <p className="mt-2 text-[11px] leading-[1.6] text-[#d9d9d9] sm:text-[12px]">
                    {column.description}
                  </p>
                </div>
              ))}
            </motion.div>
          </div>
        </div>
      </div>
    </section>
  )
}

export default AboutIntro