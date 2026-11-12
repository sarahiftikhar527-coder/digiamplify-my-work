import { useEffect, useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { ArrowLeft, KeyRound, Loader2, Mail, MailCheck } from "lucide-react";

import { forgotPassword } from "../../modules/auth/services/authService.js";
import RecoveryShell, {
  ErrorBox,
  FieldError,
  REMEMBER_KEY,
  getErrorMessage,
  inputClass,
  inputWrapClass,
  labelClass,
  linkClass,
  primaryButtonClass,
  secondaryButtonClass,
} from "./RecoveryShell.jsx";

const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const RESEND_SECONDS = 60;

const STEPS = [
  "Open the email we just sent you",
  "Click the \"Choose a new password\" button",
  "Set your new password and log in",
];

export default function ForgotPasswordPage() {
  const location = useLocation();

  const [email, setEmail] = useState("");
  const [error, setError] = useState("");
  const [serverError, setServerError] = useState("");
  const [status, setStatus] = useState("idle"); // idle | loading | sent
  const [cooldown, setCooldown] = useState(0);

  // Pre-fill with the email typed on the login page (or the remembered one).
  useEffect(() => {
    let initial = location.state?.email || "";

    if (!initial) {
      try {
        initial = localStorage.getItem(REMEMBER_KEY) || "";
      } catch {
        initial = "";
      }
    }

    if (initial) setEmail(initial);
  }, [location.state]);

  useEffect(() => {
    if (cooldown <= 0) return undefined;

    const timer = setTimeout(() => setCooldown((value) => value - 1), 1000);
    return () => clearTimeout(timer);
  }, [cooldown]);

  const send = async () => {
    const clean = email.trim();

    if (!clean) return setError("Email is required");
    if (!emailRegex.test(clean)) return setError("Enter a valid email address");

    setError("");
    setServerError("");
    setStatus("loading");

    try {
      await forgotPassword({ email: clean });
      setStatus("sent");
      setCooldown(RESEND_SECONDS);
    } catch (err) {
      setServerError(getErrorMessage(err));
      setStatus(status === "sent" ? "sent" : "idle");
    }
  };

  const handleSubmit = (event) => {
    event.preventDefault();
    if (status !== "loading") send();
  };

  /* ---------------- Success screen ---------------- */
  if (status === "sent" || (status === "loading" && cooldown > 0)) {
    return (
      <RecoveryShell
        icon={MailCheck}
        title="Check your email"
        subtitle="If an account exists for this email, we sent a link to reset your password."
      >
        <div className="rounded-[8px] border border-[#333] bg-[#0d0d0d] px-5 py-4 text-center">
          <p className="text-[13px] uppercase tracking-wide text-gray-500">Sent to</p>
          <p className="mt-1 break-all text-[18px] font-medium text-white">
            {email.trim()}
          </p>
        </div>

        <ol className="mt-7 space-y-4">
          {STEPS.map((text, index) => (
            <li key={text} className="flex items-center gap-4">
              <span className="flex h-[34px] w-[34px] shrink-0 items-center justify-center rounded-full border border-red-700 bg-[#1a0808] text-[15px] font-semibold text-[#e10b1f]">
                {index + 1}
              </span>
              <span className="text-[16px] text-gray-300">{text}</span>
            </li>
          ))}
        </ol>

        <p className="mt-7 text-center text-[14px] leading-6 text-gray-500">
          The link works once and expires in 30 minutes. Nothing in your inbox?
          Check the spam folder.
        </p>

        <ErrorBox>{serverError}</ErrorBox>

        <button
          type="button"
          onClick={send}
          disabled={cooldown > 0 || status === "loading"}
          className={`${secondaryButtonClass} mt-6`}
        >
          {status === "loading" && <Loader2 size={18} className="animate-spin" />}
          {cooldown > 0 ? `Resend email in ${cooldown}s` : "Resend email"}
        </button>

        <div className="mt-6 flex flex-col items-center gap-4">
          <button
            type="button"
            onClick={() => {
              setStatus("idle");
              setCooldown(0);
              setServerError("");
            }}
            className="text-[15px] text-gray-400 transition hover:text-white"
          >
            Use a different email
          </button>

          <Link to="/login" className={linkClass}>
            <ArrowLeft size={18} /> Back to login
          </Link>
        </div>
      </RecoveryShell>
    );
  }

  /* ---------------- Email form ---------------- */
  return (
    <RecoveryShell
      icon={KeyRound}
      title="Forgot Password?"
      subtitle="No worries. Enter the email you use to log in and we will send you a link to choose a new password."
    >
      <form onSubmit={handleSubmit} noValidate>
        <label htmlFor="email" className={labelClass}>
          Email Address
        </label>

        <div className={inputWrapClass(!!error)}>
          <Mail size={24} strokeWidth={1.5} className="shrink-0 text-gray-400" />
          <input
            id="email"
            name="email"
            type="email"
            autoComplete="email"
            autoFocus
            value={email}
            onChange={(event) => {
              setEmail(event.target.value);
              setError("");
              setServerError("");
            }}
            placeholder="Enter email here"
            className={inputClass}
          />
        </div>

        <FieldError>{error}</FieldError>
        <ErrorBox>{serverError}</ErrorBox>

        <button
          type="submit"
          disabled={status === "loading"}
          className={`${primaryButtonClass} mt-8`}
        >
          {status === "loading" && <Loader2 size={22} className="animate-spin" />}
          {status === "loading" ? "Sending..." : "Send Reset Link"}
        </button>

        <div className="mt-7 text-center">
          <Link to="/login" className={linkClass}>
            <ArrowLeft size={18} /> Back to login
          </Link>
        </div>
      </form>
    </RecoveryShell>
  );
}