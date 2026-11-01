
import { motion, useReducedMotion } from 'framer-motion'
import { Link } from 'react-router-dom'
import { capabilitiesContent } from '@/data/home/capabilities'

const ease = [0.22, 1, 0.36, 1]

const topFrom = {
  hidden: {
    opacity: 0,
    y: 'calc(-55 * var(--u))',
  },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.7,
      ease,
    },
  },
}

const bottomFrom = {
  hidden: {
    opacity: 0,
    y: 'calc(55 * var(--u))',
  },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.7,
      ease,
    },
  },
}

const leftFrom = {
  hidden: {
    opacity: 0,
    x: 'calc(-60 * var(--u))',
  },
  visible: {
    opacity: 1,
    x: 0,
    transition: {
      duration: 0.75,
      ease,
    },
  },
}

const checklistFromLeft = {
  hidden: {
    opacity: 0,
    x: 'calc(-70 * var(--u))',
  },
  visible: (index) => ({
    opacity: 1,
    x: 0,
    transition: {
      duration: 0.6,
      delay: index * 0.12,
      ease,
    },
  }),
}

function CheckIcon() {
  return (
    <svg
      viewBox="0 0 12 12"
      fill="none"
      style={{
        width: 'calc(19 * var(--u))',
        height: 'calc(19 * var(--u))',
      }}
      aria-hidden="true"
    >
      <path
        d="M2.2 6.1L4.65 8.45L9.8 3.4"
        stroke="white"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  )
}

function CapabilityCard({ card, index, reduceMotion }) {
  const variants = index % 2 === 0 ? topFrom : bottomFrom
  const servicePath = `/services/${card.slug}`

  return (
    <motion.article
      variants={variants}
      initial="hidden"
      whileInView="visible"
      viewport={{
        once: true,
        amount: 0.15,
      }}
      whileHover={
        reduceMotion
          ? undefined
          : {
              y: -6,
              borderColor: 'rgba(200,16,30,0.45)',
              boxShadow: '0 22px 50px -30px rgba(200,16,30,0.45)',
              transition: {
                duration: 0.3,
                ease,
              },
            }
      }
      className="cap-card flex min-w-0 flex-col"
      style={{
        height: 'calc(363 * var(--u))',
        borderRadius: 'calc(20 * var(--u))',
        border: 'calc(1.5 * var(--u)) solid #2e2e2e',
        background: '#0f0f0f',
        padding:
          'calc(52 * var(--u)) calc(20 * var(--u)) calc(43 * var(--u)) calc(25 * var(--u))',
      }}
    >
      <h3
        style={{
          margin: 0,
          fontFamily: "'Poppins', sans-serif",
          fontSize: 'calc(28 * var(--u))',
          lineHeight: 'calc(38 * var(--u))',
          fontWeight: 500,
          color: '#c8101e',
        }}
      >
        {card.title}
      </h3>

      <p
        style={{
          margin: 0,
          marginTop: 'calc(20 * var(--u))',
          fontFamily: "'Poppins', sans-serif",
          fontSize: 'calc(18 * var(--u))',
          lineHeight: 'calc(29 * var(--u))',
          fontWeight: 400,
          color: '#ffffff',
        }}
      >
        {card.description}
      </p>

      <Link
        to={servicePath}
        aria-label={`Learn more about ${card.title}`}
        className="cap-learn-more"
        style={{
          marginTop: 'auto',
          alignSelf: 'flex-start',
          height: 'calc(44 * var(--u))',
          padding: '0 calc(28 * var(--u))',
          borderRadius: '999px',
          border: 'calc(1.5 * var(--u)) solid #c8101e',
          background: 'transparent',
          color: '#c8101e',
          fontFamily: "'Poppins', sans-serif",
          fontSize: 'calc(20 * var(--u))',
          fontWeight: 400,
          lineHeight: 'calc(44 * var(--u))',
          cursor: 'pointer',
          textDecoration: 'none',
          display: 'inline-flex',
          alignItems: 'center',
          justifyContent: 'center',
          transition:
            'background-color 300ms ease, color 300ms ease, transform 300ms ease',
        }}
        onMouseEnter={(event) => {
          event.currentTarget.style.background = '#c8101e'
          event.currentTarget.style.color = '#ffffff'
          event.currentTarget.style.transform = 'translateY(-2px)'
        }}
        onMouseLeave={(event) => {
          event.currentTarget.style.background = 'transparent'
          event.currentTarget.style.color = '#c8101e'
          event.currentTarget.style.transform = 'translateY(0)'
        }}
      >
        Learn More
      </Link>
    </motion.article>
  )
}

