import { cx } from "@/shared/utils/cx";

import Button from "./Button";
import EmptyState from "./EmptyState";

export const ErrorState = ({
  error,
  onRetry,
  className = "",
  title = "Gagal memuat data",
}) => {
  const message =
    error instanceof Error
      ? error.message
      : "Terjadi kesalahan saat memuat data.";

  return (
    <div
      className={cx(
        "rounded-xl border border-border bg-surface px-5 py-12 text-center shadow-sm",
        "sm:px-8",
        className,
      )}
      role="alert"
    >
      <EmptyState
        title={title}
        description={message}
        action={
          onRetry ? (
            <Button
              type="button"
              variant="primary"
              size="sm"
              className="mt-4 px-5"
              onClick={onRetry}
            >
              Coba lagi
            </Button>
          ) : null
        }
      />
    </div>
  );
};

ErrorState.displayName = "ErrorState";

export default ErrorState;
