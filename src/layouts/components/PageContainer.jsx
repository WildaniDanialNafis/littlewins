import { Link } from "react-router-dom";

import { cx } from "@/shared/utils";

export const PageContainer = ({
  children,
  title,
  subtitle,
  breadcrumb = [],
  actions,
  className = "",
}) => {
  const hasHeader = Boolean(title) || Boolean(actions);

  return (
    <div className={cx("w-full space-y-6", className)}>
      <header className="space-y-4">
        {breadcrumb.length > 0 && (
          <nav aria-label="Breadcrumb" className="text-sm text-muted">
            <ol className="flex flex-wrap items-center gap-2">
              {breadcrumb.map((item, index) => {
                const isLast = index === breadcrumb.length - 1;

                const key = item.path
                  ? `${item.path}-${item.label}`
                  : `${index}-${item.label}`;

                return (
                  <li key={key} className="flex items-center gap-2">
                    {isLast ? (
                      <span
                        aria-current="page"
                        className="font-medium text-text"
                      >
                        {item.label}
                      </span>
                    ) : (
                      <>
                        {item.path ? (
                          <Link
                            to={item.path}
                            className="rounded-sm transition-colors hover:text-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/30 focus-visible:ring-offset-2 focus-visible:ring-offset-background"
                          >
                            {item.label}
                          </Link>
                        ) : (
                          <span>{item.label}</span>
                        )}

                        <span
                          aria-hidden="true"
                          className="select-none text-muted/60"
                        >
                          /
                        </span>
                      </>
                    )}
                  </li>
                );
              })}
            </ol>
          </nav>
        )}

        {hasHeader && (
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            {title && (
              <div className="min-w-0">
                <h1 className="text-2xl font-bold leading-tight tracking-tight text-text md:text-3xl">
                  {title}
                </h1>

                {subtitle && (
                  <p className="mt-1 max-w-2xl text-sm leading-relaxed text-text-secondary">
                    {subtitle}
                  </p>
                )}
              </div>
            )}

            {actions && (
              <div className="flex shrink-0 flex-wrap items-center gap-2">
                {actions}
              </div>
            )}
          </div>
        )}
      </header>

      <div className="w-full animate-fade-in-up">{children}</div>
    </div>
  );
};

PageContainer.displayName = "PageContainer";

export default PageContainer;
