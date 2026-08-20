import { memo } from "react";

import { InfoCard, SectionTitle } from "@/shared/components/layout";

import { StudentIcon } from "@/shared/icons";

import { formatReportDate, hasValue } from "../utils/reportDetailUtils";

/* ============================================================
 * REPORT SUMMARY
 * ============================================================ */

const ReportSummary = memo(({ report }) => {
  if (!report) {
    return null;
  }

  return (
    <section aria-labelledby="report-summary-title">
      <SectionTitle
        eyebrow="Ringkasan"
        title="Sesi Belajar"
        icon={<StudentIcon className="h-5 w-5" aria-hidden="true" />}
      />

      <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-3">
        <InfoCard label="Siswa" value={report.studentName} />

        <InfoCard label="Kelas" value={report.className} />

        <InfoCard
          label="Durasi"
          value={hasValue(report.duration) ? `${report.duration} menit` : "-"}
        />

        <InfoCard label="Pelajaran" value={report.programName} />

        <InfoCard label="Guru" value={report.teacherName} />

        <InfoCard label="Tanggal" value={formatReportDate(report.reportDate)} />
      </div>
    </section>
  );
});

ReportSummary.displayName = "ReportSummary";

export default ReportSummary;
