import { Link } from "react-router-dom";

import { ContentBlock } from "@/shared/components/layout";
import { Button } from "@/shared/components/ui";

import { APP_NAME, ROUTES } from "@/shared/constants";

import { LogoIcon } from "@/shared/icons";

/* ============================================================
 * PAGE
 * ============================================================ */

const NotFoundPage = () => {
  const currentYear = new Date().getFullYear();

  return (
    <main className="flex min-h-screen items-center justify-center bg-background px-4 py-16">
      <div className="w-full max-w-md">
        <ContentBlock>
          <div className="text-center">
            <div className="mb-6 flex justify-center">
              <LogoIcon className="h-16 w-16" aria-hidden="true" />
            </div>

            <p
              className="text-7xl font-bold tracking-tight text-text"
              aria-hidden="true"
            >
              404
            </p>

            <h1 className="mt-4 text-2xl font-semibold text-text">
              Halaman Tidak Ditemukan
            </h1>

            <p className="mx-auto mt-2 max-w-sm text-sm leading-relaxed text-muted">
              Maaf, halaman yang Anda cari tidak tersedia atau telah
              dipindahkan.
            </p>

            <div className="mt-6 flex justify-center">
              <Button as={Link} to={ROUTES.home} variant="primary" size="md">
                Kembali
              </Button>
            </div>
          </div>

          <footer className="mt-8 border-t border-border pt-5 text-center">
            <p className="text-xs text-muted">
              &copy; {currentYear} {APP_NAME}. All rights reserved.
            </p>
          </footer>
        </ContentBlock>
      </div>
    </main>
  );
};

NotFoundPage.displayName = "NotFoundPage";

export default NotFoundPage;
