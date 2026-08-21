import { useEffect, useRef } from "react";

import { Link, useLocation, useNavigate, useParams } from "react-router-dom";

import {
  PhotoLightbox,
  ReportHeader,
  ReportLearning,
  ReportPhotos,
  ReportProgress,
  ReportRecommendation,
  ReportScore,
  ReportSummary,
  ReportTeacherNote,
  ReportDetailSkeleton,
  useReportDetail,
} from "@/features/reports/detail";

import { Button, EmptyState, ErrorState } from "@/shared/components/ui";

import { ArrowLeftIcon, EditIcon } from "@/shared/icons";

import { ROUTES } from "@/shared/constants";

import { cx } from "@/shared/utils";

import { PageContainer } from "@/layouts/components";

import { useDelayedLoading } from "@/shared/hooks";

/* ============================================================
 * ACTION STYLES
 * ============================================================ */

const ACTION_BASE_CLASS = [
  "inline-flex shrink-0 items-center justify-center gap-2",
  "min-h-11",
  "rounded-xl",
  "border",
  "px-4 py-2.5",
  "text-sm font-semibold leading-none",
  "select-none",
  "transition-[background-color,border-color,color,box-shadow]",
  "duration-(--token-transition-fast)",
  "ease-out",
  "focus-visible:outline-none",
  "focus-visible:ring-2",
  "focus-visible:ring-primary/30",
  "focus-visible:ring-offset-2",
  "focus-visible:ring-offset-background",
  "motion-reduce:transition-none",
].join(" ");

const ACTION_VARIANTS = {
  primary: [
    ACTION_BASE_CLASS,
    "border-transparent",
    "bg-primary text-primary-foreground",
    "shadow-sm",
    "hover:bg-primary-hover",
    "active:bg-primary-active",
  ].join(" "),

  secondary: [
    ACTION_BASE_CLASS,
    "border-border",
    "bg-surface text-text",
    "hover:border-border-strong",
    "hover:bg-surface-muted",
    "active:bg-surface-muted",
  ].join(" "),
};

/* ============================================================
 * ROLE CONFIG
 * ============================================================ */

const ROLE_CONFIG = {
  teacher: {
    reportsRoute: ROUTES.teacher.reports,

    getEditRoute: (id) => ROUTES.teacher.reportEdit(id),
  },

  student: {
    reportsRoute: ROUTES.student.reports,
  },
};

/* ============================================================
 * HELPERS
 * ============================================================ */

const getRefreshRequestKey = (reportId, navigationState) => {
  const normalizedId = String(reportId ?? "").trim();

  if (!normalizedId) {
    return null;
  }

  const updatedAt = navigationState?.updatedAt;

  if (updatedAt !== null && updatedAt !== undefined && updatedAt !== "") {
    return `${normalizedId}:${String(updatedAt)}`;
  }

  return `${normalizedId}:updated`;
};

/* ============================================================
 * ACTIONS
 * ============================================================ */

const ReportActions = ({ role, reportId, canEdit }) => {
  const roleConfig = ROLE_CONFIG[role] ?? ROLE_CONFIG.teacher;

  return (
    <nav
      aria-label="Aksi laporan"
      className="flex w-full items-center gap-2 sm:w-auto"
    >
      <Link
        to={roleConfig.reportsRoute}
        className={cx(ACTION_VARIANTS.secondary, "min-w-0 flex-1 sm:flex-none")}
        aria-label="Kembali ke laporan"
      >
        <ArrowLeftIcon className="h-4 w-4 shrink-0" aria-hidden="true" />

        <span>Kembali</span>
      </Link>

      {canEdit && typeof roleConfig.getEditRoute === "function" && (
        <Link
          to={roleConfig.getEditRoute(reportId)}
          className={cx(ACTION_VARIANTS.primary, "min-w-0 flex-1 sm:flex-none")}
        >
          <EditIcon className="h-4 w-4 shrink-0" aria-hidden="true" />

          <span>Edit</span>
        </Link>
      )}
    </nav>
  );
};

ReportActions.displayName = "ReportActions";

/* ============================================================
 * PAGE
 * ============================================================ */

