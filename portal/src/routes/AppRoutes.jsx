import { Routes, Route, Navigate } from "react-router-dom";

import EmployeeLayout from "@/layouts/EmployeeLayout/EmployeeLayout";
import AdminLayout from "@/layouts/AdminLayout/AdminLayout";
import NotificationsPage from "@/modules/notifications/pages/NotificationsPage/NotificationsPage";

import Login from "@/pages/Login/Login";
import ResetPinPage from "@/pages/ResetPin/ResetPinPage";

// Employee pages
import DashboardPage from "@/modules/employee/dashboard/pages/DashboardPage";
import TaskPage from "@/modules/employee/task/pages/TaskPage";
import ProfilePage from "@/modules/employee/profile/pages/ProfilePage";
import FinancePage from "@/modules/employee/finance/pages/FinancePage";
import CalendarPage from "@/modules/employee/calendar/pages/CalendarPage";
import ChatPage from "@/modules/employee/chat/pages/ChatPage";
import ClockInPage from "@/modules/employee/clockIn/pages/ClockInPage";
import HelpSupportPage from "@/modules/employee/helpSupport/pages/HelpSupportPage";

// Admin pages
import AdminDashboardPage from "@/modules/admin/dashboard/pages/AdminDashboardPage/AdminDashboardPage.jsx";
import AdminTaskPage from "@/modules/admin/task/page/AdminTaskPage/AdminTaskPage.jsx";
import AdminProfilePage from "@/modules/admin/profile/pages/AdminProfilePage/AdminProfilePage.jsx";
import AdminFinancePage from "@/modules/admin/finance/pages/AdminFinancePage/AdminFinancePage.jsx";
import AdminCalendarPage from "@/modules/admin/calendar/pages/AdminCalendarPage/AdminCalendarPage.jsx";
import AdminClockInPage from "@/modules/admin/clockIn/pages/AdminClockInPage/AdminClockInPage.jsx";
import AdminChatPage from "@/modules/admin/chat/pages/AdminChatPage/AdminChatPage.jsx";
import AdminEscalationPage from "@/modules/admin/escalation/page/AdminEscalationPage/AdminEscalationPage.jsx";

// Route protection
import ProtectedRoute from "./ProtectedRoute";
import RoleRoute from "./RoleRoute";

import { useAuth } from "@/context/AuthContext/AuthContext/AuthContext.jsx";

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
      <Route path="/reset-pin" element={<ResetPinPage />} />

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