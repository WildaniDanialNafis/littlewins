import { Link } from "react-router-dom";

import { useAuth } from "@/shared/hooks";
import { APP_NAME, APP_TAGLINE, ROUTES } from "@/shared/constants";
import { cx } from "@/shared/utils";

const CURRENT_YEAR = new Date().getFullYear();

const MailIcon = () => {
  return (
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
};

MailIcon.displayName = "MailIcon";

const PhoneIcon = () => {
  return (
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
};

PhoneIcon.displayName = "PhoneIcon";

const FacebookIcon = () => {
  return (
    <svg
      className="h-5 w-5"
      viewBox="0 0 24 24"
      fill="currentColor"
      aria-hidden="true"
    >
      <path d="M22 12c0-5.523-4.477-10-10-10S2 6.477 2 12c0 4.991 3.657 9.128 8.438 9.878v-6.987h-2.54V12h2.54V9.797c0-2.506 1.492-3.89 3.777-3.89 1.094 0 2.238.195 2.238.195v2.46h-1.26c-1.243 0-1.63.771-1.63 1.562V12h2.773l-.443 2.89h-2.33v6.988C18.343 21.128 22 16.991 22 12Z" />
    </svg>
  );
};

FacebookIcon.displayName = "FacebookIcon";

const TwitterIcon = () => {
  return (
    <svg
      className="h-5 w-5"
      viewBox="0 0 24 24"
      fill="currentColor"
      aria-hidden="true"
    >
      <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231Zm-1.161 17.52h1.833L7.084 4.126H5.117Z" />
    </svg>
  );
};

TwitterIcon.displayName = "TwitterIcon";

const InstagramIcon = () => {
  return (
    <svg
      className="h-5 w-5"
      viewBox="0 0 24 24"
      fill="currentColor"
      aria-hidden="true"
    >
      <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-4.85-.149-4.771-1.699-4.919-4.92-.058-1.28-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919C8.333.014 8.741 0 12 0Zm0 5.838a6.162 6.162 0 1 0 0 12.324 6.162 6.162 0 0 0 0-12.324ZM12 16a4 4 0 1 1 0-8 4 4 0 0 1 0 8Zm6.406-11.845a1.44 1.44 0 1 0 0 2.881 1.44 1.44 0 0 0 0-2.881Z" />
    </svg>
  );
};

InstagramIcon.displayName = "InstagramIcon";

const CONTACT_ITEMS = [
  {
    icon: MailIcon,
    label: "Email",
    value: "support@littlewins.com",
    href: "mailto:support@littlewins.com",
  },
  {
    icon: PhoneIcon,
    label: "Telepon",
    value: "+62 812-3456-7890",
    href: "tel:+6281234567890",
  },
];

const SOCIAL_LINKS = [
  {
    icon: FacebookIcon,
    label: "Facebook",
    href: "https://facebook.com/littlewins",
  },
  {
    icon: TwitterIcon,
    label: "Twitter",
    href: "https://twitter.com/littlewins",
  },
  {
    icon: InstagramIcon,
    label: "Instagram",
    href: "https://instagram.com/littlewins",
  },
];

export const Footer = () => {
  const { user } = useAuth();

  const quickLinks =
    user?.role === "teacher"
      ? [
          {
            to: ROUTES.teacher.dashboard,
            label: "Dashboard",
          },
          {
            to: ROUTES.teacher.reports,
            label: "Riwayat Laporan",
          },
        ]
      : user?.role === "student"
        ? [
            {
              to: ROUTES.student.dashboard,
              label: "Dashboard",
            },
            {
              to: ROUTES.student.reports,
              label: "Riwayat Laporan",
            },
          ]
        : [];

  return (
    <footer className="border-t border-border bg-surface" role="contentinfo">
      <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 sm:py-12 lg:px-8">
        <div className="grid grid-cols-1 gap-10 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 lg:gap-8">
          <section aria-labelledby="footer-about">
            <h2
              id="footer-about"
              className="text-sm font-semibold uppercase tracking-wider text-text"
            >
              Tentang {APP_NAME}
            </h2>

            <p className="mt-4 max-w-sm text-sm leading-6 text-muted">
              {APP_NAME} adalah platform untuk memantau dan mencatat kemajuan
              akademik siswa secara digital.
            </p>
          </section>

          {quickLinks.length > 0 && (
            <section aria-labelledby="footer-navigation">
              <h2
                id="footer-navigation"
                className="text-sm font-semibold uppercase tracking-wider text-text"
              >
                Navigasi
              </h2>

              <nav className="mt-4" aria-label="Navigasi footer">
                <ul className="space-y-1">
                  {quickLinks.map(({ to, label }) => (
                    <li key={to}>
                      <Link
                        to={to}
                        className="inline-flex min-h-9 items-center rounded-md px-1 text-sm text-muted transition-colors hover:text-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/30 focus-visible:ring-offset-2 focus-visible:ring-offset-background"
                      >
                        {label}
                      </Link>
                    </li>
                  ))}
                </ul>
              </nav>
            </section>
          )}

          <section aria-labelledby="footer-contact">
            <h2
              id="footer-contact"
              className="text-sm font-semibold uppercase tracking-wider text-text"
            >
              Kontak
            </h2>

            <ul className="mt-4 space-y-3">
              {CONTACT_ITEMS.map(({ icon: Icon, label, value, href }) => (
                <li key={value}>
                  <a
                    href={href}
                    className="inline-flex min-h-9 max-w-full items-center gap-2 rounded-md px-1 text-sm text-muted transition-colors hover:text-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/30 focus-visible:ring-offset-2 focus-visible:ring-offset-background"
                    aria-label={`${label}: ${value}`}
                  >
                    <Icon />
                    <span className="truncate">{value}</span>
                  </a>
                </li>
              ))}
            </ul>
          </section>

          <section aria-labelledby="footer-social">
            <h2
              id="footer-social"
              className="text-sm font-semibold uppercase tracking-wider text-text"
            >
              Ikuti Kami
            </h2>

            <div className="mt-4 flex flex-wrap gap-2">
              {SOCIAL_LINKS.map(({ icon: Icon, label, href }) => (
                <a
                  key={label}
                  href={href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex h-10 w-10 items-center justify-center rounded-lg text-muted transition-colors hover:bg-primary-soft hover:text-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/30 focus-visible:ring-offset-2 focus-visible:ring-offset-background"
                  aria-label={`Ikuti ${APP_NAME} di ${label}`}
                >
                  <Icon />
                </a>
              ))}
            </div>
          </section>
        </div>

        <div className="mt-10 border-t border-border pt-6">
          <div className="flex flex-col items-center justify-between gap-3 text-center sm:flex-row sm:text-left">
            <p className="text-sm leading-6 text-muted">
              &copy; {CURRENT_YEAR} {APP_NAME}. Semua hak dilindungi.
            </p>

            <p className="text-sm leading-6 text-muted">{APP_TAGLINE}</p>
          </div>
        </div>
      </div>
    </footer>
  );
};

Footer.displayName = "Footer";

export default Footer;
