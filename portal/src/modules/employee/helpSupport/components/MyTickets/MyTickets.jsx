import { Ticket } from "lucide-react";

const STATUS = {
  open: ["Open", "border-amber-500/40 bg-amber-500/10 text-amber-400"],
  in_progress: ["In Progress", "border-sky-500/40 bg-sky-500/10 text-sky-400"],
  resolved: ["Resolved", "border-green-500/40 bg-green-500/10 text-green-400"],
  closed: ["Closed", "border-white/20 bg-white/5 text-white/60"],
};
const PRIORITY = { high: "text-red-400", medium: "text-amber-400", low: "text-green-400" };

const fmtDate = (d) =>
  d ? new Date(d).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" }) : "";

const MyTickets = ({ tickets, loading, error, onRetry }) => (
  <section className="rounded-xl border border-white/10 bg-[#0d0d0d] p-4 sm:p-5">
    <h3 className="mb-3 flex items-center gap-2 text-[14px] font-semibold text-white">
      <Ticket size={15} /> My Tickets
    </h3>

    {loading ? (
      <div className="animate-pulse space-y-3">
        {[...Array(4)].map((_, i) => (
          <div key={i} className="h-14 rounded-lg bg-white/5" />
        ))}
      </div>
    ) : error ? (
      <p className="py-6 text-center text-[12px] text-red-300">
        {error}{" "}
        <button onClick={onRetry} className="font-semibold underline">
          Retry
        </button>
      </p>
    ) : !tickets.length ? (
      <p className="py-8 text-center text-[12px] text-white/50">You haven't submitted any tickets yet.</p>
    ) : (
      <ul className="divide-y divide-white/10">
        {tickets.map((t) => {
          const [label, cls] = STATUS[t.status] || STATUS.open;
          return (
            <li key={t.id} className="flex flex-wrap items-center gap-x-4 gap-y-2 py-3">
              <div className="min-w-0 flex-1 basis-48">
                <p className="truncate text-[13px] font-medium text-white">{t.subject}</p>
                <p className="mt-0.5 truncate text-[11px] text-white/50">
                  {t.ticketNo || t.id} · {t.issueType} · {fmtDate(t.createdAt)}
                </p>
              </div>
              <span className={`text-[11px] font-medium capitalize ${PRIORITY[t.priority] || "text-white/60"}`}>
                {t.priority}
              </span>
              <span className={`whitespace-nowrap rounded-full border px-3 py-1 text-[11px] ${cls}`}>{label}</span>
            </li>
          );
        })}
      </ul>
    )}
  </section>
);

export default MyTickets;