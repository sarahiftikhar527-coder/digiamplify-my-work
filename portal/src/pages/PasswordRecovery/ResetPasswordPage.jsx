import { useEffect, useMemo, useRef, useState } from "react";
import { Link } from "react-router-dom";
import {
  Check,
  CheckCircle2,
  Eye,
  EyeOff,
  Loader2,
  Lock,
  ShieldAlert,
} from "lucide-react";

import { resetPassword } from "../../modules/auth/services/authService.js";
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
} from "./RecoveryShell.jsx";

const TOKEN_PATTERN = /^[a-f0-9]{64}$/i;
const MIN_LENGTH = 8;

const STRENGTH = [
  { label: "Too short", bar: "bg-red-600", text: "text-red-500" },
  { label: "Weak", bar: "bg-red-600", text: "text-red-500" },
  { label: "Fair", bar: "bg-orange-500", text: "text-orange-400" },
  { label: "Good", bar: "bg-yellow-400", text: "text-yellow-400" },
  { label: "Strong", bar: "bg-green-500", text: "text-green-400" },
];

const getStrength = (value) => {
  if (!value) return 0;
  if (value.length < MIN_LENGTH) return 0;

  let score = 1;
  if (/[a-z]/.test(value) && /[A-Z]/.test(value)) score += 1;
  if (/\d/.test(value)) score += 1;
  if (/[^A-Za-z0-9]/.test(value) || value.length >= 12) score += 1;

  return Math.min(score, 4);
};

const Rule = ({ ok, children }) => (
  <li className="flex items-center gap-3">
    <span
      className={`flex h-[20px] w-[20px] shrink-0 items-center justify-center rounded-full border transition ${
        ok ? "border-green-500 bg-green-500/15 text-green-400" : "border-[#444] text-transparent"
      }`}
    >
      <Check size={13} strokeWidth={3} />
    </span>
    <span className={`text-[14px] transition ${ok ? "text-gray-200" : "text-gray-500"}`}>
      {children}
    </span>
  </li>
);

