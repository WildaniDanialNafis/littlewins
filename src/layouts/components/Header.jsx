import { useCallback, useEffect, useMemo, useRef, useState } from "react";

import { Link, NavLink } from "react-router-dom";

import { useAuth } from "@/shared/hooks";
import { ROUTES } from "@/shared/constants";
import { LogoIcon } from "@/shared/icons";
import { cx } from "@/shared/utils";

/* ============================================================
 * NAV ITEM
 * ============================================================ */

const NavItem = ({ to, children, className = "" }) => {
  return (
    <NavLink
      to={to}
      className={({ isActive }) =>
        cx(
          "relative inline-flex h-full items-center",
          "text-sm font-medium transition-colors",
          "hover:text-primary",
          "focus-visible:outline-none",
          "focus-visible:text-primary",
          "focus-visible:ring-2",
          "focus-visible:ring-primary/30",
          "focus-visible:ring-offset-2",
          "focus-visible:ring-offset-background",
          isActive
            ? "text-primary after:absolute after:bottom-0 after:left-0 after:h-0.5 after:w-full after:rounded-full after:bg-primary"
            : "text-muted",
          className,
        )
      }
    >
      {children}
    </NavLink>
  );
};

NavItem.displayName = "NavItem";

/* ============================================================
 * LOGOUT ICON
 * ============================================================ */

const LogoutIcon = () => {
  return (
    <svg
      className="h-5 w-5 shrink-0"
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
};

LogoutIcon.displayName = "LogoutIcon";

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
        "flex h-10 items-center gap-2 rounded-lg px-3",
        "text-sm font-medium text-danger",
        "transition-colors",
        "hover:bg-danger-soft",
        "focus-visible:outline-none",
        "focus-visible:ring-2",
        "focus-visible:ring-danger/30",
        "focus-visible:ring-offset-2",
        "focus-visible:ring-offset-background",
        className,
      )}
      aria-label="Keluar dari akun"
    >
      <LogoutIcon />
      <span className="hidden md:inline">Logout</span>
    </button>
  );
};

LogoutButton.displayName = "LogoutButton";

/* ============================================================
 * HAMBURGER ICON
 * ============================================================ */

const HamburgerIcon = ({ open }) => {
  return (
    <span className="flex h-5 w-6 flex-col justify-between" aria-hidden="true">
      <span
        className={cx(
          "block h-0.5 origin-left bg-current",
          "transition-all duration-300",
          open && "translate-x-0.5 rotate-45",
        )}
      />

      <span
        className={cx(
          "block h-0.5 bg-current",
          "transition-opacity duration-300",
          open && "opacity-0",
        )}
      />

      <span
        className={cx(
          "block h-0.5 origin-left bg-current",
          "transition-all duration-300",
          open && "translate-x-0.5 -rotate-45",
        )}
      />
    </span>
  );
};

