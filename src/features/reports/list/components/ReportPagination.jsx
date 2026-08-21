import { memo, useCallback } from "react";

import { Button } from "@/shared/components/ui";

import { ChevronLeftIcon, ChevronRightIcon } from "@/shared/icons";

/* ============================================================
 * HELPERS
 * ============================================================ */

const toSafePage = (value) => {
  const numeric = Number(value);

  return Number.isInteger(numeric) && numeric > 0 ? numeric : 1;
};

/* ============================================================
 * REPORT PAGINATION
 * ============================================================ */

const ReportPagination = memo(
  ({
    currentPage,
    hasPreviousPage,
    hasNextPage,
    startItem,
    endItem,
    onPageChange,
  }) => {
    const page = toSafePage(currentPage);

    const handlePrevious = useCallback(() => {
      if (!hasPreviousPage) {
        return;
      }

      onPageChange?.(Math.max(1, page - 1));
    }, [hasPreviousPage, onPageChange, page]);

    const handleNext = useCallback(() => {
      if (!hasNextPage) {
        return;
      }

      onPageChange?.(page + 1);
    }, [hasNextPage, onPageChange, page]);

    const hasItems = Number(startItem) > 0 && Number(endItem) > 0;

    return (
      <nav
        aria-label="Navigasi laporan"
        className="flex min-w-0 flex-col gap-3 border-t border-border pt-4 sm:flex-row sm:items-center sm:justify-between"
      >
        <p className="text-sm text-muted" aria-live="polite">
          {hasItems ? (
            <>
              {startItem}–{endItem}
            </>
          ) : (
            "Tidak ada laporan"
          )}
        </p>

        <div className="flex items-center gap-1.5">
          <Button
            type="button"
            variant="secondary"
            size="sm"
            disabled={!hasPreviousPage}
            onClick={handlePrevious}
            aria-label="Sebelumnya"
            className="min-h-10"
          >
            <ChevronLeftIcon className="h-4 w-4" aria-hidden="true" />

            <span className="hidden sm:inline">Sebelumnya</span>
          </Button>

          <span
            className="inline-flex h-10 min-w-10 items-center justify-center rounded-lg bg-primary px-3 text-sm font-semibold tabular-nums text-primary-foreground"
            aria-current="page"
            aria-label={`Halaman ${page}`}
          >
            {page}
          </span>

          <Button
            type="button"
            variant="secondary"
            size="sm"
            disabled={!hasNextPage}
            onClick={handleNext}
            aria-label="Berikutnya"
            className="min-h-10"
          >
            <span className="hidden sm:inline">Berikutnya</span>

            <ChevronRightIcon className="h-4 w-4" aria-hidden="true" />
          </Button>
        </div>
      </nav>
    );
  },
);

ReportPagination.displayName = "ReportPagination";

export default ReportPagination;
