import { Navigate, Outlet } from "react-router-dom";

import { ROUTES } from "@/shared/constants";

import { Spinner } from "@/shared/components/ui";

import { useAuth } from "@/shared/hooks";

const VALID_ROLES = new Set(["teacher", "student"]);

const AuthLoading = ({ label = "Memeriksa sesi..." }) => {
  return (
    <div
      className="flex min-h-svh items-center justify-center px-4"
      role="status"
      aria-live="polite"
      aria-label={label}
    >
      <div className="flex flex-col items-center gap-3">
        <Spinner size="md" aria-hidden="true" />

        <p className="text-sm text-muted">{label}</p>
      </div>
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

  if (!role || !VALID_ROLES.has(role)) {
    return <Navigate to={ROUTES.login} replace />;
  }

  return <Outlet />;
};

ProtectedRoute.displayName = "ProtectedRoute";

export default ProtectedRoute;
