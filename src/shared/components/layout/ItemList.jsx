import { cx } from "@/shared/utils/cx";

const CheckIcon = () => {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2.5"
      className="h-3.5 w-3.5 shrink-0"
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
      <p className={cx("text-sm leading-relaxed text-muted", className)}>
        {emptyText}
      </p>
    );
  }

  return (
    <ul className={cx("space-y-3", className)} role="list">
      {items.map((item, index) => (
        <li
          key={`${String(item)}-${index}`}
          className="flex items-start gap-3 text-sm leading-relaxed text-text md:text-base"
        >
          <span
            className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-primary-soft text-primary"
            aria-hidden="true"
          >
            <CheckIcon />
          </span>

          <span>{item}</span>
        </li>
      ))}
    </ul>
  );
};

ItemList.displayName = "ItemList";

export default ItemList;
