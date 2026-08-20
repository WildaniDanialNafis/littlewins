import { Component } from "react";

import Button from "./Button";

class ErrorBoundary extends Component {
  constructor(props) {
    super(props);

    this.state = {
      hasError: false,
      error: null,
    };
  }

  static getDerivedStateFromError(error) {
    return {
      hasError: true,
      error,
    };
  }

  componentDidCatch(error, errorInfo) {
    if (import.meta.env.DEV) {
      console.error("UI ErrorBoundary:", error, errorInfo);
    }
  }

  handleRetry = () => {
    this.setState({
      hasError: false,
      error: null,
    });
  };

  handleReload = () => {
    window.location.reload();
  };

  render() {
    if (!this.state.hasError) {
      return this.props.children;
    }

    return (
      <main className="flex min-h-screen items-center justify-center px-4 py-10">
        <section
          className="w-full max-w-md rounded-2xl bg-surface p-6 text-center sm:p-7"
          role="alert"
        >
          <div
            className="mx-auto flex size-12 items-center justify-center rounded-2xl bg-danger-soft text-danger"
            aria-hidden="true"
          >
            <svg
              className="size-6"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M12 9v4" />
              <path d="M12 17h.01" />
              <path d="M10.3 3.7 2.1 18a2 2 0 0 0 1.7 3h16.4a2 2 0 0 0 1.7-3L13.7 3.7a2 2 0 0 0-3.4 0Z" />
            </svg>
          </div>

          <h1 className="mt-4 text-lg font-semibold text-text">
            Terjadi kesalahan
          </h1>

          <p className="mt-2 text-sm leading-relaxed text-muted">
            Halaman mengalami masalah yang tidak terduga. Anda dapat mencoba
            memulihkannya atau memuat ulang aplikasi.
          </p>

          <div className="mt-6 flex flex-col gap-2 sm:flex-row sm:justify-center">
            <Button
              type="button"
              variant="secondary"
              onClick={this.handleRetry}
            >
              Coba Lagi
            </Button>

            <Button type="button" variant="primary" onClick={this.handleReload}>
              Muat Ulang
            </Button>
          </div>

          {import.meta.env.DEV && this.state.error && (
            <details className="mt-5 text-left">
              <summary className="cursor-pointer text-xs font-medium text-muted">
                Detail error
              </summary>

              <pre className="mt-2 max-h-56 overflow-auto rounded-xl bg-surface-muted p-3 text-xs leading-relaxed text-muted">
                {this.state.error?.stack ?? String(this.state.error)}
              </pre>
            </details>
          )}
        </section>
      </main>
    );
  }
}

ErrorBoundary.displayName = "ErrorBoundary";

export default ErrorBoundary;
