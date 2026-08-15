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
  filterReportsBySearch,
  paginateReports,
  sortReports,
} from "../utils/reportListUtils";

const createLookupMap = (items = []) => {
  if (!Array.isArray(items)) {
    return new Map();
  }

  return new Map(items.map((item) => [Number(item.id), item]));
};

const getName = (item, fallback = "-") => {
  if (!item) {
    return fallback;
  }

  return item.full_name || item.name || fallback;
};

const useReportList = (options = {}) => {
  const {
    role = "teacher",
    accountId = null,
    pageSize = DEFAULT_PAGE_SIZE,
    autoFetch = true,
  } = options;

  const [searchQuery, setSearchQuery] = useState("");
  const [sortKey, setSortKey] = useState(DEFAULT_SORT_KEY);
  const [sortDirection, setSortDirection] = useState(DEFAULT_SORT_DIRECTION);
  const [currentPage, setCurrentPage] = useState(1);
  const [deleteTargetId, setDeleteTargetId] = useState(null);

  const {
    reports = [],
    loading: reportsLoading,
    error: reportsError,
    refresh,
    deleteReport,
  } = useReports({
    autoFetch,
  });

  const {
    data: students = [],
    loading: studentsLoading,
    error: studentsError,
  } = useStudents({
    autoFetch,
  });

  const {
    data: teachers = [],
    loading: teachersLoading,
    error: teachersError,
  } = useTeachers({
    autoFetch,
  });

  const {
    data: programs = [],
    loading: programsLoading,
    error: programsError,
  } = usePrograms({
    autoFetch,
  });

  const studentMap = useMemo(() => createLookupMap(students), [students]);

  const teacherMap = useMemo(() => createLookupMap(teachers), [teachers]);

  const programMap = useMemo(() => createLookupMap(programs), [programs]);

  const enrichedReports = useMemo(() => {
    if (!Array.isArray(reports)) {
      return [];
    }

    return reports.map((report) => {
      const student = studentMap.get(Number(report.student_id));

      const teacher = teacherMap.get(Number(report.teacher_id));

      const program = programMap.get(Number(report.program_id));

      return {
        ...report,

        student_name: getName(student, "Siswa"),

        teacher_name: getName(teacher, "Pengajar"),

        program_name: getName(program, "Program"),
      };
    });
  }, [reports, studentMap, teacherMap, programMap]);

  const accountFilteredReports = useMemo(() => {
    if (accountId === null || accountId === undefined) {
      return enrichedReports;
    }

    return enrichedReports.filter((report) => {
      const accountField =
        role === "teacher" ? report.teacher_id : report.student_id;

      return Number(accountField) === Number(accountId);
    });
  }, [enrichedReports, accountId, role]);

  const filteredReports = useMemo(() => {
    return filterReportsBySearch(accountFilteredReports, searchQuery, role);
  }, [accountFilteredReports, searchQuery, role]);

  const sortedReports = useMemo(() => {
    return sortReports(filteredReports, sortKey, sortDirection);
  }, [filteredReports, sortKey, sortDirection]);

  const processed = useMemo(() => {
    return paginateReports(sortedReports, currentPage, pageSize);
  }, [sortedReports, currentPage, pageSize]);

  useEffect(() => {
    const totalPages = Math.max(1, Math.ceil(sortedReports.length / pageSize));

    if (currentPage > totalPages) {
      setCurrentPage(totalPages);
    }
  }, [currentPage, pageSize, sortedReports.length]);

  const handleSearchChange = useCallback((value) => {
    setSearchQuery(value);
    setCurrentPage(1);
  }, []);

  const clearSearch = useCallback(() => {
    setSearchQuery("");
    setCurrentPage(1);
  }, []);

  const handleSort = useCallback(
    (key) => {
      if (sortKey === key) {
        setSortDirection((current) => (current === "asc" ? "desc" : "asc"));
      } else {
        setSortKey(key);
        setSortDirection("desc");
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
      if (page < 1) {
        return;
      }

      if (page > currentPage && !processed.hasNextPage) {
        return;
      }

      if (page < currentPage && !processed.hasPreviousPage) {
        return;
      }

      setCurrentPage(page);
    },
    [currentPage, processed.hasNextPage, processed.hasPreviousPage],
  );

  const requestDelete = useCallback((id) => {
    setDeleteTargetId(id);
  }, []);

  const cancelDelete = useCallback(() => {
    setDeleteTargetId(null);
  }, []);

  const confirmDelete = useCallback(async () => {
    if (deleteTargetId === null) {
      return;
    }

    await deleteReport(deleteTargetId);

    setDeleteTargetId(null);

    await refresh();
  }, [deleteTargetId, deleteReport, refresh]);

  const isLoading =
    reportsLoading || studentsLoading || teachersLoading || programsLoading;

  const error =
    reportsError || studentsError || teachersError || programsError || null;

  return {
    searchQuery,
    sortKey,
    sortDirection,
    currentPage,
    deleteTargetId,

    reports: processed.visibleReports,
    allReports: sortedReports,

    hasNextPage: processed.hasNextPage,
    hasPreviousPage: processed.hasPreviousPage,

    startItem: processed.startItem,
    endItem: processed.endItem,

    isLoading,
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
