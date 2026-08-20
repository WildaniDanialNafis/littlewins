import { useAuth, useTheme } from "@/shared/hooks";

import { Button } from "@/shared/components/ui";

import { ContentBlock, SectionTitle } from "@/shared/components/layout";

import { ROUTES } from "@/shared/constants";

import { cx } from "@/shared/utils";

import { PageContainer } from "@/layouts/components";

import { CheckIcon, MonitorIcon, MoonIcon, SunIcon } from "@/shared/icons";

/* ============================================================
 * CONSTANTS
 * ============================================================ */

const THEME_OPTIONS = [
  {
    value: "system",
    label: "Sistem",
    description: "Ikuti tema perangkat.",
    icon: MonitorIcon,
  },
  {
    value: "light",
    label: "Terang",
    description: "Gunakan tampilan terang.",
    icon: SunIcon,
  },
  {
    value: "dark",
    label: "Gelap",
    description: "Gunakan tampilan gelap.",
    icon: MoonIcon,
  },
];

const ROLE_CONFIG = {
  teacher: {
    label: "Guru",
    route: ROUTES.teacher.settings,
  },
  student: {
    label: "Siswa",
    route: ROUTES.student.settings,
  },
};

/* ============================================================
 * HELPERS
 * ============================================================ */

const getUserName = (user) => {
  return (
    user?.profile?.full_name?.trim() || user?.full_name?.trim() || "Pengguna"
  );
};

/* ============================================================
 * THEME SELECTOR
 * ============================================================ */

const ThemeSelector = ({ preference, onSelect }) => {
  return (
    <div
      role="radiogroup"
      aria-label="Tema aplikasi"
      className={cx(
        "rounded-xl border border-border",
        "bg-surface-muted/40",
        "p-1.5 sm:p-2",
      )}
    >
      <div className="grid grid-cols-3 gap-1.5 sm:gap-2">
        {THEME_OPTIONS.map((option) => {
          const Icon = option.icon;

          const isSelected = preference === option.value;

          return (
            <Button
              key={option.value}
              type="button"
              variant="ghost"
              size="lg"
              role="radio"
              aria-checked={isSelected}
              aria-label={`${option.label}: ${option.description}`}
              onClick={() => onSelect(option.value)}
              className={cx(
                /* ==================================================
                 * BASE
                 * ================================================== */

                "relative h-auto w-full",
                "rounded-lg border",
                "text-left",
                "transition-[background-color,border-color,color,box-shadow,transform]",
                "duration-(--token-transition-fast)",
                "ease-out",
                "focus-visible:z-10",
                "focus-visible:outline-none",
                "focus-visible:ring-2",
                "focus-visible:ring-primary/30",
                "focus-visible:ring-offset-0",
                "active:scale-[0.98]",
                "motion-reduce:transition-none",
                "motion-reduce:active:scale-100",

                /* ==================================================
                 * MOBILE
                 * ================================================== */

                "min-h-20",
                "flex-col items-center justify-center gap-2",
                "px-2 py-3",
                "text-center",

                /* ==================================================
                 * TABLET / DESKTOP
                 * ================================================== */

                "sm:min-h-28",
                "sm:items-start sm:justify-between",
                "sm:gap-4",
                "sm:px-4 sm:py-4",
                "sm:text-left",

                /* ==================================================
                 * STATE
                 * ================================================== */

                isSelected
                  ? [
                      "border-primary",
                      "bg-surface",
                      "text-text",
                      "shadow-sm",
                      "ring-1 ring-primary/10",
                    ].join(" ")
                  : [
                      "border-border",
                      "bg-surface",
                      "text-text",
                      "hover:border-border-strong",
                      "hover:bg-surface",
                      "hover:shadow-sm",
                      "active:bg-surface-muted",
                    ].join(" "),
              )}
            >
              {/* ==================================================
               * ICON
               * ================================================== */}

              <span className="flex w-full items-center justify-center sm:justify-between">
                <span
                  className={cx(
                    "flex shrink-0 items-center justify-center rounded-lg",
                    "h-9 w-9 sm:h-10 sm:w-10",
                    isSelected
                      ? "bg-primary-soft text-primary"
                      : "bg-surface-muted text-muted",
                  )}
                  aria-hidden="true"
                >
                  <Icon className="h-4 w-4 sm:h-5 sm:w-5" aria-hidden="true" />
                </span>

                {isSelected && (
                  <span
                    className="absolute right-2 top-2 hidden h-5 w-5 items-center justify-center rounded-full bg-primary text-primary-foreground sm:flex"
                    aria-hidden="true"
                  >
                    <CheckIcon className="h-3 w-3" aria-hidden="true" />
                  </span>
                )}
              </span>

              {/* ==================================================
               * CONTENT
               * ================================================== */}

              <span className="min-w-0">
                <span className="block text-xs font-semibold text-text sm:text-sm">
                  {option.label}
                </span>

                <span className="mt-1 hidden text-xs leading-5 text-muted sm:block">
                  {option.description}
                </span>
              </span>

              {/* ==================================================
               * MOBILE SELECTED
               * ================================================== */}

              <span
                className={cx(
                  "h-1.5 w-1.5 rounded-full transition-colors sm:hidden",
                  isSelected ? "bg-primary" : "bg-transparent",
                )}
                aria-hidden="true"
              />
            </Button>
          );
        })}
      </div>
    </div>
  );
};

