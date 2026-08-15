import { memo } from "react";

import { CheckIcon } from "@/shared/icons";
import { cx } from "@/shared/utils";

import { formatReportDate } from "../utils/reportDetailUtils";

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
    label: "Dibatalkan",
    className: "bg-danger-soft text-danger",
  },
};

const ReportHeader = memo(({ report }) => {
  if (!report) {
    return null;
  }

  const statusConfig = STATUS_CONFIG[report.status] ?? STATUS_CONFIG.draft;

  return (
    <header
      className={cx(
        "relative border-b border-border",
        "bg-linear-to-r from-primary/5 via-primary/5 to-transparent",
        "px-4 py-6 sm:px-6 md:px-8 md:py-8",
        "print:border-0 print:bg-white",
      )}
    >
      <div className="flex flex-col gap-5 sm:flex-row sm:items-start sm:justify-between">
        <div className="min-w-0">
          <p className="text-xs font-semibold uppercase tracking-wider text-primary">
            Laporan Perkembangan Belajar
          </p>

          <h1 className="mt-2 wrap-break-word text-2xl font-bold leading-tight tracking-tight text-text sm:text-3xl md:text-4xl">
            {report.programName}
          </h1>

          <div className="mt-3 flex flex-wrap items-center gap-x-3 gap-y-1 text-sm text-muted">
            <time dateTime={report.reportDate || undefined}>
              {formatReportDate(report.reportDate)}
            </time>

            <span aria-hidden="true" className="text-muted/40">
              •
            </span>

            <span className="font-medium text-text">{report.teacherName}</span>
          </div>
        </div>

        <span
          className={cx(
            "inline-flex w-fit shrink-0 items-center gap-1.5",
            "rounded-full px-3 py-1.5",
            "text-xs font-semibold",
            statusConfig.className,
          )}
          aria-label={`Status laporan: ${statusConfig.label}`}
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
