// src/hooks/ThemeContext.tsx
import React, {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";

export type ThemeMode = "light" | "dark" | "system";
export type ThemeName = "default" | "sunrise" | "midnight";

type Ctx = {
  isDark: boolean;
  mode: ThemeMode;
  setMode: (m: ThemeMode) => void;
  toggleDark: () => void;
  setDarkMode: (v: boolean) => void;

  themeName: ThemeName;
  setThemeName: (n: ThemeName) => void;
};

const MODE_KEY = "theme";
const THEME_KEY = "theme-name";

const ThemeContext = createContext<Ctx | null>(null);

export const ThemeProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const isBrowser =
    typeof window !== "undefined" && typeof document !== "undefined";

  const safeGet = (k: string) => {
    if (!isBrowser) return null;
    try {
      return localStorage.getItem(k);
    } catch {
      return null;
    }
  };

  const [mode, setMode] = useState<ThemeMode>(
    () => (safeGet(MODE_KEY) as ThemeMode) || "system"
  );
  const [themeName, setThemeName] = useState<ThemeName>(
    () => (safeGet(THEME_KEY) as ThemeName) || "default"
  );

  const computeIsDark = (): boolean => {
    if (!isBrowser) return false;
    if (mode === "dark") return true;
    if (mode === "light") return false;
    return window.matchMedia("(prefers-color-scheme: dark)").matches;
  };

  const [isDark, setIsDark] = useState<boolean>(() =>
    isBrowser ? computeIsDark() : false
  );

  useEffect(() => {
    if (!isBrowser) return;
    const html = document.documentElement;

    const darkNow = computeIsDark();
    html.classList.toggle("dark", darkNow);
    html.setAttribute("data-theme", themeName);
    setIsDark(darkNow);

    try {
      localStorage.setItem(MODE_KEY, mode);
      localStorage.setItem(THEME_KEY, themeName);
    } catch {}

    if (mode === "system" && window.matchMedia) {
      const mq = window.matchMedia("(prefers-color-scheme: dark)");
      const handler = () => setIsDark(mq.matches);
      mq.addEventListener("change", handler);
      return () => mq.removeEventListener("change", handler);
    }
  }, [mode, themeName]);

  const toggleDark = () =>
    setMode((prev) => (prev === "dark" ? "light" : "dark"));
  const setDarkMode = (v: boolean) => setMode(v ? "dark" : "light");

  const value = useMemo<Ctx>(
    () => ({
      isDark,
      mode,
      setMode,
      toggleDark,
      setDarkMode,
      themeName,
      setThemeName,
    }),
    [isDark, mode, themeName]
  );

  return (
    <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>
  );
};

export function useThemeContext() {
  const ctx = useContext(ThemeContext);
  if (!ctx)
    throw new Error("useThemeContext must be used inside <ThemeProvider>");
  return ctx;
}
