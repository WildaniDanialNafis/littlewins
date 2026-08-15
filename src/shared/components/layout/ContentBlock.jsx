import { cx } from "@/shared/utils/cx";

const ContentBlock = ({
  title,
  children,
  className = "",
  contentClassName = "",
}) => {
  const hasTitle = Boolean(title);

  return (
    <section
      className={cx(
        "rounded-xl border border-border bg-surface shadow-sm",
        "p-4 md:p-5",
        "transition-colors duration-(--token-transition-base)",
        className,
      )}
    >
      {hasTitle && (
        <h3 className="text-sm font-semibold text-text md:text-base">
          {title}
        </h3>
      )}

      <div className={cx(hasTitle && "mt-4", contentClassName)}>{children}</div>
    </section>
  );
};

ContentBlock.displayName = "ContentBlock";

export default ContentBlock;
