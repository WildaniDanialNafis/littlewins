import { useCallback } from "react";
import { useNavigate } from "react-router-dom";

import { PageContainer } from "@/layouts/components";

import {
  Button,
  ConfirmDialog,
  ErrorState,
  LoadingState,
} from "@/shared/components/ui";

import { PlusIcon } from "@/shared/icons";

import { ROUTES } from "@/shared/constants";

import { ReportFilter, ReportList } from "../components";

import useReportList from "../hooks/useReportList";

/* ============================================================
 * PAGE
 * ============================================================ */

const ReportListPage = ({ role = "teacher", accountId = null }) => {
  const navigate = useNavigate();

  const {
    searchQuery,
    sortKey,
    sortDirection,
    currentPage,
    deleteTargetId,

    reports,
    allReports,

    hasPreviousPage,
    hasNextPage,
    startItem,
    endItem,

    isLoading,
    hasError,
    error,

    refresh,

    handleSearchChange,
    handleSort,
    toggleSortDirection,
    handlePageChange,
    clearSearch,

    requestDelete,
    cancelDelete,
    confirmDelete,
  } = useReportList({
    role,
    accountId,
  });

  const isTeacher = role === "teacher";

  /* ==========================================================
   * NAVIGATION
   * ========================================================== */

  const goToCreate = useCallback(() => {
    if (!isTeacher) {
      return;
    }

    navigate(ROUTES.teacher.reportNew);
  }, [isTeacher, navigate]);

  const goToPreview = useCallback(
    (reportId) => {
      const path = isTeacher
        ? ROUTES.teacher.reportDetail(reportId)
        : ROUTES.student.reportDetail(reportId);

      navigate(path);
    },
    [isTeacher, navigate],
  );

  const goToEdit = useCallback(
    (reportId) => {
      if (!isTeacher) {
        return;
      }

      navigate(ROUTES.teacher.reportEdit(reportId));
    },
    [isTeacher, navigate],
  );

  /* ==========================================================
   * LOADING
   * ========================================================== */

  if (isLoading) {
    return (
      <PageContainer title="Riwayat Laporan" subtitle="Memuat data laporan...">
        <LoadingState message="Memuat data laporan..." />
      </PageContainer>
    );
  }

  /* ==========================================================
   * ERROR
   * ========================================================== */

  if (hasError) {
    return (
      <PageContainer title="Riwayat Laporan" subtitle="Gagal memuat data.">
        <ErrorState error={error} onRetry={refresh} />
      </PageContainer>
    );
  }

  /* ==========================================================
   * VIEW
   * ========================================================== */

  return (
    <PageContainer
      title="Riwayat Laporan"
      subtitle={
        allReports.length === 0
          ? "Belum ada laporan belajar"
          : `${allReports.length} laporan belajar`
      }
      actions={
        isTeacher ? (
          <Button
            type="button"
            variant="primary"
            size="md"
            onClick={goToCreate}
          >
            <PlusIcon className="h-4 w-4" aria-hidden="true" />

            <span>Buat Laporan</span>
          </Button>
        ) : null
      }
    >
      <div className="space-y-5">
        {/* ======================================================
         * FILTER
         * ====================================================== */}

        <ReportFilter
          role={role}
          searchQuery={searchQuery}
          sortKey={sortKey}
          sortDirection={sortDirection}
          onSearchChange={handleSearchChange}
          onSortChange={handleSort}
          onToggleSort={toggleSortDirection}
        />

        {/* ======================================================
         * LIST
         * ====================================================== */}

        <ReportList
          role={role}
          reports={reports}
          searchQuery={searchQuery}
          currentPage={currentPage}
          hasPreviousPage={hasPreviousPage}
          hasNextPage={hasNextPage}
          startItem={startItem}
          endItem={endItem}
          onPreview={goToPreview}
          onEdit={isTeacher ? goToEdit : undefined}
          onDelete={isTeacher ? requestDelete : undefined}
          onPageChange={handlePageChange}
          onClearSearch={clearSearch}
          onCreate={isTeacher ? goToCreate : undefined}
        />
      </div>

      {/* ========================================================
       * DELETE CONFIRMATION
       * ======================================================== */}

      {isTeacher && (
        <ConfirmDialog
          isOpen={deleteTargetId !== null}
          onClose={cancelDelete}
          onConfirm={confirmDelete}
          title="Hapus Laporan"
          message="Apakah Anda yakin ingin menghapus laporan ini? Tindakan ini tidak dapat dibatalkan."
          confirmText="Hapus"
          cancelText="Batal"
          variant="danger"
        />
      )}
    </PageContainer>
  );
};

ReportListPage.displayName = "ReportListPage";

export default ReportListPage;
