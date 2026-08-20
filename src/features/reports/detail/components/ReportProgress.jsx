import { memo } from "react";

import { RatingCard, SectionTitle } from "@/shared/components/layout";

import { GrowthIcon } from "@/shared/icons";

/* ============================================================
 * HELPERS
 * ============================================================ */

const normalizeRating = (value) => {
  const number = Number(value);

  if (!Number.isFinite(number)) {
    return 0;
  }

  return Math.min(5, Math.max(0, Math.round(number)));
};

/* ============================================================
 * REPORT PROGRESS
 * ============================================================ */

const ReportProgress = memo(({ report }) => {
  if (!report) {
    return null;
  }

  const ratings = report.ratings ?? {};

  return (
    <section aria-labelledby="report-progress-title">
      <SectionTitle
        eyebrow="Perkembangan"
        title="Perkembangan"
        description="Lihat perkembangan belajar."
        icon={<GrowthIcon className="h-5 w-5" aria-hidden="true" />}
      />

      <div className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-2">
        <RatingCard
          label="Pemahaman"
          rating={normalizeRating(
            ratings.understanding ?? report.rating_understanding,
          )}
        />

        <RatingCard
          label="Keaktifan"
          rating={normalizeRating(ratings.activity ?? report.rating_activity)}
        />

        <RatingCard
          label="Disiplin"
          rating={normalizeRating(
            ratings.discipline ?? report.rating_discipline,
          )}
        />

        <RatingCard
          label="Komunikasi"
          rating={normalizeRating(
            ratings.communication ?? report.rating_communication,
          )}
        />
      </div>
    </section>
  );
});

ReportProgress.displayName = "ReportProgress";

export default ReportProgress;
