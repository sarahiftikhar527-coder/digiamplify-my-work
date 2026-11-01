import { useEffect, useState } from "react";
import { CheckCircle2, X } from "lucide-react";
import { clockInService } from "../../../../../services/clockInService";

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const ForgotPinModal = ({ defaultEmail = "", onClose }) => {
  const [email, setEmail] = useState(defaultEmail);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [sent, setSent] = useState(false);

  useEffect(() => {
    const onKey = (e) => e.key === "Escape" && onClose();
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose]);

  const submit = async (e) => {
    e.preventDefault();
    if (!EMAIL_RE.test(email.trim())) return setError("Enter a valid email address");
    setBusy(true);
    setError("");
    try {
      await clockInService.forgotPin({ email: email.trim() });
      setSent(true);
    } catch (err) {
      setError(err.message);
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4 backdrop-blur-sm" onMouseDown={onClose}>
      <div
        onMouseDown={(e) => e.stopPropagation()}
        role="dialog"
        aria-modal="true"
        aria-labelledby="forgot-pin-title"
        className="w-full max-w-sm rounded-2xl border border-white/10 bg-[#0d0d0f] p-5 sm:p-6"
      >
        <div className="flex items-start justify-between gap-3">
          <div>
            <h3 id="forgot-pin-title" className="text-[16px] font-semibold text-white">Forgot PIN?</h3>
            <p className="mt-1 text-[12px] text-white/60">
              Enter your registered email. We'll send a request to reset your attendance PIN.
            </p>
          </div>
          <button onClick={onClose} aria-label="Close" className="rounded-lg border border-white/20 p-1.5 text-white hover:bg-white/10">
            <X size={16} />
          </button>
        </div>

        {sent ? (
          <div className="mt-6 flex flex-col items-center gap-3 text-center">
            <CheckCircle2 size={40} className="text-green-500" />
            <p className="text-[13px] text-white/80">
              Request sent. If this email is registered, you'll receive the reset instructions shortly.
            </p>
            <button onClick={onClose} className="mt-2 w-full rounded-md bg-[#c1121f] py-2.5 text-[13px] font-semibold text-white hover:bg-[#d4202d]">
              Done
            </button>
          </div>
        ) : (
          <form onSubmit={submit} className="mt-5">
            <label className="mb-1.5 block text-[12px] text-white/80">Email</label>
            <input
              type="email"
              autoFocus
              value={email}
              onChange={(e) => { setEmail(e.target.value); setError(""); }}
              placeholder="you@company.com"
              className="w-full rounded-lg border border-white/10 bg-[#121212] px-3 py-2.5 text-[13px] text-white outline-none placeholder:text-white/40 focus:border-red-600"
            />
            {error && <p role="alert" className="mt-2 text-[12px] text-red-400">{error}</p>}
            <button
              type="submit"
              disabled={busy}
              className="mt-5 w-full rounded-md bg-[#c1121f] py-2.5 text-[13px] font-semibold text-white hover:bg-[#d4202d] disabled:opacity-60"
            >
              {busy ? "Sending..." : "Send reset request"}
            </button>
          </form>
        )}
      </div>
    </div>
  );
};

export default ForgotPinModal;