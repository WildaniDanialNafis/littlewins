import { cx } from "@/shared/utils/cx";

const SIZES = {
  sm: "h-3",
  md: "h-4",
  lg: "h-5",
  xl: "h-6",
};

const WIDTHS = {
  full: "w-full",
  "3/4": "w-3/4",
  "2/3": "w-2/3",
  "1/2": "w-1/2",
  "1/3": "w-1/3",
  "1/4": "w-1/4",
  auto: "w-auto",
};

export const Skeleton = ({
  size = "md",
  width = "full",
  rounded = "rounded-md",
  className = "",
  ...props
}) => {
  return (
    <span
      className={cx(
        "inline-block shrink-0",
        "bg-skeleton",
        "animate-pulse motion-reduce:animate-none",
        SIZES[size] ?? SIZES.md,
        WIDTHS[width] ?? WIDTHS.full,
        rounded,
        className,
      )}
      aria-hidden="true"
      {...props}
    />
  );
};

Skeleton.displayName = "Skeleton";

export default Skeleton;
