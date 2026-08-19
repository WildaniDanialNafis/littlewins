import { Outlet } from "react-router-dom";

import { cx } from "@/shared/utils";

import { Footer, Header } from "./components";

export const MainLayout = ({ className = "" }) => {
  return (
    <div
      className={cx(
        "flex min-h-svh w-full flex-col",
        "bg-background text-text",
        className,
      )}
    >
      <a
        href="#main-content"
        className={cx(
          "sr-only",
          "fixed left-4 top-4 z-(--token-z-toast)",
          "rounded-lg",
          "border border-border",
          "bg-surface",
          "px-4 py-2.5",
          "text-sm font-medium text-text",
          "shadow-md",
          "focus:not-sr-only",
          "focus:outline-none",
          "focus:ring-2",
          "focus:ring-primary/30",
          "focus:ring-offset-2",
          "focus:ring-offset-background",
        )}
      >
        Langsung ke konten
      </a>

      <Header />

      <main
        id="main-content"
        tabIndex={-1}
        className={cx("min-w-0 flex-1", "focus:outline-none")}
      >
        <Outlet />
      </main>

      <Footer />
    </div>
  );
};

MainLayout.displayName = "MainLayout";

export default MainLayout;
