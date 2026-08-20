import { useMemo } from "react";
import { Link } from "react-router-dom";

import { EmptyState, ErrorState, LoadingState } from "@/shared/components/ui";

import { ContentBlock, SectionTitle } from "@/shared/components/layout";

import { CalendarIcon, EyeIcon, UserIcon } from "@/shared/icons";

import { useAuth, usePrograms, useReports, useStudents } from "@/shared/hooks";

import { APP_NAME, ROUTES } from "@/shared/constants";

import { cx, formatDateShort } from "@/shared/utils";

import { PageContainer } from "@/layouts/components";

/* ============================================================
 * CONSTANTS
 * ============================================================ */

const LINK_BASE_CLASS = [
  "inline-flex shrink-0 items-center justify-center gap-2",
  "rounded-lg",
  "font-medium leading-none select-none",
  "transition-[background-color,border-color,color,box-shadow,opacity]",
  "duration-(--token-transition-fast)",
  "ease-out",
  "focus-visible:outline-none",
  "focus-visible:ring-2",
  "focus-visible:ring-primary/30",
  "focus-visible:ring-offset-2",
  "focus-visible:ring-offset-background",
  "motion-reduce:transition-none",
].join(" ");

const LINK_VARIANTS = {
  primary: [
    LINK_BASE_CLASS,
    "min-h-10 px-4 py-2.5 text-sm",
    "bg-primary text-primary-foreground shadow-sm",
    "hover:bg-primary-hover",
    "active:bg-primary-active",
  ].join(" "),

  secondary: [
    LINK_BASE_CLASS,
    "min-h-10 px-4 py-2.5 text-sm",
    "border border-border bg-surface text-text",
    "hover:border-border-strong hover:bg-surface-muted",
    "active:bg-surface-muted",
  ].join(" "),

  ghost: [
    LINK_BASE_CLASS,
    "min-h-10 px-3 py-2 text-sm",
    "text-muted",
    "hover:bg-surface-muted hover:text-text",
    "active:bg-surface-muted",
  ].join(" "),
};

/* ============================================================
 * HELPERS
 * ============================================================ */

const hasValue = (value) => {
  return value !== null && value !== undefined && value !== "";
};

const getReportDate = (report) => {
  if (!report) {
    return null;
  }

  return report.report_date || report.date || report.created_at || null;
};

const getReportTimestamp = (report) => {
  const date = getReportDate(report);

  if (!date) {
    return Number.NEGATIVE_INFINITY;
  }

  const timestamp = new Date(`${date}T00:00:00`).getTime();

  return Number.isNaN(timestamp) ? Number.NEGATIVE_INFINITY : timestamp;
};

const getLatestReport = (reports) => {
  if (!Array.isArray(reports) || reports.length === 0) {
    return null;
  }

  return reports.reduce((latest, current) => {
    return getReportTimestamp(current) > getReportTimestamp(latest)
      ? current
      : latest;
  });
};

const getStudentName = (user, students) => {
  const userName = user?.profile?.full_name?.trim() || user?.full_name?.trim();

  if (userName) {
    return userName;
  }

  const studentId = Number(user?.profile?.id);

  const student = students.find((item) => Number(item.id) === studentId);

  return student?.full_name || student?.name || "Siswa";
};

const getProgramName = (report, programs) => {
  if (report?.program_name) {
    return report.program_name;
  }

  if (report?.program?.name) {
    return report.program.name;
  }

  const program = programs.find(
    (item) => Number(item.id) === Number(report?.program_id),
  );

  return program?.name || "Program";
};

/* ============================================================
 * LOCAL COMPONENT
 * ============================================================ */

const ActionLink = ({
  to,
  variant = "primary",
  children,
  className,
  ...props
}) => {
  return (
    <Link to={to} className={cx(LINK_VARIANTS[variant], className)} {...props}>
      {children}
    </Link>
  );
};

ActionLink.displayName = "ActionLink";

/* ============================================================
 * PAGE
 * ============================================================ */

