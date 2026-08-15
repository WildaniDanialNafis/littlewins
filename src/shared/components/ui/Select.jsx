// src/shared/components/ui/Select.jsx

import { forwardRef, useCallback, useEffect, useRef, useState } from "react";

import { cx } from "@/shared/utils/cx";

const ChevronDownIcon = ({ className = "" }) => {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      className={cx("h-4 w-4 shrink-0", className)}
      aria-hidden="true"
    >
      <path d="m6 9 6 6 6-6" />
    </svg>
  );
};

ChevronDownIcon.displayName = "ChevronDownIcon";

const CheckIcon = ({ className = "" }) => {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2.5"
      className={cx("h-3.5 w-3.5 shrink-0", className)}
      aria-hidden="true"
    >
      <path d="m5 12 4 4L19 6" />
    </svg>
  );
};

CheckIcon.displayName = "CheckIcon";

const getFieldClasses = (error, isOpen) => {
  return cx(
    "w-full rounded-xl border bg-surface px-3.5 py-2.5 text-sm text-text",
    "transition-colors duration-[var(--token-transition-fast)]",
    "placeholder:text-placeholder",
    "focus:outline-none focus:ring-2",
    "disabled:cursor-not-allowed disabled:opacity-60",
    error
      ? "border-danger focus:border-danger focus:ring-danger/20"
      : isOpen
        ? "border-primary focus:border-primary focus:ring-primary/20"
        : "border-border focus:border-primary focus:ring-primary/20",
  );
};

const FieldError = ({ id, error, show = false }) => {
  if (!error || !show) {
    return null;
  }

  return (
    <p id={id} role="alert" className="mt-1.5 text-xs text-danger">
      {error}
    </p>
  );
};

