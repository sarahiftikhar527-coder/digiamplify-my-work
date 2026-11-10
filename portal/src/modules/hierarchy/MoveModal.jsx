import { useEffect, useState } from "react";
import { Loader2, Search, X } from "lucide-react";
import { PersonAvatar } from "./EmployeeCard";

export default function MoveModal({ person, options, topOption, busy, onPick, onClose }) {
  const [q, setQ] = useState("");

  useEffect(() => {
    const onKey = (event) => event.key === "Escape" && onClose();
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [onClose]);

  const needle = q.trim().toLowerCase();
  const list = options.filter((o) =>
    `${o.name} ${o.designation} ${o.department}`.toLowerCase().includes(needle)
  );

  return (
    <div
      className="fixed inset-0 z-[70] flex items-center justify-center bg-black/70 p-4 backdrop-blur-sm"
      onMouseDown={(event) => event.target === event.currentTarget && onClose()}
    >
      <div className="w-full max-w-md rounded-2xl border border-white/10 bg-[#0f0f0f] shadow-2xl">
        <div className="flex items-start justify-between gap-3 border-b border-white/10 p-4">
          <div>
            <h2 className="text-base font-semibold text-white">Move {person.name}</h2>
            <p className="mt-0.5 text-xs text-white/50">Choose who this person should report to.</p>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close"
            className="rounded-md p-1.5 text-white/60 hover:bg-white/10 hover:text-white"
          >
            <X size={18} />
          </button>
        </div>

        <div className="p-4 pb-2">
          <div className="relative">
            <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-white/40" />
            <input
              autoFocus
              value={q}
              onChange={(event) => setQ(event.target.value)}
              placeholder="Search people…"
              className="w-full rounded-lg border border-white/10 bg-black/40 py-2 pl-9 pr-3 text-sm text-white outline-none placeholder:text-white/30 focus:border-primary"
            />
          </div>
        </div>

        <div className="max-h-72 space-y-1 overflow-y-auto p-4 pt-2">
          {topOption && (
            <button
              type="button"
              disabled={busy}
              onClick={() => onPick(null)}
              className="w-full rounded-lg border border-dashed border-primary/40 px-3 py-2.5 text-left text-sm font-medium text-primary-light transition hover:bg-primary/10 disabled:opacity-50"
            >
              Top of the hierarchy (no manager)
            </button>
          )}

          {list.map((o) => (
            <button
              key={o.id}
              type="button"
              disabled={busy}
              onClick={() => onPick(o.id)}
              className="flex w-full items-center gap-3 rounded-lg px-3 py-2 text-left transition hover:bg-white/[0.06] disabled:opacity-50"
            >
              <PersonAvatar person={o} size={32} />
              <span className="min-w-0">
                <span className="block truncate text-sm font-medium text-white">{o.name}</span>
                <span className="block truncate text-xs text-white/45">
                  {o.designation || o.department || "Employee"}
                </span>
              </span>
            </button>
          ))}

          {!list.length && !topOption && (
            <p className="py-6 text-center text-sm text-white/40">No one available to move under.</p>
          )}
        </div>

        {busy && (
          <div className="flex items-center justify-center gap-2 border-t border-white/10 py-3 text-xs text-white/50">
            <Loader2 size={14} className="animate-spin" /> Updating…
          </div>
        )}
      </div>
    </div>
  );
}