const ReportDetailPage = ({ role = "teacher" }) => {
  const { id } = useParams();

  const location = useLocation();

  const navigate = useNavigate();

  const {
    viewData,

    nilaiStyle,

    capabilities,

    isInitialLoading,

    isFetching,

    isRefreshing,

    initialError,

    refreshError,

    refresh,

    lightbox,
  } = useReportDetail(id);

  const handledRefreshKeyRef = useRef(null);

  /* ==========================================================
   * LOADING VISIBILITY
   * ========================================================== */

  const showLoading = useDelayedLoading(isInitialLoading, "page");

  const showInitialSkeleton = showLoading && !viewData;

  /* ==========================================================
   * POST-EDIT AUTHORITATIVE REFRESH
   * ========================================================== */

  useEffect(() => {
    const state = location.state;

    if (!state?.reportUpdated) {
      return;
    }

    const stateReportId = String(state.reportId ?? id ?? "");

    const currentId = String(id ?? "");

    if (!stateReportId || stateReportId !== currentId) {
      return;
    }

    const refreshRequestKey = getRefreshRequestKey(currentId, state);

    if (refreshRequestKey === null) {
      return;
    }

    if (handledRefreshKeyRef.current === refreshRequestKey) {
      return;
    }

    handledRefreshKeyRef.current = refreshRequestKey;

    navigate(
      {
        pathname: location.pathname,

        search: location.search,

        hash: location.hash,
      },
      {
        replace: true,
        state: null,
      },
    );

    void refresh().catch(() => {});
  }, [
    id,
    location.pathname,
    location.search,
    location.hash,
    location.state,
    navigate,
    refresh,
  ]);

  /* ==========================================================
   * ROLE / BREADCRUMB
   * ========================================================== */

  const roleConfig = ROLE_CONFIG[role] ?? ROLE_CONFIG.teacher;

  const breadcrumb = [
    {
      label: "Laporan",
      path: roleConfig.reportsRoute,
    },
    {
      label: "Detail",
      path: location.pathname,
    },
  ];

  /* ==========================================================
   * INITIAL LOADING
   * ========================================================== */

  if (showInitialSkeleton) {
    return (
      <PageContainer
        title="Detail Laporan"
        subtitle="Memuat laporan..."
        breadcrumb={breadcrumb}
      >
        <div aria-busy="true" aria-live="polite" className="min-w-0">
          <ReportDetailSkeleton />
        </div>
      </PageContainer>
    );
  }

  /* ==========================================================
   * INITIAL ERROR
   * ========================================================== */

  if (initialError && !viewData) {
    return (
      <PageContainer
        title="Detail Laporan"
        subtitle="Gagal memuat."
        breadcrumb={breadcrumb}
      >
        <ErrorState error={initialError} onRetry={refresh} />
      </PageContainer>
    );
  }

  /* ==========================================================
   * EMPTY
   * ========================================================== */

  if (!viewData) {
    return (
      <PageContainer
        title="Detail Laporan"
        subtitle="Laporan tidak ditemukan."
        breadcrumb={breadcrumb}
      >
        <EmptyState
          title="Laporan tidak ditemukan"
          description="Laporan ini tidak tersedia."
          action={
            <Link
              to={roleConfig.reportsRoute}
              className={cx(ACTION_VARIANTS.primary, "w-full sm:w-auto")}
            >
              <ArrowLeftIcon className="h-4 w-4 shrink-0" aria-hidden="true" />

              <span>Kembali ke Laporan</span>
            </Link>
          }
        />
      </PageContainer>
    );
  }

  /* ==========================================================
   * CONTENT
   * ========================================================== */

  return (
    <PageContainer
      title="Detail Laporan"
      subtitle={`${viewData.studentName} · ${viewData.programName}`}
      breadcrumb={breadcrumb}
      actions={
        <ReportActions
          role={role}
          reportId={viewData.id}
          canEdit={capabilities?.canEdit === true}
        />
      }
    >
      <div
        className="min-w-0 space-y-6"
        aria-busy={isInitialLoading || isFetching || isRefreshing || undefined}
      >
        {(isRefreshing || refreshError) && (
          <div
            className="flex min-w-0 items-center justify-between gap-3 rounded-xl border border-border bg-surface-muted/40 px-4 py-3"
            role={refreshError ? "alert" : "status"}
            aria-live="polite"
          >
            <div className="min-w-0">
              <p className="text-sm font-medium text-text">
                {refreshError
                  ? "Pembaruan laporan gagal."
                  : "Memperbarui laporan..."}
              </p>

              {refreshError && (
                <p className="mt-0.5 text-xs text-muted">
                  Data laporan sebelumnya tetap ditampilkan.
                </p>
              )}
            </div>

            {refreshError && (
              <Button
                type="button"
                variant="secondary"
                size="sm"
                onClick={refresh}
                className="shrink-0"
              >
                Coba lagi
              </Button>
            )}
          </div>
        )}

        <article
          aria-label={`Detail laporan ${viewData.studentName}`}
          className={cx(
            "w-full min-w-0 overflow-hidden",
            "rounded-2xl border border-border",
            "bg-surface shadow-sm",
            "print:rounded-none",
            "print:border-0",
            "print:shadow-none",
          )}
        >
          <ReportHeader report={viewData} />

          <div className="px-4 py-6 sm:px-6 md:px-8 md:py-8">
            <div className="space-y-8 md:space-y-10">
              <ReportSummary report={viewData} />

              <ReportLearning report={viewData} />

              <ReportScore report={viewData} style={nilaiStyle} />

              <ReportProgress report={viewData} />

              <ReportTeacherNote report={viewData} />

              <ReportRecommendation report={viewData} />

              <ReportPhotos report={viewData} onOpen={lightbox.open} />

              <footer className="border-t border-border pt-6 text-center">
                <p className="text-xs leading-5 text-muted">
                  Catatan perkembangan pada sesi ini.
                </p>
              </footer>
            </div>
          </div>
        </article>

        <PhotoLightbox
          photos={viewData.photos}
          selectedIndex={lightbox.selectedIndex}
          onClose={lightbox.close}
          onPrev={lightbox.goPrev}
          onNext={lightbox.goNext}
        />
      </div>
    </PageContainer>
  );
};

ReportDetailPage.displayName = "ReportDetailPage";

export default ReportDetailPage;
