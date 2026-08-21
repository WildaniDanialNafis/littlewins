import { Link } from "react-router-dom";

import { PageContainer } from "@/layouts/components";

import { ContentBlock, SectionTitle } from "@/shared/components/layout";

import { EmptyState, ErrorState, LoadingState } from "@/shared/components/ui";

import { CalendarIcon, EyeIcon, PlusIcon, UserIcon } from "@/shared/icons";

import { APP_NAME, ROUTES } from "@/shared/constants";

import { useDashboardData } from "@/features/dashboard";

import { useDelayedLoading } from "@/shared/hooks";

import { cx, formatDateShort } from "@/shared/utils";

/* ============================================================
 * HELPERS
 * ============================================================ */

const hasValue = (value) => {
  return value !== null && value !== undefined && value !== "";
};

/* ============================================================
 * ACTION LINK
 * ============================================================ */

const ActionLink = ({
  to,
  variant = "primary",
  children,
  className,
  ...props
}) => {
  return (
    <Link
      to={to}
      className={cx(
        "inline-flex min-h-11 shrink-0",
        "items-center justify-center gap-2",
        "rounded-xl border",
        "px-4 py-2.5",
        "text-sm font-semibold leading-none",
        "select-none",
        "transition-[background-color,border-color,color,box-shadow]",
        "duration-(--token-transition-fast)",
        "ease-out",
        "motion-reduce:transition-none",
        "focus-visible:outline-none",
        "focus-visible:ring-2",
        "focus-visible:ring-primary/30",
        "focus-visible:ring-offset-2",
        "focus-visible:ring-offset-background",

        variant === "primary" &&
          [
            "border-transparent",
            "bg-primary",
            "text-primary-foreground",
            "shadow-sm",
            "hover:bg-primary-hover",
            "active:bg-primary-active",
          ].join(" "),

        variant === "secondary" &&
          [
            "border-border",
            "bg-surface",
            "text-text",
            "hover:border-border-strong",
            "hover:bg-surface-muted",
            "active:bg-surface-muted",
          ].join(" "),

        variant === "ghost" &&
          [
            "border-transparent",
            "bg-transparent",
            "px-3",
            "text-muted",
            "hover:bg-surface-muted",
            "hover:text-text",
            "active:bg-surface-muted",
          ].join(" "),

        className,
      )}
      {...props}
    >
      {children}
    </Link>
  );
};

ActionLink.displayName = "ActionLink";

/* ============================================================
 * WELCOME SECTION
 * ============================================================ */

const WelcomeSection = ({
  userName,
  isTeacher,
  settingsRoute,
  createReportRoute,
}) => {
  const description = isTeacher
    ? "Kelola laporan siswa dengan mudah."
    : "Lihat perkembangan belajar Anda.";

  return (
    <section aria-labelledby="dashboard-welcome-title" className="pb-6">
      <div className="flex min-w-0 flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex min-w-0 items-start gap-3.5 sm:items-center sm:gap-4">
          <div
            className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-primary-soft text-primary"
            aria-hidden="true"
          >
            <UserIcon className="h-6 w-6" aria-hidden="true" />
          </div>

          <div className="min-w-0">
            <p className="text-xs font-semibold uppercase tracking-[0.08em] text-muted">
              Selamat datang
            </p>

            <h2
              id="dashboard-welcome-title"
              className="mt-1 truncate text-xl font-bold tracking-tight text-text sm:text-2xl"
              title={userName || "Pengguna"}
            >
              {userName || "Pengguna"}
            </h2>

            <p className="mt-1 text-sm leading-5 text-muted sm:text-base">
              {description}
            </p>
          </div>
        </div>

        <nav
          aria-label="Aksi dashboard"
          className={cx(
            "grid w-full shrink-0 gap-2",
            isTeacher ? "grid-cols-2" : "grid-cols-1",
            "sm:flex sm:w-auto",
          )}
        >
          <ActionLink
            to={settingsRoute}
            variant="secondary"
            className="w-full sm:w-auto"
          >
            Pengaturan
          </ActionLink>

          {isTeacher && (
            <ActionLink
              to={createReportRoute}
              variant="primary"
              className="w-full sm:w-auto"
            >
              <PlusIcon className="h-4 w-4 shrink-0" aria-hidden="true" />

              <span>Buat Laporan</span>
            </ActionLink>
          )}
        </nav>
      </div>
    </section>
  );
};

