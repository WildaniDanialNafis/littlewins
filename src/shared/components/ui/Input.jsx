import { forwardRef, useState } from "react";

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

const FieldError = ({ id, error, show }) => {
  if (!error || !show) {
    return null;
  }

  return (
    <p id={id} role="alert" className="mt-1.5 text-xs text-danger">
      {error}
    </p>
  );
};

export const Input = forwardRef(
  ({ label, error, id, className = "", onBlur, ...props }, ref) => {
    const [touched, setTouched] = useState(false);

    const errorId = id ? `${id}-error` : undefined;

    const handleBlur = (event) => {
      setTouched(true);
      onBlur?.(event);
    };

    const showError = touched && Boolean(error);

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

        <input
          ref={ref}
          id={id}
          className={cx(
            getFieldClasses(showError ? error : undefined),
            className,
          )}
          aria-invalid={showError}
          aria-describedby={showError ? errorId : undefined}
          onBlur={handleBlur}
          {...props}
        />

        <FieldError id={errorId} error={error} show={showError} />
      </div>
    );
  },
);

Input.displayName = "Input";

export default Input;