export default function ResetPasswordPage() {
  const tokenRef = useRef("");
  const [tokenReady, setTokenReady] = useState(false);
  const [invalidLink, setInvalidLink] = useState(false);

  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [errors, setErrors] = useState({});
  const [serverError, setServerError] = useState("");
  const [status, setStatus] = useState("idle"); // idle | loading | done

  // Read the token from the link once, then remove it from the address bar.
  useEffect(() => {
    const token = new URLSearchParams(window.location.search).get("token")?.trim() || "";

    if (!TOKEN_PATTERN.test(token)) {
      setInvalidLink(true);
    } else {
      tokenRef.current = token;
      window.history.replaceState({}, document.title, window.location.pathname);
    }

    setTokenReady(true);
  }, []);

  // Do not leak the page address to other sites.
  useEffect(() => {
    const meta = document.createElement("meta");
    meta.name = "referrer";
    meta.content = "no-referrer";
    document.head.appendChild(meta);

    return () => {
      document.head.removeChild(meta);
    };
  }, []);

  const strength = useMemo(() => getStrength(password), [password]);
  const longEnough = password.length >= MIN_LENGTH;
  const matches = confirm.length > 0 && confirm === password;

  const validate = () => {
    const next = {};

    if (!password) next.password = "New password is required";
    else if (!longEnough) next.password = `Password must be at least ${MIN_LENGTH} characters`;

    if (!confirm) next.confirm = "Please confirm your new password";
    else if (confirm !== password) next.confirm = "Passwords do not match";

    setErrors(next);
    return Object.keys(next).length === 0;
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    if (status === "loading" || !validate()) return;

    setStatus("loading");
    setServerError("");

    try {
      const result = await resetPassword({
        token: tokenRef.current,
        newPassword: password,
      });

      // Pre-fill the SAME email on the login page.
      try {
        if (result?.email) localStorage.setItem(REMEMBER_KEY, result.email);
      } catch {
        // ignore storage problems
      }

      tokenRef.current = "";
      setPassword("");
      setConfirm("");
      setStatus("done");
    } catch (err) {
      setServerError(getErrorMessage(err));
      setStatus("idle");
    }
  };

  if (!tokenReady) {
    return (
      <div className="fixed inset-0 flex items-center justify-center bg-[#383838] text-white/70">
        <Loader2 className="animate-spin" size={28} />
      </div>
    );
  }

  /* ---------------- Invalid link ---------------- */
  if (invalidLink) {
    return (
      <RecoveryShell
        icon={ShieldAlert}
        title="Invalid reset link"
        subtitle="This link is missing, incomplete or already used. Request a new password reset email."
      >
        <Link to="/forgot-password" className={primaryButtonClass}>
          Request a New Link
        </Link>
        <div className="mt-7 text-center">
          <Link to="/login" className={linkClass}>
            Back to login
          </Link>
        </div>
      </RecoveryShell>
    );
  }

  /* ---------------- Success ---------------- */
  if (status === "done") {
    return (
      <RecoveryShell
        icon={CheckCircle2}
        title="Password updated"
        subtitle="Your password was changed and you were signed out of all devices. Log in with your usual email and the new password."
      >
        <Link to="/login" className={primaryButtonClass}>
          Continue to Login
        </Link>
      </RecoveryShell>
    );
  }

  /* ---------------- New password form ---------------- */
  return (
    <RecoveryShell
      icon={Lock}
      title="Set a New Password"
      subtitle="Choose a strong password that you have not used before."
    >
      <form onSubmit={handleSubmit} noValidate>
        {/* New password */}
        <label htmlFor="newPassword" className={labelClass}>
          New Password
        </label>

        <div className={inputWrapClass(!!errors.password)}>
          <Lock size={24} strokeWidth={1.5} className="shrink-0 text-gray-400" />
          <input
            id="newPassword"
            name="newPassword"
            type={showPassword ? "text" : "password"}
            autoComplete="new-password"
            autoFocus
            value={password}
            onChange={(event) => {
              setPassword(event.target.value);
              setErrors((current) => ({ ...current, password: undefined }));
              setServerError("");
            }}
            placeholder="Enter new password"
            className={inputClass}
          />
          <button
            type="button"
            onClick={() => setShowPassword((value) => !value)}
            className="shrink-0 text-gray-300 transition hover:text-white"
            aria-label={showPassword ? "Hide password" : "Show password"}
          >
            {showPassword ? <Eye size={24} strokeWidth={1.5} /> : <EyeOff size={24} strokeWidth={1.5} />}
          </button>
        </div>

        <FieldError>{errors.password}</FieldError>

        {/* Strength meter */}
        {password && (
          <div className="mt-4">
            <div className="flex gap-2">
              {[1, 2, 3, 4].map((level) => (
                <span
                  key={level}
                  className={`h-[6px] flex-1 rounded-full transition-colors ${
                    strength >= level ? STRENGTH[strength].bar : "bg-[#2a2a2a]"
                  }`}
                />
              ))}
            </div>
            <p className={`mt-2 text-right text-[13px] font-medium ${STRENGTH[strength].text}`}>
              {STRENGTH[strength].label}
            </p>
          </div>
        )}

        {/* Confirm password */}
        <label htmlFor="confirmPassword" className={`${labelClass} mt-6`}>
          Confirm Password
        </label>

        <div className={inputWrapClass(!!errors.confirm)}>
          <Lock size={24} strokeWidth={1.5} className="shrink-0 text-gray-400" />
          <input
            id="confirmPassword"
            name="confirmPassword"
            type={showConfirm ? "text" : "password"}
            autoComplete="new-password"
            value={confirm}
            onChange={(event) => {
              setConfirm(event.target.value);
              setErrors((current) => ({ ...current, confirm: undefined }));
              setServerError("");
            }}
            placeholder="Re-enter new password"
            className={inputClass}
          />
          <button
            type="button"
            onClick={() => setShowConfirm((value) => !value)}
            className="shrink-0 text-gray-300 transition hover:text-white"
            aria-label={showConfirm ? "Hide password" : "Show password"}
          >
            {showConfirm ? <Eye size={24} strokeWidth={1.5} /> : <EyeOff size={24} strokeWidth={1.5} />}
          </button>
        </div>

        <FieldError>{errors.confirm}</FieldError>

        {/* Requirements */}
        <ul className="mt-6 space-y-2.5 rounded-[8px] border border-[#222] bg-[#0d0d0d] px-5 py-4">
          <Rule ok={longEnough}>At least {MIN_LENGTH} characters</Rule>
          <Rule ok={matches}>Both passwords match</Rule>
        </ul>

        <ErrorBox>{serverError}</ErrorBox>

        {serverError && /invalid|expired/i.test(serverError) && (
          <div className="mt-4 text-center">
            <Link to="/forgot-password" className={linkClass}>
              Request a new link
            </Link>
          </div>
        )}

        <button
          type="submit"
          disabled={status === "loading"}
          className={`${primaryButtonClass} mt-8`}
        >
          {status === "loading" && <Loader2 size={22} className="animate-spin" />}
          {status === "loading" ? "Saving..." : "Reset Password"}
        </button>

        <div className="mt-7 text-center">
          <Link to="/login" className={linkClass}>
            Back to login
          </Link>
        </div>
      </form>
    </RecoveryShell>
  );
}