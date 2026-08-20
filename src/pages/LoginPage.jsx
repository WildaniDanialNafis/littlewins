import { useCallback, useState } from "react";

import { useNavigate } from "react-router-dom";

import { Button, Input } from "@/shared/components/ui";

import { ContentBlock } from "@/shared/components/layout";

import { APP_NAME, APP_TAGLINE, ROUTES } from "@/shared/constants";

import { useAuth } from "@/shared/hooks";

import { LogoIcon } from "@/shared/icons";

/* ============================================================
 * CONSTANTS
 * ============================================================ */

const ROLE_ROUTES = Object.freeze({
  teacher: ROUTES.teacher.dashboard,
  student: ROUTES.student.dashboard,
});

/* ============================================================
 * HELPERS
 * ============================================================ */

const normalizeUsername = (value) => {
  return String(value ?? "").trim();
};

const getErrorMessage = (error) => {
  if (error instanceof Error) {
    return error.message;
  }

  if (error && typeof error.message === "string") {
    return error.message;
  }

  return "Login gagal. Coba lagi.";
};

/* ============================================================
 * BRAND
 * ============================================================ */

const LoginBrand = () => {
  return (
    <div className="flex min-w-0 items-center gap-3">
      <div
        className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-primary-soft text-primary"
        aria-hidden="true"
      >
        <LogoIcon className="h-6 w-6" aria-hidden="true" />
      </div>

      <div className="min-w-0">
        <p className="truncate text-sm font-bold text-text">{APP_NAME}</p>

        <p className="truncate text-xs text-muted">{APP_TAGLINE}</p>
      </div>
    </div>
  );
};

LoginBrand.displayName = "LoginBrand";

/* ============================================================
 * LOGIN PAGE
 * ============================================================ */

const LoginPage = () => {
  const navigate = useNavigate();

  const { login, loading } = useAuth();

  const [username, setUsername] = useState("");

  const [password, setPassword] = useState("");

  const [error, setError] = useState(null);

  /* ==========================================================
   * INPUT
   * ========================================================== */

  const handleUsernameChange = useCallback((event) => {
    setUsername(event.target.value);
    setError(null);
  }, []);

  const handlePasswordChange = useCallback((event) => {
    setPassword(event.target.value);
    setError(null);
  }, []);

  /* ==========================================================
   * SUBMIT
   * ========================================================== */

  const handleSubmit = useCallback(
    async (event) => {
      event.preventDefault();

      if (loading) {
        return;
      }

      setError(null);

      const normalizedUsername = normalizeUsername(username);

      if (!normalizedUsername) {
        setError("Username wajib diisi.");

        return;
      }

      if (!password) {
        setError("Password wajib diisi.");

        return;
      }

      try {
        const user = await login(normalizedUsername, password);

        const dashboard = ROLE_ROUTES[user?.role];

        if (!dashboard) {
          setError("Role akun tidak valid.");

          return;
        }

        navigate(dashboard, {
          replace: true,
        });
      } catch (loginError) {
        setError(getErrorMessage(loginError));
      }
    },
    [loading, username, password, login, navigate],
  );

  return (
    <div className="mx-auto w-full max-w-5xl">
      <ContentBlock className="overflow-hidden p-0">
        <div className="grid min-w-0 lg:grid-cols-[0.8fr_1.2fr]">
          {/* ==================================================
           * BRAND PANEL
           * ================================================== */}

          <section
            aria-label="Informasi aplikasi"
            className="
              hidden min-w-0
              bg-surface-muted/30
              p-8
              lg:flex lg:items-center
              lg:p-10
              xl:p-12
            "
          >
            <div className="w-full max-w-sm">
              <LoginBrand />

              <div className="mt-8">
                <p className="text-sm font-semibold text-primary">
                  Selamat datang
                </p>

                <h1 className="mt-2 text-3xl font-bold tracking-tight text-text">
                  Masuk ke {APP_NAME}.
                </h1>

                <p className="mt-2 text-sm leading-6 text-muted">
                  Akses aplikasi sesuai akun Anda.
                </p>
              </div>
            </div>
          </section>

          {/* ==================================================
           * LOGIN
           * ================================================== */}

          <section
            aria-labelledby="login-title"
            className="min-w-0 p-5 sm:p-8 lg:p-10 xl:p-12"
          >
            <div className="mx-auto w-full max-w-md">
              {/* ==================================================
               * MOBILE BRAND
               * ================================================== */}

              <div className="mb-6 lg:hidden">
                <LoginBrand />
              </div>

              {/* ==================================================
               * HEADER
               * ================================================== */}

              <header>
                <p className="text-sm font-semibold text-primary">
                  Selamat datang
                </p>

                <h2
                  id="login-title"
                  className="mt-1 text-2xl font-bold tracking-tight text-text sm:text-3xl"
                >
                  Masuk ke {APP_NAME}
                </h2>

                <p className="mt-2 text-sm leading-5 text-muted">
                  Masukkan akun Anda untuk lanjut.
                </p>
              </header>

              {/* ==================================================
               * FORM
               * ================================================== */}

              <div className="mt-6">
                <form onSubmit={handleSubmit} className="space-y-5" noValidate>
                  {/* ==================================================
                   * ERROR
                   * ================================================== */}

                  {error && (
                    <div
                      role="alert"
                      aria-live="polite"
                      className="
                        rounded-xl
                        border border-danger/20
                        bg-danger-soft
                        px-4 py-3
                        text-sm leading-5
                        text-danger
                      "
                    >
                      {error}
                    </div>
                  )}

                  {/* ==================================================
                   * INPUTS
                   * ================================================== */}

                  <div className="space-y-4">
                    <Input
                      id="username"
                      name="username"
                      label="Username"
                      type="text"
                      value={username}
                      onChange={handleUsernameChange}
                      placeholder="Username"
                      required
                      disabled={loading}
                      autoComplete="username"
                      autoCapitalize="none"
                      autoCorrect="off"
                      spellCheck={false}
                      autoFocus
                    />

                    <Input
                      id="password"
                      name="password"
                      label="Password"
                      type="password"
                      value={password}
                      onChange={handlePasswordChange}
                      placeholder="Password"
                      required
                      disabled={loading}
                      autoComplete="current-password"
                    />
                  </div>

                  {/* ==================================================
                   * SUBMIT
                   * ================================================== */}

                  <Button
                    type="submit"
                    variant="primary"
                    size="lg"
                    fullWidth
                    loading={loading}
                    disabled={loading}
                    className="mt-1"
                  >
                    {loading ? "Memproses..." : "Masuk"}
                  </Button>
                </form>
              </div>

              {/* ==================================================
               * FOOTER
               * ================================================== */}

              <p className="mt-5 text-center text-xs leading-5 text-muted">
                Gunakan akun yang diberikan.
              </p>
            </div>
          </section>
        </div>
      </ContentBlock>
    </div>
  );
};

LoginPage.displayName = "LoginPage";

export default LoginPage;
