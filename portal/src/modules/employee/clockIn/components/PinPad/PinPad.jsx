import { useEffect, useRef, useState } from "react";
import { Delete as BackspaceIcon, Loader2 } from "lucide-react";

const PIN_LENGTH = 4;
const MAX_ATTEMPTS = 5;
const LOCK_MS = 30000;
const KEYS = ["1", "2", "3", "4", "5", "6", "7", "8", "9", "back", "0", "#"];

// onSubmit(pin) -> Promise<{ ok, error, invalidPin }>
const PinPad = ({ mode, onSubmit, onForgot, disabled = false, keyboard = true }) => {
  const [pin, setPin] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [shake, setShake] = useState(false);
  const [attempts, setAttempts] = useState(0);
  const [lockedUntil, setLockedUntil] = useState(0);
  const [remaining, setRemaining] = useState(0);
  const busyRef = useRef(false);

  const locked = lockedUntil > 0;
  const blocked = disabled || loading || locked;
  const label = mode === "in" ? "Clock In" : "Clock Out";

  useEffect(() => {
    if (!lockedUntil) return;
    const tick = () => {
      const r = Math.ceil((lockedUntil - Date.now()) / 1000);
      if (r <= 0) {
        setLockedUntil(0);
        setRemaining(0);
        setError("");
      } else setRemaining(r);
    };
    tick();
    const id = setInterval(tick, 250);
    return () => clearInterval(id);
  }, [lockedUntil]);

  const press = (d) => {
    if (blocked) return;
    setError("");
    setPin((p) => (p.length < PIN_LENGTH ? p + d : p));
  };
  const back = () => !blocked && setPin((p) => p.slice(0, -1));

  const submit = async () => {
    if (pin.length !== PIN_LENGTH || blocked || busyRef.current) return;
    busyRef.current = true;
    setLoading(true);
    setError("");
    const res = await onSubmit(pin);
    busyRef.current = false;
    setLoading(false);
    if (res?.ok) {
      setPin("");
      setAttempts(0);
      return;
    }
    setError(res?.error || "Something went wrong. Please try again.");
    setPin("");
    setShake(true);
    setTimeout(() => setShake(false), 450);
    if (res?.invalidPin) {
      const n = attempts + 1;
      if (n >= MAX_ATTEMPTS) {
        setAttempts(0);
        setLockedUntil(Date.now() + LOCK_MS);
      } else setAttempts(n);
    }
  };

  // keyboard support
  const stateRef = useRef({});
  stateRef.current = { press, back, submit };
  useEffect(() => {
    if (!keyboard) return;
    const onKey = (e) => {
      if (e.ctrlKey || e.metaKey || e.altKey) return;
      const tag = e.target.tagName;
      if (["INPUT", "TEXTAREA", "SELECT"].includes(tag) || e.target.isContentEditable) return;
      if (/^\d$/.test(e.key)) stateRef.current.press(e.key);
      else if (e.key === "Backspace") stateRef.current.back();
      else if (e.key === "Enter" && tag !== "BUTTON") stateRef.current.submit();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [keyboard]);

  return (
    <div className="rounded-xl border border-white/10 bg-[#0a0a0a] p-4 sm:p-6">
      <style>{`@keyframes pin-shake{0%,100%{transform:translateX(0)}20%,60%{transform:translateX(-6px)}40%,80%{transform:translateX(6px)}}`}</style>

      <div className="flex items-start justify-between gap-3">
        <div>
          <h4 className="text-[13px] font-semibold text-white">Enter 4-Digit PIN</h4>
          <p className="mt-0.5 text-[11px] text-white/50">Use your PIN to {mode === "in" ? "clock in" : "clock out"}</p>
        </div>
        <button type="button" onClick={onForgot} className="shrink-0 text-[11px] font-medium text-red-500 hover:text-red-400">
          Forgot PIN?
        </button>
      </div>

      <div className="mt-5 flex justify-center gap-3 sm:gap-4" style={shake ? { animation: "pin-shake .4s" } : undefined}>
        {[...Array(PIN_LENGTH)].map((_, i) => (
          <div
            key={i}
            aria-label={`PIN digit ${i + 1}`}
            className={`flex h-12 w-12 items-center justify-center rounded-lg border bg-[#121212] text-xl text-white transition sm:h-14 sm:w-14 ${
              error ? "border-red-600" : i === pin.length && !blocked ? "border-red-600" : "border-white/15"
            }`}
          >
            {pin[i] ? "●" : ""}
          </div>
        ))}
      </div>

      <p role="alert" className="mt-3 min-h-[16px] text-center text-[11px] text-red-400">
        {locked ? `Too many attempts. Try again in ${remaining}s` : error}
      </p>

      <div className="mx-auto mt-3 grid max-w-[300px] grid-cols-3 gap-2.5 sm:gap-3">
        {KEYS.map((k) => (
          <button
            key={k}
            type="button"
            disabled={blocked}
            aria-label={k === "back" ? "Backspace" : k === "#" ? "Confirm" : k}
            onClick={() => (k === "back" ? back() : k === "#" ? submit() : press(k))}
            className="flex h-11 items-center justify-center rounded-lg border border-white/5 bg-[#1a1a1a] text-lg text-white transition hover:bg-[#242424] active:scale-95 disabled:cursor-not-allowed disabled:opacity-50 sm:h-12"
          >
            {k === "back" ? <BackspaceIcon size={18} /> : k}
          </button>
        ))}
      </div>

      <button
        type="button"
        onClick={submit}
        disabled={blocked || pin.length !== PIN_LENGTH}
        className="mt-5 flex w-full items-center justify-center gap-2 rounded-md bg-[#c1121f] py-3 text-[14px] font-semibold text-white transition hover:bg-[#d4202d] disabled:cursor-not-allowed disabled:opacity-60"
      >
        {loading ? (
          <>
            <Loader2 size={16} className="animate-spin" /> Please wait...
          </>
        ) : (
          label
        )}
      </button>
    </div>
  );
};

export default PinPad;