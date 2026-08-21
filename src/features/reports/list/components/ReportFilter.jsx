import { memo, useCallback } from "react";

import { Button } from "@/shared/components/ui";

import { SearchIcon, SortIcon } from "@/shared/icons";

import { cx } from "@/shared/utils";

/* ============================================================
 * CONSTANTS
 * ============================================================ */

const SORT_OPTIONS = Object.freeze([
  {
    key: "report_date",
    label: "Tanggal",
  },
  {
    key: "program_name",
    label: "Mata Pelajaran",
  },
  {
    key: "score",
    label: "Nilai",
  },
  {
    key: "rating_understanding",
    label: "Pemahaman",
  },
]);

const SORT_BUTTON_CLASS = [
  "shrink-0",
  "bg-surface",
  "text-text",
  "ring-1 ring-border",
  "shadow-none",
  "transition-colors duration-(--token-transition-fast)",
  "hover:bg-surface-muted",
  "hover:text-text",
  "active:bg-surface-hover",
  "focus-visible:outline-none",
  "focus-visible:ring-2",
  "focus-visible:ring-primary/30",
  "focus-visible:ring-offset-2",
  "focus-visible:ring-offset-background",
  "motion-reduce:transition-none",
].join(" ");

/* ============================================================
 * REPORT FILTER
 * ============================================================ */

const ReportFilter = memo(
  ({
    role = "teacher",
    searchQuery = "",
    sortKey,
    sortDirection,
    onSearchChange,
    onSortChange,
    onToggleSort,
  }) => {
    const searchId = `${role}-report-search`;
    const sortId = `${role}-report-sort`;

    const placeholder =
      role === "teacher"
        ? "Cari siswa atau pelajaran"
        : "Cari guru atau pelajaran";

    const sortLabel = sortDirection === "asc" ? "Naik" : "Turun";

    const selectedSortKey = SORT_OPTIONS.some(
      (option) => option.key === sortKey,
    )
      ? sortKey
      : SORT_OPTIONS[0].key;

    const handleSearchChange = useCallback(
      (event) => {
        onSearchChange?.(event.target.value);
      },
      [onSearchChange],
    );

    const handleSortChange = useCallback(
      (event) => {
        onSortChange?.(event.target.value);
      },
      [onSortChange],
    );

    return (
      <section aria-label="Filter laporan" className="min-w-0">
        <div
          className={cx(
            "rounded-xl",
            "border border-border",
            "bg-surface",
            "p-3 sm:p-4",
          )}
        >
          <div
            className={cx(
              "flex min-w-0 flex-col gap-2.5",
              "lg:flex-row lg:items-center",
            )}
          >
            <div className="relative min-w-0 flex-1">
              <div
                className={cx(
                  "pointer-events-none absolute inset-y-0 left-0",
                  "flex items-center pl-3.5",
                  "text-muted",
                )}
                aria-hidden="true"
              >
                <SearchIcon className="h-4 w-4" aria-hidden="true" />
              </div>

              <label htmlFor={searchId} className="sr-only">
                Cari laporan
              </label>

              <input
                id={searchId}
                type="search"
                value={searchQuery}
                placeholder={placeholder}
                onChange={handleSearchChange}
                autoComplete="off"
                className={cx(
                  "h-11 w-full rounded-xl",
                  "border border-border",
                  "bg-surface-muted",
                  "pl-10 pr-4",
                  "text-sm text-text outline-none",
                  "placeholder:text-placeholder",
                  "transition-[background-color,border-color,box-shadow]",
                  "duration-(--token-transition-fast)",
                  "focus:border-primary",
                  "focus:bg-surface",
                  "focus:ring-2",
                  "focus:ring-primary/20",
                  "motion-reduce:transition-none",
                )}
              />
            </div>

            <div className="flex w-full min-w-0 gap-2 lg:w-auto">
              <label htmlFor={sortId} className="sr-only">
                Urutkan laporan
              </label>

              <select
                id={sortId}
                value={selectedSortKey}
                onChange={handleSortChange}
                className={cx(
                  "h-11 min-w-0 flex-1 rounded-xl",
                  "border border-border",
                  "bg-surface-muted",
                  "px-3.5",
                  "text-sm font-medium text-text outline-none",
                  "transition-[background-color,border-color,box-shadow]",
                  "duration-(--token-transition-fast)",
                  "focus:border-primary",
                  "focus:bg-surface",
                  "focus:ring-2",
                  "focus:ring-primary/20",
                  "motion-reduce:transition-none",
                  "sm:min-w-[11rem] sm:flex-none",
                )}
              >
                {SORT_OPTIONS.map((option) => (
                  <option key={option.key} value={option.key}>
                    {option.label}
                  </option>
                ))}
              </select>

              <Button
                type="button"
                size="icon"
                onClick={onToggleSort}
                aria-label={`Urutan ${sortLabel.toLowerCase()}`}
                title={`Urutan ${sortLabel}`}
                className={SORT_BUTTON_CLASS}
              >
                <SortIcon className="h-4 w-4" aria-hidden="true" />
              </Button>
            </div>
          </div>
        </div>
      </section>
    );
  },
);

ReportFilter.displayName = "ReportFilter";

export default ReportFilter;
