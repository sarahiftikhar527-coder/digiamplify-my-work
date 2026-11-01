
import { useEffect, useState } from "react";
import {
  Clock,
  CheckSquare,
  AlertTriangle,
  Users,
  X,
  LoaderCircle,
  ClipboardList,
  TrendingUp,
} from "lucide-react";

import AdminStatCard from "@/modules/admin/shared/ui/AdminStatCard";
import useAdminStats from "@/modules/admin/dashboard/hooks/useAdminStats";

const icons = {
  clock: Clock,
  check: CheckSquare,
  alert: AlertTriangle,
  users: Users,
  tasks: ClipboardList,
  progress: TrendingUp,
};

const gridClass = "grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-4";

const detailTitles = {
  clock: "Employees Clocked In Today",
  totalTasks: "All Employee Tasks",
  pending: "Pending Tasks",
  inProgress: "Tasks In Progress",
  completed: "Completed Tasks",
  overdue: "Overdue Tasks",
  users: "Active Employees",
};

const formatDate = (value) => {
  if (!value) return "Not available";

  const date = new Date(value);

  return Number.isNaN(date.getTime())
    ? "Not available"
    : date.toLocaleString();
};

export default function AdminStatCards() {
  const { stats, loading, error, reload } = useAdminStats();
  const [selectedStat, setSelectedStat] = useState(null);

  if (loading) {
    return (
      <div className={gridClass}>
        {Array.from({ length: 5 }).map((_, index) => (
          <div
            key={index}
            className="h-24 animate-pulse rounded-lg bg-gray-200"
          />
        ))}
      </div>
    );
  }

  if (error) {
    return (
      <div className="rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-600">
        {error}{" "}
        <button type="button" onClick={reload} className="underline">
          Retry
        </button>
      </div>
    );
  }

  return (
    <>
      <div className={gridClass}>
        {stats.map((stat) => (
          <button
            key={stat.id}
            type="button"
            onClick={() => setSelectedStat(stat)}
            className="group w-full rounded-xl text-left transition hover:-translate-y-0.5 focus:outline-none focus-visible:ring-2 focus-visible:ring-green-500"
            aria-label={`View details for ${stat.label}`}
          >
            <AdminStatCard
              icon={icons[stat.icon] || ClipboardList}
              label={stat.label}
              sub={stat.period}
              value={stat.value}
            />
          </button>
        ))}
      </div>

      {selectedStat && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4"
          onMouseDown={(event) => {
            if (event.target === event.currentTarget) {
              setSelectedStat(null);
            }
          }}
          role="presentation"
        >
          <section
            role="dialog"
            aria-modal="true"
            aria-labelledby="stat-detail-title"
            className="w-full max-w-2xl overflow-hidden rounded-2xl bg-white shadow-2xl"
          >
            <div className="flex items-start justify-between gap-4 border-b border-gray-200 p-5">
              <div>
                <h2
                  id="stat-detail-title"
                  className="text-lg font-semibold text-gray-900"
                >
                  {detailTitles[selectedStat.id] || selectedStat.label}
                </h2>

                <p className="mt-1 text-sm text-gray-500">
                  {selectedStat.period} · Current count: {selectedStat.value}
                </p>
              </div>

              <button
                type="button"
                onClick={() => setSelectedStat(null)}
                className="rounded-lg p-2 text-gray-500 hover:bg-gray-100 hover:text-gray-900"
                aria-label="Close details"
              >
                <X size={20} />
              </button>
            </div>

            <div className="p-5">
              {selectedStat.id === "users" ? (
                <EmployeeDetails />
              ) : (
                <StatDetails stat={selectedStat} />
              )}
            </div>
          </section>
        </div>
      )}
    </>
  );
}

