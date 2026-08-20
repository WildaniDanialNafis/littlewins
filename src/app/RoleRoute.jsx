import { Navigate, Outlet } from "react-router-dom";

import { ROUTES } from "@/shared/constants";

import { Spinner } from "@/shared/components/ui";

import { useAuth } from "@/shared/hooks";

const ROLE_DASHBOARDS = Object.freeze({
  teacher: ROUTES.teacher.dashboard,
  student: ROUTES.student.dashboard,
});

const VALID_ROLES = new Set(["teacher", "student"]);

const RoleLoading = ({ label = "Memeriksa akses..." }) => {
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

  if (currentRole === role) {
    return <Outlet />;
  }

  const dashboard = ROLE_DASHBOARDS[currentRole];

  return <Navigate to={dashboard ?? ROUTES.login} replace />;
};

RoleRoute.displayName = "RoleRoute";

export default RoleRoute;
