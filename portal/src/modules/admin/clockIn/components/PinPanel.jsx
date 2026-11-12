import { useEffect, useState } from "react";
import { Delete as BackspaceIcon, Loader2, ShieldCheck } from "lucide-react";

const PIN_LENGTH = 4;
const KEYS = ["1", "2", "3", "4", "5", "6", "7", "8", "9", "back", "0", "#"];

// First time setup of the attendance PIN (same look as the employee PinPad).
//   onSetPin(password, pin) -> Promise<{ ok, error }>
const PinPanel = ({
  disabled = false,
  submitting = false,
  keyboard = true,
  onSetPin,
}) => {
  const [pin, setPin] = useState("");
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState("");
  const [saved, setSaved] = useState(false);

  const blocked = disabled || submitting;

  const press = (digit) => {
    if (blocked) return;

    setMessage("");
    setPin((current) =>
      current.length < PIN_LENGTH ? current + digit : current
    );
  };

  const back = () => {
    if (blocked) return;

    setPin((current) => current.slice(0, -1));
  };

  const submit = async () => {
    if (blocked || pin.length !== PIN_LENGTH) return;

    if (!password.trim()) {
      setMessage("Enter your current login password.");
      return;
    }

    if (typeof onSetPin !== "function") {
      setMessage("This action is not connected yet. Please contact support.");
      return;
    }

    try {
      setMessage("");

      const result = await onSetPin(password, pin);

      if (!result?.ok) {
        setMessage(result?.error || "Unable to save the PIN.");
        setPin("");
        return;
      }

      setPin("");
      setPassword("");
      setSaved(true);
    } catch (error) {
      setMessage(error?.message || "Something went wrong.");
      setPin("");
    }
  };

  useEffect(() => {
    if (!keyboard) return undefined;

    const onKey = (event) => {
      if (event.ctrlKey || event.metaKey || event.altKey) return;

      const tag = event.target?.tagName;

      if (["INPUT", "TEXTAREA", "SELECT"].includes(tag)) return;

      if (/^\d$/.test(event.key)) press(event.key);
      else if (event.key === "Backspace") back();
      else if (event.key === "Enter" && tag !== "BUTTON") submit();
    };

    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  });

  return (
    <div className="rounded-xl border border-white/10 bg-[#0a0a0a] p-4 sm:p-6">
      <div className="flex flex-col items-center text-center">
        <span className="flex h-12 w-12 items-center justify-center rounded-xl border border-white/10 bg-white/[0.04]">
          <ShieldCheck size={22} className="text-red-500" />
        </span>

        <h4 className="mt-3 text-[15px] font-semibold text-white">
          Set Attendance PIN
        </h4>

        <p className="mt-1 text-[11px] text-white/50">
          Confirm your login password and create a 4-digit PIN. You will use
          it to clock in and clock out.
        </p>
      </div>

      <label className="mb-1.5 mt-5 block text-[11px] font-medium text-white/55">
        Current login password
      </label>

      <input
        type="password"
        autoComplete="current-password"
        value={password}
        disabled={blocked}
        onChange={(event) => {
          setPassword(event.target.value);
          setMessage("");
        }}
        placeholder="Enter your account password"
        className="w-full rounded-lg border border-white/10 bg-[#121212] p-3 text-[12.5px] text-white outline-none placeholder:text-white/40 focus:border-red-600 disabled:opacity-60"
      />

      <div className="mt-5 flex justify-center gap-3 sm:gap-4">
        {[...Array(PIN_LENGTH)].map((_, index) => (
          <div
            key={index}
            aria-label={`PIN digit ${index + 1}`}
            className={`flex h-12 w-12 items-center justify-center rounded-lg border bg-[#121212] text-xl text-white transition sm:h-14 sm:w-14 ${
              message
                ? "border-red-600"
                : index === pin.length && !blocked
                  ? "border-red-600"
                  : "border-white/15"
            }`}
          >
            {pin[index] ? "●" : ""}
          </div>
        ))}
      </div>

      <p
        role="alert"
        className={`mt-3 min-h-[16px] text-center text-[11px] ${
          saved && !message ? "text-green-400" : "text-red-400"
        }`}
      >
        {message || (saved ? "Attendance PIN saved successfully." : "")}
      </p>

      <div className="mx-auto mt-3 grid max-w-[300px] grid-cols-3 gap-2.5 sm:gap-3">
        {KEYS.map((key) => (
          <button
            key={key}
            type="button"
            disabled={blocked}
            aria-label={
              key === "back" ? "Backspace" : key === "#" ? "Confirm" : key
            }
            onClick={() =>
              key === "back" ? back() : key === "#" ? submit() : press(key)
            }
            className="flex h-11 items-center justify-center rounded-lg border border-white/5 bg-[#1a1a1a] text-lg text-white transition hover:bg-[#242424] active:scale-95 disabled:cursor-not-allowed disabled:opacity-50 sm:h-12"
          >
            {key === "back" ? <BackspaceIcon size={18} /> : key}
          </button>
        ))}
      </div>

      <button
        type="button"
        onClick={submit}
        disabled={blocked || pin.length !== PIN_LENGTH || !password.trim()}
        className="mt-5 flex w-full items-center justify-center gap-2 rounded-md bg-[#c1121f] py-3 text-[14px] font-semibold text-white transition hover:bg-[#d4202d] disabled:cursor-not-allowed disabled:opacity-60"
      >
        {submitting ? (
          <>
            <Loader2 size={16} className="animate-spin" /> Please wait...
          </>
        ) : (
          "Save Attendance PIN"
        )}
      </button>
    </div>
  );
};

export default PinPanel;