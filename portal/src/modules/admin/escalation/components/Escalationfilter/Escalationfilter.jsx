import { useEffect, useRef, useState } from "react";
import { FilterIcon } from "../Icons/Icons";
import { CATEGORIES, PRIORITIES, STATUSES } from "../../Constants";

const selectClass =
  "w-full rounded border border-[#2a2a2a] bg-[#0d0d0d] px-2 py-1.5 text-xs text-white outline-none focus:border-red-700";

export default function EscalationFilter({ filters, onChange, onReset }) {
  const [open, setOpen] = useState(false);
  const ref = useRef(null);
  const activeCount = Object.values(filters).filter((v) => v !== "All").length;

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

  const set = (key, value) => onChange({ ...filters, [key]: value });

  const fields = [
    { key: "priority", label: "Priority", options: PRIORITIES },
    { key: "status", label: "Status", options: STATUSES },
    { key: "category", label: "Category", options: CATEGORIES },
  ];

  return (
    <div ref={ref} className="relative">
      <button
        type="button"
        aria-expanded={open}
        onClick={() => setOpen((o) => !o)}
        className="flex items-center gap-3 rounded border border-[#2a2a2a] bg-[#0d0d0d] px-3 py-2 text-xs text-white hover:border-neutral-600"
      >
        Filter
        {activeCount > 0 && (
          <span className="rounded-full bg-red-700 px-1.5 text-[10px] leading-4">{activeCount}</span>
        )}
        <FilterIcon width={14} height={14} />
      </button>

      {open && (
        <div className="absolute right-0 top-full z-30 mt-2 w-56 rounded-md border border-[#2a2a2a] bg-[#0b0b0b] p-3 shadow-xl">
          <div className="flex flex-col gap-3">
            {fields.map((f) => (
              <label key={f.key} className="block text-[11px] text-neutral-400">
                <span className="mb-1 block">{f.label}</span>
                <select className={selectClass} value={filters[f.key]} onChange={(e) => set(f.key, e.target.value)}>
                  <option>All</option>
                  {f.options.map((o) => (
                    <option key={o}>{o}</option>
                  ))}
                </select>
              </label>
            ))}
          </div>
          <button
            type="button"
            onClick={onReset}
            disabled={activeCount === 0}
            className="mt-3 w-full rounded border border-[#2a2a2a] py-1.5 text-xs text-neutral-300 hover:bg-neutral-900 disabled:opacity-40"
          >
            Reset filters
          </button>
        </div>
      )}
    </div>
  );
}