HamburgerIcon.displayName = "HamburgerIcon";

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
   * CLOSE ON DESKTOP
   * ========================================================== */

  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth >= 768) {
        close();
      }
    };

    window.addEventListener("resize", handleResize);

    return () => {
      window.removeEventListener("resize", handleResize);
    };
  }, [close]);

  /* ==========================================================
   * LOCK BODY SCROLL
   * ========================================================== */

  useEffect(() => {
    if (!isOpen) {
      return undefined;
    }

    const previousOverflow = document.body.style.overflow;

    document.body.style.overflow = "hidden";

    return () => {
      document.body.style.overflow = previousOverflow;
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

      buttonRef.current?.focus();
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

/* ============================================================
 * HEADER
 * ============================================================ */

const Header = () => {
  const { user, logout } = useAuth();

  const mobileMenu = useMobileMenu();

  const isAuthenticated = Boolean(user);

  const isTeacher = user?.role === "teacher";

  const isStudent = user?.role === "student";

  /* ==========================================================
   * NAVIGATION ITEMS
   * ========================================================== */

  const navItems = useMemo(() => {
    if (isTeacher) {
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
    }

    if (isStudent) {
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
    }

    return [
      {
        to: ROUTES.home,
        label: "Beranda",
      },
    ];
  }, [isTeacher, isStudent]);

  /* ==========================================================
   * LOGO ROUTE
   * ========================================================== */

  const logoRoute = isTeacher
    ? ROUTES.teacher.dashboard
    : isStudent
      ? ROUTES.student.dashboard
      : ROUTES.home;

  /* ==========================================================
   * LOGOUT
   * ========================================================== */

  const handleLogout = useCallback(async () => {
    mobileMenu.close();

    try {
      await logout();
    } catch (error) {
      console.error("Logout failed:", error);
    }
  }, [logout, mobileMenu.close]);

  /* ==========================================================
   * VIEW
   * ========================================================== */

  return (
    <header className="sticky top-0 z-50 border-b border-border bg-surface shadow-sm">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between md:h-20">
          {/* ==================================================
           * LOGO
           * ================================================== */}

          <Link
            to={logoRoute}
            onClick={mobileMenu.close}
            className={cx(
              "flex h-full shrink-0 items-center gap-2",
              "text-xl font-bold text-primary",
              "focus-visible:outline-none",
              "focus-visible:ring-2",
              "focus-visible:ring-primary/30",
              "focus-visible:ring-offset-2",
              "focus-visible:ring-offset-background",
            )}
            aria-label="Beranda LittleWins"
          >
            <LogoIcon className="h-8 w-8" aria-hidden="true" />

            <span>LittleWins</span>
          </Link>

          {/* ==================================================
           * DESKTOP NAV
           * ================================================== */}

          <nav
            className="hidden h-full items-center gap-8 md:flex"
            aria-label="Navigasi utama"
          >
            {navItems.map((item) => (
              <NavItem key={item.to} to={item.to}>
                {item.label}
              </NavItem>
            ))}
          </nav>

          {/* ==================================================
           * ACTIONS
           * ================================================== */}

          <div className="flex h-full items-center gap-1.5 sm:gap-2 md:gap-3">
            {isAuthenticated && (
              <LogoutButton onClick={handleLogout} className="hidden md:flex" />
            )}

            <button
              type="button"
              ref={mobileMenu.buttonRef}
              onClick={mobileMenu.toggle}
              className={cx(
                "inline-flex h-10 w-10 shrink-0",
                "items-center justify-center rounded-lg",
                "transition-colors",
                "hover:bg-surface-muted",
                "focus-visible:outline-none",
                "focus-visible:ring-2",
                "focus-visible:ring-primary/30",
                "focus-visible:ring-offset-2",
                "focus-visible:ring-offset-background",
                "md:hidden",
              )}
              aria-label={mobileMenu.isOpen ? "Tutup menu" : "Buka menu"}
              aria-expanded={mobileMenu.isOpen}
              aria-controls="mobile-navigation"
            >
              <HamburgerIcon open={mobileMenu.isOpen} />
            </button>
          </div>
        </div>
      </div>

      {/* ======================================================
       * MOBILE NAVIGATION
       * ====================================================== */}

      <div
        id="mobile-navigation"
        ref={mobileMenu.menuRef}
        className={cx(
          "fixed inset-x-0 top-16 z-40 md:top-20 md:hidden",
          "border-b border-border bg-surface",
          "shadow-lg",
          "overflow-y-auto overscroll-contain",
          "max-h-[calc(100dvh-4rem)] md:max-h-[calc(100dvh-5rem)]",
          "transition-[transform,opacity,visibility]",
          "duration-(--token-transition-base)",
          "ease-out",

          mobileMenu.isOpen
            ? "visible pointer-events-auto translate-y-0 opacity-100"
            : "invisible pointer-events-none -translate-y-2 opacity-0",
        )}
        aria-hidden={!mobileMenu.isOpen}
      >
        <nav
          className="mx-auto flex max-w-7xl flex-col gap-2 px-4 py-5 sm:px-6"
          aria-label="Navigasi mobile"
        >
          {navItems.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              onClick={mobileMenu.close}
              tabIndex={mobileMenu.isOpen ? 0 : -1}
              className={({ isActive }) =>
                cx(
                  "flex min-h-12 items-center rounded-xl px-4 py-3",
                  "text-base font-medium transition-colors",
                  "focus-visible:outline-none",
                  "focus-visible:ring-2",
                  "focus-visible:ring-primary/30",
                  "focus-visible:ring-offset-2",
                  "focus-visible:ring-offset-background",

                  isActive
                    ? "bg-primary-soft text-primary"
                    : "text-muted hover:bg-surface-muted hover:text-text",
                )
              }
            >
              {item.label}
            </NavLink>
          ))}

          {isAuthenticated && (
            <LogoutButton
              onClick={handleLogout}
              tabIndex={mobileMenu.isOpen ? 0 : -1}
              className="mt-2 min-h-12 rounded-xl px-4 py-3 text-base"
            />
          )}
        </nav>
      </div>
    </header>
  );
};

Header.displayName = "Header";

export { Header };

export default Header;
