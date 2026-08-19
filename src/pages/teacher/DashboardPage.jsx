import { Link } from "react-router-dom";

import { PageContainer } from "@/layouts/components";

import { ContentBlock, SectionTitle } from "@/shared/components/layout";

import { EmptyState, ErrorState, LoadingState } from "@/shared/components/ui";

import { CalendarIcon, EyeIcon, PlusIcon, UserIcon } from "@/shared/icons";

import { APP_NAME, ROUTES } from "@/shared/constants";

import { useDashboardData } from "@/features/dashboard";

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
        "inline-flex min-h-10 shrink-0 items-center justify-center gap-2",
        "rounded-lg px-4 py-2.5",
        "text-sm font-medium leading-none select-none",
        "transition-[background-color,border-color,color,box-shadow,opacity]",
        "duration-(--token-transition-fast) ease-out",
        "focus-visible:outline-none",
        "focus-visible:ring-2",
        "focus-visible:ring-primary/30",
        "focus-visible:ring-offset-2",
        "focus-visible:ring-offset-background",
        "motion-reduce:transition-none",

        variant === "primary" &&
          "bg-primary text-primary-foreground shadow-sm hover:bg-primary-hover active:bg-primary-active",

        variant === "secondary" &&
          "border border-border bg-surface text-text hover:border-border-strong hover:bg-surface-muted active:bg-surface-muted",

        variant === "ghost" &&
          "px-3 text-muted hover:bg-surface-muted hover:text-text active:bg-surface-muted",

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
 * PAGE
 * ============================================================ */

const DashboardPage = ({ role = "teacher" }) => {
  const { userName, isTeacher, latestReportData, isLoading, error, refresh } =
    useDashboardData(role);

  /* ==========================================================
   * DERIVED VIEW DATA
   *
   * Semua business/data logic sudah dilakukan
   * oleh useDashboardData.
   * ========================================================== */

  const dashboardTitle = isTeacher ? "Dashboard Guru" : "Dashboard Siswa";

  const subtitle = userName
    ? `Selamat datang kembali, ${userName}.`
    : `Selamat datang di ${APP_NAME}.`;

  /* ==========================================================
   * LOADING
   * ========================================================== */

  if (isLoading) {
    return (
      <PageContainer
        title={dashboardTitle}
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

  if (error) {
    return (
      <PageContainer title={dashboardTitle} subtitle="Gagal memuat data.">
        <ContentBlock>
          <ErrorState error={error} onRetry={refresh} />
        </ContentBlock>
      </PageContainer>
    );
  }

  /* ==========================================================
   * VIEW
   * ========================================================== */

  return (
    <PageContainer title={dashboardTitle} subtitle={subtitle}>
      <div className="min-w-0 space-y-8">
        {/* ====================================================
         * WELCOME
         * ==================================================== */}

        <ContentBlock>
          <header className="flex min-w-0 flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex min-w-0 items-start gap-4">
              <div
                className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-primary-soft text-primary"
                aria-hidden="true"
              >
                <UserIcon className="h-6 w-6" />
              </div>

              <div className="min-w-0">
                <p className="text-sm text-muted">Selamat datang</p>

                <h2 className="mt-0.5 wrap-break-word text-xl font-bold tracking-tight text-text">
                  {userName}
                </h2>

                <p className="mt-1 text-sm leading-relaxed text-text-secondary">
                  {isTeacher
                    ? "Kelola laporan belajar siswa dengan mudah."
                    : "Lihat perkembangan belajar dan laporan Anda."}
                </p>
              </div>
            </div>

            <nav
              aria-label="Aksi dashboard"
              className="flex w-full shrink-0 flex-col gap-2 sm:w-auto sm:flex-row"
            >
              <ActionLink
                to={
                  isTeacher ? ROUTES.teacher.settings : ROUTES.student.settings
                }
                variant="secondary"
                className="w-full sm:w-auto"
              >
                Pengaturan
              </ActionLink>

              {isTeacher && (
                <ActionLink
                  to={ROUTES.teacher.reportNew}
                  variant="primary"
                  className="w-full sm:w-auto"
                >
                  <PlusIcon className="h-4 w-4" aria-hidden="true" />

                  <span>Buat Laporan</span>
                </ActionLink>
              )}
            </nav>
          </header>
        </ContentBlock>

        {/* ====================================================
         * LATEST REPORT
         * ==================================================== */}

        <section aria-label="Laporan terbaru" className="min-w-0">
          <div className="flex min-w-0 flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
            <SectionTitle
              title="Laporan Terbaru"
              description={
                isTeacher
                  ? "Laporan terakhir yang Anda buat."
                  : "Laporan perkembangan belajar terakhir Anda."
              }
            />

            <ActionLink
              to={isTeacher ? ROUTES.teacher.reports : ROUTES.student.reports}
              variant="ghost"
              className="w-fit"
            >
              Lihat semua laporan
            </ActionLink>
          </div>

          <div className="mt-4 min-w-0">
            {!latestReportData ? (
              <ContentBlock>
                <EmptyState
                  title="Belum ada laporan"
                  description={
                    isTeacher
                      ? "Anda belum membuat laporan belajar. Buat laporan pertama untuk mulai mencatat perkembangan siswa."
                      : "Belum ada laporan perkembangan belajar yang tersedia untuk Anda."
                  }
                  action={
                    isTeacher ? (
                      <ActionLink
                        to={ROUTES.teacher.reportNew}
                        variant="primary"
                      >
                        <PlusIcon className="h-4 w-4" aria-hidden="true" />

                        <span>Buat Laporan</span>
                      </ActionLink>
                    ) : null
                  }
                />
              </ContentBlock>
            ) : (
              <ContentBlock>
                <article>
                  <div className="grid min-w-0 grid-cols-[minmax(0,1fr)_auto] items-start gap-5">
                    <div className="min-w-0">
                      <p className="wrap-break-word text-xs font-semibold uppercase tracking-wider text-primary">
                        {latestReportData.programName}
                      </p>

                      <h3 className="mt-1 wrap-break-word text-lg font-bold text-text">
                        {isTeacher
                          ? latestReportData.studentName
                          : "Perkembangan Belajar"}
                      </h3>

                      <div
                        className="mt-3 flex flex-wrap items-center gap-x-4 gap-y-2 text-sm text-muted"
                        aria-label="Informasi laporan"
                      >
                        {latestReportData.reportDate && (
                          <span className="inline-flex max-w-full items-center gap-1.5">
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

                    <div className="shrink-0">
                      <p className="text-xs font-semibold uppercase tracking-wider text-muted text-right">
                        Nilai
                      </p>

                      <p className="mt-1 text-right text-2xl font-bold tabular-nums text-text">
                        {hasValue(latestReportData.score)
                          ? latestReportData.score
                          : "-"}
                      </p>
                    </div>
                  </div>

                  <div className="mt-5 border-t border-border pt-4">
                    <ActionLink
                      to={
                        isTeacher
                          ? ROUTES.teacher.reportDetail(latestReportData.id)
                          : ROUTES.student.reportDetail(latestReportData.id)
                      }
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
