
import { useCallback, useEffect, useState } from "react";
import { useAuth } from "../../../../../context/AuthContext/AuthContext/AuthContext.jsx";
import useAdminDashboard from "../../hooks/useAdminDashboard.js";
import { reviewEmployeeProgressReport } from "../../services/adminDashboardService.js";
import {
  getAllLeaveRequests,
  reviewLeaveRequest,
  updateLeaveRemarks,
} from "../../../../../services/api/leaveService.js";
import AdminStatCards from "../../components/AdminStatCards.jsx";
import MonthlyPerformanceChart from "../../components/MonthlyPerformanceChart.jsx";
import PerformanceAlerts from "../../components/PerformanceAlerts.jsx";
import EmployeePerformanceTable from "../../components/EmployeePerformanceTable.jsx";
import EmployeeProgressReport from "../../components/EmployeeProgressReport.jsx";
import PerformanceSummary from "../../components/PerformanceSummary.jsx";
import LeaveManagement from "../../components/LeaveManagement.jsx";
import Announcements from "../../components/Announcements.jsx";

const greeting = () => {
  const hour = new Date().getHours();

  if (hour < 12) return "Good Morning";
  if (hour < 18) return "Good Afternoon";
  return "Good Evening";
};

const getId = (request) => request?.id || request?._id;

export default function AdminDashboardPage() {
  const { user } = useAuth();
  const { data, loading, error, reload } = useAdminDashboard();

  const userName =
    user?.name ||
    user?.fullName ||
    user?.email?.split("@")[0] ||
    "Admin";

  const [leaveRequests, setLeaveRequests] = useState([]);
  const [leaveLoading, setLeaveLoading] = useState(true);
  const [leaveError, setLeaveError] = useState("");

  const today = new Date().toLocaleDateString("en-GB", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
  });

  const loadLeaveRequests = useCallback(async () => {
    setLeaveLoading(true);
    setLeaveError("");

    try {
      const requests = await getAllLeaveRequests();

      setLeaveRequests(
        (Array.isArray(requests) ? requests : []).map((request) => ({
          ...request,
          id: getId(request),
        }))
      );
    } catch (err) {
      setLeaveError(err?.message || "Unable to load leave requests.");
    } finally {
      setLeaveLoading(false);
    }
  }, []);

  useEffect(() => {
    loadLeaveRequests();
  }, [loadLeaveRequests]);

  async function handleReportStatusChange(
    reportId,
    status,
    adminFeedback
  ) {
    await reviewEmployeeProgressReport(
      reportId,
      status,
      adminFeedback
    );
    await reload();
  }

  async function handleUpdateLeave(requestId, updatedFields) {
    const currentRequest = leaveRequests.find(
      (request) => String(getId(request)) === String(requestId)
    );

    const currentStatus = String(
      currentRequest?.status || ""
    ).toLowerCase();

    const remarks =
      updatedFields.remarks ?? updatedFields.adminComment ?? "";

    let updated;

    if (currentStatus && currentStatus !== "pending") {
      updated = await updateLeaveRemarks(requestId, remarks);
    } else {
      const status =
        updatedFields.status === "declined" ||
        updatedFields.status === "unapproved"
          ? "unapproved"
          : updatedFields.status;

      updated = await reviewLeaveRequest(requestId, {
        status,
        remarks,
      });
    }

    await loadLeaveRequests();
    return updated;
  }

  if (loading) {
    return (
      <div className="grid h-64 place-items-center text-sm text-gray-400">
        Loading dashboard...
      </div>
    );
  }

  if (error) {
    return (
      <div className="grid h-64 place-items-center text-center text-sm text-red-400">
        <div>
          {error}
          <button
            type="button"
            onClick={reload}
            className="mt-3 block rounded border border-red-500 px-3 py-1"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  if (!data) {
    return (
      <div className="p-6 text-sm text-gray-400">
        No dashboard data is available.
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <header>
        <h1 className="text-xl font-semibold sm:text-2xl">
          {greeting()},{" "}
          <span className="text-brand">{userName}</span>
        </h1>

        <p className="text-xs text-gray-400">It's {today}.</p>
      </header>

      <AdminStatCards stats={data.stats} />

      <div className="grid items-start gap-4 lg:grid-cols-5">
        <div className="lg:col-span-3">
          <MonthlyPerformanceChart data={data.chart} />
        </div>

        <div className="flex flex-col gap-4 lg:col-span-2">
          <PerformanceAlerts alerts={data.alerts} />
          <PerformanceSummary items={data.summary} />
        </div>
      </div>

      <section className="w-full min-w-0">
        <Announcements />
      </section>

      <section className="w-full min-w-0">
        {leaveError && (
          <div className="mb-3 flex flex-wrap items-center justify-between gap-3 rounded-md border border-red-900 bg-red-950/30 p-3 text-sm text-red-300">
            <p>{leaveError}</p>

            <button
              type="button"
              onClick={loadLeaveRequests}
              className="rounded border border-red-800 px-3 py-1.5"
            >
              Retry
            </button>
          </div>
        )}

        <LeaveManagement
          leaveRequests={leaveRequests}
          onUpdateLeave={handleUpdateLeave}
          loading={leaveLoading}
        />
      </section>

      <EmployeePerformanceTable
        employees={data.employees}
        onEmployeeAdded={reload}
      />

      <EmployeeProgressReport
        progress={data.progress}
        onStatusChange={handleReportStatusChange}
      />
    </div>
  );
}
