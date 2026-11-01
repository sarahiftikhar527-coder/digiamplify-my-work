import { useEffect, useState } from "react";
import { Check, X } from "lucide-react";
import Avatar from "../Avatar";
import { scrollbar } from "../../../../../utils/format";

const ForwardModal = ({ message, conversations, onClose, onForward }) => {
  const [selected, setSelected] = useState([]);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    const onKey = (e) => e.key === "Escape" && onClose();
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose]);

  const toggle = (id) => setSelected((p) => (p.includes(id) ? p.filter((i) => i !== id) : [...p, id]));

  const submit = async () => {
    setBusy(true);
    setError("");
    try {
      await onForward(message, selected);
      onClose();
    } catch (e) {
      setError(e.message);
      setBusy(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4" onMouseDown={onClose}>
      <div onMouseDown={(e) => e.stopPropagation()} className="flex max-h-[80vh] w-full max-w-sm flex-col rounded-2xl border border-white/10 bg-[#111]">
        <div className="flex items-center justify-between border-b border-white/10 px-5 py-4">
          <h3 className="text-[15px] font-medium text-white">Forward message</h3>
          <button onClick={onClose} aria-label="Close" className="text-white/60 hover:text-white"><X size={18} /></button>
        </div>
        <p className="mx-5 mt-3 line-clamp-2 rounded-lg bg-[#1a1a1a] px-3 py-2 text-[12px] text-white/60">
          {message.text || "Attachment"}
        </p>
        <div className={`mt-3 min-h-[100px] flex-1 px-2 ${scrollbar}`}>
          {conversations.map((c) => (
            <button key={c.id} onClick={() => toggle(c.id)} className="flex w-full items-center gap-3 rounded-lg px-3 py-2 text-left hover:bg-white/5">
              <Avatar src={c.avatar} name={c.name} group={c.type === "group"} size={32} />
              <span className="flex-1 truncate text-[13px] text-white">{c.name}</span>
              {selected.includes(c.id) && <Check size={16} className="text-red-500" />}
            </button>
          ))}
        </div>
        <div className="border-t border-white/10 px-5 py-4">
          {error && <p className="mb-2 text-[12px] text-red-400">{error}</p>}
          <button
            onClick={submit}
            disabled={busy || !selected.length}
            className="w-full rounded-full bg-red-600 py-2.5 text-[13px] font-semibold text-white hover:bg-red-500 disabled:opacity-50"
          >
            {busy ? "Forwarding..." : `Forward${selected.length ? ` (${selected.length})` : ""}`}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ForwardModal;