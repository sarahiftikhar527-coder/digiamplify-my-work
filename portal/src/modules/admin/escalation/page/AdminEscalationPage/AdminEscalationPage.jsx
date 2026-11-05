import { useCallback, useMemo, useState } from "react";
import { useAuth } from "@/context";

import StatCards from "../../components/Statcards/Statcards";
import EscalationQueue from "../../components/Escalationqueue/Escalationqueue";
import EscalationDetailPanel from "../../components/Escalationdetailpanel/Escalationdetailpanel";

import {
  INITIAL_ESCALATIONS,
  PAGE_SIZE,
  formatLongDate,
  getGreeting,
  isToday,
} from "../../Constants";

const DEFAULT_FILTERS = { priority: "All", status: "All", category: "All" };

export default function EscalationPage({ userName }) {
  const { user } = useAuth();
  const displayName = userName || user?.name || user?.fullName || "Super Admin";
  const [items, setItems] = useState([]);
  const [search, setSearch] = useState("");
  const [filters, setFilters] = useState(DEFAULT_FILTERS);
  const [page, setPage] = useState(1);
  const [selectedId, setSelectedId] = useState(null);

  const now = new Date();

  const stats = useMemo(
    () => ({
      open: items.filter((i) => i.status !== "Resolved").length,
      inProgress: items.filter((i) => i.status === "Ongoing").length,
      resolved: items.filter((i) => i.status === "Resolved" && isToday(i.resolvedAt)).length,
      critical: items.filter((i) => i.priority === "High" && i.status !== "Resolved").length,
    }),
    [items]
  );

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return items.filter((i) => {
      if (filters.priority !== "All" && i.priority !== filters.priority) return false;
      if (filters.status !== "All" && i.status !== filters.status) return false;
      if (filters.category !== "All" && i.category !== filters.category) return false;
      if (!q) return true;
      return (
        i.employee.name.toLowerCase().includes(q) ||
        i.subject.toLowerCase().includes(q) ||
        i.category.toLowerCase().includes(q)
      );
    });
  }, [items, search, filters]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const currentPage = Math.min(page, totalPages);
  const pageItems = filtered.slice((currentPage - 1) * PAGE_SIZE, currentPage * PAGE_SIZE);
  const selected = items.find((i) => i.id === selectedId) || null;

  const handleSearch = (value) => {
    setSearch(value);
    setPage(1);
  };

  const handleFilters = (next) => {
    setFilters(next);
    setPage(1);
  };

  const updateStatus = useCallback((id, status) => {
    setItems((prev) =>
      prev.map((i) =>
        i.id === id
          ? { ...i, status, resolvedAt: status === "Resolved" ? new Date().toISOString() : null }
          : i
      )
    );
  }, []);

  return (
    <div className="min-h-full bg-black p-6 text-white">
      <header className="mb-5">
        <h1 className="text-3xl font-medium text-white">
          {getGreeting(now)}, <span className="text-red-600">{displayName}</span>
        </h1>
        <p className="mt-1 text-sm text-neutral-300">It&rsquo;s {formatLongDate(now)}.</p>
      </header>

      <StatCards stats={stats} yesterday={{ open: 0, inProgress: 0, resolved: 0, critical: 0 }} />

      <div className="mt-4 flex flex-col gap-4 lg:flex-row">
        <EscalationQueue
          items={pageItems}
          search={search}
          onSearch={handleSearch}
          filters={filters}
          onFiltersChange={handleFilters}
          onFiltersReset={() => handleFilters(DEFAULT_FILTERS)}
          selectedId={selectedId}
          onSelect={setSelectedId}
          onStatusChange={updateStatus}
          page={currentPage}
          totalPages={totalPages}
          onPageChange={setPage}
        />

        <EscalationDetailPanel
          item={selected}
          onClose={() => setSelectedId(null)}
          onStatusChange={updateStatus}
        />
      </div>
    </div>
  );
}