ThemeSelector.displayName = "ThemeSelector";

/* ============================================================
 * ACCOUNT INFORMATION
 * ============================================================ */

const AccountInformation = ({ name, roleLabel }) => {
  return (
    <div className="divide-y divide-border">
      <div className="flex min-w-0 items-center justify-between gap-4 py-4">
        <p className="shrink-0 text-sm text-muted">Nama</p>

        <p className="min-w-0 max-w-[65%] truncate text-right text-sm font-medium text-text">
          {name}
        </p>
      </div>

      <div className="flex min-w-0 items-center justify-between gap-4 py-4">
        <p className="shrink-0 text-sm text-muted">Peran</p>

        <p className="shrink-0 text-right text-sm font-medium text-text">
          {roleLabel}
        </p>
      </div>
    </div>
  );
};

AccountInformation.displayName = "AccountInformation";

/* ============================================================
 * PAGE
 * ============================================================ */

const SettingsPage = ({ role = "teacher" }) => {
  const { user } = useAuth();

  const { preference, setPreference } = useTheme();

  const roleConfig = ROLE_CONFIG[role] ?? ROLE_CONFIG.teacher;

  const userName = getUserName(user);

  return (
    <PageContainer title="Pengaturan" subtitle="Atur tampilan dan akun.">
      <ContentBlock>
        <div className="divide-y divide-border">
          {/* ==================================================
           * APPEARANCE
           * ================================================== */}

          <section aria-labelledby="appearance-title" className="pb-6">
            <SectionTitle
              title="Tampilan"
              description="Pilih tema yang nyaman."
            />

            <div className="mt-4">
              <ThemeSelector preference={preference} onSelect={setPreference} />
            </div>
          </section>

          {/* ==================================================
           * ACCOUNT
           * ================================================== */}

          <section aria-labelledby="account-title" className="pt-6">
            <SectionTitle title="Akun" description="Info akun Anda." />

            <div
              className={cx(
                "mt-4 rounded-xl border border-border",
                "bg-surface-muted/30",
                "px-4 sm:px-5",
              )}
            >
              <AccountInformation
                name={userName}
                roleLabel={roleConfig.label}
              />
            </div>
          </section>
        </div>
      </ContentBlock>
    </PageContainer>
  );
};

SettingsPage.displayName = "SettingsPage";

export default SettingsPage;
