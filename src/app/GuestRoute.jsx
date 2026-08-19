import { Navigate, Outlet } from "react-router-dom";

import { ROUTES } from "@/shared/constants";

import { useAuth } from "@/shared/hooks";

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

  switch (role) {
    case "teacher":
      return <Navigate to={ROUTES.teacher.dashboard} replace />;

    case "student":
      return <Navigate to={ROUTES.student.dashboard} replace />;

    default:
      /*
       * Authenticated tetapi role invalid.
       * Jangan memberikan guest route.
       */
      return <Navigate to={ROUTES.login} replace />;
  }
};

GuestRoute.displayName = "GuestRoute";

export default GuestRoute;
