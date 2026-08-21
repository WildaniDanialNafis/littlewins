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

  return reports
    .map((report) => {
      if (!report || typeof report !== "object") {
        return null;
      }

      return {
        ...report,

        student_name: getReportStudentName(report, studentMap),

        teacher_name: getReportTeacherName(report, teacherMap),

        program_name: getReportProgramName(report, programMap),
      };
    })
    .filter(Boolean);
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
    data: students = EMPTY_ARRAY,

    isInitialLoading: studentsInitialLoading,

    isFetching: studentsFetching,

    isRefreshing: studentsRefreshing,

    initialError: studentsInitialError,

    refreshError: studentsRefreshError,
  } = studentsResource;

  const {
    data: teachers = EMPTY_ARRAY,

    isInitialLoading: teachersInitialLoading,

    isFetching: teachersFetching,

    isRefreshing: teachersRefreshing,

    initialError: teachersInitialError,

    refreshError: teachersRefreshError,
  } = teachersResource;

  const {
    data: programs = EMPTY_ARRAY,

    isInitialLoading: programsInitialLoading,

    isFetching: programsFetching,

    isRefreshing: programsRefreshing,

    initialError: programsInitialError,

    refreshError: programsRefreshError,
  } = programsResource;

  const {
    reports = EMPTY_ARRAY,

    isInitialLoading: reportsInitialLoading,

    isFetching: reportsFetching,

    isRefreshing: reportsRefreshing,

    initialError: reportsInitialError,

    refreshError: reportsRefreshError,

    isDeleting,

    deleteReport,

    refresh,
  } = reportsResource;

  const studentMap = useMemo(() => createLookupMap(students), [students]);

  const teacherMap = useMemo(() => createLookupMap(teachers), [teachers]);

  const programMap = useMemo(() => createLookupMap(programs), [programs]);

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

  const effectivePage = pagination.page;

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
    if (isDeleting) {
      return;
    }

    setDeleteTargetId(null);
  }, [isDeleting]);

  const confirmDelete = useCallback(async () => {
    if (deleteTargetId === null || deleteTargetId === undefined) {
      return;
    }

    if (isDeleting) {
      return;
    }

    await deleteReport(deleteTargetId);

    setDeleteTargetId(null);
    setCurrentPage(1);
  }, [deleteReport, deleteTargetId, isDeleting]);

  const initialError = getFirstError(
    studentsInitialError,
    teachersInitialError,
    programsInitialError,
    reportsInitialError,
  );

  const refreshError = getFirstError(
    studentsRefreshError,
    teachersRefreshError,
    programsRefreshError,
    reportsRefreshError,
  );

  const isInitialLoading = Boolean(
    studentsInitialLoading ||
    teachersInitialLoading ||
    programsInitialLoading ||
    reportsInitialLoading,
  );

  const isFetching = Boolean(
    studentsFetching || teachersFetching || programsFetching || reportsFetching,
  );

  const isRefreshing = Boolean(
    studentsRefreshing ||
    teachersRefreshing ||
    programsRefreshing ||
    reportsRefreshing,
  );

  const isMutating = Boolean(isDeleting);

  const isLoading = isInitialLoading;

  const hasError = Boolean(initialError);

  return {
    searchQuery,

    sortKey,

    sortDirection,

    currentPage: effectivePage,

    deleteTargetId,

    reports: reportsForPage,

    allReports: sortedReports,

    hasPreviousPage: pagination.hasPreviousPage,

    hasNextPage: pagination.hasNextPage,

    startItem: pagination.startItem,

    endItem: pagination.endItem,

    isLoading,

    isInitialLoading,

    isFetching,

    isRefreshing,

    isMutating,

    isDeleting,

    hasError,

    error: initialError,

    initialError,

    refreshError,

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
