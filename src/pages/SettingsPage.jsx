import { forwardRef, useRef } from "react";

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
    description: "Mengikuti tema perangkat Anda.",
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
    description: "Gunakan tema gelap.",
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
 * THEME OPTION
 * ============================================================ */

const ThemeOption = forwardRef(
  ({ option, isSelected, tabIndex, onSelect, onKeyDown }, ref) => {
    const Icon = option.icon;

    return (
      <Button
        ref={ref}
        type="button"
        variant="ghost"
        size="lg"
        role="radio"
        aria-checked={isSelected}
        tabIndex={tabIndex}
        onClick={() => onSelect(option.value)}
        onKeyDown={onKeyDown}
        className={cx(
          "h-auto min-h-28 w-full",
          "flex-col items-start justify-between",
          "gap-4 rounded-lg border",
          "px-4 py-4 text-left",
          "transition-[background-color,border-color,color,box-shadow]",
          "duration-(--token-transition-fast)",
          "ease-out",
          "motion-reduce:transition-none",
          "focus-visible:ring-offset-background",

          isSelected
            ? [
                "border-primary",
                "bg-primary-soft/40",
                "ring-1 ring-primary/20",
              ].join(" ")
            : [
                "border-border",
                "bg-surface",
                "hover:border-border-strong",
                "hover:bg-surface-muted",
                "active:bg-surface-muted",
              ].join(" "),
        )}
      >
        <span className="flex w-full items-center justify-between">
          <span
            className={cx(
              "flex h-10 w-10 items-center justify-center rounded-lg",
              isSelected
                ? "bg-primary-soft text-primary"
                : "bg-surface-muted text-muted",
            )}
            aria-hidden="true"
          >
            <Icon className="h-5 w-5" />
          </span>

          {isSelected && (
            <span
              className="flex h-5 w-5 items-center justify-center rounded-full bg-primary text-primary-foreground"
              aria-hidden="true"
            >
              <CheckIcon className="h-3 w-3" />
            </span>
          )}
        </span>

        <span className="min-w-0">
          <span className="block text-sm font-semibold text-text">
            {option.label}
          </span>

          <span className="mt-1 block text-xs leading-relaxed text-muted">
            {option.description}
          </span>
        </span>
      </Button>
    );
  },
);

ThemeOption.displayName = "ThemeOption";

/* ============================================================
 * ACCOUNT INFORMATION
 * ============================================================ */

const AccountInformation = ({ name, roleLabel }) => {
  return (
    <dl className="divide-y divide-border">
      <div
        className={cx(
          "flex flex-col gap-1.5 px-5 py-4",
          "sm:flex-row sm:items-center sm:justify-between",
          "sm:px-6",
        )}
      >
        <dt className="text-sm text-muted">Nama</dt>

        <dd className="wrap-break-word text-sm font-medium text-text sm:text-right">
          {name}
        </dd>
      </div>

      <div
        className={cx(
          "flex flex-col gap-1.5 px-5 py-4",
          "sm:flex-row sm:items-center sm:justify-between",
          "sm:px-6",
        )}
      >
        <dt className="text-sm text-muted">Peran</dt>

        <dd className="text-sm font-medium text-text sm:text-right">
          {roleLabel}
        </dd>
      </div>
    </dl>
  );
};

AccountInformation.displayName = "AccountInformation";

/* ============================================================
 * PAGE
 * ============================================================ */

const SettingsPage = ({ role = "teacher" }) => {
  const { user } = useAuth();

  const { preference, setPreference } = useTheme();

  const themeRefs = useRef([]);

  const roleConfig = ROLE_CONFIG[role] ?? ROLE_CONFIG.teacher;

  const userName = getUserName(user);

  const selectedIndex = Math.max(
    0,
    THEME_OPTIONS.findIndex((option) => option.value === preference),
  );

  const handleThemeKeyDown = (event, currentIndex) => {
    let nextIndex = null;

    switch (event.key) {
      case "ArrowRight":
      case "ArrowDown":
        nextIndex =
          currentIndex >= THEME_OPTIONS.length - 1 ? 0 : currentIndex + 1;
        break;

      case "ArrowLeft":
      case "ArrowUp":
        nextIndex =
          currentIndex <= 0 ? THEME_OPTIONS.length - 1 : currentIndex - 1;
        break;

      case "Home":
        nextIndex = 0;
        break;

      case "End":
        nextIndex = THEME_OPTIONS.length - 1;
        break;

      default:
        return;
    }

    event.preventDefault();

    const nextOption = THEME_OPTIONS[nextIndex];

    setPreference(nextOption.value);

    requestAnimationFrame(() => {
      themeRefs.current[nextIndex]?.focus();
    });
  };

  return (
    <PageContainer
      title="Pengaturan"
      subtitle="Kelola preferensi dan informasi akun Anda."
      breadcrumb={[
        {
          label: "Pengaturan",
          path: roleConfig.route,
        },
      ]}
    >
      <div className="min-w-0 space-y-8">
        {/* ==================================================
         * APPEARANCE
         * ================================================== */}

        <section aria-labelledby="settings-appearance-title">
          <SectionTitle
            title="Tampilan"
            description="Pilih tema yang paling nyaman untuk digunakan."
            id="settings-appearance-title"
          />

          <ContentBlock className="mt-4">
            <div
              role="radiogroup"
              aria-labelledby="settings-appearance-title"
              className="grid grid-cols-1 gap-3 sm:grid-cols-3"
            >
              {THEME_OPTIONS.map((option, index) => (
                <ThemeOption
                  key={option.value}
                  ref={(element) => {
                    themeRefs.current[index] = element;
                  }}
                  option={option}
                  isSelected={preference === option.value}
                  tabIndex={index === selectedIndex ? 0 : -1}
                  onSelect={setPreference}
                  onKeyDown={(event) => handleThemeKeyDown(event, index)}
                />
              ))}
            </div>
          </ContentBlock>
        </section>

        {/* ==================================================
         * ACCOUNT
         * ================================================== */}

        <section aria-labelledby="settings-account-title">
          <SectionTitle
            title="Akun"
            description="Informasi akun yang sedang digunakan."
            id="settings-account-title"
          />

          <ContentBlock className="mt-4">
            <AccountInformation name={userName} roleLabel={roleConfig.label} />
          </ContentBlock>
        </section>
      </div>
    </PageContainer>
  );
};

SettingsPage.displayName = "SettingsPage";

export default SettingsPage;