export const Select = forwardRef(
  (
    {
      label,
      options = [],
      value,
      onChange,
      placeholder = "Pilih...",
      required = false,
      disabled = false,
      error,
      id,
      className = "",
      loading = false,
      loadingText = "Memuat...",
      ...props
    },
    ref,
  ) => {
    const [isOpen, setIsOpen] = useState(false);
    const [searchQuery, setSearchQuery] = useState("");
    const [highlightedIndex, setHighlightedIndex] = useState(-1);
    const [touched, setTouched] = useState(false);

    const containerRef = useRef(null);
    const inputRef = useRef(null);
    const listboxRef = useRef(null);

    const isDisabled = disabled || loading;
    const errorId = id ? `${id}-error` : undefined;
    const listboxId = id ? `${id}-listbox` : undefined;

    const selectedOption = options.find(
      (option) => String(option.value) === String(value),
    );

    const selectedLabel = selectedOption?.label ?? "";

    const filteredOptions = options.filter((option) =>
      String(option.label).toLowerCase().includes(searchQuery.toLowerCase()),
    );

    const showError = touched && Boolean(error);

    const handleClose = useCallback(() => {
      setIsOpen(false);
      setHighlightedIndex(-1);
    }, []);

    const handleFocus = () => {
      if (isDisabled) {
        return;
      }

      setIsOpen(true);
    };

    const handleBlur = () => {
      setTouched(true);

      window.setTimeout(() => {
        handleClose();
      }, 200);
    };

    const handleSelect = (selectedValue) => {
      const selected = options.find(
        (option) => String(option.value) === String(selectedValue),
      );

      onChange?.(selectedValue);
      setSearchQuery(selected?.label ?? "");
      handleClose();

      inputRef.current?.focus();
    };

    const handleInputChange = (event) => {
      setSearchQuery(event.target.value);
      setIsOpen(true);
      setHighlightedIndex(-1);
    };

    const handleKeyDown = (event) => {
      if (event.key === "Escape") {
        event.preventDefault();
        handleClose();
        inputRef.current?.blur();
        return;
      }

      if (event.key === "ArrowDown") {
        event.preventDefault();

        if (!isOpen) {
          setIsOpen(true);
          return;
        }

        setHighlightedIndex((current) =>
          current < filteredOptions.length - 1 ? current + 1 : current,
        );

        return;
      }

      if (event.key === "ArrowUp") {
        event.preventDefault();

        if (!isOpen) {
          setIsOpen(true);
          return;
        }

        setHighlightedIndex((current) => (current > 0 ? current - 1 : -1));

        return;
      }

      if (event.key === "Enter" && isOpen && highlightedIndex >= 0) {
        event.preventDefault();

        const selected = filteredOptions[highlightedIndex];

        if (selected) {
          handleSelect(selected.value);
        }

        return;
      }
    };

    const handleToggle = () => {
      if (isDisabled) {
        return;
      }

      setIsOpen((current) => {
        const next = !current;

        if (next) {
          window.requestAnimationFrame(() => {
            inputRef.current?.focus();
          });
        }

        return next;
      });
    };

    useEffect(() => {
      const handleClickOutside = (event) => {
        if (!containerRef.current) {
          return;
        }

        if (!containerRef.current.contains(event.target)) {
          handleClose();
          setSearchQuery(selectedLabel);
        }
      };

      document.addEventListener("mousedown", handleClickOutside);

      return () => {
        document.removeEventListener("mousedown", handleClickOutside);
      };
    }, [handleClose, selectedLabel]);

    useEffect(() => {
      if (!isOpen) {
        setSearchQuery(selectedLabel);
      }
    }, [isOpen, selectedLabel]);

    useEffect(() => {
      if (highlightedIndex < 0 || !listboxRef.current) {
        return;
      }

      const item = listboxRef.current.children[highlightedIndex];

      item?.scrollIntoView({
        block: "nearest",
      });
    }, [highlightedIndex]);

    return (
      <div ref={containerRef} className={cx("w-full", className)}>
        {label && (
          <label
            htmlFor={id}
            className="mb-1.5 block text-sm font-medium text-text"
          >
            {label}

            {required && (
              <span className="ml-1 text-danger" aria-hidden="true">
                *
              </span>
            )}
          </label>
        )}

        <div className="relative">
          <div className="relative">
            <input
              ref={(node) => {
                inputRef.current = node;

                if (typeof ref === "function") {
                  ref(node);
                } else if (ref) {
                  ref.current = node;
                }
              }}
              id={id}
              type="text"
              value={searchQuery}
              onChange={handleInputChange}
              onFocus={handleFocus}
              onBlur={handleBlur}
              onKeyDown={handleKeyDown}
              placeholder={loading ? loadingText : placeholder}
              disabled={isDisabled}
              className={cx(
                getFieldClasses(showError ? error : undefined, isOpen),
                "pr-10",
                "cursor-text",
              )}
              aria-autocomplete="list"
              aria-expanded={isOpen}
              aria-controls={isOpen ? listboxId : undefined}
              aria-activedescendant={
                highlightedIndex >= 0 && id
                  ? `${id}-option-${highlightedIndex}`
                  : undefined
              }
              aria-invalid={showError}
              aria-describedby={showError ? errorId : undefined}
              role="combobox"
              {...props}
            />

            <button
              type="button"
              onClick={handleToggle}
              disabled={isDisabled}
              className={cx(
                "absolute inset-y-0 right-0 flex items-center pr-3",
                "text-muted transition-colors",
                "hover:text-text",
                "focus-visible:outline-none focus-visible:ring-2",
                "focus-visible:ring-primary/30",
                "disabled:cursor-not-allowed disabled:opacity-50",
              )}
              aria-label={isOpen ? "Sembunyikan pilihan" : "Tampilkan pilihan"}
              tabIndex={-1}
            >
              <ChevronDownIcon
                className={cx(
                  "transition-transform duration-(--token-transition-fast)",
                  isOpen && "rotate-180",
                )}
              />
            </button>
          </div>

          {isOpen && (
            <ul
              id={listboxId}
              ref={listboxRef}
              className={[
                "absolute z-50 mt-1 max-h-60 w-full overflow-auto",
                "rounded-xl border border-border bg-surface shadow-lg",
              ].join(" ")}
              role="listbox"
              aria-label={label}
            >
              {loading ? (
                <li
                  className="px-3.5 py-2.5 text-sm text-muted"
                  role="option"
                  aria-disabled="true"
                >
                  {loadingText}
                </li>
              ) : filteredOptions.length === 0 ? (
                <li
                  className="px-3.5 py-2.5 text-sm text-muted"
                  role="option"
                  aria-disabled="true"
                >
                  Tidak ada pilihan
                </li>
              ) : (
                filteredOptions.map((option, index) => {
                  const isSelected = String(option.value) === String(value);

                  const isHighlighted = index === highlightedIndex;

                  return (
                    <li
                      key={option.value}
                      id={`${id}-option-${index}`}
                      role="option"
                      aria-selected={isSelected}
                      className={cx(
                        "flex cursor-pointer items-center justify-between",
                        "px-3.5 py-2.5 text-sm text-text",
                        "transition-colors duration-(--token-transition-fast)",
                        "hover:bg-surface-muted",
                        isHighlighted && "bg-surface-muted",
                        isSelected && "bg-primary-soft text-primary",
                      )}
                      onClick={() => handleSelect(option.value)}
                      onMouseEnter={() => setHighlightedIndex(index)}
                    >
                      <span>{option.label}</span>

                      {isSelected && <CheckIcon className="h-4 w-4 shrink-0" />}
                    </li>
                  );
                })
              )}
            </ul>
          )}
        </div>

        <FieldError id={errorId} error={error} show={showError} />
      </div>
    );
  },
);

Select.displayName = "Select";

export default Select;
