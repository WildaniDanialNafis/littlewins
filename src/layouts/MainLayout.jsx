import { Outlet } from "react-router-dom";

import { cx } from "@/shared/utils";

import { Footer, Header } from "./components";

export const MainLayout = ({ className = "" }) => {
  return (
    <div
      className={cx(
        "flex min-h-screen flex-col bg-background text-text",
        className,
      )}
    >
      <a
        href="#main-content"
        className={[
          "sr-only focus:not-sr-only focus:absolute",
          "focus:left-4 focus:top-4 focus:z-50",
          "z-50 rounded-lg bg-surface px-4 py-2",
          "text-primary shadow-md ring-2 ring-primary/30",
          "focus:outline-none",
        ].join(" ")}
      >
        Langsung ke konten
      </a>

      <Header />

      <main
        id="main-content"
        className="mx-auto w-full max-w-7xl flex-1 px-4 py-6 sm:px-6 md:py-8 lg:px-8 lg:py-10"
      >
        <Outlet />
      </main>

      <Footer />
    </div>
  );
};

MainLayout.displayName = "MainLayout";

export default MainLayout;
