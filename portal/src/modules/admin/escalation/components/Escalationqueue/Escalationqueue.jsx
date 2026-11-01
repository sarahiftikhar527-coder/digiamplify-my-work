import { SearchIcon } from "../Icons/Icons";
import EscalationFilter from "../Escalationfilter/Escalationfilter";
import EscalationRow from "../Escalationrow/Escalationrow";
import EscalationPagination from "../Escalationpagination/Escalationpagination";

const GRID = "grid grid-cols-[1.5fr_1fr_1.9fr_0.8fr_0.9fr_1.1fr_1.4fr] gap-2";
const HEADERS = ["Employee", "Category", "Subject", "Priority", "Document", "Submitted", "Status"];

export default function EscalationQueue({
  items,
  search,
  onSearch,
  filters,
  onFiltersChange,
  onFiltersReset,
  selectedId,
  onSelect,
  onStatusChange,
  page,
  totalPages,
  onPageChange,
}) {
  return (
    <section className="min-w-0 flex-1 rounded-md border border-[#222] bg-[#0b0b0b] p-4">
      <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
        <h2 className="text-sm font-medium text-white">Escalation Queue</h2>

        <div className="flex items-center gap-2">
          <label className="flex w-52 items-center gap-2 rounded border border-[#2a2a2a] bg-[#0d0d0d] px-3 py-2 text-xs text-neutral-400 focus-within:border-red-700">
            <SearchIcon width={13} height={13} />
            <input
              value={search}
              onChange={(e) => onSearch(e.target.value)}
              placeholder="Search employee"
              className="w-full bg-transparent text-white outline-none placeholder:text-neutral-500"
            />
          </label>
          <EscalationFilter filters={filters} onChange={onFiltersChange} onReset={onFiltersReset} />
        </div>
      </div>

      <div role="table" className="rounded-md border border-[#222]">
        <div role="row" className={`${GRID} rounded-t-md bg-[#101010] px-4 py-3 text-center text-xs text-neutral-400`}>
          {HEADERS.map((h) => (
            <span key={h}>{h}</span>
          ))}
        </div>

        {items.map((item) => (
          <EscalationRow
            key={item.id}
            item={item}
            selected={item.id === selectedId}
            onSelect={onSelect}
            onStatusChange={onStatusChange}
          />
        ))}

        {items.length === 0 && (
          <p className="border-t border-[#1f1f1f] py-10 text-center text-xs text-neutral-500">
            No escalations match your search or filters.
          </p>
        )}
      </div>

      <EscalationPagination page={page} totalPages={totalPages} onChange={onPageChange} />
    </section>
  );
}
