import { Navigate, Outlet } from "react-router-dom";

import { ROUTES } from "@/shared/constants";

import { useAuth } from "@/shared/hooks";

const ROLE_DASHBOARDS = Object.freeze({
  teacher: ROUTES.teacher.dashboard,
  student: ROUTES.student.dashboard,
});

const AuthLoading = () => {
  return (
    <div
      className="flex min-h-screen items-center justify-center px-4"
      role="status"
      aria-live="polite"
      aria-label="Memeriksa sesi"
    >
      <p className="text-sm text-muted">Memeriksa sesi...</p>
    </div>
  );
};

AuthLoading.displayName = "AuthLoading";

const GuestRoute = () => {
  const { isAuthenticated, role, loading } = useAuth();

  if (loading) {
    return <AuthLoading />;
  }

  if (!isAuthenticated) {
    return <Outlet />;
  }

  const dashboard = ROLE_DASHBOARDS[role];

  if (dashboard) {
    return <Navigate to={dashboard} replace />;
  }

  return <Navigate to={ROUTES.login} replace />;
};

GuestRoute.displayName = "GuestRoute";

export default GuestRoute;
