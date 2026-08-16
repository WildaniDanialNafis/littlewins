import { useState } from "react";
import { useNavigate } from "react-router-dom";

import { Button, Input } from "@/shared/components/ui";

import { ContentBlock } from "@/shared/components/layout";

import { APP_NAME, ROUTES } from "@/shared/constants";

import { useAuth } from "@/shared/hooks";

/* ============================================================
 * PAGE
 * ============================================================ */

const LoginPage = () => {
  const navigate = useNavigate();

  const { login, loading } = useAuth();

  const [username, setUsername] = useState("");

  const [password, setPassword] = useState("");

  const [error, setError] = useState(null);

  /* ==========================================================
   * HANDLERS
   * ========================================================== */

  const handleFieldChange = (setter) => {
    return (event) => {
      setter(event.target.value);

      if (error) {
        setError(null);
      }
    };
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    setError(null);

    const normalizedUsername = username.trim();

    if (!normalizedUsername || !password) {
      setError("Username dan password wajib diisi.");

      return;
    }

    try {
      const user = await login(normalizedUsername, password);

      if (user?.role === "teacher") {
        navigate(ROUTES.teacher.dashboard, {
          replace: true,
        });

        return;
      }

      if (user?.role === "student") {
        navigate(ROUTES.student.dashboard, {
          replace: true,
        });

        return;
      }

      navigate(ROUTES.login, {
        replace: true,
      });
    } catch (error) {
      setError(
        error instanceof Error
          ? error.message
          : "Login gagal. Silakan coba lagi.",
      );
    }
  };

  /* ==========================================================
   * VIEW
   * ========================================================== */

  return (
    <div className="space-y-6">
      <header className="text-center">
        <h1 className="text-2xl font-bold tracking-tight text-text">
          Masuk ke {APP_NAME}
        </h1>

        <p className="mt-1 text-sm leading-relaxed text-muted">
          Masukkan username dan password untuk melanjutkan.
        </p>
      </header>

      <ContentBlock>
        <form onSubmit={handleSubmit} className="space-y-4" noValidate>
          {error && (
            <div
              role="alert"
              className="rounded-lg border border-danger/20 bg-danger-soft px-4 py-3 text-sm text-danger"
            >
              {error}
            </div>
          )}

          <Input
            id="username"
            name="username"
            label="Username"
            type="text"
            value={username}
            onChange={handleFieldChange(setUsername)}
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
            onChange={handleFieldChange(setPassword)}
            placeholder="••••••••"
            required
            disabled={loading}
            autoComplete="current-password"
          />

          <Button
            type="submit"
            variant="primary"
            size="lg"
            fullWidth
            loading={loading}
            disabled={loading}
            className="mt-6"
          >
            {loading ? "Memproses..." : "Masuk"}
          </Button>
        </form>
      </ContentBlock>
    </div>
  );
};

LoginPage.displayName = "LoginPage";

export default LoginPage;
