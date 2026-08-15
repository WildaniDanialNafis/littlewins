// src/layouts/AuthLayout.jsx

import { Outlet } from "react-router-dom";

import { APP_NAME, APP_TAGLINE } from "@/shared/constants";
import { LogoIcon } from "@/shared/icons";
import { cx } from "@/shared/utils";

export const AuthLayout = ({ children, className = "" }) => {
  const content = children ?? <Outlet />;

  return (
    <div
      className={cx(
        "flex min-h-screen flex-col items-center justify-center",
        "bg-background p-4 sm:p-6",
        className,
      )}
    >
      <div className="w-full max-w-md space-y-6">
        <div className="text-center">
          <LogoIcon className="mx-auto h-12 w-12" aria-hidden="true" />

          <h1 className="mt-4 text-2xl font-bold text-text">{APP_NAME}</h1>

          <p className="mt-1 text-sm text-muted">{APP_TAGLINE}</p>
        </div>

        <div className="rounded-2xl bg-surface p-6 shadow-md sm:p-8">
          {content}
        </div>
      </div>
    </div>
  );
};

AuthLayout.displayName = "AuthLayout";

export default AuthLayout;
