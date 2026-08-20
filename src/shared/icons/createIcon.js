import { cx } from "@/shared/utils";

export const createIcon = (
  displayName,
  paths,
  defaultClassName = "h-5 w-5",
  defaultStrokeWidth = "2",
) => {
  const Icon = ({
    className = defaultClassName,
    "aria-label": ariaLabel,
    strokeWidth = defaultStrokeWidth,
    ...props
  }) => {
    const isDecorative = !ariaLabel;

    return (
      <svg
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth={strokeWidth}
        strokeLinecap="round"
        strokeLinejoin="round"
        className={cx("shrink-0", className)}
        aria-hidden={isDecorative ? "true" : undefined}
        aria-label={ariaLabel}
        {...props}
      >
        {paths}
      </svg>
    );
  };

  Icon.displayName = displayName;

  return Icon;
};
