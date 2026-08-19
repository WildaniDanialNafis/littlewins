import { normalizeId } from "./reportSelectors";

const normalizeRole = (role) => {
  if (typeof role !== "string") {
    return null;
  }

  const normalized = role.trim().toLowerCase();

  return normalized || null;
};

const getUserId = (user) => {
  if (!user || typeof user !== "object") {
    return null;
  }

  return normalizeId(user.profile?.id ?? user.id ?? null);
};

const isTeacherOwner = (user, report) => {
  const userId = getUserId(user);
  const teacherId = normalizeId(report?.teacher_id);

  return userId !== null && teacherId !== null && userId === teacherId;
};

const isStudentOwner = (user, report) => {
  const userId = getUserId(user);
  const studentId = normalizeId(report?.student_id);

  return userId !== null && studentId !== null && userId === studentId;
};

export const canViewReport = (user, report) => {
  if (!user || !report) {
    return false;
  }

  const role = normalizeRole(user.role);

  switch (role) {
    case "teacher":
      return isTeacherOwner(user, report);

    case "student":
      return isStudentOwner(user, report);

    default:
      return false;
  }
};

export const canEditReport = (user, report) => {
  if (!user || !report) {
    return false;
  }

  return normalizeRole(user.role) === "teacher" && isTeacherOwner(user, report);
};

export const canCreateReport = (user) => {
  return normalizeRole(user?.role) === "teacher";
};

export const canDeleteReport = (user, report) => {
  return canEditReport(user, report);
};

export const getReportCapabilities = (user, report) => {
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
};

export default {
  canViewReport,
  canEditReport,
  canCreateReport,
  canDeleteReport,
  getReportCapabilities,
};
