import { memo } from "react";

import { SkeletonBase } from "@/shared/components/ui/Skeleton";

/* ============================================================
 * CONSTANTS
 * ============================================================ */

const SUMMARY_ITEM_COUNT = 6;
const RATING_COUNT = 4;
const RECOMMENDATION_COUNT = 4;
const PHOTO_COUNT = 4;

/* ============================================================
 * HEADER
 * ============================================================ */

const ReportHeaderSkeleton = memo(() => {
  return (
    <header
      aria-hidden="true"
      className="border-b border-border bg-surface-muted/40 px-4 py-5 sm:px-6 md:px-8 md:py-6"
    >
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div className="min-w-0 flex-1 space-y-3">
          <SkeletonBase className="h-4 w-32" />

          <SkeletonBase className="h-7 w-2/3 max-w-md" />

          <div className="flex flex-wrap items-center gap-2">
            <SkeletonBase className="h-4 w-24" />

            <SkeletonBase className="h-4 w-20" />

            <SkeletonBase className="h-4 w-28" />
          </div>
        </div>

        <SkeletonBase className="h-7 w-20 shrink-0 rounded-full" />
      </div>
    </header>
  );
});

ReportHeaderSkeleton.displayName = "ReportHeaderSkeleton";

/* ============================================================
 * SECTION HEADER
 * ============================================================ */

const SectionHeaderSkeleton = memo(() => {
  return (
    <div className="space-y-2" aria-hidden="true">
      <SkeletonBase className="h-5 w-36" />

      <SkeletonBase className="h-3 w-64 max-w-full" />
    </div>
  );
});

SectionHeaderSkeleton.displayName = "SectionHeaderSkeleton";

/* ============================================================
 * SUMMARY
 * ============================================================ */

const ReportSummarySkeleton = memo(() => {
  return (
    <section aria-hidden="true" className="space-y-4">
      <SectionHeaderSkeleton />

      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {Array.from({
          length: SUMMARY_ITEM_COUNT,
        }).map((_, index) => (
          <div
            key={index}
            className="rounded-xl bg-surface-muted p-4 ring-1 ring-border"
          >
            <SkeletonBase className="h-3 w-24" />

            <SkeletonBase className="mt-2 h-5 w-32" />
          </div>
        ))}
      </div>
    </section>
  );
});

ReportSummarySkeleton.displayName = "ReportSummarySkeleton";

/* ============================================================
 * LEARNING
 * ============================================================ */

const ReportLearningSkeleton = memo(() => {
  return (
    <section aria-hidden="true" className="space-y-4">
      <SectionHeaderSkeleton />

      <div className="space-y-3">
        <div className="rounded-xl bg-surface-muted p-4 ring-1 ring-border">
          <SkeletonBase className="h-4 w-40" />

          <SkeletonBase className="mt-3 h-3 w-full" />

          <SkeletonBase className="mt-2 h-3 w-5/6" />
        </div>

        <div className="rounded-xl bg-surface-muted p-4 ring-1 ring-border">
          <SkeletonBase className="h-4 w-36" />

          <SkeletonBase className="mt-3 h-3 w-full" />

          <SkeletonBase className="mt-2 h-3 w-4/5" />
        </div>
      </div>
    </section>
  );
});

ReportLearningSkeleton.displayName = "ReportLearningSkeleton";

/* ============================================================
 * SCORE
 * ============================================================ */

const ReportScoreSkeleton = memo(() => {
  return (
    <section aria-hidden="true" className="space-y-4">
      <SectionHeaderSkeleton />

      <div className="rounded-xl bg-surface-muted p-4 ring-1 ring-border sm:p-5">
        <div className="flex items-center justify-between gap-4">
          <div className="min-w-0 space-y-2">
            <SkeletonBase className="h-3 w-12" />

            <SkeletonBase className="h-8 w-20" />
          </div>

          <div className="shrink-0 space-y-2 text-right">
            <SkeletonBase className="ml-auto h-3 w-16" />

            <SkeletonBase className="ml-auto h-6 w-12" />
          </div>
        </div>
      </div>
    </section>
  );
});

ReportScoreSkeleton.displayName = "ReportScoreSkeleton";

/* ============================================================
 * PROGRESS
 * ============================================================ */

