
import { useEffect, useMemo, useRef, useState } from 'react';
import {
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  Search,
  SlidersHorizontal,
} from 'lucide-react';

const PAGE_SIZE = 5;

const money = (value) => {
  if (value == null || value === '') return '—';

  const amount = Number(value);

  if (!Number.isFinite(amount)) return '—';

  return `PKR ${amount.toLocaleString('en-PK')}`;
};

const initials = (name = '') =>
  String(name)
    .trim()
    .split(/\s+/)
    .filter(Boolean)
    .map((part) => part[0])
    .slice(0, 2)
    .join('')
    .toUpperCase() || 'NA';

const formatDate = (value) => {
  if (!value) return '—';

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) return String(value);

  return date.toLocaleDateString('en-GB', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    timeZone: 'UTC',
  });
};

const selectCls =
  'w-full rounded border border-[#2a2a2a] bg-black px-2 py-1.5 text-xs focus:border-red-600 focus:outline-none';

function BankLogo() {
  return (
    <svg
      viewBox="0 0 24 24"
      className="h-6 w-6 shrink-0"
      aria-hidden="true"
    >
      <circle
        cx="12"
        cy="12"
        r="11"
        fill="#0b2a5b"
        stroke="#6aa6e8"
      />
      <path
        d="M12 5l2 4.5 5 .6-3.7 3.4 1 4.9L12 15.8 7.7 18.4l1-4.9L5 10.1l5-.6z"
        fill="#cfe3ff"
      />
    </svg>
  );
}

function StatusBadge({ status }) {
  const completed = String(status || '').toLowerCase() === 'completed';

  const cls = completed
    ? 'border-emerald-600 bg-emerald-500/10 text-emerald-400'
    : 'border-amber-600 bg-amber-500/10 text-amber-400';

  return (
    <span
      className={`inline-block rounded border px-2.5 py-1 text-[10px] ${cls}`}
    >
      {status || 'Unknown'}
    </span>
  );
}

function Person({ r }) {
  return (
    <div className="flex items-center gap-2.5 text-left">
      <span className="grid h-6 w-6 shrink-0 place-items-center rounded-full bg-neutral-300 text-[9px] font-semibold text-neutral-800">
        {initials(r.name)}
      </span>

      <span className="min-w-0 leading-tight">
        <span className="block truncate text-[11px] font-medium">
          {r.name || 'Unknown employee'}
        </span>

        <span className="block truncate text-[9px] text-neutral-400">
          {r.role || '—'}
        </span>
      </span>
    </div>
  );
}

function Bank({ r }) {
  return (
    <div className="flex items-center justify-center gap-2 text-left">
      <BankLogo />

      <span className="min-w-0 leading-tight">
        <span className="block truncate text-[10px]">
          {r.bank || 'Not provided'}
        </span>

        <span className="block truncate text-[9px] text-neutral-400">
          {r.account || '—'}
        </span>
      </span>
    </div>
  );
}

function Details({ r }) {
  const netPay =
    r.netPay != null
      ? Number(r.netPay)
      : Number(r.salary || 0) +
        Number(r.bonus || 0) -
        Number(r.deduction || 0);

  const items = [
    ['Net pay', money(netPay)],
    ['Bank account', `${r.bank || 'Not provided'} ${r.account || ''}`.trim()],
    ['Payment date', formatDate(r.paymentDate || r.date)],
    ['Employee ID', r.employeeId || r.id || '—'],
    ['Payroll period', r.periodMonth && r.periodYear
      ? `${String(r.periodMonth).padStart(2, '0')}/${r.periodYear}`
      : '—'],
    ['Department', r.department || '—'],
    ['Status', r.status || '—'],
    ['Notes', r.notes || '—'],
  ];

  return (
    <dl className="grid grid-cols-2 gap-x-6 gap-y-3 text-[11px] sm:grid-cols-4">
      {items.map(([label, value]) => (
        <div key={label} className="min-w-0">
          <dt className="text-neutral-400">{label}</dt>
          <dd className="break-words font-medium">{value}</dd>
        </div>
      ))}
    </dl>
  );
}

function Chevron({ open, onClick, label }) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-expanded={open}
      aria-label={label}
      className="grid h-6 w-6 place-items-center rounded hover:bg-white/10 focus-visible:outline focus-visible:outline-2 focus-visible:outline-red-500"
    >
      <ChevronDown
        size={14}
        className={`transition-transform ${open ? 'rotate-180' : ''}`}
      />
    </button>
  );
}

