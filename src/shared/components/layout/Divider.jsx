import { cx } from "@/shared/utils/cx";

export const Divider = ({ className = "", orientation = "horizontal" }) => {
  const isVertical = orientation === "vertical";

  return (
    <div
      className={cx(
        isVertical ? "h-full w-px bg-border" : "h-px w-full bg-border",
        className,
      )}
      aria-hidden="true"
    />
  );
};

Divider.displayName = "Divider";

export default Divider;
