import { memo } from "react";

import { Button } from "@/shared/components/ui";

import { ChevronLeftIcon, ChevronRightIcon } from "@/shared/icons";

const ReportPagination = memo(
  ({
    currentPage,
    hasPreviousPage,
    hasNextPage,
    startItem,
    endItem,
    onPageChange,
  }) => {
    const handlePrevious = () => {
      if (!hasPreviousPage) {
        return;
      }

      onPageChange?.(currentPage - 1);
    };

    const handleNext = () => {
      if (!hasNextPage) {
        return;
      }

      onPageChange?.(currentPage + 1);
    };

    return (
      <nav
        className="flex flex-col gap-3 border-t border-border pt-5 sm:flex-row sm:items-center sm:justify-between"
        aria-label="Pagination laporan"
      >
        <p className="text-sm text-muted">
          Menampilkan{" "}
          <span className="font-semibold text-text">
            {startItem} – {endItem}
          </span>
        </p>

        <div className="flex items-center gap-2">
          <Button
            type="button"
            variant="secondary"
            size="sm"
            disabled={!hasPreviousPage}
            onClick={handlePrevious}
            aria-label="Halaman sebelumnya"
          >
            <ChevronLeftIcon className="h-4 w-4" aria-hidden="true" />

            <span className="ml-1 hidden sm:inline">Sebelumnya</span>
          </Button>

          <span
            className="inline-flex h-10 min-w-10 items-center justify-center rounded-lg bg-primary px-3 text-sm font-semibold text-primary-foreground"
            aria-current="page"
            aria-label={`Halaman ${currentPage}`}
          >
            {currentPage}
          </span>

          <Button
            type="button"
            variant="secondary"
            size="sm"
            disabled={!hasNextPage}
            onClick={handleNext}
            aria-label="Halaman selanjutnya"
          >
            <span className="mr-1 hidden sm:inline">Selanjutnya</span>

            <ChevronRightIcon className="h-4 w-4" aria-hidden="true" />
          </Button>
        </div>
      </nav>
    );
  },
);

ReportPagination.displayName = "ReportPagination";

export default ReportPagination;
