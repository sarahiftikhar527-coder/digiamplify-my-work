
import { useCallback, useEffect, useMemo, useState } from "react";
import {
  Megaphone,
  Plus,
  Search,
  X,
  Pencil,
  Trash2,
  Users,
  LoaderCircle,
  AlertCircle,
  ChevronDown,
  RefreshCw,
} from "lucide-react";
import {
  getAnnouncements,
  getAnnouncementEmployees,
  createAnnouncement,
  updateAnnouncement,
  deleteAnnouncement,
} from "@/services/api/announcementService";

const EMPTY_FORM = {
  title: "",
  message: "",
  audience: "all",
  employeeIds: [],
  priority: "normal",
  status: "published",
};

const getId = (item) =>
  String(item?.id || item?._id || "");

const getList = (result, key) => {
  if (Array.isArray(result)) return result;
  if (Array.isArray(result?.[key])) return result[key];
  if (Array.isArray(result?.data)) return result.data;
  return [];
};

const formatDate = (value) => {
  if (!value) return "—";

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) return "—";

  return date.toLocaleDateString("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
};

const statusClass = {
  published: "border-green-500/20 bg-green-500/10 text-green-400",
  draft: "border-yellow-500/20 bg-yellow-500/10 text-yellow-400",
};

const priorityClass = {
  normal: "text-gray-400",
  high: "text-orange-400",
  urgent: "text-red-400",
};

