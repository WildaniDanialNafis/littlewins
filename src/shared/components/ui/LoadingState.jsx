import { cx } from "@/shared/utils/cx";

import Spinner from "./Spinner";
import Skeleton from "./Skeleton";

export const LoadingState = ({
  message = "Memuat data...",
  className = "",
}) => {
  return (
    <div
      className={cx(
        "rounded-2xl bg-surface",
        "px-5 py-12 text-center",
        "sm:px-8 sm:py-14",
        className,
      )}
      aria-busy="true"
      aria-live="polite"
    >
      <Spinner size="md" className="mx-auto" aria-hidden="true" />

      <p className="mt-4 text-sm text-muted">{message}</p>
    </div>
  );
};

LoadingState.displayName = "LoadingState";

/* ============================================================
 * SKELETON VARIANTS
 * ============================================================ */

export const ReportListSkeleton = () => {
  return (
    <div className="min-w-0 space-y-5 sm:space-y-6">
      {/* Filter skeleton */}
      <div className="rounded-2xl border border-border bg-surface p-4 sm:p-5">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <Skeleton size="md" width="w-full sm:w-64" className="sm:max-w-xs" />
          <div className="flex gap-2">
            <Skeleton size="md" width="w-24" />
            <Skeleton size="md" width="w-24" />
          </div>
        </div>
      </div>

      {/* List items skeleton */}
      <div className="space-y-3">
        {[1, 2, 3, 4, 5].map((i) => (
          <div
            key={i}
            className="rounded-xl border border-border bg-surface p-4 sm:p-5"
          >
            <div className="flex items-start justify-between gap-4">
              <div className="min-w-0 flex-1 space-y-2">
                <Skeleton size="lg" width="w-3/4" />
                <Skeleton size="md" width="w-1/2" />
                <div className="flex gap-4 pt-1">
                  <Skeleton size="sm" width="w-20" />
                  <Skeleton size="sm" width="w-16" />
                </div>
              </div>
              <div className="flex shrink-0 gap-2">
                <Skeleton size="md" width="w-8" rounded="rounded-full" />
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

ReportListSkeleton.displayName = "ReportListSkeleton";

export const ReportDetailSkeleton = () => {
  return (
    <div className="min-w-0 space-y-6">
      <article className="w-full min-w-0 overflow-hidden rounded-2xl border border-border bg-surface shadow-sm">
        {/* Header */}
        <div className="border-b border-border px-4 py-5 sm:px-6 md:px-8 md:py-6">
          <div className="space-y-3">
            <Skeleton size="xl" width="w-1/3" />
            <Skeleton size="md" width="w-1/2" />
          </div>
        </div>

        {/* Content */}
        <div className="px-4 py-6 sm:px-6 md:px-8 md:py-8">
          <div className="space-y-8 md:space-y-10">
            {/* Summary section */}
            <section className="space-y-4">
              <Skeleton size="lg" width="w-40" />
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="rounded-xl border border-border p-4">
                    <Skeleton size="sm" width="w-24" />
                    <Skeleton size="xl" width="w-full" className="mt-2" />
                  </div>
                ))}
              </div>
            </section>

            {/* Learning section */}
            <section className="space-y-3">
              <Skeleton size="lg" width="w-48" />
              <div className="space-y-2">
                {[1, 2, 3].map((i) => (
                  <Skeleton key={i} size="md" width="w-full" />
                ))}
              </div>
            </section>

            {/* Score section */}
            <section className="space-y-3">
              <Skeleton size="lg" width="w-32" />
              <div className="rounded-xl border border-border p-6 text-center">
                <Skeleton size="xl" width="w-20" className="mx-auto" />
              </div>
            </section>

            {/* Progress section */}
            <section className="space-y-3">
              <Skeleton size="lg" width="w-40" />
              <div className="space-y-2">
                {[1, 2, 3, 4].map((i) => (
                  <div key={i} className="space-y-1">
                    <Skeleton size="sm" width="w-32" />
                    <Skeleton size="sm" width="w-full" />
                  </div>
                ))}
              </div>
            </section>

            {/* Teacher note section */}
            <section className="space-y-3">
              <Skeleton size="lg" width="w-44" />
              <div className="rounded-xl border border-border p-4">
                <Skeleton size="md" width="w-full" />
                <Skeleton size="md" width="w-5/6" />
                <Skeleton size="md" width="w-4/6" />
              </div>
            </section>

            {/* Recommendation section */}
            <section className="space-y-3">
              <Skeleton size="lg" width="w-48" />
              <div className="space-y-2">
                {[1, 2, 3].map((i) => (
                  <Skeleton key={i} size="md" width="w-full" />
                ))}
              </div>
            </section>

            {/* Photos section */}
            <section className="space-y-3">
              <Skeleton size="lg" width="w-32" />
              <div className="grid grid-cols-3 gap-3 sm:gap-4">
                {[1, 2, 3, 4, 5, 6].map((i) => (
                  <div
                    key={i}
                    className="aspect-square rounded-lg border border-border bg-surface-muted/50"
                  >
                    <Skeleton size="full" width="w-full" rounded="rounded-lg" />
                  </div>
                ))}
              </div>
            </section>
          </div>
        </div>
      </article>
    </div>
  );
};

ReportDetailSkeleton.displayName = "ReportDetailSkeleton";

export const ReportFormSkeleton = () => {
  return (
    <div className="min-w-0 space-y-6">
      {/* Form sections */}
      <div className="rounded-2xl border border-border bg-surface p-4 sm:p-6">
        <div className="space-y-6">
          {/* Student select */}
          <div className="space-y-2">
            <Skeleton size="md" width="w-32" />
            <Skeleton size="lg" width="w-full" />
          </div>

          {/* Program & Class */}
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Skeleton size="md" width="w-24" />
              <Skeleton size="lg" width="w-full" />
            </div>
            <div className="space-y-2">
              <Skeleton size="md" width="w-20" />
              <Skeleton size="lg" width="w-full" />
            </div>
          </div>

          {/* Date & Duration */}
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Skeleton size="md" width="w-20" />
              <Skeleton size="lg" width="w-full" />
            </div>
            <div className="space-y-2">
              <Skeleton size="md" width="w-24" />
              <Skeleton size="lg" width="w-full" />
            </div>
          </div>

          {/* Learning content */}
          <div className="space-y-2">
            <Skeleton size="md" width="w-40" />
            <div className="space-y-2">
              <Skeleton size="md" width="w-full" />
              <Skeleton size="md" width="w-full" />
              <Skeleton size="md" width="w-5/6" />
            </div>
          </div>

          {/* Materials */}
          <div className="space-y-2">
            <Skeleton size="md" width="w-36" />
            <div className="space-y-3">
              {[1, 2].map((i) => (
                <div key={i} className="flex gap-3">
                  <Skeleton size="lg" width="w-1/3" />
                  <Skeleton size="lg" width="w-1/4" />
                </div>
              ))}
            </div>
          </div>

          {/* Activities */}
          <div className="space-y-2">
            <Skeleton size="md" width="w-40" />
            <div className="space-y-3">
              {[1, 2, 3].map((i) => (
                <div key={i} className="flex gap-3">
                  <Skeleton size="md" width="w-24" />
                  <Skeleton size="lg" width="w-full" />
                </div>
              ))}
            </div>
          </div>

          {/* Rating */}
          <div className="space-y-2">
            <Skeleton size="md" width="w-32" />
            <div className="flex gap-1">
              {[1, 2, 3, 4, 5].map((i) => (
                <Skeleton
                  key={i}
                  size="lg"
                  width="w-8"
                  rounded="rounded-full"
                />
              ))}
            </div>
          </div>

          {/* Teacher note */}
          <div className="space-y-2">
            <Skeleton size="md" width="w-36" />
            <Skeleton size="xl" width="w-full" />
            <Skeleton size="xl" width="w-full" />
            <Skeleton size="xl" width="w-3/4" />
          </div>

          {/* Photos */}
          <div className="space-y-2">
            <Skeleton size="md" width="w-32" />
            <div className="grid grid-cols-3 gap-3 sm:gap-4">
              {[1, 2, 3, 4, 5, 6].map((i) => (
                <div
                  key={i}
                  className="aspect-square rounded-lg border border-border"
                >
                  <Skeleton size="full" width="w-full" rounded="rounded-lg" />
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Form actions */}
      <div className="flex gap-3">
        <Skeleton size="lg" width="w-28" />
        <Skeleton size="lg" width="w-32" />
      </div>
    </div>
  );
};

ReportFormSkeleton.displayName = "ReportFormSkeleton";

export const DashboardSkeleton = () => {
  return (
    <div className="min-w-0 space-y-6">
      {/* Welcome section */}
      <section className="pb-6">
        <div className="flex min-w-0 flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex min-w-0 items-start gap-3.5 sm:items-center sm:gap-4">
            <Skeleton
              size="xl"
              width="w-12"
              rounded="rounded-xl"
              className="shrink-0"
            />
            <div className="min-w-0 space-y-2">
              <Skeleton size="sm" width="w-32" />
              <Skeleton size="xl" width="w-48" />
              <Skeleton size="md" width="w-40" />
            </div>
          </div>
          <div className="flex gap-2">
            <Skeleton size="lg" width="w-28" />
            <Skeleton size="lg" width="w-32" />
          </div>
        </div>
      </section>

      {/* Latest report section */}
      <section className="pt-6">
        <div className="flex min-w-0 items-center justify-between gap-3">
          <div className="space-y-2">
            <Skeleton size="sm" width="w-40" />
            <Skeleton size="md" width="w-56" />
          </div>
          <Skeleton size="md" width="w-24" />
        </div>

        <div className="mt-4 overflow-hidden rounded-xl border border-border bg-surface">
          <div className="p-4 sm:p-5">
            <div className="flex min-w-0 items-start gap-3 sm:gap-4">
              <div className="min-w-0 flex-1 space-y-2">
                <Skeleton size="sm" width="w-32" />
                <Skeleton size="xl" width="w-48" />
              </div>
              <div className="flex shrink-0 flex-col items-center justify-center rounded-xl border border-border bg-surface-muted/50 px-3 py-2">
                <Skeleton size="xs" width="w-12" />
                <Skeleton size="xl" width="w-16" className="mt-1" />
              </div>
            </div>
            <div className="mt-4">
              <div className="flex gap-4">
                <Skeleton size="sm" width="w-32" />
                <Skeleton size="sm" width="w-20" />
              </div>
            </div>
          </div>
          <div className="border-t border-border bg-surface-muted/20 p-4 sm:p-5">
            <div className="flex items-center justify-between gap-3">
              <div className="space-y-1">
                <Skeleton size="xs" width="w-28" />
                <Skeleton size="sm" width="w-36" />
              </div>
              <Skeleton size="lg" width="w-28" />
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

DashboardSkeleton.displayName = "DashboardSkeleton";

export default LoadingState;

