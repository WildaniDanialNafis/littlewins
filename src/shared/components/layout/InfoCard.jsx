import { cx } from "@/shared/utils/cx";

export const InfoCard = ({ label, value, className = "" }) => {
  return (
    <div
      className={cx(
        "min-w-0 rounded-xl",
        "border border-border",
        "bg-surface-muted/60",
        "px-3.5 py-3",
        "transition-colors duration-(--token-transition-fast)",
        className,
      )}
    >
      <p className="text-xs font-medium text-muted">{label}</p>

      <p className="mt-1 truncate text-sm font-semibold leading-snug text-text md:text-base">
        {value ?? "-"}
      </p>
    </div>
  );
};

InfoCard.displayName = "InfoCard";

export default InfoCard;
