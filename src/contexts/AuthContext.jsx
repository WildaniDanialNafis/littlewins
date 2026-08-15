import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";

import { ROUTES, STORAGE_KEYS } from "@/shared/constants";

const AuthContext = createContext(null);

AuthContext.displayName = "AuthContext";

const MOCK_USER = {
  id: 1,
  email: "",
  full_name: "User Demo",
  role: "teacher",
  profile: {
    id: 1,
    full_name: "User Demo",
  },
};

const MOCK_TOKEN = "mock-jwt-token";

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

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const { user: storedUser } = getStoredAuth();

    setUser(storedUser);
    setLoading(false);
  }, []);

  const login = useCallback(async (email, password) => {
    setError(null);
    setLoading(true);

    try {
      // TODO:
      // Ganti mock authentication ini dengan:
      //
      // const response = await loginService.login(
      //   email,
      //   password,
      // );
      //
      // const { user, token } = response;

      void password;

      const userData = {
        ...MOCK_USER,
        email,
      };

      saveAuth(userData, MOCK_TOKEN);
      setUser(userData);

      return userData;
    } catch (error) {
      const normalizedError =
        error instanceof Error ? error : new Error("Login gagal.");

      setError(normalizedError);
      throw normalizedError;
    } finally {
      setLoading(false);
    }
  }, []);

  const logout = useCallback(async () => {
    setError(null);
    setLoading(true);

    try {
      // TODO:
      // await loginService.logout();

      clearAuth();
      setUser(null);

      window.location.assign(ROUTES.login);
    } catch (error) {
      const normalizedError =
        error instanceof Error ? error : new Error("Logout gagal.");

      setError(normalizedError);
      throw normalizedError;
    } finally {
      setLoading(false);
    }
  }, []);

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
