import { useLocation } from "react-router-dom";
import { useAuth } from "@/context/AuthContext/AuthContext/AuthContext.jsx";

export default function useNotificationUser() {
  const { user } = useAuth();
  const { pathname } = useLocation();

  const isAdminRole =
    String(user?.role || "").toLowerCase() === "admin";

  const userId = user?._id || user?.id
    ? String(user._id || user.id)
    : null;

  return {
    userId,
    isAdminRole,
    viewAllPath: isAdminRole
      ? "/admin/notifications"
      : "/notifications",
    profilePath: isAdminRole
      ? "/admin/profile"
      : "/profile",
    supportPath: "/help-support",
    pathname,
  };
}