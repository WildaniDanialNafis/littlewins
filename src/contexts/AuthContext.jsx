import {
  createContext,
  useCallback,
  useEffect,
  useMemo,
  useState,
} from "react";

import { ROUTES, STORAGE_KEYS } from "@/shared/constants";

import authService from "@/services/api/authService";

const AuthContext = createContext(null);

AuthContext.displayName = "AuthContext";

/* ============================================================
 * STORAGE
 * ============================================================ */

const getStoredAuth = () => {
  try {
    const storedUser = localStorage.getItem(STORAGE_KEYS.user);

    const token = localStorage.getItem(STORAGE_KEYS.authToken);

    if (!storedUser || !token) {
      return {
        user: null,
        token: null,
      };
    }

    return {
      user: JSON.parse(storedUser),
      token,
    };
  } catch {
    localStorage.removeItem(STORAGE_KEYS.user);

    localStorage.removeItem(STORAGE_KEYS.authToken);

    return {
      user: null,
      token: null,
    };
  }
};

const saveAuth = (user, token) => {
  localStorage.setItem(STORAGE_KEYS.user, JSON.stringify(user));

  localStorage.setItem(STORAGE_KEYS.authToken, token);
};

const clearAuth = () => {
  localStorage.removeItem(STORAGE_KEYS.user);

  localStorage.removeItem(STORAGE_KEYS.authToken);

  localStorage.removeItem(STORAGE_KEYS.refreshToken);
};

/* ============================================================
 * PROVIDER
 * ============================================================ */

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);

  const [loading, setLoading] = useState(true);

  const [error, setError] = useState(null);

  /* ==========================================================
   * RESTORE SESSION
   * ========================================================== */

  useEffect(() => {
    const restoreSession = async () => {
      const { user: storedUser, token } = getStoredAuth();

      if (!storedUser || !token) {
        setLoading(false);
        return;
      }

      setUser(storedUser);
      setLoading(false);
    };

    restoreSession();
  }, []);

  /* ==========================================================
   * LOGIN
   * ========================================================== */

  const login = useCallback(async (username, password) => {
    setError(null);
    setLoading(true);

    try {
      const normalizedUsername = String(username ?? "")
        .trim()
        .toLowerCase();

      if (!normalizedUsername) {
        throw new Error("Username wajib diisi.");
      }

      if (!password) {
        throw new Error("Password wajib diisi.");
      }

      const response = await authService.login(normalizedUsername, password);

      const { user, token } = response ?? {};

      if (!user) {
        throw new Error("Data pengguna tidak ditemukan.");
      }

      if (!token) {
        throw new Error("Token autentikasi tidak ditemukan.");
      }

      saveAuth(user, token);

      setUser(user);

      return user;
    } catch (error) {
      const normalizedError =
        error instanceof Error ? error : new Error("Login gagal.");

      setError(normalizedError);

      throw normalizedError;
    } finally {
      setLoading(false);
    }
  }, []);

  /* ==========================================================
   * LOGOUT
   * ========================================================== */

  const logout = useCallback(async () => {
    setError(null);
    setLoading(true);

    try {
      await authService.logout();
    } catch {
      /*
       * Session lokal tetap dibersihkan
       * meskipun request logout gagal.
       */
    } finally {
      clearAuth();
      setUser(null);

      setLoading(false);

      window.location.assign(ROUTES.login);
    }
  }, []);

  /* ==========================================================
   * UPDATE USER
   * ========================================================== */

  const updateUser = useCallback((updatedUser) => {
    setUser(updatedUser);

    try {
      localStorage.setItem(STORAGE_KEYS.user, JSON.stringify(updatedUser));
    } catch (error) {
      const normalizedError =
        error instanceof Error
          ? error
          : new Error("Gagal menyimpan data pengguna.");

      setError(normalizedError);

      throw normalizedError;
    }
  }, []);

  /* ==========================================================
   * CONTEXT VALUE
   * ========================================================== */

  const value = useMemo(
    () => ({
      user,
      loading,
      error,

      login,
      logout,
      updateUser,

      isAuthenticated: Boolean(user),

      isTeacher: user?.role === "teacher",

      isStudent: user?.role === "student",
    }),
    [user, loading, error, login, logout, updateUser],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

AuthProvider.displayName = "AuthProvider";

export { AuthContext };
