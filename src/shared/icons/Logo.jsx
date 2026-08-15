// src/shared/icons/Logo.jsx

import { cx } from "@/shared/utils/cx";

const LogoIcon = ({ className = "h-8 w-8", ...props }) => {
  return (
    <svg
      {...props}
      className={cx("shrink-0", className)}
      viewBox="0 0 48 48"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      role="img"
      aria-label="LittleWins logo"
    >
      <rect
        x="2"
        y="2"
        width="44"
        height="44"
        rx="13"
        fill="var(--color-primary-soft)"
      />

      <path
        d="M10.5 11.5L11.7 14.3L14.5 15.5L11.7 16.7L10.5 19.5L9.3 16.7L6.5 15.5L9.3 14.3L10.5 11.5Z"
        fill="var(--color-info)"
      />

      <path
        d="M34 10.5V28"
        stroke="var(--color-primary-dark)"
        strokeWidth="2.5"
        strokeLinecap="round"
      />

      <path
        d="M34.2 11C37.1 12.1 39.2 11.6 41.5 10.9V18.7C39.2 18 37.1 18.5 34.2 17.4V11Z"
        fill="var(--color-primary)"
      />

      <path
        d="M36.1 14.3L37.4 15.6L39.7 13.2"
        stroke="var(--color-primary-foreground)"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />

      <path
        d="M23.5 11L26.1 17.4L33 17.9L27.7 22.1L29.4 28.8L23.5 25.1L17.6 28.8L19.3 22.1L14 17.9L20.9 17.4Z"
        fill="var(--color-warning)"
      />

      <path
        d="M23.5 12.2L25.8 17.9"
        stroke="var(--color-warning-hover)"
        strokeWidth="1"
        strokeLinecap="round"
        opacity="0.55"
      />

      <circle cx="20.8" cy="20.1" r="1" fill="var(--color-text)" />

      <path
        d="M25.2 20.1C25.8 19.4 26.6 19.5 27.1 20.1"
        stroke="var(--color-text)"
        strokeWidth="1.2"
        strokeLinecap="round"
      />

      <path
        d="M21.5 22.5C22.4 23.4 24 23.4 25 22.5"
        stroke="var(--color-text)"
        strokeWidth="1.2"
        strokeLinecap="round"
      />

      <path
        d="M3.5 35C9 29.8 14.4 28.5 19.5 30.3C24.6 32.1 28.8 32.5 33.3 30.7C38 28.8 42.1 30.1 44.5 32.1V46H3.5V35Z"
        fill="var(--color-primary)"
      />

      <path
        d="M5.5 35C10.3 31.3 14.7 30.6 19.1 32C23.8 33.5 28.3 34 33.2 32"
        stroke="var(--color-primary-hover)"
        strokeWidth="1.3"
        strokeLinecap="round"
        opacity="0.7"
      />

      <circle cx="39" cy="27" r="2" fill="var(--color-success)" />
    </svg>
  );
};

LogoIcon.displayName = "LogoIcon";

export default LogoIcon;
