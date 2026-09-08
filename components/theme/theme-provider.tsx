"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";

import {
  THEME_STORAGE_KEY,
  applyResolvedTheme,
  isTheme,
  resolveTheme,
  type ResolvedTheme,
  type Theme,
} from "./theme";

type ThemeContextValue = {
  theme: Theme;
  resolvedTheme: ResolvedTheme;
  setTheme: (theme: Theme) => void;
};

const ThemeContext = createContext<ThemeContextValue | null>(null);

export function ThemeProvider({ children }: { children: ReactNode }) {
  const [theme, setThemeState] = useState<Theme>("system");
  const [resolvedTheme, setResolvedTheme] = useState<ResolvedTheme>("light");

  const apply = useCallback((next: Theme) => {
    const resolved = resolveTheme(next);
    applyResolvedTheme(resolved);
    setThemeState(next);
    setResolvedTheme(resolved);
    localStorage.setItem(THEME_STORAGE_KEY, next);
  }, []);

  useEffect(() => {
    const stored = localStorage.getItem(THEME_STORAGE_KEY);
    apply(isTheme(stored) ? stored : "system");
  }, [apply]);

  useEffect(() => {
    if (theme !== "system") return;

    const media = window.matchMedia("(prefers-color-scheme: dark)");
    const onChange = () => apply("system");
    media.addEventListener("change", onChange);
    return () => media.removeEventListener("change", onChange);
  }, [apply, theme]);

  const value = useMemo(
    () => ({ theme, resolvedTheme, setTheme: apply }),
    [apply, resolvedTheme, theme],
  );

  return (
    <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>
  );
}

export function useTheme() {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error("useTheme must be used within ThemeProvider");
  }
  return context;
}
