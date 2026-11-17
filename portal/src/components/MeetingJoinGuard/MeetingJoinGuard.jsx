import { useCallback, useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Clock, X } from "lucide-react";

import { clockInService } from "@/services/clockInService.js";

// Every meeting "Join" button or meeting link in the meetings screens.
const JOIN_SELECTOR = "a.mt-next__join, a.mt-btn[href], .mt-where__row a[href]";

const MESSAGES = {
  out: {
    title: "Clock in to join this meeting",
    text: "You must be clocked in before you can join a meeting. Time spent in meetings is counted in your working hours.",
  },
  break: {
    title: "End your break to join",
    text: "You are on a break. End your break and resume work before you join a meeting.",
  },
  unknown: {
    title: "Attendance could not be checked",
    text: "We could not confirm that you are clocked in. Please try again in a moment.",
  },
};

export default function MeetingJoinGuard({ clockInPath = "/clock-in" }) {
  const navigate = useNavigate();
  const stateRef = useRef("unknown");
  const [notice, setNotice] = useState(null);

  const refresh = useCallback(async () => {
    try {
      const res = await clockInService.getToday();
      stateRef.current = res?.state || "out";
    } catch {
      stateRef.current = "unknown";
    }
  }, []);

  useEffect(() => {
    refresh();

    const id = setInterval(refresh, 20000);

    window.addEventListener("attendance:changed", refresh);
    window.addEventListener("focus", refresh);

    return () => {
      clearInterval(id);
      window.removeEventListener("attendance:changed", refresh);
      window.removeEventListener("focus", refresh);
    };
  }, [refresh]);

  useEffect(() => {
    const onClick = (event) => {
      const link = event.target?.closest?.(JOIN_SELECTOR);

      if (!link) return;

      const href = link.getAttribute("href") || "";

      if (!/^https?:/i.test(href)) return;

      // Clocked in: the meeting opens normally.
      if (stateRef.current === "in") return;

      event.preventDefault();
      event.stopPropagation();

      setNotice(stateRef.current === "break" ? "break" : stateRef.current === "out" ? "out" : "unknown");

      if (stateRef.current === "unknown") refresh();
    };

    document.addEventListener("click", onClick, true);

    return () => document.removeEventListener("click", onClick, true);
  }, [refresh]);

  useEffect(() => {
    if (!notice) return undefined;

    const onKey = (event) => event.key === "Escape" && setNotice(null);

    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [notice]);

  if (!notice) return null;

  const message = MESSAGES[notice] || MESSAGES.out;

  return (
    <div
      className="fixed inset-0 z-[80] flex items-center justify-center bg-black/75 p-4 backdrop-blur-sm"
      onMouseDown={(event) => event.target === event.currentTarget && setNotice(null)}
    >
      <div
        role="alertdialog"
        aria-modal="true"
        aria-label={message.title}
        className="w-full max-w-sm rounded-2xl border border-white/10 bg-[#0a0a0a] p-5 text-center shadow-2xl"
      >
        <button
          type="button"
          onClick={() => setNotice(null)}
          aria-label="Close"
          className="float-right rounded-md p-1 text-white/50 hover:bg-white/10 hover:text-white"
        >
          <X size={16} />
        </button>

        <span className="mx-auto flex h-12 w-12 items-center justify-center rounded-xl border border-red-600/40 bg-red-600/10">
          <Clock size={22} className="text-red-500" />
        </span>

        <h3 className="mt-3 text-[15px] font-semibold text-white">
          {message.title}
        </h3>

        <p className="mt-1.5 text-[12.5px] text-white/60">{message.text}</p>

        <div className="mt-5 flex gap-2">
          <button
            type="button"
            onClick={() => setNotice(null)}
            className="flex-1 rounded-md border border-white/15 py-2.5 text-[12.5px] font-semibold text-white/80 hover:border-white/30"
          >
            Close
          </button>

          <button
            type="button"
            onClick={() => {
              setNotice(null);
              navigate(clockInPath);
            }}
            className="flex-1 rounded-md bg-[#c1121f] py-2.5 text-[12.5px] font-semibold text-white hover:bg-[#d4202d]"
          >
            Go to Clock In
          </button>
        </div>
      </div>
    </div>
  );
}