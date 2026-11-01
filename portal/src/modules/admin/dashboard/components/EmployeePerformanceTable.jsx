
import { useState } from "react";
import * as XLSX from "xlsx-js-style";

import Card from "@/modules/admin/shared/ui/Card";
import DataTable from "@/modules/admin/shared/ui/DataTable";
import Avatar from "@/modules/admin/shared/ui/Avatar";
import Stars from "@/modules/admin/shared/ui/Stars";
import apiClient, { unwrap } from "@/services/api/apiClient";

const EMPTY_FORM = {
  name: "",
  email: "",
  password: "",
  department: "",
  designation: "",
};

const getEmployeeId = (employee) =>
  employee?.id || employee?._id?.toString?.() || employee?._id || "";

const formatHours = (employee) => {
  if (employee.hoursFormatted) return employee.hoursFormatted;

  if (employee.hours != null && employee.hours !== "") {
    if (typeof employee.hours === "string") return employee.hours;

    const totalMinutes = Math.round(Number(employee.hours) * 60);

    if (!Number.isFinite(totalMinutes)) return "—";

    return `${Math.floor(totalMinutes / 60)}h ${totalMinutes % 60}m`;
  }

  if (employee.totalMinutes != null) {
    const totalMinutes = Math.max(
      0,
      Number(employee.totalMinutes) || 0
    );

    return `${Math.floor(totalMinutes / 60)}h ${totalMinutes % 60}m`;
  }

  return "—";
};

const formatMetric = (value) => {
  if (value == null || value === "") return "—";

  const number = Number(value);

  return Number.isFinite(number) ? number : "—";
};

const formatScore = (employee) => {
  const score = employee.score ?? employee.performanceScore;

  if (score == null || score === "") return null;

  const value = Number(score);

  return Number.isFinite(value) ? value : null;
};

const getErrorMessage = (error) =>
  error?.response?.data?.message ||
  error?.message ||
  "Unable to save employee. Please try again.";

// Excel styles
const styles = {
  brandHeader: {
    font: {
      name: "Arial",
      sz: 24,
      bold: true,
      color: { rgb: "FFFFFF" },
    },
    fill: {
      fgColor: { rgb: "C62828" },
    },
    alignment: {
      horizontal: "center",
      vertical: "center",
    },
  },

  subtitle: {
    font: {
      name: "Arial",
      sz: 13,
      bold: true,
      color: { rgb: "FFFFFF" },
    },
    fill: {
      fgColor: { rgb: "252525" },
    },
    alignment: {
      horizontal: "center",
      vertical: "center",
    },
  },

  section: {
    font: {
      name: "Arial",
      sz: 12,
      bold: true,
      color: { rgb: "FFFFFF" },
    },
    fill: {
      fgColor: { rgb: "B71C1C" },
    },
    alignment: {
      horizontal: "left",
      vertical: "center",
    },
  },

  label: {
    font: {
      name: "Arial",
      sz: 10,
      bold: true,
      color: { rgb: "7F1D1D" },
    },
    fill: {
      fgColor: { rgb: "FCE4E4" },
    },
    alignment: {
      vertical: "center",
    },
    border: {
      top: { style: "thin", color: { rgb: "E5B7B7" } },
      bottom: { style: "thin", color: { rgb: "E5B7B7" } },
      left: { style: "thin", color: { rgb: "E5B7B7" } },
      right: { style: "thin", color: { rgb: "E5B7B7" } },
    },
  },

  value: {
    font: {
      name: "Arial",
      sz: 10,
      color: { rgb: "262626" },
    },
    fill: {
      fgColor: { rgb: "FFF8F8" },
    },
    alignment: {
      vertical: "center",
      wrapText: true,
    },
    border: {
      top: { style: "thin", color: { rgb: "E5B7B7" } },
      bottom: { style: "thin", color: { rgb: "E5B7B7" } },
      left: { style: "thin", color: { rgb: "E5B7B7" } },
      right: { style: "thin", color: { rgb: "E5B7B7" } },
    },
  },

  tableHeader: {
    font: {
      name: "Arial",
      sz: 10,
      bold: true,
      color: { rgb: "FFFFFF" },
    },
    fill: {
      fgColor: { rgb: "333333" },
    },
    alignment: {
      horizontal: "center",
      vertical: "center",
      wrapText: true,
    },
    border: {
      top: { style: "thin", color: { rgb: "C62828" } },
      bottom: { style: "thin", color: { rgb: "C62828" } },
      left: { style: "thin", color: { rgb: "666666" } },
      right: { style: "thin", color: { rgb: "666666" } },
    },
  },

  tableCell: {
    font: {
      name: "Arial",
      sz: 10,
      color: { rgb: "262626" },
    },
    alignment: {
      horizontal: "center",
      vertical: "center",
      wrapText: true,
    },
    border: {
      top: { style: "thin", color: { rgb: "D9D9D9" } },
      bottom: { style: "thin", color: { rgb: "D9D9D9" } },
      left: { style: "thin", color: { rgb: "D9D9D9" } },
      right: { style: "thin", color: { rgb: "D9D9D9" } },
    },
  },

  footer: {
    font: {
      name: "Arial",
      sz: 9,
      italic: true,
      color: { rgb: "777777" },
    },
    alignment: {
      horizontal: "center",
      vertical: "center",
    },
  },
};

