import { memo } from "react";

import {
  ContentBlock,
  ItemList,
  SectionTitle,
} from "@/shared/components/layout";

import { BookIcon } from "@/shared/icons";

/* ============================================================
 * HELPERS
 * ============================================================ */

const toArray = (value) => {
  return Array.isArray(value) ? value : [];
};

/* ============================================================
 * REPORT LEARNING
 * ============================================================ */

const ReportLearning = memo(({ report }) => {
  if (!report) {
    return null;
  }

  const materials = toArray(report.materials);

  const activities = toArray(report.activities);

  return (
    <section aria-labelledby="report-learning-title">
      <SectionTitle
        eyebrow="Pembelajaran"
        title="Materi & Aktivitas"
        icon={<BookIcon className="h-5 w-5" aria-hidden="true" />}
      />

      <div className="mt-4 grid grid-cols-1 gap-3.5 md:grid-cols-2">
        <ContentBlock title="Materi">
          <ItemList items={materials} emptyText="Belum ada materi." />
        </ContentBlock>

        <ContentBlock title="Aktivitas">
          <ItemList items={activities} emptyText="Belum ada aktivitas." />
        </ContentBlock>
      </div>

      {report.homework ? (
        <div className="mt-3.5 rounded-xl bg-surface-muted px-4 py-3.5 sm:px-5 sm:py-4">
          <p className="text-xs font-semibold uppercase tracking-[0.08em] text-muted">
            Tugas
          </p>

          <p className="mt-1.5 text-sm leading-6 text-text sm:text-base">
            {report.homework}
          </p>
        </div>
      ) : null}
    </section>
  );
});

ReportLearning.displayName = "ReportLearning";

export default ReportLearning;
