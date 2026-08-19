import { Link } from "react-router-dom";

import { cx } from "@/shared/utils";

/* ============================================================
 * BREADCRUMB
 * ============================================================ */

const BreadcrumbSeparator = () => (
  <svg
    className="size-4 shrink-0 text-muted/50"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    aria-hidden="true"
  >
    <path d="m9 18 6-6-6-6" />
  </svg>
);

BreadcrumbSeparator.displayName = "BreadcrumbSeparator";

const BreadcrumbItem = ({ item, isLast }) => {
  const label = item.label.trim();

  if (isLast) {
    return (
      <span
        aria-current="page"
        title={label}
        className={cx(
          "min-w-0 max-w-[min(65vw,36rem)]",
          "truncate font-medium text-text",
        )}
      >
        {label}
      </span>
    );
  }

  if (!item.path) {
    return (
      <span className="shrink-0 whitespace-nowrap text-muted">{label}</span>
    );
  }

  return (
    <Link
      to={item.path}
      className={cx(
        "inline-flex min-h-8 shrink-0 items-center",
        "rounded-md px-1.5",
        "whitespace-nowrap",
        "text-muted",
        "transition-colors duration-(--token-transition-fast)",
        "hover:text-primary",
        "focus-visible:outline-none",
        "focus-visible:ring-2",
        "focus-visible:ring-primary/30",
        "focus-visible:ring-offset-2",
        "focus-visible:ring-offset-background",
        "motion-reduce:transition-none",
      )}
    >
      {label}
    </Link>
  );
};

BreadcrumbItem.displayName = "BreadcrumbItem";

/* ============================================================
 * PAGE BREADCRUMB
 * ============================================================ */

const PageBreadcrumb = ({ items }) => {
  if (!items.length) {
    return null;
  }

  return (
    <nav
      aria-label="Breadcrumb"
      className={cx(
        "min-w-0",
        "overflow-x-auto overflow-y-hidden",
        "overscroll-x-contain",
        "scrollbar-thin",
        "-mx-1 px-1",
      )}
    >
      <ol
        className={cx(
          "flex min-w-max items-center",
          "gap-1.5 sm:gap-2",
          "text-sm leading-none",
        )}
      >
        {items.map((item, index) => {
          const isLast = index === items.length - 1;

          const key = item.path
            ? `${item.path}-${item.label}`
            : `${index}-${item.label}`;

          return (
            <li
              key={key}
              className="flex shrink-0 items-center gap-1.5 sm:gap-2"
            >
              <BreadcrumbItem item={item} isLast={isLast} />

              {!isLast && <BreadcrumbSeparator />}
            </li>
          );
        })}
      </ol>
    </nav>
  );
};

PageBreadcrumb.displayName = "PageBreadcrumb";

/* ============================================================
 * PAGE HEADER
 * ============================================================ */

const PageHeader = ({ title, subtitle, actions }) => {
  if (!title && !actions) {
    return null;
  }

  return (
    <header
      className={cx(
        "grid min-w-0",
        "grid-cols-[minmax(0,1fr)_auto]",
        "items-start",
        "gap-x-4 gap-y-3",
        "sm:gap-x-6 sm:gap-y-4",
      )}
    >
      {/* ======================================================
       * TITLE / SUBTITLE
       * ====================================================== */}

      {title && (
        <div className="min-w-0">
          <h1
            className={cx(
              "min-w-0 max-w-4xl",
              "wrap-break-word",
              "text-2xl font-bold leading-tight tracking-tight",
              "text-text",
              "sm:text-3xl",
            )}
          >
            {title}
          </h1>

          {subtitle && (
            <p
              className={cx(
                "mt-2 max-w-2xl",
                "text-sm leading-6",
                "text-text-secondary",
                "sm:text-base sm:leading-7",
                "text-pretty",
              )}
            >
              {subtitle}
            </p>
          )}
        </div>
      )}

      {/* ======================================================
       * ACTIONS
       * ====================================================== */}

      {actions && (
        <div
          className={cx(
            "min-w-0",
            "flex shrink-0 items-center justify-end gap-2",
            "pt-0.5",
          )}
        >
          {actions}
        </div>
      )}
    </header>
  );
};

PageHeader.displayName = "PageHeader";

/* ============================================================
 * PAGE CONTAINER
 * ============================================================ */

export const PageContainer = ({
  children,
  title,
  subtitle,
  breadcrumb = [],
  actions,
  className = "",
}) => {
  const hasHeader = Boolean(title) || Boolean(actions);

  const safeBreadcrumb = Array.isArray(breadcrumb)
    ? breadcrumb.filter(
        (item) =>
          item &&
          typeof item.label === "string" &&
          item.label.trim().length > 0,
      )
    : [];

  const hasBreadcrumb = safeBreadcrumb.length > 0;

  return (
    <main
      className={cx(
        "page-container",
        "min-w-0",

        /* ======================================================
         * MINIMUM CONTENT HEIGHT
         * ====================================================== */

        "min-h-[calc(100svh-4rem)]",
        "sm:min-h-[calc(100svh-4.5rem)]",
        "lg:min-h-[calc(100svh-5rem)]",

        /* ======================================================
         * PAGE PADDING
         * ====================================================== */

        "py-5 sm:py-6 lg:py-8",

        className,
      )}
    >
      <div className="min-w-0">
        {/* ======================================================
         * BREADCRUMB
         * ====================================================== */}

        {hasBreadcrumb && <PageBreadcrumb items={safeBreadcrumb} />}

        {/* ======================================================
         * PAGE HEADER
         * ====================================================== */}

        {hasHeader && (
          <div className={cx(hasBreadcrumb && "mt-layout-header")}>
            <PageHeader title={title} subtitle={subtitle} actions={actions} />
          </div>
        )}

        {/* ======================================================
         * CONTENT
         * ====================================================== */}

        <div
          className={cx(
            "min-w-0",
            (hasHeader || hasBreadcrumb) && "mt-layout-section",
            "motion-safe:animate-fade-in-up",
          )}
        >
          {children}
        </div>
      </div>
    </main>
  );
};

PageContainer.displayName = "PageContainer";

export default PageContainer;
