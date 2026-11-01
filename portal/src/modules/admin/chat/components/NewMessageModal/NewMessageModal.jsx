
import { useCallback, useEffect, useMemo, useState } from "react";
import { Check, Search, X } from "lucide-react";
import Avatar from "../Avatar";
import { chatService } from "../../../../../services/chatService";
import { scrollbar } from "../../../../../utils/format";

const normalizeId = (value) => String(value ?? "");

const normalizeUser = (user) => {
  const data = user?.user || user || {};
  const id = normalizeId(data.id || data._id || user?.id || user?._id);

  return {
    ...data,
    id,
    name: data.name || data.fullName || data.username || "Unknown employee",
    email: data.email || "",
    role: data.role || data.designation || "Employee",
    avatar: data.avatar || data.avatarUrl || data.profileImage || "",
    online: Boolean(data.online || data.isOnline),
  };
};

const getErrorMessage = (error) =>
  error?.message || "Something went wrong. Please try again.";

const NewMessageModal = ({
  mode = "new",
  excludeIds = [],
  myId,
  onClose,
  onSubmit,
}) => {
  const [query, setQuery] = useState("");
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [selected, setSelected] = useState([]);
  const [isGroup, setIsGroup] = useState(mode === "add");
  const [name, setName] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  const excludeKey = useMemo(
    () => excludeIds.map(normalizeId).sort().join(","),
    [excludeIds]
  );

  const excludedIds = useMemo(
    () => new Set(excludeKey ? excludeKey.split(",") : []),
    [excludeKey]
  );

  const currentUserId = normalizeId(myId);

  const loadUsers = useCallback(async () => {
    setLoading(true);
    setError("");

    try {
      const response = await chatService.getUsers(query.trim());

      const records = Array.isArray(response)
        ? response
        : Array.isArray(response?.users)
          ? response.users
          : Array.isArray(response?.data)
            ? response.data
            : [];

      const normalizedUsers = records
        .map(normalizeUser)
        .filter(
          (user) =>
            user.id &&
            user.id !== currentUserId &&
            !excludedIds.has(user.id)
        );

      setUsers(normalizedUsers);

      setSelected((previous) =>
        previous.map((person) => {
          const latest = normalizedUsers.find(
            (user) => user.id === person.id
          );

          return latest || person;
        })
      );
    } catch (requestError) {
      setUsers([]);
      setError(getErrorMessage(requestError));
    } finally {
      setLoading(false);
    }
  }, [query, currentUserId, excludedIds]);

  useEffect(() => {
    let active = true;

    const timer = setTimeout(async () => {
      if (!active) return;

      setLoading(true);
      setError("");

      try {
        const response = await chatService.getUsers(query.trim());

        if (!active) return;

        const records = Array.isArray(response)
          ? response
          : Array.isArray(response?.users)
            ? response.users
            : Array.isArray(response?.data)
              ? response.data
              : [];

        const normalizedUsers = records
          .map(normalizeUser)
          .filter(
            (user) =>
              user.id &&
              user.id !== currentUserId &&
              !excludedIds.has(user.id)
          );

        setUsers(normalizedUsers);
      } catch (requestError) {
        if (active) {
          setUsers([]);
          setError(getErrorMessage(requestError));
        }
      } finally {
        if (active) setLoading(false);
      }
    }, 300);

    return () => {
      active = false;
      clearTimeout(timer);
    };
  }, [query, currentUserId, excludedIds]);

  useEffect(() => {
    const handleKeyDown = (event) => {
      if (event.key === "Escape" && !busy) {
        onClose?.();
      }
    };

    window.addEventListener("keydown", handleKeyDown);

    return () => {
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [onClose, busy]);

  const toggle = (user) => {
    if (busy) return;

    setError("");

    setSelected((previous) => {
      const alreadySelected = previous.some(
        (person) => person.id === user.id
      );

      if (alreadySelected) {
        return previous.filter((person) => person.id !== user.id);
      }

      if (!isGroup) {
        return [user];
      }

      return [...previous, user];
    });
  };

  const switchType = (group) => {
    setIsGroup(group);
    setError("");

    if (!group) {
      setSelected((previous) => previous.slice(0, 1));
    }
  };

  const submit = async (event) => {
    event?.preventDefault();

    if (busy) return;

    if (selected.length === 0) {
      setError("Select at least one employee.");
      return;
    }

    if (mode === "new" && isGroup && !name.trim()) {
      setError("Enter a group name.");
      return;
    }

    if (typeof onSubmit !== "function") {
      setError("This action is not available right now.");
      return;
    }

    setBusy(true);
    setError("");

    try {
      await onSubmit({
        type: isGroup ? "group" : "direct",
        name: mode === "new" && isGroup ? name.trim() : "",
        memberIds: selected.map((user) => user.id),
      });

      onClose?.();
    } catch (submitError) {
      setError(getErrorMessage(submitError));
      setBusy(false);
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4 backdrop-blur-[2px]"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget && !busy) {
          onClose?.();
        }
      }}
    >
      <form
        onSubmit={submit}
        className="flex max-h-[85vh] w-full max-w-md flex-col overflow-hidden rounded-2xl border border-white/10 bg-[#111] shadow-2xl"
      >
        <div className="flex items-center justify-between border-b border-white/10 px-5 py-4">
          <h3 className="text-[15px] font-semibold text-white">
            {mode === "add" ? "Add members" : "New message"}
          </h3>

          <button
            type="button"
            onClick={() => onClose?.()}
            disabled={busy}
            aria-label="Close dialog"
            className="rounded-lg p-1 text-white/60 transition-colors hover:bg-white/5 hover:text-white disabled:opacity-40"
          >
            <X size={18} />
          </button>
        </div>

        <div className="space-y-3 px-5 pt-4">
          {mode === "new" && (
            <div
              className="grid grid-cols-2 rounded-full bg-[#1a1a1a] p-1 text-[12px]"
              role="group"
              aria-label="Conversation type"
            >
              {[
                ["Direct", false],
                ["Group", true],
              ].map(([label, group]) => (
                <button
                  key={label}
                  type="button"
                  disabled={busy}
                  onClick={() => switchType(group)}
                  aria-pressed={isGroup === group}
                  className={`rounded-full py-1.5 transition-colors disabled:opacity-50 ${
                    isGroup === group
                      ? "bg-red-600 text-white"
                      : "text-white/60 hover:text-white"
                  }`}
                >
                  {label}
                </button>
              ))}
            </div>
          )}

          {mode === "new" && isGroup && (
            <input
              value={name}
              onChange={(event) => {
                setName(event.target.value);
                setError("");
              }}
              maxLength={80}
              disabled={busy}
              required
              placeholder="Group name"
              aria-label="Group name"
              className="w-full rounded-lg border border-white/10 bg-[#161616] px-3 py-2 text-[13px] text-white outline-none placeholder:text-white/40 focus:border-red-600 disabled:opacity-50"
            />
          )}

          <label className="flex items-center gap-2 rounded-full border border-white/10 bg-[#161616] px-3 py-2 focus-within:border-red-600">
            <Search size={14} className="shrink-0 text-white/60" />

            <input
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Search employees..."
              aria-label="Search employees"
              className="w-full bg-transparent text-[12px] text-white outline-none placeholder:text-white/40"
            />

            {query && (
              <button
                type="button"
                onClick={() => setQuery("")}
                aria-label="Clear search"
                className="text-white/50 hover:text-white"
              >
                <X size={13} />
              </button>
            )}
          </label>

          {selected.length > 0 && (
            <div className="flex flex-wrap gap-1.5">
              {selected.map((user) => (
                <span
                  key={user.id}
                  className="flex items-center gap-1 rounded-full bg-red-600/20 px-2.5 py-1 text-[11px] text-red-300"
                >
                  <span className="max-w-[150px] truncate">
                    {user.name}
                  </span>

                  <button
                    type="button"
                    disabled={busy}
                    onClick={() => toggle(user)}
                    aria-label={`Remove ${user.name}`}
                    className="rounded-full hover:text-white disabled:opacity-40"
                  >
                    <X size={11} />
                  </button>
                </span>
              ))}
            </div>
          )}
        </div>

        <div
          className={`mt-3 min-h-[120px] flex-1 overflow-y-auto px-2 ${scrollbar}`}
        >
          {loading ? (
            <div
              className="flex items-center justify-center gap-2 py-8 text-[12px] text-white/40"
              role="status"
            >
              <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/20 border-t-red-600" />
              Loading employees...
            </div>
          ) : users.length === 0 ? (
            <p className="py-8 text-center text-[12px] text-white/40">
              {error
                ? "Unable to load employees."
                : query.trim()
                  ? "No employees match your search."
                  : "No employees found."}
            </p>
          ) : (
            users.map((user) => {
              const isSelected = selected.some(
                (person) => person.id === user.id
              );

              return (
                <button
                  key={user.id}
                  type="button"
                  disabled={busy}
                  onClick={() => toggle(user)}
                  aria-pressed={isSelected}
                  className="flex w-full items-center gap-3 rounded-lg px-3 py-2 text-left transition-colors hover:bg-white/5 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  <Avatar
                    src={user.avatar}
                    name={user.name}
                    size={32}
                    online={user.online}
                  />

                  <div className="min-w-0 flex-1">
                    <p className="truncate text-[13px] text-white">
                      {user.name}
                    </p>

                    <p className="truncate text-[11px] text-white/40">
                      {user.role}
                      {user.email ? ` · ${user.email}` : ""}
                    </p>
                  </div>

                  <span
                    className={`flex h-5 w-5 shrink-0 items-center justify-center rounded-md border ${
                      isSelected
                        ? "border-red-600 bg-red-600 text-white"
                        : "border-white/20 text-transparent"
                    }`}
                  >
                    <Check size={13} />
                  </span>
                </button>
              );
            })
          )}
        </div>

        <div className="border-t border-white/10 px-5 py-4">
          {error && (
            <p
              role="alert"
              className="mb-2 text-[12px] text-red-400"
            >
              {error}
            </p>
          )}

          <button
            type="submit"
            disabled={busy || loading}
            className="w-full rounded-full bg-red-600 py-2.5 text-[13px] font-semibold text-white transition-colors hover:bg-red-500 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {busy
              ? "Please wait..."
              : mode === "add"
                ? "Add members"
                : isGroup
                  ? "Create group"
                  : "Start chat"}
          </button>
        </div>
      </form>
    </div>
  );
};

export default NewMessageModal;
