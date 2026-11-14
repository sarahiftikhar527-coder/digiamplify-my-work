import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useSearchParams } from "react-router-dom";
import {
  AlertTriangle,
  ChevronsDownUp,
  ChevronsUpDown,
  Info,
  Loader2,
  RefreshCw,
  Search,
  X,
} from "lucide-react";

import { hierarchyService } from "@/services/hierarchyService";
import { useAuth } from "@/context/AuthContext/AuthContext/AuthContext.jsx";
import { canManageHierarchy } from "@/constants/positions";
import EmployeeCard from "./EmployeeCard";
import MoveModal from "./MoveModal";
import {
  POSITION_COLORS,
  POSITION_LEGEND,
  ROOT,
  buildIndex,
  checkMove,
  depthOf,
  descendants,
} from "./hierarchyUtils";
import "./hierarchy.css";

const Stat = ({ label, value }) => (
  <div className="rounded-xl border border-white/10 bg-[#0f0f0f] px-4 py-3">
    <p className="text-[11px] font-semibold uppercase tracking-wider text-white/40">{label}</p>
    <p className="mt-1 text-2xl font-semibold text-white">{value}</p>
  </div>
);

const ToolBtn = ({ icon: Icon, children, ...props }) => (
  <button
    type="button"
    {...props}
    className="flex items-center gap-1.5 rounded-lg border border-white/10 bg-[#0f0f0f] px-3 py-1.5 text-xs font-medium text-white/70 transition hover:border-white/25 hover:text-white"
  >
    <Icon size={14} /> {children}
  </button>
);

