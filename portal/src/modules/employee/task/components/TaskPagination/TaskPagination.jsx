import { ChevronLeft, ChevronRight } from 'lucide-react';

const TaskPagination = ({ page = 1, totalPages = 1, onChange }) => {
  const start = Math.max(1, Math.min(page - 2, totalPages - 4));
  const end = Math.min(totalPages, start + 4);
  const pages = Array.from({ length: end - start + 1 }, (_, i) => start + i);

  const arrow =
    'flex h-8 w-8 items-center justify-center rounded-full text-gray-200 transition-colors hover:text-white disabled:opacity-30 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#c1121f]';

  return (
    <div className="mt-4 flex items-center justify-between gap-3">
      <p className="text-sm text-gray-300">
        Showing {page} of {totalPages}
      </p>

      <nav aria-label="Pagination" className="flex items-center gap-2">
        <button
          type="button"
          aria-label="Previous page"
          disabled={page <= 1}
          onClick={() => onChange?.(page - 1)}
          className={arrow}
        >
          <ChevronLeft size={16} />
        </button>

        {pages.map((p) => (
          <button
            key={p}
            type="button"
            aria-current={p === page ? 'page' : undefined}
            onClick={() => onChange?.(p)}
            className={`h-8 w-8 rounded-full border text-sm transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#c1121f] ${
              p === page
                ? 'border-[#c1121f] bg-[#c1121f] text-white'
                : 'border-[#2a2a2a] text-gray-200 hover:border-[#3a1519]'
            }`}
          >
            {p}
          </button>
        ))}

        <button
          type="button"
          aria-label="Next page"
          disabled={page >= totalPages}
          onClick={() => onChange?.(page + 1)}
          className={arrow}
        >
          <ChevronRight size={16} />
        </button>
      </nav>
    </div>
  );
};

export default TaskPagination;