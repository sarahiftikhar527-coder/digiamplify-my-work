import { useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import { CheckCircle2 } from "lucide-react";

import PinPad from "@/modules/employee/clockIn/components/PinPad/PinPad";
import { clockInService } from "@/services/clockInService";

const TOKEN_PATTERN = /^[a-f0-9]{64}$/i;

const getErrorMessage = (error) => {
  const message =
    error?.response?.data?.message ||
    error?.message ||
    "Something went wrong. Please try again.";

  return String(message);
};

export default function ResetPinPage() {
  const tokenRef = useRef("");
  const [tokenReady, setTokenReady] = useState(false);
  const [invalidLink, setInvalidLink] = useState(false);
  const [step, setStep] = useState("enter");
  const [firstPin, setFirstPin] = useState("");
  const [done, setDone] = useState(false);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const token = params.get("token")?.trim() || "";

    if (!TOKEN_PATTERN.test(token)) {
      setInvalidLink(true);
      setTokenReady(true);
      return;
    }

    tokenRef.current = token;
    setTokenReady(true);

    const cleanUrl = `${window.location.pathname}${window.location.hash || ""}`;
    window.history.replaceState({}, document.title, cleanUrl);
  }, []);

  useEffect(() => {
    const meta = document.createElement("meta");
    meta.name = "referrer";
    meta.content = "no-referrer";
    document.head.appendChild(meta);

    return () => {
      document.head.removeChild(meta);
    };
  }, []);

  const handleEnterPin = async (pin) => {
    setFirstPin(pin);
    setStep("confirm");
    return { ok: true };
  };

  const handleConfirmPin = async (pin) => {
    if (pin !== firstPin) {
      return {
        ok: false,
        error: "PINs do not match. Try again.",
        invalidPin: true,
      };
    }

    try {
      await clockInService.resetPin({
        token: tokenRef.current,
        newPin: pin,
      });

      setDone(true);
      return { ok: true };
    } catch (error) {
      const message = getErrorMessage(error);

      return {
        ok: false,
        error: message,
        invalidPin: /invalid|expired|4-digit/i.test(message),
      };
    }
  };

  if (!tokenReady) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#050505] px-4 text-white/70">
        Loading...
      </div>
    );
  }

  if (invalidLink) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#050505] px-4">
        <div className="w-full max-w-md rounded-xl border border-white/10 bg-[#0a0a0a] p-6 text-center">
          <h1 className="text-lg font-semibold text-white">Invalid reset link</h1>
          <p className="mt-2 text-sm text-white/60">
            This link is missing or expired. Request a new PIN reset from the clock-in
            screen.
          </p>
          <Link
            to="/login"
            className="mt-6 inline-block text-sm font-medium text-red-400 hover:text-red-300"
          >
            Back to login
          </Link>
        </div>
      </div>
    );
  }

  if (done) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#050505] px-4">
        <div className="w-full max-w-md rounded-xl border border-white/10 bg-[#0a0a0a] p-6 text-center">
          <CheckCircle2 className="mx-auto text-green-500" size={40} />
          <h1 className="mt-4 text-lg font-semibold text-white">PIN updated</h1>
          <p className="mt-2 text-sm text-white/60">
            You can now clock in with your new PIN.
          </p>
          <Link
            to="/login"
            className="mt-6 inline-block rounded-md bg-[#c1121f] px-5 py-2.5 text-sm font-semibold text-white hover:bg-[#d4202d]"
          >
            Continue to login
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-[#050505] px-4 py-10">
      <div className="w-full max-w-md">
        <div className="mb-6 text-center">
          <h1 className="text-xl font-semibold text-white">Reset attendance PIN</h1>
          <p className="mt-1 text-sm text-white/50">
            {step === "enter"
              ? "Choose a new 4-digit PIN."
              : "Enter the same PIN again to confirm."}
          </p>
        </div>

        {step === "enter" ? (
          <PinPad
            mode="in"
            showForgot={false}
            onForgot={() => {}}
            heading="New PIN"
            description="Enter a new 4-digit attendance PIN."
            submitLabel="Continue"
            onSubmit={handleEnterPin}
          />
        ) : (
          <PinPad
            key="confirm"
            mode="in"
            showForgot={false}
            onForgot={() => {}}
            heading="Confirm PIN"
            description="Re-enter your new PIN."
            submitLabel="Save PIN"
            onSubmit={handleConfirmPin}
          />
        )}

        <p className="mt-4 text-center text-xs text-white/40">
          <button
            type="button"
            className="text-red-400 hover:text-red-300"
            onClick={() => {
              setFirstPin("");
              setStep("enter");
            }}
          >
            Start over
          </button>
        </p>
      </div>
    </div>
  );
}
