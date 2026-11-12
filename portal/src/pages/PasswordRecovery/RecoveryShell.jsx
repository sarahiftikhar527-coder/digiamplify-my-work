import { Link } from "react-router-dom";
import { ShieldCheck } from "lucide-react";

const LOGIN_IMAGE = "/images/Login/login.webp";

export const REMEMBER_KEY = "digiamplify_remembered_email";

export const getErrorMessage = (error) =>
  String(error?.message || "Something went wrong. Please try again.");

/* ---------- Logo (same look as the login page) ---------- */
export const Logo = ({ size = 66 }) => (
  <div
    className="rc-rise text-center font-bold leading-none tracking-tight text-white"
    style={{ fontSize: size, "--d": "0.1s" }}
  >
    DigiA
    <span
      className="inline-flex items-end align-baseline"
      style={{ margin: "0 0.03em", gap: "0.1em" }}
      aria-hidden="true"
    >
      <span
        className="rc-bar block bg-[#c1121f]"
        style={{ width: "0.23em", height: "0.41em", "--d": "0.5s" }}
      />
      <span
        className="rc-bar block bg-[#c1121f]"
        style={{ width: "0.23em", height: "0.65em", "--d": "0.62s" }}
      />
      <span
        className="rc-bar block bg-[#c1121f]"
        style={{ width: "0.23em", height: "0.89em", "--d": "0.74s" }}
      />
    </span>
    plify<span className="text-[#c1121f]">.</span>
  </div>
);

/* ---------- Shared form styles ---------- */
export const labelClass = "mb-3 block text-[18px] font-medium leading-none text-white";

export const inputWrapClass = (hasError) =>
  `flex h-[64px] items-center gap-4 rounded-[8px] border bg-[#0d0d0d] px-5 transition focus-within:border-red-700 focus-within:shadow-[0_0_0_3px_rgba(193,18,31,0.18)] ${
    hasError ? "border-red-600" : "border-[#333]"
  }`;

export const inputClass =
  "rc-input h-full w-full bg-transparent text-[18px] font-light text-white outline-none placeholder:text-gray-500";

export const primaryButtonClass =
  "flex h-[60px] w-full items-center justify-center gap-2.5 rounded-[8px] bg-gradient-to-r from-[#c1121f] via-[#a30f1a] to-[#5c0a10] text-[20px] font-semibold text-white shadow-[0_8px_24px_rgba(193,18,31,0.25)] transition hover:brightness-110 disabled:cursor-not-allowed disabled:opacity-70";

export const secondaryButtonClass =
  "flex h-[54px] w-full items-center justify-center gap-2 rounded-[8px] border border-[#333] bg-transparent text-[16px] text-white transition hover:border-red-700 disabled:cursor-not-allowed disabled:opacity-50";

export const linkClass =
  "inline-flex items-center justify-center gap-2 text-[16px] font-medium text-[#e10b1f] transition hover:text-red-500";

export const FieldError = ({ children }) =>
  children ? <p className="mt-2 text-[14px] text-red-500">{children}</p> : null;

export const ErrorBox = ({ children }) =>
  children ? (
    <p
      role="alert"
      className="mt-5 rounded-[8px] border border-red-900/70 bg-red-950/40 px-4 py-3 text-[15px] text-red-400"
    >
      {children}
    </p>
  ) : null;

