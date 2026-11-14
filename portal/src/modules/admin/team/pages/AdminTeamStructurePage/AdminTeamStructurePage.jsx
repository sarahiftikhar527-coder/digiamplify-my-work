import { useCallback, useEffect, useMemo, useState } from "react";
import { Loader2, RefreshCw, Search, Users } from "lucide-react";

import { usersService } from "@/services/usersService";
import {
  LEADER_POSITIONS,
  POSITION_DESCRIPTIONS,
  getPositionLabel,
} from "@/constants/positions";
import {
  LeaderSelect,
  PositionSelect,
} from "../../components/StructureSelects.jsx";

const MAX_TREE_DEPTH = 12;

function StatCard({ label, value }) {
  return (
    <div className="rounded-xl border border-white/10 bg-[#0b0b0b] px-5 py-4">
      <p className="text-xs uppercase tracking-wide text-neutral-500">
        {label}
      </p>
      <p className="mt-1 text-2xl font-semibold text-white">{value}</p>
    </div>
  );
}

// One person in the reporting tree, with everyone below them.
function TreeNode({ person, childrenOf, depth = 0 }) {
  const reports = childrenOf.get(person.id) || [];

  return (
    <li>
      <div className="flex items-center gap-3 rounded-lg px-2 py-1.5 hover:bg-white/[0.03]">
        <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-[#c1121f] text-xs font-semibold text-white">
          {(person.name || "?").slice(0, 1).toUpperCase()}
        </span>

        <div className="min-w-0">
          <p className="truncate text-sm text-white">{person.name}</p>
          <p className="truncate text-xs text-neutral-500">
            {getPositionLabel(person.position)}
            {reports.length > 0 && ` - ${reports.length} direct report${reports.length > 1 ? "s" : ""}`}
          </p>
        </div>
      </div>

      {reports.length > 0 && depth < MAX_TREE_DEPTH && (
        <ul className="ml-4 border-l border-[#2a2a2a] pl-4">
          {reports.map((child) => (
            <TreeNode
              key={child.id}
              person={child}
              childrenOf={childrenOf}
              depth={depth + 1}
            />
          ))}
        </ul>
      )}
    </li>
  );
}

/**
 * Admin screen: set the role of every person and who they report to.
 * The reporting line decides who can assign tasks to whom.
 */
export default function AdminTeamStructurePage() {
  const [people, setPeople] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");
  const [savingId, setSavingId] = useState(null);
  const [search, setSearch] = useState("");

  const load = useCallback(async (silent = false) => {
    if (!silent) setLoading(true);
    setError("");

    try {
      const result = await usersService.list({ page: 1, limit: 100 });
      const list = result?.employees?.employees || [];

      setPeople(
        list.filter(
          (person) =>
            String(person.status || "active") === "active" &&
            person.isDeleted !== true
        )
      );
    } catch (err) {
      setError(err?.message || "Unable to load people.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const leaders = useMemo(
    () =>
      people
        .filter((person) => LEADER_POSITIONS.includes(person.position))
        .map((person) => ({
          id: person.id,
          name: person.name,
          positionLabel: getPositionLabel(person.position),
        })),
    [people]
  );

  const childrenOf = useMemo(() => {
    const map = new Map();
    const ids = new Set(people.map((person) => person.id));

    for (const person of people) {
      if (!person.managerId || !ids.has(person.managerId)) continue;

      if (!map.has(person.managerId)) map.set(person.managerId, []);
      map.get(person.managerId).push(person);
    }

    return map;
  }, [people]);

  const roots = useMemo(() => {
    const ids = new Set(people.map((person) => person.id));

    return people.filter(
      (person) => !person.managerId || !ids.has(person.managerId)
    );
  }, [people]);

  const visible = useMemo(() => {
    const term = search.trim().toLowerCase();

    if (!term) return people;

    return people.filter(
      (person) =>
        String(person.name || "").toLowerCase().includes(term) ||
        String(person.email || "").toLowerCase().includes(term)
    );
  }, [people, search]);

  const save = async (person, patch) => {
    if (savingId) return;

    setSavingId(person.id);
    setError("");
    setNotice("");

    try {
      await usersService.setStructure(person.id, patch);

      setNotice(`Saved changes for ${person.name}.`);

      // Reload quietly: changing a role can also clear the people who
      // reported to that person.
      await load(true);
    } catch (err) {
      setError(err?.message || "Unable to save the change.");
    } finally {
      setSavingId(null);
    }
  };

  const unassigned = people.filter(
    (person) => !person.managerId && person.position === "employee"
  ).length;

  return (
    <div className="min-h-full bg-black p-6 text-white">
      <header className="mb-6 flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-3xl font-medium text-white">
            Roles & <span className="text-red-600">Hierarchy</span>
          </h1>
          <p className="mt-1 max-w-2xl text-sm text-neutral-300">
            Choose each person&apos;s role and who they report to. A leader can
            assign tasks to everyone below them. A Project Manager can assign
            tasks to every employee.
          </p>
        </div>

        <button
          type="button"
          onClick={() => load()}
          disabled={loading}
          className="flex items-center gap-2 rounded-md border border-[#333] bg-[#0b0b0b] px-4 py-2 text-sm text-white transition hover:border-red-700 disabled:opacity-60"
        >
          <RefreshCw size={16} className={loading ? "animate-spin" : ""} />
          Refresh
        </button>
      </header>

      <div className="mb-6 grid gap-4 sm:grid-cols-3">
        <StatCard label="People" value={people.length} />
        <StatCard label="Leaders" value={leaders.length} />
        <StatCard label="Employees without a leader" value={unassigned} />
      </div>

      {error && (
        <p
          role="alert"
          className="mb-4 rounded border border-red-900/70 bg-red-950/40 px-4 py-3 text-sm text-red-400"
        >
          {error}
        </p>
      )}

      {notice && !error && (
        <p
          role="status"
          className="mb-4 rounded border border-emerald-900/70 bg-emerald-950/30 px-4 py-3 text-sm text-emerald-400"
        >
          {notice}
        </p>
      )}

      <div className="grid gap-6 xl:grid-cols-[minmax(0,1.6fr)_minmax(0,1fr)]">
        {/* People table */}
        <section className="rounded-md border border-[#222] bg-[#0b0b0b]">
          <div className="flex flex-wrap items-center justify-between gap-3 border-b border-[#222] px-4 py-3">
            <h2 className="text-sm font-semibold text-white">People</h2>

            <div className="relative">
              <Search
                size={15}
                className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-neutral-500"
              />
              <input
                type="search"
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                placeholder="Search by name or email"
                className="w-64 rounded-md border border-[#333] bg-black py-2 pl-9 pr-3 text-sm text-white outline-none transition focus:border-red-700"
              />
            </div>
          </div>

          {loading ? (
            <div className="flex items-center justify-center gap-2 px-4 py-12 text-neutral-400">
              <Loader2 size={18} className="animate-spin" />
              Loading...
            </div>
          ) : visible.length === 0 ? (
            <p className="px-4 py-12 text-center text-neutral-400">
              No people found.
            </p>
          ) : (
            <ul className="divide-y divide-[#222]">
              {visible.map((person) => {
                const isSaving = savingId === person.id;

                return (
                  <li
                    key={person.id}
                    className="flex flex-wrap items-center justify-between gap-4 px-4 py-4"
                  >
                    <div className="min-w-0">
                      <p className="truncate text-base font-medium text-white">
                        {person.name}
                      </p>
                      <p className="truncate text-sm text-neutral-400">
                        {person.email}
                      </p>
                      <p className="mt-1 max-w-xs text-xs text-neutral-500">
                        {POSITION_DESCRIPTIONS[person.position] ||
                          POSITION_DESCRIPTIONS.employee}
                      </p>
                    </div>

                    <div className="flex flex-wrap items-end gap-3">
                      <label className="flex flex-col gap-1 text-xs text-neutral-400">
                        Role
                        <PositionSelect
                          value={person.position || "employee"}
                          disabled={!!savingId}
                          onChange={(position) => save(person, { position })}
                        />
                      </label>

                      <label className="flex flex-col gap-1 text-xs text-neutral-400">
                        Reports to
                        <LeaderSelect
                          value={person.managerId || ""}
                          leaders={leaders}
                          excludeId={person.id}
                          disabled={!!savingId}
                          onChange={(managerId) =>
                            save(person, { managerId: managerId || null })
                          }
                        />
                      </label>

                      <span className="flex h-[38px] w-5 items-center">
                        {isSaving && (
                          <Loader2
                            size={16}
                            className="animate-spin text-neutral-400"
                          />
                        )}
                      </span>
                    </div>
                  </li>
                );
              })}
            </ul>
          )}
        </section>

        {/* Reporting tree */}
        <section className="h-fit rounded-md border border-[#222] bg-[#0b0b0b]">
          <div className="flex items-center gap-2 border-b border-[#222] px-4 py-3">
            <Users size={16} className="text-red-600" />
            <h2 className="text-sm font-semibold text-white">
              Reporting tree
            </h2>
          </div>

          <div className="max-h-[640px] overflow-y-auto p-3">
            {loading ? (
              <p className="px-2 py-6 text-center text-sm text-neutral-500">
                Loading...
              </p>
            ) : roots.length === 0 ? (
              <p className="px-2 py-6 text-center text-sm text-neutral-500">
                No people yet.
              </p>
            ) : (
              <ul className="space-y-1">
                {roots.map((person) => (
                  <TreeNode
                    key={person.id}
                    person={person}
                    childrenOf={childrenOf}
                  />
                ))}
              </ul>
            )}
          </div>
        </section>
      </div>
    </div>
  );
}