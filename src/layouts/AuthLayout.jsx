import { Outlet } from "react-router-dom";

import { APP_NAME } from "@/shared/constants";
import { cx } from "@/shared/utils";

const CURRENT_YEAR = new Date().getFullYear();

export const AuthLayout = ({ children, className = "" }) => {
  const content = children ?? <Outlet />;

  return (
    <main
      className={cx(
        "flex min-h-svh w-full",
        "items-center justify-center",
        "bg-background",
        "px-(--token-layout-gutter)",
        "py-6 sm:py-8 lg:py-10",
        "safe-area-top safe-area-bottom",
        className,
      )}
    >
      <div className="w-full min-w-0">
        {content}

        <footer className="mt-5 text-center sm:mt-6">
          <p className="text-xs leading-5 text-muted">
            &copy; {CURRENT_YEAR} {APP_NAME}
          </p>
        </footer>
      </div>
    </main>
  );
};

AuthLayout.displayName = "AuthLayout";

export default AuthLayout;
