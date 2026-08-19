import {
  createContext,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";

import { ROUTES, STORAGE_KEYS } from "@/shared/constants";

import authService from "@/services/api/authService";

const AuthContext = createContext(null);

AuthContext.displayName = "AuthContext";

/* ============================================================
 * HELPERS
 * ============================================================ */

const normalizeError = (error, fallbackMessage) => {
  if (error instanceof Error) {
    return error;
  }

  if (error && typeof error.message === "string") {
    return new Error(error.message);
  }

  if (typeof error === "string" && error.trim()) {
    return new Error(error);
  }

  return new Error(fallbackMessage);
};

const isAbortError = (error) => {
  return (
    error?.name === "AbortError" ||
    error?.name === "TimeoutError" ||
    error?.code === "ERR_CANCELED" ||
    error?.code === "ABORT_ERR"
  );
};

const normalizeRole = (role) => {
  if (typeof role !== "string") {
    return null;
  }

  const normalized = role.trim().toLowerCase();

  return normalized || null;
};

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

    const parsedUser = JSON.parse(storedUser);

    if (!parsedUser || typeof parsedUser !== "object") {
      throw new Error("Data pengguna tidak valid.");
    }

    return {
      user: parsedUser,
      token,
    };
  } catch {
    clearStoredAuth();

    return {
      user: null,
      token: null,
    };
  }
};

const saveAuth = (user, token) => {
  if (!user || typeof user !== "object") {
    throw new Error("Data pengguna tidak valid.");
  }

  if (typeof token !== "string" || !token.trim()) {
    throw new Error("Token autentikasi tidak valid.");
  }

  try {
    /*
     * Tulis token terlebih dahulu.
     * Jika penyimpanan token gagal,
     * jangan meninggalkan user tanpa token.
     */
    localStorage.setItem(STORAGE_KEYS.authToken, token);

    localStorage.setItem(STORAGE_KEYS.user, JSON.stringify(user));
  } catch (error) {
    clearStoredAuth();

    throw normalizeError(error, "Gagal menyimpan sesi autentikasi.");
  }
};

const saveUser = (user) => {
  if (!user || typeof user !== "object") {
    throw new Error("Data pengguna tidak valid.");
  }

  try {
    localStorage.setItem(STORAGE_KEYS.user, JSON.stringify(user));
  } catch (error) {
    throw normalizeError(error, "Gagal menyimpan data pengguna.");
  }
};

const clearStoredAuth = () => {
  try {
    localStorage.removeItem(STORAGE_KEYS.user);

    localStorage.removeItem(STORAGE_KEYS.authToken);

    localStorage.removeItem(STORAGE_KEYS.refreshToken);
  } catch {
    // Storage mungkin tidak tersedia.
  }
};

/* ============================================================
 * PROVIDER
 * ============================================================ */

