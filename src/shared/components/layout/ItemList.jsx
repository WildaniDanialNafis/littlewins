import { cx } from "@/shared/utils/cx";

const CheckIcon = () => {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2.5"
      className="size-3.5 shrink-0"
      aria-hidden="true"
    >
      <path d="m5 12 4 4L19 6" />
    </svg>
  );
};

CheckIcon.displayName = "CheckIcon";

export const ItemList = ({
  items = [],
  emptyText = "Tidak ada data.",
  className = "",
}) => {
  if (items.length === 0) {
    return (
      <div
        className={cx(
          "rounded-xl border border-dashed border-border",
          "bg-surface-muted/40",
          "px-4 py-4",
          className,
        )}
      >
        <p className="text-sm leading-relaxed text-muted">{emptyText}</p>
      </div>
    );
  }

  return (
    <ul className={cx("divide-y divide-border", className)} role="list">
      {items.map((item, index) => (
        <li
          key={`${String(item)}-${index}`}
          className="flex items-start gap-3 py-3 first:pt-0 last:pb-0"
        >
          <span
            className="mt-0.5 flex size-5 shrink-0 items-center justify-center rounded-full bg-primary-soft text-primary"
            aria-hidden="true"
          >
            <CheckIcon />
          </span>

          <span className="min-w-0 text-sm leading-relaxed text-text md:text-base">
            {item}
          </span>
        </li>
      ))}
    </ul>
  );
};

ItemList.displayName = "ItemList";

export default ItemList;
