import { Link, useParams } from "react-router-dom";

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
  useReportDetail,
} from "@/features/reports/detail";

import {
  Button,
  EmptyState,
  ErrorState,
  LoadingState,
} from "@/shared/components/ui";

import { ArrowLeftIcon, EditIcon, PrintIcon } from "@/shared/icons";

import { ROUTES } from "@/shared/constants";
import { cx } from "@/shared/utils";

import { PageContainer } from "@/layouts/components";

const ACTION_BASE_CLASS = [
  "inline-flex shrink-0 items-center justify-center gap-2",
  "rounded-xl",
  "font-medium leading-none",
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
    "min-h-10 px-4 py-2.5 text-sm",
    "bg-primary text-primary-foreground shadow-sm",
    "hover:bg-primary-hover",
    "active:bg-primary-active",
  ].join(" "),

  secondary: [
    ACTION_BASE_CLASS,
    "min-h-10 px-4 py-2.5 text-sm",
    "border border-border bg-surface text-text",
    "hover:border-border-strong hover:bg-surface-muted",
    "active:bg-surface-muted",
  ].join(" "),

  ghost: [
    ACTION_BASE_CLASS,
    "min-h-10 px-3 py-2 text-sm",
    "text-muted",
    "hover:bg-surface-muted hover:text-text",
    "active:bg-surface-muted",
  ].join(" "),
};

const ReportDetailPage = () => {
  const { id } = useParams();

  const { viewData, nilaiStyle, isLoading, error, refresh, lightbox } =
    useReportDetail(id);

  if (isLoading) {
    return (
      <PageContainer title="Detail Laporan" subtitle="Memuat laporan...">
        <LoadingState message="Memuat detail laporan..." />
      </PageContainer>
    );
  }

  if (error) {
    return (
      <PageContainer title="Detail Laporan" subtitle="Terjadi kesalahan">
        <ErrorState error={error} onRetry={refresh} />
      </PageContainer>
    );
  }

  if (!viewData) {
    return (
      <PageContainer title="Detail Laporan" subtitle="Laporan tidak ditemukan">
        <EmptyState
          title="Laporan tidak ditemukan"
          description="Laporan yang kamu cari tidak tersedia atau sudah tidak dapat diakses."
          action={
            <Link
              to={ROUTES.teacher.reports}
              className={cx(ACTION_VARIANTS.primary, "w-full sm:w-auto")}
            >
              <ArrowLeftIcon className="h-4 w-4" aria-hidden="true" />

              <span>Kembali ke Laporan</span>
            </Link>
          }
        />
      </PageContainer>
    );
  }

  return (
    <PageContainer
      title="Detail Laporan"
      subtitle={`${viewData.studentName} · ${viewData.programName}`}
    >
      <div className="space-y-6">
        <nav
          aria-label="Aksi laporan"
          className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between print:hidden"
        >
          <Link
            to={ROUTES.teacher.reports}
            className={cx(ACTION_VARIANTS.ghost, "w-full sm:w-auto")}
          >
            <ArrowLeftIcon className="h-4 w-4" aria-hidden="true" />

            <span>Kembali ke Laporan</span>
          </Link>

          <div className="flex w-full flex-col gap-2 sm:w-auto sm:flex-row">
            <Link
              to={ROUTES.teacher.reportEdit(viewData.id)}
              className={cx(ACTION_VARIANTS.primary, "w-full sm:w-auto")}
            >
              <EditIcon className="h-4 w-4" aria-hidden="true" />

              <span>Edit Laporan</span>
            </Link>

            <Button
              type="button"
              variant="secondary"
              className="w-full sm:w-auto"
              onClick={() => window.print()}
            >
              <PrintIcon className="h-4 w-4" aria-hidden="true" />

              <span>Cetak</span>
            </Button>
          </div>
        </nav>

        <article
          aria-label={`Detail laporan ${viewData.studentName}`}
          className={cx(
            "mx-auto max-w-7xl overflow-hidden",
            "rounded-2xl border border-border bg-surface shadow-sm",
            "print:rounded-none print:border-0 print:shadow-none",
          )}
        >
          <ReportHeader report={viewData} />

          <div className="px-4 py-6 sm:px-6 md:px-8 md:py-8">
            <div className="space-y-8 md:space-y-10">
              {/* 1. Informasi Sesi */}
              <ReportSummary report={viewData} />

              {/* 2. Pembelajaran */}
              <ReportLearning report={viewData} />

              {/* 3. Penilaian */}
              <ReportScore report={viewData} style={nilaiStyle} />

              <ReportProgress report={viewData} />

              {/* 4. Catatan Pengajar */}
              <ReportTeacherNote report={viewData} />

              {/* 5. Rekomendasi */}
              <ReportRecommendation report={viewData} />

              {/* 6. Dokumentasi */}
              <ReportPhotos report={viewData} onOpen={lightbox.open} />

              <footer className="border-t border-border pt-6 text-center">
                <p className="text-xs leading-relaxed text-muted">
                  Laporan ini merupakan catatan perkembangan belajar pada sesi
                  tersebut.
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
