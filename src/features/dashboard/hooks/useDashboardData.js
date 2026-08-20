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

/* ============================================================
 * CONSTANTS
 * ============================================================ */

const EMPTY_ARRAY = Object.freeze([]);

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
   * REPORTS
   * ========================================================== */

  const reportsResource = useReports({
    autoFetch: Boolean(normalizedRole && accountId !== null),
  });

  /* ==========================================================
   * LOOKUPS
   * ========================================================== */

  const studentsResource = useStudents({
    autoFetch: isTeacher,
  });

  const teachersResource = useTeachers({
    autoFetch: isStudent,
  });

  const programsResource = usePrograms({
    autoFetch: Boolean(normalizedRole && accountId !== null),
  });

  const classesResource = useClasses({
    autoFetch: Boolean(normalizedRole && accountId !== null),
  });

  /* ==========================================================
   * DATA
   * ========================================================== */

  /*
   * Important:
   *
   * toArray() sekarang mengembalikan shared EMPTY_ARRAY
   * ketika resource belum mempunyai array.
   *
   * Jadi useMemo di bawah tidak kehilangan referential
   * stability hanya karena resource sedang undefined/null.
   */
  const reports = toArray(reportsResource.reports);

  const students = toArray(studentsResource.data);

  const teachers = toArray(teachersResource.data);

  const programs = toArray(programsResource.data);

  const classes = toArray(classesResource.data);

  /* ==========================================================
   * LOOKUP MAPS
   * ========================================================== */

  const studentMap = useMemo(() => createLookupMap(students), [students]);

  const teacherMap = useMemo(() => createLookupMap(teachers), [teachers]);

  const programMap = useMemo(() => createLookupMap(programs), [programs]);

  const classMap = useMemo(() => createLookupMap(classes), [classes]);

  /* ==========================================================
   * ACCOUNT SCOPE
   * ========================================================== */

  const scopedReports = useMemo(() => {
    if (normalizedRole === null || accountId === null) {
      return EMPTY_ARRAY;
    }

    return filterReportsByAccount(reports, normalizedRole, accountId);
  }, [reports, normalizedRole, accountId]);

  /* ==========================================================
   * ENRICH
   * ========================================================== */

  const enrichedReports = useMemo(
    () =>
      scopedReports.map((report) => ({
        ...report,

        student_name: getReportStudentName(report, studentMap),

        teacher_name: getReportTeacherName(report, teacherMap),

        program_name: getReportProgramName(report, programMap),

        class_name: getReportClassName(report, classMap),
      })),
    [scopedReports, studentMap, teacherMap, programMap, classMap],
  );

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
   * LOADING
   * ========================================================== */

  const isLoading = Boolean(
    reportsResource.loading ||
    studentsResource.loading ||
    teachersResource.loading ||
    programsResource.loading ||
    classesResource.loading,
  );

  /* ==========================================================
   * ERROR
   * ========================================================== */

  const error =
    normalizeError(reportsResource.error) ||
    normalizeError(studentsResource.error) ||
    normalizeError(teachersResource.error) ||
    normalizeError(programsResource.error) ||
    normalizeError(classesResource.error);

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
    isTeacher,
    isStudent,
    reportsResource,
    studentsResource,
    teachersResource,
    programsResource,
    classesResource,
  ]);

  /* ==========================================================
   * RETURN
   * ========================================================== */

  return {
    user,

    accountId,

    userName: getUserName(user, isTeacher ? "Guru" : "Siswa"),

    role: normalizedRole,

    isTeacher,

    isStudent,

    reports: enrichedReports,

    latestReport,

    latestReportData,

    isLoading,

    error,

    refresh,
  };
};

useDashboardData.displayName = "useDashboardData";

export default useDashboardData;
