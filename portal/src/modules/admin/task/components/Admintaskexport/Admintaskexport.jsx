import { useEffect, useMemo, useRef, useState } from "react";
import apiClient from "@/services/api/apiClient.js";
import { downloadTaskReport } from "../../utils/exportTaskReport.js";

const field =
  "rounded border border-[#2a2a2a] bg-[#0d0d0d] px-3 py-2 text-sm text-white outline-none focus:border-red-700";

const toKey = (date) => date.toLocaleDateString("en-CA");

const todayKey = () => toKey(new Date());

const daysAgo = (amount) => {
  const date = new Date();
  date.setDate(date.getDate() - amount);
  return toKey(date);
};

const monthStart = () => {
  const date = new Date();
  date.setDate(1);
  return toKey(date);
};

const PRESETS = [
  { id: "today", label: "Today", from: () => todayKey() },
  { id: "7", label: "7 days", from: () => daysAgo(6) },
  { id: "30", label: "30 days", from: () => daysAgo(29) },
  { id: "month", label: "This month", from: () => monthStart() },
];

export default function AdminTaskExport({ employees = [], onNotice }) {
  const [from, setFrom] = useState(monthStart());
  const [to, setTo] = useState(todayKey());
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [busy, setBusy] = useState("");
  const wrapperRef = useRef(null);

  useEffect(() => {
    if (!open) return undefined;

    const onClick = (event) => {
      if (wrapperRef.current && !wrapperRef.current.contains(event.target)) {
        setOpen(false);
      }
    };

    document.addEventListener("mousedown", onClick);
    return () => document.removeEventListener("mousedown", onClick);
  }, [open]);

  const visibleEmployees = useMemo(() => {
    const text = query.trim().toLowerCase();

    if (!text) return employees;

    return employees.filter((employee) =>
      `${employee.name} ${employee.email || ""}`.toLowerCase().includes(text)
    );
  }, [employees, query]);

  const applyPreset = (preset) => {
    setFrom(preset.from());
    setTo(todayKey());
  };

  const download = async (employee = null) => {
    if (!from || !to || from > to) {
      onNotice?.("Please choose a valid date range for the report.");
      return;
    }

    setOpen(false);
    setBusy(employee ? employee.id : "all");

    try {
      const response = await apiClient.get("/tasks/admin/report", {
        params: { from, to, ...(employee ? { employeeId: employee.id } : {}) },
      });

      const report = response?.data;

      if (!report || !Array.isArray(report.employees)) {
        throw new Error("The server returned an invalid report.");
      }

      const fileName = downloadTaskReport(report, { employee });

      onNotice?.(`Downloaded ${fileName}`);
    } catch (requestError) {
      onNotice?.(
        requestError?.response?.data?.message ||
          requestError?.message ||
          "Unable to download the report."
      );
    } finally {
      setBusy("");
    }
  };

  return (
    <div className="flex flex-wrap items-center gap-2">
      <div className="hidden items-center gap-1 lg:flex">
        {PRESETS.map((preset) => (
          <button
            key={preset.id}
            type="button"
            onClick={() => applyPreset(preset)}
            className="rounded-full border border-white/10 px-2.5 py-1 text-[11px] text-neutral-300 transition hover:border-red-700 hover:text-white"
          >
            {preset.label}
          </button>
        ))}
      </div>

      <input
        type="date"
        aria-label="Report from"
        className={field}
        value={from}
        max={to || todayKey()}
        onChange={(event) => setFrom(event.target.value)}
      />
      <span className="text-xs text-neutral-500">to</span>
      <input
        type="date"
        aria-label="Report to"
        className={field}
        value={to}
        min={from}
        max={todayKey()}
        onChange={(event) => setTo(event.target.value)}
      />

      <div ref={wrapperRef} className="relative">
        <button
          type="button"
          disabled={Boolean(busy)}
          onClick={() => setOpen((value) => !value)}
          className="inline-flex items-center gap-2 rounded-lg bg-gradient-to-r from-red-700 to-red-600 px-4 py-2 text-sm font-semibold text-white transition hover:from-red-600 hover:to-red-500 disabled:cursor-not-allowed disabled:opacity-60"
        >
          <svg
            width="15"
            height="15"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            aria-hidden="true"
          >
            <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
            <polyline points="7 10 12 15 17 10" />
            <line x1="12" y1="15" x2="12" y2="3" />
          </svg>
          {busy ? "Preparing Excel..." : "Download Excel"}
        </button>

        {open && (
          <div className="absolute right-0 z-30 mt-2 w-72 overflow-hidden rounded-lg border border-[#2a2a2a] bg-[#0b0b0b] shadow-xl">
            <button
              type="button"
              onClick={() => download(null)}
              className="block w-full border-b border-[#2a2a2a] px-4 py-3 text-left hover:bg-white/5"
            >
              <span className="block text-sm font-medium text-white">
                Overall report
              </span>
              <span className="block text-[11px] text-neutral-500">
                All employees in one Excel file
              </span>
            </button>

            <div className="p-2">
              <p className="px-2 pb-1 text-[11px] uppercase tracking-wide text-neutral-500">
                Individual report
              </p>
              <input
                className={`${field} mb-2 w-full py-1.5 text-xs`}
                placeholder="Search employee"
                value={query}
                onChange={(event) => setQuery(event.target.value)}
              />

              <div className="max-h-60 overflow-y-auto">
                {visibleEmployees.length === 0 ? (
                  <p className="px-2 py-3 text-xs text-neutral-500">
                    No employees found.
                  </p>
                ) : (
                  visibleEmployees.map((employee) => (
                    <button
                      key={employee.id}
                      type="button"
                      onClick={() => download(employee)}
                      className="flex w-full items-center justify-between gap-2 rounded px-2 py-2 text-left hover:bg-white/5"
                    >
                      <span className="min-w-0">
                        <span className="block truncate text-sm text-white">
                          {employee.name}
                        </span>
                        <span className="block truncate text-[11px] text-neutral-500">
                          {employee.role}
                        </span>
                      </span>
                      <span className="text-[11px] text-red-400">.xlsx</span>
                    </button>
                  ))
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}