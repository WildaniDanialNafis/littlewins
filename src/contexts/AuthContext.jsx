import {
  createContext,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";

import { useNavigate } from "react-router-dom";

import { ROUTES, STORAGE_KEYS } from "@/shared/constants";

import authService from "@/services/api/authService";

import { clearResourceCache } from "@/shared/cache";

const AuthContext = createContext(null);

AuthContext.displayName = "AuthContext";

const VALID_ROLES = new Set(["teacher", "student"]);

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

const isUnauthorizedError = (error) => {
  return error?.status === 401 || error?.status === 403;
};

const normalizeRole = (role) => {
  if (typeof role !== "string") {
    return null;
  }

  const normalized = role.trim().toLowerCase();

  return VALID_ROLES.has(normalized) ? normalized : null;
};

const getUserId = (user) => {
  const id = user?.profile?.id ?? user?.id;

  if (id === null || id === undefined || id === "") {
    return null;
  }

  return String(id);
};

const getSessionIdentity = (user) => {
  const id = getUserId(user);

  const role = normalizeRole(user?.role);

  if (!id || !role) {
    return null;
  }

  return `${role}:${id}`;
};

const createSessionSnapshot = (user, token) => {
  if (!user || typeof user !== "object") {
    throw new Error("Data pengguna tidak valid.");
  }

  if (typeof token !== "string" || !token.trim()) {
    throw new Error("Token autentikasi tidak valid.");
  }

  const role = normalizeRole(user.role);

  if (!role) {
    throw new Error("Role pengguna tidak valid.");
  }

  const userId = getUserId(user);

  if (!userId) {
    throw new Error("ID pengguna tidak valid.");
  }

  return {
    user,

    token,

    identity: `${role}:${userId}`,

    updatedAt: Date.now(),
  };
};

/*
 * Backend /me saat ini dapat mengembalikan:
 *
 * {
 *   user: {...}
 * }
 *
 * Compatibility dengan response user langsung
 * tetap dipertahankan.
 */
const extractUserFromResponse = (response) => {
  if (!response || typeof response !== "object") {
    return null;
  }

  if (response.user && typeof response.user === "object") {
    return response.user;
  }

  return response;
};

/* ============================================================
 * STORAGE
 * ============================================================ */

const parseSessionSnapshot = (rawValue) => {
  if (!rawValue) {
    return null;
  }

  try {
    const parsed = JSON.parse(rawValue);

    if (!parsed || typeof parsed !== "object") {
      return null;
    }

    const { user, token, identity } = parsed;

    if (!user || typeof user !== "object") {
      return null;
    }

    if (typeof token !== "string" || !token.trim()) {
      return null;
    }

    const expectedIdentity = getSessionIdentity(user);

    if (!expectedIdentity || expectedIdentity !== identity) {
      return null;
    }

    return {
      user,

      token,
    };
  } catch {
    return null;
  }
};

const clearStoredAuth = () => {
  try {
    localStorage.removeItem(STORAGE_KEYS.session);

    localStorage.removeItem(STORAGE_KEYS.user);

    localStorage.removeItem(STORAGE_KEYS.authToken);

    localStorage.removeItem(STORAGE_KEYS.refreshToken);
  } catch {
    /*
     * Storage unavailable.
     */
  }
};

const getStoredAuth = () => {
  try {
    /*
     * Canonical session.
     */
    const sessionRaw = localStorage.getItem(STORAGE_KEYS.session);

    const session = parseSessionSnapshot(sessionRaw);

    if (session) {
      return session;
    }

    /*
     * Legacy fallback.
     */
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

    const identity = getSessionIdentity(parsedUser);

    if (!identity) {
      throw new Error("Identitas pengguna tidak valid.");
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
  const session = createSessionSnapshot(user, token);

  try {
    /*
     * Canonical session.
     */
    localStorage.setItem(STORAGE_KEYS.session, JSON.stringify(session));

    /*
     * Legacy compatibility.
     */
    localStorage.setItem(STORAGE_KEYS.authToken, session.token);

    localStorage.setItem(STORAGE_KEYS.user, JSON.stringify(session.user));
  } catch (error) {
    clearStoredAuth();

    throw normalizeError(error, "Gagal menyimpan sesi autentikasi.");
  }
};

const saveUser = (user) => {
  if (!user || typeof user !== "object") {
    throw new Error("Data pengguna tidak valid.");
  }

  const currentSession = getStoredAuth();

  if (!currentSession.user || !currentSession.token) {
    throw new Error("Sesi autentikasi tidak tersedia.");
  }

  saveAuth(user, currentSession.token);
};

/* ============================================================
 * CACHE
 * ============================================================ */

const resetSessionCache = () => {
  clearResourceCache();
};

/* ============================================================
 * PROVIDER
 * ============================================================ */

export const AuthProvider = ({ children }) => {
  /*
   * Router sudah berada di atas AuthProvider:
   *
   * BrowserRouter
   *   └─ Providers
   *       └─ AuthProvider
   *
   * sehingga useNavigate aman digunakan di sini.
   */
  const navigate = useNavigate();

  const mountedRef = useRef(false);

  const operationVersionRef = useRef(0);

  const sessionVersionRef = useRef(0);

  const loginPromiseRef = useRef(null);

  const loginControllerRef = useRef(null);

  const logoutPromiseRef = useRef(null);

  const logoutRequestedRef = useRef(false);

  const [user, setUser] = useState(null);

  const [loading, setLoading] = useState(true);

  const [error, setError] = useState(null);

  /* ==========================================================
   * SESSION OPERATIONS
   * ========================================================== */

  const invalidateSessionOperations = useCallback(() => {
    operationVersionRef.current += 1;

    sessionVersionRef.current += 1;

    loginControllerRef.current?.abort();

    loginControllerRef.current = null;

    loginPromiseRef.current = null;
  }, []);

  /* ==========================================================
   * MOUNT
   * ========================================================== */

  useEffect(() => {
    mountedRef.current = true;

    return () => {
      mountedRef.current = false;

      /*
       * Tidak menganggap unmount sebagai logout.
       */
      loginControllerRef.current?.abort();

      loginControllerRef.current = null;

      loginPromiseRef.current = null;

      logoutPromiseRef.current = null;
    };
  }, []);

  /* ==========================================================
   * APPLY SESSION
   * ========================================================== */

  const applyAuthenticatedSession = useCallback((authenticatedUser) => {
    if (!authenticatedUser || typeof authenticatedUser !== "object") {
      throw new Error("Data pengguna tidak ditemukan.");
    }

    const role = normalizeRole(authenticatedUser.role);

    if (!role) {
      throw new Error("Role pengguna tidak valid.");
    }

    const userId = getUserId(authenticatedUser);

    if (!userId) {
      throw new Error("ID pengguna tidak valid.");
    }

    if (!mountedRef.current) {
      return;
    }

    setUser(authenticatedUser);

    setError(null);

    setLoading(false);
  }, []);

  const clearAuthenticatedSession = useCallback(() => {
    invalidateSessionOperations();

    resetSessionCache();

    clearStoredAuth();

    if (!mountedRef.current) {
      return;
    }

    setUser(null);

    setError(null);

    setLoading(false);
  }, [invalidateSessionOperations]);

  /* ==========================================================
   * SESSION RESTORE
   * ========================================================== */

  useEffect(() => {
    let cancelled = false;

    const restoreSession = async () => {
      const sessionVersion = sessionVersionRef.current;

      const { user: storedUser, token } = getStoredAuth();

      if (!mountedRef.current || cancelled) {
        return;
      }

      if (!storedUser || !token) {
        resetSessionCache();

        setUser(null);

        setError(null);

        setLoading(false);

        return;
      }

      const role = normalizeRole(storedUser.role);

      const userId = getUserId(storedUser);

      if (!role || !userId) {
        clearAuthenticatedSession();

        return;
      }

      try {
        const response = await authService.me({
          signal: undefined,
        });

        if (
          cancelled ||
          !mountedRef.current ||
          sessionVersion !== sessionVersionRef.current
        ) {
          return;
        }

        const currentUser = extractUserFromResponse(response);

        const resolvedUser = currentUser ?? storedUser;

        const resolvedRole = normalizeRole(resolvedUser?.role);

        const resolvedUserId = getUserId(resolvedUser);

        if (!resolvedRole || !resolvedUserId) {
          clearAuthenticatedSession();

          return;
        }

        /*
         * Backend menjadi source of truth
         * untuk user data.
         *
         * Token tetap token lokal.
         */
        try {
          saveAuth(resolvedUser, token);
        } catch {
          /*
           * Runtime authentication tetap dipertahankan.
           */
        }

        applyAuthenticatedSession(resolvedUser);
      } catch (restoreError) {
        if (
          cancelled ||
          !mountedRef.current ||
          sessionVersion !== sessionVersionRef.current
        ) {
          return;
        }

        if (isAbortError(restoreError)) {
          return;
        }

        if (isUnauthorizedError(restoreError)) {
          clearAuthenticatedSession();

          return;
        }

        /*
         * Network/server error:
         * session lokal tetap dipertahankan.
         */
        applyAuthenticatedSession(storedUser);
      }
    };

    void restoreSession();

    return () => {
      cancelled = true;
    };
  }, [applyAuthenticatedSession, clearAuthenticatedSession]);

  /* ==========================================================
   * CROSS TAB
   * ========================================================== */

  useEffect(() => {
    const handleStorage = (event) => {
      if (
        event.key !== STORAGE_KEYS.session &&
        event.key !== STORAGE_KEYS.user &&
        event.key !== STORAGE_KEYS.authToken &&
        event.key !== STORAGE_KEYS.refreshToken
      ) {
        return;
      }

      invalidateSessionOperations();

      resetSessionCache();

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

      const role = normalizeRole(storedUser.role);

      const userId = getUserId(storedUser);

      if (!role || !userId) {
        clearStoredAuth();

        setUser(null);

        setError(new Error("Sesi pengguna tidak valid."));

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
  }, [clearAuthenticatedSession, invalidateSessionOperations]);

  /* ==========================================================
   * LOGIN
   * ========================================================== */

  const login = useCallback(
    (username, password) => {
      if (loginPromiseRef.current) {
        return loginPromiseRef.current;
      }

      /*
       * Session lama tidak lagi dipercaya.
       */
      invalidateSessionOperations();

      resetSessionCache();

      const operationVersion = operationVersionRef.current;

      const sessionVersion = sessionVersionRef.current;

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

          const response = await authService.login(
            normalizedUsername,
            password,
            {
              signal: controller.signal,
            },
          );

          const isCurrent =
            operationVersion === operationVersionRef.current &&
            sessionVersion === sessionVersionRef.current;

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

          const role = normalizeRole(authenticatedUser.role);

          const userId = getUserId(authenticatedUser);

          if (!role || !userId) {
            throw new Error("Data role atau ID pengguna tidak valid.");
          }

          resetSessionCache();

          saveAuth(authenticatedUser, token);

          if (
            mountedRef.current &&
            operationVersion === operationVersionRef.current &&
            sessionVersion === sessionVersionRef.current
          ) {
            setUser(authenticatedUser);

            setError(null);

            setLoading(false);
          }

          return authenticatedUser;
        } catch (loginError) {
          if (isAbortError(loginError)) {
            throw loginError;
          }

          if (
            mountedRef.current &&
            operationVersion === operationVersionRef.current &&
            sessionVersion === sessionVersionRef.current
          ) {
            const normalizedError = normalizeError(loginError, "Login gagal.");

            setError(normalizedError);

            setUser(null);

            setLoading(false);

            clearStoredAuth();

            resetSessionCache();

            throw normalizedError;
          }

          throw loginError;
        } finally {
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
    },
    [invalidateSessionOperations],
  );

  /* ==========================================================
   * LOGOUT
   * ========================================================== */

  const logout = useCallback(() => {
    /*
     * Jangan membuat dua logout operation.
     */
    if (logoutPromiseRef.current) {
      return logoutPromiseRef.current;
    }

    if (logoutRequestedRef.current) {
      return Promise.resolve();
    }

    logoutRequestedRef.current = true;

    /*
     * Invalidate auth operations:
     *
     * - login yang sedang berlangsung dibatalkan
     * - restore/auth operation lama menjadi obsolete
     */
    invalidateSessionOperations();

    /*
     * Ambil promise backend untuk tetap menyelesaikan
     * request logout, tetapi JANGAN menunggu promise tersebut
     * untuk melakukan navigasi.
     */
    const backendLogoutPromise = Promise.resolve()
      .then(() => authService.logout())
      .catch(() => undefined);

    logoutPromiseRef.current = backendLogoutPromise;

    /*
     * =======================================================
     * LOCAL LOGOUT — INSTANT
     * =======================================================
     *
     * Ini yang menghilangkan flicker.
     *
     * Kita tidak:
     *
     * setLoading(true)
     * window.location.assign(...)
     *
     * Sebaliknya:
     *
     * clear session
     * user = null
     * navigate replace
     *
     * sehingga React tetap hidup dan hanya route/layout
     * yang berganti.
     */
    resetSessionCache();

    clearStoredAuth();

    if (mountedRef.current) {
      setUser(null);

      setError(null);

      setLoading(false);
    }

    /*
     * React Router navigation:
     *
     * - tidak reload browser
     * - tidak membuat AuthProvider baru
     * - tidak meminta /me lagi
     * - tidak memuat ulang bundle
     */
    navigate(ROUTES.login, {
      replace: true,
    });

    /*
     * Cleanup promise reference setelah request
     * backend benar-benar selesai.
     */
    void backendLogoutPromise.finally(() => {
      if (logoutPromiseRef.current === backendLogoutPromise) {
        logoutPromiseRef.current = null;
      }

      logoutRequestedRef.current = false;
    });

    return backendLogoutPromise;
  }, [invalidateSessionOperations, navigate]);

  /* ==========================================================
   * UPDATE USER
   * ========================================================== */

  const updateUser = useCallback((updatedUser) => {
    const role = normalizeRole(updatedUser?.role);

    const userId = getUserId(updatedUser);

    if (!role || !userId) {
      throw new Error("Data pengguna tidak valid.");
    }

    const currentSession = getStoredAuth();

    if (!currentSession.user || !currentSession.token) {
      throw new Error("Sesi autentikasi tidak tersedia.");
    }

    resetSessionCache();

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

  const isAuthenticated = Boolean(user && role);

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
