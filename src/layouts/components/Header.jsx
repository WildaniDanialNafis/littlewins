import { useCallback, useEffect, useRef, useState } from "react";

import { Link, NavLink } from "react-router-dom";

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

    if (mediaQuery.matches) {
      close();
    }

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
  const { user, role, isAuthenticated, logout } = useAuth();

  const mobileMenu = useMobileMenu();

  const navItems = getNavItems(role);

  const logoRoute = getLogoRoute(role);

  const handleLogout = useCallback(async () => {
    mobileMenu.close();

    try {
      await logout();
    } catch (error) {
      console.error("Logout failed:", error);
    }
  }, [logout, mobileMenu.close]);

  return (
    <header
      className={cx(
        "sticky inset-x-0 top-0 z-50",
        "border-b border-border",
        "bg-surface/95",
        "backdrop-blur",
        "supports-backdrop-filter:bg-surface/85",
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
          <Link
            to={logoRoute}
            onClick={mobileMenu.close}
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

          <div className={cx("flex shrink-0 items-center", "gap-1.5 sm:gap-2")}>
            {isAuthenticated && (
              <LogoutButton
                onClick={handleLogout}
                className="hidden md:inline-flex"
              />
            )}

            <button
              ref={mobileMenu.buttonRef}
              type="button"
              onClick={mobileMenu.toggle}
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
                mobileMenu.isOpen ? "Tutup menu navigasi" : "Buka menu navigasi"
              }
              aria-expanded={mobileMenu.isOpen}
              aria-controls="mobile-navigation"
            >
              <HamburgerIcon open={mobileMenu.isOpen} />
            </button>
          </div>
        </div>
      </div>

      <div className="md:hidden">
        <button
          type="button"
          className={cx(
            "fixed inset-x-0 bottom-0 z-30",
            MOBILE_MENU_TOP_CLASS,
            "bg-slate-950/25",
            "backdrop-blur-[1px]",
            "transition-opacity duration-(--token-transition-base)",

            mobileMenu.isOpen
              ? ["pointer-events-auto", "opacity-100"].join(" ")
              : ["pointer-events-none", "opacity-0"].join(" "),
          )}
          onClick={mobileMenu.close}
          tabIndex={mobileMenu.isOpen ? 0 : -1}
          aria-label="Tutup menu navigasi"
        />

        <div
          id="mobile-navigation"
          ref={mobileMenu.menuRef}
          className={cx(
            "fixed inset-x-0 z-40",
            MOBILE_MENU_TOP_CLASS,
            MOBILE_MENU_HEIGHT_CLASS,

            "overflow-y-auto",
            "overscroll-contain",
            "border-b border-border",
            "bg-surface",
            "shadow-lg",

            "transition-[opacity,transform,visibility]",
            "duration-(--token-transition-base)",
            "ease-out",

            mobileMenu.isOpen
              ? ["visible", "translate-y-0", "opacity-100"].join(" ")
              : ["invisible", "-translate-y-2", "opacity-0"].join(" "),
          )}
          aria-hidden={!mobileMenu.isOpen}
        >
          <div className={cx("page-container", "safe-area-bottom")}>
            <nav className="py-4 sm:py-5" aria-label="Navigasi mobile">
              <ul className="flex flex-col gap-1.5">
                {navItems.map((item) => (
                  <li key={item.to}>
                    <MobileNavItem
                      to={item.to}
                      onNavigate={mobileMenu.close}
                      tabIndex={mobileMenu.isOpen ? 0 : -1}
                    >
                      {item.label}
                    </MobileNavItem>
                  </li>
                ))}
              </ul>

              {isAuthenticated && (
                <div className={cx("mt-3", "border-t border-border", "pt-3")}>
                  <LogoutButton
                    onClick={handleLogout}
                    tabIndex={mobileMenu.isOpen ? 0 : -1}
                    className={cx(
                      "w-full",
                      "justify-start",
                      "rounded-xl",
                      "px-4 py-3",
                      "text-base",
                    )}
                  />
                </div>
              )}
            </nav>
          </div>
        </div>
      </div>
    </header>
  );
};

Header.displayName = "Header";

export { Header };

export default Header;
