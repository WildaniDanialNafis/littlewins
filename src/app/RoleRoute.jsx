import { Navigate, Outlet } from "react-router-dom";

import { ROUTES } from "@/shared/constants";

import { useAuth } from "@/shared/hooks";

const ROLE_DASHBOARDS = Object.freeze({
  teacher: ROUTES.teacher.dashboard,
  student: ROUTES.student.dashboard,
});

const VALID_ROLES = new Set(["teacher", "student"]);

const RoleLoading = () => {
  return (
    <div
      className="flex min-h-screen items-center justify-center px-4"
      role="status"
      aria-live="polite"
      aria-label="Memeriksa akses"
    >
      <p className="text-sm text-muted">Memeriksa akses...</p>
    </div>
  );
};

RoleLoading.displayName = "RoleLoading";

const RoleRoute = ({ role }) => {
  const { role: currentRole, isAuthenticated, loading } = useAuth();

  if (loading) {
    return <RoleLoading />;
  }

  if (!isAuthenticated) {
    return <Navigate to={ROUTES.login} replace />;
  }

  if (typeof role !== "string" || !VALID_ROLES.has(role)) {
    return <Navigate to={ROUTES.login} replace />;
  }

  if (!currentRole || !VALID_ROLES.has(currentRole)) {
    return <Navigate to={ROUTES.login} replace />;
  }

  if (currentRole !== role) {
    const dashboard = ROLE_DASHBOARDS[currentRole];

    if (dashboard) {
      return <Navigate to={dashboard} replace />;
    }

    return <Navigate to={ROUTES.login} replace />;
  }

  return <Outlet />;
};

RoleRoute.displayName = "RoleRoute";

export default RoleRoute;