export default function Announcements() {
  const [announcements, setAnnouncements] = useState([]);
  const [employees, setEmployees] = useState([]);
  const [form, setForm] = useState(EMPTY_FORM);
  const [editingId, setEditingId] = useState("");
  const [search, setSearch] = useState("");
  const [employeeSearch, setEmployeeSearch] = useState("");
  const [modalOpen, setModalOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [employeesLoading, setEmployeesLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [deletingId, setDeletingId] = useState("");
  const [error, setError] = useState("");
  const [employeeError, setEmployeeError] = useState("");
  const [success, setSuccess] = useState("");

  const loadAnnouncements = useCallback(async () => {
    const result = await getAnnouncements();
    setAnnouncements(getList(result, "announcements"));
  }, []);

  const loadEmployees = useCallback(async () => {
    setEmployeesLoading(true);
    setEmployeeError("");
    setEmployees([]);

    try {
      const result = await getAnnouncementEmployees();
      const list = getList(result, "employees");

      setEmployees(
        list.filter((employee) => getId(employee))
      );
    } catch (err) {
      setEmployeeError(
        err?.message || "Employees database se load nahi ho sake."
      );
      setEmployees([]);
    } finally {
      setEmployeesLoading(false);
    }
  }, []);

  const loadData = useCallback(async () => {
    setLoading(true);
    setError("");

    try {
      await Promise.all([
        loadAnnouncements(),
        loadEmployees(),
      ]);
    } catch (err) {
      setError(err?.message || "Announcements load nahi ho sake.");
    } finally {
      setLoading(false);
    }
  }, [loadAnnouncements, loadEmployees]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  useEffect(() => {
    if (!success) return undefined;

    const timeout = setTimeout(() => setSuccess(""), 3000);
    return () => clearTimeout(timeout);
  }, [success]);

  useEffect(() => {
    if (!modalOpen) return undefined;

    const handleKeyDown = (event) => {
      if (event.key === "Escape" && !saving) {
        setModalOpen(false);
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [modalOpen, saving]);

  const filteredAnnouncements = useMemo(() => {
    const query = search.trim().toLowerCase();

    if (!query) return announcements;

    return announcements.filter((item) =>
      [item.title, item.message, item.status, item.priority]
        .filter(Boolean)
        .some((value) =>
          String(value).toLowerCase().includes(query)
        )
    );
  }, [announcements, search]);

  const filteredEmployees = useMemo(() => {
    const query = employeeSearch.trim().toLowerCase();

    if (!query) return employees;

    return employees.filter((employee) =>
      [
        employee.name,
        employee.email,
        employee.department,
        employee.designation,
      ]
        .filter(Boolean)
        .some((value) =>
          String(value).toLowerCase().includes(query)
        )
    );
  }, [employees, employeeSearch]);

  const openCreate = async () => {
    setEditingId("");
    setForm({ ...EMPTY_FORM });
    setEmployeeSearch("");
    setError("");
    setEmployeeError("");
    setModalOpen(true);

    await loadEmployees();
  };

  const openEdit = async (item) => {
    setEditingId(getId(item));
    setForm({
      title: item.title || "",
      message: item.message || "",
      audience: item.audience || "all",
      employeeIds: (item.employeeIds || []).map((employee) =>
        typeof employee === "string" ? employee : getId(employee)
      ),
      priority: item.priority || "normal",
      status: item.status || "published",
    });
    setEmployeeSearch("");
    setError("");
    setEmployeeError("");
    setModalOpen(true);

    await loadEmployees();
  };

  const closeModal = () => {
    if (saving) return;

    setModalOpen(false);
    setEditingId("");
    setForm({ ...EMPTY_FORM });
    setError("");
    setEmployeeError("");
  };

  const updateField = (key, value) => {
    setForm((current) => ({
      ...current,
      [key]: value,
    }));
  };

  const toggleEmployee = (employeeId) => {
    setForm((current) => {
      const exists = current.employeeIds.includes(employeeId);

      return {
        ...current,
        employeeIds: exists
          ? current.employeeIds.filter((id) => id !== employeeId)
          : [...current.employeeIds, employeeId],
      };
    });
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError("");

    if (!form.title.trim() || !form.message.trim()) {
      setError("Title aur message dono required hain.");
      return;
    }

    if (
      form.audience === "selected" &&
      form.employeeIds.length === 0
    ) {
      setError("Kam az kam ek employee select karein.");
      return;
    }

    setSaving(true);

    const payload = {
      ...form,
      title: form.title.trim(),
      message: form.message.trim(),
      employeeIds:
        form.audience === "all" ? [] : form.employeeIds,
    };

    try {
      if (editingId) {
        await updateAnnouncement(editingId, payload);
        setSuccess("Announcement successfully updated.");
      } else {
        await createAnnouncement(payload);
        setSuccess("Announcement successfully created.");
      }

      setModalOpen(false);
      setEditingId("");
      setForm({ ...EMPTY_FORM });

      await loadAnnouncements();
    } catch (err) {
      setError(err?.message || "Announcement save nahi ho saka.");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (item) => {
    const id = getId(item);

    if (!id || deletingId) return;

    if (
      !window.confirm(
        `Delete "${item.title}"? This action cannot be undone.`
      )
    ) {
      return;
    }

    setDeletingId(id);
    setError("");

    try {
      await deleteAnnouncement(id);

      setAnnouncements((current) =>
        current.filter(
          (announcement) => getId(announcement) !== id
        )
      );

      setSuccess("Announcement deleted successfully.");
    } catch (err) {
      setError(err?.message || "Announcement delete nahi ho saka.");
    } finally {
      setDeletingId("");
    }
  };

  return (
    <section className="w-full min-w-0 overflow-hidden rounded-xl border border-[#262626] bg-[#0b0b0b] text-white">
      <div className="flex flex-wrap items-center justify-between gap-3 p-4 sm:px-5 sm:py-4">
        <div className="flex min-w-0 items-center gap-3">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg border border-[#c1121f]/30 bg-[#c1121f]/10 text-[#ef3340]">
            <Megaphone size={19} />
          </div>

          <div>
            <h2 className="text-sm font-semibold sm:text-base">
              Announcements
            </h2>
            <p className="mt-1 text-xs text-gray-500">
              {announcements.length} announcements
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={loadData}
            disabled={loading}
            title="Refresh announcements and employees"
            className="rounded-lg border border-[#303030] p-2.5 text-gray-400 transition hover:text-white disabled:opacity-50"
          >
            <RefreshCw
              size={15}
              className={loading ? "animate-spin" : ""}
            />
          </button>

          <button
            type="button"
            onClick={openCreate}
            className="inline-flex items-center gap-2 rounded-lg bg-[#c1121f] px-3.5 py-2.5 text-xs font-semibold text-white transition hover:bg-[#df1727] sm:text-sm"
          >
            <Plus size={16} />
            Create Announcement
          </button>
        </div>
      </div>

      {success && (
        <div className="mx-4 mb-3 rounded-lg border border-green-500/20 bg-green-500/10 px-3 py-2 text-xs text-green-400 sm:mx-5">
          {success}
        </div>
      )}

      {error && !modalOpen && (
        <div className="mx-4 mb-3 flex items-start gap-2 rounded-lg border border-red-500/20 bg-red-500/10 px-3 py-2 text-xs text-red-300 sm:mx-5">
          <AlertCircle size={15} className="mt-0.5 shrink-0" />
          <span>{error}</span>
          <button
            type="button"
            onClick={() => setError("")}
            className="ml-auto"
            aria-label="Dismiss error"
          >
            <X size={15} />
          </button>
        </div>
      )}

      <div className="border-t border-[#222] px-4 py-3 sm:px-5">
        <div className="relative max-w-sm">
          <Search
            size={15}
            className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500"
          />
          <input
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder="Search announcements..."
            className="w-full rounded-lg border border-[#292929] bg-[#080808] py-2 pl-9 pr-3 text-xs text-white outline-none placeholder:text-gray-600 focus:border-[#c1121f]"
          />
        </div>
      </div>

      <div className="overflow-x-auto border-t border-[#222]">
        <table className="w-full min-w-[650px] text-left text-xs">
          <thead className="bg-[#101010] text-gray-500">
            <tr>
              <th className="px-5 py-3 font-medium">Announcement</th>
              <th className="px-4 py-3 font-medium">Audience</th>
              <th className="px-4 py-3 font-medium">Priority</th>
              <th className="px-4 py-3 font-medium">Status</th>
              <th className="px-4 py-3 font-medium">Date</th>
              <th className="px-4 py-3 text-right font-medium">Actions</th>
            </tr>
          </thead>

          <tbody className="divide-y divide-[#202020]">
            {loading ? (
              <tr>
                <td colSpan={6} className="px-5 py-10 text-center text-gray-500">
                  <LoaderCircle
                    size={18}
                    className="mx-auto mb-2 animate-spin"
                  />
                  Loading announcements...
                </td>
              </tr>
            ) : filteredAnnouncements.length === 0 ? (
              <tr>
                <td colSpan={6} className="px-5 py-10 text-center text-gray-500">
                  No announcements found.
                </td>
              </tr>
            ) : (
              filteredAnnouncements.map((item) => (
                <tr
                  key={getId(item)}
                  className="transition hover:bg-white/[0.02]"
                >
                  <td className="max-w-[260px] px-5 py-3.5">
                    <p className="truncate font-medium text-gray-200">
                      {item.title}
                    </p>
                    <p className="mt-1 truncate text-gray-500">
                      {item.message}
                    </p>
                  </td>

                  <td className="px-4 py-3.5 text-gray-400">
                    <span className="inline-flex items-center gap-1.5">
                      <Users size={13} />
                      {item.audience === "all"
                        ? "All employees"
                        : `${item.employeeIds?.length || 0} selected`}
                    </span>
                  </td>

                  <td
                    className={`px-4 py-3.5 capitalize ${
                      priorityClass[item.priority] || priorityClass.normal
                    }`}
                  >
                    {item.priority || "normal"}
                  </td>

                  <td className="px-4 py-3.5">
                    <span
                      className={`rounded-md border px-2 py-1 capitalize ${
                        statusClass[item.status] || statusClass.draft
                      }`}
                    >
                      {item.status || "draft"}
                    </span>
                  </td>

                  <td className="whitespace-nowrap px-4 py-3.5 text-gray-500">
                    {formatDate(item.createdAt)}
                  </td>

                  <td className="px-4 py-3.5">
                    <div className="flex justify-end gap-2">
                      <button
                        type="button"
                        onClick={() => openEdit(item)}
                        title="Edit announcement"
                        className="rounded-md border border-[#303030] p-2 text-gray-400 transition hover:border-[#c1121f] hover:text-white"
                      >
                        <Pencil size={14} />
                      </button>

                      <button
                        type="button"
                        onClick={() => handleDelete(item)}
                        disabled={deletingId === getId(item)}
                        title="Delete announcement"
                        className="rounded-md border border-[#303030] p-2 text-gray-400 transition hover:border-red-500 hover:text-red-400 disabled:opacity-50"
                      >
                        {deletingId === getId(item) ? (
                          <LoaderCircle size={14} className="animate-spin" />
                        ) : (
                          <Trash2 size={14} />
                        )}
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {modalOpen && (
        <div
          className="fixed inset-0 z-[9999] flex items-center justify-center overflow-y-auto bg-black/70 p-3 backdrop-blur-md sm:p-6"
          onMouseDown={(event) => {
            if (event.target === event.currentTarget) closeModal();
          }}
        >
          <div
            role="dialog"
            aria-modal="true"
            aria-labelledby="announcement-modal-title"
            className="my-auto w-full max-w-xl overflow-hidden rounded-2xl border border-[#333] bg-[#0c0c0c] shadow-2xl shadow-black/60"
          >
            <div className="flex items-center justify-between border-b border-[#252525] px-5 py-4 sm:px-6">
              <div>
                <h3
                  id="announcement-modal-title"
                  className="text-base font-semibold text-white"
                >
                  {editingId ? "Edit announcement" : "Create announcement"}
                </h3>
                <p className="mt-1 text-xs text-gray-500">
                  Share an update with your employees.
                </p>
              </div>

              <button
                type="button"
                onClick={closeModal}
                disabled={saving}
                aria-label="Close modal"
                className="rounded-lg border border-[#292929] p-2 text-gray-400 transition hover:text-white"
              >
                <X size={17} />
              </button>
            </div>

            <form
              onSubmit={handleSubmit}
              className="max-h-[78vh] space-y-4 overflow-y-auto p-5 sm:p-6"
            >
              {error && (
                <div className="flex items-start gap-2 rounded-lg border border-red-500/20 bg-red-500/10 px-3 py-2.5 text-xs text-red-300">
                  <AlertCircle size={15} className="mt-0.5 shrink-0" />
                  <span>{error}</span>
                </div>
              )}

              <div>
                <label className="mb-2 block text-xs font-medium text-gray-300">
                  Title <span className="text-red-400">*</span>
                </label>
                <input
                  required
                  maxLength={150}
                  value={form.title}
                  onChange={(event) => updateField("title", event.target.value)}
                  placeholder="Enter announcement title"
                  className="w-full rounded-lg border border-[#303030] bg-[#080808] px-3.5 py-3 text-sm text-white outline-none placeholder:text-gray-600 focus:border-[#c1121f]"
                />
              </div>

              <div>
                <label className="mb-2 block text-xs font-medium text-gray-300">
                  Message <span className="text-red-400">*</span>
                </label>
                <textarea
                  required
                  maxLength={5000}
                  rows={4}
                  value={form.message}
                  onChange={(event) => updateField("message", event.target.value)}
                  placeholder="Write your announcement..."
                  className="w-full resize-y rounded-lg border border-[#303030] bg-[#080808] px-3.5 py-3 text-sm text-white outline-none placeholder:text-gray-600 focus:border-[#c1121f]"
                />
              </div>

              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div>
                  <label className="mb-2 block text-xs font-medium text-gray-300">
                    Audience
                  </label>
                  <div className="relative">
                    <select
                      value={form.audience}
                      onChange={(event) => updateField("audience", event.target.value)}
                      className="w-full appearance-none rounded-lg border border-[#303030] bg-[#080808] px-3.5 py-3 pr-9 text-sm text-white outline-none focus:border-[#c1121f]"
                    >
                      <option value="all">All employees</option>
                      <option value="selected">Selected employees</option>
                    </select>
                    <ChevronDown
                      size={15}
                      className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-gray-500"
                    />
                  </div>
                </div>

                <div>
                  <label className="mb-2 block text-xs font-medium text-gray-300">
                    Priority
                  </label>
                  <div className="relative">
                    <select
                      value={form.priority}
                      onChange={(event) => updateField("priority", event.target.value)}
                      className="w-full appearance-none rounded-lg border border-[#303030] bg-[#080808] px-3.5 py-3 pr-9 text-sm capitalize text-white outline-none focus:border-[#c1121f]"
                    >
                      <option value="normal">Normal</option>
                      <option value="high">High</option>
                      <option value="urgent">Urgent</option>
                    </select>
                    <ChevronDown
                      size={15}
                      className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-gray-500"
                    />
                  </div>
                </div>
              </div>

              {form.audience === "selected" && (
                <div className="rounded-xl border border-[#292929] bg-[#080808] p-3.5">
                  <div className="mb-3 flex items-center justify-between gap-2">
                    <label className="text-xs font-medium text-gray-300">
                      Select employees
                    </label>
                    <span className="text-xs text-gray-500">
                      {form.employeeIds.length} selected
                    </span>
                  </div>

                  <div className="relative mb-3">
                    <Search
                      size={14}
                      className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500"
                    />
                    <input
                      value={employeeSearch}
                      onChange={(event) => setEmployeeSearch(event.target.value)}
                      placeholder="Search database employees..."
                      className="w-full rounded-lg border border-[#292929] bg-[#101010] py-2 pl-8 pr-3 text-xs text-white outline-none placeholder:text-gray-600 focus:border-[#c1121f]"
                    />
                  </div>

                  {employeesLoading ? (
                    <div className="py-6 text-center text-xs text-gray-500">
                      <LoaderCircle
                        size={17}
                        className="mx-auto mb-2 animate-spin"
                      />
                      Loading employees from database...
                    </div>
                  ) : employeeError ? (
                    <div className="rounded-lg border border-red-500/20 bg-red-500/10 p-3">
                      <p className="text-xs text-red-300">{employeeError}</p>
                      <button
                        type="button"
                        onClick={loadEmployees}
                        className="mt-2 text-xs font-semibold text-white underline"
                      >
                        Retry
                      </button>
                    </div>
                  ) : employees.length === 0 ? (
                    <div className="py-6 text-center text-xs text-gray-500">
                      No active employees returned by the database.
                    </div>
                  ) : filteredEmployees.length === 0 ? (
                    <p className="py-4 text-center text-xs text-gray-500">
                      No employees match your search.
                    </p>
                  ) : (
                    <div className="max-h-44 space-y-1 overflow-y-auto">
                      {filteredEmployees.map((employee) => {
                        const employeeId = getId(employee);

                        return (
                          <label
                            key={employeeId}
                            className="flex cursor-pointer items-center gap-3 rounded-lg px-2.5 py-2.5 hover:bg-white/[0.04]"
                          >
                            <input
                              type="checkbox"
                              checked={form.employeeIds.includes(employeeId)}
                              onChange={() => toggleEmployee(employeeId)}
                              className="h-4 w-4 accent-[#c1121f]"
                            />

                            <span className="min-w-0 flex-1">
                              <span className="block truncate text-xs text-gray-200">
                                {employee.name || "Unnamed employee"}
                              </span>
                              <span className="mt-0.5 block truncate text-[11px] text-gray-500">
                                {employee.email || ""}
                                {employee.department
                                  ? ` · ${employee.department}`
                                  : ""}
                              </span>
                            </span>
                          </label>
                        );
                      })}
                    </div>
                  )}
                </div>
              )}

              <div>
                <label className="mb-2 block text-xs font-medium text-gray-300">
                  Publication status
                </label>
                <div className="relative">
                  <select
                    value={form.status}
                    onChange={(event) => updateField("status", event.target.value)}
                    className="w-full appearance-none rounded-lg border border-[#303030] bg-[#080808] px-3.5 py-3 pr-9 text-sm text-white outline-none focus:border-[#c1121f]"
                  >
                    <option value="published">Published</option>
                    <option value="draft">Draft</option>
                  </select>
                  <ChevronDown
                    size={15}
                    className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-gray-500"
                  />
                </div>
              </div>

              <div className="flex flex-col-reverse gap-2 border-t border-[#252525] pt-4 sm:flex-row sm:justify-end">
                <button
                  type="button"
                  onClick={closeModal}
                  disabled={saving}
                  className="rounded-lg border border-[#303030] px-4 py-2.5 text-sm text-gray-300 transition hover:bg-white/[0.04] disabled:opacity-50"
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  disabled={saving || employeesLoading}
                  className="inline-flex items-center justify-center gap-2 rounded-lg bg-[#c1121f] px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-[#df1727] disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {saving && (
                    <LoaderCircle size={15} className="animate-spin" />
                  )}
                  {saving
                    ? "Saving..."
                    : editingId
                      ? "Save changes"
                      : "Create announcement"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </section>
  );
}
