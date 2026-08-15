import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";

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

  const [email, setEmail] = useState("");
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

    const normalizedEmail = email.trim();

    if (!normalizedEmail || !password) {
      setError("Email dan password wajib diisi.");
      return;
    }

    try {
      const user = await login(normalizedEmail, password);

      if (user?.role === "teacher") {
        navigate(ROUTES.teacher.dashboard);
        return;
      }

      if (user?.role === "student") {
        navigate(ROUTES.student.dashboard);
        return;
      }

      navigate(ROUTES.home);
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
          Masukkan email dan password untuk melanjutkan.
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
            id="email"
            label="Email"
            type="email"
            value={email}
            onChange={handleFieldChange(setEmail)}
            placeholder="masukkan@email.com"
            required
            disabled={loading}
            autoComplete="email"
            autoFocus
          />

          <Input
            id="password"
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

      <p className="text-center text-sm text-muted">
        Belum punya akun?{" "}
        <Link
          to={ROUTES.register}
          className="font-semibold text-primary transition-colors hover:text-primary-hover focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/30 focus-visible:ring-offset-2 focus-visible:ring-offset-background"
        >
          Daftar Sekarang
        </Link>
      </p>
    </div>
  );
};

LoginPage.displayName = "LoginPage";

export default LoginPage;
