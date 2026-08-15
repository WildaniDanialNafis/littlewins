import { cx } from "@/shared/utils/cx";

export const EmptyState = ({
  title,
  description,
  icon,
  action,
  className = "",
}) => {
  return (
    <div
      className={cx(
        "flex flex-col items-center justify-center px-4 py-12 text-center",
        "sm:px-6 sm:py-16 lg:py-20",
        className,
      )}
      role="status"
      aria-label={title}
    >
      {icon && (
        <div
          className={cx(
            "mb-4 flex h-16 w-16 items-center justify-center rounded-full",
            "bg-primary-soft text-primary",
            "transition-colors duration-(--token-transition-base)",
          )}
          aria-hidden="true"
        >
          {icon}
        </div>
      )}

      <h3 className="text-lg font-semibold text-text">{title}</h3>

      {description && (
        <p className="mt-1 max-w-sm text-sm leading-relaxed text-muted">
          {description}
        </p>
      )}

      {action && (
        <div className="mt-4 flex items-center justify-center gap-2">
          {action}
        </div>
      )}
    </div>
  );
};

EmptyState.displayName = "EmptyState";

export default EmptyState;