WelcomeSection.displayName = "WelcomeSection";

/* ============================================================
 * REPORT META
 * ============================================================ */

const ReportMeta = ({ reportDate, duration }) => {
  return (
    <div className="flex min-w-0 flex-wrap items-center gap-x-4 gap-y-2 text-sm text-muted">
      {hasValue(reportDate) && (
        <div className="inline-flex min-w-0 items-center gap-1.5">
          <CalendarIcon className="h-4 w-4 shrink-0" aria-hidden="true" />

          <time className="truncate" dateTime={reportDate || undefined}>
            {formatDateShort(reportDate)}
          </time>
        </div>
      )}

      {hasValue(duration) && <span className="shrink-0">{duration} menit</span>}
    </div>
  );
};

ReportMeta.displayName = "ReportMeta";

/* ============================================================
 * LATEST REPORT
 * ============================================================ */

const LatestReport = ({ report, isTeacher, reportDetailRoute }) => {
  if (!report) {
    return null;
  }

  const score = hasValue(report.score) ? report.score : "-";

  return (
    <article className="overflow-hidden rounded-xl border border-border bg-surface shadow-sm">
      <div className="p-4 sm:p-5">
        <div className="relative min-w-0">
          <div className="min-w-0 pr-24 sm:pr-28">
            <p className="text-xs font-medium text-muted">
              {isTeacher ? "Laporan siswa" : "Laporan belajar"}
            </p>

            <h3
              className="mt-1 truncate text-lg font-bold tracking-tight text-text"
              title={report.programName}
            >
              {report.programName || "Laporan"}
            </h3>

            <p className="mt-1 truncate text-sm text-muted">
              {isTeacher
                ? report.studentName || "-"
                : report.teacherName || "-"}
            </p>
          </div>

          <div className="absolute right-0 top-0 rounded-xl bg-primary-soft px-4 py-3 text-right">
            <p className="text-xs font-semibold uppercase tracking-[0.08em] text-muted">
              Nilai
            </p>

            <p className="mt-0.5 text-2xl font-bold tabular-nums text-primary">
              {score}
            </p>
          </div>
        </div>

        <div className="mt-4">
          <ReportMeta
            reportDate={report.reportDate}
            duration={report.duration}
          />
        </div>
      </div>

      <div className="border-t border-border bg-surface-muted/20 p-4 sm:p-5">
        <div
          className={cx(
            "flex gap-3",
            "flex-col",
            "sm:flex-row sm:items-center sm:justify-between",
          )}
        >
          <div className="min-w-0">
            <p className="text-xs font-medium text-muted">Laporan terakhir</p>

            <p className="mt-0.5 text-sm font-medium text-text">
              Lihat detail laporan
            </p>
          </div>

          <ActionLink
            to={reportDetailRoute}
            variant="primary"
            className="w-full sm:w-auto"
          >
            <EyeIcon className="h-4 w-4 shrink-0" aria-hidden="true" />

            <span>Lihat Detail</span>
          </ActionLink>
        </div>
      </div>
    </article>
  );
};

LatestReport.displayName = "LatestReport";

/* ============================================================
 * LATEST REPORT SECTION
 * ============================================================ */

const LatestReportSection = ({
  latestReportData,
  isTeacher,
  reportsRoute,
  createReportRoute,
  reportDetailRoute,
}) => {
  const description = isTeacher
    ? "Laporan terakhir yang dibuat."
    : "Laporan belajar terakhir Anda.";

  return (
    <section aria-labelledby="latest-report-title" className="pt-6">
      <div className="flex min-w-0 items-center justify-between gap-3">
        <div className="min-w-0">
          <SectionTitle title="Laporan Terbaru" description={description} />
        </div>

        <ActionLink
          to={reportsRoute}
          variant="ghost"
          className="shrink-0"
          aria-label="Lihat semua laporan"
        >
          <span className="hidden sm:inline">Lihat semua</span>

          <span className="sm:hidden">Semua</span>
        </ActionLink>
      </div>

      <div className="mt-4">
        {!latestReportData ? (
          <div className="rounded-xl border border-border bg-surface-muted/20 p-4 sm:p-5">
            <EmptyState
              title="Belum ada laporan"
              description={
                isTeacher
                  ? "Belum ada laporan. Buat laporan pertama."
                  : "Belum ada laporan untuk Anda."
              }
              action={
                isTeacher ? (
                  <ActionLink to={createReportRoute} variant="primary">
                    <PlusIcon className="h-4 w-4" aria-hidden="true" />

                    <span>Buat Laporan</span>
                  </ActionLink>
                ) : null
              }
            />
          </div>
        ) : (
          <LatestReport
            report={latestReportData}
            isTeacher={isTeacher}
            reportDetailRoute={reportDetailRoute}
          />
        )}
      </div>
    </section>
  );
};