function Capabilities() {
  const reduceMotion = useReducedMotion()

  const rows = [
    capabilitiesContent.services.slice(0, 2),
    capabilitiesContent.services.slice(2, 4),
    capabilitiesContent.services.slice(4, 6),
  ]

  return (
    <section
      className="cap-section relative w-full overflow-hidden text-white"
      style={{
        '--u': 'min(calc(100vw / 1920), 1px)',
        background:
          'radial-gradient(ellipse 800px 420px at 480px 370px, #303030 0%, #161616 45%, transparent 100%), radial-gradient(ellipse 700px 300px at 30% 100%, #1f1f1f, transparent), #050505',
        paddingTop: 'calc(97 * var(--u))',
        paddingLeft: 'calc(104 * var(--u))',
        paddingRight: 'calc(104 * var(--u))',
        paddingBottom: 'calc(110 * var(--u))',
      }}
    >
      <div
        className="relative mx-auto w-full"
        style={{
          maxWidth: 'calc(1920 * var(--u))',
        }}
      >
        <motion.div
          variants={topFrom}
          initial="hidden"
          whileInView="visible"
          viewport={{
            once: true,
            amount: 0.2,
          }}
          className="cap-header relative z-10"
        >
          <h2
            style={{
              fontFamily: "'League Spartan', sans-serif",
              fontSize: 'calc(58 * var(--u))',
              lineHeight: 'calc(70 * var(--u))',
              fontWeight: 300,
              letterSpacing: 'calc(-1.2 * var(--u))',
              color: '#ffffff',
              margin: 0,
            }}
          >
            Capabilities built for{' '}
            <span style={{ color: '#c8101e' }}>impact</span>
            <span style={{ color: '#ffffff' }}>.</span>
          </h2>

          <p
            className="cap-description"
            style={{
              margin: 0,
              marginTop: 'calc(26 * var(--u))',
              maxWidth: 'calc(1200 * var(--u))',
              fontFamily: "'Poppins', sans-serif",
              fontSize: 'calc(22 * var(--u))',
              lineHeight: 'calc(37 * var(--u))',
              fontWeight: 400,
              color: '#ffffff',
            }}
          >
            We combine enterprise-level discipline with a refined creative
            approach to deliver high-quality digital
            <br className="desktop-break" />
            solutions, ensuring every project is executed with precision,
            attention to detail, and a strong focus on
            <br className="desktop-break" />
            performance to achieve category-leading results.
          </p>
        </motion.div>

        <motion.div
          initial={{
            opacity: 0,
            y: 'calc(35 * var(--u))',
          }}
          whileInView={{
            opacity: 1,
            y: 0,
          }}
          viewport={{
            once: true,
            amount: 0.15,
          }}
          transition={{
            duration: 0.9,
            ease,
          }}
          className="cap-ring pointer-events-none absolute z-[2]"
          style={{
            left: 'calc(1326 * var(--u))',
            top: 'calc(-64 * var(--u))',
            width: 'calc(285 * var(--u))',
          }}
        >
          <motion.img
            src={capabilitiesContent.visual}
            alt="Chrome glass metallic 3D ring"
            animate={
              reduceMotion
                ? undefined
                : {
                    rotate: 360,
                  }
            }
            transition={{
              duration: 16,
              repeat: Infinity,
              ease: 'linear',
            }}
            className="block h-auto w-full object-contain"
            style={{
              background: 'transparent',
            }}
          />
        </motion.div>

        <motion.div
          initial={{
            opacity: 0,
            y: 35,
          }}
          whileInView={{
            opacity: 1,
            y: 0,
          }}
          viewport={{
            once: true,
            amount: 0.1,
          }}
          transition={{
            duration: 0.8,
            ease,
          }}
          className="cap-panel"
          style={{
            marginTop: 'calc(93 * var(--u))',
            width: '100%',
            background: '#0e0e0e',
            borderRadius: 'calc(14 * var(--u))',
            padding:
              'calc(36 * var(--u)) calc(42 * var(--u)) calc(58 * var(--u)) calc(34 * var(--u))',
          }}
        >
          <div
            className="cap-inner flex items-stretch"
            style={{
              gap: 'calc(45 * var(--u))',
            }}
          >
            <motion.div
              variants={leftFrom}
              initial="hidden"
              whileInView="visible"
              viewport={{
                once: true,
                amount: 0.15,
              }}
              className="cap-left shrink-0"
              style={{
                width: 'calc(456 * var(--u))',
                borderRadius: 'calc(16 * var(--u))',
                background:
                  'linear-gradient(180deg, #101010 0%, #232323 100%)',
                padding:
                  'calc(37 * var(--u)) calc(35 * var(--u)) calc(35 * var(--u))',
              }}
            >
              <h3
                style={{
                  margin: 0,
                  fontFamily: "'Poppins', sans-serif",
                  fontSize: 'calc(27 * var(--u))',
                  lineHeight: 'calc(42 * var(--u))',
                  fontWeight: 600,
                  color: '#ffffff',
                }}
              >
                End-to-end expertise,
                <br />
                aligned to outcomes
              </h3>

              <p
                style={{
                  margin: 0,
                  marginTop: 'calc(27 * var(--u))',
                  fontFamily: "'Poppins', sans-serif",
                  fontSize: 'calc(18 * var(--u))',
                  lineHeight: 'calc(29 * var(--u))',
                  fontWeight: 400,
                  color: '#ffffff',
                }}
              >
                {capabilitiesContent.propositionDescription}
              </p>

              <ul
                className="m-0 flex list-none flex-col p-0"
                style={{
                  marginTop: 'calc(32 * var(--u))',
                  gap: 'calc(17.5 * var(--u))',
                }}
              >
                {capabilitiesContent.checklist.map((item, index) => (
                  <motion.li
                    key={item}
                    custom={index}
                    variants={checklistFromLeft}
                    initial="hidden"
                    whileInView="visible"
                    viewport={{
                      once: true,
                      amount: 0.35,
                    }}
                    className="flex items-center"
                    style={{
                      gap: 'calc(17 * var(--u))',
                      fontFamily: "'Poppins', sans-serif",
                      fontSize: 'calc(18 * var(--u))',
                      lineHeight: 'calc(27 * var(--u))',
                      fontWeight: 400,
                      color: '#ffffff',
                    }}
                  >
                    <motion.span
                      className="flex shrink-0 items-center justify-center"
                      style={{
                        width: 'calc(40 * var(--u))',
                        height: 'calc(40 * var(--u))',
                        borderRadius: '50%',
                        background: '#c8101e',
                      }}
                      whileHover={
                        reduceMotion
                          ? undefined
                          : {
                              scale: 1.08,
                              rotate: 5,
                            }
                      }
                      transition={{
                        duration: 0.25,
                        ease,
                      }}
                    >
                      <CheckIcon />
                    </motion.span>

                    <span>{item}</span>
                  </motion.li>
                ))}
              </ul>
            </motion.div>

            <div
              className="cap-cards min-w-0 flex-1"
              style={{
                display: 'flex',
                flexDirection: 'column',
                gap: 'calc(38 * var(--u))',
              }}
            >
              {rows.map((row, rowIndex) => (
                <div
                  key={rowIndex}
                  className="cap-row flex min-w-0"
                  style={{
                    gap: 'calc(38 * var(--u))',
                  }}
                >
                  {row.map((card, cardIndex) => (
                    <div
                      key={card.id}
                      className="cap-cell min-w-0"
                      style={{
                        flex:
                          card.size === 'wide'
                            ? '1.61 1 0'
                            : '1 1 0',
                      }}
                    >
                      <CapabilityCard
                        card={card}
                        index={rowIndex * 2 + cardIndex}
                        reduceMotion={reduceMotion}
                      />
                    </div>
                  ))}
                </div>
              ))}
            </div>
          </div>
        </motion.div>
      </div>

      <style>{`
        @media (max-width: 1200px) {
          .cap-section {
            --u: 0.8px !important;
            padding-left: 45px !important;
            padding-right: 45px !important;
          }

          .cap-ring {
            left: auto !important;
            right: -25px !important;
            top: -20px !important;
            width: 180px !important;
          }

          .cap-panel {
            margin-top: 75px !important;
            padding: 28px !important;
          }

          .cap-inner {
            flex-direction: column !important;
            gap: 28px !important;
          }

          .cap-left {
            width: 100% !important;
            box-sizing: border-box !important;
            padding: 30px !important;
          }

          .cap-cards {
            display: grid !important;
            grid-template-columns: repeat(2, minmax(0, 1fr)) !important;
            gap: 18px !important;
          }

          .cap-row {
            display: contents !important;
          }

          .cap-cell {
            display: flex !important;
            flex: none !important;
            min-width: 0 !important;
          }

          .cap-card {
            width: 100% !important;
            height: auto !important;
            min-height: 270px !important;
            box-sizing: border-box !important;
            padding: 30px !important;
          }
        }

        @media (max-width: 900px) {
          .cap-section {
            --u: 0.72px !important;
            padding-left: 30px !important;
            padding-right: 30px !important;
            padding-top: 75px !important;
            padding-bottom: 80px !important;
          }

          .cap-header {
            max-width: 720px !important;
          }

          .cap-header h2 {
            font-size: 42px !important;
            line-height: 1.15 !important;
            letter-spacing: -0.8px !important;
          }

          .cap-description {
            font-size: 15px !important;
            line-height: 1.8 !important;
            max-width: 680px !important;
          }

          .desktop-break {
            display: none !important;
          }

          .cap-ring {
            width: 135px !important;
            right: -20px !important;
            top: -15px !important;
            opacity: 0.8;
          }

          .cap-panel {
            margin-top: 55px !important;
            padding: 22px !important;
            border-radius: 13px !important;
          }

          .cap-left {
            padding: 28px !important;
            border-radius: 14px !important;
          }

          .cap-left h3 {
            font-size: 24px !important;
            line-height: 1.45 !important;
          }

          .cap-left p {
            font-size: 14px !important;
            line-height: 1.75 !important;
            margin-top: 18px !important;
          }

          .cap-left ul {
            margin-top: 24px !important;
            gap: 13px !important;
          }

          .cap-left li {
            gap: 12px !important;
            font-size: 14px !important;
            line-height: 1.5 !important;
          }

          .cap-left li > span:first-child {
            width: 32px !important;
            height: 32px !important;
          }

          .cap-left li svg {
            width: 15px !important;
            height: 15px !important;
          }

          .cap-cards {
            gap: 16px !important;
          }

          .cap-card {
            min-height: 250px !important;
            padding: 26px !important;
          }

          .cap-card h3 {
            font-size: 21px !important;
            line-height: 1.4 !important;
          }

          .cap-card p {
            margin-top: 13px !important;
            font-size: 14px !important;
            line-height: 1.7 !important;
          }

          .cap-card a {
            height: 39px !important;
            padding: 0 20px !important;
            font-size: 14px !important;
            line-height: 39px !important;
          }
        }

        @media (max-width: 640px) {
          .cap-section {
            --u: 1px !important;
            padding: 62px 18px 65px !important;
          }

          .cap-header {
            padding-top: 20px !important;
          }

          .cap-header h2 {
            max-width: 300px !important;
            font-size: 32px !important;
            line-height: 1.2 !important;
            letter-spacing: -0.5px !important;
          }

          .cap-description {
            margin-top: 16px !important;
            font-size: 12.5px !important;
            line-height: 1.75 !important;
          }

          .cap-ring {
            width: 85px !important;
            right: -18px !important;
            top: -5px !important;
            opacity: 0.6;
          }

          .cap-panel {
            margin-top: 38px !important;
            padding: 14px !important;
            border-radius: 11px !important;
          }

          .cap-inner {
            gap: 14px !important;
          }

          .cap-left {
            padding: 22px !important;
            border-radius: 12px !important;
          }

          .cap-left h3 {
            font-size: 20px !important;
            line-height: 1.4 !important;
          }

          .cap-left p {
            font-size: 12.5px !important;
            line-height: 1.7 !important;
            margin-top: 14px !important;
          }

          .cap-left ul {
            margin-top: 20px !important;
            gap: 11px !important;
          }

          .cap-left li {
            gap: 10px !important;
            font-size: 12.5px !important;
            line-height: 1.5 !important;
            align-items: flex-start !important;
          }

          .cap-left li > span:first-child {
            width: 29px !important;
            height: 29px !important;
            margin-top: 1px;
          }

          .cap-left li svg {
            width: 14px !important;
            height: 14px !important;
          }

          .cap-cards {
            grid-template-columns: 1fr !important;
            gap: 12px !important;
          }

          .cap-card {
            min-height: 220px !important;
            padding: 22px !important;
            border-radius: 12px !important;
          }

          .cap-card h3 {
            font-size: 19px !important;
            line-height: 1.4 !important;
          }

          .cap-card p {
            margin-top: 11px !important;
            font-size: 12.5px !important;
            line-height: 1.7 !important;
          }

          .cap-card a {
            height: 36px !important;
            padding: 0 17px !important;
            font-size: 12px !important;
            line-height: 36px !important;
          }
        }

        @media (max-width: 390px) {
          .cap-section {
            padding-left: 14px !important;
            padding-right: 14px !important;
          }

          .cap-header h2 {
            max-width: 270px !important;
            font-size: 29px !important;
          }

          .cap-description {
            font-size: 11.5px !important;
          }

          .cap-panel {
            padding: 11px !important;
          }

          .cap-left {
            padding: 19px !important;
          }

          .cap-left h3 {
            font-size: 18px !important;
          }

          .cap-left p,
          .cap-left li {
            font-size: 11.5px !important;
          }

          .cap-card {
            min-height: 205px !important;
            padding: 19px !important;
          }

          .cap-card h3 {
            font-size: 18px !important;
          }

          .cap-card p {
            font-size: 11.5px !important;
          }

          .cap-card a {
            height: 34px !important;
            padding: 0 15px !important;
            font-size: 11px !important;
            line-height: 34px !important;
          }
        }

        @media (hover: none) {
          .cap-learn-more:hover {
            transform: none;
          }
        }

        @media (prefers-reduced-motion: reduce) {
          .cap-ring img {
            animation: none !important;
          }
        }
      `}</style>
    </section>
  )
}

export default Capabilities