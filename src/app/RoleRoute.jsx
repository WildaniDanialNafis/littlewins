import { Navigate, Outlet } from "react-router-dom";

import { ROUTES } from "@/shared/constants";

import { useAuth } from "@/shared/hooks";

const ROLE_DASHBOARDS = {
  teacher: ROUTES.teacher.dashboard,

  student: ROUTES.student.dashboard,
};

const RoleRoute = ({ role }) => {
  const { user, loading } = useAuth();

  if (loading) {
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
  }

  if (!ROLE_DASHBOARDS[role]) {
    return <Navigate to={ROUTES.login} replace />;
  }

  if (user?.role !== role) {
    const dashboard = ROLE_DASHBOARDS[user?.role];

    if (!dashboard) {
      return <Navigate to={ROUTES.login} replace />;
    }

    return <Navigate to={dashboard} replace />;
  }

  return <Outlet />;
};

RoleRoute.displayName = "RoleRoute";

export default RoleRoute;
