import { Navigate, Outlet } from "react-router-dom";

import { ROUTES } from "@/shared/constants";

import { Spinner } from "@/shared/components/ui";

import { useAuth } from "@/shared/hooks";

const ROLE_DASHBOARDS = Object.freeze({
  teacher: ROUTES.teacher.dashboard,
  student: ROUTES.student.dashboard,
});

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