function downloadEmployeeReport(employee) {
  const score = formatScore(employee);

  const completed = formatMetric(
    employee.completed ?? employee.completedTasks
  );

  const delayed = formatMetric(
    employee.delayed ?? employee.delayedTasks
  );

  const attendance =
    employee.attendance == null || employee.attendance === ""
      ? "—"
      : `${employee.attendance}%`;

  const safeName = String(employee.name || "Employee")
    .trim()
    .replace(/[<>:"/\\|?*\x00-\x1F]/g, "_")
    .replace(/\s+/g, "_");

  const generatedOn = new Date().toLocaleString();

  const reportData = [
    ["DIGIAMPLIFY"],
    ["EMPLOYEE PERFORMANCE REPORT"],
    [],
    ["EMPLOYEE INFORMATION", "", "PERFORMANCE OVERVIEW"],
    ["Employee Name", employee.name || "—", "Hours Worked", formatHours(employee)],
    ["Email Address", employee.email || "—", "Completed Tasks", completed],
    ["Designation", employee.designation || employee.role || "—", "Delayed Tasks", delayed],
    ["Department", employee.department || "—", "Attendance", attendance],
    ["Generated On", generatedOn, "Performance Score", score == null ? "—" : `${score} / 5`],
    [],
    ["PERFORMANCE SUMMARY"],
    [
      "Metric",
      "Recorded Value",
      "Description",
      "Status",
    ],
    [
      "Hours Worked",
      formatHours(employee),
      "Total recorded working hours",
      "Recorded",
    ],
    [
      "Completed Tasks",
      completed,
      "Tasks successfully completed",
      "Recorded",
    ],
    [
      "Delayed Tasks",
      delayed,
      "Tasks marked as delayed",
      "Recorded",
    ],
    [
      "Attendance",
      attendance,
      "Employee attendance percentage",
      "Recorded",
    ],
    [
      "Performance Score",
      score == null ? "—" : `${score} / 5`,
      "Overall performance rating",
      "Recorded",
    ],
    [],
    ["CONFIDENTIAL EMPLOYEE REPORT"],
    ["Generated by DIGIAMPLIFY | Human Resource Management"],
  ];

  const worksheet = XLSX.utils.aoa_to_sheet(reportData);

  // Merge cells
  worksheet["!merges"] = [
    { s: { r: 0, c: 0 }, e: { r: 0, c: 3 } },
    { s: { r: 1, c: 0 }, e: { r: 1, c: 3 } },
    { s: { r: 3, c: 0 }, e: { r: 3, c: 1 } },
    { s: { r: 3, c: 2 }, e: { r: 3, c: 3 } },
    { s: { r: 10, c: 0 }, e: { r: 10, c: 3 } },
    { s: { r: 18, c: 0 }, e: { r: 18, c: 3 } },
    { s: { r: 19, c: 0 }, e: { r: 19, c: 3 } },
  ];

  // Column widths
  worksheet["!cols"] = [
    { wch: 24 },
    { wch: 30 },
    { wch: 34 },
    { wch: 20 },
  ];

  // Row heights
  worksheet["!rows"] = [
    { hpt: 42 },
    { hpt: 27 },
    { hpt: 10 },
    { hpt: 25 },
    { hpt: 24 },
    { hpt: 24 },
    { hpt: 24 },
    { hpt: 24 },
    { hpt: 24 },
    { hpt: 10 },
    { hpt: 27 },
    { hpt: 30 },
    { hpt: 27 },
    { hpt: 27 },
    { hpt: 27 },
    { hpt: 27 },
    { hpt: 27 },
    { hpt: 10 },
    { hpt: 25 },
    { hpt: 22 },
  ];

  // Apply styles to all populated cells
  const range = XLSX.utils.decode_range(worksheet["!ref"]);

  for (let row = range.s.r; row <= range.e.r; row++) {
    for (let col = range.s.c; col <= range.e.c; col++) {
      const address = XLSX.utils.encode_cell({
        r: row,
        c: col,
      });

      if (!worksheet[address]) continue;

      if (row === 0) {
        worksheet[address].s = styles.brandHeader;
      } else if (row === 1) {
        worksheet[address].s = styles.subtitle;
      } else if (row === 3 || row === 10) {
        worksheet[address].s = styles.section;
      } else if (row === 11) {
        worksheet[address].s = styles.tableHeader;
      } else if (row >= 4 && row <= 8) {
        worksheet[address].s =
          col === 0 || col === 2
            ? styles.label
            : styles.value;
      } else if (row >= 12 && row <= 16) {
        worksheet[address].s = styles.tableCell;
      } else if (row === 18 || row === 19) {
        worksheet[address].s = styles.footer;
      }
    }
  }

  // Center report title
  worksheet["A1"].s = styles.brandHeader;
  worksheet["A2"].s = styles.subtitle;

  // Filter for performance table
  worksheet["!autofilter"] = {
    ref: "A12:D17",
  };

  // Print settings
  worksheet["!pageSetup"] = {
    orientation: "landscape",
    paperSize: 9,
    fitToWidth: 1,
    fitToHeight: 1,
  };

  worksheet["!margins"] = {
    left: 0.3,
    right: 0.3,
    top: 0.5,
    bottom: 0.5,
    header: 0.2,
    footer: 0.2,
  };

  const workbook = XLSX.utils.book_new();

  XLSX.utils.book_append_sheet(
    workbook,
    worksheet,
    "Employee Report"
  );

  workbook.Props = {
    Title: "DigiAmplify Employee Performance Report",
    Subject: "Employee Performance",
    Author: "DigiAmplify",
    Company: "DigiAmplify",
    Category: "Human Resources",
    CreatedDate: new Date(),
  };

  XLSX.writeFile(
    workbook,
    `${safeName}_DigiAmplify_Performance_Report.xlsx`
  );
}

export default function EmployeePerformanceTable({
  employees = [],
  onDownload,
  onEmployeeAdded,
  onEmployeeUpdated,
}) {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingEmployee, setEditingEmployee] = useState(null);
  const [form, setForm] = useState(EMPTY_FORM);
  const [saving, setSaving] = useState(false);
  const [formError, setFormError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");

  const rows = Array.isArray(employees) ? employees : [];

  const closeModal = () => {
    if (saving) return;

    setIsModalOpen(false);
    setEditingEmployee(null);
    setForm(EMPTY_FORM);
    setFormError("");
  };

  const openAddModal = () => {
    setEditingEmployee(null);
    setForm(EMPTY_FORM);
    setFormError("");
    setSuccessMessage("");
    setIsModalOpen(true);
  };

  const openEditModal = (employee) => {
    setEditingEmployee(employee);

    setForm({
      name: employee.name || "",
      email: employee.email || "",
      password: "",
      department: employee.department || "",
      designation: employee.designation || "",
    });

    setFormError("");
    setSuccessMessage("");
    setIsModalOpen(true);
  };

  const handleChange = (event) => {
    const { name, value } = event.target;

    setForm((previous) => ({
      ...previous,
      [name]: value,
    }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    setFormError("");
    setSuccessMessage("");

    const name = form.name.trim();
    const email = form.email.trim().toLowerCase();
    const department = form.department.trim();
    const designation = form.designation.trim();

    if (!name || !email) {
      setFormError("Employee name and email are required.");
      return;
    }

    if (!editingEmployee && form.password.length < 8) {
      setFormError("Password must contain at least 8 characters.");
      return;
    }

    const employeeId = getEmployeeId(editingEmployee);

    if (editingEmployee && !employeeId) {
      setFormError(
        "Employee ID is missing. Please reload the employee list."
      );
      return;
    }

    setSaving(true);

    try {
      if (editingEmployee) {
        const payload = {
          name,
          department,
          designation,
        };

        await unwrap(
          apiClient.patch(`/users/${employeeId}`, payload)
        );

        if (onEmployeeUpdated) {
          await onEmployeeUpdated();
        } else if (onEmployeeAdded) {
          await onEmployeeAdded();
        }

        setSuccessMessage("Employee updated successfully.");
      } else {
        const payload = {
          name,
          email,
          password: form.password,
          department,
          designation,
        };

        await unwrap(
          apiClient.post("/users", payload)
        );

        if (onEmployeeAdded) {
          await onEmployeeAdded();
        }

        setSuccessMessage("Employee added successfully.");
      }

      setIsModalOpen(false);
      setEditingEmployee(null);
      setForm(EMPTY_FORM);
      setFormError("");
    } catch (error) {
      setFormError(getErrorMessage(error));
    } finally {
      setSaving(false);
    }
  };

  const handleDownload = (employee) => {
    try {
      downloadEmployeeReport(employee);
      onDownload?.(employee);
    } catch (error) {
      console.error(
        "Employee report download failed:",
        error
      );

      setFormError(
        "Unable to generate Excel report. Please try again."
      );
    }
  };

  const columns = [
    {
      key: "employee",
      header: "Employee",
      render: (employee) => (
        <div className="flex items-center gap-3">
          <Avatar />

          <div className="min-w-0">
            <p className="font-medium text-white">
              {employee.name || "Unnamed Employee"}
            </p>

            <p className="max-w-[180px] truncate text-[10px] text-gray-500">
              {employee.designation || employee.role || "Employee"}
            </p>

            <p className="max-w-[180px] truncate text-[10px] text-gray-500">
              {employee.email || ""}
            </p>
          </div>
        </div>
      ),
    },
    {
      key: "department",
      header: "Department",
      render: (employee) => employee.department || "—",
    },
    {
      key: "hours",
      header: "Hours Worked",
      render: (employee) => formatHours(employee),
    },
    {
      key: "completed",
      header: "Complete Task",
      render: (employee) =>
        formatMetric(
          employee.completed ?? employee.completedTasks
        ),
    },
    {
      key: "delayed",
      header: "Delayed Task",
      render: (employee) =>
        formatMetric(
          employee.delayed ?? employee.delayedTasks
        ),
    },
    {
      key: "attendance",
      header: "Attendance %",
      render: (employee) =>
        employee.attendance == null ||
        employee.attendance === ""
          ? "—"
          : `${employee.attendance}%`,
    },
    {
      key: "score",
      header: "Performance Score",
      render: (employee) => {
        const score = formatScore(employee);

        return score == null ? "—" : <Stars value={score} />;
      },
    },
    {
      key: "report",
      header: "Progress Report",
      render: (employee) => (
        <button
          type="button"
          onClick={() => handleDownload(employee)}
          className="whitespace-nowrap rounded border border-brand bg-brand/10 px-2 py-1.5 text-[10px] text-red-400 transition-colors hover:bg-brand hover:text-white"
        >
          Download Excel
        </button>
      ),
    },
    {
      key: "actions",
      header: "Actions",
      render: (employee) => (
        <button
          type="button"
          onClick={() => openEditModal(employee)}
          className="rounded-lg border border-white/10 px-3 py-1.5 text-xs text-gray-200 transition hover:border-red-500 hover:text-white"
        >
          Edit
        </button>
      ),
    },
  ];

  return (
    <>
      <Card title="Employee Performance Overview">
        <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
          <div>
            <p className="text-sm text-gray-400">
              Manage employees and review their recorded performance.
            </p>

            {successMessage && (
              <p
                className="mt-2 text-sm text-green-400"
                role="status"
              >
                {successMessage}
              </p>
            )}
          </div>

          <button
            type="button"
            onClick={openAddModal}
            className="rounded-lg bg-brand px-4 py-2 text-sm font-semibold text-white transition hover:opacity-90"
          >
            + Add Employee
          </button>
        </div>

        {rows.length > 0 ? (
          <DataTable
            columns={columns}
            rows={rows}
            minWidth={1050}
          />
        ) : (
          <div className="rounded-lg border border-white/10 px-4 py-10 text-center">
            <p className="text-sm font-medium text-white">
              No employees found
            </p>

            <p className="mt-1 text-sm text-gray-400">
              Add an employee or check whether the employee list API is loading.
            </p>
          </div>
        )}
      </Card>

      {isModalOpen && (
        <div
          className="fixed inset-0 z-[200] flex items-center justify-center overflow-y-auto bg-black/80 p-4"
          onMouseDown={(event) => {
            if (event.target === event.currentTarget) {
              closeModal();
            }
          }}
        >
          <div
            role="dialog"
            aria-modal="true"
            aria-labelledby="employee-form-title"
            className="my-auto w-full max-w-lg rounded-2xl border border-white/10 bg-[#0d0d0d] p-6 shadow-2xl"
          >
            <div className="mb-6 flex items-start justify-between gap-4">
              <div>
                <h2
                  id="employee-form-title"
                  className="text-xl font-semibold text-white"
                >
                  {editingEmployee
                    ? "Edit Employee"
                    : "Add New Employee"}
                </h2>

                <p className="mt-1 text-sm text-gray-400">
                  {editingEmployee
                    ? "Update the employee's profile details."
                    : "Create an employee account and login credentials."}
                </p>
              </div>

              <button
                type="button"
                disabled={saving}
                onClick={closeModal}
                aria-label="Close form"
                className="text-xl text-gray-400 hover:text-white disabled:opacity-50"
              >
                ×
              </button>
            </div>

            <form
              onSubmit={handleSubmit}
              className="space-y-4"
            >
              <div>
                <label
                  htmlFor="employee-name"
                  className="mb-1.5 block text-sm text-gray-300"
                >
                  Employee Name
                </label>

                <input
                  id="employee-name"
                  name="name"
                  type="text"
                  value={form.name}
                  onChange={handleChange}
                  placeholder="Enter full name"
                  maxLength={100}
                  autoComplete="name"
                  required
                  className="w-full rounded-lg border border-white/10 bg-black px-3 py-2.5 text-sm text-white outline-none focus:border-red-500"
                />
              </div>

              <div>
                <label
                  htmlFor="employee-email"
                  className="mb-1.5 block text-sm text-gray-300"
                >
                  Email Address
                </label>

                <input
                  id="employee-email"
                  name="email"
                  type="email"
                  value={form.email}
                  onChange={handleChange}
                  placeholder="employee@example.com"
                  autoComplete="email"
                  required
                  readOnly={Boolean(editingEmployee)}
                  className="w-full rounded-lg border border-white/10 bg-black px-3 py-2.5 text-sm text-white outline-none focus:border-red-500 read-only:cursor-not-allowed read-only:opacity-60"
                />

                {editingEmployee && (
                  <p className="mt-1 text-xs text-gray-500">
                    Email address cannot be changed here.
                  </p>
                )}
              </div>

              {!editingEmployee && (
                <div>
                  <label
                    htmlFor="employee-password"
                    className="mb-1.5 block text-sm text-gray-300"
                  >
                    Temporary Password
                  </label>

                  <input
                    id="employee-password"
                    name="password"
                    type="password"
                    value={form.password}
                    onChange={handleChange}
                    placeholder="At least 8 characters"
                    minLength={8}
                    autoComplete="new-password"
                    required
                    className="w-full rounded-lg border border-white/10 bg-black px-3 py-2.5 text-sm text-white outline-none focus:border-red-500"
                  />
                </div>
              )}

              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <label
                    htmlFor="employee-department"
                    className="mb-1.5 block text-sm text-gray-300"
                  >
                    Department
                  </label>

                  <input
                    id="employee-department"
                    name="department"
                    type="text"
                    value={form.department}
                    onChange={handleChange}
                    placeholder="e.g. Development"
                    maxLength={100}
                    className="w-full rounded-lg border border-white/10 bg-black px-3 py-2.5 text-sm text-white outline-none focus:border-red-500"
                  />
                </div>

                <div>
                  <label
                    htmlFor="employee-designation"
                    className="mb-1.5 block text-sm text-gray-300"
                  >
                    Designation
                  </label>

                  <input
                    id="employee-designation"
                    name="designation"
                    type="text"
                    value={form.designation}
                    onChange={handleChange}
                    placeholder="e.g. Developer"
                    maxLength={100}
                    className="w-full rounded-lg border border-white/10 bg-black px-3 py-2.5 text-sm text-white outline-none focus:border-red-500"
                  />
                </div>
              </div>

              {formError && (
                <p
                  role="alert"
                  className="rounded-lg bg-red-500/10 p-3 text-sm text-red-400"
                >
                  {formError}
                </p>
              )}

              <div className="flex justify-end gap-3 pt-2">
                <button
                  type="button"
                  disabled={saving}
                  onClick={closeModal}
                  className="rounded-lg border border-white/10 px-4 py-2.5 text-sm text-gray-300 hover:bg-white/5 disabled:opacity-50"
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  disabled={saving}
                  className="rounded-lg bg-brand px-5 py-2.5 text-sm font-semibold text-white hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {saving
                    ? "Saving..."
                    : editingEmployee
                      ? "Save Changes"
                      : "Save Employee"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}