const ReportProgressSkeleton = memo(() => {
  return (
    <section aria-hidden="true" className="space-y-4">
      <SectionHeaderSkeleton />

      <div className="space-y-4 rounded-xl bg-surface-muted p-4 ring-1 ring-border sm:p-5">
        {Array.from({
          length: RATING_COUNT,
        }).map((_, index) => (
          <div key={index} className="space-y-2">
            <div className="flex items-center justify-between gap-4">
              <SkeletonBase className="h-3 w-28" />

              <SkeletonBase className="h-3 w-12" />
            </div>

            <SkeletonBase className="h-2 w-full rounded-full" />
          </div>
        ))}
      </div>
    </section>
  );
});

ReportProgressSkeleton.displayName = "ReportProgressSkeleton";

/* ============================================================
 * TEACHER NOTE
 * ============================================================ */

const ReportTeacherNoteSkeleton = memo(() => {
  return (
    <section aria-hidden="true" className="space-y-4">
      <SectionHeaderSkeleton />

      <div className="rounded-xl bg-surface-muted p-4 ring-1 ring-border sm:p-5">
        <SkeletonBase className="h-3 w-full" />

        <SkeletonBase className="mt-2 h-3 w-full" />

        <SkeletonBase className="mt-2 h-3 w-4/5" />

        <SkeletonBase className="mt-2 h-3 w-2/3" />
      </div>
    </section>
  );
});

ReportTeacherNoteSkeleton.displayName = "ReportTeacherNoteSkeleton";

/* ============================================================
 * RECOMMENDATION
 * ============================================================ */

const ReportRecommendationSkeleton = memo(() => {
  return (
    <section aria-hidden="true" className="space-y-4">
      <SectionHeaderSkeleton />

      <div className="grid gap-3 sm:grid-cols-2">
        {Array.from({
          length: RECOMMENDATION_COUNT,
        }).map((_, index) => (
          <div
            key={index}
            className="rounded-xl bg-surface-muted p-4 ring-1 ring-border"
          >
            <SkeletonBase className="h-4 w-32" />

            <SkeletonBase className="mt-3 h-3 w-full" />

            <SkeletonBase className="mt-2 h-3 w-4/5" />
          </div>
        ))}
      </div>
    </section>
  );
});

ReportRecommendationSkeleton.displayName = "ReportRecommendationSkeleton";

/* ============================================================
 * PHOTOS
 * ============================================================ */

const ReportPhotosSkeleton = memo(() => {
  return (
    <section aria-hidden="true" className="space-y-4">
      <SectionHeaderSkeleton />

      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4">
        {Array.from({
          length: PHOTO_COUNT,
        }).map((_, index) => (
          <SkeletonBase
            key={index}
            className="aspect-square w-full rounded-xl"
          />
        ))}
      </div>
    </section>
  );
});

ReportPhotosSkeleton.displayName = "ReportPhotosSkeleton";

/* ============================================================
 * FOOTER
 * ============================================================ */

const ReportDetailFooterSkeleton = memo(() => {
  return (
    <footer aria-hidden="true" className="border-t border-border pt-6">
      <SkeletonBase className="mx-auto h-3 w-52" />
    </footer>
  );
});

ReportDetailFooterSkeleton.displayName = "ReportDetailFooterSkeleton";

/* ============================================================
 * DETAIL
 * ============================================================ */

export const ReportDetailSkeleton = memo(() => {
  return (
    <div className="min-w-0 space-y-6" aria-hidden="true">
      <article
        className={[
          "w-full min-w-0 overflow-hidden",
          "rounded-2xl border border-border",
          "bg-surface shadow-sm",
        ].join(" ")}
      >
        <ReportHeaderSkeleton />

        <div className="px-4 py-6 sm:px-6 md:px-8 md:py-8">
          <div className="space-y-8 md:space-y-10">
            <ReportSummarySkeleton />

            <ReportLearningSkeleton />

            <ReportScoreSkeleton />

            <ReportProgressSkeleton />

            <ReportTeacherNoteSkeleton />

            <ReportRecommendationSkeleton />

            <ReportPhotosSkeleton />

            <ReportDetailFooterSkeleton />
          </div>
        </div>
      </article>
    </div>
  );
});

ReportDetailSkeleton.displayName = "ReportDetailSkeleton";

export default ReportDetailSkeleton;
