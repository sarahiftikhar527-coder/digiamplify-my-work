
import { useCallback, useEffect, useMemo, useState } from "react";
import { Check, Loader2, RefreshCw, X } from "lucide-react";

import { usersService } from "@/services/usersService";
import { useAuth } from "@/context/AuthContext/AuthContext/AuthContext.jsx";
import {
  LEADER_POSITIONS,
  POSITIONS,
  getPositionLabel,
  isAdminUser,
} from "@/constants/positions";
import {
  LeaderSelect,
  PositionSelect,
} from "@/modules/admin/team/components/StructureSelects.jsx";

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

const getPendingItems = (response) => {
  if (Array.isArray(response)) return response;
  if (Array.isArray(response?.requests)) return response.requests;
  if (Array.isArray(response?.data?.requests)) {
    return response.data.requests;
  }
  if (Array.isArray(response?.data?.data?.requests)) {
    return response.data.data.requests;
  }
  if (Array.isArray(response?.employees)) return response.employees;

  return [];
};

export default function SignupApprovalsPanel() {
  const { user } = useAuth();
  const isAdmin = isAdminUser(user);

  const [requests, setRequests] = useState([]);
  const [people, setPeople] = useState([]);
  const [choices, setChoices] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [busyId, setBusyId] = useState(null);

  const leaders = useMemo(
    () =>
      people
        .filter(
          (person) =>
            String(person.status || "active").toLowerCase() === "active" &&
            LEADER_POSITIONS.includes(person.position)
        )
        .map((person) => ({
          id: person.id,
          name: person.name,
          positionLabel: getPositionLabel(person.position),
        })),
    [people]
  );

  const loadPeople = useCallback(async () => {
    if (!isAdmin) return;

    try {
      const response = await usersService.list({
        page: 1,
        limit: 100,
      });

      const data = response?.data ?? response;

      const employees =
        data?.employees?.employees ||
        data?.employees ||
        data?.items ||
        [];

      setPeople(Array.isArray(employees) ? employees : []);
    } catch (err) {
      console.error("Unable to load approval leaders:", err);
      setPeople([]);
    }
  }, [isAdmin]);

  const load = useCallback(async () => {
    setLoading(true);
    setError("");

    try {
      const pending = await usersService.pending();

      const items = getPendingItems(pending);

      setRequests(items);

      setChoices((current) => {
        const next = { ...current };

        for (const item of items) {
          const id = item.id || item._id;

          if (!next[id]) {
            next[id] = {
              position: item.position || POSITIONS.EMPLOYEE,
              managerId: item.managerId || "",
            };
          }
        }

        return next;
      });

      await loadPeople();
    } catch (err) {
      console.error("Signup requests loading error:", err);

      setRequests([]);
      setError(
        err?.response?.data?.message ||
          err?.message ||
          "Unable to load signup requests."
      );
    } finally {
      setLoading(false);
    }
  }, [loadPeople]);

  useEffect(() => {
    load();
  }, [load]);

  const setChoice = (id, patch) => {
    setChoices((current) => ({
      ...current,
      [id]: {
        ...(current[id] || {
          position: POSITIONS.EMPLOYEE,
          managerId: "",
        }),
        ...patch,
      },
    }));
  };

  const review = async (id, action) => {
    if (busyId) return;

    setBusyId(id);
    setError("");

    try {
      if (action === "approve") {
        const choice = choices[id] || {};

        await usersService.approve(
          id,
          isAdmin
            ? {
                position: choice.position || POSITIONS.EMPLOYEE,
                managerId: choice.managerId || null,
              }
            : {}
        );
      } else {
        await usersService.reject(id);
      }

      setRequests((current) =>
        current.filter(
          (item) => (item.id || item._id) !== id
        )
      );

      if (action === "approve") {
        await loadPeople();
      }
    } catch (err) {
      setError(
        err?.response?.data?.message ||
          err?.message ||
          "Action failed. Please try again."
      );
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
            {isAdmin
              ? "People can log in only after you approve their request. Confirm their role and choose who they report to."
              : "People can log in only after their request is approved. Approved people join as Employee; an admin sets their role and reporting line."}
          </p>
        </div>

        <button
          type="button"
          onClick={load}
          disabled={loading}
          className="flex items-center gap-2 rounded-md border border-[#333] bg-[#0b0b0b] px-4 py-2 text-sm text-white transition hover:border-red-700 disabled:opacity-60"
        >
          <RefreshCw
            size={16}
            className={loading ? "animate-spin" : ""}
          />
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
          <span className="font-semibold text-white">
            {requests.length}
          </span>
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
              const id = item.id || item._id;
              const isBusy = busyId === id;

              const choice = choices[id] || {
                position: item.position || POSITIONS.EMPLOYEE,
                managerId: "",
              };

              return (
                <li key={id} className="px-4 py-5">
                  <div className="flex flex-wrap items-start justify-between gap-4">
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

                      <span className="mt-2 inline-block rounded-full border border-[#c1121f]/40 bg-[#c1121f]/10 px-2.5 py-0.5 text-xs text-[#ff7a84]">
                        Asked for: {getPositionLabel(item.position)}
                      </span>
                    </div>

                    <div className="flex flex-wrap items-end gap-3">
                      {isAdmin && (
                        <>
                          <label className="flex flex-col gap-1 text-xs text-neutral-400">
                            Role

                            <PositionSelect
                              value={choice.position}
                              disabled={!!busyId}
                              onChange={(position) =>
                                setChoice(id, { position })
                              }
                            />
                          </label>

                          <label className="flex flex-col gap-1 text-xs text-neutral-400">
                            Reports to

                            <LeaderSelect
                              value={choice.managerId}
                              leaders={leaders}
                              disabled={!!busyId}
                              onChange={(managerId) =>
                                setChoice(id, { managerId })
                              }
                            />
                          </label>
                        </>
                      )}

                      <div className="flex items-center gap-2">
                        <button
                          type="button"
                          onClick={() => review(id, "approve")}
                          disabled={!!busyId}
                          className="flex items-center gap-1.5 rounded-md bg-emerald-700 px-4 py-2 text-sm font-medium text-white transition hover:bg-emerald-600 disabled:cursor-not-allowed disabled:opacity-60"
                        >
                          {isBusy ? (
                            <Loader2
                              size={16}
                              className="animate-spin"
                            />
                          ) : (
                            <Check size={16} />
                          )}

                          Approve
                        </button>

                        <button
                          type="button"
                          onClick={() => review(id, "decline")}
                          disabled={!!busyId}
                          className="flex items-center gap-1.5 rounded-md border border-red-800 px-4 py-2 text-sm font-medium text-red-400 transition hover:bg-red-950/50 disabled:cursor-not-allowed disabled:opacity-60"
                        >
                          <X size={16} />
                          Decline
                        </button>
                      </div>
                    </div>
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
