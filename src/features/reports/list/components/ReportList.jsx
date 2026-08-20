import { memo } from "react";

import { Button, EmptyState, SkeletonCard } from "@/shared/components/ui";

import ReportCard from "./ReportCard";
import ReportPagination from "./ReportPagination";

/* ============================================================
 * REPORT LIST SKELETON
 * ============================================================ */

const ReportListSkeleton = ({ count = 6 }) => {
  return (
    <div className="min-w-0 space-y-5">
      <div className="grid min-w-0 grid-cols-1 gap-3.5 md:grid-cols-2 xl:grid-cols-3">
        {Array.from({ length: count }).map((_, index) => (
          <SkeletonCard key={index} variant="report" />
        ))}
      </div>
    </div>
  );
};

ReportListSkeleton.displayName = "ReportListSkeleton";

/* ============================================================
 * REPORT LIST
 * ============================================================ */

const ReportList = memo(
  ({
    role = "teacher",
    reports = [],
    searchQuery = "",
    currentPage,
    hasPreviousPage,
    hasNextPage,
    startItem,
    endItem,
    onPreview,
    onEdit,
    onDelete,
    onPageChange,
    onClearSearch,
    onCreate,
    isLoading = false,
  }) => {
    const isTeacher = role === "teacher";

    const hasSearch = Boolean(searchQuery.trim());

    const emptyDescription = isTeacher
      ? "Belum ada laporan. Buat laporan pertama."
      : "Belum ada laporan untuk Anda.";

    /* ==========================================================
     * LOADING SKELETON
     * ========================================================== */

    if (isLoading) {
      return <ReportListSkeleton count={6} />;
    }

    /* ==========================================================
     * EMPTY
     * ========================================================== */

    if (reports.length === 0) {
      return (
        <div className="rounded-xl border border-border bg-surface px-4 py-10 sm:px-6 sm:py-12">
          <EmptyState
            title={hasSearch ? "Laporan tidak ditemukan" : "Belum ada laporan"}
            description={
              hasSearch ? "Tidak ada hasil yang cocok." : emptyDescription
            }
            action={
              hasSearch ? (
                <Button
                  type="button"
                  variant="secondary"
                  size="sm"
                  className="mt-4"
                  onClick={onClearSearch}
                >
                  Hapus pencarian
                </Button>
              ) : isTeacher && onCreate ? (
                <Button
                  type="button"
                  variant="primary"
                  size="sm"
                  className="mt-4"
                  onClick={onCreate}
                >
                  Buat Laporan
                </Button>
              ) : null
            }
          />
        </div>
      );
    }

    /* ==========================================================
     * LIST
     * ========================================================== */

    return (
      <div className="min-w-0 space-y-5">
        <div className="grid min-w-0 grid-cols-1 gap-3.5 md:grid-cols-2 xl:grid-cols-3">
          {reports.map((report) => (
            <ReportCard
              key={report.id}
              report={report}
              role={role}
              onPreview={onPreview}
              onEdit={onEdit}
              onDelete={onDelete}
            />
          ))}
        </div>

        {(hasPreviousPage || hasNextPage) && (
          <ReportPagination
            currentPage={currentPage}
            hasPreviousPage={hasPreviousPage}
            hasNextPage={hasNextPage}
            startItem={startItem}
            endItem={endItem}
            onPageChange={onPageChange}
          />
        )}
      </div>
    );
  },
);

ReportList.displayName = "ReportList";

export default ReportList;
