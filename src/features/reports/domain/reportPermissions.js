import {
  getReportStudentId,
  getReportTeacherId,
  normalizeId,
} from "./reportSelectors";

/* ============================================================
 * ROLE
 * ============================================================ */

const normalizeRole = (role) => {
  if (typeof role !== "string") {
    return null;
  }

  const normalized = role.trim().toLowerCase();

  return normalized || null;
};

/* ============================================================
 * USER
 * ============================================================ */

const getUserId = (user) => {
  if (!user || typeof user !== "object") {
    return null;
  }

  return normalizeId(user?.profile?.id ?? user?.id ?? null);
};

/* ============================================================
 * OWNERSHIP
 * ============================================================ */

export const isTeacherReportOwner = (user, report) => {
  const userId = getUserId(user);

  const teacherId = getReportTeacherId(report);

  return userId !== null && teacherId !== null && userId === teacherId;
};

export const isStudentReportOwner = (user, report) => {
  const userId = getUserId(user);

  const studentId = getReportStudentId(report);

  return userId !== null && studentId !== null && userId === studentId;
};

/* ============================================================
 * VIEW
 * ============================================================ */

export const canViewReport = (user, report) => {
  if (!user || !report) {
    return false;
  }

  const role = normalizeRole(user.role);

  switch (role) {
    case "teacher":
      return isTeacherReportOwner(user, report);

    case "student":
      return isStudentReportOwner(user, report);

    default:
      return false;
  }
};

/* ============================================================
 * CREATE
 * ============================================================ */

export const canCreateReport = (user) => {
  return normalizeRole(user?.role) === "teacher";
};

/* ============================================================
 * EDIT
 * ============================================================ */

export const canEditReport = (user, report) => {
  if (!user || !report) {
    return false;
  }

  return (
    normalizeRole(user.role) === "teacher" && isTeacherReportOwner(user, report)
  );
};

/* ============================================================
 * UPDATE
 * ============================================================ */

export const canUpdateReport = (user, report) => {
  return canEditReport(user, report);
};

/* ============================================================
 * DELETE
 * ============================================================ */

export const canDeleteReport = (user, report) => {
  return canEditReport(user, report);
};

/* ============================================================
 * CAPABILITIES
 * ============================================================ */

export const getReportCapabilities = (user, report) => {
  if (!user || !report) {
    return {
      canView: false,

      canCreate: canCreateReport(user),

      canEdit: false,

      canUpdate: false,

      canDelete: false,
    };
  }

  const canView = canViewReport(user, report);

  const canEdit = canView && canEditReport(user, report);

  return {
    canView,

    canCreate: canCreateReport(user),

    canEdit,

    canUpdate: canEdit,

    canDelete: canEdit,
  };
};

export default {
  isTeacherReportOwner,

  isStudentReportOwner,

  canViewReport,

  canCreateReport,

  canEditReport,

  canUpdateReport,

  canDeleteReport,

  getReportCapabilities,
};
