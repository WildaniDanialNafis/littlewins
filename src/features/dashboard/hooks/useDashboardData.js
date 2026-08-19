import { useCallback, useMemo } from "react";

import { useAuth, usePrograms, useReports, useStudents } from "@/shared/hooks";

import {
  createLookupMap,
  filterReportsByAccount,
  getLatestReport,
  getReportProgramName,
  getReportStudentName,
  normalizeId,
} from "@/features/reports/domain/reportSelectors";

/* ============================================================
 * HELPERS
 * ============================================================ */

const getUserProfileId = (user) => normalizeId(user?.profile?.id ?? user?.id);

const getUserName = (user, fallback) => {
  const value = user?.profile?.full_name ?? user?.full_name ?? "";

  const normalized = String(value).trim();

  return normalized || fallback;
};

const normalizeRole = (role) => {
  if (typeof role !== "string") {
    return null;
  }

  const normalized = role.trim().toLowerCase();

  if (normalized === "teacher") {
    return "teacher";
  }

  if (normalized === "student") {
    return "student";
  }

  return null;
};

const normalizeError = (error) => {
  if (!error) {
    return null;
  }

  if (error instanceof Error) {
    return error;
  }

  if (typeof error.message === "string") {
    return new Error(error.message);
  }

  return new Error("Gagal memuat dashboard.");
};

/* ============================================================
 * HOOK
 * ============================================================ */

const useDashboardData = (role = "teacher") => {
  const { user } = useAuth();

  const normalizedRole = normalizeRole(role);

  const accountId = getUserProfileId(user);

  const isTeacher = normalizedRole === "teacher";

  const isStudent = normalizedRole === "student";

  const reportsResource = useReports({
    autoFetch: Boolean(normalizedRole && accountId),
  });

  const studentsResource = useStudents({
    autoFetch: isTeacher,
  });

  const programsResource = usePrograms({
    autoFetch: Boolean(normalizedRole && accountId),
  });

  const reports = Array.isArray(reportsResource.reports)
    ? reportsResource.reports
    : [];

  const students = Array.isArray(studentsResource.data)
    ? studentsResource.data
    : [];

  const programs = Array.isArray(programsResource.data)
    ? programsResource.data
    : [];

  const scopedReports = useMemo(() => {
    if (!normalizedRole || accountId === null) {
      return [];
    }

    return filterReportsByAccount(reports, normalizedRole, accountId);
  }, [reports, normalizedRole, accountId]);

  const latestReport = useMemo(
    () => getLatestReport(scopedReports),
    [scopedReports],
  );

  const studentMap = useMemo(() => createLookupMap(students), [students]);

  const programMap = useMemo(() => createLookupMap(programs), [programs]);

  const latestReportData = useMemo(() => {
    if (!latestReport) {
      return null;
    }

    return {
      id: latestReport.id,

      studentName: getReportStudentName(latestReport, studentMap),

      programName: getReportProgramName(latestReport, programMap),

      reportDate:
        latestReport.report_date ??
        latestReport.date ??
        latestReport.created_at ??
        null,

      score: latestReport.score ?? null,

      duration: latestReport.duration ?? null,
    };
  }, [latestReport, studentMap, programMap]);

  const isLoading = Boolean(
    reportsResource.loading ||
    studentsResource.loading ||
    programsResource.loading,
  );

  const error =
    normalizeError(reportsResource.error) ||
    normalizeError(studentsResource.error) ||
    normalizeError(programsResource.error);

  const refresh = useCallback(async () => {
    const tasks = [reportsResource.refresh(), programsResource.refresh()];

    if (isTeacher) {
      tasks.push(studentsResource.refresh());
    }

    const results = await Promise.allSettled(tasks);

    const failed = results.find((result) => result.status === "rejected");

    if (failed) {
      throw failed.reason instanceof Error
        ? failed.reason
        : new Error("Gagal memperbarui dashboard.");
    }
  }, [
    isTeacher,
    reportsResource.refresh,
    programsResource.refresh,
    studentsResource.refresh,
  ]);

  const userName = useMemo(
    () => getUserName(user, isTeacher ? "Guru" : "Siswa"),
    [user, isTeacher],
  );

  return {
    user,

    accountId,

    userName,

    role: normalizedRole,

    isTeacher,

    isStudent,

    reports: scopedReports,

    latestReport,

    latestReportData,

    isLoading,

    error,

    refresh,
  };
};

useDashboardData.displayName = "useDashboardData";

export default useDashboardData;
