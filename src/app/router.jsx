import { Navigate, Route, Routes } from "react-router-dom";

import AuthLayout from "@/layouts/AuthLayout";
import MainLayout from "@/layouts/MainLayout";

import {
  LoginPage,
  NotFoundPage,
  TeacherDashboardPage,
  TeacherReportsPage,
  TeacherReportDetailPage,
  TeacherReportNewPage,
  TeacherReportEditPage,
  TeacherSettingsPage,
  StudentDashboardPage,
  StudentReportsPage,
  StudentReportDetailPage,
  StudentSettingsPage,
} from "@/pages";

import { ROUTES } from "@/shared/constants";

import { useAuth } from "@/shared/hooks";

import GuestRoute from "./GuestRoute";
import ProtectedRoute from "./ProtectedRoute";
import RoleRoute from "./RoleRoute";

const RoleDashboardRedirect = () => {
  const { user } = useAuth();

  if (user?.role === "teacher") {
    return <Navigate to={ROUTES.teacher.dashboard} replace />;
  }

  if (user?.role === "student") {
    return <Navigate to={ROUTES.student.dashboard} replace />;
  }

  return <Navigate to={ROUTES.login} replace />;
};

RoleDashboardRedirect.displayName = "RoleDashboardRedirect";

const AppRouter = () => {
  return (
    <Routes>
      {/* ======================================================
       * GUEST
       * ====================================================== */}

      <Route element={<GuestRoute />}>
        <Route element={<AuthLayout />}>
          <Route path={ROUTES.login} element={<LoginPage />} />
        </Route>
      </Route>

      {/* ======================================================
       * PROTECTED APPLICATION
       * ====================================================== */}

      <Route element={<ProtectedRoute />}>
        <Route element={<MainLayout />}>
          {/* ==================================================
           * HOME
           * ================================================== */}

          <Route path={ROUTES.home} element={<RoleDashboardRedirect />} />

          {/* ==================================================
           * TEACHER
           * ================================================== */}

          <Route element={<RoleRoute role="teacher" />}>
            <Route
              path={ROUTES.teacher.dashboard}
              element={<TeacherDashboardPage />}
            />

            <Route
              path={ROUTES.teacher.reports}
              element={<TeacherReportsPage />}
            />

            <Route
              path={ROUTES.teacher.reportNew}
              element={<TeacherReportNewPage />}
            />

            <Route
              path={ROUTES.teacher.reportDetail(":id")}
              element={<TeacherReportDetailPage />}
            />

            <Route
              path={ROUTES.teacher.reportEdit(":id")}
              element={<TeacherReportEditPage />}
            />

            <Route
              path={ROUTES.teacher.settings}
              element={<TeacherSettingsPage />}
            />
          </Route>

          {/* ==================================================
           * STUDENT
           * ================================================== */}

          <Route element={<RoleRoute role="student" />}>
            <Route
              path={ROUTES.student.dashboard}
              element={<StudentDashboardPage />}
            />

            <Route
              path={ROUTES.student.reports}
              element={<StudentReportsPage />}
            />

            <Route
              path={ROUTES.student.reportDetail(":id")}
              element={<StudentReportDetailPage />}
            />

            <Route
              path={ROUTES.student.settings}
              element={<StudentSettingsPage />}
            />
          </Route>

          {/* ==================================================
           * FALLBACK
           * ================================================== */}

          <Route path="*" element={<NotFoundPage />} />
        </Route>
      </Route>
    </Routes>
  );
};

AppRouter.displayName = "AppRouter";

export default AppRouter;