const DashboardPage = () => {
  const { user } = useAuth();

  const {
    reports = [],
    loading: reportsLoading,
    error: reportsError,
    refresh: refreshReports,
  } = useReports();

  const { data: students = [], loading: studentsLoading } = useStudents();

  const { data: programs = [], loading: programsLoading } = usePrograms();

  /* ==========================================================
   * USER
   * ========================================================== */

  const currentStudent = useMemo(() => {
    if (!user) {
      return null;
    }

    return {
      id: Number(user.profile?.id),
      name: getStudentName(user, students),
    };
  }, [user, students]);

  /* ==========================================================
   * REPORTS
   * ========================================================== */

  const studentReports = useMemo(() => {
    if (!Array.isArray(reports)) {
      return [];
    }

    if (!currentStudent?.id) {
      return reports;
    }

    return reports.filter(
      (report) => Number(report.student_id) === currentStudent.id,
    );
  }, [reports, currentStudent]);

  const latestReport = useMemo(
    () => getLatestReport(studentReports),
    [studentReports],
  );

  const latestReportData = useMemo(() => {
    if (!latestReport) {
      return null;
    }

    return {
      id: latestReport.id,
      programName: getProgramName(latestReport, programs),
      reportDate: getReportDate(latestReport),
      score: latestReport.score,
      duration: latestReport.duration,
    };
  }, [latestReport, programs]);

  /* ==========================================================
   * PAGE STATE
   * ========================================================== */

  const isLoading = reportsLoading || studentsLoading || programsLoading;

  const hasError = !isLoading && Boolean(reportsError);

  /* ==========================================================
   * LOADING
   * ========================================================== */

  if (isLoading) {
    return (
      <PageContainer
        title="Dashboard Siswa"
        subtitle={`Selamat datang di ${APP_NAME}.`}
      >
        <ContentBlock>
          <LoadingState message="Memuat data dashboard..." />
        </ContentBlock>
      </PageContainer>
    );
  }

  /* ==========================================================
   * ERROR
   * ========================================================== */

  if (hasError) {
    return (
      <PageContainer title="Dashboard Siswa" subtitle="Gagal memuat data.">
        <ContentBlock>
          <ErrorState error={reportsError} onRetry={refreshReports} />
        </ContentBlock>
      </PageContainer>
    );
  }

  /* ==========================================================
   * VIEW
   * ========================================================== */

  return (
    <PageContainer
      title="Dashboard Siswa"
      subtitle={
        currentStudent?.name
          ? `Selamat datang kembali, ${currentStudent.name}.`
          : `Selamat datang kembali di ${APP_NAME}.`
      }
    >
      <div className="space-y-8">
        {/* ==================================================
         * WELCOME
         * ================================================== */}

        <ContentBlock>
          <header className="flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex min-w-0 items-center gap-4">
              <div
                className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-primary-soft text-primary"
                aria-hidden="true"
              >
                <UserIcon className="h-6 w-6" />
              </div>

              <div className="min-w-0">
                <p className="text-sm text-muted">Selamat datang</p>

                <h2 className="truncate text-xl font-bold tracking-tight text-text">
                  {currentStudent?.name || "Siswa"}
                </h2>

                <p className="mt-1 text-sm leading-relaxed text-text-secondary">
                  Lihat perkembangan belajar dan laporan Anda.
                </p>
              </div>
            </div>

            <nav
              aria-label="Aksi dashboard"
              className="flex w-full shrink-0 flex-col gap-2 sm:w-auto sm:flex-row"
            >
              <ActionLink
                to={ROUTES.student.settings}
                variant="secondary"
                className="w-full sm:w-auto"
              >
                Pengaturan
              </ActionLink>
            </nav>
          </header>
        </ContentBlock>

        {/* ==================================================
         * LATEST REPORT
         * ================================================== */}

        <section aria-label="Laporan terbaru">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
            <SectionTitle
              title="Laporan Terbaru"
              description="Laporan perkembangan belajar terakhir Anda."
            />

            <ActionLink
              to={ROUTES.student.reports}
              variant="ghost"
              className="w-fit"
            >
              Lihat semua laporan
            </ActionLink>
          </div>

          <div className="mt-4">
            {!latestReportData ? (
              <ContentBlock>
                <EmptyState
                  title="Belum ada laporan"
                  description="Belum ada laporan perkembangan belajar yang tersedia untuk Anda."
                />
              </ContentBlock>
            ) : (
              <ContentBlock>
                <article>
                  <div className="flex flex-col gap-5 sm:flex-row sm:items-start sm:justify-between">
                    <div className="min-w-0">
                      <p className="text-xs font-semibold uppercase tracking-wider text-primary">
                        {latestReportData.programName}
                      </p>

                      <h3 className="mt-1 wrap-break-word text-lg font-bold text-text">
                        Perkembangan Belajar
                      </h3>

                      <div
                        className="mt-3 flex flex-wrap items-center gap-x-4 gap-y-2 text-sm text-muted"
                        aria-label="Informasi laporan"
                      >
                        {latestReportData.reportDate && (
                          <span className="inline-flex items-center gap-1.5">
                            <CalendarIcon
                              className="h-4 w-4 shrink-0"
                              aria-hidden="true"
                            />

                            <time dateTime={latestReportData.reportDate}>
                              {formatDateShort(latestReportData.reportDate)}
                            </time>
                          </span>
                        )}

                        {hasValue(latestReportData.duration) && (
                          <span>{latestReportData.duration} menit</span>
                        )}
                      </div>
                    </div>

                    <div className="shrink-0 sm:text-right">
                      <p className="text-xs font-semibold uppercase tracking-wider text-muted">
                        Nilai
                      </p>

                      <p className="mt-1 text-2xl font-bold tabular-nums text-text">
                        {hasValue(latestReportData.score)
                          ? latestReportData.score
                          : "-"}
                      </p>
                    </div>
                  </div>

                  <div className="mt-5 border-t border-border pt-4">
                    <ActionLink
                      to={ROUTES.student.reportDetail(latestReportData.id)}
                      variant="primary"
                      className="w-full sm:w-auto"
                    >
                      <EyeIcon className="h-4 w-4" aria-hidden="true" />

                      <span>Lihat Detail Laporan</span>
                    </ActionLink>
                  </div>
                </article>
              </ContentBlock>
            )}
          </div>
        </section>
      </div>
    </PageContainer>
  );
};

DashboardPage.displayName = "DashboardPage";

export default DashboardPage;
