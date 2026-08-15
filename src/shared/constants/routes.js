/**
 * Application route definitions.
 *
 * Semua route aplikasi didefinisikan di satu tempat
 * agar navigasi dan redirect mudah di-maintain.
 */

// ============================================================
// APPLICATION ROUTES
// ============================================================

export const ROUTES = Object.freeze({
  // ----------------------------------------------------------
  // General
  // ----------------------------------------------------------

  home: "/",
  login: "/login",
  register: "/register",

  // ----------------------------------------------------------
  // Teacher
  // ----------------------------------------------------------

  teacher: Object.freeze({
    dashboard: "/guru/dashboard",

    reports: "/guru/reports",

    reportNew: "/guru/reports/new",

    reportDetail: (id) => `/guru/reports/${id}`,

    reportEdit: (id) => `/guru/reports/edit/${id}`,

    settings: "/guru/settings",

    classes: "/guru/classes",

    students: "/guru/students",
  }),

  // ----------------------------------------------------------
  // Student
  // ----------------------------------------------------------

  student: Object.freeze({
    dashboard: "/siswa/dashboard",

    reports: "/siswa/reports",

    reportDetail: (id) => `/siswa/reports/${id}`,

    settings: "/siswa/settings",

    progress: "/siswa/progress",
  }),
});

// ============================================================
// API ROUTES
// ============================================================

export const API_ROUTES = Object.freeze({
  auth: Object.freeze({
    login: "/login",
    logout: "/logout",
    register: "/register",
    me: "/me",
  }),

  reports: "/reports",

  reportMaterials: (id) => `/reports/${encodeURIComponent(id)}/materials`,

  reportActivities: (id) => `/reports/${encodeURIComponent(id)}/activities`,

  reportPhotos: (id) => `/reports/${encodeURIComponent(id)}/photos`,

  students: "/students",

  teachers: "/teachers",

  classes: "/classes",

  programs: "/programs",
});

// ============================================================
// BREADCRUMB HELPERS
// ============================================================

export const BREADCRUMB = {
  teacher: {
    dashboard: () => [
      {
        label: "Dashboard",
        path: ROUTES.teacher.dashboard,
      },
    ],

    reports: () => [
      {
        label: "Dashboard",
        path: ROUTES.teacher.dashboard,
      },
      {
        label: "Laporan",
        path: ROUTES.teacher.reports,
      },
    ],

    reportDetail: (title) => [
      {
        label: "Dashboard",
        path: ROUTES.teacher.dashboard,
      },
      {
        label: "Laporan",
        path: ROUTES.teacher.reports,
      },
      {
        label: title || "Detail Laporan",
      },
    ],

    reportForm: (editMode) => [
      {
        label: "Dashboard",
        path: ROUTES.teacher.dashboard,
      },
      {
        label: "Laporan",
        path: ROUTES.teacher.reports,
      },
      {
        label: editMode ? "Edit Laporan" : "Buat Laporan",
      },
    ],
  },

  student: {
    dashboard: () => [
      {
        label: "Dashboard",
        path: ROUTES.student.dashboard,
      },
    ],

    reports: () => [
      {
        label: "Dashboard",
        path: ROUTES.student.dashboard,
      },
      {
        label: "Laporan",
        path: ROUTES.student.reports,
      },
    ],

    reportDetail: (title) => [
      {
        label: "Dashboard",
        path: ROUTES.student.dashboard,
      },
      {
        label: "Laporan",
        path: ROUTES.student.reports,
      },
      {
        label: title || "Detail Laporan",
      },
    ],
  },

  settings: (role) => {
    const dashboardPath =
      role === "teacher" ? ROUTES.teacher.dashboard : ROUTES.student.dashboard;

    return [
      {
        label: "Dashboard",
        path: dashboardPath,
      },
      {
        label: "Pengaturan",
      },
    ];
  },
};
