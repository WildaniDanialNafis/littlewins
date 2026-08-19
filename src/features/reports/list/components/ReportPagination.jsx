import { memo } from "react";

import { Button } from "@/shared/components/ui";

import { ChevronLeftIcon, ChevronRightIcon } from "@/shared/icons";

const toSafePage = (value) => {
  const numeric = Number(value);

  return Number.isInteger(numeric) && numeric > 0 ? numeric : 1;
};

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

    const handlePrevious = () => {
      if (!hasPreviousPage) {
        return;
      }

      onPageChange?.(page - 1);
    };

    const handleNext = () => {
      if (!hasNextPage) {
        return;
      }

      onPageChange?.(page + 1);
    };

    const hasItems = Number(startItem) > 0 && Number(endItem) > 0;

    return (
      <nav
        className="flex flex-col gap-3 border-t border-border pt-5 sm:flex-row sm:items-center sm:justify-between"
        aria-label="Pagination laporan"
      >
        <p className="text-sm text-muted" aria-live="polite">
          {hasItems ? (
            <>
              Menampilkan{" "}
              <span className="font-semibold text-text">
                {startItem} – {endItem}
              </span>
            </>
          ) : (
            "Tidak ada laporan"
          )}
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