/* ---------- Page layout ---------- */
export default function RecoveryShell({ icon: Icon, title, subtitle, children }) {
  return (
    <div className="fixed inset-0 overflow-y-auto bg-[#383838] font-['Poppins',sans-serif] lg:flex lg:overflow-hidden">
      <style>{`
        .rc-input:-webkit-autofill,
        .rc-input:-webkit-autofill:hover,
        .rc-input:-webkit-autofill:focus {
          -webkit-text-fill-color: #ffffff;
          -webkit-box-shadow: 0 0 0 1000px #0d0d0d inset;
          caret-color: #ffffff;
          transition: background-color 9999s ease-in-out 0s;
        }
        .rc-input::selection { background: rgba(193, 18, 31, 0.5); }

        .rc-shimmer {
          display: inline-block;
          color: transparent;
          background: linear-gradient(90deg, #e10b1f 0%, #ff7a85 25%, #e10b1f 50%, #e10b1f 100%);
          background-size: 200% 100%;
          -webkit-background-clip: text;
          background-clip: text;
          -webkit-text-fill-color: transparent;
        }

        @media (prefers-reduced-motion: no-preference) {
          .rc-rise {
            opacity: 0;
            animation: rcRise 0.9s cubic-bezier(0.2, 0.8, 0.2, 1) var(--d, 0s) forwards;
          }
          .rc-card { animation: rcCard 0.7s cubic-bezier(0.2, 0.8, 0.2, 1) both; }
          .rc-bar {
            transform-origin: 50% 100%;
            animation:
              rcBarGrow 0.8s cubic-bezier(0.2, 0.8, 0.2, 1) var(--d, 0s) both,
              rcBarPulse 2.8s ease-in-out calc(var(--d, 0s) + 1.4s) infinite;
          }
          .rc-shimmer { animation: rcShimmer 4s linear infinite; }
          .rc-shield { animation: rcGlow 2.6s ease-in-out infinite; }
          .rc-zoom { animation: rcZoom 22s ease-in-out infinite alternate; }
          .rc-glow { animation: rcFloat 9s ease-in-out infinite; }
        }

        @keyframes rcRise {
          from { opacity: 0; transform: translateY(28px); filter: blur(8px); }
          to   { opacity: 1; transform: translateY(0); filter: blur(0); }
        }
        @keyframes rcCard {
          from { opacity: 0; transform: translateY(18px) scale(0.985); }
          to   { opacity: 1; transform: translateY(0) scale(1); }
        }
        @keyframes rcBarGrow { from { transform: scaleY(0); } to { transform: scaleY(1); } }
        @keyframes rcBarPulse { 0%, 100% { transform: scaleY(1); } 50% { transform: scaleY(0.78); } }
        @keyframes rcShimmer { to { background-position: -200% 0; } }
        @keyframes rcGlow {
          0%, 100% { filter: drop-shadow(0 0 0 rgba(225, 11, 31, 0)); }
          50% { filter: drop-shadow(0 0 9px rgba(225, 11, 31, 0.95)); }
        }
        @keyframes rcZoom { from { transform: scale(1); } to { transform: scale(1.1); } }
        @keyframes rcFloat {
          0%, 100% { transform: translate(0, 0) scale(1); }
          50% { transform: translate(60px, -50px) scale(1.18); }
        }
      `}</style>

      {/* ================= LEFT IMAGE PANEL (desktop) ================= */}
      <aside className="relative hidden w-1/2 shrink-0 overflow-hidden bg-[#0b0b0b] lg:block">
        <img
          src={LOGIN_IMAGE}
          alt=""
          className="rc-zoom absolute inset-0 h-full w-full object-cover"
        />
        <div className="absolute inset-0 bg-[#000000B2]" />
        <div className="rc-glow pointer-events-none absolute -left-[120px] bottom-[60px] h-[460px] w-[460px] rounded-full bg-[#c1121f]/30 blur-[100px]" />

        <div className="relative flex h-full flex-col justify-between px-[56px] pb-[90px] pt-[90px] xl:px-[69px]">
          <div className="flex flex-col items-center">
            <Link to="/login" aria-label="DigiAmplify Portal home">
              <Logo size={64} />
            </Link>
            <p
              className="rc-rise mt-8 text-[24px] font-semibold leading-8 text-[#e10b1f]"
              style={{ "--d": "0.7s" }}
            >
              Employee Portal
            </p>
          </div>

          <div>
            <h2
              className="rc-rise text-[28px] font-semibold leading-[42px] text-white xl:text-[30px]"
              style={{ "--d": "1s" }}
            >
              Account Recovery.
            </h2>
            <h2
              className="rc-rise text-[28px] font-semibold leading-[42px] xl:text-[30px]"
              style={{ "--d": "1.15s" }}
            >
              <span className="rc-shimmer">Back in minutes.</span>
            </h2>
            <p
              className="rc-rise mt-4 max-w-[520px] text-[20px] font-light leading-[32px] text-gray-300"
              style={{ "--d": "1.35s" }}
            >
              Locked out? Get a secure link in your inbox and choose a new
              password. Your account and data stay exactly as they were.
            </p>
            <div
              className="rc-rise mt-10 flex items-center gap-[16px] text-[20px] font-medium text-white"
              style={{ "--d": "1.55s" }}
            >
              <ShieldCheck size={24} strokeWidth={1.5} className="rc-shield" />
              <span>Secure. Reliable. Always.</span>
            </div>
          </div>
        </div>
      </aside>

      {/* ================= RIGHT PANEL ================= */}
      <main className="min-h-full flex-1 lg:h-full lg:min-h-0 lg:overflow-y-auto">
        <div className="flex min-h-full flex-col items-center justify-center px-4 py-8 sm:px-8 lg:px-10 lg:py-10">
          {/* logo on mobile */}
          <div className="mb-8 flex shrink-0 flex-col items-center lg:hidden">
            <Link to="/login" aria-label="DigiAmplify Portal home">
              <Logo size={46} />
            </Link>
            <p className="mt-3 text-[18px] font-semibold text-[#e10b1f]">
              Employee Portal
            </p>
          </div>

          <div className="rc-card w-full max-w-[580px] rounded-[28px] border-2 border-[#3d3d3d] bg-[#0b0b0b] px-6 py-10 sm:px-12 sm:py-12">
            {Icon && (
              <div className="flex justify-center">
                <span className="flex h-[72px] w-[72px] items-center justify-center rounded-[10px] border border-red-700 bg-[#1a0808] text-[#e10b1f]">
                  <Icon size={40} strokeWidth={1.5} />
                </span>
              </div>
            )}

            <h1 className="mt-6 text-center text-[32px] font-bold leading-[40px] text-white sm:text-[34px]">
              {title}
            </h1>

            {subtitle && (
              <p className="mx-auto mt-3 max-w-[440px] text-center text-[17px] font-light leading-[26px] text-gray-400">
                {subtitle}
              </p>
            )}

            <div className="mt-9">{children}</div>
          </div>
        </div>
      </main>
    </div>
  );
}