
import { useEffect, useState } from "react";
import { Check, Search, X } from "lucide-react";
import Avatar from "../Avatar";
import { chatService } from "../../../../../services/chatService";
import { scrollbar } from "../../../../../utils/format";

const getUserId = (user) => {
  const id = user?.id ?? user?._id ?? user?.userId;
  return id == null ? "" : String(id);
};

const getUserList = (response) => {
  let result = response;

  for (let i = 0; i < 4; i += 1) {
    if (Array.isArray(result)) return result;

    if (!result || typeof result !== "object") return [];

    if (Array.isArray(result.users)) {
      return result.users;
    }

    if (Array.isArray(result.employees)) {
      return result.employees;
    }

    if (Array.isArray(result.results)) {
      return result.results;
    }

    if (Array.isArray(result.data)) {
      return result.data;
    }

    if (result.data && typeof result.data === "object") {
      result = result.data;
      continue;
    }

    if (result.users && typeof result.users === "object") {
      result = result.users;
      continue;
    }

    if (result.employees && typeof result.employees === "object") {
      result = result.employees;
      continue;
    }

    return [];
  }

  return Array.isArray(result) ? result : [];
};

const normalizeUser = (user) => {
  if (!user || typeof user !== "object") return null;

  const id = getUserId(user);

  if (!id) return null;

  return {
    ...user,
    id,
    _id: user._id ?? id,
    name:
      user.name ??
      user.fullName ??
      user.username ??
      user.email ??
      "Unknown employee",
    role: user.role ?? user.designation ?? user.position ?? "Employee",
    avatar: user.avatar ?? user.profileImage ?? user.profilePicture ?? "",
    online: Boolean(user.online),
  };
};

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

  const excludeKey = excludeIds.map(String).join(",");
  const currentUserId = myId == null ? "" : String(myId);

  useEffect(() => {
    let alive = true;

    const timeoutId = setTimeout(async () => {
      setLoading(true);
      setError("");

      try {
        const response = await chatService.getUsers(query);
        const list = getUserList(response)
          .map(normalizeUser)
          .filter(Boolean);

        const excludedIds = new Set(
          excludeKey
            .split(",")
            .map((id) => id.trim())
            .filter(Boolean)
        );

        const filteredUsers = list.filter((user) => {
          const userId = getUserId(user);

          return (
            userId !== currentUserId &&
            !excludedIds.has(userId)
          );
        });

        if (alive) {
          setUsers(filteredUsers);
        }
      } catch (exception) {
        if (alive) {
          setUsers([]);
          setError(
            exception?.message || "Employees load nahi ho sake."
          );
        }
      } finally {
        if (alive) {
          setLoading(false);
        }
      }
    }, 300);

    return () => {
      alive = false;
      clearTimeout(timeoutId);
    };
  }, [query, currentUserId, excludeKey]);

  useEffect(() => {
    const handleKeyDown = (event) => {
      if (event.key === "Escape" && !busy) {
        onClose();
      }
    };

    window.addEventListener("keydown", handleKeyDown);

    return () => {
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [onClose, busy]);

  const toggle = (user) => {
    setError("");

    setSelected((previous) => {
      const alreadySelected = previous.some(
        (item) => item.id === user.id
      );

      if (alreadySelected) {
        return previous.filter((item) => item.id !== user.id);
      }

      return isGroup ? [...previous, user] : [user];
    });
  };

  const switchType = (group) => {
    setIsGroup(group);

    if (!group) {
      setSelected((previous) => previous.slice(0, 1));
    }

    setError("");
  };

  const submit = async () => {
    if (busy) return;

    if (!selected.length) {
      setError("Select at least one person.");
      return;
    }

    if (mode === "new" && isGroup && !name.trim()) {
      setError("Enter a group name.");
      return;
    }

    setBusy(true);
    setError("");

    try {
      await onSubmit({
        type: isGroup ? "group" : "direct",
        name: name.trim(),
        memberIds: selected.map((user) => user.id),
      });

      onClose();
    } catch (exception) {
      setError(
        exception?.message || "Request complete nahi ho saki."
      );
    } finally {
      setBusy(false);
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget && !busy) {
          onClose();
        }
      }}
    >
      <div
        onMouseDown={(event) => event.stopPropagation()}
        className="flex max-h-[85vh] w-full max-w-md flex-col rounded-2xl border border-white/10 bg-[#111]"
      >
        <div className="flex items-center justify-between border-b border-white/10 px-5 py-4">
          <h3 className="text-[15px] font-medium text-white">
            {mode === "add" ? "Add members" : "New message"}
          </h3>

          <button
            type="button"
            onClick={onClose}
            disabled={busy}
            aria-label="Close"
            className="text-white/60 hover:text-white disabled:opacity-50"
          >
            <X size={18} />
          </button>
        </div>

        <div className="space-y-3 px-5 pt-4">
          {mode === "new" && (
            <div className="grid grid-cols-2 rounded-full bg-[#1a1a1a] p-1 text-[12px]">
              {[
                ["Direct", false],
                ["Group", true],
              ].map(([label, group]) => (
                <button
                  type="button"
                  key={label}
                  onClick={() => switchType(group)}
                  className={`rounded-full py-1.5 transition ${
                    isGroup === group
                      ? "bg-red-600 text-white"
                      : "text-white/60"
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
              onChange={(event) => setName(event.target.value)}
              placeholder="Group name"
              className="w-full rounded-lg border border-white/10 bg-[#161616] px-3 py-2 text-[13px] text-white outline-none placeholder:text-white/40 focus:border-red-600"
            />
          )}

          <label className="flex items-center gap-2 rounded-full border border-white/10 bg-[#161616] px-3 py-2">
            <Search size={14} className="text-white/60" />

            <input
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Search employees..."
              className="w-full bg-transparent text-[12px] text-white outline-none placeholder:text-white/40"
            />
          </label>

          {selected.length > 0 && (
            <div className="flex flex-wrap gap-1.5">
              {selected.map((user) => (
                <span
                  key={user.id}
                  className="flex items-center gap-1 rounded-full bg-red-600/20 px-2.5 py-1 text-[11px] text-red-300"
                >
                  {user.name}

                  <button
                    type="button"
                    onClick={() => toggle(user)}
                    disabled={busy}
                    aria-label={`Remove ${user.name}`}
                  >
                    <X size={11} />
                  </button>
                </span>
              ))}
            </div>
          )}
        </div>

        <div className={`mt-3 min-h-[120px] flex-1 overflow-y-auto px-2 ${scrollbar}`}>
          {loading ? (
            <p className="py-8 text-center text-[12px] text-white/40">
              Loading employees...
            </p>
          ) : users.length === 0 ? (
            <p className="py-8 text-center text-[12px] text-white/40">
              {error ? "Employees load nahi ho sake." : "No employees found."}
            </p>
          ) : (
            users.map((user) => {
              const isSelected = selected.some(
                (item) => item.id === user.id
              );

              return (
                <button
                  type="button"
                  key={user.id}
                  onClick={() => toggle(user)}
                  disabled={busy}
                  className="flex w-full items-center gap-3 rounded-lg px-3 py-2 text-left hover:bg-white/5 disabled:opacity-50"
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
                    </p>
                  </div>

                  {isSelected && (
                    <Check size={16} className="text-red-500" />
                  )}
                </button>
              );
            })
          )}
        </div>

        <div className="border-t border-white/10 px-5 py-4">
          {error && (
            <p className="mb-2 text-[12px] text-red-400">
              {error}
            </p>
          )}

          <button
            type="button"
            onClick={submit}
            disabled={busy || loading}
            className="w-full rounded-full bg-red-600 py-2.5 text-[13px] font-semibold text-white hover:bg-red-500 disabled:cursor-not-allowed disabled:opacity-60"
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
      </div>
    </div>
  );
};

export default NewMessageModal;