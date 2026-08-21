import { memo, useMemo } from "react";

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
  const ratings = useMemo(() => {
    if (!report) {
      return null;
    }

    const source = report.ratings ?? {};

    return {
      understanding: normalizeRating(
        source.understanding ?? report.rating_understanding,
      ),

      activity: normalizeRating(source.activity ?? report.rating_activity),

      discipline: normalizeRating(
        source.discipline ?? report.rating_discipline,
      ),

      communication: normalizeRating(
        source.communication ?? report.rating_communication,
      ),
    };
  }, [report]);

  if (!ratings) {
    return null;
  }

  return (
    <section aria-labelledby="report-progress-title">
      <SectionTitle
        eyebrow="Perkembangan"
        title="Perkembangan"
        description="Lihat perkembangan belajar."
        icon={<GrowthIcon className="h-5 w-5" aria-hidden="true" />}
      />

      <div className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-2">
        <RatingCard label="Pemahaman" rating={ratings.understanding} />

        <RatingCard label="Keaktifan" rating={ratings.activity} />

        <RatingCard label="Disiplin" rating={ratings.discipline} />

        <RatingCard label="Komunikasi" rating={ratings.communication} />
      </div>
    </section>
  );
});

ReportProgress.displayName = "ReportProgress";

export default ReportProgress;
