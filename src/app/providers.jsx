import { AuthProvider } from "@/contexts/AuthContext";

import { ThemeProvider } from "@/contexts/ThemeContext";

import { ToastProvider } from "@/contexts/ToastContext";

import { ErrorBoundary } from "@/shared/components/ui";

export const Providers = ({ children }) => {
  return (
    <AuthProvider>
      <ThemeProvider>
        <ToastProvider>
          <ErrorBoundary>{children}</ErrorBoundary>
        </ToastProvider>
      </ThemeProvider>
    </AuthProvider>
  );
};

Providers.displayName = "Providers";

export default Providers;
