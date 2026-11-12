import { useCallback, useEffect, useState } from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import { Check, Loader2, RefreshCw, X } from "lucide-react";

import EmployeeLayout from "@/layouts/EmployeeLayout/EmployeeLayout";
import AdminLayout from "@/layouts/AdminLayout/AdminLayout";
import NotificationsPage from "@/modules/notifications/pages/NotificationsPage/NotificationsPage";

import { usersService } from "@/services/usersService";

import Login from "@/pages/Login/Login";
import Signup from "@/pages/Signup/Signup";
import ResetPinPage from "@/pages/ResetPin/ResetPinPage";
import ForgotPasswordPage from "@/pages/PasswordRecovery/ForgotPasswordPage";
import ResetPasswordPage from "@/pages/PasswordRecovery/ResetPasswordPage";

// Employee pages
import DashboardPage from "@/modules/employee/dashboard/pages/DashboardPage";
import TaskPage from "@/modules/employee/task/pages/TaskPage";
import ProfilePage from "@/modules/employee/profile/pages/ProfilePage";
import FinancePage from "@/modules/employee/finance/pages/FinancePage";
import CalendarPage from "@/modules/employee/calendar/pages/CalendarPage";
import ChatPage from "@/modules/employee/chat/pages/ChatPage";
import ClockInPage from "@/modules/employee/clockIn/pages/ClockInPage";
import TeamLivePage from "@/modules/employee/teamLive/pages/TeamLivePage/TeamLivePage.jsx";
import HelpSupportPage from "@/modules/employee/helpSupport/pages/HelpSupportPage";

import { AdminApprovalsPage as ApprovalsHubPage } from "@/modules/admin/approvals";
// Admin pages
import AdminDashboardPage from "@/modules/admin/dashboard/pages/AdminDashboardPage/AdminDashboardPage.jsx";
import AdminTaskPage from "@/modules/admin/task/page/AdminTaskPage/AdminTaskPage.jsx";
import AdminProfilePage from "@/modules/admin/profile/pages/AdminProfilePage/AdminProfilePage.jsx";
import AdminFinancePage from "@/modules/admin/finance/pages/AdminFinancePage/AdminFinancePage.jsx";
import AdminCalendarPage from "@/modules/admin/calendar/pages/AdminCalendarPage/AdminCalendarPage.jsx";
import AdminClockInPage from "@/modules/admin/clockIn/pages/AdminClockInPage/AdminClockInPage.jsx";
import AdminHierarchyPage from "@/modules/admin/hierarchy/pages/AdminHierarchyPage/AdminHierarchyPage.jsx";
import AdminChatPage from "@/modules/admin/chat/pages/AdminChatPage/AdminChatPage.jsx";
import AdminEscalationPage from "@/modules/admin/escalation/page/AdminEscalationPage/AdminEscalationPage.jsx";

// Route protection
import ProtectedRoute from "./ProtectedRoute";
import RoleRoute from "./RoleRoute";

import { useAuth } from "@/context/AuthContext/AuthContext/AuthContext.jsx";

