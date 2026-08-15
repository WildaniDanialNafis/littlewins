import { useState } from "react";

import { cx } from "@/shared/utils/cx";

const STAR_SIZES = {
  sm: "h-4 w-4",
  md: "h-6 w-6",
  lg: "h-8 w-8",
};

const StarIcon = ({ filled, size = "md" }) => {
  return (
    <svg
      className={cx(
        STAR_SIZES[size] ?? STAR_SIZES.md,
        filled ? "fill-warning text-warning" : "fill-muted/40 text-muted/40",
        "transition-colors duration-(--token-transition-fast)",
      )}
      viewBox="0 0 24 24"
      stroke="none"
      aria-hidden="true"
    >
      <path d="M12 17.27L18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z" />
    </svg>
  );
};

export const StarRating = ({
  rating = 0,
  onChange,
  readonly = false,
  size = "md",
  className = "",
}) => {
  const [hovered, setHovered] = useState(0);

  const numericRating = Number(rating) || 0;
  const displayRating = hovered || numericRating;

  const handleChange = (value) => {
    if (!readonly) {
      onChange?.(value);
    }
  };

  const handleKeyDown = (event, value) => {
    if (event.key === "Enter" || event.key === " ") {
      event.preventDefault();
      handleChange(value);
    }
  };

  return (
    <div
      className={cx("flex items-center gap-0.5", className)}
      role="radiogroup"
      aria-label="Rating"
      onMouseLeave={() => {
        if (!readonly) {
          setHovered(0);
        }
      }}
    >
      {[1, 2, 3, 4, 5].map((star) => {
        const isFilled = star <= displayRating;
        const isSelected = star === numericRating;

        return (
          <button
            key={star}
            type="button"
            role="radio"
            aria-checked={isSelected}
            aria-label={`${star} bintang`}
            disabled={readonly}
            tabIndex={isSelected || (!numericRating && star === 1) ? 0 : -1}
            onClick={() => handleChange(star)}
            onKeyDown={(event) => handleKeyDown(event, star)}
            onMouseEnter={() => {
              if (!readonly) {
                setHovered(star);
              }
            }}
            className={cx(
              "rounded-sm transition-transform",
              "focus-visible:outline-none focus-visible:ring-2",
              "focus-visible:ring-primary/30 focus-visible:ring-offset-2",
              "focus-visible:ring-offset-background",
              !readonly && "cursor-pointer hover:scale-110",
              readonly && "cursor-default",
            )}
          >
            <StarIcon filled={isFilled} size={size} />
          </button>
        );
      })}
    </div>
  );
};

StarRating.displayName = "StarRating";

export default StarRating;
