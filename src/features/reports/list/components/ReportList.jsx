import { memo, useMemo } from "react";

import { Button, EmptyState } from "@/shared/components/ui";

import ReportCard from "./ReportCard";
import ReportPagination from "./ReportPagination";

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
  }) => {
    const isTeacher = role === "teacher";

    const safeReports = Array.isArray(reports) ? reports : [];

    const hasSearch = String(searchQuery ?? "").trim().length > 0;

    const emptyDescription = useMemo(
      () =>
        isTeacher
          ? "Belum ada laporan. Buat laporan pertama."
          : "Belum ada laporan untuk Anda.",
      [isTeacher],
    );

    /* ==========================================================
     * EMPTY
     * ========================================================== */

    if (safeReports.length === 0) {
      return (
        <div
          className="rounded-xl border border-border bg-surface px-4 py-10 sm:px-6 sm:py-12"
          aria-live="polite"
        >
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
      <div className="min-w-0 space-y-5" aria-live="polite">
        <div
          className="grid min-w-0 grid-cols-1 gap-3.5 md:grid-cols-2 xl:grid-cols-3"
          role="list"
          aria-label="Daftar laporan"
        >
          {safeReports.map((report) => {
            if (report === null || report === undefined) {
              return null;
            }

            const key = report?.id ?? report?._id;

            if (key === null || key === undefined) {
              return null;
            }

            return (
              <div key={String(key)} role="listitem" className="min-w-0">
                <ReportCard
                  report={report}
                  role={role}
                  onPreview={onPreview}
                  onEdit={onEdit}
                  onDelete={onDelete}
                />
              </div>
            );
          })}
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
