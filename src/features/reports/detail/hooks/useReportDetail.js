import { useCallback, useEffect, useMemo, useRef, useState } from "react";

import {
  useAuth,
  useClasses,
  usePrograms,
  useReportActivities,
  useReportMaterials,
  useReportPhotos,
  useReports,
  useStudents,
  useTeachers,
} from "@/shared/hooks";

import { canEditReport, canViewReport } from "../../domain/reportPermissions";

import { normalizeId } from "../../domain/reportSelectors";

import { getNilaiStyle, normalizeReportView } from "../utils/reportDetailUtils";

import useLightbox from "./useLightbox";

/* ============================================================
 * HELPERS
 * ============================================================ */

const EMPTY_ARRAY = Object.freeze([]);

const isAbortError = (error) => {
  return (
    error?.name === "AbortError" ||
    error?.name === "TimeoutError" ||
    error?.code === "ERR_CANCELED" ||
    error?.code === "ABORT_ERR"
  );
};

const normalizeError = (error, fallback) => {
  if (error instanceof Error) {
    return error;
  }

  if (error && typeof error.message === "string") {
    return new Error(error.message);
  }

  return new Error(fallback);
};

const getFirstRejectedError = (results) => {
  const failed = results.find(
    (result) => result.status === "rejected" && !isAbortError(result.reason),
  );

  if (!failed) {
    return null;
  }

  return normalizeError(failed.reason, "Gagal memperbarui data laporan.");
};

const toArray = (value) => {
  return Array.isArray(value) ? value : EMPTY_ARRAY;
};

/* ============================================================
 * HOOK
 * ============================================================ */

