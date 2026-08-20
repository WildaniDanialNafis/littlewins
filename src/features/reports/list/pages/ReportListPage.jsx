import { useCallback } from "react";
import { useNavigate } from "react-router-dom";

import { PageContainer } from "@/layouts/components";

import { Button, ConfirmDialog, ErrorState } from "@/shared/components/ui";

import { ROUTES } from "@/shared/constants";

import { PlusIcon } from "@/shared/icons";

import { ReportFilter, ReportList, ReportListSkeleton } from "../components";

import { useDelayedLoading } from "@/shared/hooks";

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

  /* ============================================================
   * LOADING VISIBILITY
   * ============================================================ */

  const showSkeleton = useDelayedLoading(isLoading, "page");

  /* ============================================================
   * NAVIGATION
   * ============================================================ */

  const goToCreate = useCallback(() => {
    if (!isTeacher) {
      return;
    }

    navigate(ROUTES.teacher.reportNew);
  }, [isTeacher, navigate]);

  const goToPreview = useCallback(
    (reportId) => {
      if (!reportId) {
        return;
      }

      navigate(
        isTeacher
          ? ROUTES.teacher.reportDetail(reportId)
          : ROUTES.student.reportDetail(reportId),
      );
    },
    [isTeacher, navigate],
  );

  const goToEdit = useCallback(
    (reportId) => {
      if (!isTeacher || !reportId) {
        return;
      }

      navigate(ROUTES.teacher.reportEdit(reportId));
    },
    [isTeacher, navigate],
  );

  /* ============================================================
   * PAGE META
   * ============================================================ */

  const reportCount = allReports.length;

  const pageSubtitle = isLoading
    ? "Memuat laporan..."
    : reportCount > 0
      ? `${reportCount} laporan.`
      : "Belum ada laporan.";

  const pageActions = isTeacher ? (
    <Button
      type="button"
      variant="primary"
      size="md"
      onClick={goToCreate}
      className="w-full sm:w-auto"
    >
      <PlusIcon className="h-4 w-4 shrink-0" aria-hidden="true" />

      <span>Buat Laporan</span>
    </Button>
  ) : null;

  /* ============================================================
   * LOADING
   * ============================================================ */

  if (showSkeleton) {
    return (
      <PageContainer
        title="Laporan"
        subtitle="Memuat laporan..."
        actions={pageActions}
      >
        <div aria-busy="true" aria-live="polite">
          <ReportListSkeleton count={6} />
        </div>
      </PageContainer>
    );
  }

  /* ============================================================
   * ERROR
   * ============================================================ */

  if (hasError) {
    return (
      <PageContainer
        title="Laporan"
        subtitle="Gagal memuat."
        actions={pageActions}
      >
        <ErrorState error={error} onRetry={refresh} />
      </PageContainer>
    );
  }

  /* ============================================================
   * VIEW
   * ============================================================ */

  return (
    <PageContainer
      title="Laporan"
      subtitle={pageSubtitle}
      actions={pageActions}
    >
      <div className="min-w-0 space-y-5 sm:space-y-6">
        <ReportFilter
          role={role}
          searchQuery={searchQuery}
          sortKey={sortKey}
          sortDirection={sortDirection}
          onSearchChange={handleSearchChange}
          onSortChange={handleSort}
          onToggleSort={toggleSortDirection}
        />

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

        {isTeacher && (
          <ConfirmDialog
            isOpen={deleteTargetId !== null}
            onClose={cancelDelete}
            onConfirm={confirmDelete}
            title="Hapus Laporan"
            message="Laporan akan dihapus permanen."
            confirmText="Hapus"
            cancelText="Batal"
            variant="danger"
          />
        )}
      </div>
    </PageContainer>
  );
};

ReportListPage.displayName = "ReportListPage";

export default ReportListPage;
