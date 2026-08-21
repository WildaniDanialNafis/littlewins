import { memo, useMemo } from "react";

import { cx } from "@/shared/utils";

import { hasValue } from "../utils/reportDetailUtils";

/* ============================================================
 * REPORT SCORE
 * ============================================================ */

const ReportScore = memo(({ report, style }) => {
  const score = useMemo(() => {
    if (!report || !style || !hasValue(report.score)) {
      return null;
    }

    return {
      value: report.score,
      textClass: style.text,
      backgroundClass: style.background,
    };
  }, [report, style]);

  if (!score) {
    return null;
  }

  return (
    <section aria-labelledby="report-score-title">
      <div
        className={cx("rounded-xl p-4 ring-1", "sm:p-5", score.backgroundClass)}
      >
        <div className="flex items-center justify-between gap-4">
          <div className="min-w-0">
            <p className="text-xs font-semibold uppercase tracking-[0.08em] text-muted">
              Nilai
            </p>

            <h2
              id="report-score-title"
              className="mt-1 text-base font-semibold text-text"
            >
              Hasil belajar
            </h2>

            <p className="mt-1 text-sm leading-5 text-muted">Nilai sesi ini.</p>
          </div>

          <div className="shrink-0 text-right">
            <div className="flex items-baseline justify-end">
              <span
                className={cx(
                  "text-4xl font-bold tracking-tight tabular-nums",
                  score.textClass,
                  "sm:text-5xl",
                )}
              >
                {score.value}
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
