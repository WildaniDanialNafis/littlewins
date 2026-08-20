import { memo } from "react";

const ReportFormSection = ({ eyebrow, title, description, children }) => {
  return (
    <section className="px-4 py-5 sm:px-6 sm:py-6">
      <div className="max-w-2xl">
        {eyebrow && (
          <p className="text-xs font-semibold uppercase tracking-[0.08em] text-primary">
            {eyebrow}
          </p>
        )}

        <h2 className="mt-1 text-lg font-bold tracking-tight text-text sm:text-xl">
          {title}
        </h2>

        {description && (
          <p className="mt-1 text-sm leading-5 text-muted">{description}</p>
        )}
      </div>

      <div className="mt-4">{children}</div>
    </section>
  );
};

ReportFormSection.displayName = "ReportFormSection";

export default memo(ReportFormSection);
