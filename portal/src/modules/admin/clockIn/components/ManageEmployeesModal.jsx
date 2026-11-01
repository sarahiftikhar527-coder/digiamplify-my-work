import { useCallback, useEffect, useState } from "react";
import {
  Users,
  UserPlus,
  Search,
  X,
  Pencil,
  UserRoundX,
  UserRoundCheck,
  KeyRound,
  RefreshCw,
  LoaderCircle,
  Eye,
  EyeOff,
} from "lucide-react";

const API_URL = (
  import.meta.env.VITE_API_URL || "http://localhost:5000/api/v1"
).replace(/\/$/, "");

const getToken = () => {
  const keys = [
    "token",
    "accessToken",
    "access_token",
    "digiamplify_token",
    "digiamplify_access_token",
  ];

  for (const storage of [localStorage, sessionStorage]) {
    for (const key of keys) {
      const value = storage.getItem(key);
      if (!value) continue;

      try {
        const parsed = JSON.parse(value);

        if (typeof parsed === "string") return parsed;
        if (parsed?.token) return parsed.token;
        if (parsed?.accessToken) return parsed.accessToken;
        if (parsed?.access_token) return parsed.access_token;
      } catch {
        return value;
      }
    }
  }

  return "";
};

const request = async (path, options = {}) => {
  const token = getToken();

  const response = await fetch(`${API_URL}${path}`, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...options.headers,
    },
  });

  const result = await response.json().catch(() => ({}));

  if (!response.ok || result.success === false) {
    throw new Error(
      result.message || result.error?.message || "Request failed."
    );
  }

  return result.data ?? result;
};

const getEmployeeArray = (result) => {
  const employees = result?.employees;

  if (Array.isArray(employees)) return employees;
  if (Array.isArray(employees?.employees)) return employees.employees;
  if (Array.isArray(result?.data?.employees)) return result.data.employees;
  if (Array.isArray(result?.data?.employees?.employees)) {
    return result.data.employees.employees;
  }

  return [];
};

const emptyForm = {
  name: "",
  email: "",
  password: "",
  pin: "",
};

const inputClass =
  "w-full rounded-xl border border-white/10 bg-[#171717] px-3.5 py-3 text-sm text-white outline-none transition placeholder:text-gray-500 focus:border-blue-500";

const labelClass = "mb-1.5 block text-sm font-medium text-gray-300";

