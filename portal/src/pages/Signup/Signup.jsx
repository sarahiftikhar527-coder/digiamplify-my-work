import { useEffect, useRef, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  Mail,
  Lock,
  Eye,
  EyeOff,
  User,
  ShieldCheck,
  Check,
  Loader2,
  ChevronDown,
} from "lucide-react";

import { register as registerWithBackend } from "../../modules/auth/services/authService.js";

const SIGNUP_IMAGE = "/images/Login/login.webp";
const REMEMBER_KEY = "digiamplify_remembered_email";
const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const PIN_REGEX = /^\d{4,6}$/;
const MIN_PASSWORD = 8;

const ROLES = ["Employee", "Manager", "HR"];

const ROUTES = {
  login: "/login",
};

/* Same design settings as the Login page (fields slightly smaller) */
const CARD = {
  maxWidth: 1200,
  gapY: 50,
  gapX: 16,
  inputHeight: 66,
};

const FONT = {
  label: 25,
  input: 23,
  small: 20,
  // Role dropdown uses smaller text than the other fields.
  option: 19,
  optionItem: 18,
};

const LOGO_SCALE = 1;
const LEFT_PANEL_WIDTH = 50;

const DESKTOP_W = 2000;
const DESKTOP_H = 1125;
const MOBILE_W = 560;
const MOBILE_H = 1500;
const MOBILE_MIN_SCALE = 0.5;

const calcStage = () => {
  const vw = window.innerWidth;
  const vh = window.innerHeight;
  const desktop = vw >= 1024;

  if (desktop) {
    return {
      desktop,
      scale: Math.min(vw / DESKTOP_W, vh / DESKTOP_H),
      width: DESKTOP_W,
      height: DESKTOP_H,
    };
  }

  const scale = Math.max(
    Math.min(vw / MOBILE_W, vh / MOBILE_H),
    MOBILE_MIN_SCALE
  );

  return {
    desktop,
    scale,
    width: Math.max(vw / scale, MOBILE_W),
    height: Math.max(vh / scale, MOBILE_H),
  };
};

const useStage = () => {
  const [stage, setStage] = useState(calcStage);

  useEffect(() => {
    const onResize = () => {
      if (
        window.innerWidth < 1024 &&
        ["INPUT", "SELECT"].includes(document.activeElement?.tagName)
      ) {
        return;
      }

      setStage(calcStage());
    };

    window.addEventListener("resize", onResize);

    return () => window.removeEventListener("resize", onResize);
  }, []);

  return stage;
};

const Logo = ({ k = 1 }) => (
  <div
    className="lg-rise text-center font-bold leading-none tracking-tight text-white"
    style={{ fontSize: 66 * k, "--d": "0.1s" }}
  >
    DigiA
    <span
      className="inline-flex items-end align-baseline"
      style={{ margin: `0 ${2 * k}px`, gap: 7 * k }}
      aria-hidden="true"
    >
      <span
        className="lg-bar block bg-[#c1121f]"
        style={{ width: 15 * k, height: 27 * k, "--d": "0.6s" }}
      />
      <span
        className="lg-bar block bg-[#c1121f]"
        style={{ width: 15 * k, height: 43 * k, "--d": "0.72s" }}
      />
      <span
        className="lg-bar block bg-[#c1121f]"
        style={{ width: 15 * k, height: 59 * k, "--d": "0.84s" }}
      />
    </span>
    plify<span className="text-[#c1121f]">.</span>
  </div>
);

const inputCls =
  "login-input h-full w-full min-w-0 bg-transparent font-light text-white outline-none placeholder:text-gray-500";

const InputBox = ({ icon: Icon, hasError, children }) => (
  <div
    className={`flex items-center gap-[14px] rounded-[5px] border bg-[#0d0d0d] px-[22px] transition focus-within:border-red-700 ${
      hasError ? "border-red-600" : "border-[#333]"
    }`}
    style={{ height: CARD.inputHeight }}
  >
    <Icon size={24} strokeWidth={1.5} className="shrink-0 text-gray-400" />
    {children}
  </div>
);

const Field = ({ id, label, error, first, children }) => (
  <div className={first ? "" : "mt-[22px]"}>
    <label
      htmlFor={id}
      className="mb-3 block leading-none text-white"
      style={{ fontSize: FONT.label }}
    >
      {label}
    </label>

    {children}

    {error && <p className="mt-1.5 text-[15px] text-red-500">{error}</p>}
  </div>
);

