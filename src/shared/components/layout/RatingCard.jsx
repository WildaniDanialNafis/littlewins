import { cx } from "@/shared/utils/cx";

import StarRating from "../ui/StarRating";

export const RatingCard = ({ label, rating, className = "" }) => {
  const value = Math.min(5, Math.max(0, Number(rating) || 0));

  return (
    <div
      className={cx(
        "flex items-center justify-between gap-4",
        "rounded-xl bg-surface-muted px-4 py-3.5",
        className,
      )}
    >
      <span className="min-w-0 text-sm font-medium text-text">{label}</span>

      <div className="flex shrink-0 items-center gap-2">
        <StarRating rating={value} readonly size="sm" />

        <span className="text-xs font-semibold text-muted">{value}/5</span>
      </div>
    </div>
  );
};

RatingCard.displayName = "RatingCard";

export default RatingCard;
