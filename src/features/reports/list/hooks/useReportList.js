import { useCallback, useEffect, useMemo, useState } from "react";

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

  return String(accountId);
};

const normalizePageSize = (pageSize) => {
  const numericPageSize = Number(pageSize);

  if (!Number.isInteger(numericPageSize) || numericPageSize <= 0) {
    return DEFAULT_PAGE_SIZE;
  }

  return numericPageSize;
};

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

const normalizeSearch = (value) => String(value ?? "").trim();

const useReportList = (options = {}) => {
  const {
    role: rawRole = "teacher",

    accountId: rawAccountId = null,

    pageSize: rawPageSize = DEFAULT_PAGE_SIZE,

    autoFetch = true,
  } = options;

  const role = normalizeRole(rawRole);

  const accountId = normalizeAccountId(rawAccountId);

  const pageSize = normalizePageSize(rawPageSize);

  const [searchQuery, setSearchQuery] = useState("");

  const [sortKey, setSortKey] = useState(DEFAULT_SORT_KEY);

  const [sortDirection, setSortDirection] = useState(DEFAULT_SORT_DIRECTION);

  const [currentPage, setCurrentPage] = useState(1);

  const [deleteTargetId, setDeleteTargetId] = useState(null);

  const [deleteSubmitting, setDeleteSubmitting] = useState(false);

  const {
    reports: rawReports,
    loading: reportsLoading,
    error: reportsError,
    refresh: refreshReports,
    deleteReport,
  } = useReports({
    autoFetch,
  });

  const {
    data: rawStudents,
    loading: studentsLoading,
    error: studentsError,
    refresh: refreshStudents,
  } = useStudents({
    autoFetch,
  });

  const {
    data: rawTeachers,
    loading: teachersLoading,
    error: teachersError,
    refresh: refreshTeachers,
  } = useTeachers({
    autoFetch,
  });

  const {
    data: rawPrograms,
    loading: programsLoading,
    error: programsError,
    refresh: refreshPrograms,
  } = usePrograms({
    autoFetch,
  });

  const reports = getSafeArray(rawReports);

  const students = getSafeArray(rawStudents);

  const teachers = getSafeArray(rawTeachers);

  const programs = getSafeArray(rawPrograms);

  const studentMap = useMemo(() => createLookupMap(students), [students]);

  const teacherMap = useMemo(() => createLookupMap(teachers), [teachers]);

  const programMap = useMemo(() => createLookupMap(programs), [programs]);

  const enrichedReports = useMemo(
    () =>
      enrichReports({
        reports,
        studentMap,
        teacherMap,
        programMap,
      }),
    [reports, studentMap, teacherMap, programMap],
  );

  const accountScopedReports = useMemo(() => {
    if (role === null) {
      return EMPTY_ARRAY;
    }

    if (accountId === null) {
      return EMPTY_ARRAY;
    }

    return filterReportsByAccount(enrichedReports, role, accountId);
  }, [enrichedReports, role, accountId]);

  const filteredReports = useMemo(
    () =>
      filterReportsBySearch(
        accountScopedReports,
        normalizeSearch(searchQuery),
        role,
      ),
    [accountScopedReports, searchQuery, role],
  );

  const sortedReports = useMemo(
    () => sortReports(filteredReports, sortKey, sortDirection),
    [filteredReports, sortKey, sortDirection],
  );

  const totalPages = useMemo(() => {
    if (sortedReports.length === 0) {
      return 1;
    }

    return Math.max(1, Math.ceil(sortedReports.length / pageSize));
  }, [sortedReports.length, pageSize]);

  const effectivePage = Math.min(Math.max(currentPage, 1), totalPages);

  /*
   * Filter/sort/page-size berubah:
   * state page lama tidak langsung dipakai
   * untuk indexing hasil baru.
   */
  useEffect(() => {
    if (currentPage !== effectivePage) {
      setCurrentPage(effectivePage);
    }
  }, [currentPage, effectivePage]);

  const processed = useMemo(
    () => paginateReports(sortedReports, effectivePage, pageSize),
    [sortedReports, effectivePage, pageSize],
  );

  const handleSearchChange = useCallback((value) => {
    const nextSearch = normalizeSearch(value);

    setSearchQuery(nextSearch);

    setCurrentPage(1);
  }, []);

  const clearSearch = useCallback(() => {
    setSearchQuery("");
    setCurrentPage(1);
  }, []);

  const handleSort = useCallback(
    (key) => {
      const nextKey = normalizeSearch(key);

      if (!nextKey) {
        return;
      }

      if (sortKey === nextKey) {
        setSortDirection((current) => (current === "asc" ? "desc" : "asc"));
      } else {
        setSortKey(nextKey);

        setSortDirection(DEFAULT_SORT_DIRECTION);
      }

      setCurrentPage(1);
    },
    [sortKey],
  );

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
        numericPage > totalPages
      ) {
        return;
      }

      setCurrentPage(numericPage);
    },
    [totalPages],
  );

  const requestDelete = useCallback(
    (id) => {
      if (id === null || id === undefined || id === "" || deleteSubmitting) {
        return;
      }

      setDeleteTargetId(id);
    },
    [deleteSubmitting],
  );

  const cancelDelete = useCallback(() => {
    if (deleteSubmitting) {
      return;
    }

    setDeleteTargetId(null);
  }, [deleteSubmitting]);

  const confirmDelete = useCallback(async () => {
    if (
      deleteSubmitting ||
      deleteTargetId === null ||
      deleteTargetId === undefined ||
      deleteTargetId === ""
    ) {
      return false;
    }

    const targetId = deleteTargetId;

    setDeleteSubmitting(true);

    try {
      await deleteReport(targetId);

      /*
       * Revalidate effective page
       * setelah item terhapus.
       */
      setDeleteTargetId(null);

      return true;
    } catch {
      return false;
    } finally {
      setDeleteSubmitting(false);
    }
  }, [deleteReport, deleteSubmitting, deleteTargetId]);

  const refresh = useCallback(async () => {
    const results = await Promise.allSettled([
      refreshReports(),
      refreshStudents(),
      refreshTeachers(),
      refreshPrograms(),
    ]);

    const failed = results.find((result) => result.status === "rejected");

    if (failed) {
      throw failed.reason instanceof Error
        ? failed.reason
        : new Error("Gagal memperbarui daftar laporan.");
    }
  }, [refreshReports, refreshStudents, refreshTeachers, refreshPrograms]);

  const error =
    reportsError || studentsError || teachersError || programsError || null;

  return {
    searchQuery,

    sortKey,

    sortDirection,

    currentPage: effectivePage,

    totalPages,

    hasPreviousPage: processed.hasPreviousPage,

    hasNextPage: processed.hasNextPage,

    startItem: processed.startItem,

    endItem: processed.endItem,

    reports: processed.visibleReports,

    allReports: sortedReports,

    deleteTargetId,

    deleteSubmitting,

    isLoading: Boolean(
      reportsLoading || studentsLoading || teachersLoading || programsLoading,
    ),

    hasError: Boolean(error),

    error,

    refresh,

    handleSearchChange,

    clearSearch,

    handleSort,

    toggleSortDirection,

    handlePageChange,

    requestDelete,

    cancelDelete,

    confirmDelete,
  };
};

useReportList.displayName = "useReportList";

export default useReportList;
