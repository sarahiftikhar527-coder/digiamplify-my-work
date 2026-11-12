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
} from "lucide-react";

export const employeeNavigation = [
  {
    label: "Dashboard",
    path: "/dashboard",
    icon: Home,
    children: [
      { label: "Overview", path: "/dashboard", icon: LayoutDashboard },
      { label: "Tasks & Schedule", path: "/dashboard?view=tasks", icon: CalendarClock },
      { label: "Performance", path: "/dashboard?view=performance", icon: Target },
      { label: "Leave & Updates", path: "/dashboard?view=updates", icon: Megaphone },
    ],
  },
  { label: "Task", path: "/task", icon: ClipboardList, badgeKey: "newTasks" },
  { label: "Profile", path: "/profile", icon: User },
  { label: "Finance", path: "/finance", icon: TrendingUp },
  { label: "Calendar", path: "/calendar", icon: Calendar },
  { label: "Chat", path: "/chat", icon: MessageCircle, badgeKey: "chatUnread" },
  { label: "Clock In", path: "/clock-in", icon: Clock },
  { label: "Team Live", path: "/team-live", icon: Network },
  { label: "Help & Support", path: "/help-support", icon: AlertCircle },
];

export const adminNavigation = [
  {
    label: "Dashboard",
    path: "/admin/dashboard",
    icon: Home,
    children: [
      { label: "Overview", path: "/admin/dashboard", icon: LayoutDashboard },
      { label: "Analytics", path: "/admin/dashboard?view=analytics", icon: BarChart3 },
      { label: "Workforce", path: "/admin/dashboard?view=workforce", icon: Activity },
      { label: "Leave & Reports", path: "/admin/dashboard?view=operations", icon: FileText },
    ],
  },
  {
    label: "Employees",
    path: "/admin/employees",
    icon: Users,
    children: [
      { label: "Live Hierarchy", path: "/admin/employees", icon: Network },
      {
        label: "Approvals",
        path: "/admin/approvals",
        icon: UserCheck,
        badgeKey: "pendingApprovals",
      },
    ],
  },
  { label: "Task", path: "/admin/task", icon: ClipboardList },
  { label: "Profile", path: "/admin/profile", icon: User },
  { label: "Finance", path: "/admin/finance", icon: TrendingUp },
  { label: "Calendar", path: "/admin/calendar", icon: Calendar },
  { label: "Chat", path: "/admin/chat", icon: MessageCircle, badgeKey: "chatUnread" },
  { label: "Clock In", path: "/admin/clock-in", icon: Clock },
  { label: "Help & Support", path: "/admin/escalation", icon: AlertCircle },
];

export const getNavigationByRole = (role) => {
  const normalizedRole = String(role || "").trim().toLowerCase();

  return normalizedRole === "admin"
    ? adminNavigation
    : employeeNavigation;
};

export const navigation = employeeNavigation;