export default function HierarchyBoard({
  mode = "employee",
  eyebrow = "Dashboard / Hierarchy",
  title = "Hierarchy",
  subtitle = "",
}) {
  const isAdmin = mode === "admin";
  const [params] = useSearchParams();
  const teamView = !isAdmin && params.get("view") === "team";
  const { user: authUser } = useAuth();

  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [query, setQuery] = useState("");
  const [collapsed, setCollapsed] = useState(() => new Set());
  const [dragId, setDragId] = useState(null);
  const [overId, setOverId] = useState(null);
  const [zoneOver, setZoneOver] = useState(false);
  const [moving, setMoving] = useState(null);
  const [busy, setBusy] = useState(false);
  const [toast, setToast] = useState(null);
  const timer = useRef(null);

  const notify = useCallback((text, type = "success") => {
    clearTimeout(timer.current);
    setToast({ text, type });
    timer.current = setTimeout(() => setToast(null), 3200);
  }, []);

  useEffect(() => () => clearTimeout(timer.current), []);

  const load = useCallback(async (silent = false) => {
    if (!silent) setLoading(true);
    setError("");

    try {
      setData(await hierarchyService.get());
    } catch (err) {
      setError(err?.message || "Unable to load the hierarchy.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const me = data?.me;
  const index = useMemo(() => buildIndex(data?.employees || []), [data]);

  const myTeam = useMemo(
    () => (me ? descendants(me.id, index.children) : new Set()),
    [me, index]
  );

  const teamSize = useMemo(() => {
    const sizes = new Map();

    const walk = (id) => {
      let total = 0;
      (index.children.get(id) || []).forEach((kid) => {
        total += 1 + walk(kid);
      });
      sizes.set(id, total);
      return total;
    };

    (index.children.get(ROOT) || []).forEach(walk);
    return sizes;
  }, [index]);

  const q = query.trim().toLowerCase();

  const matches = useMemo(() => {
    if (!q) return null;
    const set = new Set();

    index.byId.forEach((p) => {
      if (`${p.name} ${p.designation} ${p.department} ${p.email}`.toLowerCase().includes(q)) {
        set.add(p.id);
      }
    });

    return set;
  }, [q, index]);

  // While searching, show only matches and the people above them.
  const visible = useMemo(() => {
    if (!matches) return null;
    const set = new Set();

    matches.forEach((id) => {
      let cur = id;
      while (cur && !set.has(cur)) {
        set.add(cur);
        cur = index.byId.get(cur)?.managerId;
      }
    });

    return set;
  }, [matches, index]);

  if (loading && !data) {
    return (
      <div className="flex items-center justify-center gap-2 py-24 text-white/50">
        <Loader2 size={20} className="animate-spin" /> Loading hierarchy…
      </div>
    );
  }

  if (!data) {
    return (
      <div className="mx-auto max-w-md rounded-xl border border-red-900/60 bg-red-950/30 p-6 text-center">
        <AlertTriangle className="mx-auto text-red-400" />
        <p className="mt-2 text-sm text-red-300">{error || "Something went wrong."}</p>
        <button
          type="button"
          onClick={() => load()}
          className="mt-4 rounded-lg bg-primary px-4 py-2 text-sm font-medium text-white hover:bg-primary-dark"
        >
          Try again
        </button>
      </div>
    );
  }

  // Only Admin, Project Manager and Team Lead may drag and drop.
  const canEdit = canManageHierarchy({
    ...authUser,
    ...me,
    position: me.position || authUser?.position,
    role: me.role || authUser?.role,
  });

  const manages = (id) => canEdit && (me.role === "admin" ? true : myTeam.has(id));

  const move = async (id, managerId) => {
    if (!canEdit) {
      notify("Only Admin, Project Manager and Team Lead can change the hierarchy.", "error");
      setDragId(null);
      setOverId(null);
      return;
    }

    const verdict = checkMove(me, index, id, managerId);

    if (!verdict.ok) {
      notify(verdict.reason, "error");
      setDragId(null);
      setOverId(null);
      return;
    }

    const before = data;
    const person = index.byId.get(id);
    const boss = managerId ? index.byId.get(managerId) : null;

    setBusy(true);
    setData((d) => ({
      ...d,
      employees: d.employees.map((e) => (e.id === id ? { ...e, managerId } : e)),
    }));

    try {
      await hierarchyService.setManager(id, managerId);
      notify(boss ? `${person.name} now reports to ${boss.name}.` : `${person.name} moved to the top.`);

      if (managerId) {
        setCollapsed((c) => {
          const next = new Set(c);
          next.delete(managerId);
          return next;
        });
      }

      load(true);
    } catch (err) {
      setData(before);
      notify(err?.message || "Could not update the reporting line.", "error");
    } finally {
      setBusy(false);
      setDragId(null);
      setOverId(null);
      setMoving(null);
    }
  };

  const dropState = (newManagerId, cardId) => {
    if (!canEdit || !dragId || dragId === cardId) return "none";
    return checkMove(me, index, dragId, newManagerId).ok ? "valid" : "invalid";
  };

  const handlersFor = (p) => ({
    onDragStart: (event) => {
      if (!manages(p.id)) {
        event.preventDefault();
        return;
      }
      event.dataTransfer.effectAllowed = "move";
      event.dataTransfer.setData("text/plain", p.id);
      setDragId(p.id);
    },
    onDragEnd: () => {
      setDragId(null);
      setOverId(null);
    },
    onDragOver: (event) => {
      if (dropState(p.id, p.id) === "valid") {
        event.preventDefault();
        event.dataTransfer.dropEffect = "move";
        setOverId(p.id);
      }
    },
    onDragLeave: () => setOverId((o) => (o === p.id ? null : o)),
    onDrop: (event) => {
      event.preventDefault();
      if (dragId && dropState(p.id, p.id) === "valid") move(dragId, p.id);
    },
  });

  const toggle = (id) =>
    setCollapsed((c) => {
      const next = new Set(c);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });

  const collapseAll = () =>
    setCollapsed(new Set([...index.children.keys()].filter((k) => k !== ROOT)));

  const renderNode = (id) => {
    if (visible && !visible.has(id)) return null;

    const p = index.byId.get(id);
    const kids = (index.children.get(id) || []).filter((k) => !visible || visible.has(k));
    const isCollapsed = !visible && collapsed.has(id);
    const boss = p.managerId ? index.byId.get(p.managerId) : null;
    const manageable = manages(id);

    let quick = null;
    if (manageable) {
      if (isAdmin) {
        if (p.managerId) quick = { label: "Move to top", onClick: () => move(id, null) };
      } else if (p.managerId !== me.id) {
        quick = { label: "Move under me", onClick: () => move(id, me.id) };
      }
    }

    return (
      <li key={id}>
        <EmployeeCard
          person={p}
          isMe={p.id === me.id}
          managerName={boss?.name || ""}
          directReports={(index.children.get(id) || []).length}
          teamSize={teamSize.get(id) || 0}
          collapsed={isCollapsed}
          onToggle={visible ? undefined : () => toggle(id)}
          draggable={manageable}
          dragging={dragId === id}
          drop={dropState(id, id)}
          over={overId === id}
          matched={!!matches?.has(id)}
          quick={quick}
          onMove={manageable ? () => setMoving(p) : null}
          handlers={handlersFor(p)}
        />

        {kids.length > 0 && !isCollapsed && (
          <ul className="hx-children">{kids.map((kid) => renderNode(kid))}</ul>
        )}
      </li>
    );
  };

  const rootIds = (
    teamView ? (index.byId.has(me.id) ? [me.id] : []) : index.children.get(ROOT) || []
  ).filter((id) => !visible || visible.has(id));

  const directors = (data.directors || []).filter(
    (d) => !q || `${d.name} ${d.designation} ${d.email}`.toLowerCase().includes(q)
  );

  const crumbs = eyebrow.split("/").map((s) => s.trim());
  const managersCount = [...index.children.entries()].filter(([k, v]) => k !== ROOT && v.length).length;

  const zoneTarget = isAdmin ? null : me.id;
  const zoneState = dragId
    ? checkMove(me, index, dragId, zoneTarget).ok
      ? "valid"
      : "invalid"
    : "none";
  const showZone = canEdit && !teamView && (isAdmin || myTeam.size > 0);

  const movingOptions = moving
    ? [...index.byId.values()].filter((e) => checkMove(me, index, moving.id, e.id).ok)
    : [];
  const movingTop = !!moving && isAdmin && checkMove(me, index, moving.id, null).ok;

  const banner = !canEdit
    ? "View only: only Admin, Project Manager and Team Lead can change reporting lines."
    : isAdmin
      ? "Drag a card onto another person to make them a direct report, or use Move. As admin you can reorganise anyone."
      : myTeam.size > 0
        ? `You manage ${myTeam.size} ${myTeam.size === 1 ? "person" : "people"}. Drag someone in your team onto a teammate, or use Move. People above or beside you can't be changed.`
        : "You have nobody in your team yet, so there is nothing to move.";

  return (
    <div className="hx w-full text-white">
      <header className="mb-5 flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-white/40">
            {crumbs.map((c, i) => (
              <span key={c}>
                {i > 0 && " / "}
                <span className={i === crumbs.length - 1 ? "text-primary-light" : ""}>{c}</span>
              </span>
            ))}
          </p>
          <h1 className="mt-1 text-2xl font-semibold sm:text-3xl">{teamView ? "My Team" : title}</h1>
          {subtitle && <p className="mt-1 text-sm text-white/50">{subtitle}</p>}
        </div>

        <div className="flex w-full items-center gap-2 sm:w-auto">
          <div className="relative flex-1 sm:w-72">
            <Search size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-white/40" />
            <input
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Search name, role, department…"
              className="w-full rounded-full border border-white/10 bg-[#0f0f0f] py-2 pl-10 pr-9 text-sm text-white outline-none placeholder:text-white/30 focus:border-primary"
            />
            {query && (
              <button
                type="button"
                onClick={() => setQuery("")}
                aria-label="Clear search"
                className="absolute right-3 top-1/2 -translate-y-1/2 text-white/40 hover:text-white"
              >
                <X size={14} />
              </button>
            )}
          </div>

          <button
            type="button"
            onClick={() => load(true)}
            aria-label="Refresh"
            title="Refresh"
            className="rounded-full border border-white/10 bg-[#0f0f0f] p-2.5 text-white/70 transition hover:border-white/25 hover:text-white"
          >
            <RefreshCw size={15} />
          </button>
        </div>
      </header>

      <div className="mb-5 flex items-start gap-2.5 rounded-xl border border-white/10 bg-white/[0.03] px-4 py-3 text-[13px] text-white/60">
        <Info size={16} className="mt-0.5 shrink-0 text-primary-light" />
        <p>{banner}</p>
      </div>

      <div className="mb-4 grid grid-cols-2 gap-3 sm:grid-cols-4">
        <Stat label="Employees" value={index.byId.size} />
        <Stat label="Managers" value={managersCount} />
        <Stat label="Top level" value={(index.children.get(ROOT) || []).length} />
        <Stat label="Levels" value={depthOf(index.children)} />
      </div>

      {/* Colour legend: card border colour = position */}
      <div className="mb-6 flex flex-wrap items-center gap-x-4 gap-y-2 rounded-xl border border-white/10 bg-[#0f0f0f] px-4 py-3">
        <span className="text-[11px] font-semibold uppercase tracking-wider text-white/40">
          Card colours
        </span>
        {POSITION_LEGEND.map((item) => (
          <span key={item.key} className="flex items-center gap-1.5 text-xs text-white/70">
            <span
              className="h-3 w-3 rounded-sm border-2"
              style={{ borderColor: POSITION_COLORS[item.key] }}
            />
            {item.label}
          </span>
        ))}
      </div>

      {!teamView && directors.length > 0 && (
        <section className="mb-7">
          <h2 className="mb-3 text-xs font-bold uppercase tracking-[0.16em] text-white/40">Directors</h2>
          <div className="flex flex-wrap gap-4">
            {directors.map((d) => (
              <EmployeeCard key={d.id} person={d} director isMe={d.id === me.id} />
            ))}
          </div>
        </section>
      )}

      <section>
        <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
          <h2 className="text-xs font-bold uppercase tracking-[0.16em] text-white/40">
            {teamView ? "Your team" : "Working hierarchy"}
          </h2>
          <div className="flex items-center gap-2">
            <ToolBtn icon={ChevronsUpDown} onClick={() => setCollapsed(new Set())}>
              Expand all
            </ToolBtn>
            <ToolBtn icon={ChevronsDownUp} onClick={collapseAll}>
              Collapse all
            </ToolBtn>
          </div>
        </div>

        {showZone && (
          <div
            onDragOver={(event) => {
              if (zoneState === "valid") {
                event.preventDefault();
                setZoneOver(true);
              }
            }}
            onDragLeave={() => setZoneOver(false)}
            onDrop={(event) => {
              event.preventDefault();
              setZoneOver(false);
              if (dragId && zoneState === "valid") move(dragId, zoneTarget);
            }}
            className={`mb-6 flex h-14 max-w-[640px] items-center justify-center rounded-xl border border-dashed px-4 text-center text-sm transition ${
              zoneOver
                ? "border-emerald-400 bg-emerald-400/10 text-emerald-200"
                : zoneState === "valid"
                  ? "border-emerald-500/50 text-emerald-300/80"
                  : zoneState === "invalid"
                    ? "border-white/10 text-white/25"
                    : "border-white/15 text-white/45"
            }`}
          >
            {isAdmin
              ? "Drop here to move someone to the top of the working hierarchy"
              : "Drop here to move someone directly under you"}
          </div>
        )}

        <div className="hx-scroll rounded-2xl border border-white/10 bg-[#0b0b0b] p-4 sm:p-6">
          {rootIds.length ? (
            <ul className="hx-root">{rootIds.map((id) => renderNode(id))}</ul>
          ) : (
            <p className="py-10 text-center text-sm text-white/45">
              {q ? "No one matches your search." : "No employees to show yet."}
            </p>
          )}
        </div>
      </section>

      {moving && (
        <MoveModal
          person={moving}
          options={movingOptions}
          topOption={movingTop}
          busy={busy}
          onPick={(managerId) => move(moving.id, managerId)}
          onClose={() => setMoving(null)}
        />
      )}

      {toast && (
        <div
          role="status"
          className={`fixed bottom-6 right-6 z-[80] max-w-sm rounded-lg border px-4 py-3 text-sm shadow-xl ${
            toast.type === "error"
              ? "border-red-800 bg-red-950/90 text-red-200"
              : "border-emerald-700/60 bg-emerald-950/90 text-emerald-100"
          }`}
        >
          {toast.text}
        </div>
      )}
    </div>
  );
}