import { AuthProvider } from "@/contexts/AuthContext";

import { ThemeProvider } from "@/contexts/ThemeContext";

import { ToastProvider } from "@/contexts/ToastContext";

export const Providers = ({ children }) => {
  return (
    <AuthProvider>
      <ThemeProvider>
        <ToastProvider>{children}</ToastProvider>
      </ThemeProvider>
    </AuthProvider>
  );
};

Providers.displayName = "Providers";

export default Providers;
