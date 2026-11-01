import {
  Home,
  ClipboardList,
  User,
  TrendingUp,
  Calendar,
  MessageCircle,
  Clock,
  AlertCircle,
} from "lucide-react";

export const employeeNavigation = [
  { label: "Dashboard", path: "/dashboard", icon: Home },
  { label: "Task", path: "/task", icon: ClipboardList },
  { label: "Profile", path: "/profile", icon: User },
  { label: "Finance", path: "/finance", icon: TrendingUp },
  { label: "Calendar", path: "/calendar", icon: Calendar },
  { label: "Chat", path: "/chat", icon: MessageCircle },
  { label: "Clock In", path: "/clock-in", icon: Clock },
  { label: "Help & Support", path: "/help-support", icon: AlertCircle },
];

export const adminNavigation = [
  { label: "Dashboard", path: "/admin/dashboard", icon: Home },
  { label: "Task", path: "/admin/task", icon: ClipboardList },
  { label: "Profile", path: "/admin/profile", icon: User },
  { label: "Finance", path: "/admin/finance", icon: TrendingUp },
  { label: "Calendar", path: "/admin/calendar", icon: Calendar },
  { label: "Chat", path: "/admin/chat", icon: MessageCircle },
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

