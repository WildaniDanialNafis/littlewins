import { memo } from "react";

import { Button } from "@/shared/components/ui";

import { SearchIcon, SortIcon } from "@/shared/icons";

import { cx } from "@/shared/utils";

const SORT_OPTIONS = [
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
];

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
        ? "Cari mata pelajaran atau siswa..."
        : "Cari mata pelajaran atau guru...";

    const sortLabel = sortDirection === "asc" ? "Urutan naik" : "Urutan turun";

    return (
      <section aria-label="Filter laporan" className="mb-6">
        <div
          className={cx(
            "rounded-2xl bg-surface p-3 shadow-sm ring-1 ring-border",
            "sm:p-4",
          )}
        >
          <div className="flex flex-col gap-3 lg:flex-row lg:items-center">
            <div className="relative min-w-0 flex-1">
              <div
                className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-4 text-muted"
                aria-hidden="true"
              >
                <SearchIcon className="h-4 w-4" />
              </div>

              <label htmlFor={searchId} className="sr-only">
                Cari laporan
              </label>

              <input
                id={searchId}
                type="search"
                value={searchQuery}
                placeholder={placeholder}
                onChange={(event) => {
                  onSearchChange?.(event.target.value);
                }}
                className={cx(
                  "h-11 w-full rounded-xl border border-border",
                  "bg-surface-muted pl-11 pr-4",
                  "text-sm text-text outline-none",
                  "placeholder:text-placeholder",
                  "transition-[background-color,border-color,box-shadow]",
                  "duration-(--token-transition-fast)",
                  "focus:border-primary focus:bg-surface",
                  "focus:ring-2 focus:ring-primary/20",
                  "motion-reduce:transition-none",
                )}
              />
            </div>

            <div className="flex w-full gap-2 lg:w-auto">
              <label htmlFor={sortId} className="sr-only">
                Urutkan laporan
              </label>

              <select
                id={sortId}
                value={sortKey}
                onChange={(event) => {
                  onSortChange?.(event.target.value);
                }}
                className={cx(
                  "h-11 min-w-0 flex-1 rounded-xl",
                  "border border-border bg-surface px-4",
                  "text-sm font-medium text-text outline-none",
                  "transition-[border-color,box-shadow]",
                  "duration-(--token-transition-fast)",
                  "focus:border-primary",
                  "focus:ring-2 focus:ring-primary/20",
                  "sm:min-w-45 sm:flex-none",
                  "motion-reduce:transition-none",
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
                variant="ghost"
                size="icon"
                onClick={onToggleSort}
                aria-label={`Ubah urutan laporan. Saat ini ${sortLabel}`}
                title={sortLabel}
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
