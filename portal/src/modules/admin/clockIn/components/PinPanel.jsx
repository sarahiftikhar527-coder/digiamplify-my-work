
import { useEffect, useState } from "react";
import { CheckCircle2, ShieldCheck } from "lucide-react";
import { formatHours } from "./attendanceUtils";

const KEYS = ["1", "2", "3", "4", "5", "6", "7", "8", "9", "Clear", "0", "Del"];

const PinPanel = ({
  mode,
  worked = 0,
  disabled = false,
  submitting = false,
  keyboard = true,
  onSubmit,
  onSetPin,
  description = "",
  onDescription = () => {},
}) => {
  const [pin, setPin] = useState("");
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState("");

  const isSetup = mode === "setup";

  const press = (key) => {
    setMessage("");

    if (key === "Clear") {
      setPin("");
      return;
    }

    if (key === "Del") {
      setPin((previous) => previous.slice(0, -1));
      return;
    }

    setPin((previous) =>
      previous.length < 4 ? previous + key : previous
    );
  };

  const submit = async () => {
    if (disabled || submitting || pin.length !== 4) return;

    if (isSetup && !password.trim()) {
      setMessage("Enter your current login password.");
      return;
    }

    if (typeof (isSetup ? onSetPin : onSubmit) !== "function") {
      setMessage("This action is not connected yet. Please contact support.");
      return;
    }

    try {
      setMessage("");

      const result = isSetup
        ? await onSetPin(password, pin)
        : await onSubmit(pin);

      if (!result?.ok) {
        setMessage(
          result?.error || result?.message || "Unable to complete the request."
        );
        return;
      }

      setPin("");
      setPassword("");
      setMessage(
        isSetup ? "Attendance PIN saved successfully." : ""
      );
    } catch (error) {
      setMessage(error?.message || "Something went wrong.");
    }
  };

  useEffect(() => {
    if (!keyboard || mode === "done" || isSetup) return;

    const handleKeyDown = (event) => {
      const tag = event.target?.tagName;

      if (tag === "TEXTAREA" || tag === "INPUT") return;

      if (/^\d$/.test(event.key)) press(event.key);
      else if (event.key === "Backspace") press("Del");
      else if (event.key === "Enter") submit();
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  });

  if (mode === "done") {
    return (
      <div className="flex flex-col items-center justify-center rounded-3xl border border-white/10 bg-[#141416] p-6 text-center">
        <CheckCircle2 size={44} className="text-green-500" />
        <p className="mt-4 text-lg font-semibold text-white">
          Attendance completed
        </p>
        <p className="mt-1 text-[13px] text-white/60">
          You worked {formatHours(worked)} today.
        </p>
      </div>
    );
  }

  const action = mode === "out" ? "Clock Out" : "Clock In";

  return (
    <div className="rounded-3xl border border-white/10 bg-[#141416] p-6">
      <div className="flex flex-col items-center">
        {isSetup && <ShieldCheck size={34} className="text-green-500" />}

        <h2 className="mt-2 text-center text-xl font-semibold text-white">
          {isSetup ? "Set Attendance PIN" : "Enter your PIN"}
        </h2>

        <p className="mt-2 text-center text-[13px] text-white/50">
          {isSetup
            ? "Confirm your login password and create a 4-digit PIN."
            : `Use your 4-digit PIN to ${action.toLowerCase()}.`}
        </p>
      </div>

      {isSetup && (
        <div className="mt-5">
          <label className="mb-2 block text-sm text-white/70">
            Current login password
          </label>

          <input
            type="password"
            autoComplete="current-password"
            value={password}
            onChange={(event) => {
              setPassword(event.target.value);
              setMessage("");
            }}
            placeholder="Enter your account password"
            className="w-full rounded-xl border border-white/10 bg-[#0e0e10] p-3 text-sm text-white outline-none placeholder:text-white/40 focus:border-green-500/60"
          />
        </div>
      )}

      <div className="mt-6 flex justify-center gap-4">
        {[0, 1, 2, 3].map((index) => (
          <span
            key={index}
            className={`h-3.5 w-3.5 rounded-full border-2 ${
              isSetup ? "border-green-500" : "border-red-600"
            } ${index < pin.length
              ? isSetup
                ? "bg-green-500"
                : "bg-red-600"
              : ""
            }`}
          />
        ))}
      </div>

      {message && (
        <p className="mt-3 text-center text-[12px] text-red-400">
          {message}
        </p>
      )}

      <div className="mt-6 grid grid-cols-3 gap-3">
        {KEYS.map((key) => (
          <button
            key={key}
            type="button"
            onClick={() => press(key)}
            disabled={disabled || submitting}
            className="h-14 rounded-xl border border-white/10 bg-white/5 font-semibold text-white hover:bg-white/10 active:scale-95 disabled:opacity-50"
          >
            {key}
          </button>
        ))}
      </div>

      {mode === "out" && (
        <textarea
          value={description}
          onChange={(event) => onDescription(event.target.value)}
          rows={2}
          maxLength={500}
          placeholder="What did you work on today? (optional)"
          className="mt-4 w-full resize-none rounded-xl border border-white/10 bg-[#0e0e10] p-3 text-[13px] text-white outline-none placeholder:text-white/40 focus:border-red-500/60"
        />
      )}

      <button
        type="button"
        onClick={submit}
        disabled={
          pin.length !== 4 ||
          disabled ||
          submitting ||
          (isSetup && !password.trim())
        }
        className={`mt-4 w-full rounded-xl py-4 text-[15px] font-semibold text-white shadow-lg disabled:cursor-not-allowed disabled:opacity-50 ${
          isSetup
            ? "bg-gradient-to-r from-green-600 to-green-700 shadow-green-900/30"
            : "bg-gradient-to-r from-red-600 to-red-700 shadow-red-900/30"
        }`}
      >
        {submitting
          ? "Please wait..."
          : isSetup
            ? "Save Attendance PIN"
            : action}
      </button>
    </div>
  );
};

export default PinPanel;
