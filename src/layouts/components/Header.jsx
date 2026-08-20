import { useCallback, useEffect, useRef, useState } from "react";

import { Link, NavLink } from "react-router-dom";

import { Button } from "@/shared/components/ui";

import { ROUTES } from "@/shared/constants";

import { useAuth } from "@/shared/hooks";

import { LogoIcon } from "@/shared/icons";

import { cx } from "@/shared/utils";

/* ============================================================
 * CONSTANTS
 * ============================================================ */

const MOBILE_BREAKPOINT = "(min-width: 768px)";

const HEADER_HEIGHT_CLASS = "h-16 sm:h-18";

const MOBILE_MENU_TOP_CLASS = "top-16 sm:top-18";

const MOBILE_MENU_HEIGHT_CLASS =
  "max-h-[calc(100dvh-4rem)] sm:max-h-[calc(100dvh-4.5rem)]";

/* ============================================================
 * ICONS
 * ============================================================ */

const LogoutIcon = () => (
  <svg
    className="size-5 shrink-0"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    aria-hidden="true"
  >
    <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
    <path d="m16 17 5-5-5-5" />
    <path d="M21 12H9" />
  </svg>
);

LogoutIcon.displayName = "LogoutIcon";

const WarningIcon = () => (
  <svg
    className="size-6"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    aria-hidden="true"
  >
    <path d="M10.3 3.7 2.4 17a2 2 0 0 0 1.7 3h15.8a2 2 0 0 0 1.7-3L13.7 3.7a2 2 0 0 0-3.4 0Z" />
    <path d="M12 9v4" />
    <path d="M12 17h.01" />
  </svg>
);

WarningIcon.displayName = "WarningIcon";

const HamburgerIcon = ({ open }) => (
  <span
    className="relative flex size-5 items-center justify-center"
    aria-hidden="true"
  >
    <span
      className={cx(
        "absolute h-0.5 w-5 rounded-full bg-current",
        "transition-transform duration-200",
        open ? "rotate-45" : "-translate-y-1.5",
      )}
    />

    <span
      className={cx(
        "absolute h-0.5 w-5 rounded-full bg-current",
        "transition-opacity duration-150",
        open ? "opacity-0" : "opacity-100",
      )}
    />

    <span
      className={cx(
        "absolute h-0.5 w-5 rounded-full bg-current",
        "transition-transform duration-200",
        open ? "-rotate-45" : "translate-y-1.5",
      )}
    />
  </span>
);

HamburgerIcon.displayName = "HamburgerIcon";

const ChevronIcon = () => (
  <svg
    className="size-4 shrink-0 text-muted"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    aria-hidden="true"
  >
    <path d="m9 18 6-6-6-6" />
  </svg>
);

ChevronIcon.displayName = "ChevronIcon";

/* ============================================================
 * CONFIRM DIALOG
 * ============================================================ */

