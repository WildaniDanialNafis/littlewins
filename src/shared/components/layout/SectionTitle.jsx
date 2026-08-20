import { cx } from "@/shared/utils/cx";

export const SectionTitle = ({
  eyebrow,
  title,
  description,
  icon,
  className = "",
}) => {
  return (
    <div className={cx("flex min-w-0 items-start gap-3", className)}>
      {icon && (
        <div
          className="mt-0.5 flex size-10 shrink-0 items-center justify-center rounded-xl bg-primary-soft text-primary"
          aria-hidden="true"
        >
          {icon}
        </div>
      )}

      <div className="min-w-0">
        {eyebrow && (
          <p className="text-xs font-semibold uppercase tracking-[0.08em] text-primary">
            {eyebrow}
          </p>
        )}

        <h2
          className={cx(
            "wrap-break-word text-lg font-bold tracking-tight text-text md:text-xl",
            eyebrow && "mt-1",
          )}
        >
          {title}
        </h2>

        {description && (
          <p className="mt-1.5 max-w-3xl text-sm leading-6 text-muted sm:mt-2">
            {description}
          </p>
        )}
      </div>
    </div>
  );
};

SectionTitle.displayName = "SectionTitle";

export default SectionTitle;
