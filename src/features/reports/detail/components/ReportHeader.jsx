import { memo } from "react";

import { CheckIcon } from "@/shared/icons";

import { cx } from "@/shared/utils";

import { formatReportDate } from "../utils/reportDetailUtils";

/* ============================================================
 * STATUS CONFIG
 * ============================================================ */

const STATUS_CONFIG = {
  completed: {
    label: "Selesai",
    className: "bg-success-soft text-success",
  },

  draft: {
    label: "Draft",
    className: "bg-warning-soft text-warning",
  },

  cancelled: {
    label: "Batal",
    className: "bg-danger-soft text-danger",
  },
};

/* ============================================================
 * REPORT HEADER
 * ============================================================ */

const ReportHeader = memo(({ report }) => {
  if (!report) {
    return null;
  }

  const statusConfig = STATUS_CONFIG[report.status] ?? STATUS_CONFIG.draft;

  return (
    <header
      className={cx(
        "border-b border-border",
        "bg-linear-to-r from-primary/5 via-primary/5 to-transparent",
        "px-4 py-5",
        "sm:px-6 sm:py-6",
        "md:px-8 md:py-7",
        "print:border-0 print:bg-white",
      )}
    >
      <div
        className={cx(
          "grid min-w-0",
          "grid-cols-[minmax(0,1fr)_auto]",
          "items-start gap-3",
          "sm:gap-5",
        )}
      >
        {/* ==================================================
         * REPORT INFO
         * ================================================== */}

        <div className="min-w-0">
          <p className="truncate text-xs font-semibold uppercase tracking-[0.08em] text-primary">
            Laporan Belajar
          </p>

          <h1
            className={cx(
              "mt-1.5",
              "truncate",
              "text-xl font-bold leading-tight tracking-tight text-text",
              "sm:text-2xl",
              "md:text-3xl",
            )}
            title={report.programName}
          >
            {report.programName}
          </h1>

          <div className="mt-2 flex min-w-0 items-center gap-2 text-sm text-muted">
            <time
              className="shrink-0"
              dateTime={report.reportDate || undefined}
            >
              {formatReportDate(report.reportDate)}
            </time>

            <span aria-hidden="true" className="text-muted/40">
              •
            </span>

            <span
              className="min-w-0 truncate font-medium text-text"
              title={report.teacherName}
            >
              {report.teacherName}
            </span>
          </div>
        </div>

        {/* ==================================================
         * STATUS
         * ================================================== */}

        <span
          className={cx(
            "inline-flex shrink-0 items-center gap-1.5",
            "rounded-full",
            "px-2.5 py-1.5",
            "text-xs font-semibold",
            "sm:px-3",
            statusConfig.className,
          )}
          aria-label={`Status: ${statusConfig.label}`}
        >
          <CheckIcon className="h-3 w-3" aria-hidden="true" />

          <span>{statusConfig.label}</span>
        </span>
      </div>
    </header>
  );
});

ReportHeader.displayName = "ReportHeader";

export default ReportHeader;
