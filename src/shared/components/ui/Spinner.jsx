import { cx } from "@/shared/utils/cx";

const SIZES = {
  sm: "h-4 w-4 border-2",
  md: "h-6 w-6 border-2",
  lg: "h-10 w-10 border-[3px]",
};

export const Spinner = ({ size = "md", className = "", ...props }) => {
  return (
    <span
      className={cx(
        "inline-block shrink-0 rounded-full border-solid",
        "border-border border-t-primary",
        "animate-spin motion-reduce:animate-none",
        SIZES[size] ?? SIZES.md,
        className,
      )}
      role="status"
      aria-label="Memuat"
      {...props}
    />
  );
};

Spinner.displayName = "Spinner";

export default Spinner;
