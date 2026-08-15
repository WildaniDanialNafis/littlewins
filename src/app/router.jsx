import { Route, Routes } from "react-router-dom";

import AuthLayout from "@/layouts/AuthLayout";
import MainLayout from "@/layouts/MainLayout";

import {
  LoginPage,
  NotFoundPage,
  StudentDashboardPage,
  StudentSettingsPage,
  TeacherDashboardPage,
  TeacherReportDetailPage,
  TeacherReportEditPage,
  TeacherReportNewPage,
  TeacherReportsPage,
  TeacherSettingsPage,
} from "@/pages";

import { ROUTES } from "@/shared/constants";

const HomePage = () => {
  return <h1>Littlewins</h1>;
};

const RegisterPage = () => {
  return <h1>Register Page</h1>;
};

const AppRouter = () => {
  return (
    <Routes>
      <Route element={<MainLayout />}>
        {/* ======================================================
         * GENERAL
         * ====================================================== */}

        <Route
          path={ROUTES.home}
          element={<HomePage />}
        />

        {/* ======================================================
         * TEACHER
         * ====================================================== */}

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

        {/* ======================================================
         * STUDENT
         * ====================================================== */}

        <Route
          path={ROUTES.student.dashboard}
          element={<StudentDashboardPage />}
        />

        <Route
          path={ROUTES.student.settings}
          element={<StudentSettingsPage />}
        />

        {/* ======================================================
         * FALLBACK
         * ====================================================== */}

        <Route
          path="*"
          element={<NotFoundPage />}
        />
      </Route>

      {/* ========================================================
       * AUTHENTICATION
       * ======================================================== */}

      <Route element={<AuthLayout />}>
        <Route
          path={ROUTES.login}
          element={<LoginPage />}
        />

        <Route
          path={ROUTES.register}
          element={<RegisterPage />}
        />
      </Route>
    </Routes>
  );
};

AppRouter.displayName = "AppRouter";

export default AppRouter;