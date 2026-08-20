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
        "overflow-hidden rounded-2xl",
        "border border-border",
        "bg-surface",
        "shadow-sm",
        "transition-[border-color,box-shadow]",
        "duration-(--token-transition-base)",
        className,
      )}
    >
      {hasTitle && (
        <>
          <div className="px-4 py-3.5 sm:px-5">
            <h3 className="text-sm font-semibold tracking-tight text-text md:text-base">
              {title}
            </h3>
          </div>

          <div className="h-px w-full bg-border" />
        </>
      )}

      <div className={cx("p-4 sm:p-5", contentClassName)}>{children}</div>
    </section>
  );
};

ContentBlock.displayName = "ContentBlock";

export default ContentBlock;
