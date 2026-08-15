import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";

import { STORAGE_KEYS, THEME } from "@/shared/constants";

const ThemeContext = createContext(null);

ThemeContext.displayName = "ThemeContext";

const THEME_VALUES = new Set([
  THEME.values.light,
  THEME.values.dark,
  THEME.values.system,
]);

const getSystemTheme = () => {
  if (typeof window === "undefined") {
    return THEME.values.light;
  }

  return window.matchMedia("(prefers-color-scheme: dark)").matches
    ? THEME.values.dark
    : THEME.values.light;
};

const getStoredTheme = () => {
  try {
    const storedTheme = localStorage.getItem(STORAGE_KEYS.theme);

    if (THEME_VALUES.has(storedTheme)) {
      return storedTheme;
    }
  } catch {
    // Ignore localStorage errors.
  }

  return THEME.default;
};

export const ThemeProvider = ({ children }) => {
  const [preference, setPreferenceState] = useState(getStoredTheme);

  const [systemTheme, setSystemTheme] = useState(getSystemTheme);

  useEffect(() => {
    if (typeof window === "undefined") {
      return undefined;
    }

    const mediaQuery = window.matchMedia("(prefers-color-scheme: dark)");

    const handleChange = (event) => {
      setSystemTheme(event.matches ? THEME.values.dark : THEME.values.light);
    };

    setSystemTheme(mediaQuery.matches ? THEME.values.dark : THEME.values.light);

    mediaQuery.addEventListener("change", handleChange);

    return () => {
      mediaQuery.removeEventListener("change", handleChange);
    };
  }, []);

  const theme = preference === THEME.values.system ? systemTheme : preference;

  useEffect(() => {
    const root = document.documentElement;

    root.classList.toggle("dark", theme === THEME.values.dark);

    root.setAttribute("data-theme", theme);
    root.style.colorScheme = theme;
  }, [theme]);

  const setPreference = useCallback((newPreference) => {
    if (!THEME_VALUES.has(newPreference)) {
      return;
    }

    setPreferenceState(newPreference);

    try {
      localStorage.setItem(STORAGE_KEYS.theme, newPreference);
    } catch {
      // Ignore localStorage errors.
    }
  }, []);

  const value = useMemo(
    () => ({
      theme,
      preference,
      setPreference,
      isDark: theme === THEME.values.dark,
      isLight: theme === THEME.values.light,
    }),
    [theme, preference, setPreference],
  );

  return (
    <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>
  );
};

ThemeProvider.displayName = "ThemeProvider";

export { ThemeContext };