export default function PayrollTable({
  employees = [],
  departments: backendDepartments = [],
  pagination: backendPagination,
  loading = false,
  onSearchChange,
  onFiltersChange,
  onPageChange,
}) {
  const [query, setQuery] = useState('');
  const [filters, setFilters] = useState({
    status: 'All',
    department: 'All',
  });
  const [filterOpen, setFilterOpen] = useState(false);
  const [page, setPage] = useState(1);
  const [expanded, setExpanded] = useState(null);

  const popRef = useRef(null);
  const serverPagination = Boolean(backendPagination);
  const serverMode = serverPagination && typeof onPageChange === 'function';

  const employeeList = Array.isArray(employees) ? employees : [];

  const departments = useMemo(() => {
    const values = Array.isArray(backendDepartments)
      ? backendDepartments
      : [];

    const combined = [
      ...values,
      ...employeeList.map((employee) => employee.department),
    ]
      .filter(Boolean)
      .map(String);

    return ['All', ...new Set(combined)];
  }, [backendDepartments, employeeList]);

  const activeFilters =
    Number(filters.status !== 'All') +
    Number(filters.department !== 'All');

  useEffect(() => {
    if (!filterOpen) return undefined;

    const onDown = (event) => {
      if (!popRef.current?.contains(event.target)) {
        setFilterOpen(false);
      }
    };

    const onKey = (event) => {
      if (event.key === 'Escape') setFilterOpen(false);
    };

    document.addEventListener('mousedown', onDown);
    document.addEventListener('keydown', onKey);

    return () => {
      document.removeEventListener('mousedown', onDown);
      document.removeEventListener('keydown', onKey);
    };
  }, [filterOpen]);

  const filtered = useMemo(() => {
    if (serverMode) return employeeList;

    const searchTerm = query.trim().toLowerCase();

    return employeeList.filter((employee) => {
      const name = String(employee.name || '').toLowerCase();
      const role = String(employee.role || '').toLowerCase();
      const department = String(employee.department || '');
      const status = String(employee.status || '');

      const matchesSearch =
        !searchTerm ||
        name.includes(searchTerm) ||
        role.includes(searchTerm) ||
        department.toLowerCase().includes(searchTerm);

      const matchesStatus =
        filters.status === 'All' || status === filters.status;

      const matchesDepartment =
        filters.department === 'All' ||
        department === filters.department;

      return matchesSearch && matchesStatus && matchesDepartment;
    });
  }, [employeeList, query, filters, serverMode]);

  const total = serverPagination
    ? Number(backendPagination?.total ?? filtered.length)
    : filtered.length;

  const totalPages = Math.max(
    1,
    serverPagination
      ? Number(backendPagination?.totalPages ?? 1)
      : Math.ceil(filtered.length / PAGE_SIZE)
  );

  const current = Math.min(
    Math.max(1, Number(backendPagination?.page ?? page)),
    totalPages
  );

  const rows = serverPagination
    ? filtered
    : filtered.slice((current - 1) * PAGE_SIZE, current * PAGE_SIZE);

  const toggle = (id) => {
    setExpanded((currentId) => (currentId === id ? null : id));
  };

  const handleSearch = (value) => {
    setQuery(value);
    setPage(1);
    setExpanded(null);
    onSearchChange?.(value);
  };

  const handleFilter = (patch) => {
    const nextFilters = { ...filters, ...patch };

    setFilters(nextFilters);
    setPage(1);
    setExpanded(null);
    onFiltersChange?.(nextFilters);
  };

  const resetFilters = () => {
    const reset = { status: 'All', department: 'All' };

    setFilters(reset);
    setQuery('');
    setPage(1);
    setExpanded(null);
    onFiltersChange?.(reset);
    onSearchChange?.('');
  };

  const changePage = (nextPage) => {
    const safePage = Math.max(1, Math.min(totalPages, nextPage));

    setPage(safePage);
    setExpanded(null);
    onPageChange?.(safePage);
  };

  return (
    <section
      className="rounded-lg border border-[#232323] bg-[#0a0a0a] p-4 sm:p-5"
      aria-labelledby="perf-title"
    >
      <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
        <h2 id="perf-title" className="text-xs font-semibold">
          Employee Performance Overview
        </h2>

        <div className="flex w-full items-center gap-2 sm:w-auto">
          <label className="relative flex-1 sm:w-56 sm:flex-none">
            <span className="sr-only">Search employee</span>

            <Search
              size={13}
              className="pointer-events-none absolute left-2.5 top-1/2 -translate-y-1/2 text-neutral-400"
            />

            <input
              value={query}
              onChange={(event) => handleSearch(event.target.value)}
              placeholder="Search employee"
              className="w-full rounded border border-[#2a2a2a] bg-black py-1.5 pl-8 pr-3 text-xs placeholder:text-neutral-500 focus:border-red-600 focus:outline-none"
            />
          </label>

          <div ref={popRef} className="relative">
            <button
              type="button"
              onClick={() => setFilterOpen((open) => !open)}
              aria-expanded={filterOpen}
              className="flex items-center gap-2 rounded border border-[#2a2a2a] bg-black px-3 py-1.5 text-xs hover:bg-white/5 focus-visible:outline focus-visible:outline-2 focus-visible:outline-red-500"
            >
              Filter
              <SlidersHorizontal size={13} />

              {activeFilters > 0 && (
                <span className="grid h-4 w-4 place-items-center rounded-full bg-[#c1121f] text-[9px]">
                  {activeFilters}
                </span>
              )}
            </button>

            {filterOpen && (
              <div className="absolute right-0 top-full z-20 mt-2 w-56 space-y-3 rounded-lg border border-[#2a2a2a] bg-[#0f0f0f] p-3 shadow-xl">
                <label className="block text-[11px] text-neutral-300">
                  Status
                  <select
                    value={filters.status}
                    onChange={(event) =>
                      handleFilter({ status: event.target.value })
                    }
                    className={`${selectCls} mt-1`}
                  >
                    {['All', 'Completed', 'Pending'].map((status) => (
                      <option key={status} value={status}>
                        {status}
                      </option>
                    ))}
                  </select>
                </label>

                <label className="block text-[11px] text-neutral-300">
                  Department
                  <select
                    value={filters.department}
                    onChange={(event) =>
                      handleFilter({ department: event.target.value })
                    }
                    className={`${selectCls} mt-1`}
                  >
                    {departments.map((department) => (
                      <option key={department} value={department}>
                        {department}
                      </option>
                    ))}
                  </select>
                </label>

                <button
                  type="button"
                  onClick={resetFilters}
                  className="w-full rounded border border-[#2a2a2a] py-1.5 text-xs hover:bg-white/10"
                >
                  Reset filters
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {loading ? (
        <div className="flex min-h-36 items-center justify-center text-xs text-neutral-400">
          Loading payroll records...
        </div>
      ) : (
        <>
          <div className="hidden overflow-hidden rounded-lg border border-[#232323] md:block">
            <table className="w-full text-[11px]">
              <thead>
                <tr className="bg-[#0f0f0f] text-neutral-300">
                  {[
                    'Employee',
                    'Department',
                    'Salary',
                    'Bonus',
                    'Deduction',
                    'Bank',
                    'Date',
                    'Status',
                  ].map((heading, index) => (
                    <th
                      key={heading}
                      scope="col"
                      className={`px-4 py-3 font-medium ${
                        index === 0 ? 'text-left' : 'text-center'
                      }`}
                    >
                      {heading}
                    </th>
                  ))}

                  <th className="w-10" aria-label="Expand" />
                </tr>
              </thead>

              <tbody>
                {rows.map((record, index) => {
                  const id = record.id ?? record.employeeId ?? index;

                  return (
                    <FragmentRow
                      key={id}
                      r={record}
                      open={expanded === id}
                      onToggle={() => toggle(id)}
                    />
                  );
                })}

                {rows.length === 0 && (
                  <tr>
                    <td
                      colSpan={9}
                      className="py-10 text-center text-xs text-neutral-400"
                    >
                      No payroll records match your search or filters.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          <ul className="space-y-3 md:hidden">
            {rows.map((record, index) => {
              const id = record.id ?? record.employeeId ?? index;

              return (
                <li
                  key={id}
                  className="rounded-lg border border-[#232323] bg-black p-3"
                >
                  <div className="flex items-center justify-between gap-2">
                    <Person r={record} />

                    <div className="flex items-center gap-1">
                      <StatusBadge status={record.status} />

                      <Chevron
                        open={expanded === id}
                        onClick={() => toggle(id)}
                        label={`Details for ${record.name || 'employee'}`}
                      />
                    </div>
                  </div>

                  <dl className="mt-3 grid grid-cols-3 gap-2 text-[10px]">
                    {[
                      ['Dept', record.department || '—'],
                      ['Salary', money(record.salary)],
                      ['Bonus', money(record.bonus)],
                      ['Deduction', money(record.deduction)],
                      ['Date', formatDate(record.paymentDate || record.date)],
                      ['Bank', record.bank || '—'],
                    ].map(([label, value]) => (
                      <div key={label} className="min-w-0">
                        <dt className="text-neutral-400">{label}</dt>
                        <dd className="truncate">{value}</dd>
                      </div>
                    ))}
                  </dl>

                  {expanded === id && (
                    <div className="mt-3 border-t border-[#232323] pt-3">
                      <Details r={record} />
                    </div>
                  )}
                </li>
              );
            })}

            {rows.length === 0 && (
              <li className="py-8 text-center text-xs text-neutral-400">
                No payroll records match your search or filters.
              </li>
            )}
          </ul>
        </>
      )}

      <div className="mt-4 flex flex-wrap items-center justify-between gap-3 text-[10px] text-neutral-300">
        <span>
          Showing {total === 0 ? 0 : serverPagination ? rows.length : Math.min((current - 1) * PAGE_SIZE + 1, total)}
          {total > 0 && !serverPagination
            ? `–${Math.min(current * PAGE_SIZE, total)}`
            : ''}
          {' '}of {total} records
        </span>

        <nav
          className="flex items-center gap-1.5"
          aria-label="Pagination"
        >
          <button
            type="button"
            onClick={() => changePage(current - 1)}
            disabled={current === 1 || loading}
            aria-label="Previous page"
            className="grid h-6 w-6 place-items-center rounded hover:bg-white/10 disabled:opacity-30"
          >
            <ChevronLeft size={13} />
          </button>

          {Array.from({ length: totalPages }, (_, index) => index + 1).map(
            (pageNumber) => (
              <button
                key={pageNumber}
                type="button"
                onClick={() => changePage(pageNumber)}
                disabled={loading}
                aria-current={pageNumber === current ? 'page' : undefined}
                className={`grid h-6 w-6 place-items-center rounded-full border text-[10px] ${
                  pageNumber === current
                    ? 'border-[#c1121f] bg-[#c1121f] text-white'
                    : 'border-[#2a2a2a] hover:bg-white/10'
                }`}
              >
                {pageNumber}
              </button>
            )
          )}

          <button
            type="button"
            onClick={() => changePage(current + 1)}
            disabled={current === totalPages || loading}
            aria-label="Next page"
            className="grid h-6 w-6 place-items-center rounded hover:bg-white/10 disabled:opacity-30"
          >
            <ChevronRight size={13} />
          </button>
        </nav>
      </div>
    </section>
  );
}

function FragmentRow({ r, open, onToggle }) {
  return (
    <>
      <tr className="border-t border-[#232323] hover:bg-white/[0.02]">
        <td className="px-4 py-3">
          <Person r={r} />
        </td>

        <td className="px-4 py-3 text-center">
          {r.department || '—'}
        </td>

        <td className="px-4 py-3 text-center">
          {money(r.salary)}
        </td>

        <td className="px-4 py-3 text-center">
          {money(r.bonus)}
        </td>

        <td className="px-4 py-3 text-center">
          {money(r.deduction)}
        </td>

        <td className="px-4 py-3">
          <Bank r={r} />
        </td>

        <td className="px-4 py-3 text-center">
          {formatDate(r.paymentDate || r.date)}
        </td>

        <td className="px-4 py-3 text-center">
          <StatusBadge status={r.status} />
        </td>

        <td className="pr-3">
          <Chevron
            open={open}
            onClick={onToggle}
            label={`Details for ${r.name || 'employee'}`}
          />
        </td>
      </tr>

      {open && (
        <tr className="border-t border-[#232323] bg-[#0f0f0f]">
          <td colSpan={9} className="px-4 py-4">
            <Details r={r} />
          </td>
        </tr>
      )}
    </>
  );
}
