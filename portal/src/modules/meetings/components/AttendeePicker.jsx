import { useEffect, useMemo, useRef, useState } from "react";
import { Search, X, Users } from "lucide-react";
import meetingsService from "@/services/meetingsService";
import { useDebounced } from "../hooks";
import { Avatar } from "./Shell";

export default function AttendeePicker({ selected, onChange, currentUserId, busyIds = new Set() }) {
  const [all, setAll] = useState([]);
  const [results, setResults] = useState(null);
  const [query, setQuery] = useState("");
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const wrapRef = useRef(null);
  const debounced = useDebounced(query.trim(), 250);

  useEffect(() => {
    let alive = true;
    meetingsService
      .directory("")
      .then((rows) => alive && setAll(rows))
      .catch(() => alive && setError("Unable to load the employee directory."))
      .finally(() => alive && setLoading(false));
    return () => {
      alive = false;
    };
  }, []);

  useEffect(() => {
    if (!debounced) {
      setResults(null);
      return undefined;
    }
    let alive = true;
    meetingsService
      .directory(debounced)
      .then((rows) => alive && setResults(rows))
      .catch(() => alive && setResults([]));
    return () => {
      alive = false;
    };
  }, [debounced]);

  useEffect(() => {
    const onDown = (e) => {
      if (wrapRef.current && !wrapRef.current.contains(e.target)) setOpen(false);
    };
    document.addEventListener("mousedown", onDown);
    return () => document.removeEventListener("mousedown", onDown);
  }, []);

  const selectedIds = useMemo(() => new Set(selected.map((u) => u.id)), [selected]);
  const pool = (query.trim() ? results ?? [] : all).filter((u) => u.id !== currentUserId);
  const options = pool.filter((u) => !selectedIds.has(u.id)).slice(0, 60);

  const departments = useMemo(() => {
    const map = new Map();
    all
      .filter((u) => u.id !== currentUserId && u.department)
      .forEach((u) => map.set(u.department, [...(map.get(u.department) || []), u]));
    return [...map.entries()].sort((a, b) => b[1].length - a[1].length).slice(0, 6);
  }, [all, currentUserId]);

  const add = (users) => {
    const fresh = users.filter((u) => !selectedIds.has(u.id) && u.id !== currentUserId);
    if (fresh.length) onChange([...selected, ...fresh]);
  };
  const remove = (id) => onChange(selected.filter((u) => u.id !== id));

  return (
    <div className="mt-picker" ref={wrapRef}>
      {selected.length > 0 && (
        <ul className="mt-chips" aria-label="Selected attendees">
          {selected.map((u) => (
            <li key={u.id} className={`mt-chip${busyIds.has(u.id) ? " is-busy" : ""}`}>
              <Avatar name={u.name} src={u.avatarUrl} size={20} />
              <span>{u.name}</span>
              {busyIds.has(u.id) && <em title="Has a conflict at this time">Busy</em>}
              <button type="button" aria-label={`Remove ${u.name}`} onClick={() => remove(u.id)}>
                <X size={12} />
              </button>
            </li>
          ))}
        </ul>
      )}

      <div className="mt-search">
        <Search size={14} aria-hidden="true" />
        <input
          type="text"
          value={query}
          placeholder={loading ? "Loading people..." : "Search people by name, team or role"}
          aria-label="Search attendees"
          onFocus={() => setOpen(true)}
          onChange={(e) => {
            setQuery(e.target.value);
            setOpen(true);
          }}
          onKeyDown={(e) => {
            if (e.key === "Escape") setOpen(false);
            if (e.key === "Enter") {
              e.preventDefault();
              if (options[0]) {
                add([options[0]]);
                setQuery("");
              }
            }
          }}
        />
      </div>

      {error && <p className="mt-hint mt-hint--error">{error}</p>}

      {departments.length > 0 && (
        <div className="mt-quick" aria-label="Quick add">
          <span>
            <Users size={12} /> Quick add
          </span>
          <button type="button" onClick={() => add(all)}>
            Everyone ({all.filter((u) => u.id !== currentUserId).length})
          </button>
          {departments.map(([name, users]) => (
            <button type="button" key={name} onClick={() => add(users)}>
              {name} ({users.length})
            </button>
          ))}
        </div>
      )}

      {open && (
        <ul className="mt-options" role="listbox" aria-label="People">
          {options.length === 0 ? (
            <li className="mt-options__empty">{loading ? "Loading..." : "No matching people"}</li>
          ) : (
            options.map((u) => (
              <li key={u.id} role="option" aria-selected="false">
                <button
                  type="button"
                  onMouseDown={(e) => e.preventDefault()}
                  onClick={() => {
                    add([u]);
                    setQuery("");
                  }}
                >
                  <Avatar name={u.name} src={u.avatarUrl} size={26} />
                  <span>
                    <strong>{u.name}</strong>
                    <small>{[u.designation, u.department].filter(Boolean).join(" · ") || u.role}</small>
                  </span>
                </button>
              </li>
            ))
          )}
        </ul>
      )}
    </div>
  );
}