import { useCallback } from "react";
import { useNavigate } from "react-router-dom";

import { PageContainer } from "@/layouts/components";

import { Button, ConfirmDialog, ErrorState } from "@/shared/components/ui";

import { ROUTES } from "@/shared/constants";

import { PlusIcon } from "@/shared/icons";

import { useDelayedLoading } from "@/shared/hooks";

import { ReportFilter, ReportList, ReportListSkeleton } from "../components";

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

    isInitialLoading,

    isFetching,

    isRefreshing,

    isDeleting,

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
  } = useReportList({
    role,
    accountId,
  });

  const isTeacher = role === "teacher";

  /* ==========================================================
   * LOADING
   * ========================================================== */

  const showSkeleton = useDelayedLoading(
    isInitialLoading && allReports.length === 0,
    "page",
  );

  const shouldShowSkeleton = showSkeleton && allReports.length === 0;

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
      if (reportId === null || reportId === undefined || reportId === "") {
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
      if (
        !isTeacher ||
        reportId === null ||
        reportId === undefined ||
        reportId === ""
      ) {
        return;
      }

      navigate(ROUTES.teacher.reportEdit(reportId));
    },
    [isTeacher, navigate],
  );

  /* ==========================================================
   * META
   * ========================================================== */

  const reportCount = allReports.length;

  const pageSubtitle = shouldShowSkeleton
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

  /* ==========================================================
   * INITIAL ERROR
   * ========================================================== */

  if (!shouldShowSkeleton && initialError && allReports.length === 0) {
    return (
      <PageContainer
        title="Laporan"
        subtitle="Data laporan tidak dapat dimuat."
        actions={pageActions}
      >
        <ErrorState
          error={initialError}
          onRetry={refresh}
          title="Gagal memuat laporan"
        />
      </PageContainer>
    );
  }

  return (
    <PageContainer
      title="Laporan"
      subtitle={pageSubtitle}
      actions={pageActions}
    >
      <div
        className="min-w-0 space-y-5 sm:space-y-6"
        aria-busy={isFetching || undefined}
      >
        {/* ==================================================
         * INITIAL SKELETON
         * ================================================== */}

        {shouldShowSkeleton ? (
          <ReportListSkeleton />
        ) : (
          <>
            {/* ==============================================
             * BACKGROUND REFRESH STATUS
             * ============================================== */}

            {(isRefreshing || refreshError) && (
              <div
                className="flex min-w-0 items-center justify-between gap-3 rounded-xl border border-border bg-surface-muted/40 px-4 py-3"
                role={refreshError ? "alert" : "status"}
                aria-live="polite"
              >
                <div className="min-w-0">
                  <p className="text-sm font-medium text-text">
                    {refreshError
                      ? "Pembaruan laporan gagal."
                      : "Memperbarui laporan..."}
                  </p>

                  {refreshError && (
                    <p className="mt-0.5 text-xs text-muted">
                      Data sebelumnya tetap ditampilkan.
                    </p>
                  )}
                </div>

                {refreshError && (
                  <Button
                    type="button"
                    variant="secondary"
                    size="sm"
                    onClick={refresh}
                    disabled={isRefreshing}
                    className="shrink-0"
                  >
                    Coba lagi
                  </Button>
                )}
              </div>
            )}

            {/* ==============================================
             * FILTER
             * ============================================== */}

            <ReportFilter
              role={role}
              searchQuery={searchQuery}
              sortKey={sortKey}
              sortDirection={sortDirection}
              onSearchChange={handleSearchChange}
              onSortChange={handleSort}
              onToggleSort={toggleSortDirection}
            />

            {/* ==============================================
             * LIST
             * ============================================== */}

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

            {/* ==============================================
             * DELETE STATUS
             * ============================================== */}

            {isDeleting && (
              <div className="sr-only" role="status" aria-live="polite">
                Menghapus laporan...
              </div>
            )}

            {/* ==============================================
             * DELETE CONFIRMATION
             * ============================================== */}

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
          </>
        )}
      </div>
    </PageContainer>
  );
};

ReportListPage.displayName = "ReportListPage";

export default ReportListPage;
