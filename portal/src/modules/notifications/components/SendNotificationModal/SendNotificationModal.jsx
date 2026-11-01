import { useMemo, useState } from "react";
import {
  X,
  Send,
  Search,
  Users,
  LoaderCircle,
  AlertCircle,
} from "lucide-react";
import {
  PURPOSES,
  useNotificationEmployees,
} from "../../data/notificationsData";

export default function SendNotificationModal({ onClose, onSend }) {
  const {
    employees,
    loading: employeesLoading,
    error: employeesError,
  } = useNotificationEmployees();

  const [audience, setAudience] = useState("all");
  const [selected, setSelected] = useState([]);
  const [purpose, setPurpose] = useState("announcement");
  const [title, setTitle] = useState("");
  const [details, setDetails] = useState("");
  const [search, setSearch] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  const filteredEmployees = useMemo(() => {
    const query = search.trim().toLowerCase();

    if (!query) return employees;

    return employees.filter((employee) =>
      `${employee.name} ${employee.email}`
        .toLowerCase()
        .includes(query)
    );
  }, [employees, search]);

  const toggleEmployee = (id) => {
    setSelected((previous) =>
      previous.includes(id)
        ? previous.filter((item) => item !== id)
        : [...previous, id]
    );
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError("");

    if (!title.trim() || !details.trim()) {
      setError("Title aur message dono required hain.");
      return;
    }

    if (audience === "selected" && selected.length === 0) {
      setError("Kam az kam ek employee select karein.");
      return;
    }

    setSubmitting(true);

    try {
      const count = await onSend({
        to: audience === "all" ? "all" : selected,
        purpose,
        title: title.trim(),
        details: details.trim(),
      });

      onClose?.(count);
    } catch (err) {
      setError(err.message || "Notification send nahi ho saki.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center overflow-y-auto bg-black/75 p-4 backdrop-blur-sm">
      <div className="my-auto w-full max-w-xl overflow-hidden rounded-2xl border border-[#292929] bg-[#0d0d0d] text-white shadow-2xl">
        <div className="flex items-center justify-between border-b border-[#252525] px-5 py-4 sm:px-6">
          <div>
            <h2 className="text-lg font-semibold">
              Send Notification
            </h2>
            <p className="mt-1 text-sm text-gray-400">
              Send a notification to employees.
            </p>
          </div>

          <button
            type="button"
            onClick={() => onClose?.()}
            disabled={submitting}
            aria-label="Close"
            className="rounded-lg p-2 text-gray-400 transition hover:bg-[#202020] hover:text-white"
          >
            <X size={19} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5 p-5 sm:p-6">
          <div>
            <label className="mb-2 block text-sm font-medium text-gray-200">
              Send to
            </label>

            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => setAudience("all")}
                className={`rounded-xl border p-3 text-left transition ${
                  audience === "all"
                    ? "border-[#c1121f] bg-[#c1121f]/10"
                    : "border-[#292929] bg-[#111111] hover:border-[#555]"
                }`}
              >
                <Users size={19} className="mb-2 text-[#ef4444]" />
                <span className="block text-sm font-semibold">
                  All Employees
                </span>
                <span className="mt-1 block text-xs text-gray-400">
                  {employeesLoading
                    ? "Loading employees..."
                    : `${employees.length} active employees`}
                </span>
              </button>

              <button
                type="button"
                onClick={() => setAudience("selected")}
                className={`rounded-xl border p-3 text-left transition ${
                  audience === "selected"
                    ? "border-[#c1121f] bg-[#c1121f]/10"
                    : "border-[#292929] bg-[#111111] hover:border-[#555]"
                }`}
              >
                <Users size={19} className="mb-2 text-[#ef4444]" />
                <span className="block text-sm font-semibold">
                  Specific Employees
                </span>
                <span className="mt-1 block text-xs text-gray-400">
                  {selected.length} selected
                </span>
              </button>
            </div>
          </div>

          {audience === "selected" && (
            <div className="space-y-3">
              <div className="relative">
                <Search
                  size={16}
                  className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500"
                />
                <input
                  value={search}
                  onChange={(event) => setSearch(event.target.value)}
                  placeholder="Search employee name or email"
                  className="w-full rounded-xl border border-[#292929] bg-[#111111] py-3 pl-9 pr-3 text-sm outline-none transition placeholder:text-gray-600 focus:border-[#c1121f]"
                />
              </div>

              <div className="max-h-48 space-y-1 overflow-y-auto rounded-xl border border-[#292929] p-2">
                {employeesLoading ? (
                  <div className="flex items-center justify-center gap-2 py-7 text-sm text-gray-400">
                    <LoaderCircle size={17} className="animate-spin" />
                    Loading employees...
                  </div>
                ) : filteredEmployees.length === 0 ? (
                  <p className="py-7 text-center text-sm text-gray-500">
                    No employees found.
                  </p>
                ) : (
                  filteredEmployees.map((employee) => (
                    <label
                      key={employee.id}
                      className="flex cursor-pointer items-center gap-3 rounded-lg px-3 py-2.5 transition hover:bg-[#191919]"
                    >
                      <input
                        type="checkbox"
                        checked={selected.includes(employee.id)}
                        onChange={() => toggleEmployee(employee.id)}
                        className="h-4 w-4 accent-[#c1121f]"
                      />
                      <span className="min-w-0 flex-1">
                        <span className="block truncate text-sm font-medium">
                          {employee.name}
                        </span>
                        <span className="block truncate text-xs text-gray-500">
                          {employee.email}
                        </span>
                      </span>
                    </label>
                  ))
                )}
              </div>
            </div>
          )}

          {employeesError && (
            <p className="flex items-start gap-2 text-sm text-red-400">
              <AlertCircle size={17} className="mt-0.5 shrink-0" />
              {employeesError}
            </p>
          )}

          <div>
            <label className="mb-2 block text-sm font-medium text-gray-200">
              Purpose
            </label>
            <select
              value={purpose}
              onChange={(event) => setPurpose(event.target.value)}
              className="w-full rounded-xl border border-[#292929] bg-[#111111] px-3 py-3 text-sm outline-none focus:border-[#c1121f]"
            >
              {PURPOSES.map((item) => (
                <option key={item.value} value={item.value}>
                  {item.label}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="mb-2 block text-sm font-medium text-gray-200">
              Title
            </label>
            <input
              value={title}
              onChange={(event) => setTitle(event.target.value)}
              maxLength={80}
              required
              placeholder="Enter notification title"
              className="w-full rounded-xl border border-[#292929] bg-[#111111] px-3 py-3 text-sm outline-none placeholder:text-gray-600 focus:border-[#c1121f]"
            />
          </div>

          <div>
            <label className="mb-2 block text-sm font-medium text-gray-200">
              Message
            </label>
            <textarea
              value={details}
              onChange={(event) => setDetails(event.target.value)}
              maxLength={500}
              required
              rows={4}
              placeholder="Write the notification message..."
              className="w-full resize-y rounded-xl border border-[#292929] bg-[#111111] px-3 py-3 text-sm outline-none placeholder:text-gray-600 focus:border-[#c1121f]"
            />
            <p className="mt-1 text-right text-xs text-gray-500">
              {details.length}/500
            </p>
          </div>

          {error && (
            <p className="rounded-lg border border-red-900/60 bg-red-950/30 p-3 text-sm text-red-300">
              {error}
            </p>
          )}

          <div className="flex flex-col-reverse gap-3 border-t border-[#252525] pt-4 sm:flex-row sm:justify-end">
            <button
              type="button"
              onClick={() => onClose?.()}
              disabled={submitting}
              className="rounded-xl border border-[#333] px-5 py-3 text-sm font-medium text-gray-300 transition hover:bg-[#191919] disabled:opacity-50"
            >
              Cancel
            </button>

            <button
              type="submit"
              disabled={
                submitting ||
                employeesLoading ||
                (audience === "selected" && selected.length === 0)
              }
              className="flex items-center justify-center gap-2 rounded-xl bg-[#c1121f] px-5 py-3 text-sm font-semibold text-white transition hover:bg-[#a30f1a] disabled:cursor-not-allowed disabled:opacity-50"
            >
              {submitting ? (
                <LoaderCircle size={17} className="animate-spin" />
              ) : (
                <Send size={16} />
              )}
              {submitting ? "Sending..." : "Send Notification"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}