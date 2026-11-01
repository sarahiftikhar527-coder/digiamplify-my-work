import { ChevronLeftIcon, ChevronRightIcon } from "../Icons/Icons";

export default function EscalationPagination({ page, totalPages, onChange }) {
  const pages = Array.from({ length: totalPages }, (_, i) => i + 1);
  const arrow = "rounded p-1 text-neutral-400 hover:text-white disabled:opacity-30 disabled:hover:text-neutral-400";

  return (
    <div className="flex items-center justify-between px-1 pt-3 text-[11px] text-neutral-400">
      <span>Showing {page} of {totalPages}</span>

      <nav className="flex items-center gap-1.5" aria-label="Pagination">
        <button type="button" aria-label="Previous page" className={arrow} disabled={page <= 1} onClick={() => onChange(page - 1)}>
          <ChevronLeftIcon width={14} height={14} />
        </button>

        {pages.map((p) => (
          <button
            key={p}
            type="button"
            aria-current={p === page ? "page" : undefined}
            onClick={() => onChange(p)}
            className={`h-6 w-6 rounded-full text-[11px] ${
              p === page ? "bg-red-700 text-white" : "border border-[#333] text-neutral-300 hover:border-neutral-500"
            }`}
          >
            {p}
          </button>
        ))}

        <button type="button" aria-label="Next page" className={arrow} disabled={page >= totalPages} onClick={() => onChange(page + 1)}>
          <ChevronRightIcon width={14} height={14} />
        </button>
      </nav>
    </div>
  );
}
