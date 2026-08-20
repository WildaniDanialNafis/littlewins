import { cx } from "@/shared/utils/cx";

/* ============================================================
 * SKELETON BASE
 * ============================================================ */

export const SkeletonBase = ({ className = "", ...props }) => {
  return (
    <div
      className={cx(
        "animate-pulse rounded-lg bg-surface-muted",
        "motion-reduce:animate-none",
        className
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

export const SkeletonText = ({
  lines = 1,
  size = "md",
  className = "",
}) => {
  const lineHeights = {
    sm: "h-3",
    md: "h-4",
    lg: "h-5",
    xl: "h-6",
  };

  return (
    <div className={cx("space-y-2", className)} aria-hidden="true">
      {Array.from({ length: lines }).map((_, index) => (
        <SkeletonBase
          key={index}
          className={cx(
            lineHeights[size] ?? lineHeights.md,
            index === lines - 1 && "w-3/4",
            "shrink-0"
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
  const sizes = {
    sm: "size-8",
    md: "size-10",
    lg: "size-12",
    xl: "size-16",
    "2xl": "size-20",
  };

  return (
    <SkeletonBase
      className={cx(
        "rounded-full",
        sizes[size] ?? sizes.md,
        "shrink-0",
        className
      )}
    />
  );
};

SkeletonCircle.displayName = "SkeletonCircle";

/* ============================================================
 * SKELETON RECTANGLE
 * ============================================================ */

export const SkeletonRectangle = ({
  width = "full",
  height = "md",
  className = "",
}) => {
  const widths = {
    sm: "w-24",
    md: "w-48",
    lg: "w-64",
    full: "w-full",
  };

  const heights = {
    sm: "h-16",
    md: "h-24",
    lg: "h-32",
    xl: "h-40",
  };

  return (
    <SkeletonBase
      className={cx(
        widths[width] ?? widths.full,
        heights[height] ?? heights.md,
        className
      )}
    />
  );
};

SkeletonRectangle.displayName = "SkeletonRectangle";

/* ============================================================
 * SKELETON AVATAR
 * ============================================================ */

export const SkeletonAvatar = ({ size = "md", withText = false }) => {
  return (
    <div className="flex items-center gap-3" aria-hidden="true">
      <SkeletonCircle size={size} />
      {withText && (
        <div className="min-w-0 flex-1 space-y-2">
          <SkeletonBase className="h-4 w-3/4" />
          <SkeletonBase className="h-3 w-1/2" />
        </div>
      )}
    </div>
  );
};

SkeletonAvatar.displayName = "SkeletonAvatar";

/* ============================================================
 * SKELETON CARD
 * ============================================================ */

export const SkeletonCard = ({ variant = "default", className = "" }) => {
  if (variant === "report") {
    return (
      <div
        className={cx(
          "overflow-hidden rounded-2xl border border-border bg-surface shadow-md",
          className
        )}
        aria-hidden="true"
      >
        {/* Header */}
        <div className="border-b border-border bg-linear-to-r from-primary/5 via-primary/5 to-transparent px-5 pb-4 pt-5">
          <div className="flex items-start justify-between gap-4">
            <div className="min-w-0 flex-1 space-y-2">
              <SkeletonBase className="h-3 w-20" />
              <SkeletonBase className="h-5 w-3/4" />
            </div>
            <SkeletonBase className="h-6 w-16 rounded-full" />
          </div>
          <div className="mt-3 flex items-center gap-2">
            <SkeletonBase className="h-3 w-24" />
          </div>
        </div>

        {/* Score Section */}
        <div className="px-5 pt-5">
          <div className="rounded-2xl bg-surface-muted/50 p-4 ring-1 ring-border">
            <div className="flex items-center justify-between gap-4">
              <div className="space-y-2">
                <SkeletonBase className="h-3 w-12" />
                <SkeletonBase className="h-8 w-20" />
              </div>
              <div className="space-y-2 text-right">
                <SkeletonBase className="h-3 w-16 ml-auto" />
                <SkeletonBase className="h-6 w-12 ml-auto" />
              </div>
            </div>
          </div>
        </div>

        {/* Ratings Grid */}
        <div className="px-5 py-5">
          <div className="grid grid-cols-2 gap-3">
            {Array.from({ length: 4 }).map((_, index) => (
              <div
                key={index}
                className="rounded-xl bg-surface-muted/40 p-4 space-y-2"
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

        {/* Footer */}
        <div className="border-t border-border p-4">
          <div className="grid grid-cols-2 gap-2 sm:flex sm:flex-wrap">
            {Array.from({ length: 3 }).map((_, index) => (
              <SkeletonBase
                key={index}
                className="col-span-2 h-10 w-full sm:col-span-1 sm:min-w-20 sm:flex-1"
              />
            ))}
          </div>
        </div>
      </div>
    );
  }

  // Default card
  return (
    <div
      className={cx(
        "overflow-hidden rounded-xl border border-border bg-surface shadow-sm",
        className
      )}
      aria-hidden="true"
    >
      <div className="p-5 space-y-4">
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

/* ============================================================
 * SKELETON LIST
 * ============================================================ */

export const SkeletonList = ({ count = 3, variant = "default" }) => {
  return (
    <div className="space-y-3" aria-hidden="true">
      {Array.from({ length: count }).map((_, index) => (
        <SkeletonCard key={index} variant={variant} />
      ))}
    </div>
  );
};

SkeletonList.displayName = "SkeletonList";

/* ============================================================
 * SKELETON TABLE
 * ============================================================ */

export const SkeletonTable = ({ rows = 5, columns = 4 }) => {
  return (
    <div className="overflow-hidden rounded-xl border border-border bg-surface" aria-hidden="true">
      <div className="border-b border-border bg-surface-muted/50 p-4">
        <div className="flex gap-4">
          {Array.from({ length: columns }).map((_, index) => (
            <SkeletonBase key={index} className="h-4 w-24" />
          ))}
        </div>
      </div>
      <div className="divide-y divide-border p-4 space-y-4">
        {Array.from({ length: rows }).map((_, rowIndex) => (
          <div key={rowIndex} className="flex gap-4">
            {Array.from({ length: columns }).map((_, colIndex) => (
              <SkeletonBase key={colIndex} className="h-4 w-24" />
            ))}
          </div>
        ))}
      </div>
    </div>
  );
};

SkeletonTable.displayName = "SkeletonTable";

/* ============================================================
 * SKELETON DASHBOARD
 * ============================================================ */

export const SkeletonDashboard = () => {
  return (
    <div className="space-y-6" aria-hidden="true">
      {/* Welcome Section */}
      <div className="flex min-w-0 flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex min-w-0 items-start gap-3.5 sm:items-center sm:gap-4">
          <SkeletonCircle size="lg" />
          <div className="min-w-0 space-y-2">
            <SkeletonBase className="h-3 w-24" />
            <SkeletonBase className="h-6 w-48" />
            <SkeletonBase className="h-4 w-64" />
          </div>
        </div>
        <div className="grid w-full shrink-0 gap-2 sm:flex sm:w-auto sm:grid-cols-2">
          <SkeletonBase className="h-11 w-full sm:w-32" />
          <SkeletonBase className="h-11 w-full sm:w-32" />
        </div>
      </div>

      {/* Stats Section */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        {Array.from({ length: 4 }).map((_, index) => (
          <div
            key={index}
            className="rounded-xl border border-border bg-surface p-4 space-y-2"
          >
            <SkeletonBase className="h-3 w-16" />
            <SkeletonBase className="h-8 w-20" />
          </div>
        ))}
      </div>

      {/* Latest Report */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <SkeletonBase className="h-5 w-40" />
          <SkeletonBase className="h-9 w-24" />
        </div>
        <SkeletonCard variant="report" />
      </div>
    </div>
  );
};

SkeletonDashboard.displayName = "SkeletonDashboard";

/* ============================================================
 * SKELETON FORM
 * ============================================================ */

export const SkeletonForm = ({ sections = 3 }) => {
  return (
    <div className="space-y-6" aria-hidden="true">
      {Array.from({ length: sections }).map((_, index) => (
        <div
          key={index}
          className="overflow-hidden rounded-2xl border border-border bg-surface"
        >
          <div className="border-b border-border bg-surface-muted/30 p-5 space-y-2">
            <SkeletonBase className="h-3 w-16" />
            <SkeletonBase className="h-5 w-40" />
            <SkeletonBase className="h-3 w-64" />
          </div>
          <div className="p-5 space-y-4">
            <div className="grid gap-4 md:grid-cols-2">
              {Array.from({ length: 4 }).map((_, fieldIndex) => (
                <div key={fieldIndex} className="space-y-2">
                  <SkeletonBase className="h-3 w-20" />
                  <SkeletonBase className="h-11 w-full" />
                </div>
              ))}
            </div>
          </div>
        </div>
      ))}

      {/* Action Buttons */}
      <div className="flex gap-2 justify-end">
        <SkeletonBase className="h-11 w-28" />
        <SkeletonBase className="h-11 w-28" />
      </div>
    </div>
  );
};

SkeletonForm.displayName = "SkeletonForm";

/* ============================================================
 * EXPORT ALL
 * ============================================================ */

export default {
  Base: SkeletonBase,
  Text: SkeletonText,
  Circle: SkeletonCircle,
  Rectangle: SkeletonRectangle,
  Avatar: SkeletonAvatar,
  Card: SkeletonCard,
  List: SkeletonList,
  Table: SkeletonTable,
  Dashboard: SkeletonDashboard,
  Form: SkeletonForm,
};
