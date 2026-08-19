import { useCallback, useState } from "react";

import { useNavigate } from "react-router-dom";

import { Button, Input } from "@/shared/components/ui";

import { ContentBlock } from "@/shared/components/layout";

import { APP_NAME, APP_TAGLINE, ROUTES } from "@/shared/constants";

import { useAuth } from "@/shared/hooks";

import { LogoIcon } from "@/shared/icons";

const ROLE_ROUTES = Object.freeze({
  teacher: ROUTES.teacher.dashboard,

  student: ROUTES.student.dashboard,
});

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

  return "Login gagal. Silakan coba lagi.";
};

const LoginPage = () => {
  const navigate = useNavigate();

  const { login, loading } = useAuth();

  const [username, setUsername] = useState("");

  const [password, setPassword] = useState("");

  const [error, setError] = useState(null);

  const handleUsernameChange = useCallback((event) => {
    setUsername(event.target.value);

    setError(null);
  }, []);

  const handlePasswordChange = useCallback((event) => {
    setPassword(event.target.value);

    setError(null);
  }, []);

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
          setError("Akun tidak memiliki role yang valid.");

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
      <div className="overflow-hidden rounded-2xl border border-border bg-surface shadow-sm sm:rounded-3xl lg:grid lg:grid-cols-2">
        <section className="hidden items-center justify-center bg-background px-10 py-12 lg:flex xl:px-14">
          <div className="w-full max-w-sm text-center">
            <div className="mx-auto flex size-12 items-center justify-center text-primary">
              <LogoIcon className="size-full" aria-hidden="true" />
            </div>

            <h1 className="mt-4 text-2xl font-bold tracking-tight text-text">
              {APP_NAME}
            </h1>

            <p className="mx-auto mt-2 max-w-sm text-sm leading-6 text-muted">
              {APP_TAGLINE}
            </p>
          </div>
        </section>

        <section className="flex items-center px-5 py-8 sm:px-8 sm:py-10 lg:px-10 xl:px-12">
          <div className="mx-auto w-full max-w-md">
            <header className="mb-6 text-center lg:mb-7 lg:text-left">
              <div className="mb-5 flex justify-center lg:hidden">
                <div className="flex size-11 items-center justify-center text-primary">
                  <LogoIcon className="size-full" aria-hidden="true" />
                </div>
              </div>

              <h2 className="text-2xl font-bold tracking-tight text-text sm:text-3xl">
                Masuk ke {APP_NAME}
              </h2>

              <p className="mt-2 text-sm leading-6 text-muted">
                Masukkan username dan password untuk melanjutkan.
              </p>

              <p className="mt-2 text-sm leading-6 text-muted lg:hidden">
                {APP_TAGLINE}
              </p>
            </header>

            <ContentBlock>
              <form onSubmit={handleSubmit} className="space-y-5" noValidate>
                {error && (
                  <div
                    role="alert"
                    className="rounded-xl border border-danger/20 bg-danger-soft px-4 py-3 text-sm leading-5 text-danger"
                  >
                    {error}
                  </div>
                )}

                <div className="space-y-4">
                  <Input
                    id="username"
                    name="username"
                    label="Username"
                    type="text"
                    value={username}
                    onChange={handleUsernameChange}
                    placeholder="Masukkan username"
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
                    placeholder="••••••••"
                    required
                    disabled={loading}
                    autoComplete="current-password"
                  />
                </div>

                <Button
                  type="submit"
                  variant="primary"
                  size="lg"
                  fullWidth
                  loading={loading}
                  disabled={loading}
                  className="mt-2"
                >
                  {loading ? "Memproses..." : "Masuk"}
                </Button>
              </form>
            </ContentBlock>
          </div>
        </section>
      </div>
    </div>
  );
};

LoginPage.displayName = "LoginPage";

export default LoginPage;
