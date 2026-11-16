import {
  Home,
  ClipboardList,
  User,
  TrendingUp,
  Calendar,
  MessageCircle,
  Clock,
  AlertCircle,
  UserCheck,
  Users,
  LayoutDashboard,
  BarChart3,
  Activity,
  FileText,
  Target,
  CalendarClock,
  Megaphone,
  Network,
  ListChecks,
  Wallet,
  UserCog,
} from "lucide-react";

import {
  canApproveSignups,
  canAssignTasks,
  isFinanceManager,
} from "./positions";

export const employeeNavigation = [
  {
    label: "Dashboard",
    path: "/dashboard",
    icon: Home,
    children: [
      { label: "Overview", path: "/dashboard", icon: LayoutDashboard },
      {
        label: "Tasks & Schedule",
        path: "/dashboard?view=tasks",
        icon: CalendarClock,
      },
      {
        label: "Performance",
        path: "/dashboard?view=performance",
        icon: Target,
      },
      {
        label: "Leave & Updates",
        path: "/dashboard?view=updates",
        icon: Megaphone,
      },
    ],
  },
  {
    label: "Employees",
    path: "/team-live",
    icon: Users,
    children: [
      {
        label: "Live Hierarchy",
        path: "/team-live",
        icon: Network,
      },
      {
        label: "Employee Hierarchy",
        path: "/hierarchy",
        icon: UserCog,
      },
    ],
  },
  {
    label: "Task",
    path: "/task",
    icon: ClipboardList,
    badgeKey: "newTasks",
  },
  { label: "Profile", path: "/profile", icon: User },
  {
    label: "Finance",
    path: "/finance",
    icon: TrendingUp,
    badgeKey: "pendingFinance",
  },
  {
    label: "Calendar",
    path: "/calendar",
    icon: Calendar,
    badgeKey: "meetingInvitations",
  },
  {
    label: "Chat",
    path: "/chat",
    icon: MessageCircle,
    badgeKey: "chatUnread",
  },
  { label: "Clock In", path: "/clock-in", icon: Clock },
  { label: "Help & Support", path: "/help-support", icon: AlertCircle },
];

export const adminNavigation = [
  {
    label: "Dashboard",
    path: "/admin/dashboard",
    icon: Home,
    children: [
      {
        label: "Overview",
        path: "/admin/dashboard",
        icon: LayoutDashboard,
      },
      {
        label: "Analytics",
        path: "/admin/dashboard?view=analytics",
        icon: BarChart3,
      },
      {
        label: "Workforce",
        path: "/admin/dashboard?view=workforce",
        icon: Activity,
      },
      {
        label: "Leave & Reports",
        path: "/admin/dashboard?view=operations",
        icon: FileText,
      },
    ],
  },
  {
    label: "Employees",
    path: "/admin/employees",
    icon: Users,
    children: [
      {
        label: "Live Hierarchy",
        path: "/admin/employees",
        icon: Network,
      },
      {
        label: "Roles & Hierarchy",
        path: "/admin/team-structure",
        icon: UserCog,
      },
      {
        label: "Approvals",
        path: "/admin/approvals",
        icon: UserCheck,
        badgeKey: "pendingApprovals",
        pulse: true,
      },
    ],
  },
  {
    label: "Task",
    path: "/admin/task",
    icon: ClipboardList,
  },
  { label: "Profile", path: "/admin/profile", icon: User },
  { label: "Finance", path: "/admin/finance", icon: TrendingUp },
  {
    label: "Calendar",
    path: "/admin/calendar",
    icon: Calendar,
    badgeKey: "meetingInvitations",
  },
  {
    label: "Chat",
    path: "/admin/chat",
    icon: MessageCircle,
    badgeKey: "chatUnread",
  },
  { label: "Clock In", path: "/admin/clock-in", icon: Clock },
  { label: "Help & Support", path: "/admin/escalation", icon: AlertCircle },
];

// Extra pages available according to employee position.
export const getEmployeeNavigation = (user) => {
  const extra = [];

  if (canAssignTasks(user)) {
    extra.push({
      label: "Team Tasks",
      path: "/team-tasks",
      icon: ListChecks,
    });
  }

  if (isFinanceManager(user)) {
    extra.push({
      label: "Finance Control",
      path: "/finance-control",
      icon: Wallet,
    });
  }

  if (canApproveSignups(user)) {
    extra.push({
      label: "Approvals",
      path: "/approvals",
      icon: UserCheck,
      badgeKey: "pendingApprovals",
      pulse: true,
    });
  }

  if (!extra.length) return employeeNavigation;

  const taskIndex = employeeNavigation.findIndex(
    (item) => item.path === "/task"
  );

  return [
    ...employeeNavigation.slice(0, taskIndex + 1),
    ...extra,
    ...employeeNavigation.slice(taskIndex + 1),
  ];
};

export const getNavigationByRole = (userOrRole) => {
  const user =
    userOrRole && typeof userOrRole === "object"
      ? userOrRole
      : { role: userOrRole };

  const normalizedRole = String(user.role || "").trim().toLowerCase();

  return normalizedRole === "admin" ||
    normalizedRole === "superadmin"
    ? adminNavigation
    : getEmployeeNavigation(user);
};

export const navigation = employeeNavigation;