export const AuthProvider = ({ children }) => {
  const mountedRef = useRef(false);

  /*
   * Generation untuk invalidasi
   * operasi auth yang sudah obsolete.
   */
  const operationVersionRef = useRef(0);

  const loginPromiseRef = useRef(null);

  const loginControllerRef = useRef(null);

  const logoutPromiseRef = useRef(null);

  const [user, setUser] = useState(null);

  const [loading, setLoading] = useState(true);

  const [error, setError] = useState(null);

  /* ==========================================================
   * MOUNT
   * ========================================================== */

  useEffect(() => {
    mountedRef.current = true;

    return () => {
      mountedRef.current = false;

      operationVersionRef.current += 1;

      loginControllerRef.current?.abort();

      loginControllerRef.current = null;

      loginPromiseRef.current = null;
    };
  }, []);

  /* ==========================================================
   * SESSION RESTORE
   * ========================================================== */

  useEffect(() => {
    const restoreSession = () => {
      const { user: storedUser, token } = getStoredAuth();

      if (!mountedRef.current) {
        return;
      }

      if (!storedUser || !token) {
        setUser(null);
        setLoading(false);
        return;
      }

      setUser(storedUser);
      setError(null);
      setLoading(false);
    };

    restoreSession();

    return undefined;
  }, []);

  /* ==========================================================
   * CROSS-TAB SESSION SYNC
   * ========================================================== */

  useEffect(() => {
    const handleStorage = (event) => {
      if (
        event.key !== STORAGE_KEYS.user &&
        event.key !== STORAGE_KEYS.authToken &&
        event.key !== STORAGE_KEYS.refreshToken
      ) {
        return;
      }

      /*
       * Session dari tab lain berubah.
       *
       * Invalidasi request login lokal
       * agar hasil lama tidak kembali
       * setelah session baru sudah berubah.
       */
      operationVersionRef.current += 1;

      loginControllerRef.current?.abort();

      loginControllerRef.current = null;

      loginPromiseRef.current = null;

      const { user: storedUser, token } = getStoredAuth();

      if (!mountedRef.current) {
        return;
      }

      if (!storedUser || !token) {
        setUser(null);
        setError(null);
        setLoading(false);
        return;
      }

      setUser(storedUser);
      setError(null);
      setLoading(false);
    };

    window.addEventListener("storage", handleStorage);

    return () => {
      window.removeEventListener("storage", handleStorage);
    };
  }, []);

  /* ==========================================================
   * LOGIN
   * ========================================================== */

  const login = useCallback((username, password) => {
    if (loginPromiseRef.current) {
      return loginPromiseRef.current;
    }

    const operationVersion = ++operationVersionRef.current;

    const controller = new AbortController();

    loginControllerRef.current = controller;

    if (mountedRef.current) {
      setError(null);
      setLoading(true);
    }

    const promise = (async () => {
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

        const response = await authService.login(normalizedUsername, password, {
          signal: controller.signal,
        });

        /*
         * Request bisa sudah obsolete
         * ketika response tiba.
         */
        const isCurrent = operationVersion === operationVersionRef.current;

        if (!isCurrent) {
          throw new Error("Operasi autentikasi sudah tidak berlaku.");
        }

        const { user: authenticatedUser, token } = response ?? {};

        if (!authenticatedUser || typeof authenticatedUser !== "object") {
          throw new Error("Data pengguna tidak ditemukan.");
        }

        if (typeof token !== "string" || !token.trim()) {
          throw new Error("Token autentikasi tidak ditemukan.");
        }

        saveAuth(authenticatedUser, token);

        if (
          mountedRef.current &&
          operationVersion === operationVersionRef.current
        ) {
          setUser(authenticatedUser);

          setError(null);
        }

        return authenticatedUser;
      } catch (error) {
        if (isAbortError(error)) {
          throw error;
        }

        if (
          mountedRef.current &&
          operationVersion === operationVersionRef.current
        ) {
          const normalizedError = normalizeError(error, "Login gagal.");

          setError(normalizedError);

          setUser(null);

          throw normalizedError;
        }

        throw error;
      } finally {
        if (
          mountedRef.current &&
          operationVersion === operationVersionRef.current
        ) {
          setLoading(false);
        }

        if (loginControllerRef.current === controller) {
          loginControllerRef.current = null;
        }
      }
    })();

    loginPromiseRef.current = promise;

    void promise.then(
      () => {
        if (loginPromiseRef.current === promise) {
          loginPromiseRef.current = null;
        }
      },
      () => {
        if (loginPromiseRef.current === promise) {
          loginPromiseRef.current = null;
        }
      },
    );

    return promise;
  }, []);

  /* ==========================================================
   * LOGOUT
   * ========================================================== */

  const logout = useCallback(() => {
    if (logoutPromiseRef.current) {
      return logoutPromiseRef.current;
    }

    /*
     * Logout membatalkan login
     * yang masih berjalan.
     */
    const operationVersion = ++operationVersionRef.current;

    loginControllerRef.current?.abort();

    loginControllerRef.current = null;

    loginPromiseRef.current = null;

    if (mountedRef.current) {
      setError(null);
      setLoading(true);
    }

    const promise = (async () => {
      try {
        await authService.logout();
      } catch {
        /*
         * Logout lokal tetap dianggap
         * berhasil untuk menjaga state
         * client tetap tidak terautentikasi.
         */
      } finally {
        /*
         * Tetap clear local auth walaupun
         * backend logout gagal.
         */
        clearStoredAuth();

        if (
          mountedRef.current &&
          operationVersion === operationVersionRef.current
        ) {
          setUser(null);
          setError(null);
          setLoading(false);
        }

        if (typeof window !== "undefined") {
          window.location.assign(ROUTES.login);
        }
      }
    })();

    logoutPromiseRef.current = promise;

    void promise.then(
      () => {
        if (logoutPromiseRef.current === promise) {
          logoutPromiseRef.current = null;
        }
      },
      () => {
        if (logoutPromiseRef.current === promise) {
          logoutPromiseRef.current = null;
        }
      },
    );

    return promise;
  }, []);

  /* ==========================================================
   * UPDATE USER
   * ========================================================== */

  const updateUser = useCallback((updatedUser) => {
    saveUser(updatedUser);

    if (mountedRef.current) {
      setUser(updatedUser);
      setError(null);
    }
  }, []);

  /* ==========================================================
   * DERIVED STATE
   * ========================================================== */

  const role = normalizeRole(user?.role);

  const isAuthenticated = Boolean(user);

  const isTeacher = role === "teacher";

  const isStudent = role === "student";

  const value = useMemo(
    () => ({
      user,
      loading,
      error,

      login,
      logout,
      updateUser,

      role,

      isAuthenticated,
      isTeacher,
      isStudent,
    }),
    [
      user,
      loading,
      error,

      login,
      logout,
      updateUser,

      role,

      isAuthenticated,
      isTeacher,
      isStudent,
    ],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

AuthProvider.displayName = "AuthProvider";

export { AuthContext };

export default AuthContext;
