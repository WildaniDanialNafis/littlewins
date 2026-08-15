import { cx } from "@/shared/utils/cx";

export const InfoCard = ({ label, value, className = "" }) => {
  return (
    <div className={cx("rounded-xl bg-surface-muted px-4 py-3.5", className)}>
      <p className="text-xs font-medium text-muted">{label}</p>

      <p className="mt-1 text-sm font-semibold leading-snug text-text md:text-base">
        {value ?? "-"}
      </p>
    </div>
  );
};

InfoCard.displayName = "InfoCard";

export default InfoCard;