const ConfirmDialog = ({
  open,
  title = "Konfirmasi",
  description = "",
  confirmLabel = "Konfirmasi",
  cancelLabel = "Batal",
  onConfirm,
  onCancel,
  loading = false,
}) => {
  const cancelButtonRef = useRef(null);
  const confirmButtonRef = useRef(null);

  /* ==========================================================
   * BODY SCROLL LOCK
   * ========================================================== */

  useEffect(() => {
    if (!open) {
      return undefined;
    }

    const previousOverflow = document.documentElement.style.overflow;

    document.documentElement.style.overflow = "hidden";

    return () => {
      document.documentElement.style.overflow = previousOverflow;
    };
  }, [open]);

  /* ==========================================================
   * ESCAPE
   * ========================================================== */

  useEffect(() => {
    if (!open || loading) {
      return undefined;
    }

    const handleKeyDown = (event) => {
      if (event.key !== "Escape") {
        return;
      }

      event.preventDefault();
      onCancel?.();
    };

    document.addEventListener("keydown", handleKeyDown);

    return () => {
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [open, loading, onCancel]);

  /* ==========================================================
   * INITIAL FOCUS
   * ========================================================== */

  useEffect(() => {
    if (!open) {
      return undefined;
    }

    const frame = window.requestAnimationFrame(() => {
      cancelButtonRef.current?.focus();
    });

    return () => {
      window.cancelAnimationFrame(frame);
    };
  }, [open]);

  if (!open) {
    return null;
  }

  const handleBackdropClick = (event) => {
    if (loading) {
      return;
    }

    if (event.target !== event.currentTarget) {
      return;
    }

    onCancel?.();
  };

  return (
    <div
      className={cx(
        "fixed inset-0 z-100",
        "flex items-center justify-center",
        "p-4 sm:p-6",
      )}
      role="presentation"
      onMouseDown={handleBackdropClick}
    >
      {/* ====================================================
       * BACKDROP
       * ==================================================== */}

      <div
        className={cx(
          "absolute inset-0",
          "bg-black/40",
          "supports-backdrop-filter:bg-black/30",
          "supports-backdrop-filter:backdrop-blur-sm",
          "animate-in fade-in duration-200",
          "motion-reduce:animate-none",
        )}
        aria-hidden="true"
      />

      {/* ====================================================
       * DIALOG
       * ==================================================== */}

      <section
        role="alertdialog"
        aria-modal="true"
        aria-labelledby="logout-dialog-title"
        aria-describedby="logout-dialog-description"
        className={cx(
          "relative z-10 w-full max-w-md",
          "overflow-hidden rounded-2xl",
          "bg-surface",
          "shadow-2xl ring-1 ring-border",
          "animate-in fade-in zoom-in-95 duration-200",
          "motion-reduce:animate-none",
        )}
      >
        <div className="p-5 sm:p-6">
          {/* ==================================================
           * ICON
           * ================================================== */}

          <div
            className={cx(
              "mb-4 flex size-11 items-center justify-center",
              "rounded-xl",
              "bg-danger-soft",
              "text-danger",
            )}
          >
            <WarningIcon />
          </div>

          {/* ==================================================
           * CONTENT
           * ================================================== */}

          <h2
            id="logout-dialog-title"
            className="text-lg font-bold tracking-tight text-text sm:text-xl"
          >
            {title}
          </h2>

          <p
            id="logout-dialog-description"
            className="mt-2 text-sm leading-6 text-muted"
          >
            {description}
          </p>

          {/* ==================================================
           * ACTIONS
           * ================================================== */}

          <div className="mt-6 grid grid-cols-2 gap-2.5">
            <Button
              ref={cancelButtonRef}
              type="button"
              variant="secondary"
              className="w-full"
              onClick={onCancel}
              disabled={loading}
            >
              {cancelLabel}
            </Button>

            <Button
              ref={confirmButtonRef}
              type="button"
              variant="danger"
              className="w-full"
              onClick={onConfirm}
              disabled={loading}
            >
              {loading ? "Memproses..." : confirmLabel}
            </Button>
          </div>
        </div>
      </section>
    </div>
  );
};

ConfirmDialog.displayName = "ConfirmDialog";

/* ============================================================
 * NAVIGATION
 * ============================================================ */

const getNavItems = (role) => {
  switch (role) {
    case "teacher":
      return [
        {
          to: ROUTES.teacher.dashboard,
          label: "Dashboard",
        },
        {
          to: ROUTES.teacher.reports,
          label: "Laporan",
        },
        {
          to: ROUTES.teacher.settings,
          label: "Pengaturan",
        },
      ];

    case "student":
      return [
        {
          to: ROUTES.student.dashboard,
          label: "Dashboard",
        },
        {
          to: ROUTES.student.reports,
          label: "Laporan",
        },
        {
          to: ROUTES.student.settings,
          label: "Pengaturan",
        },
      ];

    default:
      return [
        {
          to: ROUTES.home,
          label: "Beranda",
        },
      ];
  }
};

const getLogoRoute = (role) => {
  switch (role) {
    case "teacher":
      return ROUTES.teacher.dashboard;

    case "student":
      return ROUTES.student.dashboard;

    default:
      return ROUTES.home;
  }
};

/* ============================================================
 * NAV ITEM
 * ============================================================ */

const NavItem = ({ to, children }) => {
  return (
    <NavLink
      to={to}
      className={({ isActive }) =>
        cx(
          "relative inline-flex h-full items-center",
          "whitespace-nowrap",
          "px-1",
          "text-sm font-medium",
          "transition-colors duration-(--token-transition-fast)",
          "focus-visible:outline-none",
          "focus-visible:ring-2",
          "focus-visible:ring-primary/30",
          "focus-visible:ring-offset-2",
          "focus-visible:ring-offset-surface",

          isActive
            ? [
                "text-primary",
                "after:absolute",
                "after:inset-x-0",
                "after:bottom-0",
                "after:h-0.5",
                "after:rounded-full",
                "after:bg-primary",
              ].join(" ")
            : ["text-muted", "hover:text-text"].join(" "),
        )
      }
    >
      {children}
    </NavLink>
  );
};

NavItem.displayName = "NavItem";

/* ============================================================
 * LOGOUT BUTTON
 * ============================================================ */

const LogoutButton = ({ onClick, className = "", tabIndex }) => {
  return (
    <button
      type="button"
      onClick={onClick}
      tabIndex={tabIndex}
      className={cx(
        "inline-flex min-h-11 items-center justify-center gap-2",
        "rounded-lg px-3",
        "text-sm font-medium",
        "text-danger",
        "transition-colors duration-(--token-transition-fast)",
        "hover:bg-danger-soft",
        "active:bg-danger-soft-hover",
        "focus-visible:outline-none",
        "focus-visible:ring-2",
        "focus-visible:ring-danger/30",
        "focus-visible:ring-offset-2",
        "focus-visible:ring-offset-surface",
        className,
      )}
      aria-label="Keluar dari akun"
    >
      <LogoutIcon />

      <span>Logout</span>
    </button>
  );
};

LogoutButton.displayName = "LogoutButton";

/* ============================================================
 * MOBILE MENU HOOK
 * ============================================================ */

const useMobileMenu = () => {
  const [isOpen, setIsOpen] = useState(false);

  const menuRef = useRef(null);

  const buttonRef = useRef(null);

  const close = useCallback(() => {
    setIsOpen(false);
  }, []);

  const toggle = useCallback(() => {
    setIsOpen((current) => !current);
  }, []);

  /* ==========================================================
   * OUTSIDE CLICK
   * ========================================================== */

  useEffect(() => {
    if (!isOpen) {
      return undefined;
    }

    const handlePointerDown = (event) => {
      const target = event.target;

      if (!(target instanceof Node)) {
        return;
      }

      if (
        menuRef.current?.contains(target) ||
        buttonRef.current?.contains(target)
      ) {
        return;
      }

      close();
    };

    document.addEventListener("pointerdown", handlePointerDown);

    return () => {
      document.removeEventListener("pointerdown", handlePointerDown);
    };
  }, [isOpen, close]);

  /* ==========================================================
   * DESKTOP TRANSITION
   * ========================================================== */

  useEffect(() => {
    const mediaQuery = window.matchMedia(MOBILE_BREAKPOINT);

    const handleChange = (event) => {
      if (event.matches) {
        close();
      }
    };

    mediaQuery.addEventListener("change", handleChange);

    return () => {
      mediaQuery.removeEventListener("change", handleChange);
    };
  }, [close]);

  /* ==========================================================
   * BODY SCROLL LOCK
   * ========================================================== */

  useEffect(() => {
    if (!isOpen) {
      return undefined;
    }

    const previousOverflow = document.documentElement.style.overflow;

    document.documentElement.style.overflow = "hidden";

    return () => {
      document.documentElement.style.overflow = previousOverflow;
    };
  }, [isOpen]);

  /* ==========================================================
   * ESCAPE
   * ========================================================== */

  useEffect(() => {
    if (!isOpen) {
      return undefined;
    }

    const handleKeyDown = (event) => {
      if (event.key !== "Escape") {
        return;
      }

      close();

      window.requestAnimationFrame(() => {
        buttonRef.current?.focus();
      });
    };

    document.addEventListener("keydown", handleKeyDown);

    return () => {
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [isOpen, close]);

  return {
    isOpen,
    close,
    toggle,
    menuRef,
    buttonRef,
  };
};

useMobileMenu.displayName = "useMobileMenu";

/* ============================================================
 * MOBILE NAV ITEM
 * ============================================================ */

const MobileNavItem = ({ to, children, onNavigate, tabIndex }) => {
  return (
    <NavLink
      to={to}
      onClick={onNavigate}
      tabIndex={tabIndex}
      className={({ isActive }) =>
        cx(
          "group flex min-h-12 w-full items-center",
          "justify-between gap-3",
          "rounded-xl px-4 py-3",
          "text-base font-medium",
          "transition-colors duration-(--token-transition-fast)",
          "focus-visible:outline-none",
          "focus-visible:ring-2",
          "focus-visible:ring-primary/30",
          "focus-visible:ring-offset-2",
          "focus-visible:ring-offset-surface",

          isActive
            ? ["bg-primary-soft", "text-primary", "[&>svg]:text-primary"].join(
                " ",
              )
            : [
                "text-muted",
                "hover:bg-surface-muted",
                "hover:text-text",
                "active:bg-surface-hover",
              ].join(" "),
        )
      }
    >
      <span className="min-w-0 truncate">{children}</span>

      <ChevronIcon />
    </NavLink>
  );
};

MobileNavItem.displayName = "MobileNavItem";

/* ============================================================
 * HEADER
 * ============================================================ */

const Header = () => {
  const { role, isAuthenticated, logout } = useAuth();

  const {
    isOpen: isMobileMenuOpen,
    close: closeMobileMenu,
    toggle: toggleMobileMenu,
    menuRef,
    buttonRef,
  } = useMobileMenu();

  const navItems = getNavItems(role);

  const logoRoute = getLogoRoute(role);

  const [isLogoutDialogOpen, setIsLogoutDialogOpen] = useState(false);

  const [isLoggingOut, setIsLoggingOut] = useState(false);

  /* ==========================================================
   * OPEN LOGOUT DIALOG
   * ========================================================== */

  const handleLogout = useCallback(() => {
    setIsLogoutDialogOpen(true);
  }, []);

  /* ==========================================================
   * CANCEL LOGOUT
   * ========================================================== */

  const handleCancelLogout = useCallback(() => {
    if (isLoggingOut) {
      return;
    }

    setIsLogoutDialogOpen(false);
  }, [isLoggingOut]);

  /* ==========================================================
   * CONFIRM LOGOUT
   * ========================================================== */

  const handleConfirmLogout = useCallback(async () => {
    if (isLoggingOut) {
      return;
    }

    setIsLoggingOut(true);

    closeMobileMenu();

    try {
      await logout();
      setIsLogoutDialogOpen(false);
    } catch (error) {
      console.error("Logout failed:", error);
    } finally {
      setIsLoggingOut(false);
    }
  }, [logout, closeMobileMenu, isLoggingOut]);

  return (
    <>
      <header
        className={cx(
          "sticky inset-x-0 top-0 z-50",
          "bg-background/95",
          "supports-backdrop-filter:bg-background/80",
          "supports-backdrop-filter:backdrop-blur-xl",
        )}
      >
        <div className="page-container">
          <div
            className={cx(
              "flex min-w-0 items-center",
              "justify-between",
              "gap-3",
              HEADER_HEIGHT_CLASS,
            )}
          >
            {/* ==================================================
             * BRAND
             * ================================================== */}

            <Link
              to={logoRoute}
              onClick={closeMobileMenu}
              className={cx(
                "group inline-flex min-w-0 shrink",
                "items-center",
                "gap-2 sm:gap-2.5",
                "rounded-lg",
                "text-lg font-bold text-primary sm:text-xl",
                "focus-visible:outline-none",
                "focus-visible:ring-2",
                "focus-visible:ring-primary/30",
                "focus-visible:ring-offset-2",
                "focus-visible:ring-offset-surface",
              )}
              aria-label="Beranda LittleWins"
            >
              <LogoIcon
                className={cx(
                  "size-8 shrink-0",
                  "transition-transform duration-(--token-transition-fast)",
                  "group-hover:scale-[1.03]",
                  "sm:size-9",
                )}
                aria-hidden="true"
              />

              <span className="min-w-0 truncate">LittleWins</span>
            </Link>

            {/* ==================================================
             * DESKTOP NAV
             * ================================================== */}

            <nav
              className={cx(
                "hidden h-full min-w-0 flex-1",
                "items-center justify-center",
                "md:flex",
              )}
              aria-label="Navigasi utama"
            >
              <ul
                className={cx(
                  "flex h-full items-center",
                  "gap-5 lg:gap-7 xl:gap-8",
                )}
              >
                {navItems.map((item) => (
                  <li key={item.to} className="h-full">
                    <NavItem to={item.to}>{item.label}</NavItem>
                  </li>
                ))}
              </ul>
            </nav>

            {/* ==================================================
             * RIGHT ACTIONS
             * ================================================== */}

            <div
              className={cx("flex shrink-0 items-center", "gap-1.5 sm:gap-2")}
            >
              {isAuthenticated && (
                <LogoutButton
                  onClick={handleLogout}
                  className="hidden md:inline-flex"
                />
              )}

              <button
                ref={buttonRef}
                type="button"
                onClick={toggleMobileMenu}
                className={cx(
                  "inline-flex size-11 shrink-0",
                  "items-center justify-center",
                  "rounded-xl",
                  "text-text",
                  "transition-colors duration-(--token-transition-fast)",
                  "hover:bg-surface-muted",
                  "active:bg-surface-hover",
                  "focus-visible:outline-none",
                  "focus-visible:ring-2",
                  "focus-visible:ring-primary/30",
                  "focus-visible:ring-offset-2",
                  "focus-visible:ring-offset-surface",
                  "md:hidden",
                )}
                aria-label={
                  isMobileMenuOpen
                    ? "Tutup menu navigasi"
                    : "Buka menu navigasi"
                }
                aria-expanded={isMobileMenuOpen}
                aria-controls="mobile-navigation"
              >
                <HamburgerIcon open={isMobileMenuOpen} />
              </button>
            </div>
          </div>
        </div>

        {/* ======================================================
         * MOBILE NAVIGATION
         * ====================================================== */}

        <div className="md:hidden">
          {/* ====================================================
           * BACKDROP
           * ==================================================== */}

          <button
            type="button"
            className={cx(
              "fixed inset-x-0 bottom-0 z-30",
              MOBILE_MENU_TOP_CLASS,
              "bg-black/20",
              "transition-opacity duration-(--token-transition-base)",
              "motion-reduce:transition-none",
              isMobileMenuOpen
                ? "pointer-events-auto opacity-100"
                : "pointer-events-none opacity-0",
            )}
            onClick={closeMobileMenu}
            tabIndex={isMobileMenuOpen ? 0 : -1}
            aria-label="Tutup menu navigasi"
          />

          {/* ====================================================
           * MENU
           * ==================================================== */}

          <div
            id="mobile-navigation"
            ref={menuRef}
            className={cx(
              "fixed inset-x-0 z-40",
              MOBILE_MENU_TOP_CLASS,
              MOBILE_MENU_HEIGHT_CLASS,
              "overflow-y-auto",
              "overscroll-contain",
              "bg-surface",
              "shadow-lg",
              "transition-[opacity,transform,visibility]",
              "duration-(--token-transition-base)",
              "ease-out",
              "motion-reduce:transition-none",
              isMobileMenuOpen
                ? "visible translate-y-0 opacity-100"
                : "invisible -translate-y-2 opacity-0",
            )}
            aria-hidden={!isMobileMenuOpen}
          >
            <div className="page-container">
              <nav className="py-4 sm:py-5" aria-label="Navigasi mobile">
                <ul className="flex flex-col gap-1.5">
                  {navItems.map((item) => (
                    <li key={item.to}>
                      <MobileNavItem
                        to={item.to}
                        onNavigate={closeMobileMenu}
                        tabIndex={isMobileMenuOpen ? 0 : -1}
                      >
                        {item.label}
                      </MobileNavItem>
                    </li>
                  ))}
                </ul>

                {isAuthenticated && (
                  <div className="mt-3 border-t border-border pt-3">
                    <LogoutButton
                      onClick={handleLogout}
                      tabIndex={isMobileMenuOpen ? 0 : -1}
                      className="w-full justify-start rounded-xl px-4 py-3 text-base"
                    />
                  </div>
                )}
              </nav>
            </div>
          </div>
        </div>
      </header>

      {/* ======================================================
       * LOGOUT CONFIRMATION
       * ====================================================== */}

      <ConfirmDialog
        open={isLogoutDialogOpen}
        title="Keluar dari akun?"
        description="Anda akan keluar dari akun LittleWins. Pastikan tidak ada proses yang sedang berlangsung sebelum melanjutkan."
        confirmLabel="Ya, Logout"
        cancelLabel="Batal"
        onConfirm={handleConfirmLogout}
        onCancel={handleCancelLogout}
        loading={isLoggingOut}
      />
    </>
  );
};

Header.displayName = "Header";

export { Header };

export default Header;
