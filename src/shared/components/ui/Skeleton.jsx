import { cx } from "@/shared/utils/cx";

/* ============================================================
 * CONSTANTS
 * ============================================================ */

const TEXT_LINE_HEIGHTS = Object.freeze({
  sm: "h-3",
  md: "h-4",
  lg: "h-5",
  xl: "h-6",
});

const CIRCLE_SIZES = Object.freeze({
  sm: "size-8",
  md: "size-10",
  lg: "size-12",
  xl: "size-16",
  "2xl": "size-20",
});

const DEFAULT_LINES = 1;

/* ============================================================
 * HELPERS
 * ============================================================ */

const normalizeCount = (value, fallback = DEFAULT_LINES) => {
  const numericValue = Number(value);

  if (!Number.isInteger(numericValue) || numericValue <= 0) {
    return fallback;
  }

  return Math.min(numericValue, 20);
};

/* ============================================================
 * SKELETON BASE
 * ============================================================ */

export const SkeletonBase = ({ className = "", ...props }) => {
  return (
    <div
      className={cx(
        "animate-pulse rounded-lg bg-surface-muted",
        "motion-reduce:animate-none",
        className,
      )}
      aria-hidden="true"
      {...props}
    />
  );
};

SkeletonBase.displayName = "SkeletonBase";

/* ============================================================
 * SKELETON TEXT
 * ============================================================ */

export const SkeletonText = ({ lines = 1, size = "md", className = "" }) => {
  const safeLines = normalizeCount(lines);

  const lineHeight = TEXT_LINE_HEIGHTS[size] ?? TEXT_LINE_HEIGHTS.md;

  return (
    <div className={cx("space-y-2", className)} aria-hidden="true">
      {Array.from({
        length: safeLines,
      }).map((_, index) => (
        <SkeletonBase
          key={index}
          className={cx(
            lineHeight,
            index === safeLines - 1 && "w-3/4",
            "shrink-0",
          )}
        />
      ))}
    </div>
  );
};

SkeletonText.displayName = "SkeletonText";

/* ============================================================
 * SKELETON CIRCLE
 * ============================================================ */

export const SkeletonCircle = ({ size = "md", className = "" }) => {
  return (
    <SkeletonBase
      className={cx(
        "shrink-0 rounded-full",
        CIRCLE_SIZES[size] ?? CIRCLE_SIZES.md,
        className,
      )}
    />
  );
};

SkeletonCircle.displayName = "SkeletonCircle";

/* ============================================================
 * SKELETON RECTANGLE
 * ============================================================ */

export const SkeletonRectangle = ({
  width = "w-full",
  height = "h-20",
  rounded = "rounded-lg",
  className = "",
}) => {
  return <SkeletonBase className={cx(width, height, rounded, className)} />;
};

SkeletonRectangle.displayName = "SkeletonRectangle";

/* ============================================================
 * SKELETON CARD
 * ============================================================ */

export const SkeletonCard = ({ variant = "default", className = "" }) => {
  if (variant === "report") {
    return (
      <article
        className={cx(
          "flex h-full flex-col overflow-hidden",
          "rounded-2xl border border-border",
          "bg-surface shadow-sm",
          className,
        )}
        aria-hidden="true"
      >
        <div className="border-b border-border bg-surface-muted/40 px-5 pb-4 pt-5">
          <div className="flex items-start justify-between gap-4">
            <div className="min-w-0 flex-1 space-y-2">
              <SkeletonBase className="h-3 w-20" />

              <SkeletonBase className="h-5 w-3/4 max-w-full" />
            </div>

            <SkeletonBase className="h-6 w-16 shrink-0 rounded-full" />
          </div>

          <div className="mt-3 flex items-center gap-2">
            <SkeletonBase className="h-3 w-24" />

            <SkeletonBase className="h-3 w-16" />
          </div>
        </div>

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

        <div className="mt-auto border-t border-border p-4">
          <div className="grid grid-cols-2 gap-2 sm:flex sm:flex-wrap">
            <SkeletonBase className="col-span-2 h-10 w-full rounded-xl sm:col-span-1 sm:min-w-20 sm:flex-1" />

            <SkeletonBase className="h-10 w-full rounded-xl sm:min-w-20 sm:flex-1" />

            <SkeletonBase className="h-10 w-full rounded-xl sm:min-w-20 sm:flex-1" />
          </div>
        </div>
      </article>
    );
  }

  return (
    <div
      className={cx(
        "overflow-hidden rounded-xl",
        "border border-border",
        "bg-surface shadow-sm",
        className,
      )}
      aria-hidden="true"
    >
      <div className="space-y-4 p-5">
        <SkeletonBase className="h-5 w-3/4" />

        <SkeletonText lines={3} size="sm" />

        <div className="flex gap-2">
          <SkeletonBase className="h-9 w-24" />

          <SkeletonBase className="h-9 w-24" />
        </div>
      </div>
    </div>
  );
};

SkeletonCard.displayName = "SkeletonCard";

export default SkeletonBase;