const ManageEmployeesModal = ({ onClose }) => {
  const [employees, setEmployees] = useState([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [editingEmployee, setEditingEmployee] = useState(null);
  const [form, setForm] = useState(emptyForm);
  const [pinEmployee, setPinEmployee] = useState(null);
  const [newPin, setNewPin] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showPin, setShowPin] = useState(false);

  const loadEmployees = useCallback(async () => {
    setLoading(true);
    setError("");

    try {
      const result = await request("/users?limit=100");
      setEmployees(getEmployeeArray(result));
    } catch (err) {
      setError(err.message || "Unable to load employees.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadEmployees();
  }, [loadEmployees]);

  useEffect(() => {
    const handleKeyDown = (event) => {
      if (event.key === "Escape" && !saving) onClose?.();
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [onClose, saving]);

  const openAddForm = () => {
    setEditingEmployee(null);
    setForm(emptyForm);
    setError("");
    setNotice("");
    setShowPassword(false);
    setShowPin(false);
    setShowForm(true);
  };

  const openEditForm = (employee) => {
    setEditingEmployee(employee);
    setForm({
      name: employee.name || "",
      email: employee.email || "",
      password: "",
      pin: "",
    });
    setError("");
    setNotice("");
    setShowPassword(false);
    setShowPin(false);
    setShowForm(true);
  };

  const closeForm = () => {
    if (saving) return;
    setShowForm(false);
    setEditingEmployee(null);
    setForm(emptyForm);
  };

  const handleChange = (event) => {
    const { name, value } = event.target;

    if (name === "pin" && !/^\d{0,4}$/.test(value)) return;

    setForm((current) => ({ ...current, [name]: value }));
  };

  const handleSave = async (event) => {
    event.preventDefault();
    setError("");
    setNotice("");

    if (!form.name.trim() || !form.email.trim()) {
      setError("Name and email address are required.");
      return;
    }

    if (!editingEmployee && form.password.length < 8) {
      setError("Password must contain at least 8 characters.");
      return;
    }

    if (editingEmployee && form.password && form.password.length < 8) {
      setError("Password must contain at least 8 characters.");
      return;
    }

    if (!/^\d{4}$/.test(form.pin)) {
      setError("A 4-digit attendance PIN is required.");
      return;
    }

    setSaving(true);

    const employeeId = editingEmployee?._id || editingEmployee?.id;
    let savedEmployeeId = employeeId;
    let employeeSaved = false;

    try {
      if (editingEmployee) {
        const employeeData = {
          name: form.name.trim(),
          ...(form.password ? { password: form.password } : {}),
        };

        await request(`/users/${employeeId}`, {
          method: "PATCH",
          body: JSON.stringify(employeeData),
        });

        employeeSaved = true;
      } else {
        const result = await request("/users", {
          method: "POST",
          body: JSON.stringify({
            name: form.name.trim(),
            email: form.email.trim(),
            password: form.password,
          }),
        });

        const employee =
          result?.employee || result?.data?.employee || result;

        savedEmployeeId = employee?._id || employee?.id;
        employeeSaved = true;
      }

      if (!savedEmployeeId) {
        throw new Error(
          "Employee was saved, but the employee ID was not returned by the server. Please refresh and set the PIN separately."
        );
      }

      try {
        await request(
          `/attendance/admin/employee/${savedEmployeeId}/pin`,
          {
            method: "PATCH",
            body: JSON.stringify({ newPin: form.pin }),
          }
        );
      } catch (pinError) {
        setNotice(
          `Employee details saved, but the PIN could not be saved: ${pinError.message}`
        );
        setShowForm(false);
        await loadEmployees();
        return;
      }

      setNotice(
        editingEmployee
          ? "Employee details and attendance PIN updated successfully."
          : "Employee created and attendance PIN assigned successfully."
      );

      setShowForm(false);
      setEditingEmployee(null);
      setForm(emptyForm);
      await loadEmployees();
    } catch (err) {
      setError(
        employeeSaved
          ? `Employee details were saved, but the operation could not be completed: ${err.message}`
          : err.message || "Unable to save employee."
      );
    } finally {
      setSaving(false);
    }
  };

  const handleStatus = async (employee) => {
    const employeeId = employee._id || employee.id;
    const isActive = employee.status !== "inactive";

    const confirmed = window.confirm(
      isActive
        ? `Deactivate ${employee.name}?`
        : `Activate ${employee.name}?`
    );

    if (!confirmed) return;

    setError("");
    setNotice("");
    setSaving(true);

    try {
      if (isActive) {
        await request(`/users/${employeeId}/deactivate`, {
          method: "PATCH",
        });
      } else {
        await request(`/users/${employeeId}`, {
          method: "PATCH",
          body: JSON.stringify({ status: "active" }),
        });
      }

      setNotice(
        isActive
          ? "Employee deactivated successfully."
          : "Employee activated successfully."
      );

      await loadEmployees();
    } catch (err) {
      setError(err.message || "Unable to update employee status.");
    } finally {
      setSaving(false);
    }
  };

  const handleSetPin = async (event) => {
    event.preventDefault();
    setError("");
    setNotice("");

    if (!/^\d{4}$/.test(newPin)) {
      setError("Enter a valid 4-digit attendance PIN.");
      return;
    }

    const employeeId = pinEmployee?._id || pinEmployee?.id;
    setSaving(true);

    try {
      await request(`/attendance/admin/employee/${employeeId}/pin`, {
        method: "PATCH",
        body: JSON.stringify({ newPin }),
      });

      setNotice(`Attendance PIN updated for ${pinEmployee.name}.`);
      setPinEmployee(null);
      setNewPin("");
    } catch (err) {
      setError(err.message || "Unable to update attendance PIN.");
    } finally {
      setSaving(false);
    }
  };

  const filteredEmployees = employees.filter((employee) => {
    const query = search.toLowerCase().trim();

    return [
      employee.name,
      employee.email,
      employee.loginId,
      employee.employeeId,
      employee._id,
    ].some((value) => String(value || "").toLowerCase().includes(query));
  });

  return (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center bg-black/80 p-3 backdrop-blur-sm sm:p-6"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget && !saving) onClose?.();
      }}
    >
      <div className="flex max-h-[92vh] w-full max-w-6xl flex-col overflow-hidden rounded-2xl border border-white/10 bg-[#0d0d0d] text-white shadow-2xl">
        <div className="flex items-center justify-between gap-4 border-b border-white/10 px-5 py-4 sm:px-7">
          <div className="flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-blue-500/10 text-blue-400">
              <Users size={23} />
            </div>
            <div>
              <h2 className="text-lg font-semibold sm:text-xl">
                Manage Employees
              </h2>
              <p className="mt-1 text-xs text-gray-400 sm:text-sm">
                Manage employee accounts and attendance PINs.
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            disabled={saving}
            aria-label="Close modal"
            className="rounded-lg p-2 text-gray-400 transition hover:bg-white/10 hover:text-white disabled:opacity-50"
          >
            <X size={22} />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-5 sm:p-7">
          {error && (
            <div className="mb-4 flex items-start justify-between gap-3 rounded-xl border border-red-500/20 bg-red-500/10 px-4 py-3 text-sm text-red-300">
              <span>{error}</span>
              <button type="button" onClick={() => setError("")}>
                <X size={17} />
              </button>
            </div>
          )}

          {notice && (
            <div className="mb-4 flex items-start justify-between gap-3 rounded-xl border border-green-500/20 bg-green-500/10 px-4 py-3 text-sm text-green-300">
              <span>{notice}</span>
              <button type="button" onClick={() => setNotice("")}>
                <X size={17} />
              </button>
            </div>
          )}

          {pinEmployee ? (
            <form onSubmit={handleSetPin} className="mx-auto max-w-md py-5">
              <div className="mb-5 flex items-center gap-3">
                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-blue-500/10 text-blue-400">
                  <KeyRound size={23} />
                </div>
                <div>
                  <h3 className="font-semibold">Reset Attendance PIN</h3>
                  <p className="text-sm text-gray-400">
                    {pinEmployee.name}
                  </p>
                </div>
              </div>

              <label className={labelClass} htmlFor="employee-new-pin">
                New 4-Digit PIN *
              </label>
              <div className="relative">
                <input
                  id="employee-new-pin"
                  type={showPin ? "text" : "password"}
                  inputMode="numeric"
                  autoComplete="new-password"
                  maxLength={4}
                  value={newPin}
                  onChange={(event) => {
                    if (/^\d{0,4}$/.test(event.target.value)) {
                      setNewPin(event.target.value);
                    }
                  }}
                  placeholder="Enter 4-digit PIN"
                  className={`${inputClass} pr-12`}
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPin((value) => !value)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-white"
                  aria-label="Toggle PIN visibility"
                >
                  {showPin ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>

              <div className="mt-6 flex justify-end gap-3">
                <button
                  type="button"
                  onClick={() => {
                    setPinEmployee(null);
                    setNewPin("");
                    setError("");
                  }}
                  disabled={saving}
                  className="rounded-xl border border-white/10 px-4 py-2.5 text-sm text-gray-300 hover:bg-white/5"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="flex items-center gap-2 rounded-xl bg-blue-600 px-5 py-2.5 text-sm font-medium hover:bg-blue-500 disabled:opacity-60"
                >
                  {saving && <LoaderCircle size={16} className="animate-spin" />}
                  Save PIN
                </button>
              </div>
            </form>
          ) : showForm ? (
            <form onSubmit={handleSave}>
              <div className="mb-5 flex items-center justify-between">
                <h3 className="font-semibold">
                  {editingEmployee ? "Edit Employee" : "Add New Employee"}
                </h3>
                <button
                  type="button"
                  onClick={closeForm}
                  disabled={saving}
                  className="text-sm text-gray-400 hover:text-white"
                >
                  Back to Employees
                </button>
              </div>

              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div>
                  <label className={labelClass} htmlFor="employee-name">
                    Full Name *
                  </label>
                  <input
                    id="employee-name"
                    name="name"
                    value={form.name}
                    onChange={handleChange}
                    className={`${inputClass} ${editingEmployee ? "cursor-not-allowed opacity-70" : ""}`}
                    placeholder="Employee full name"
                    readOnly={Boolean(editingEmployee)}
                    required
                  />
                </div>

                <div>
                  <label className={labelClass} htmlFor="employee-email">
                    Email Address *
                  </label>
                  <input
                    id="employee-email"
                    name="email"
                    type="email"
                    value={form.email}
                    onChange={handleChange}
                    className={`${inputClass} ${editingEmployee ? "cursor-not-allowed opacity-70" : ""}`}
                    placeholder="employee@example.com"
                    readOnly={Boolean(editingEmployee)}
                    required
                  />
                </div>

                <div>
                  <label className={labelClass} htmlFor="employee-login-id">
                    Login ID
                  </label>
                  <input
                    id="employee-login-id"
                    value={
                      editingEmployee
                        ? editingEmployee.loginId ||
                          editingEmployee.employeeId ||
                          editingEmployee._id ||
                          editingEmployee.id ||
                          ""
                        : "Generated when the account is created"
                    }
                    className={`${inputClass} cursor-not-allowed opacity-70`}
                    readOnly
                  />
                </div>

                <div>
                  <label className={labelClass} htmlFor="employee-password">
                    {editingEmployee ? "New Password (Optional)" : "Password *"}
                  </label>
                  <div className="relative">
                    <input
                      id="employee-password"
                      name="password"
                      type={showPassword ? "text" : "password"}
                      value={form.password}
                      onChange={handleChange}
                      className={`${inputClass} pr-12`}
                      placeholder={
                        editingEmployee
                          ? "Leave blank to keep current password"
                          : "At least 8 characters"
                      }
                      required={!editingEmployee}
                      minLength={8}
                      autoComplete="new-password"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword((value) => !value)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-white"
                      aria-label="Toggle password visibility"
                    >
                      {showPassword ? (
                        <EyeOff size={18} />
                      ) : (
                        <Eye size={18} />
                      )}
                    </button>
                  </div>
                </div>

                <div className="sm:col-span-2">
                  <label className={labelClass} htmlFor="employee-pin">
                    Attendance PIN *
                  </label>
                  <div className="relative">
                    <input
                      id="employee-pin"
                      name="pin"
                      type={showPin ? "text" : "password"}
                      inputMode="numeric"
                      maxLength={4}
                      value={form.pin}
                      onChange={handleChange}
                      className={`${inputClass} pr-12`}
                      placeholder="Enter a 4-digit attendance PIN"
                      autoComplete="new-password"
                      required
                    />
                    <button
                      type="button"
                      onClick={() => setShowPin((value) => !value)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-white"
                      aria-label="Toggle PIN visibility"
                    >
                      {showPin ? <EyeOff size={18} /> : <Eye size={18} />}
                    </button>
                  </div>
                  <p className="mt-1.5 text-xs text-gray-500">
                    A 4-digit PIN is required for attendance clock-in and
                    clock-out.
                  </p>
                </div>
              </div>

              <div className="mt-6 flex justify-end gap-3 border-t border-white/10 pt-5">
                <button
                  type="button"
                  onClick={closeForm}
                  disabled={saving}
                  className="rounded-xl border border-white/10 px-5 py-2.5 text-sm text-gray-300 hover:bg-white/5"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="flex items-center gap-2 rounded-xl bg-blue-600 px-5 py-2.5 text-sm font-medium hover:bg-blue-500 disabled:opacity-60"
                >
                  {saving && <LoaderCircle size={16} className="animate-spin" />}
                  {editingEmployee ? "Save Changes" : "Create Employee"}
                </button>
              </div>
            </form>
          ) : (
            <>
              <div className="mb-5 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <div className="relative w-full sm:max-w-sm">
                  <Search
                    size={18}
                    className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-500"
                  />
                  <input
                    value={search}
                    onChange={(event) => setSearch(event.target.value)}
                    className={`${inputClass} pl-10`}
                    placeholder="Search by name, email, or login ID..."
                    aria-label="Search employees"
                  />
                </div>

                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={loadEmployees}
                    disabled={loading || saving}
                    className="flex items-center justify-center gap-2 rounded-xl border border-white/10 px-4 py-2.5 text-sm text-gray-300 hover:bg-white/5 disabled:opacity-50"
                  >
                    <RefreshCw
                      size={16}
                      className={loading ? "animate-spin" : ""}
                    />
                    Refresh
                  </button>
                  <button
                    type="button"
                    onClick={openAddForm}
                    className="flex items-center justify-center gap-2 rounded-xl bg-blue-600 px-4 py-2.5 text-sm font-medium hover:bg-blue-500"
                  >
                    <UserPlus size={17} />
                    Add Employee
                  </button>
                </div>
              </div>

              <div className="mb-4 grid grid-cols-2 gap-3 sm:grid-cols-3">
                <div className="rounded-xl border border-white/10 bg-[#141414] p-4">
                  <p className="text-sm text-gray-400">Total Employees</p>
                  <p className="mt-1 text-2xl font-semibold">
                    {employees.length}
                  </p>
                </div>
                <div className="rounded-xl border border-white/10 bg-[#141414] p-4">
                  <p className="text-sm text-gray-400">Active</p>
                  <p className="mt-1 text-2xl font-semibold text-green-400">
                    {
                      employees.filter((item) => item.status !== "inactive")
                        .length
                    }
                  </p>
                </div>
                <div className="col-span-2 rounded-xl border border-white/10 bg-[#141414] p-4 sm:col-span-1">
                  <p className="text-sm text-gray-400">Inactive</p>
                  <p className="mt-1 text-2xl font-semibold text-gray-400">
                    {
                      employees.filter((item) => item.status === "inactive")
                        .length
                    }
                  </p>
                </div>
              </div>

              <div className="overflow-x-auto rounded-xl border border-white/10">
                <table className="w-full min-w-[700px] text-left text-sm">
                  <thead className="bg-[#171717] text-xs uppercase tracking-wide text-gray-400">
                    <tr>
                      <th className="px-4 py-4 font-medium">Employee</th>
                      <th className="px-4 py-4 font-medium">Login ID</th>
                      <th className="px-4 py-4 font-medium">Status</th>
                      <th className="px-4 py-4 text-right font-medium">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/5">
                    {loading ? (
                      <tr>
                        <td colSpan={4} className="px-4 py-12 text-center">
                          <LoaderCircle
                            size={25}
                            className="mx-auto animate-spin text-blue-400"
                          />
                          <p className="mt-3 text-gray-400">
                            Loading employees...
                          </p>
                        </td>
                      </tr>
                    ) : filteredEmployees.length === 0 ? (
                      <tr>
                        <td
                          colSpan={4}
                          className="px-4 py-12 text-center text-gray-400"
                        >
                          {error
                            ? "Unable to load employees. Please refresh."
                            : "No employees found."}
                        </td>
                      </tr>
                    ) : (
                      filteredEmployees.map((employee) => {
                        const active = employee.status !== "inactive";
                        const loginId =
                          employee.loginId ||
                          employee.employeeId ||
                          employee._id ||
                          employee.id ||
                          "—";

                        return (
                          <tr
                            key={employee._id || employee.id}
                            className="transition hover:bg-white/[0.025]"
                          >
                            <td className="px-4 py-4">
                              <div className="font-medium text-white">
                                {employee.name || "Unnamed"}
                              </div>
                              <div className="mt-1 text-xs text-gray-500">
                                {employee.email || "No email"}
                              </div>
                            </td>
                            <td className="px-4 py-4 text-gray-300">
                              {loginId}
                            </td>
                            <td className="px-4 py-4">
                              <span
                                className={`inline-flex rounded-full px-2.5 py-1 text-xs font-medium ${
                                  active
                                    ? "bg-green-500/10 text-green-400"
                                    : "bg-gray-500/10 text-gray-400"
                                }`}
                              >
                                {active ? "Active" : "Inactive"}
                              </span>
                            </td>
                            <td className="px-4 py-4">
                              <div className="flex items-center justify-end gap-1.5">
                                <button
                                  type="button"
                                  title="Edit employee"
                                  onClick={() => openEditForm(employee)}
                                  disabled={saving}
                                  className="rounded-lg p-2 text-blue-400 transition hover:bg-blue-500/10 disabled:opacity-50"
                                >
                                  <Pencil size={17} />
                                </button>
                                <button
                                  type="button"
                                  title="Reset attendance PIN"
                                  onClick={() => {
                                    setError("");
                                    setNotice("");
                                    setPinEmployee(employee);
                                    setNewPin("");
                                    setShowPin(false);
                                  }}
                                  disabled={saving || !active}
                                  className="rounded-lg p-2 text-amber-400 transition hover:bg-amber-500/10 disabled:opacity-50"
                                >
                                  <KeyRound size={17} />
                                </button>
                                <button
                                  type="button"
                                  title={
                                    active
                                      ? "Deactivate employee"
                                      : "Activate employee"
                                  }
                                  onClick={() => handleStatus(employee)}
                                  disabled={saving}
                                  className={`rounded-lg p-2 transition disabled:opacity-50 ${
                                    active
                                      ? "text-red-400 hover:bg-red-500/10"
                                      : "text-green-400 hover:bg-green-500/10"
                                  }`}
                                >
                                  {active ? (
                                    <UserRoundX size={17} />
                                  ) : (
                                    <UserRoundCheck size={17} />
                                  )}
                                </button>
                              </div>
                            </td>
                          </tr>
                        );
                      })
                    )}
                  </tbody>
                </table>
              </div>

              <p className="mt-3 text-xs text-gray-500">
                Deactivating an employee disables their account without
                permanently deleting the record.
              </p>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default ManageEmployeesModal;