LatestReportSection.displayName = "LatestReportSection";

/* ============================================================
 * LOADING
 * ============================================================ */

const DashboardLoading = ({ title }) => {
  return (
    <PageContainer title={title} subtitle={`Selamat datang di ${APP_NAME}.`}>
      <ContentBlock>
        <LoadingState message="Memuat dashboard..." />
      </ContentBlock>
    </PageContainer>
  );
};

DashboardLoading.displayName = "DashboardLoading";

/* ============================================================
 * ERROR
 * ============================================================ */

const DashboardError = ({ title, error, refresh }) => {
  return (
    <PageContainer title={title} subtitle="Gagal memuat data.">
      <ContentBlock>
        <ErrorState error={error} onRetry={refresh} />
      </ContentBlock>
    </PageContainer>
  );
};

DashboardError.displayName = "DashboardError";

/* ============================================================
 * PAGE
 * ============================================================ */

const DashboardPage = ({ role = "teacher" }) => {
  const {
    userName,

    isTeacher,

    latestReportData,

    isInitialLoading,

    isRefreshing,

    initialError,

    refreshError,

    refresh,
  } = useDashboardData(role);

  const dashboardTitle = isTeacher ? "Dashboard Guru" : "Dashboard Siswa";

  const subtitle = userName
    ? `Selamat datang kembali, ${userName}.`
    : `Selamat datang di ${APP_NAME}.`;

  const settingsRoute = isTeacher
    ? ROUTES.teacher.settings
    : ROUTES.student.settings;

  const reportsRoute = isTeacher
    ? ROUTES.teacher.reports
    : ROUTES.student.reports;

  const createReportRoute = isTeacher ? ROUTES.teacher.reportNew : null;

  const reportDetailRoute = latestReportData
    ? isTeacher
      ? ROUTES.teacher.reportDetail(latestReportData.id)
      : ROUTES.student.reportDetail(latestReportData.id)
    : null;

  const showInitialLoading = useDelayedLoading(
    isInitialLoading && !latestReportData,
    "page",
  );

  if (showInitialLoading) {
    return <DashboardLoading title={dashboardTitle} />;
  }

  if (initialError && !latestReportData) {
    return (
      <DashboardError
        title={dashboardTitle}
        error={initialError}
        refresh={refresh}
      />
    );
  }

  return (
    <PageContainer title={dashboardTitle} subtitle={subtitle}>
      <ContentBlock>
        <div
          className="min-w-0 divide-y divide-border"
          aria-busy={isRefreshing || undefined}
        >
          {(isRefreshing || refreshError) && (
            <div
              className="flex min-w-0 items-center justify-between gap-3 py-4"
              role={refreshError ? "alert" : "status"}
              aria-live="polite"
            >
              <div className="min-w-0">
                <p className="text-sm font-medium text-text">
                  {refreshError
                    ? "Pembaruan dashboard gagal."
                    : "Memperbarui dashboard..."}
                </p>

                {refreshError && (
                  <p className="mt-0.5 text-xs text-muted">
                    Data sebelumnya tetap ditampilkan.
                  </p>
                )}
              </div>

              {refreshError && (
                <button
                  type="button"
                  onClick={refresh}
                  className="shrink-0 rounded-lg border border-border bg-surface px-3 py-2 text-xs font-semibold text-text transition-colors hover:bg-surface-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/30"
                >
                  Coba lagi
                </button>
              )}
            </div>
          )}

          <WelcomeSection
            userName={userName}
            isTeacher={isTeacher}
            settingsRoute={settingsRoute}
            createReportRoute={createReportRoute}
          />

          <LatestReportSection
            latestReportData={latestReportData}
            isTeacher={isTeacher}
            reportsRoute={reportsRoute}
            createReportRoute={createReportRoute}
            reportDetailRoute={reportDetailRoute}
          />
        </div>
      </ContentBlock>
    </PageContainer>
  );
};

DashboardPage.displayName = "DashboardPage";

export default DashboardPage;