/* ------------------------------------------------------------------
   Admin signup approvals page (kept in this file on purpose).
------------------------------------------------------------------- */
const formatDate = (value) => {
  if (!value) return "-";

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "-";

  return date.toLocaleString(undefined, {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
};

function AdminApprovalsPage() {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  // Id of the request currently being approved / declined.
  const [busyId, setBusyId] = useState(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError("");

    try {
      const items = await usersService.pending();
      setRequests(Array.isArray(items) ? items : []);
    } catch (err) {
      setError(err?.message || "Unable to load signup requests.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const review = async (id, action) => {
    if (busyId) return;

    setBusyId(id);
    setError("");

    try {
      if (action === "approve") {
        await usersService.approve(id);
      } else {
        await usersService.reject(id);
      }

      setRequests((current) => current.filter((item) => item.id !== id));
    } catch (err) {
      setError(err?.message || "Action failed. Please try again.");
    } finally {
      setBusyId(null);
    }
  };

  return (
    <div className="min-h-full bg-black p-6 text-white">
      <header className="mb-5 flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-3xl font-medium text-white">
            Signup <span className="text-red-600">Approvals</span>
          </h1>
          <p className="mt-1 text-sm text-neutral-300">
            Employees can log in only after you approve their request.
          </p>
        </div>

        <button
          type="button"
          onClick={load}
          disabled={loading}
          className="flex items-center gap-2 rounded-md border border-[#333] bg-[#0b0b0b] px-4 py-2 text-sm text-white transition hover:border-red-700 disabled:opacity-60"
        >
          <RefreshCw size={16} className={loading ? "animate-spin" : ""} />
          Refresh
        </button>
      </header>

      {error && (
        <p
          role="alert"
          className="mb-4 rounded border border-red-900/70 bg-red-950/40 px-4 py-3 text-sm text-red-400"
        >
          {error}
        </p>
      )}

      <div className="rounded-md border border-[#222] bg-[#0b0b0b]">
        <div className="border-b border-[#222] px-4 py-3 text-sm text-neutral-300">
          Pending requests:{" "}
          <span className="font-semibold text-white">{requests.length}</span>
        </div>

        {loading ? (
          <div className="flex items-center justify-center gap-2 px-4 py-12 text-neutral-400">
            <Loader2 size={18} className="animate-spin" />
            Loading...
          </div>
        ) : requests.length === 0 ? (
          <p className="px-4 py-12 text-center text-neutral-400">
            No pending signup requests.
          </p>
        ) : (
          <ul className="divide-y divide-[#222]">
            {requests.map((item) => {
              const isBusy = busyId === item.id;

              return (
                <li
                  key={item.id}
                  className="flex flex-wrap items-center justify-between gap-4 px-4 py-4"
                >
                  <div className="min-w-0">
                    <p className="truncate text-base font-medium text-white">
                      {item.name || "Unnamed"}
                    </p>
                    <p className="truncate text-sm text-neutral-400">
                      {item.email}
                    </p>
                    <p className="mt-1 text-xs text-neutral-500">
                      Requested: {formatDate(item.createdAt)}
                    </p>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => review(item.id, "approve")}
                      disabled={!!busyId}
                      className="flex items-center gap-1.5 rounded-md bg-emerald-700 px-4 py-2 text-sm font-medium text-white transition hover:bg-emerald-600 disabled:cursor-not-allowed disabled:opacity-60"
                    >
                      {isBusy ? (
                        <Loader2 size={16} className="animate-spin" />
                      ) : (
                        <Check size={16} />
                      )}
                      Approve
                    </button>

                    <button
                      type="button"
                      onClick={() => review(item.id, "decline")}
                      disabled={!!busyId}
                      className="flex items-center gap-1.5 rounded-md border border-red-800 px-4 py-2 text-sm font-medium text-red-400 transition hover:bg-red-950/50 disabled:cursor-not-allowed disabled:opacity-60"
                    >
                      <X size={16} />
                      Decline
                    </button>
                  </div>
                </li>
              );
            })}
          </ul>
        )}
      </div>
    </div>
  );
}

function RoleDashboardRedirect() {
  const { user, isAuthenticated } = useAuth();

  if (!isAuthenticated || !user) {
    return <Navigate to="/login" replace />;
  }

  const role = String(user.role || "").trim().toLowerCase();

  if (role === "admin") {
    return <Navigate to="/admin/dashboard" replace />;
  }

  if (role === "employee") {
    return <Navigate to="/dashboard" replace />;
  }

  return <Navigate to="/login" replace />;
}

export default function AppRoutes() {
  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route path="/signup" element={<Signup />} />
      <Route path="/reset-pin" element={<ResetPinPage />} />
      <Route path="/forgot-password" element={<ForgotPasswordPage />} />
      <Route path="/reset-password" element={<ResetPasswordPage />} />

      <Route element={<ProtectedRoute />}>
        <Route path="/" element={<RoleDashboardRedirect />} />
        <Route path="/dashboard-redirect" element={<RoleDashboardRedirect />} />

        {/* Employee-only routes */}
        <Route element={<RoleRoute allowed={["employee"]} />}>
          <Route element={<EmployeeLayout />}>
            <Route path="/dashboard" element={<DashboardPage />} />
            <Route path="/task" element={<TaskPage />} />
            <Route path="/profile" element={<ProfilePage />} />
            <Route path="/finance" element={<FinancePage />} />
            <Route path="/calendar" element={<CalendarPage />} />
            <Route path="/chat" element={<ChatPage />} />
            <Route path="/clock-in" element={<ClockInPage />} />
            <Route path="/team-live" element={<TeamLivePage />} />
            <Route path="/help-support" element={<HelpSupportPage />} />
            <Route path="/notifications" element={<NotificationsPage />} />
          </Route>
        </Route>

        {/* Admin-only routes */}
        <Route element={<RoleRoute allowed={["admin"]} />}>
          <Route
            path="/admin"
            element={<Navigate to="/admin/dashboard" replace />}
          />

          <Route element={<AdminLayout />}>
            <Route path="/admin/dashboard" element={<AdminDashboardPage />} />
            <Route path="/admin/task" element={<AdminTaskPage />} />
            <Route path="/admin/profile" element={<AdminProfilePage />} />
            <Route path="/admin/finance" element={<AdminFinancePage />} />
            <Route path="/admin/calendar" element={<AdminCalendarPage />} />
            <Route path="/admin/chat" element={<AdminChatPage />} />
            <Route path="/admin/clock-in" element={<AdminClockInPage />} />
            <Route path="/admin/employees" element={<AdminHierarchyPage />} />
            <Route path="/admin/approvals" element={<ApprovalsHubPage signupPanel={<AdminApprovalsPage />} />} />
            <Route path="/admin/escalation" element={<AdminEscalationPage />} />
            <Route
              path="/admin/notifications"
              element={<NotificationsPage userId="a1" />}
            />
          </Route>
        </Route>
      </Route>

      <Route path="*" element={<RoleDashboardRedirect />} />
    </Routes>
  );
}