const useReportDetail = (reportId) => {
  const { user } = useAuth();

  const normalizedReportId = normalizeId(reportId);

  const { getReport } = useReports({
    autoFetch: false,
  });

  /* ==========================================================
   * LOOKUPS
   * ========================================================== */

  const {
    data: teachers = EMPTY_ARRAY,
    isInitialLoading: teachersLoading,
    isFetching: teachersFetching,
    isRefreshing: teachersRefreshing,
    initialError: teachersInitialError,
    refreshError: teachersRefreshError,
  } = useTeachers({
    staleTime: 10 * 60 * 1000,
  });

  const {
    data: programs = EMPTY_ARRAY,
    isInitialLoading: programsLoading,
    isFetching: programsFetching,
    isRefreshing: programsRefreshing,
    initialError: programsInitialError,
    refreshError: programsRefreshError,
  } = usePrograms({
    staleTime: 10 * 60 * 1000,
  });

  const {
    data: classes = EMPTY_ARRAY,
    isInitialLoading: classesLoading,
    isFetching: classesFetching,
    isRefreshing: classesRefreshing,
    initialError: classesInitialError,
    refreshError: classesRefreshError,
  } = useClasses({
    staleTime: 10 * 60 * 1000,
  });

  const {
    data: students = EMPTY_ARRAY,
    isInitialLoading: studentsLoading,
    isFetching: studentsFetching,
    isRefreshing: studentsRefreshing,
    initialError: studentsInitialError,
    refreshError: studentsRefreshError,
  } = useStudents({
    staleTime: 10 * 60 * 1000,
  });

  /* ==========================================================
   * RELATIONS
   * ========================================================== */

  const {
    materials = EMPTY_ARRAY,

    isInitialLoading: materialsLoading,

    isFetching: materialsFetching,

    isRefreshing: materialsRefreshing,

    initialError: materialsInitialError,

    refreshError: materialsRefreshError,

    refresh: refreshMaterials,
  } = useReportMaterials(normalizedReportId, {
    autoFetch: normalizedReportId !== null,
  });

  const {
    activities = EMPTY_ARRAY,

    isInitialLoading: activitiesLoading,

    isFetching: activitiesFetching,

    isRefreshing: activitiesRefreshing,

    initialError: activitiesInitialError,

    refreshError: activitiesRefreshError,

    refresh: refreshActivities,
  } = useReportActivities(normalizedReportId, {
    autoFetch: normalizedReportId !== null,
  });

  const {
    photos = EMPTY_ARRAY,

    isInitialLoading: photosLoading,

    isFetching: photosFetching,

    isRefreshing: photosRefreshing,

    initialError: photosInitialError,

    refreshError: photosRefreshError,

    refresh: refreshPhotos,
  } = useReportPhotos(normalizedReportId, {
    autoFetch: normalizedReportId !== null,
  });

  /* ==========================================================
   * REPORT STATE
   * ========================================================== */

  const [report, setReport] = useState(null);

  const [reportLoading, setReportLoading] = useState(
    normalizedReportId !== null,
  );

  const [reportFetching, setReportFetching] = useState(false);

  const [reportRefreshing, setReportRefreshing] = useState(false);

  const [reportInitialError, setReportInitialError] = useState(null);

  const [reportRefreshError, setReportRefreshError] = useState(null);

  const mountedRef = useRef(false);

  const requestVersionRef = useRef(0);

  const reportIdRef = useRef(normalizedReportId);

  /* ==========================================================
   * LIFECYCLE
   * ========================================================== */

  useEffect(() => {
    mountedRef.current = true;

    return () => {
      mountedRef.current = false;

      requestVersionRef.current += 1;
    };
  }, []);

  /* ==========================================================
   * REPORT ID CHANGE
   * ========================================================== */

  useEffect(() => {
    if (reportIdRef.current === normalizedReportId) {
      return;
    }

    reportIdRef.current = normalizedReportId;

    requestVersionRef.current += 1;

    setReport(null);

    setReportInitialError(null);

    setReportRefreshError(null);

    setReportFetching(false);

    setReportRefreshing(false);

    setReportLoading(normalizedReportId !== null);
  }, [normalizedReportId]);

  /* ==========================================================
   * FETCH REPORT
   * ========================================================== */

  const fetchReport = useCallback(
    async ({ refresh = false } = {}) => {
      const requestVersion = ++requestVersionRef.current;

      if (normalizedReportId === null) {
        if (mountedRef.current && reportIdRef.current === null) {
          setReport(null);

          setReportInitialError(new Error("ID laporan tidak valid."));

          setReportLoading(false);

          setReportFetching(false);

          setReportRefreshing(false);
        }

        return null;
      }

      const hasExistingReport = report !== null;

      if (
        mountedRef.current &&
        reportIdRef.current === normalizedReportId &&
        requestVersion === requestVersionRef.current
      ) {
        setReportFetching(true);

        if (refresh && hasExistingReport) {
          /*
           * Background refresh:
           * pertahankan data lama.
           */
          setReportRefreshing(true);

          setReportRefreshError(null);
        } else {
          setReportLoading(true);

          setReportInitialError(null);

          setReportRefreshError(null);
        }
      }

      try {
        const result = await getReport(normalizedReportId);

        const isCurrent =
          mountedRef.current &&
          reportIdRef.current === normalizedReportId &&
          requestVersion === requestVersionRef.current;

        if (!isCurrent) {
          return null;
        }

        if (!result || typeof result !== "object") {
          throw new Error("Laporan tidak ditemukan.");
        }

        setReport(result);

        setReportInitialError(null);

        setReportRefreshError(null);

        return result;
      } catch (error) {
        if (isAbortError(error)) {
          return null;
        }

        const normalizedError = normalizeError(error, "Gagal memuat laporan.");

        const isCurrent =
          mountedRef.current &&
          reportIdRef.current === normalizedReportId &&
          requestVersion === requestVersionRef.current;

        if (!isCurrent) {
          return null;
        }

        if (refresh && report !== null) {
          /*
           * Jangan menghapus report
           * ketika background refresh gagal.
           */
          setReportRefreshError(normalizedError);
        } else {
          setReportInitialError(normalizedError);

          setReport(null);
        }

        return null;
      } finally {
        const isCurrent =
          mountedRef.current &&
          reportIdRef.current === normalizedReportId &&
          requestVersion === requestVersionRef.current;

        if (isCurrent) {
          setReportLoading(false);
          setReportFetching(false);
          setReportRefreshing(false);
        }
      }
    },
    [getReport, normalizedReportId, report],
  );

  /* ==========================================================
   * INITIAL FETCH
   * ========================================================== */

  useEffect(() => {
    if (normalizedReportId === null) {
      return undefined;
    }

    let cancelled = false;

    const execute = async () => {
      if (cancelled) {
        return;
      }

      await fetchReport({
        refresh: false,
      });
    };

    void execute();

    return () => {
      cancelled = true;

      requestVersionRef.current += 1;
    };
  }, [fetchReport, normalizedReportId]);

  /* ==========================================================
   * CAPABILITIES
   * ========================================================== */

  const capabilities = useMemo(() => {
    if (!user || !report) {
      return {
        canView: false,
        canEdit: false,
        canDelete: false,
      };
    }

    const canView = canViewReport(user, report);

    const canEdit = canView && canEditReport(user, report);

    return {
      canView,

      canEdit,

      canDelete: canEdit,
    };
  }, [report, user]);

  const canView = capabilities.canView;

  /* ==========================================================
   * VIEW DATA
   * ========================================================== */

  const viewData = useMemo(() => {
    if (!report || !canView) {
      return null;
    }

    return normalizeReportView({
      report,

      materials: toArray(materials),

      activities: toArray(activities),

      photos: toArray(photos),

      students: toArray(students),

      teachers: toArray(teachers),

      programs: toArray(programs),

      classes: toArray(classes),
    });
  }, [
    report,
    canView,
    materials,
    activities,
    photos,
    students,
    teachers,
    programs,
    classes,
  ]);

  /* ==========================================================
   * NILAI
   * ========================================================== */

  const nilaiStyle = useMemo(
    () => getNilaiStyle(viewData?.score),
    [viewData?.score],
  );

  /* ==========================================================
   * ERRORS
   * ========================================================== */

  const permissionError =
    report && !canView
      ? new Error("Anda tidak memiliki akses ke laporan ini.")
      : null;

  const initialError =
    reportInitialError ??
    permissionError ??
    teachersInitialError ??
    programsInitialError ??
    classesInitialError ??
    studentsInitialError ??
    materialsInitialError ??
    activitiesInitialError ??
    photosInitialError ??
    null;

  const refreshError =
    reportRefreshError ??
    teachersRefreshError ??
    programsRefreshError ??
    classesRefreshError ??
    studentsRefreshError ??
    materialsRefreshError ??
    activitiesRefreshError ??
    photosRefreshError ??
    null;

  /* ==========================================================
   * LOADING
   * ========================================================== */

  const isInitialLoading = Boolean(
    reportLoading ||
    teachersLoading ||
    programsLoading ||
    classesLoading ||
    studentsLoading ||
    materialsLoading ||
    activitiesLoading ||
    photosLoading,
  );

  const isFetching = Boolean(
    reportFetching ||
    teachersFetching ||
    programsFetching ||
    classesFetching ||
    studentsFetching ||
    materialsFetching ||
    activitiesFetching ||
    photosFetching,
  );

  const isRefreshing = Boolean(
    reportRefreshing ||
    teachersRefreshing ||
    programsRefreshing ||
    classesRefreshing ||
    studentsRefreshing ||
    materialsRefreshing ||
    activitiesRefreshing ||
    photosRefreshing,
  );

  const isLoading = isInitialLoading;

  const error = initialError;

  /* ==========================================================
   * REFRESH
   * ========================================================== */

  const refresh = useCallback(async () => {
    if (normalizedReportId === null) {
      return true;
    }

    const results = await Promise.allSettled([
      fetchReport({
        refresh: true,
      }),

      refreshMaterials(),

      refreshActivities(),

      refreshPhotos(),
    ]);

    const refreshErrorFromRequest = getFirstRejectedError(results);

    if (refreshErrorFromRequest) {
      throw refreshErrorFromRequest;
    }

    return true;
  }, [
    fetchReport,
    normalizedReportId,
    refreshActivities,
    refreshMaterials,
    refreshPhotos,
  ]);

  /* ==========================================================
   * LIGHTBOX
   * ========================================================== */

  const lightbox = useLightbox(viewData?.photos ?? EMPTY_ARRAY);

  /* ==========================================================
   * RETURN
   * ========================================================== */

  return {
    report,

    viewData,

    nilaiStyle,

    capabilities,

    loading: isLoading,

    isLoading,

    isInitialLoading,

    isFetching,

    isRefreshing,

    error,

    initialError,

    refreshError,

    refresh,

    lightbox,
  };
};

useReportDetail.displayName = "useReportDetail";

export default useReportDetail;
