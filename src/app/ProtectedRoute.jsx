import { Navigate, Outlet } from "react-router-dom";

import { ROUTES } from "@/shared/constants";

import { useAuth } from "@/shared/hooks";

const AuthLoading = ({ label = "Memeriksa sesi..." }) => {
  return (
    <div
      className="flex min-h-screen items-center justify-center px-4"
      role="status"
      aria-live="polite"
      aria-label={label}
    >
      <p className="text-sm text-muted">{label}</p>
    </div>
  );
};

AuthLoading.displayName = "AuthLoading";

const ProtectedRoute = () => {
  const { isAuthenticated, role, loading } = useAuth();

  if (loading) {
    return <AuthLoading />;
  }

  if (!isAuthenticated) {
    return <Navigate to={ROUTES.login} replace />;
  }

  if (role !== "teacher" && role !== "student") {
    return <Navigate to={ROUTES.login} replace />;
  }

  return <Outlet />;
};

ProtectedRoute.displayName = "ProtectedRoute";

export default ProtectedRoute;
