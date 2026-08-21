import { memo, useMemo } from "react";

import { InfoCard, SectionTitle } from "@/shared/components/layout";

import { StudentIcon } from "@/shared/icons";

import { formatReportDate, hasValue } from "../utils/reportDetailUtils";

/* ============================================================
 * REPORT SUMMARY
 * ============================================================ */

const ReportSummary = memo(({ report }) => {
  const summary = useMemo(() => {
    if (!report) {
      return null;
    }

    return {
      studentName: report.studentName,

      className: report.className,

      duration: hasValue(report.duration) ? `${report.duration} menit` : "-",

      programName: report.programName,

      teacherName: report.teacherName,

      reportDate: formatReportDate(report.reportDate),
    };
  }, [report]);

  if (!summary) {
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
        <InfoCard label="Siswa" value={summary.studentName} />

        <InfoCard label="Kelas" value={summary.className} />

        <InfoCard label="Durasi" value={summary.duration} />

        <InfoCard label="Pelajaran" value={summary.programName} />

        <InfoCard label="Guru" value={summary.teacherName} />

        <InfoCard label="Tanggal" value={summary.reportDate} />
      </div>
    </section>
  );
});

ReportSummary.displayName = "ReportSummary";

export default ReportSummary;
