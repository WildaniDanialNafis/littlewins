import { useCallback, useMemo, useState } from "react";

import {
  DEFAULT_PAGE_SIZE,
  DEFAULT_SORT_DIRECTION,
  DEFAULT_SORT_KEY,
} from "@/shared/constants";

import {
  usePrograms,
  useReports,
  useStudents,
  useTeachers,
} from "@/shared/hooks";

import {
  createLookupMap,
  filterReportsByAccount,
  getReportProgramName,
  getReportStudentName,
  getReportTeacherName,
} from "../../domain/reportSelectors";

import {
  filterReportsBySearch,
  paginateReports,
  sortReports,
} from "../utils/reportListUtils";

const VALID_ROLES = new Set(["teacher", "student"]);

const EMPTY_ARRAY = Object.freeze([]);

const normalizeRole = (role) => {
  if (typeof role !== "string") {
    return null;
  }

  const normalized = role.trim().toLowerCase();

  return VALID_ROLES.has(normalized) ? normalized : null;
};

const normalizeAccountId = (accountId) => {
  if (accountId === null || accountId === undefined || accountId === "") {
    return null;
  }

  return String(accountId).trim() || null;
};

const normalizePageSize = (pageSize) => {
  const numeric = Number(pageSize);

  if (!Number.isInteger(numeric) || numeric <= 0) {
    return DEFAULT_PAGE_SIZE;
  }

  return numeric;
};

const normalizeSearch = (value) => String(value ?? "").trim();

const getSafeArray = (value) => (Array.isArray(value) ? value : EMPTY_ARRAY);

const enrichReports = ({ reports, studentMap, teacherMap, programMap }) => {
  if (!Array.isArray(reports) || reports.length === 0) {
    return EMPTY_ARRAY;
  }

  const enriched = new Array(reports.length);

  for (let i = 0; i < reports.length; i++) {
    const report = reports[i];

    if (!report || typeof report !== "object") {
      continue;
    }

    enriched[i] = {
      ...report,

      student_name: getReportStudentName(report, studentMap),

      teacher_name: getReportTeacherName(report, teacherMap),

      program_name: getReportProgramName(report, programMap),
    };
  }

  return enriched.filter(Boolean);
};

const getFirstError = (...errors) =>
  errors.find((error) => error !== null && error !== undefined) ?? null;

const useReportList = (options = {}) => {
  const {
    role: rawRole = "teacher",

    accountId: rawAccountId = null,

    pageSize: rawPageSize = DEFAULT_PAGE_SIZE,

    autoFetch = true,
  } = options;

  const role = normalizeRole(rawRole);

  const accountId = normalizeAccountId(rawAccountId);

  const normalizedPageSize = normalizePageSize(rawPageSize);

  const [searchQuery, setSearchQuery] = useState("");

  const [sortKey, setSortKey] = useState(DEFAULT_SORT_KEY);

  const [sortDirection, setSortDirection] = useState(DEFAULT_SORT_DIRECTION);

  const [currentPage, setCurrentPage] = useState(1);

  const [deleteTargetId, setDeleteTargetId] = useState(null);

  const studentsResource = useStudents({
    autoFetch,
  });

  const teachersResource = useTeachers({
    autoFetch,
  });

  const programsResource = usePrograms({
    autoFetch,
  });

  const reportsResource = useReports({
    autoFetch,
  });

  const {
    data: students = [],
    loading: studentsLoading,
    error: studentsError,
  } = studentsResource;

  const {
    data: teachers = [],
    loading: teachersLoading,
    error: teachersError,
  } = teachersResource;

  const {
    data: programs = [],
    loading: programsLoading,
    error: programsError,
  } = programsResource;

  const {
    reports = [],
    loading: reportsLoading,
    error: reportsError,
    deleteReport,
    refresh,
  } = reportsResource;

  const lookupMaps = useMemo(() => {
    const studentMap = createLookupMap(students);
    const teacherMap = createLookupMap(teachers);
    const programMap = createLookupMap(programs);

    return { studentMap, teacherMap, programMap };
  }, [students, teachers, programs]);

  const { studentMap, teacherMap, programMap } = lookupMaps;

  const enrichedReports = useMemo(
    () =>
      enrichReports({
        reports: getSafeArray(reports),

        studentMap,

        teacherMap,

        programMap,
      }),
    [reports, studentMap, teacherMap, programMap],
  );

  const accountFilteredReports = useMemo(
    () => filterReportsByAccount(enrichedReports, role, accountId),
    [enrichedReports, role, accountId],
  );

  const searchedReports = useMemo(
    () => filterReportsBySearch(accountFilteredReports, searchQuery, role),
    [accountFilteredReports, searchQuery, role],
  );

  const sortedReports = useMemo(
    () => sortReports(searchedReports, sortKey, sortDirection),
    [searchedReports, sortKey, sortDirection],
  );

  const pagination = useMemo(
    () => paginateReports(sortedReports, currentPage, normalizedPageSize),
    [sortedReports, currentPage, normalizedPageSize],
  );

  const reportsForPage = pagination.items;

  const handleSearchChange = useCallback((value) => {
    setSearchQuery(normalizeSearch(value));

    setCurrentPage(1);
  }, []);

  const handleSort = useCallback((key) => {
    setSortKey(key);

    setCurrentPage(1);
  }, []);

  const toggleSortDirection = useCallback(() => {
    setSortDirection((current) => (current === "asc" ? "desc" : "asc"));

    setCurrentPage(1);
  }, []);

  const handlePageChange = useCallback(
    (page) => {
      const numericPage = Number(page);

      if (
        !Number.isInteger(numericPage) ||
        numericPage < 1 ||
        numericPage > pagination.totalPages
      ) {
        return;
      }

      setCurrentPage(numericPage);
    },
    [pagination.totalPages],
  );

  const clearSearch = useCallback(() => {
    setSearchQuery("");

    setCurrentPage(1);
  }, []);

  const requestDelete = useCallback(
    (id) => {
      if (role !== "teacher") {
        return;
      }

      if (id === null || id === undefined || id === "") {
        return;
      }

      setDeleteTargetId(id);
    },
    [role],
  );

  const cancelDelete = useCallback(() => {
    setDeleteTargetId(null);
  }, []);

  const confirmDelete = useCallback(async () => {
    if (deleteTargetId === null || deleteTargetId === undefined) {
      return;
    }

    await deleteReport(deleteTargetId);

    setDeleteTargetId(null);

    setCurrentPage(1);
  }, [deleteReport, deleteTargetId]);

  const hasError = Boolean(
    getFirstError(studentsError, teachersError, programsError, reportsError),
  );

  // Only use reportsLoading as the primary loading state for the list
  // Other resources (students, teachers, programs) are supporting data
  // and should not block the skeleton from showing
  const isLoading = Boolean(reportsLoading);

  return {
    searchQuery,

    sortKey,

    sortDirection,

    currentPage,

    deleteTargetId,

    reports: reportsForPage,

    allReports: sortedReports,

    hasPreviousPage: pagination.hasPreviousPage,

    hasNextPage: pagination.hasNextPage,

    startItem: pagination.startItem,

    endItem: pagination.endItem,

    isLoading,

    hasError,

    error: getFirstError(
      studentsError,
      teachersError,
      programsError,
      reportsError,
    ),

    refresh,

    handleSearchChange,

    handleSort,

    toggleSortDirection,

    handlePageChange,

    clearSearch,

    requestDelete,

    cancelDelete,

    confirmDelete,
  };
};

useReportList.displayName = "useReportList";

export default useReportList;