const SecretInput = ({
  id,
  value,
  onChange,
  placeholder,
  hasError,
  autoComplete = "new-password",
  inputMode,
  maxLength,
}) => {
  const [show, setShow] = useState(false);

  return (
    <InputBox icon={Lock} hasError={hasError}>
      <input
        id={id}
        name={id}
        type={show ? "text" : "password"}
        autoComplete={autoComplete}
        inputMode={inputMode}
        maxLength={maxLength}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        className={inputCls}
        style={{ fontSize: FONT.input }}
      />

      <button
        type="button"
        onClick={() => setShow((v) => !v)}
        className="shrink-0 text-gray-300 transition hover:text-white"
        aria-label={show ? "Hide" : "Show"}
      >
        {show ? (
          <Eye size={24} strokeWidth={1.5} />
        ) : (
          <EyeOff size={24} strokeWidth={1.5} />
        )}
      </button>
    </InputBox>
  );
};

// Custom dropdown for the role: compact text, full-width list, keyboard support.
const RoleSelect = ({ id, value, onChange, hasError }) => {
  const [open, setOpen] = useState(false);
  const wrapRef = useRef(null);

  // Close the list when clicking outside or pressing Escape.
  useEffect(() => {
    if (!open) return undefined;

    const onDown = (event) => {
      if (wrapRef.current && !wrapRef.current.contains(event.target)) {
        setOpen(false);
      }
    };

    const onKey = (event) => {
      if (event.key === "Escape") setOpen(false);
    };

    document.addEventListener("mousedown", onDown);
    document.addEventListener("keydown", onKey);

    return () => {
      document.removeEventListener("mousedown", onDown);
      document.removeEventListener("keydown", onKey);
    };
  }, [open]);

  // ArrowUp / ArrowDown change the selected role.
  const handleKeyDown = (event) => {
    if (event.key !== "ArrowDown" && event.key !== "ArrowUp") return;

    event.preventDefault();

    const index = ROLES.indexOf(value);
    const next =
      event.key === "ArrowDown"
        ? Math.min(index + 1, ROLES.length - 1)
        : Math.max(index - 1, 0);

    onChange(ROLES[next]);
  };

  return (
    <div ref={wrapRef} className="relative">
      <button
        type="button"
        id={id}
        aria-haspopup="listbox"
        aria-expanded={open}
        onClick={() => setOpen((v) => !v)}
        onKeyDown={handleKeyDown}
        className={`flex w-full items-center gap-[14px] rounded-[5px] border bg-[#0d0d0d] px-[22px] text-left outline-none transition focus-visible:border-red-700 ${
          open
            ? "border-red-700"
            : hasError
              ? "border-red-600"
              : "border-[#333]"
        }`}
        style={{ height: CARD.inputHeight }}
      >
        <User size={24} strokeWidth={1.5} className="shrink-0 text-gray-400" />

        <span
          className="min-w-0 flex-1 truncate font-light text-gray-300"
          style={{ fontSize: FONT.option }}
        >
          {value}
        </span>

        <ChevronDown
          size={22}
          strokeWidth={1.5}
          className={`shrink-0 text-gray-400 transition-transform duration-200 ${
            open ? "rotate-180" : ""
          }`}
        />
      </button>

      {open && (
        <ul
          role="listbox"
          aria-labelledby={id}
          className="absolute left-0 right-0 top-full z-30 mt-2 overflow-hidden rounded-[8px] border border-[#3d3d3d] bg-[#121212] p-1.5 shadow-[0_12px_30px_rgba(0,0,0,0.6)]"
        >
          {ROLES.map((role) => {
            const selected = role === value;

            return (
              <li key={role} role="option" aria-selected={selected}>
                <button
                  type="button"
                  onClick={() => {
                    onChange(role);
                    setOpen(false);
                  }}
                  className={`flex w-full items-center justify-between rounded-[6px] px-4 py-2.5 text-left transition ${
                    selected
                      ? "bg-[#c1121f]/20 text-white"
                      : "text-gray-300 hover:bg-white/5 hover:text-white"
                  }`}
                  style={{ fontSize: FONT.optionItem }}
                >
                  <span>{role}</span>
                  {selected && (
                    <Check size={16} strokeWidth={2.5} className="text-[#e10b1f]" />
                  )}
                </button>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
};

const Agree = ({ checked, onChange, error, children }) => (
  <div>
    <label
      className="flex cursor-pointer select-none items-center gap-[14px] text-white"
      style={{ fontSize: FONT.small }}
    >
      <input
        type="checkbox"
        checked={checked}
        onChange={onChange}
        className="peer sr-only"
      />

      <span
        className={`flex h-[22px] w-[22px] shrink-0 items-center justify-center rounded-[4px] border transition peer-focus-visible:ring-2 peer-focus-visible:ring-red-600 ${
          checked
            ? "border-[#c1121f] bg-[#c1121f]"
            : error
              ? "border-red-600"
              : "border-gray-500 bg-transparent"
        }`}
      >
        {checked && <Check size={15} strokeWidth={3} className="text-white" />}
      </span>

      <span>
        {children} <span className="text-[#e10b1f]">*</span>
      </span>
    </label>

    {error && <p className="mt-1 pl-[36px] text-[15px] text-red-500">{error}</p>}
  </div>
);

const Signup = () => {
  const navigate = useNavigate();
  const { desktop, scale, width, height } = useStage();

  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
    confirm: "",
    role: ROLES[0],
    pin: "",
    eula: false,
    privacy: false,
  });

  const [errors, setErrors] = useState({});
  const [status, setStatus] = useState("idle");
  const [serverError, setServerError] = useState("");
  const [submittedEmail, setSubmittedEmail] = useState("");

  const setField = (key, value) => {
    setForm((current) => ({ ...current, [key]: value }));
    setErrors((current) => ({ ...current, [key]: undefined }));
    if (serverError) setServerError("");
  };

  const validate = () => {
    const next = {};

    if (!form.name.trim()) {
      next.name = "Full name is required";
    } else if (form.name.trim().length < 2) {
      next.name = "Name must be at least 2 characters";
    }

    if (!form.email.trim()) {
      next.email = "Email is required";
    } else if (!emailRegex.test(form.email.trim())) {
      next.email = "Enter a valid email address";
    }

    if (!form.password) {
      next.password = "Password is required";
    } else if (form.password.length < MIN_PASSWORD) {
      next.password = `At least ${MIN_PASSWORD} characters`;
    }

    if (!form.confirm) {
      next.confirm = "Please confirm your password";
    } else if (form.confirm !== form.password) {
      next.confirm = "Passwords do not match";
    }

    if (!ROLES.includes(form.role)) {
      next.role = "Please select a role";
    }

    if (!form.pin) {
      next.pin = "PIN is required";
    } else if (!PIN_REGEX.test(form.pin)) {
      next.pin = "PIN must be 4 to 6 digits";
    }

    if (!form.eula) {
      next.eula = "You must accept the End User License Agreement";
    }

    if (!form.privacy) {
      next.privacy = "You must accept the Privacy Policy";
    }

    setErrors(next);
    return Object.keys(next).length === 0;
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    if (status === "loading" || !validate()) return;

    setStatus("loading");
    setServerError("");

    try {
      const cleanEmail = form.email.trim().toLowerCase();

      await registerWithBackend({
        name: form.name,
        email: cleanEmail,
        password: form.password,
        role: form.role,
        pin: form.pin,
      });

      try {
        localStorage.setItem(REMEMBER_KEY, cleanEmail);
      } catch {
        // Remembered email is optional.
      }

      setSubmittedEmail(cleanEmail);
      setStatus("success");
    } catch (error) {
      setServerError(
        error?.message || "Unable to submit your request. Please try again."
      );
      setStatus("error");
    }
  };

  const busy = status === "loading";
  const done = status === "success";

  const twoCols = desktop ? "grid grid-cols-2 gap-x-[24px]" : "";

  return (
    <div
      className={`fixed inset-0 font-['Poppins',sans-serif] ${
        desktop
          ? "flex items-center justify-center overflow-hidden bg-black"
          : "overflow-y-auto overflow-x-hidden bg-[#383838]"
      }`}
    >
      <style>{`
        .login-input:-webkit-autofill,
        .login-input:-webkit-autofill:hover,
        .login-input:-webkit-autofill:focus,
        .login-input:-webkit-autofill:active {
          -webkit-text-fill-color: #ffffff;
          -webkit-box-shadow: 0 0 0 1000px #0d0d0d inset;
          caret-color: #ffffff;
          transition: background-color 9999s ease-in-out 0s;
        }

        .login-input::selection {
          background: rgba(193, 18, 31, 0.5);
        }

        .lg-shimmer {
          display: inline-block;
          color: transparent;
          background: linear-gradient(
            90deg,
            #e10b1f 0%,
            #ff7a85 25%,
            #e10b1f 50%,
            #e10b1f 100%
          );
          background-size: 200% 100%;
          -webkit-background-clip: text;
          background-clip: text;
          -webkit-text-fill-color: transparent;
        }

        @media (prefers-reduced-motion: no-preference) {
          .lg-rise {
            opacity: 0;
            animation: lgRise 0.95s cubic-bezier(0.2, 0.8, 0.2, 1)
              var(--d, 0s) forwards;
          }

          .lg-bar {
            transform-origin: 50% 100%;
            animation:
              lgBarGrow 0.8s cubic-bezier(0.2, 0.8, 0.2, 1)
                var(--d, 0s) both,
              lgBarPulse 2.8s ease-in-out
                calc(var(--d, 0s) + 1.4s) infinite;
          }

          .lg-shimmer { animation: lgShimmer 4s linear infinite; }
          .lg-shield { animation: lgGlow 2.6s ease-in-out infinite; }
          .lg-zoom { animation: lgZoom 22s ease-in-out infinite alternate; }
          .lg-glow { animation: lgFloat 9s ease-in-out infinite; }
        }

        @keyframes lgRise {
          from {
            opacity: 0;
            transform: translateY(34px);
            filter: blur(10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
            filter: blur(0);
          }
        }

        @keyframes lgBarGrow {
          from { transform: scaleY(0); }
          to { transform: scaleY(1); }
        }

        @keyframes lgBarPulse {
          0%, 100% { transform: scaleY(1); }
          50% { transform: scaleY(0.78); }
        }

        @keyframes lgShimmer {
          to { background-position: -200% 0; }
        }

        @keyframes lgGlow {
          0%, 100% {
            filter: drop-shadow(0 0 0 rgba(225, 11, 31, 0));
          }
          50% {
            filter: drop-shadow(0 0 9px rgba(225, 11, 31, 0.95));
          }
        }

        @keyframes lgZoom {
          from { transform: scale(1); }
          to { transform: scale(1.1); }
        }

        @keyframes lgFloat {
          0%, 100% { transform: translate(0, 0) scale(1); }
          50% { transform: translate(60px, -50px) scale(1.18); }
        }
      `}</style>

      <div
        style={{
          width: width * scale,
          height: height * scale,
        }}
      >
        <div
          className="flex"
          style={{
            width,
            height,
            transform: `scale(${scale})`,
            transformOrigin: "top left",
          }}
        >
          {/* LEFT IMAGE PANEL */}
          {desktop && (
            <div
              className="relative h-full shrink-0 overflow-hidden bg-[#0b0b0b]"
              style={{ width: `${LEFT_PANEL_WIDTH}%` }}
            >
              <img
                src={SIGNUP_IMAGE}
                alt=""
                className="lg-zoom absolute inset-0 h-full w-full object-cover"
              />

              <div className="absolute inset-0 bg-[#000000B2]" />

              <div className="lg-glow pointer-events-none absolute -left-[120px] bottom-[60px] h-[460px] w-[460px] rounded-full bg-[#c1121f]/30 blur-[100px]" />

              <div className="relative flex h-full flex-col justify-between px-[69px] pb-[170px] pt-[130px]">
                <div className="flex flex-col items-center">
                  <Link to={ROUTES.login} aria-label="DigiAmplify Portal">
                    <Logo k={LOGO_SCALE} />
                  </Link>

                  <p
                    className="lg-rise mt-[44px] text-[26px] font-semibold leading-8 text-[#e10b1f]"
                    style={{ "--d": "0.7s" }}
                  >
                    Employee Portal
                  </p>
                </div>

                <div>
                  <h2
                    className="lg-rise text-[30px] font-semibold leading-[45px] text-white"
                    style={{ "--d": "1s" }}
                  >
                    One Platform.
                  </h2>

                  <h2
                    className="lg-rise text-[30px] font-semibold leading-[45px]"
                    style={{ "--d": "1.15s" }}
                  >
                    <span className="lg-shimmer">Everything You Need.</span>
                  </h2>

                  <p
                    className="lg-rise mt-[17px] max-w-[520px] text-[23px] font-light leading-[35px] text-gray-300"
                    style={{ "--d": "1.35s" }}
                  >
                    Access your dashboard, manage your tasks, track performance
                    and stay connected.
                  </p>

                  <div
                    className="lg-rise mt-[47px] flex items-center gap-[18px] text-[22px] font-medium text-white"
                    style={{ "--d": "1.55s" }}
                  >
                    <ShieldCheck
                      size={24}
                      strokeWidth={1.5}
                      className="lg-shield"
                    />
                    <span>Secure. Reliable. Always.</span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* RIGHT SIGNUP PANEL */}
          <div
            className="flex h-full min-w-0 flex-1 flex-col items-center justify-center bg-[#383838]"
            style={{
              padding: desktop
                ? `${CARD.gapY}px ${CARD.gapX}px`
                : "14px 16px",
            }}
          >
            {!desktop && (
              <div className="mb-[28px] flex shrink-0 flex-col items-center">
                <Logo k={0.7} />

                <p
                  className="lg-rise mt-[14px] text-[20px] font-semibold text-[#e10b1f]"
                  style={{ "--d": "0.7s" }}
                >
                  Employee Portal
                </p>
              </div>
            )}

            <div
              className={`w-full ${desktop ? "h-full" : "min-h-0 flex-1"}`}
              style={{ maxWidth: CARD.maxWidth }}
            >
              <div
                className="flex h-full w-full flex-col justify-center rounded-[28px] border-2 border-[#3d3d3d] bg-[#0b0b0b]"
                style={{
                  paddingLeft: desktop ? 110 : 44,
                  paddingRight: desktop ? 110 : 44,
                  paddingTop: 0,
                  paddingBottom: desktop ? 0 : 20,
                }}
              >
                {done ? (
                  <div className="flex flex-col items-center text-center">
                    <span className="flex h-[96px] w-[96px] items-center justify-center rounded-full border border-red-700 bg-[#1a0808] text-[#e10b1f]">
                      <Check size={54} strokeWidth={2} />
                    </span>

                    <h1 className="mt-[30px] text-[36px] font-bold leading-[44px] text-white">
                      Request Submitted!
                    </h1>

                    <p className="mt-[16px] max-w-[640px] text-[23px] font-light leading-[34px] text-gray-300">
                      Your signup request has been sent to the admin. You will
                      be able to log in once your account is approved.
                    </p>

                    {submittedEmail && (
                      <p className="mt-[14px] text-[20px] text-gray-400">
                        Account email:{" "}
                        <span className="text-white">{submittedEmail}</span>
                      </p>
                    )}

                    <button
                      type="button"
                      onClick={() => navigate(ROUTES.login, { replace: true })}
                      className="mt-[48px] flex h-[62px] w-full max-w-[520px] items-center justify-center rounded-[5px] bg-gradient-to-r from-[#c1121f] via-[#a30f1a] to-[#5c0a10] text-[26px] font-semibold text-white transition hover:brightness-110"
                    >
                      Back to Login
                    </button>
                  </div>
                ) : (
                  <>
                    <div className="flex justify-center">
                      <span className="flex h-[64px] w-[64px] items-center justify-center rounded-[8px] border border-red-700 bg-[#1a0808] text-[#e10b1f]">
                        <User size={38} strokeWidth={1.5} />
                      </span>
                    </div>

                    <h1 className="mt-[18px] text-center text-[36px] font-bold leading-[44px] text-white">
                      Create Account
                    </h1>

                    <p className="mt-[4px] text-center text-[23px] font-light leading-[30px] text-gray-400">
                      Sign up to request access to your account
                    </p>

                    <form
                      onSubmit={handleSubmit}
                      noValidate
                      className={desktop ? "mt-[34px]" : "mt-[30px]"}
                    >
                      <Field
                        id="name"
                        label="Full Name"
                        error={errors.name}
                        first
                      >
                        <InputBox icon={User} hasError={!!errors.name}>
                          <input
                            id="name"
                            name="name"
                            type="text"
                            autoComplete="name"
                            maxLength={100}
                            value={form.name}
                            onChange={(e) => setField("name", e.target.value)}
                            placeholder="Enter your full name"
                            className={inputCls}
                            style={{ fontSize: FONT.input }}
                          />
                        </InputBox>
                      </Field>

                      <Field
                        id="email"
                        label="Email Address"
                        error={errors.email}
                      >
                        <InputBox icon={Mail} hasError={!!errors.email}>
                          <input
                            id="email"
                            name="email"
                            type="email"
                            autoComplete="email"
                            maxLength={191}
                            value={form.email}
                            onChange={(e) => setField("email", e.target.value)}
                            placeholder="Enter email here"
                            className={inputCls}
                            style={{ fontSize: FONT.input }}
                          />
                        </InputBox>
                      </Field>

                      <div className={twoCols}>
                        <Field
                          id="password"
                          label="Create Password"
                          error={errors.password}
                        >
                          <SecretInput
                            id="password"
                            value={form.password}
                            onChange={(e) =>
                              setField("password", e.target.value)
                            }
                            placeholder="Password"
                            hasError={!!errors.password}
                          />
                        </Field>

                        <Field
                          id="confirm"
                          label="Confirm Password"
                          error={errors.confirm}
                        >
                          <SecretInput
                            id="confirm"
                            value={form.confirm}
                            onChange={(e) =>
                              setField("confirm", e.target.value)
                            }
                            placeholder="Confirm password"
                            hasError={!!errors.confirm}
                          />
                        </Field>
                      </div>

                      <div className={twoCols}>
                        <Field id="role" label="Role" error={errors.role}>
                          <RoleSelect
                            id="role"
                            value={form.role}
                            onChange={(role) => setField("role", role)}
                            hasError={!!errors.role}
                          />
                        </Field>

                        <Field
                          id="pin"
                          label="Create PIN (4-6 digits)"
                          error={errors.pin}
                        >
                          <SecretInput
                            id="pin"
                            value={form.pin}
                            onChange={(e) =>
                              setField(
                                "pin",
                                e.target.value.replace(/\D/g, "").slice(0, 6)
                              )
                            }
                            placeholder="••••"
                            hasError={!!errors.pin}
                            autoComplete="off"
                            inputMode="numeric"
                            maxLength={6}
                          />
                        </Field>
                      </div>

                      <p className="mt-2.5 text-[16px] font-light text-gray-400">
                        The PIN is used to clock in/out on the time clock.
                      </p>

                      <div className="mt-[24px] space-y-[14px]">
                        <Agree
                          checked={form.eula}
                          onChange={(e) => setField("eula", e.target.checked)}
                          error={errors.eula}
                        >
                          I agree to the End User License Agreement
                        </Agree>

                        <Agree
                          checked={form.privacy}
                          onChange={(e) =>
                            setField("privacy", e.target.checked)
                          }
                          error={errors.privacy}
                        >
                          I agree to the Privacy Policy
                        </Agree>
                      </div>

                      {serverError && (
                        <p
                          role="alert"
                          className="mt-4 rounded border border-red-900/70 bg-red-950/40 px-4 py-2.5 text-[16px] text-red-400"
                        >
                          {serverError}
                        </p>
                      )}

                      <button
                        type="submit"
                        disabled={busy}
                        className="mt-[28px] flex h-[60px] w-full items-center justify-center gap-2.5 rounded-[5px] bg-gradient-to-r from-[#c1121f] via-[#a30f1a] to-[#5c0a10] text-[26px] font-semibold text-white transition hover:brightness-110 disabled:cursor-not-allowed disabled:opacity-70"
                      >
                        {busy && <Loader2 size={22} className="animate-spin" />}
                        {busy ? "Submitting request..." : "Sign up"}
                      </button>

                      <p className="mt-[20px] text-center text-[23px] leading-[30px] text-white">
                        Already have account?{" "}
                        <Link
                          to={ROUTES.login}
                          className="font-medium text-[#e10b1f] transition hover:text-red-500"
                        >
                          Login
                        </Link>
                      </p>
                    </form>
                  </>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Signup;