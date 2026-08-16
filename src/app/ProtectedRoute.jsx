import { Navigate, Outlet } from "react-router-dom";

import { ROUTES } from "@/shared/constants";

import { useAuth } from "@/shared/hooks";

const ProtectedRoute = () => {
  const { isAuthenticated, loading } = useAuth();

  if (loading) {
    return (
      <div
        className="flex min-h-screen items-center justify-center px-4"
        role="status"
        aria-live="polite"
        aria-label="Memeriksa autentikasi"
      >
        <p className="text-sm text-muted">Memeriksa sesi...</p>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to={ROUTES.login} replace />;
  }

  return <Outlet />;
};

ProtectedRoute.displayName = "ProtectedRoute";

export default ProtectedRoute;
