import { useCallback, useEffect, useState } from "react";
import { Check, Loader2, RefreshCw, X } from "lucide-react";

import { usersService } from "@/services/usersService";

const formatDate = (value) => {
  if (!value) return "-";

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "-";

  return date.toLocaleString(undefined, {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
};

export default function AdminApprovalsPage() {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  // Id of the request currently being approved / rejected.
  const [busyId, setBusyId] = useState(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError("");

    try {
      const items = await usersService.pending();
      setRequests(Array.isArray(items) ? items : []);
    } catch (err) {
      setError(err?.message || "Unable to load signup requests.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const review = async (id, action) => {
    if (busyId) return;

    setBusyId(id);
    setError("");

    try {
      if (action === "approve") {
        await usersService.approve(id);
      } else {
        await usersService.reject(id);
      }

      setRequests((current) => current.filter((item) => item.id !== id));
    } catch (err) {
      setError(err?.message || "Action failed. Please try again.");
    } finally {
      setBusyId(null);
    }
  };

  return (
    <div className="min-h-full bg-black p-6 text-white">
      <header className="mb-5 flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-3xl font-medium text-white">
            Signup <span className="text-red-600">Approvals</span>
          </h1>
          <p className="mt-1 text-sm text-neutral-300">
            Employees can log in only after you approve their request.
          </p>
        </div>

        <button
          type="button"
          onClick={load}
          disabled={loading}
          className="flex items-center gap-2 rounded-md border border-[#333] bg-[#0b0b0b] px-4 py-2 text-sm text-white transition hover:border-red-700 disabled:opacity-60"
        >
          <RefreshCw size={16} className={loading ? "animate-spin" : ""} />
          Refresh
        </button>
      </header>

      {error && (
        <p
          role="alert"
          className="mb-4 rounded border border-red-900/70 bg-red-950/40 px-4 py-3 text-sm text-red-400"
        >
          {error}
        </p>
      )}

      <div className="rounded-md border border-[#222] bg-[#0b0b0b]">
        <div className="border-b border-[#222] px-4 py-3 text-sm text-neutral-300">
          Pending requests:{" "}
          <span className="font-semibold text-white">{requests.length}</span>
        </div>

        {loading ? (
          <div className="flex items-center justify-center gap-2 px-4 py-12 text-neutral-400">
            <Loader2 size={18} className="animate-spin" />
            Loading...
          </div>
        ) : requests.length === 0 ? (
          <p className="px-4 py-12 text-center text-neutral-400">
            No pending signup requests.
          </p>
        ) : (
          <ul className="divide-y divide-[#222]">
            {requests.map((item) => {
              const isBusy = busyId === item.id;

              return (
                <li
                  key={item.id}
                  className="flex flex-wrap items-center justify-between gap-4 px-4 py-4"
                >
                  <div className="min-w-0">
                    <p className="truncate text-base font-medium text-white">
                      {item.name || "Unnamed"}
                    </p>
                    <p className="truncate text-sm text-neutral-400">
                      {item.email}
                    </p>
                    <p className="mt-1 text-xs text-neutral-500">
                      Requested: {formatDate(item.createdAt)}
                    </p>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => review(item.id, "approve")}
                      disabled={!!busyId}
                      className="flex items-center gap-1.5 rounded-md bg-emerald-700 px-4 py-2 text-sm font-medium text-white transition hover:bg-emerald-600 disabled:cursor-not-allowed disabled:opacity-60"
                    >
                      {isBusy ? (
                        <Loader2 size={16} className="animate-spin" />
                      ) : (
                        <Check size={16} />
                      )}
                      Approve
                    </button>

                    <button
                      type="button"
                      onClick={() => review(item.id, "reject")}
                      disabled={!!busyId}
                      className="flex items-center gap-1.5 rounded-md border border-red-800 px-4 py-2 text-sm font-medium text-red-400 transition hover:bg-red-950/50 disabled:cursor-not-allowed disabled:opacity-60"
                    >
                      <X size={16} />
                      Reject
                    </button>
                  </div>
                </li>
              );
            })}
          </ul>
        )}
      </div>
    </div>
  );
}