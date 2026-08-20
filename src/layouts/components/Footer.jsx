import { Link } from "react-router-dom";

import { APP_NAME, APP_TAGLINE, ROUTES } from "@/shared/constants";

import { useAuth } from "@/shared/hooks";

/* ============================================================
 * CONSTANTS
 * ============================================================ */

const CURRENT_YEAR = new Date().getFullYear();

const SUPPORT_EMAIL = "support@example.com";

const SUPPORT_PHONE = "+620000000000";

/* ============================================================
 * ICONS
 * ============================================================ */

const MailIcon = () => (
  <svg
    className="h-4 w-4 shrink-0"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    aria-hidden="true"
  >
    <path d="m3 8 7.89 5.26a2 2 0 0 0 2.22 0L21 8" />
    <path d="M5 19h14a2 2 0 0 0 2-2V7a2 2 0 0 0-2-2H5a2 2 0 0 0-2 2v10a2 2 0 0 0 2 2Z" />
  </svg>
);

MailIcon.displayName = "MailIcon";

const PhoneIcon = () => (
  <svg
    className="h-4 w-4 shrink-0"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    aria-hidden="true"
  >
    <path d="M3 5a2 2 0 0 1 2-2h3.28a1 1 0 0 1 .948.684l1.498 4.493a1 1 0 0 1-.502 1.21l-2.257 1.13a11.042 11.042 0 0 0 5.516 5.516l1.13-2.257a1 1 0 0 1 1.21-.502l4.493 1.498a2 2 0 0 1 2 2v1a2 2 0 0 1-2 2h-1C9.716 21 3 14.284 3 6V5Z" />
  </svg>
);

PhoneIcon.displayName = "PhoneIcon";

/* ============================================================
 * CONTACT LINK
 * ============================================================ */

const ContactLink = ({ href, icon, label, value }) => {
  return (
    <a
      href={href}
      className={[
        "inline-flex min-h-10 items-center gap-2",
        "rounded-lg px-2 py-1.5",
        "text-sm text-muted",
        "transition-[background-color,color]",
        "duration-(--token-transition-fast)",
        "hover:bg-surface-muted hover:text-text",
        "focus-visible:outline-none",
        "focus-visible:ring-2",
        "focus-visible:ring-primary/30",
        "focus-visible:ring-offset-2",
        "focus-visible:ring-offset-background",
      ].join(" ")}
    >
      {icon}

      <span className="min-w-0">
        <span className="sr-only">{label}: </span>

        <span className="break-all sm:break-normal">{value}</span>
      </span>
    </a>
  );
};

ContactLink.displayName = "ContactLink";

/* ============================================================
 * FOOTER
 * ============================================================ */

const Footer = () => {
  const { isAuthenticated } = useAuth();

  /*
   * isAuthenticated is intentionally kept here because the
   * footer may later need role/auth-specific navigation.
   *
   * For now, both states use the same home route.
   */
  const homeRoute = isAuthenticated ? ROUTES.home : ROUTES.home;

  return (
    <footer className="mt-auto border-t border-border bg-surface">
      <div className="page-container py-6 sm:py-8">
        <div className="min-w-0">
          {/* ==================================================
           * MAIN
           * ================================================== */}

          <div className="flex min-w-0 flex-col gap-6 sm:flex-row sm:items-start sm:justify-between sm:gap-8">
            {/* ==================================================
             * BRAND
             * ================================================== */}

            <div className="min-w-0 max-w-xl">
              <Link
                to={homeRoute}
                className={[
                  "inline-flex min-h-10 items-center",
                  "rounded-lg",
                  "text-base font-bold tracking-tight text-text",
                  "transition-colors",
                  "duration-(--token-transition-fast)",
                  "hover:text-primary",
                  "focus-visible:outline-none",
                  "focus-visible:ring-2",
                  "focus-visible:ring-primary/30",
                  "focus-visible:ring-offset-2",
                  "focus-visible:ring-offset-background",
                ].join(" ")}
              >
                {APP_NAME}
              </Link>

              <p className="mt-1.5 max-w-lg text-sm leading-6 text-muted">
                {APP_TAGLINE}
              </p>
            </div>

            {/* ==================================================
             * CONTACT
             * ================================================== */}

            <div className="flex min-w-0 flex-col gap-1 sm:items-end">
              <p className="mb-1 text-xs font-semibold uppercase tracking-[0.08em] text-muted">
                Kontak
              </p>

              <ContactLink
                href={`mailto:${SUPPORT_EMAIL}`}
                icon={<MailIcon />}
                label="Email"
                value={SUPPORT_EMAIL}
              />

              <ContactLink
                href={`tel:${SUPPORT_PHONE}`}
                icon={<PhoneIcon />}
                label="Telepon"
                value={SUPPORT_PHONE}
              />
            </div>
          </div>

          {/* ==================================================
           * COPYRIGHT
           * ================================================== */}

          <div className="mt-6 border-t border-border pt-4 sm:mt-7 sm:pt-5">
            <div className="flex min-w-0 flex-col gap-1.5 sm:flex-row sm:items-center sm:justify-between sm:gap-6">
              <p className="text-xs leading-5 text-muted sm:text-sm">
                &copy; {CURRENT_YEAR} {APP_NAME}
              </p>

              <p className="max-w-xl text-xs leading-5 text-muted sm:text-right sm:text-sm">
                {APP_TAGLINE}
              </p>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

Footer.displayName = "Footer";

export default Footer;
