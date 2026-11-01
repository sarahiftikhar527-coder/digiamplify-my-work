import { useCallback, useEffect, useRef, useState } from 'react'
import { Link, NavLink, useLocation } from 'react-router-dom'

const navLinks = [
  { label: 'Home', to: '/' },
  { label: 'About', to: '/about' },
  { label: 'Services', to: '/services' },
  { label: 'Projects', to: '/projects' },
  { label: 'Blog', to: '/blog' },
  { label: 'Contact Us', to: '/contact' },
]

// 👉 Is width se upar desktop navbar, neeche hamburger menu (CSS mein bhi 1100px hai)
const DESKTOP_QUERY = '(min-width: 1101px)'

function Navbar() {
  const [open, setOpen] = useState(false)
  const { pathname } = useLocation()
  const headerRef = useRef(null)
  const toggleRef = useRef(null)

  const close = useCallback(() => setOpen(false), [])

  // Page change hote hi menu band
  useEffect(() => {
    setOpen(false)
  }, [pathname])

  // Screen bari ho jaye (rotate / resize) to menu khud band ho jaye
  useEffect(() => {
    const mq = window.matchMedia(DESKTOP_QUERY)
    const onChange = (e) => e.matches && setOpen(false)
    mq.addEventListener('change', onChange)
    return () => mq.removeEventListener('change', onChange)
  }, [])

  // Menu khula ho to: scroll lock, Escape se band, Tab menu ke andar hi ghoome
  useEffect(() => {
    if (!open) return

    const prevOverflow = document.body.style.overflow
    const prevPadding = document.body.style.paddingRight
    const scrollbar = window.innerWidth - document.documentElement.clientWidth
    document.body.style.overflow = 'hidden'
    if (scrollbar > 0) document.body.style.paddingRight = `${scrollbar}px`

    const onKey = (e) => {
      if (e.key === 'Escape') {
        setOpen(false)
        toggleRef.current?.focus()
        return
      }
      if (e.key !== 'Tab' || !headerRef.current) return

      const nodes = headerRef.current.querySelectorAll('.nb-logo, .nb-toggle, .nb-overlay a[href]')
      if (!nodes.length) return
      const first = nodes[0]
      const last = nodes[nodes.length - 1]

      if (e.shiftKey && document.activeElement === first) {
        e.preventDefault()
        last.focus()
      } else if (!e.shiftKey && document.activeElement === last) {
        e.preventDefault()
        first.focus()
      }
    }

    window.addEventListener('keydown', onKey)
    return () => {
      document.body.style.overflow = prevOverflow
      document.body.style.paddingRight = prevPadding
      window.removeEventListener('keydown', onKey)
    }
  }, [open])

  const linkClass = ({ isActive }) => `nb-link${isActive ? ' active' : ''}`

  return (
    <>
      <style>{`
        .nb {
          /* 👉 Desktop scale: 1920px par 1px, chhoti screen par chhota (minimum 0.62px) */
          --u: clamp(0.62px, calc(100vw / 1920), 1px);
          --sat: env(safe-area-inset-top, 0px);
          --sar: env(safe-area-inset-right, 0px);
          --sab: env(safe-area-inset-bottom, 0px);
          --sal: env(safe-area-inset-left, 0px);
          position: relative;
          z-index: 50;
          width: 100%;
          box-sizing: border-box;
          padding: calc(42 * var(--u)) calc(103 * var(--u)) calc(30 * var(--u));
          background: transparent;
          -webkit-tap-highlight-color: transparent;
        }
        .nb.is-open { z-index: 100; }

        .nb-pill {
          position: relative;
          z-index: 2;
          width: 100%;
          max-width: calc(1712 * var(--u));
          height: calc(74 * var(--u));
          margin: 0 auto;
          padding: 0 calc(43 * var(--u)) 0 calc(69 * var(--u));
          box-sizing: border-box;
          display: flex;
          align-items: center;
          justify-content: space-between;
          border-radius: 999px;
          background: #5a5a5a;
        }
        .nb-logo {
          display: inline-flex;
          align-items: baseline;
          color: #fff;
          text-decoration: none;
          font-family: "Poppins", sans-serif;
          font-size: calc(36 * var(--u));
          font-weight: 700;
          line-height: 1;
          white-space: nowrap;
        }
        .nb-bars {
          display: inline-flex;
          align-items: flex-end;
          gap: calc(3 * var(--u));
          height: calc(26 * var(--u));
          margin: 0 calc(3 * var(--u));
        }
        .nb-bars i {
          display: block;
          width: calc(8 * var(--u));
          border-radius: calc(1 * var(--u));
          background: #c8101e;
        }
        .nb-bars i:nth-child(1) { height: 40%; opacity: .75; }
        .nb-bars i:nth-child(2) { height: 70%; }
        .nb-bars i:nth-child(3) { height: 100%; }
        .nb-dot { color: #c8101e; }

        .nb-right { display: flex; align-items: center; gap: calc(38 * var(--u)); }
        .nb-links { display: flex; align-items: center; gap: calc(40 * var(--u)); }
        .nb-link {
          color: #fff;
          text-decoration: none;
          font-family: "Poppins", sans-serif;
          font-size: max(15px, calc(25 * var(--u)));
          font-weight: 600;
          line-height: 1;
          white-space: nowrap;
          transition: color .2s ease;
        }
        .nb-link:hover, .nb-link.active { color: #c8101e; }

        .nb-auth { display: flex; align-items: center; gap: calc(38 * var(--u)); }
        .nb-login {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          height: calc(50 * var(--u));
          padding: 0 calc(31 * var(--u));
          border-radius: 999px;
          background: #c8101e;
          color: #fff;
          text-decoration: none;
          font-family: "Poppins", sans-serif;
          font-size: max(13px, calc(20 * var(--u)));
          font-weight: 500;
          transition: background .2s ease;
        }
        .nb-login:hover { background: #a90d19; }
        .nb-signup {
          color: #eee;
          text-decoration: none;
          font-family: "Poppins", sans-serif;
          font-size: max(13px, calc(20 * var(--u)));
        }

        /* Keyboard users ke liye focus ring */
        .nb a:focus-visible,
        .nb-toggle:focus-visible {
          outline: 2px solid #c8101e;
          outline-offset: 4px;
          border-radius: 8px;
        }

        .nb-toggle, .nb-overlay { display: none; }

        /* ================= TABLET + MOBILE (1100px aur neeche) ================= */
        @media (max-width: 1100px) {
          .nb {
            padding: calc(22px + var(--sat)) calc(28px + var(--sar)) 22px calc(28px + var(--sal));
            /* 👉 Hamburger button ka center (menu yahin se circle ban kar khulta hai) */
            --cx: calc(61px + var(--sar));
            --cy: calc(54px + var(--sat));
          }
          .nb-pill {
            height: 64px;
            padding: 0 10px 0 28px;
            background: rgba(90, 90, 90, 0.55);
            -webkit-backdrop-filter: blur(16px) saturate(140%);
            backdrop-filter: blur(16px) saturate(140%);
            border: 1px solid rgba(255, 255, 255, 0.12);
            transition: background .5s ease, border-color .5s ease;
          }
          .nb.is-open .nb-pill {
            background: rgba(255, 255, 255, 0.08);
            border-color: rgba(255, 255, 255, 0.18);
          }
          .nb-logo { font-size: 28px; }
          .nb-bars { height: 20px; gap: 3px; margin: 0 3px; }
          .nb-bars i { width: 6px; border-radius: 1px; }
          .nb-right { display: none; }

          /* animated hamburger */
          .nb-toggle {
            position: relative;
            display: block;
            flex-shrink: 0;
            width: 46px; height: 46px;
            border: 0; border-radius: 999px;
            background: rgba(255,255,255,.08);
            cursor: pointer;
            -webkit-tap-highlight-color: transparent;
            transition: background .3s ease, transform .3s ease;
          }
          .nb-toggle:active { transform: scale(.92); }
          .nb-toggle span {
            position: absolute;
            left: 13px;
            width: 20px; height: 2px;
            border-radius: 2px;
            background: #fff;
            transition: transform .45s cubic-bezier(.7,0,.2,1), opacity .25s ease, width .3s ease;
          }
          .nb-toggle span:nth-child(1) { top: 16px; }
          .nb-toggle span:nth-child(2) { top: 22px; width: 14px; }
          .nb-toggle span:nth-child(3) { top: 28px; }
          .nb.is-open .nb-toggle span:nth-child(1) { transform: translateY(6px) rotate(45deg); }
          .nb.is-open .nb-toggle span:nth-child(2) { opacity: 0; transform: translateX(10px); }
          .nb.is-open .nb-toggle span:nth-child(3) { transform: translateY(-6px) rotate(-45deg); }

          @media (hover: hover) {
            .nb-toggle:hover { background: rgba(200,16,30,.55); }
            .nb-toggle:hover span:nth-child(2) { width: 20px; }
          }

          /* full-screen glass overlay */
          .nb-overlay {
            position: fixed;
            inset: 0;
            z-index: 1;
            display: flex;
            flex-direction: column;
            box-sizing: border-box;
            padding:
              calc(118px + var(--sat))
              calc(36px + var(--sar))
              calc(36px + var(--sab))
              calc(36px + var(--sal));
            overflow-y: auto;
            overscroll-behavior: contain;
            background:
              radial-gradient(ellipse at 85% 0%, rgba(200,16,30,.22), transparent 55%),
              rgba(8, 8, 8, 0.72);
            -webkit-backdrop-filter: blur(24px) saturate(150%);
            backdrop-filter: blur(24px) saturate(150%);
            clip-path: circle(0px at calc(100% - var(--cx)) var(--cy));
            visibility: hidden;
            transition:
              clip-path .8s cubic-bezier(.7,0,.2,1),
              visibility 0s linear .8s;
          }
          .nb.is-open .nb-overlay {
            clip-path: circle(160% at calc(100% - var(--cx)) var(--cy));
            visibility: visible;
            transition:
              clip-path .9s cubic-bezier(.7,0,.2,1),
              visibility 0s;
          }
          @supports not ((backdrop-filter: blur(1px)) or (-webkit-backdrop-filter: blur(1px))) {
            .nb-overlay { background: rgba(8, 8, 8, 0.96); }
          }

          /* floating red glows */
          .nb-glow {
            position: absolute;
            border-radius: 50%;
            pointer-events: none;
            filter: blur(70px);
            background: rgba(200,16,30,.35);
            animation: nbFloat 7s ease-in-out infinite;
          }
          .nb-glow.g1 { width: 260px; height: 260px; left: -80px; bottom: 8%; }
          .nb-glow.g2 { width: 200px; height: 200px; right: -60px; top: 30%; animation-delay: -3s; opacity: .7; }
          @keyframes nbFloat {
            0%, 100% { transform: translate(0, 0) scale(1); }
            50%      { transform: translate(24px, -30px) scale(1.2); }
          }

          /* margin:auto = safe centering (content lamba ho to upar se kat'ta nahi) */
          .nb-menu {
            position: relative;
            width: 100%;
            max-width: 640px;
            margin: auto;
            display: flex;
            flex-direction: column;
          }

          /* stagger items */
          .nb-item {
            opacity: 0;
            transform: translateY(46px);
            filter: blur(10px);
            transition: opacity .35s ease, transform .35s ease, filter .35s ease;
          }
          .nb.is-open .nb-item {
            opacity: 1;
            transform: translateY(0);
            filter: blur(0);
            transition:
              opacity .6s ease,
              transform .7s cubic-bezier(.2,.8,.2,1),
              filter .6s ease;
            transition-delay: calc(.3s + var(--i) * .07s);
          }

          /* 👉 Font aur padding screen ki height ke hisab se khud adjust hote hain */
          .nb-menu .nb-link {
            position: relative;
            display: flex;
            align-items: center;
            gap: 18px;
            padding: clamp(9px, 1.9vh, 18px) 4px;
            font-size: clamp(26px, 4.8vh, 40px);
            font-weight: 500;
            letter-spacing: -0.01em;
            border-bottom: 1px solid rgba(255,255,255,.1);
            transition: color .3s ease, padding-left .35s cubic-bezier(.2,.8,.2,1);
          }
          .nb-menu .nb-link::after {
            content: "";
            position: absolute;
            left: 0; bottom: -1px;
            height: 1px; width: 0;
            background: #c8101e;
            transition: width .5s cubic-bezier(.2,.8,.2,1);
          }
          .nb-menu .nb-link.active::after { width: 100%; }
          @media (hover: hover) {
            .nb-menu .nb-link:hover::after { width: 100%; }
            .nb-menu .nb-link:hover { padding-left: 14px; }
            .nb-menu .nb-link:hover .nb-arrow { opacity: 1; transform: translateX(0); }
          }

          .nb-num {
            font-size: 13px;
            font-weight: 500;
            letter-spacing: .12em;
            color: #c8101e;
            min-width: 26px;
          }
          .nb-arrow {
            margin-left: auto;
            font-size: 22px;
            opacity: 0;
            transform: translateX(-12px);
            color: #c8101e;
            transition: opacity .3s ease, transform .35s ease;
          }
          .nb-menu .nb-link.active .nb-arrow { opacity: 1; transform: translateX(0); }

          /* Login + Signup: dono barabar buttons */
          .nb-menu .nb-auth {
            margin-top: clamp(20px, 4vh, 36px);
            gap: 14px;
          }
          .nb-menu .nb-login,
          .nb-menu .nb-signup {
            flex: 1 1 0;
            display: inline-flex;
            align-items: center;
            justify-content: center;
            box-sizing: border-box;
            height: 54px;
            padding: 0 20px;
            border-radius: 999px;
            font-family: "Poppins", sans-serif;
            font-size: 17px;
            font-weight: 500;
            text-decoration: none;
            -webkit-tap-highlight-color: transparent;
          }
          .nb-menu .nb-login { box-shadow: 0 14px 34px -12px rgba(200,16,30,.8); }
          .nb-menu .nb-signup {
            color: #fff;
            border: 1px solid rgba(255,255,255,.28);
            background: rgba(255,255,255,.05);
            transition: background .3s ease, border-color .3s ease;
          }
          .nb-menu .nb-signup:active { background: rgba(255,255,255,.12); }
          @media (hover: hover) {
            .nb-menu .nb-signup:hover { border-color: #c8101e; background: rgba(200,16,30,.18); }
          }

          .nb-foot {
            margin: 26px 0 0;
            font-family: "Poppins", sans-serif;
            font-size: 12px;
            letter-spacing: .08em;
            color: rgba(255,255,255,.4);
          }
        }

        /* ================= TABLET (portrait / bara) ================= */
        @media (min-width: 768px) and (max-width: 1100px) {
          .nb-menu { max-width: 720px; }
          .nb-num { font-size: 14px; }
        }

        /* ================= MOBILE ================= */
        @media (max-width: 640px) {
          .nb {
            padding: calc(14px + var(--sat)) calc(14px + var(--sar)) 14px calc(14px + var(--sal));
            --cx: calc(42px + var(--sar));
            --cy: calc(42px + var(--sat));
          }
          .nb-pill { height: 56px; padding: 0 7px 0 20px; }
          .nb-logo { font-size: 22px; }
          .nb-bars { height: 16px; gap: 2px; margin: 0 2px; }
          .nb-bars i { width: 5px; }
          .nb-toggle { width: 42px; height: 42px; }
          .nb-toggle span { left: 11px; }
          .nb-toggle span:nth-child(1) { top: 14px; }
          .nb-toggle span:nth-child(2) { top: 20px; }
          .nb-toggle span:nth-child(3) { top: 26px; }
          .nb.is-open .nb-toggle span:nth-child(1) { transform: translateY(6px) rotate(45deg); }
          .nb.is-open .nb-toggle span:nth-child(3) { transform: translateY(-6px) rotate(-45deg); }

          .nb-overlay {
            padding:
              calc(94px + var(--sat))
              calc(22px + var(--sar))
              calc(28px + var(--sab))
              calc(22px + var(--sal));
          }
          .nb-menu .nb-link {
            font-size: clamp(22px, 4.2vh, 30px);
            padding: clamp(9px, 1.8vh, 15px) 2px;
            gap: 14px;
          }
          .nb-menu .nb-auth { gap: 10px; }
          .nb-menu .nb-login, .nb-menu .nb-signup { height: 52px; padding: 0 12px; font-size: 16px; }
        }

        /* Bohat chhote phones (360px aur neeche) */
        @media (max-width: 380px) {
          .nb-logo { font-size: 20px; }
          .nb-overlay {
            padding-left: calc(18px + var(--sal));
            padding-right: calc(18px + var(--sar));
          }
          .nb-menu .nb-link { font-size: clamp(21px, 4vh, 26px); }
          .nb-num { min-width: 22px; font-size: 12px; }
        }

        /* ================= LANDSCAPE (phone ghuma ho / kam height) ================= */
        @media (max-width: 1100px) and (max-height: 560px) and (orientation: landscape) {
          .nb-overlay {
            padding-top: calc(86px + var(--sat));
            padding-bottom: calc(18px + var(--sab));
          }
          .nb-menu {
            max-width: 880px;
            display: grid;
            grid-template-columns: 1fr 1fr;
            column-gap: 48px;
          }
          .nb-menu .nb-wide { grid-column: 1 / -1; }
          .nb-menu .nb-link { font-size: 22px; padding: 10px 2px; }
          .nb-menu .nb-auth { margin-top: 20px; max-width: 420px; }
          .nb-menu .nb-login, .nb-menu .nb-signup { height: 46px; }
          .nb-foot { margin-top: 14px; }
          .nb-glow { display: none; }
        }

        @media (prefers-reduced-motion: reduce) {
          .nb-glow { animation: none; }
          .nb-overlay, .nb-item { transition-duration: .01s !important; transition-delay: 0s !important; }
        }
      `}</style>

      <header ref={headerRef} className={`nb${open ? ' is-open' : ''}`}>
        <nav className="nb-pill" aria-label="Main navigation">
          <Link to="/" className="nb-logo" aria-label="DigiAmplify home">
            DigiA
            <span className="nb-bars" aria-hidden="true">
              <i />
              <i />
              <i />
            </span>
            plify<span className="nb-dot">.</span>
          </Link>

          {/* Desktop */}
          <div className="nb-right">
            <div className="nb-links">
              {navLinks.map((link) => (
                <NavLink
                  key={link.to}
                  to={link.to}
                  end={link.to === '/'}
                  className={linkClass}
                >
                  {link.label}
                </NavLink>
              ))}
            </div>

            <div className="nb-auth">
              <Link to="/login" className="nb-login">Login</Link>
              <Link to="/signup" className="nb-signup">Signup</Link>
            </div>
          </div>

          {/* Tablet + Mobile toggle */}
          <button
            ref={toggleRef}
            type="button"
            className="nb-toggle"
            onClick={() => setOpen((v) => !v)}
            aria-label={open ? 'Close menu' : 'Open menu'}
            aria-expanded={open}
            aria-controls="nb-overlay"
          >
            <span />
            <span />
            <span />
          </button>
        </nav>

        {/* Tablet + Mobile glass overlay */}
        <div
          id="nb-overlay"
          className="nb-overlay"
          role="dialog"
          aria-modal="true"
          aria-label="Site menu"
          aria-hidden={!open}
        >
          <div className="nb-glow g1" />
          <div className="nb-glow g2" />

          <div className="nb-menu">
            {navLinks.map((link, i) => (
              <div key={link.to} className="nb-item" style={{ '--i': i }}>
                <NavLink
                  to={link.to}
                  end={link.to === '/'}
                  className={linkClass}
                  onClick={close}
                  tabIndex={open ? 0 : -1}
                >
                  <span className="nb-num">{String(i + 1).padStart(2, '0')}</span>
                  {link.label}
                  <span className="nb-arrow" aria-hidden="true">→</span>
                </NavLink>
              </div>
            ))}

            <div className="nb-item nb-wide" style={{ '--i': navLinks.length }}>
              <div className="nb-auth">
                <Link to="/login" className="nb-login" onClick={close} tabIndex={open ? 0 : -1}>
                  Login
                </Link>
                <Link to="/signup" className="nb-signup" onClick={close} tabIndex={open ? 0 : -1}>
                  Signup
                </Link>
              </div>
            </div>

            <p className="nb-foot nb-item nb-wide" style={{ '--i': navLinks.length + 1 }}>
              © 2026 DigiAmplify
            </p>
          </div>
        </div>
      </header>
    </>
  )
}

export default Navbar