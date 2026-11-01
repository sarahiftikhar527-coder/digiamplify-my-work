import { Navigate, Outlet, useLocation } from "react-router-dom";

const isLoggedIn = () => {
  try {
    return Boolean(
      localStorage.getItem("token") ||
      sessionStorage.getItem("token")
    );
  } catch {
    return false;
  }
};

const ProtectedRoute = () => {
  const location = useLocation();

  if (!isLoggedIn()) {
    return (
      <Navigate
        to="/login"
        replace
        state={{ from: location }}
      />
    );
  }

  return <Outlet />;
};

export default ProtectedRoute;