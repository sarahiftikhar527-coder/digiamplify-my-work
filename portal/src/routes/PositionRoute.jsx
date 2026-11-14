import { Navigate, Outlet } from "react-router-dom";
import { useAuth } from "@/context/AuthContext/AuthContext/AuthContext.jsx";

/**
 * Lets only users whose position passes `check(user)` open the nested pages.
 * Everyone else goes back to the employee dashboard.
 */
export default function PositionRoute({ check }) {
  const { user } = useAuth();

  if (!check(user)) {
    return <Navigate to="/dashboard" replace />;
  }

  return <Outlet />;
}