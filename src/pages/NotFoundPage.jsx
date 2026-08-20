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
    <main
      className="
        flex min-h-screen items-center justify-center
        bg-background
        px-4 py-6
        sm:px-6 sm:py-10
      "
    >
      <div className="w-full max-w-md">
        <ContentBlock className="overflow-hidden p-0">
          {/* ==================================================
           * CONTENT
           * ================================================== */}

          <div
            className="
              px-5 py-8
              text-center
              sm:px-8 sm:py-10
            "
          >
            {/* ==================================================
             * BRAND
             * ================================================== */}

            <div
              className="
                mx-auto flex h-12 w-12
                items-center justify-center
                rounded-xl
                bg-primary-soft
                text-primary
              "
              aria-hidden="true"
            >
              <LogoIcon className="h-6 w-6" aria-hidden="true" />
            </div>

            {/* ==================================================
             * ERROR CODE
             * ================================================== */}

            <p
              className="
                mt-5
                text-6xl font-bold
                leading-none tracking-tight
                text-text
                sm:text-7xl
              "
              aria-hidden="true"
            >
              404
            </p>

            {/* ==================================================
             * MESSAGE
             * ================================================== */}

            <div className="mt-4">
              <h1
                className="
                  text-xl font-bold
                  tracking-tight text-text
                  sm:text-2xl
                "
              >
                Halaman Tidak Ditemukan
              </h1>

              <p
                className="
                  mt-2
                  text-sm leading-5
                  text-muted
                  sm:text-base
                "
              >
                Halaman ini tidak tersedia.
              </p>
            </div>

            {/* ==================================================
             * ACTION
             * ================================================== */}

            <div className="mt-6">
              <Button
                as={Link}
                to={ROUTES.home}
                variant="primary"
                size="lg"
                className="w-full sm:w-auto"
              >
                Kembali ke Beranda
              </Button>
            </div>
          </div>

          {/* ==================================================
           * FOOTER
           * ================================================== */}

          <footer
            className="
              border-t border-border
              bg-surface-muted/20
              px-5 py-4
              text-center
              sm:px-8
            "
          >
            <p className="text-xs leading-5 text-muted">
              © {currentYear} {APP_NAME}
            </p>
          </footer>
        </ContentBlock>
      </div>
    </main>
  );
};

NotFoundPage.displayName = "NotFoundPage";

export default NotFoundPage;
