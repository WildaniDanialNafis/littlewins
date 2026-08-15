import { cx } from "@/shared/utils/cx";

export const SectionTitle = ({
  eyebrow,
  title,
  description,
  icon,
  className = "",
}) => {
  return (
    <div className={cx("flex items-start gap-3", className)}>
      {icon && (
        <div
          className="mt-0.5 flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-primary-soft text-primary"
          aria-hidden="true"
        >
          {icon}
        </div>
      )}

      <div className="min-w-0">
        {eyebrow && (
          <p className="text-xs font-semibold uppercase tracking-wider text-primary">
            {eyebrow}
          </p>
        )}

        <h2
          className={cx(
            "text-lg font-bold text-text md:text-xl",
            eyebrow && "mt-1",
          )}
        >
          {title}
        </h2>

        {description && (
          <p className="mt-2 max-w-3xl text-sm leading-relaxed text-muted">
            {description}
          </p>
        )}
      </div>
    </div>
  );
};

SectionTitle.displayName = "SectionTitle";

export default SectionTitle;
