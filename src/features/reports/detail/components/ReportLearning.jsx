import { memo } from "react";

import {
  ContentBlock,
  ItemList,
  SectionTitle,
} from "@/shared/components/layout";

import { BookIcon } from "@/shared/icons";

const ReportLearning = memo(({ report }) => {
  if (!report) {
    return null;
  }

  return (
    <section aria-labelledby="report-learning-title">
      <SectionTitle
        eyebrow="Pembelajaran"
        title="Apa yang dipelajari?"
        icon={<BookIcon className="h-5 w-5" aria-hidden="true" />}
      />

      <div className="mt-5 grid grid-cols-1 gap-5 md:grid-cols-2">
        <ContentBlock title="Materi yang Dipelajari">
          <ItemList
            items={report.materials}
            emptyText="Belum ada materi yang dicatat."
          />
        </ContentBlock>

        <ContentBlock title="Aktivitas Belajar">
          <ItemList
            items={report.activities}
            emptyText="Belum ada aktivitas yang dicatat."
          />
        </ContentBlock>
      </div>

      {report.homework && (
        <div className="mt-5 rounded-xl bg-surface-muted p-4 sm:p-5">
          <p className="text-xs font-semibold uppercase tracking-wider text-muted">
            PR / Tugas Rumah
          </p>

          <p className="mt-2 text-sm leading-7 text-text md:text-base">
            {report.homework}
          </p>
        </div>
      )}
    </section>
  );
});

ReportLearning.displayName = "ReportLearning";

export default ReportLearning;
