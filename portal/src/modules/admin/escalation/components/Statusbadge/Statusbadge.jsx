import { useEffect, useRef, useState } from "react";
import { ChevronDownIcon } from "../Icons/Icons";
import { STATUSES, STATUS_STYLES } from "../../Constants";

export default function StatusBadge({ status, onChange }) {
  const [open, setOpen] = useState(false);
  const ref = useRef(null);

  useEffect(() => {
    if (!open) return undefined;
    const onDown = (e) => {
      if (ref.current && !ref.current.contains(e.target)) setOpen(false);
    };
    const onKey = (e) => {
      if (e.key === "Escape") setOpen(false);
    };
    document.addEventListener("mousedown", onDown);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onDown);
      document.removeEventListener("keydown", onKey);
    };
  }, [open]);

  return (
    <div ref={ref} className="relative inline-flex items-center gap-1" onClick={(e) => e.stopPropagation()}>
      <span className={`rounded border px-3 py-0.5 text-[11px] ${STATUS_STYLES[status]}`}>{status}</span>
      <button
        type="button"
        aria-label="Change status"
        aria-expanded={open}
        onClick={() => setOpen((o) => !o)}
        className="rounded p-0.5 text-neutral-300 hover:text-white"
      >
        <ChevronDownIcon width={12} height={12} />
      </button>

      {open && (
        <ul className="absolute right-0 top-full z-30 mt-1 w-28 rounded border border-[#2a2a2a] bg-[#0d0d0d] py-1 shadow-lg">
          {STATUSES.map((s) => (
            <li key={s}>
              <button
                type="button"
                onClick={() => {
                  if (s !== status) onChange(s);
                  setOpen(false);
                }}
                className={`block w-full px-3 py-1.5 text-left text-xs hover:bg-neutral-900 ${
                  s === status ? "text-white" : "text-neutral-400"
                }`}
              >
                {s}
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
