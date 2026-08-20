import { lazy, Suspense } from "react";

import { Navigate, Route, Routes } from "react-router-dom";

import AuthLayout from "@/layouts/AuthLayout";
import MainLayout from "@/layouts/MainLayout";

import { ROUTES } from "@/shared/constants";

import { useAuth } from "@/shared/hooks";

import GuestRoute from "./GuestRoute";
import ProtectedRoute from "./ProtectedRoute";
import RoleRoute from "./RoleRoute";

/* ============================================================
 * LAZY PAGES
 * ============================================================ */

const LoginPage = lazy(() => import("@/pages/LoginPage"));

const NotFoundPage = lazy(() => import("@/pages/NotFoundPage"));

const DashboardPage = lazy(() => import("@/pages/DashboardPage"));

const SettingsPage = lazy(() => import("@/pages/SettingsPage"));

const TeacherReportsPage = lazy(
  () => import("@/pages/teacher/reports/ReportsPage"),
);

const TeacherReportDetailPage = lazy(
  () => import("@/pages/teacher/reports/ReportDetailPage"),
);

const TeacherReportNewPage = lazy(
  () => import("@/pages/teacher/reports/ReportNewPage"),
);

const TeacherReportEditPage = lazy(
  () => import("@/pages/teacher/reports/ReportEditPage"),
);

const StudentReportsPage = lazy(
  () => import("@/pages/student/reports/ReportsPage"),
);

const StudentReportDetailPage = lazy(
  () => import("@/pages/student/reports/ReportDetailPage"),
);

/* ============================================================
 * LOADING
 * ============================================================ */

const RouteLoading = () => {
  return (
    <div
      className="flex min-h-svh items-center justify-center px-4"
      role="status"
      aria-live="polite"
      aria-label="Memuat halaman"
    >
      <div className="text-center">
        <span
          className={[
            "mx-auto block size-6 rounded-full border-2",
            "border-border border-t-primary",
            "animate-spin motion-reduce:animate-none",
          ].join(" ")}
          aria-hidden="true"
        />

        <p className="mt-3 text-sm text-muted">Memuat halaman...</p>
      </div>
    </div>
  );
};

RouteLoading.displayName = "RouteLoading";

const LazyPage = ({ children }) => {
  return <Suspense fallback={<RouteLoading />}>{children}</Suspense>;
};

LazyPage.displayName = "LazyPage";

/* ============================================================
 * ROLE DASHBOARD
 * ============================================================ */

const ROLE_DASHBOARDS = Object.freeze({
  teacher: ROUTES.teacher.dashboard,

  student: ROUTES.student.dashboard,
});

const RoleDashboardRedirect = () => {
  const { role } = useAuth();

  return <Navigate to={ROLE_DASHBOARDS[role] ?? ROUTES.login} replace />;
};

RoleDashboardRedirect.displayName = "RoleDashboardRedirect";

/* ============================================================
 * ROUTER
 * ============================================================ */

const AppRouter = () => {
  return (
    <Routes>
      {/* ======================================================
       * GUEST
       * ====================================================== */}

      <Route element={<GuestRoute />}>
        <Route element={<AuthLayout />}>
          <Route
            path={ROUTES.login}
            element={
              <LazyPage>
                <LoginPage />
              </LazyPage>
            }
          />
        </Route>
      </Route>

      {/* ======================================================
       * PROTECTED
       * ====================================================== */}

      <Route element={<ProtectedRoute />}>
        <Route element={<MainLayout />}>
          <Route path={ROUTES.home} element={<RoleDashboardRedirect />} />

          {/* ==================================================
           * TEACHER
           * ================================================== */}

          <Route element={<RoleRoute role="teacher" />}>
            <Route
              path={ROUTES.teacher.dashboard}
              element={
                <LazyPage>
                  <DashboardPage role="teacher" />
                </LazyPage>
              }
            />

            <Route
              path={ROUTES.teacher.settings}
              element={
                <LazyPage>
                  <SettingsPage role="teacher" />
                </LazyPage>
              }
            />

            <Route
              path={ROUTES.teacher.reports}
              element={
                <LazyPage>
                  <TeacherReportsPage />
                </LazyPage>
              }
            />

            <Route
              path={ROUTES.teacher.reportNew}
              element={
                <LazyPage>
                  <TeacherReportNewPage />
                </LazyPage>
              }
            />

            <Route
              path={ROUTES.teacher.reportDetail(":id")}
              element={
                <LazyPage>
                  <TeacherReportDetailPage />
                </LazyPage>
              }
            />

            <Route
              path={ROUTES.teacher.reportEdit(":id")}
              element={
                <LazyPage>
                  <TeacherReportEditPage />
                </LazyPage>
              }
            />
          </Route>

          {/* ==================================================
           * STUDENT
           * ================================================== */}

          <Route element={<RoleRoute role="student" />}>
            <Route
              path={ROUTES.student.dashboard}
              element={
                <LazyPage>
                  <DashboardPage role="student" />
                </LazyPage>
              }
            />

            <Route
              path={ROUTES.student.settings}
              element={
                <LazyPage>
                  <SettingsPage role="student" />
                </LazyPage>
              }
            />

            <Route
              path={ROUTES.student.reports}
              element={
                <LazyPage>
                  <StudentReportsPage />
                </LazyPage>
              }
            />

            <Route
              path={ROUTES.student.reportDetail(":id")}
              element={
                <LazyPage>
                  <StudentReportDetailPage />
                </LazyPage>
              }
            />
          </Route>

          {/* ==================================================
           * FALLBACK
           * ================================================== */}

          <Route
            path="*"
            element={
              <LazyPage>
                <NotFoundPage />
              </LazyPage>
            }
          />
        </Route>
      </Route>
    </Routes>
  );
};

AppRouter.displayName = "AppRouter";

export default AppRouter;
