import { cx } from "@/shared/utils/cx";

import Spinner from "./Spinner";

export const LoadingState = ({
  message = "Memuat data...",
  className = "",
}) => {
  return (
    <div
      className={cx(
        "rounded-2xl bg-surface",
        "px-5 py-12 text-center",
        "sm:px-8 sm:py-14",
        className,
      )}
      aria-busy="true"
      aria-live="polite"
    >
      <Spinner size="md" className="mx-auto" aria-hidden="true" />

      <p className="mt-4 text-sm text-muted">{message}</p>
    </div>
  );
};

LoadingState.displayName = "LoadingState";

export default LoadingState;
