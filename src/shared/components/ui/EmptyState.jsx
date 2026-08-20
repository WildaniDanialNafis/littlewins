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
        "flex flex-col items-center justify-center",
        "px-4 py-10 text-center",
        "sm:px-6 sm:py-14",
        className,
      )}
      role="status"
      aria-label={title}
    >
      {icon && (
        <div
          className="mb-4 flex size-14 items-center justify-center rounded-2xl bg-primary-soft text-primary"
          aria-hidden="true"
        >
          {icon}
        </div>
      )}

      <h3 className="text-base font-semibold tracking-tight text-text sm:text-lg">
        {title}
      </h3>

      {description && (
        <p className="mt-1.5 max-w-sm text-sm leading-6 text-muted">
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
