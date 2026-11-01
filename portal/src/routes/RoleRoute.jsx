import { Navigate, Outlet, useLocation } from "react-router-dom";
import { useAuth } from "@/context/AuthContext/AuthContext/AuthContext.jsx";

export default function RoleRoute({ allowed = [] }) {
  const { user, isAuthenticated } = useAuth();
  const location = useLocation();

  const role = String(user?.role || "")
    .trim()
    .toLowerCase();

  if (!isAuthenticated || !user) {
    return (
      <Navigate
        to="/login"
        replace
        state={{ from: location }}
      />
    );
  }

  if (!["admin", "employee"].includes(role)) {
    return <Navigate to="/login" replace />;
  }

  if (!allowed.includes(role)) {
    const correctDashboard =
      role === "admin" ? "/admin/dashboard" : "/dashboard";

    return (
      <Navigate
        to={correctDashboard}
        replace
      />
    );
  }

  return <Outlet />;
}