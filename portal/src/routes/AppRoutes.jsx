
import { Navigate, Route, Routes } from "react-router-dom";

import EmployeeLayout from "@/layouts/EmployeeLayout/EmployeeLayout";
import AdminLayout from "@/layouts/AdminLayout/AdminLayout";
import NotificationsPage from "@/modules/notifications/pages/NotificationsPage/NotificationsPage";

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
import EmployeeHierarchyPage from "@/modules/employee/hierarchy/pages/EmployeeHierarchyPage/EmployeeHierarchyPage.jsx";
import EmployeeApprovalsPage from "@/modules/employee/approvals/pages/EmployeeApprovalsPage/EmployeeApprovalsPage.jsx";
import HelpSupportPage from "@/modules/employee/helpSupport/pages/HelpSupportPage";

// Admin pages
import { AdminApprovalsPage as ApprovalsHubPage } from "@/modules/admin/approvals";
import SignupApprovalsPanel from "@/modules/admin/approvals/components/SignupApprovalsPanel.jsx";
import AdminTeamStructurePage from "@/modules/admin/team/pages/AdminTeamStructurePage/AdminTeamStructurePage.jsx";

import AdminDashboardPage from "@/modules/admin/dashboard/pages/AdminDashboardPage/AdminDashboardPage.jsx";
import AdminTaskPage from "@/modules/admin/task/page/AdminTaskPage/AdminTaskPage.jsx";
import TeamLeadTasksPage from "@/modules/teamLead/pages/TeamLeadTasksPage/TeamLeadTasksPage.jsx";
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
import PositionRoute from "./PositionRoute";

import {
  canApproveSignups,
  canAssignTasks,
  isFinanceManager,
} from "@/constants/positions";

import { useAuth } from "@/context/AuthContext/AuthContext/AuthContext.jsx";

function RoleDashboardRedirect() {
  const { user, isAuthenticated } = useAuth();

  if (!isAuthenticated || !user) {
    return <Navigate to="/login" replace />;
  }

  const role = String(user.role || "").trim().toLowerCase();

  if (role === "admin" || role === "superadmin") {
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
      {/* Public routes */}
      <Route path="/login" element={<Login />} />
      <Route path="/signup" element={<Signup />} />
      <Route path="/reset-pin" element={<ResetPinPage />} />
      <Route path="/forgot-password" element={<ForgotPasswordPage />} />
      <Route path="/reset-password" element={<ResetPasswordPage />} />

      <Route element={<ProtectedRoute />}>
        <Route path="/" element={<RoleDashboardRedirect />} />
        <Route
          path="/dashboard-redirect"
          element={<RoleDashboardRedirect />}
        />

        {/* Employee routes */}
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
            <Route path="/hierarchy" element={<EmployeeHierarchyPage />} />
            <Route path="/help-support" element={<HelpSupportPage />} />
            <Route path="/notifications" element={<NotificationsPage />} />

            {/* Project Manager, Team Lead, Manager and HR */}
            <Route element={<PositionRoute check={canAssignTasks} />}>
              <Route
                path="/team-tasks"
                element={<TeamLeadTasksPage />}
              />
            </Route>

            {/* Project Manager, HR, Team Lead and Manager: signup approvals */}
            <Route element={<PositionRoute check={canApproveSignups} />}>
              <Route
                path="/approvals"
                element={<EmployeeApprovalsPage />}
              />
            </Route>

            {/* Finance Manager */}
            <Route element={<PositionRoute check={isFinanceManager} />}>
              <Route
                path="/finance-control"
                element={<AdminFinancePage />}
              />
            </Route>
          </Route>
        </Route>

        {/* Admin-only routes */}
        <Route element={<RoleRoute allowed={["admin"]} />}>
          <Route
            path="/admin"
            element={<Navigate to="/admin/dashboard" replace />}
          />

          <Route element={<AdminLayout />}>
            <Route
              path="/admin/dashboard"
              element={<AdminDashboardPage />}
            />

            <Route path="/admin/task" element={<AdminTaskPage />} />

            <Route
              path="/admin/profile"
              element={<AdminProfilePage />}
            />

            <Route
              path="/admin/finance"
              element={<AdminFinancePage />}
            />

            <Route
              path="/admin/calendar"
              element={<AdminCalendarPage />}
            />

            <Route path="/admin/chat" element={<AdminChatPage />} />

            <Route
              path="/admin/clock-in"
              element={<AdminClockInPage />}
            />

            <Route
              path="/admin/employees"
              element={<AdminHierarchyPage />}
            />

            <Route
              path="/admin/team-structure"
              element={<AdminTeamStructurePage />}
            />

            <Route
              path="/admin/approvals"
              element={
                <ApprovalsHubPage
                  signupPanel={<SignupApprovalsPanel />}
                />
              }
            />

            <Route
              path="/admin/escalation"
              element={<AdminEscalationPage />}
            />

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