function StatDetails({ stat }) {
  const [records, setRecords] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let cancelled = false;

    const endpoints = {
      clock: "/dashboard/admin/clocked-in",
      totalTasks: "/dashboard/admin/tasks?status=all",
      pending: "/dashboard/admin/tasks?status=pending",
      inProgress: "/dashboard/admin/tasks?status=in-progress",
      completed: "/dashboard/admin/tasks?status=completed",
      overdue: "/dashboard/admin/tasks?status=overdue",
    };

    async function fetchDetails() {
      setLoading(true);
      setError("");
      setRecords([]);

      try {
        const apiUrl = import.meta.env.VITE_API_URL;
        const token = localStorage.getItem("digiamplify_token");
        const endpoint = endpoints[stat.id];

        if (!apiUrl) {
          throw new Error("The API URL is not configured.");
        }

        if (!token) {
          throw new Error("Your session has expired. Please log in again.");
        }

        if (!endpoint) {
          throw new Error("No API is configured for this statistic.");
        }

        const response = await fetch(`${apiUrl}${endpoint}`, {
          headers: {
            Authorization: `Bearer ${token}`,
            Accept: "application/json",
          },
        });

        const result = await response.json();

        if (!response.ok) {
          throw new Error(result?.message || "Unable to load details.");
        }

        if (!cancelled) {
          setRecords(Array.isArray(result.records) ? result.records : []);
        }
      } catch (err) {
        if (!cancelled) {
          setError(err.message || "Unable to load details.");
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    }

    fetchDetails();

    return () => {
      cancelled = true;
    };
  }, [stat.id]);

  if (loading) {
    return (
      <div className="flex items-center gap-2 py-5 text-sm text-gray-500">
        <LoaderCircle size={18} className="animate-spin" />
        Loading records from the database...
      </div>
    );
  }

  if (error) {
    return (
      <div className="rounded-lg bg-red-50 p-4 text-sm text-red-700">
        {error}
      </div>
    );
  }

  if (records.length === 0) {
    return (
      <p className="rounded-lg bg-gray-50 p-4 text-sm text-gray-600">
        No records were found for this statistic.
      </p>
    );
  }

  return (
    <div className="max-h-96 space-y-3 overflow-y-auto">
      {records.map((record) => {
        const isClockRecord = stat.id === "clock";
        const employee = isClockRecord
          ? record.employee
          : record.assignedTo;

        return (
          <article
            key={record._id || record.id}
            className="rounded-xl border border-gray-200 p-4"
          >
            {isClockRecord ? (
              <>
                <div className="flex items-start justify-between gap-3">
                  <h3 className="font-semibold text-gray-900">
                    {employee?.name || "Unknown Employee"}
                  </h3>

                  <span className="rounded-full bg-green-50 px-2.5 py-1 text-xs font-medium text-green-700">
                    Clocked In
                  </span>
                </div>

                <p className="mt-1 text-sm text-gray-600">
                  {employee?.email || "No email available"}
                </p>

                <p className="mt-2 text-sm text-gray-600">
                  Check-in: {formatDate(record.checkIn)}
                </p>

                <p className="mt-1 text-sm text-gray-500">
                  Department: {employee?.department || "Not specified"}
                </p>
              </>
            ) : (
              <>
                <div className="flex items-start justify-between gap-3">
                  <h3 className="font-semibold text-gray-900">
                    {record.title || "Untitled Task"}
                  </h3>

                  <span className="shrink-0 rounded-full bg-gray-100 px-2.5 py-1 text-xs font-medium text-gray-700">
                    {record.status || "Unknown"}
                  </span>
                </div>

                <p className="mt-1 text-sm text-gray-600">
                  {record.description || "No description provided."}
                </p>

                <div className="mt-3 rounded-lg bg-gray-50 p-3">
                  <p className="text-sm font-medium text-gray-800">
                    Assigned to: {employee?.name || "Unknown Employee"}
                  </p>

                  <p className="mt-1 text-sm text-gray-600">
                    {employee?.email || "No email available"}
                  </p>

                  <p className="mt-1 text-sm text-gray-500">
                    Department: {employee?.department || "Not specified"}
                  </p>
                </div>

                <p className="mt-3 text-sm text-gray-600">
                  Due date: {formatDate(record.dueDate)}
                </p>

                {stat.id === "completed" && (
                  <p className="mt-1 text-sm text-green-700">
                    Completed at: {formatDate(record.completedAt)}
                  </p>
                )}

                {record.assignedBy && (
                  <p className="mt-1 text-sm text-gray-500">
                    Assigned by: {record.assignedBy.name || "Admin"}
                  </p>
                )}
              </>
            )}
          </article>
        );
      })}
    </div>
  );
}

function EmployeeDetails() {
  const [employees, setEmployees] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let cancelled = false;

    async function fetchEmployees() {
      try {
        const apiUrl = import.meta.env.VITE_API_URL;
        const token = localStorage.getItem("digiamplify_token");

        if (!apiUrl) {
          throw new Error("The API URL is not configured.");
        }

        if (!token) {
          throw new Error("Your session has expired. Please log in again.");
        }

        const response = await fetch(
          `${apiUrl}/users?role=employee&limit=100`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
              Accept: "application/json",
            },
          }
        );

        const result = await response.json();

        if (!response.ok) {
          throw new Error(result?.message || "Unable to load employees.");
        }

        const data = result.data ?? result;
        const records = Array.isArray(data.users)
          ? data.users
          : Array.isArray(data.employees)
            ? data.employees
            : Array.isArray(data.employees?.employees)
              ? data.employees.employees
              : Array.isArray(data.data?.users)
                ? data.data.users
                : [];

        if (!cancelled) {
          setEmployees(records);
        }
      } catch (err) {
        if (!cancelled) {
          setError(err.message || "Unable to load employees.");
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    }

    fetchEmployees();

    return () => {
      cancelled = true;
    };
  }, []);

  if (loading) {
    return (
      <div className="flex items-center gap-2 py-5 text-sm text-gray-500">
        <LoaderCircle size={18} className="animate-spin" />
        Loading employees from the database...
      </div>
    );
  }

  if (error) {
    return (
      <p className="rounded-lg bg-red-50 p-3 text-sm text-red-700">
        {error}
      </p>
    );
  }

  if (employees.length === 0) {
    return (
      <p className="rounded-lg bg-gray-50 p-4 text-sm text-gray-600">
        No employee records were returned by the API.
      </p>
    );
  }

  return (
    <div className="max-h-96 space-y-3 overflow-y-auto">
      {employees.map((employee) => (
        <article
          key={employee._id || employee.id}
          className="rounded-xl border border-gray-200 p-4"
        >
          <h3 className="font-semibold text-gray-900">
            {employee.name || "Unnamed Employee"}
          </h3>

          <p className="mt-1 text-sm text-gray-600">
            {employee.email || "No email available"}
          </p>

          <p className="mt-1 text-sm text-gray-500">
            {employee.department || "Department not specified"}
            {" · "}
            {employee.designation || "Designation not specified"}
          </p>

          <span className="mt-2 inline-block rounded-full bg-green-50 px-2.5 py-1 text-xs font-medium text-green-700">
            {employee.status || "Unknown Status"}
          </span>
        </article>
      ))}
    </div>
  );
}
