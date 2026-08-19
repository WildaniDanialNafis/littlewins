import { forwardRef } from "react";

import { cx } from "@/shared/utils/cx";

const getFieldClasses = (error) =>
  cx(
    "w-full rounded-xl border bg-surface px-3.5 py-2.5 text-sm text-text",
    "transition-colors duration-(--token-transition-fast)",
    "placeholder:text-placeholder",
    "focus:outline-none focus:ring-2",
    "disabled:cursor-not-allowed disabled:opacity-60",
    error
      ? "border-danger focus:border-danger focus:ring-danger/20"
      : "border-border focus:border-primary focus:ring-primary/20",
  );

const FieldError = ({ id, error }) => {
  if (!error) {
    return null;
  }

  return (
    <p id={id} role="alert" className="mt-1.5 text-xs text-danger">
      {error}
    </p>
  );
};

export const Textarea = forwardRef(
  ({ label, error, id, className = "", onBlur, ...props }, ref) => {
    const errorId = id ? `${id}-error` : undefined;

    return (
      <div className="w-full">
        {label && (
          <label
            htmlFor={id}
            className="mb-1.5 block text-sm font-medium text-text"
          >
            {label}

            {props.required && (
              <span className="ml-1 text-danger" aria-hidden="true">
                *
              </span>
            )}
          </label>
        )}

        <textarea
          ref={ref}
          id={id}
          className={cx(
            getFieldClasses(Boolean(error)),
            "resize-y leading-relaxed",
            className,
          )}
          aria-invalid={Boolean(error)}
          aria-describedby={error ? errorId : undefined}
          onBlur={onBlur}
          {...props}
        />

        <FieldError id={errorId} error={error} />
      </div>
    );
  },
);

Textarea.displayName = "Textarea";

export default Textarea;
