import {
  createContext,
  useCallback,
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

const DARK_MEDIA_QUERY = "(prefers-color-scheme: dark)";

const getSystemTheme = () => {
  if (
    typeof window === "undefined" ||
    typeof window.matchMedia !== "function"
  ) {
    return THEME.values.light;
  }

  return window.matchMedia(DARK_MEDIA_QUERY).matches
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
    // Fallback ke default.
  }

  return THEME.default;
};

const persistTheme = (preference) => {
  try {
    localStorage.setItem(STORAGE_KEYS.theme, preference);

    return true;
  } catch {
    return false;
  }
};

const applyThemeToDocument = (theme) => {
  if (typeof document === "undefined") {
    return;
  }

  const root = document.documentElement;

  const isDark = theme === THEME.values.dark;

  root.classList.toggle("dark", isDark);

  root.setAttribute("data-theme", theme);

  root.style.colorScheme = theme;
};

export const ThemeProvider = ({ children }) => {
  const [preference, setPreferenceState] = useState(getStoredTheme);

  /*
   * Initial value is already synchronized from matchMedia.
   * The effect below is only responsible for subscribing
   * to future OS preference changes.
   */
  const [systemTheme, setSystemTheme] = useState(getSystemTheme);

  useEffect(() => {
    if (
      typeof window === "undefined" ||
      typeof window.matchMedia !== "function"
    ) {
      return undefined;
    }

    const mediaQuery = window.matchMedia(DARK_MEDIA_QUERY);

    let active = true;

    const handleChange = (event) => {
      if (!active) {
        return;
      }

      setSystemTheme(event.matches ? THEME.values.dark : THEME.values.light);
    };

    if (typeof mediaQuery.addEventListener === "function") {
      mediaQuery.addEventListener("change", handleChange);

      return () => {
        active = false;

        mediaQuery.removeEventListener("change", handleChange);
      };
    }

    if (typeof mediaQuery.addListener === "function") {
      mediaQuery.addListener(handleChange);

      return () => {
        active = false;

        mediaQuery.removeListener(handleChange);
      };
    }

    return undefined;
  }, []);

  const theme = preference === THEME.values.system ? systemTheme : preference;

  useEffect(() => {
    applyThemeToDocument(theme);
  }, [theme]);

  const setPreference = useCallback((newPreference) => {
    if (!THEME_VALUES.has(newPreference)) {
      return false;
    }

    setPreferenceState(newPreference);

    /*
     * UI tetap berubah walaupun
     * localStorage gagal.
     */
    persistTheme(newPreference);

    return true;
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

export default ThemeContext;
