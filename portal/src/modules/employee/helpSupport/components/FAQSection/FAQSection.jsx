import { useMemo, useState } from "react";
import { ChevronDown, HelpCircle, Search } from "lucide-react";

const FAQSection = ({ faqs, loading, error }) => {
  const [query, setQuery] = useState("");
  const [openId, setOpenId] = useState(null);

  const list = useMemo(() => {
    const q = query.trim().toLowerCase();
    return q ? faqs.filter((f) => `${f.question} ${f.answer}`.toLowerCase().includes(q)) : faqs;
  }, [faqs, query]);

  return (
    <section className="rounded-xl border border-white/10 bg-[#0d0d0d] p-4 sm:p-5">
      <h3 className="mb-3 flex items-center gap-2 text-[14px] font-semibold text-white">
        <HelpCircle size={15} /> FAQs
      </h3>

      <label className="mb-3 flex items-center gap-2 rounded-full border border-white/10 bg-[#101012] px-3 py-2">
        <Search size={14} className="text-white/60" />
        <input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search FAQs..."
          className="w-full bg-transparent text-[12px] text-white outline-none placeholder:text-white/40"
        />
      </label>

      {loading ? (
        <div className="animate-pulse space-y-2">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="h-11 rounded-lg bg-white/5" />
          ))}
        </div>
      ) : error ? (
        <p className="py-6 text-center text-[12px] text-red-300">{error}</p>
      ) : !list.length ? (
        <p className="py-6 text-center text-[12px] text-white/50">No FAQs found.</p>
      ) : (
        <ul className="space-y-2">
          {list.map((f) => {
            const open = openId === f.id;
            return (
              <li key={f.id} className="rounded-lg border border-white/10 bg-[#101012]">
                <button
                  onClick={() => setOpenId(open ? null : f.id)}
                  aria-expanded={open}
                  className="flex w-full items-center justify-between gap-3 px-3.5 py-3 text-left"
                >
                  <span className="text-[12.5px] font-medium text-white">{f.question}</span>
                  <ChevronDown size={15} className={`shrink-0 text-white/70 transition ${open ? "rotate-180" : ""}`} />
                </button>
                {open && <p className="whitespace-pre-line px-3.5 pb-3 text-[12px] leading-relaxed text-white/65">{f.answer}</p>}
              </li>
            );
          })}
        </ul>
      )}
    </section>
  );
};

export default FAQSection;