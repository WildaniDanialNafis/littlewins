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

const getRefreshError = (results) => {
  const failed = results.find(
    (result) => result.status === "rejected" && !isAbortError(result.reason),
  );

  return failed
    ? normalizeError(failed.reason, "Gagal memperbarui data laporan.")
    : null;
};

const useReportDetail = (reportId) => {
  const { user } = useAuth();

  const normalizedReportId = normalizeId(reportId);

  const { getReport } = useReports({
    autoFetch: false,
  });

  const {
    data: teachers = [],
    loading: teachersLoading,
    error: teachersError,
    refresh: refreshTeachers,
  } = useTeachers();

  const {
    data: programs = [],
    loading: programsLoading,
    error: programsError,
    refresh: refreshPrograms,
  } = usePrograms();

  const {
    data: classes = [],
    loading: classesLoading,
    error: classesError,
    refresh: refreshClasses,
  } = useClasses();

  const {
    data: students = [],
    loading: studentsLoading,
    error: studentsError,
    refresh: refreshStudents,
  } = useStudents();

  const {
    materials = [],
    loading: materialsLoading,
    error: materialsError,
    refresh: refreshMaterials,
  } = useReportMaterials(normalizedReportId, {
    autoFetch: normalizedReportId !== null,
  });

  const {
    activities = [],
    loading: activitiesLoading,
    error: activitiesError,
    refresh: refreshActivities,
  } = useReportActivities(normalizedReportId, {
    autoFetch: normalizedReportId !== null,
  });

  const {
    photos = [],
    loading: photosLoading,
    error: photosError,
    refresh: refreshPhotos,
  } = useReportPhotos(normalizedReportId, {
    autoFetch: normalizedReportId !== null,
  });

  const [report, setReport] = useState(null);

  const [reportLoading, setReportLoading] = useState(
    normalizedReportId !== null,
  );

  const [reportError, setReportError] = useState(null);

  const mountedRef = useRef(false);

  const requestVersionRef = useRef(0);

  useEffect(() => {
    mountedRef.current = true;

    return () => {
      mountedRef.current = false;
      requestVersionRef.current += 1;
    };
  }, []);

  const fetchReport = useCallback(async () => {
    const requestVersion = ++requestVersionRef.current;

    if (normalizedReportId === null) {
      if (mountedRef.current) {
        setReport(null);

        setReportError(new Error("ID laporan tidak valid."));

        setReportLoading(false);
      }

      return null;
    }

    setReportLoading(true);

    setReportError(null);

    try {
      const result = await getReport(normalizedReportId);

      const current =
        mountedRef.current && requestVersion === requestVersionRef.current;

      if (!current) {
        return null;
      }

      if (!result || typeof result !== "object") {
        throw new Error("Laporan tidak ditemukan.");
      }

      setReport(result);

      return result;
    } catch (error) {
      if (isAbortError(error)) {
        return null;
      }

      if (mountedRef.current && requestVersion === requestVersionRef.current) {
        setReport(null);

        setReportError(normalizeError(error, "Gagal memuat laporan."));
      }

      return null;
    } finally {
      if (mountedRef.current && requestVersion === requestVersionRef.current) {
        setReportLoading(false);
      }
    }
  }, [getReport, normalizedReportId]);

  useEffect(() => {
    void fetchReport();
  }, [fetchReport]);

  const canView = Boolean(user && report && canViewReport(user, report));

  const capabilities = useMemo(() => {
    if (!user || !report) {
      return {
        canView: false,
        canEdit: false,
        canDelete: false,
      };
    }

    const view = canViewReport(user, report);

    const edit = view && canEditReport(user, report);

    return {
      canView: view,
      canEdit: edit,
      canDelete: edit,
    };
  }, [user, report]);

  const viewData = useMemo(() => {
    if (!report || !canView) {
      return null;
    }

    return normalizeReportView({
      report,
      materials,
      activities,
      photos,
      students,
      teachers,
      programs,
      classes,
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

  const nilaiStyle = useMemo(
    () => getNilaiStyle(viewData?.score),
    [viewData?.score],
  );

  const permissionError =
    report && !canView
      ? new Error("Anda tidak memiliki akses ke laporan ini.")
      : null;

  const error =
    reportError ||
    permissionError ||
    teachersError ||
    programsError ||
    classesError ||
    studentsError ||
    materialsError ||
    activitiesError ||
    photosError ||
    null;

  const isLoading = Boolean(
    reportLoading ||
    teachersLoading ||
    programsLoading ||
    classesLoading ||
    studentsLoading ||
    materialsLoading ||
    activitiesLoading ||
    photosLoading,
  );

  const refresh = useCallback(async () => {
    const tasks = [
      fetchReport(),
      refreshTeachers(),
      refreshPrograms(),
      refreshClasses(),
      refreshStudents(),
    ];

    if (normalizedReportId !== null) {
      tasks.push(refreshMaterials(), refreshActivities(), refreshPhotos());
    }

    const results = await Promise.allSettled(tasks);

    const refreshError = getRefreshError(results);

    if (refreshError) {
      throw refreshError;
    }
  }, [
    fetchReport,
    normalizedReportId,
    refreshTeachers,
    refreshPrograms,
    refreshClasses,
    refreshStudents,
    refreshMaterials,
    refreshActivities,
    refreshPhotos,
  ]);

  const lightbox = useLightbox(viewData?.photos ?? []);

  return {
    report,
    viewData,
    nilaiStyle,
    capabilities,
    isLoading,
    error,
    refresh,
    lightbox,
  };
};

useReportDetail.displayName = "useReportDetail";

export default useReportDetail;
