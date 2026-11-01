import { useEffect, useState } from "react";
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
} from "lucide-react";

import { useAuth } from "../../context/AuthContext/AuthContext/AuthContext.jsx";
import { login as loginWithBackend } from "../../modules/auth/services/authService.js";

const LOGIN_IMAGE = "/images/Login/login.webp";
const REMEMBER_KEY = "digiamplify_remembered_email";
const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const ROUTES = {
  signup: "/signup",
  forgotPassword: "/forgot-password",
};

const getDashboardPath = (role) => {
  const normalizedRole = String(role || "").trim().toLowerCase();

  if (normalizedRole === "admin") return "/admin/dashboard";
  if (normalizedRole === "employee") return "/dashboard";

  return "/login";
};

/* Original login design settings */
const CARD = {
  maxWidth: 1200,
  gapY: 50,
  gapX: 16,
  inputHeight: 78,
};

const FONT = {
  label: 27,
  input: 25,
  small: 20,
};

const LOGO_SCALE = 1;
const LEFT_PANEL_WIDTH = 50;

const DESKTOP_W = 2000;
const DESKTOP_H = 1125;
const MOBILE_W = 560;
const MOBILE_H = 1000;
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
        document.activeElement?.tagName === "INPUT"
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

const Login = () => {
  const navigate = useNavigate();
  const { login } = useAuth();
  const { desktop, scale, width, height } = useStage();

  const [form, setForm] = useState({
    email: "",
    password: "",
  });

  const [remember, setRemember] = useState(true);
  const [showPassword, setShowPassword] = useState(false);
  const [errors, setErrors] = useState({});
  const [status, setStatus] = useState("idle");
  const [serverError, setServerError] = useState("");

  useEffect(() => {
    try {
      const savedEmail = localStorage.getItem(REMEMBER_KEY);

      if (savedEmail) {
        setForm((current) => ({
          ...current,
          email: savedEmail,
        }));
      }
    } catch {
      // Remembered email is optional.
    }
  }, []);

  const setField = (key) => (event) => {
    setForm((current) => ({
      ...current,
      [key]: event.target.value,
    }));

    setErrors((current) => ({
      ...current,
      [key]: undefined,
    }));

    setServerError("");
  };

  const validate = () => {
    const nextErrors = {};
    const cleanEmail = form.email.trim();

    if (!cleanEmail) {
      nextErrors.email = "Email is required";
    } else if (!emailRegex.test(cleanEmail)) {
      nextErrors.email = "Enter a valid email address";
    }

    if (!form.password) {
      nextErrors.password = "Password is required";
    } else if (form.password.length < 6) {
      nextErrors.password = "Password must be at least 6 characters";
    }

    setErrors(nextErrors);

    return Object.keys(nextErrors).length === 0;
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    if (status === "loading" || !validate()) return;

    setStatus("loading");
    setServerError("");

    try {
      const cleanEmail = form.email.trim().toLowerCase();

      // Authenticate with the real backend.
      const { user: userData, token } = await loginWithBackend({
        email: cleanEmail,
        password: form.password,
      });

      const destination = getDashboardPath(userData?.role);

      if (destination === "/login") {
        throw new Error(
          "Your account role is invalid. Please contact your administrator."
        );
      }

      // Store the real access token and authenticated user.
      login({
        ...userData,
        token,
      });

      if (remember) {
        localStorage.setItem(REMEMBER_KEY, cleanEmail);
      } else {
        localStorage.removeItem(REMEMBER_KEY);
      }

      navigate(destination, { replace: true });
    } catch (error) {
      console.error("Login error:", error);

      setServerError(
        error?.message || "Unable to log in. Please try again."
      );
    } finally {
      setStatus("idle");
    }
  };

  const inputWrap = (hasError) =>
    `flex items-center gap-[16px] rounded-[5px] border bg-[#0d0d0d] px-[28px] transition focus-within:border-red-700 ${
      hasError ? "border-red-600" : "border-[#333]"
    }`;

  const inputCls =
    "login-input h-full w-full bg-transparent font-light text-white outline-none placeholder:text-gray-500";

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
                src={LOGIN_IMAGE}
                alt=""
                className="lg-zoom absolute inset-0 h-full w-full object-cover"
              />

              <div className="absolute inset-0 bg-[#000000B2]" />

              <div className="lg-glow pointer-events-none absolute -left-[120px] bottom-[60px] h-[460px] w-[460px] rounded-full bg-[#c1121f]/30 blur-[100px]" />

              <div className="relative flex h-full flex-col justify-between px-[69px] pb-[170px] pt-[130px]">
                <div className="flex flex-col items-center">
                  <Link to="/login" aria-label="DigiAmplify Portal home">
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
                    <span className="lg-shimmer">
                      Everything You Need.
                    </span>
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

          {/* RIGHT LOGIN PANEL */}
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
                <div className="flex justify-center">
                  <span className="flex h-[72px] w-[72px] items-center justify-center rounded-[8px] border border-red-700 bg-[#1a0808] text-[#e10b1f]">
                    <User size={42} strokeWidth={1.5} />
                  </span>
                </div>

                <h1 className="mt-[22px] text-center text-[36px] font-bold leading-[44px] text-white">
                  Welcome Back!
                </h1>

                <p className="mt-[6px] text-center text-[23px] font-light leading-[30px] text-gray-400">
                  Login to continue to your account
                </p>

                <form
                  onSubmit={handleSubmit}
                  noValidate
                  className={desktop ? "mt-[70px]" : "mt-[50px]"}
                >
                  <label
                    htmlFor="email"
                    className="mb-3.5 block leading-none text-white"
                    style={{ fontSize: FONT.label }}
                  >
                    Email Address
                  </label>

                  <div
                    className={inputWrap(!!errors.email)}
                    style={{ height: CARD.inputHeight }}
                  >
                    <Mail
                      size={26}
                      strokeWidth={1.5}
                      className="shrink-0 text-gray-400"
                    />

                    <input
                      id="email"
                      name="email"
                      type="email"
                      autoComplete="email"
                      value={form.email}
                      onChange={setField("email")}
                      placeholder="Enter email here"
                      className={inputCls}
                      style={{ fontSize: FONT.input }}
                    />
                  </div>

                  {errors.email && (
                    <p className="mt-1.5 text-[16px] text-red-500">
                      {errors.email}
                    </p>
                  )}

                  <label
                    htmlFor="password"
                    className={`mb-3.5 block leading-none text-white ${
                      desktop ? "mt-[44px]" : "mt-[34px]"
                    }`}
                    style={{ fontSize: FONT.label }}
                  >
                    Password
                  </label>

                  <div
                    className={inputWrap(!!errors.password)}
                    style={{ height: CARD.inputHeight }}
                  >
                    <Lock
                      size={26}
                      strokeWidth={1.5}
                      className="shrink-0 text-gray-400"
                    />

                    <input
                      id="password"
                      name="password"
                      type={showPassword ? "text" : "password"}
                      autoComplete="current-password"
                      value={form.password}
                      onChange={setField("password")}
                      placeholder="Enter password here"
                      className={inputCls}
                      style={{ fontSize: FONT.input }}
                    />

                    <button
                      type="button"
                      onClick={() => setShowPassword((value) => !value)}
                      className="shrink-0 text-gray-300 transition hover:text-white"
                      aria-label={
                        showPassword ? "Hide password" : "Show password"
                      }
                    >
                      {showPassword ? (
                        <Eye size={26} strokeWidth={1.5} />
                      ) : (
                        <EyeOff size={26} strokeWidth={1.5} />
                      )}
                    </button>
                  </div>

                  {errors.password && (
                    <p className="mt-1.5 text-[16px] text-red-500">
                      {errors.password}
                    </p>
                  )}

                  <div className="mt-3.5 flex items-center justify-between gap-3">
                    <label
                      className="flex cursor-pointer select-none items-center gap-[14px] text-white"
                      style={{ fontSize: FONT.small }}
                    >
                      <input
                        type="checkbox"
                        checked={remember}
                        onChange={(event) =>
                          setRemember(event.target.checked)
                        }
                        className="sr-only"
                      />

                      <span
                        className={`flex h-[22px] w-[22px] items-center justify-center rounded-[4px] border transition ${
                          remember
                            ? "border-[#c1121f] bg-[#c1121f]"
                            : "border-gray-500 bg-transparent"
                        }`}
                      >
                        {remember && (
                          <Check
                            size={15}
                            strokeWidth={3}
                            className="text-white"
                          />
                        )}
                      </span>

                      Remember Me
                    </label>

                    <Link
                      to={ROUTES.forgotPassword}
                      className="text-[#e10b1f] transition hover:text-red-500"
                      style={{ fontSize: FONT.small }}
                    >
                      Forget Password?
                    </Link>
                  </div>

                  {serverError && (
                    <p
                      role="alert"
                      className="mt-5 rounded border border-red-900/70 bg-red-950/40 px-4 py-2.5 text-[16px] text-red-400"
                    >
                      {serverError}
                    </p>
                  )}

                  <button
                    type="submit"
                    disabled={status === "loading"}
                    className={`flex h-[62px] w-full items-center justify-center gap-2.5 rounded-[5px] bg-gradient-to-r from-[#c1121f] via-[#a30f1a] to-[#5c0a10] text-[26px] font-semibold text-white transition hover:brightness-110 disabled:cursor-not-allowed disabled:opacity-70 ${
                      desktop ? "mt-[60px]" : "mt-[46px]"
                    }`}
                  >
                    {status === "loading" && (
                      <Loader2 size={22} className="animate-spin" />
                    )}

                    {status === "loading" ? "Logging in..." : "Login"}
                  </button>

                  <p className="mt-[24px] text-center text-[23px] leading-[30px] text-white">
                    Don&apos;t have account?{" "}
                    <Link
                      to={ROUTES.signup}
                      className="font-medium text-[#e10b1f] transition hover:text-red-500"
                    >
                      Sign up
                    </Link>
                  </p>
                </form>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;