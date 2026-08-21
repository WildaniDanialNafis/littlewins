import { useCallback, useMemo } from "react";

import {
  useAuth,
  useClasses,
  usePrograms,
  useReports,
  useStudents,
  useTeachers,
} from "@/shared/hooks";

import {
  createLookupMap,
  filterReportsByAccount,
  getLatestReport,
  getReportClassName,
  getReportProgramName,
  getReportStudentName,
  getReportTeacherName,
  normalizeId,
} from "@/features/reports/domain/reportSelectors";

const EMPTY_ARRAY = Object.freeze([]);

/* ============================================================
 * HELPERS
 * ============================================================ */

const getUserProfileId = (user) => {
  return normalizeId(user?.profile?.id ?? user?.id);
};

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

  return normalized === "teacher" || normalized === "student"
    ? normalized
    : null;
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

const toArray = (value) => {
  return Array.isArray(value) ? value : EMPTY_ARRAY;
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

  /* ==========================================================
   * RESOURCES
   * ========================================================== */

  const reportsResource = useReports({
    autoFetch: Boolean(normalizedRole && accountId !== null),
  });

  const studentsResource = useStudents({
    autoFetch: isTeacher,
    staleTime: 10 * 60 * 1000,
  });

  const teachersResource = useTeachers({
    autoFetch: isStudent,
    staleTime: 10 * 60 * 1000,
  });

  const programsResource = usePrograms({
    autoFetch: Boolean(normalizedRole && accountId !== null),
    staleTime: 10 * 60 * 1000,
  });

  const classesResource = useClasses({
    autoFetch: Boolean(normalizedRole && accountId !== null),
    staleTime: 10 * 60 * 1000,
  });

  /* ==========================================================
   * DATA
   * ========================================================== */

  const reports = useMemo(
    () => toArray(reportsResource.reports ?? reportsResource.data),
    [reportsResource.reports, reportsResource.data],
  );

  const students = useMemo(
    () => toArray(studentsResource.data),
    [studentsResource.data],
  );

  const teachers = useMemo(
    () => toArray(teachersResource.data),
    [teachersResource.data],
  );

  const programs = useMemo(
    () => toArray(programsResource.data),
    [programsResource.data],
  );

  const classes = useMemo(
    () => toArray(classesResource.data),
    [classesResource.data],
  );

  /* ==========================================================
   * LOOKUPS
   * ========================================================== */

  const studentMap = useMemo(() => createLookupMap(students), [students]);

  const teacherMap = useMemo(() => createLookupMap(teachers), [teachers]);

  const programMap = useMemo(() => createLookupMap(programs), [programs]);

  const classMap = useMemo(() => createLookupMap(classes), [classes]);

  /* ==========================================================
   * ACCOUNT SCOPE
   * ========================================================== */

  const scopedReports = useMemo(() => {
    if (!normalizedRole || accountId === null) {
      return EMPTY_ARRAY;
    }

    return filterReportsByAccount(reports, normalizedRole, accountId);
  }, [reports, normalizedRole, accountId]);

  /* ==========================================================
   * ENRICH
   * ========================================================== */

  const enrichedReports = useMemo(() => {
    if (scopedReports.length === 0) {
      return EMPTY_ARRAY;
    }

    return scopedReports.map((report) => ({
      ...report,

      student_name: getReportStudentName(report, studentMap),

      teacher_name: getReportTeacherName(report, teacherMap),

      program_name: getReportProgramName(report, programMap),

      class_name: getReportClassName(report, classMap),
    }));
  }, [scopedReports, studentMap, teacherMap, programMap, classMap]);

  /* ==========================================================
   * LATEST REPORT
   * ========================================================== */

  const latestReport = useMemo(
    () => getLatestReport(enrichedReports),
    [enrichedReports],
  );

  const latestReportData = useMemo(() => {
    if (!latestReport) {
      return null;
    }

    return {
      id: latestReport.id,

      studentName: latestReport.student_name ?? "-",

      teacherName: latestReport.teacher_name ?? "-",

      programName: latestReport.program_name ?? "-",

      className: latestReport.class_name ?? "-",

      reportDate:
        latestReport.report_date ??
        latestReport.date ??
        latestReport.created_at ??
        null,

      score: latestReport.score ?? null,

      duration: latestReport.duration ?? null,
    };
  }, [latestReport]);

  /* ==========================================================
   * RESOURCE STATUS
   * ========================================================== */

  const resourceList = useMemo(
    () => [
      reportsResource,
      studentsResource,
      teachersResource,
      programsResource,
      classesResource,
    ],
    [
      reportsResource,
      studentsResource,
      teachersResource,
      programsResource,
      classesResource,
    ],
  );

  const isLoading = resourceList.some((resource) =>
    Boolean(resource?.isInitialLoading),
  );

  const isFetching = resourceList.some((resource) =>
    Boolean(resource?.isFetching),
  );

  const isRefreshing = resourceList.some((resource) =>
    Boolean(resource?.isRefreshing),
  );

  /* ==========================================================
   * INITIAL ERROR
   * ========================================================== */

  const initialError =
    normalizeError(reportsResource.initialError) ??
    normalizeError(studentsResource.initialError) ??
    normalizeError(teachersResource.initialError) ??
    normalizeError(programsResource.initialError) ??
    normalizeError(classesResource.initialError);

  /* ==========================================================
   * REFRESH ERROR
   * ========================================================== */

  const refreshError =
    normalizeError(reportsResource.refreshError) ??
    normalizeError(studentsResource.refreshError) ??
    normalizeError(teachersResource.refreshError) ??
    normalizeError(programsResource.refreshError) ??
    normalizeError(classesResource.refreshError);

  /*
   * Keep the public `error` contract as
   * the initial blocking error.
   *
   * Refresh errors remain non-blocking.
   */
  const error = initialError;

  /* ==========================================================
   * USER
   * ========================================================== */

  const userName = useMemo(
    () => getUserName(user, isTeacher ? "Guru" : "Siswa"),
    [user, isTeacher],
  );

  /* ==========================================================
   * REFRESH
   * ========================================================== */

  const refresh = useCallback(async () => {
    const tasks = [
      reportsResource.refresh(),
      programsResource.refresh(),
      classesResource.refresh(),
    ];

    if (isTeacher) {
      tasks.push(studentsResource.refresh());
    }

    if (isStudent) {
      tasks.push(teachersResource.refresh());
    }

    const results = await Promise.allSettled(tasks);

    const failed = results.find((result) => result.status === "rejected");

    if (failed) {
      throw failed.reason instanceof Error
        ? failed.reason
        : new Error("Gagal memperbarui dashboard.");
    }

    return true;
  }, [
    classesResource,
    isStudent,
    isTeacher,
    programsResource,
    reportsResource,
    studentsResource,
    teachersResource,
  ]);

  /* ==========================================================
   * RETURN
   * ========================================================== */

  return {
    user,

    accountId,

    userName,

    role: normalizedRole,

    isTeacher,

    isStudent,

    reports: enrichedReports,

    latestReport,

    latestReportData,

    isLoading,

    isInitialLoading: isLoading,

    isFetching,

    isRefreshing,

    error,

    initialError,

    refreshError,

    refresh,
  };
};

useDashboardData.displayName = "useDashboardData";

export default useDashboardData;
