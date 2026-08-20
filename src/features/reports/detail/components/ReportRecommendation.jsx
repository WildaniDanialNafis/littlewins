import { memo } from "react";

import { SectionTitle } from "@/shared/components/layout";

import { LightbulbIcon } from "@/shared/icons";

/* ============================================================
 * REPORT RECOMMENDATION
 * ============================================================ */

const ReportRecommendation = memo(({ report }) => {
  if (!report?.recommendation) {
    return null;
  }

  return (
    <section aria-labelledby="report-recommendation-title">
      <SectionTitle
        eyebrow="Berikutnya"
        title="Rekomendasi"
        icon={<LightbulbIcon className="h-5 w-5" aria-hidden="true" />}
      />

      <div className="mt-4 rounded-xl bg-warning-soft p-4 ring-1 ring-warning/20 sm:p-5">
        <p className="text-sm leading-6 text-text sm:text-base">
          {report.recommendation}
        </p>
      </div>
    </section>
  );
});

ReportRecommendation.displayName = "ReportRecommendation";

export default ReportRecommendation;
