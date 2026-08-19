import {
  createLookupMap,
  getEntityName,
  getReportClassName,
  getReportProgramName,
  getReportStudentName,
  getReportTeacherName,
  normalizeId,
} from "./reportSelectors";

const normalizeString = (value) => {
  if (value === null || value === undefined) {
    return "";
  }

  return String(value).trim();
};

const normalizeNumber = (value, fallback = null) => {
  if (value === null || value === undefined || value === "") {
    return fallback;
  }

  const number = Number(value);

  return Number.isFinite(number) ? number : fallback;
};

const normalizeRatings = (report) => {
  return {
    understanding: normalizeNumber(report?.rating_understanding, 0),

    activity: normalizeNumber(report?.rating_activity, 0),

    discipline: normalizeNumber(report?.rating_discipline, 0),

    communication: normalizeNumber(report?.rating_communication, 0),
  };
};

const normalizeRelationValues = (items, field) => {
  if (!Array.isArray(items)) {
    return [];
  }

  return items
    .map((item) => {
      if (typeof item === "string") {
        return item.trim();
      }

      return normalizeString(item?.[field]);
    })
    .filter(Boolean);
};

const normalizePhotos = (photos) => {
  if (!Array.isArray(photos)) {
    return [];
  }

  return photos
    .map((item) => {
      if (typeof item === "string") {
        return item;
      }

      return (
        item?.photo_url || item?.url || item?.image_url || item?.photo || null
      );
    })
    .filter(Boolean);
};

export const normalizeReport = (
  report,
  {
    students = [],
    teachers = [],
    programs = [],
    classes = [],
    materials = [],
    activities = [],
    photos = [],
  } = {},
) => {
  if (!report || typeof report !== "object") {
    return null;
  }

  const studentMap =
    students instanceof Map ? students : createLookupMap(students);

  const teacherMap =
    teachers instanceof Map ? teachers : createLookupMap(teachers);

  const programMap =
    programs instanceof Map ? programs : createLookupMap(programs);

  const classMap = classes instanceof Map ? classes : createLookupMap(classes);

  return {
    id: normalizeId(report.id),

    studentId: normalizeId(report.student_id),
    teacherId: normalizeId(report.teacher_id),
    programId: normalizeId(report.program_id),
    classId: normalizeId(report.class_id),

    studentName: getReportStudentName(report, studentMap),

    teacherName: getReportTeacherName(report, teacherMap),

    programName: getReportProgramName(report, programMap),

    className: getReportClassName(report, classMap),

    reportDate: report.report_date ?? report.date ?? report.created_at ?? null,

    status: normalizeString(report.status) || null,

    duration: normalizeNumber(report.duration),

    score: normalizeNumber(report.score),

    ratings: normalizeRatings(report),

    homework: normalizeString(report.homework),

    teacherNote: normalizeString(report.teacher_note),

    recommendation: normalizeString(report.recommendation),

    materials: normalizeRelationValues(materials, "material"),

    activities: normalizeRelationValues(activities, "activity"),

    photos: normalizePhotos(photos),

    raw: report,
  };
};

export const normalizeReportListItem = (
  report,
  { students = [], teachers = [], programs = [] } = {},
) => {
  if (!report || typeof report !== "object") {
    return null;
  }

  const studentMap = createLookupMap(students);
  const teacherMap = createLookupMap(teachers);
  const programMap = createLookupMap(programs);

  return {
    ...report,

    id: normalizeId(report.id),

    student_id: normalizeId(report.student_id),

    teacher_id: normalizeId(report.teacher_id),

    program_id: normalizeId(report.program_id),

    student_name: getReportStudentName(report, studentMap),

    teacher_name: getReportTeacherName(report, teacherMap),

    program_name: getReportProgramName(report, programMap),
  };
};

export const normalizeReportOptions = (items, fallback) => {
  if (!Array.isArray(items)) {
    return [];
  }

  return items
    .map((item) => {
      const id = normalizeId(item?.id);

      if (id === null) {
        return null;
      }

      return {
        value: String(id),
        label: getEntityName(item, `${fallback} ${id}`),
      };
    })
    .filter(Boolean);
};

export const normalizeReportScore = (value) => {
  if (value === null || value === undefined || value === "") {
    return null;
  }

  const score = Number(value);

  if (!Number.isFinite(score)) {
    return null;
  }

  return Math.min(100, Math.max(0, score));
};

export const normalizeReportDuration = (value) => {
  if (value === null || value === undefined || value === "") {
    return null;
  }

  const duration = Number(value);

  if (!Number.isInteger(duration)) {
    return null;
  }

  if (duration < 0) {
    return null;
  }

  return duration;
};
