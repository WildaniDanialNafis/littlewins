import { useId, useState } from "react";

import { cx } from "@/shared/utils/cx";

const STAR_VALUES = [1, 2, 3, 4, 5];

const STAR_SIZES = {
  sm: "size-4",
  md: "size-6",
  lg: "size-8",
};

const normalizeRating = (value) => {
  const numericValue = Number(value);

  if (!Number.isFinite(numericValue)) {
    return 0;
  }

  return Math.min(5, Math.max(0, Math.round(numericValue)));
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
  label = "Rating",
}) => {
  const groupId = useId();

  const [hovered, setHovered] = useState(0);

  const numericRating = normalizeRating(rating);

  const displayRating = hovered || numericRating;

  const handleChange = (value) => {
    if (readonly) {
      return;
    }

    onChange?.(value);
  };

  const handleKeyDown = (event, value) => {
    if (event.key === "Enter" || event.key === " ") {
      event.preventDefault();
      handleChange(value);
    }
  };

  const handleGroupKeyDown = (event) => {
    if (readonly) {
      return;
    }

    if (event.key !== "ArrowLeft" && event.key !== "ArrowRight") {
      return;
    }

    event.preventDefault();

    const current = numericRating || 1;

    const next =
      event.key === "ArrowRight"
        ? Math.min(current + 1, 5)
        : Math.max(current - 1, 1);

    handleChange(next);
  };

  return (
    <div
      className={cx("flex items-center gap-0.5", className)}
      role="radiogroup"
      aria-label={label}
      onMouseLeave={() => {
        if (!readonly) {
          setHovered(0);
        }
      }}
      onKeyDown={handleGroupKeyDown}
    >
      {STAR_VALUES.map((star) => {
        const isFilled = star <= displayRating;

        const isSelected = star === numericRating;

        return (
          <button
            key={`${groupId}-${star}`}
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
              "rounded-sm",
              "transition-transform",
              "focus-visible:outline-none",
              "focus-visible:ring-2",
              "focus-visible:ring-primary/30",
              "focus-visible:ring-offset-2",
              "focus-visible:ring-offset-background",
              "disabled:cursor-default",
              "disabled:opacity-100",
              !readonly && "cursor-pointer hover:scale-110",
              readonly && "cursor-default",
              "motion-reduce:transition-none",
              "motion-reduce:hover:scale-100",
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
