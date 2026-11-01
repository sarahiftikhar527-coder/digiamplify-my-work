
import { Navigate, Outlet, useLocation } from "react-router-dom";
import { useAuth } from "@/context/AuthContext/AuthContext/AuthContext.jsx";

const ProtectedRoute = ({ allowedRoles }) => {
  const location = useLocation();
  const { user, isAuthenticated } = useAuth();

  if (!isAuthenticated || !user) {
    return (
      <Navigate
        to="/login"
        replace
        state={{ from: location }}
      />
    );
  }

  const role = String(user.role || "").trim().toLowerCase();

  if (allowedRoles && !allowedRoles.includes(role)) {
    const correctDashboard =
      role === "admin"
        ? "/admin/dashboard"
        : role === "employee"
          ? "/dashboard"
          : "/login";

    return <Navigate to={correctDashboard} replace />;
  }

  return <Outlet />;
};

export default ProtectedRoute;
