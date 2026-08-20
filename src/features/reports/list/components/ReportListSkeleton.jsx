import { memo } from "react";

import { SkeletonBase } from "@/shared/components/ui/Skeleton";

const ReportFilterSkeleton = memo(() => {
  return (
    <section aria-hidden="true" className="min-w-0">
      <div className="rounded-xl border border-border bg-surface p-3 sm:p-4">
        <div className="flex min-w-0 flex-col gap-2.5 lg:flex-row lg:items-center">
          {/* Search */}
          <SkeletonBase className="h-11 min-w-0 flex-1 rounded-xl" />

          {/* Sort */}
          <div className="flex w-full min-w-0 gap-2 lg:w-auto">
            <SkeletonBase className="h-11 min-w-0 flex-1 rounded-xl sm:min-w-[11rem] sm:flex-none" />

            <SkeletonBase className="size-10 shrink-0 rounded-xl" />
          </div>
        </div>
      </div>
    </section>
  );
});

ReportFilterSkeleton.displayName = "ReportFilterSkeleton";

const ReportCardSkeleton = memo(() => {
  return (
    <div
      aria-hidden="true"
      className="flex h-full flex-col overflow-hidden rounded-2xl bg-surface shadow-md ring-1 ring-border"
    >
      {/* Header */}
      <div className="border-b border-border bg-surface-muted/40 px-5 pb-4 pt-5">
        <div className="flex items-start justify-between gap-4">
          <div className="min-w-0 flex-1 space-y-2">
            <SkeletonBase className="h-3 w-20" />
            <SkeletonBase className="h-5 w-3/4" />
          </div>

          <SkeletonBase className="h-6 w-16 shrink-0 rounded-full" />
        </div>

        <div className="mt-3 flex items-center gap-2">
          <SkeletonBase className="h-3 w-24" />
          <SkeletonBase className="h-3 w-16" />
        </div>
      </div>

      {/* Score */}
      <div className="px-5 pt-5">
        <div className="rounded-2xl bg-surface-muted/50 p-4 ring-1 ring-border">
          <div className="flex items-center justify-between gap-4">
            <div className="space-y-2">
              <SkeletonBase className="h-3 w-12" />
              <SkeletonBase className="h-8 w-20" />
            </div>

            <div className="space-y-2 text-right">
              <SkeletonBase className="ml-auto h-3 w-16" />
              <SkeletonBase className="ml-auto h-6 w-12" />
            </div>
          </div>
        </div>
      </div>

      {/* Ratings */}
      <div className="px-5 py-5">
        <div className="grid grid-cols-2 gap-3">
          {Array.from({ length: 4 }).map((_, index) => (
            <div
              key={index}
              className="space-y-2 rounded-xl bg-surface-muted p-3"
            >
              <SkeletonBase className="h-3 w-20" />

              <div className="flex items-center gap-2">
                <SkeletonBase className="h-4 w-16" />
                <SkeletonBase className="h-4 w-6" />
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Actions */}
      <div className="mt-auto border-t border-border p-4">
        <div className="grid grid-cols-2 gap-2 sm:flex sm:flex-wrap">
          <SkeletonBase className="col-span-2 h-10 w-full rounded-xl sm:col-span-1 sm:min-w-20 sm:flex-1" />

          <SkeletonBase className="h-10 w-full rounded-xl sm:min-w-20 sm:flex-1" />

          <SkeletonBase className="h-10 w-full rounded-xl sm:min-w-20 sm:flex-1" />
        </div>
      </div>
    </div>
  );
});

ReportCardSkeleton.displayName = "ReportCardSkeleton";

const ReportPaginationSkeleton = memo(() => {
  return (
    <nav
      aria-hidden="true"
      className="flex min-w-0 flex-col gap-3 border-t border-border pt-4 sm:flex-row sm:items-center sm:justify-between"
    >
      <SkeletonBase className="h-4 w-24" />

      <div className="flex items-center gap-1.5">
        <SkeletonBase className="h-10 w-24 rounded-xl" />
        <SkeletonBase className="size-10 rounded-lg" />
        <SkeletonBase className="h-10 w-24 rounded-xl" />
      </div>
    </nav>
  );
});

ReportPaginationSkeleton.displayName = "ReportPaginationSkeleton";

export const ReportListSkeleton = memo(
  ({ count = 6, showPagination = true, className = "" }) => {
    const safeCount = Number.isInteger(count) && count > 0 ? count : 6;

    return (
      <div
        className={`min-w-0 space-y-5 sm:space-y-6 ${className}`}
        aria-hidden="true"
      >
        <ReportFilterSkeleton />

        <div className="grid min-w-0 grid-cols-1 gap-3.5 md:grid-cols-2 xl:grid-cols-3">
          {Array.from({ length: safeCount }).map((_, index) => (
            <ReportCardSkeleton key={index} />
          ))}
        </div>

        {showPagination && <ReportPaginationSkeleton />}
      </div>
    );
  },
);

ReportListSkeleton.displayName = "ReportListSkeleton";

export default ReportListSkeleton;
