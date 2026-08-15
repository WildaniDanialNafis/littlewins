import { memo } from "react";

import { RatingCard, SectionTitle } from "@/shared/components/layout";

import { GrowthIcon } from "@/shared/icons";

const ReportProgress = memo(({ report }) => {
  if (!report) {
    return null;
  }

  const ratings = report.ratings ?? {};

  return (
    <section aria-labelledby="report-progress-title">
      <SectionTitle
        eyebrow="Perkembangan"
        title="Bagaimana perkembangan belajar?"
        description="Penilaian berikut membantu melihat perkembangan anak secara menyeluruh, bukan hanya dari nilai."
        icon={<GrowthIcon className="h-5 w-5" aria-hidden="true" />}
      />

      <div className="mt-5 grid grid-cols-1 gap-3 sm:grid-cols-2">
        <RatingCard label="Pemahaman Materi" rating={ratings.understanding} />

        <RatingCard label="Keaktifan & Semangat" rating={ratings.activity} />

        <RatingCard label="Kedisiplinan" rating={ratings.discipline} />

        <RatingCard
          label="Kemampuan Komunikasi"
          rating={ratings.communication}
        />
      </div>
    </section>
  );
});

ReportProgress.displayName = "ReportProgress";

export default ReportProgress;
