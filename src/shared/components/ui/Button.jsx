import { Spinner } from "./Spinner";

const VARIANTS = {
  primary:
    "bg-primary text-primary-foreground hover:bg-primary-hover focus-visible:ring-primary/30",

  primarySoft:
    "bg-primary-soft text-primary hover:bg-primary-soft-hover active:bg-primary-soft-hover focus-visible:ring-primary/30",

  infoSoft:
    "bg-info-soft text-info hover:bg-info-soft-hover active:bg-info-soft-hover focus-visible:ring-info/30",

  dangerSoft:
    "bg-danger-soft text-danger hover:bg-danger-soft-hover active:bg-danger-soft-hover focus-visible:ring-danger/30",

  outline:
    "border border-border bg-transparent text-text hover:border-primary/30 hover:bg-surface-muted active:bg-surface-muted focus-visible:ring-primary/30",

  secondary:
    "border border-border bg-surface text-text hover:border-primary/30 hover:bg-surface-muted active:bg-surface-muted focus-visible:ring-primary/30",

  preview:
    "bg-info-soft text-info hover:bg-info-soft-hover active:bg-info-soft-hover focus-visible:ring-info/30",

  edit: "bg-info-soft text-info hover:bg-info-soft-hover active:bg-info-soft-hover focus-visible:ring-info/30",

  danger:
    "bg-danger text-danger-foreground font-semibold hover:bg-danger-hover active:bg-danger-active focus-visible:ring-danger/30",

  ghost:
    "border border-transparent bg-transparent text-muted hover:bg-surface-muted hover:text-text active:bg-surface-muted focus-visible:ring-primary/30",

  pagination:
    "border border-border bg-surface text-text hover:border-primary/30 hover:bg-surface-muted active:bg-surface-muted focus-visible:ring-primary/30",

  paginationActive:
    "bg-primary text-primary-foreground font-semibold hover:bg-primary-hover active:bg-primary-active focus-visible:ring-primary/30",
};

const SIZES = {
  sm: "min-h-9 min-w-9 px-3 py-2 text-sm",
  md: "min-h-10 min-w-10 px-4 py-2.5 text-sm",
  lg: "min-h-11 min-w-11 px-5 py-3 text-base",
  icon: "size-10 p-0",
};

export const Button = ({
  as: Component = "button",
  variant = "primary",
  size = "md",
  type,
  children,
  className = "",
  fullWidth = false,
  loading = false,
  disabled = false,
  ...props
}) => {
  const isDisabled = disabled || loading;

  const isNativeButton = Component === "button";

  const resolvedType = isNativeButton ? (type ?? "button") : undefined;

  return (
    <Component
      {...props}
      {...(resolvedType ? { type: resolvedType } : {})}
      {...(isDisabled ? { "aria-disabled": true } : {})}
      {...(loading ? { "aria-busy": true } : {})}
      className={[
        "inline-flex shrink-0 items-center justify-center",
        "gap-2 rounded-xl",
        "font-medium text-sm leading-none",
        "select-none",
        "transition-[background-color,border-color,color,box-shadow,opacity]",
        "duration-(--token-transition-fast)",
        "ease-out",
        "focus-visible:outline-none",
        "focus-visible:ring-2",
        "focus-visible:ring-offset-2",
        "focus-visible:ring-offset-background",
        "disabled:pointer-events-none",
        "disabled:cursor-not-allowed",
        "disabled:opacity-50",
        VARIANTS[variant] ?? VARIANTS.primary,
        SIZES[size] ?? SIZES.md,
        fullWidth && "w-full",
        isDisabled && "pointer-events-none opacity-50",
        className,
      ]
        .filter(Boolean)
        .join(" ")}
    >
      {loading && <Spinner size="sm" className="shrink-0" aria-hidden="true" />}

      {children}
    </Component>
  );
};

Button.displayName = "Button";

export default Button;
