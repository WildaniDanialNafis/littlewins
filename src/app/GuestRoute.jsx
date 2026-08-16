import { Navigate, Outlet } from "react-router-dom";

import { ROUTES } from "@/shared/constants";

import { useAuth } from "@/shared/hooks";

const GuestRoute = () => {
  const { user, loading } = useAuth();

  if (loading) {
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
  }

  if (user?.role === "teacher") {
    return <Navigate to={ROUTES.teacher.dashboard} replace />;
  }

  if (user?.role === "student") {
    return <Navigate to={ROUTES.student.dashboard} replace />;
  }

  return <Outlet />;
};

GuestRoute.displayName = "GuestRoute";

export default GuestRoute;
