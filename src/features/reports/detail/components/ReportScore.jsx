import { memo } from "react";

import { cx } from "@/shared/utils";

import { hasValue } from "../utils/reportDetailUtils";

const ReportScore = memo(({ report, style }) => {
  if (!report || !style || !hasValue(report.score)) {
    return null;
  }

  return (
    <section aria-labelledby="report-score-title">
      <div className={cx("rounded-2xl p-5 ring-1 md:p-6", style.background)}>
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wider text-muted">
              Nilai sesi
            </p>

            <h2 className="mt-1 text-base font-semibold text-text">
              Hasil penilaian belajar
            </h2>

            <p className="mt-1 max-w-xl text-sm leading-relaxed text-muted">
              Nilai membantu melihat hasil sesi, bersama penilaian perkembangan
              lainnya.
            </p>
          </div>

          <div className="sm:text-right">
            <div className="flex items-baseline sm:justify-end">
              <span
                className={cx(
                  "text-4xl font-bold tracking-tight md:text-5xl",
                  style.text,
                )}
              >
                {report.score}
              </span>

              <span className="ml-1 text-sm font-medium text-muted">/ 100</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
});

ReportScore.displayName = "ReportScore";

export default ReportScore;
