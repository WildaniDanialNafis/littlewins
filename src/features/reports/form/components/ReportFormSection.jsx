import { memo } from "react";

const ReportFormSection = ({ eyebrow, title, description, children }) => {
  return (
    <section className="border-b border-border px-5 py-7 last:border-b-0 sm:px-7 sm:py-8">
      <div className="max-w-2xl">
        {eyebrow && (
          <p className="text-xs font-semibold uppercase tracking-wide text-primary">
            {eyebrow}
          </p>
        )}

        <h2 className="mt-1 text-lg font-semibold tracking-tight text-text sm:text-xl">
          {title}
        </h2>

        {description && (
          <p className="mt-1.5 text-sm leading-6 text-muted">{description}</p>
        )}
      </div>

      <div className="mt-6">{children}</div>
    </section>
  );
};

ReportFormSection.displayName = "ReportFormSection";

export default memo(ReportFormSection);
