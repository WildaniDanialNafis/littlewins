import { useMemo } from "react";

import {
  useClasses,
  usePrograms,
  useReportActivities,
  useReportMaterials,
  useReportPhotos,
  useReports,
  useStudents,
  useTeachers,
} from "@/shared/hooks";

import {
  createLookupMap,
  getName,
  getNilaiStyle,
  hasValue,
} from "../utils/reportDetailUtils";

import useLightbox from "./useLightbox";

const useReportDetail = (reportId) => {
  const {
    reports = [],
    loading: reportsLoading,
    error: reportsError,
    refresh,
  } = useReports({
    autoFetch: true,
  });

  const {
    data: teachers = [],
    loading: teachersLoading,
    error: teachersError,
  } = useTeachers();

  const {
    data: programs = [],
    loading: programsLoading,
    error: programsError,
  } = usePrograms();

  const {
    data: classes = [],
    loading: classesLoading,
    error: classesError,
  } = useClasses();

  const {
    data: students = [],
    loading: studentsLoading,
    error: studentsError,
  } = useStudents();

  const {
    materials = [],
    loading: materialsLoading,
    error: materialsError,
  } = useReportMaterials(reportId);

  const {
    activities = [],
    loading: activitiesLoading,
    error: activitiesError,
  } = useReportActivities(reportId);

  const {
    photos = [],
    loading: photosLoading,
    error: photosError,
  } = useReportPhotos(reportId);

  const report = useMemo(() => {
    if (!reportId || !Array.isArray(reports)) {
      return null;
    }

    return reports.find((item) => Number(item.id) === Number(reportId)) ?? null;
  }, [reports, reportId]);

  const teacherMap = useMemo(() => createLookupMap(teachers), [teachers]);

  const programMap = useMemo(() => createLookupMap(programs), [programs]);

  const classMap = useMemo(() => createLookupMap(classes), [classes]);

  const studentMap = useMemo(() => createLookupMap(students), [students]);

  const viewData = useMemo(() => {
    if (!report) {
      return null;
    }

    const teacher = teacherMap.get(Number(report.teacher_id));

    const program = programMap.get(Number(report.program_id));

    const classItem = classMap.get(Number(report.class_id));

    const student = studentMap.get(Number(report.student_id));

    return {
      id: report.id,

      programName: getName(program),
      teacherName: getName(teacher),
      className: getName(classItem),
      studentName: getName(student, "Siswa"),

      reportDate: report.report_date,
      status: report.status,
      duration: report.duration,

      score: report.score,

      ratings: {
        understanding: report.rating_understanding,

        activity: report.rating_activity,

        discipline: report.rating_discipline,

        communication: report.rating_communication,
      },

      homework: report.homework,
      teacherNote: report.teacher_note,
      recommendation: report.recommendation,

      materials: Array.isArray(materials)
        ? materials.map((item) => item.material).filter(Boolean)
        : [],

      activities: Array.isArray(activities)
        ? activities.map((item) => item.activity).filter(Boolean)
        : [],

      photos: Array.isArray(photos)
        ? photos.map((item) => item.photo).filter(Boolean)
        : [],
    };
  }, [
    report,
    teacherMap,
    programMap,
    classMap,
    studentMap,
    materials,
    activities,
    photos,
  ]);

  const nilaiStyle = useMemo(() => {
    if (!viewData || !hasValue(viewData.score)) {
      return null;
    }

    return getNilaiStyle(viewData.score);
  }, [viewData]);

  const isLoading =
    reportsLoading ||
    teachersLoading ||
    programsLoading ||
    classesLoading ||
    studentsLoading ||
    materialsLoading ||
    activitiesLoading ||
    photosLoading;

  const error =
    reportsError ||
    teachersError ||
    programsError ||
    classesError ||
    studentsError ||
    materialsError ||
    activitiesError ||
    photosError ||
    null;

  const lightbox = useLightbox(viewData?.photos ?? []);

  return {
    viewData,
    nilaiStyle,
    isLoading,
    error,
    refresh,
    lightbox,
  };
};

useReportDetail.displayName = "useReportDetail";

export default useReportDetail;
