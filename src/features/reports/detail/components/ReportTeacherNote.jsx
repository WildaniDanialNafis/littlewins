import { memo } from "react";

import { SectionTitle } from "@/shared/components/layout";

import { NoteIcon } from "@/shared/icons";

/* ============================================================
 * REPORT TEACHER NOTE
 * ============================================================ */

const ReportTeacherNote = memo(({ report }) => {
  if (!report?.teacherNote) {
    return null;
  }

  return (
    <section aria-labelledby="report-teacher-note-title">
      <SectionTitle
        eyebrow="Pengajar"
        title="Catatan"
        icon={<NoteIcon className="h-5 w-5" aria-hidden="true" />}
      />

      <div className="mt-4 rounded-xl border-l-4 border-primary/40 bg-surface-muted px-4 py-4 sm:px-5 sm:py-5">
        <p className="text-sm leading-6 text-text sm:text-base">
          {report.teacherNote}
        </p>
      </div>
    </section>
  );
});

ReportTeacherNote.displayName = "ReportTeacherNote";

export default ReportTeacherNote;
