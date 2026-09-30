import { useEffect, useState, useCallback } from "react";

export type Theme = "dark" | "light";
const KEY = "neurosense-theme";

function apply(theme: Theme) {
  const root = document.documentElement;
  root.classList.toggle("light", theme === "light");
  root.classList.toggle("dark", theme === "dark");
}

export function useTheme() {
  const [theme, setTheme] = useState<Theme>("dark");

  useEffect(() => {
    const stored = (typeof window !== "undefined" && (localStorage.getItem(KEY) as Theme | null)) || null;
    const initial: Theme = stored ?? "dark";
    setTheme(initial);
    apply(initial);
  }, []);

  const update = useCallback((next: Theme) => {
    setTheme(next);
    apply(next);
    try { localStorage.setItem(KEY, next); } catch {}
  }, []);

  const toggle = useCallback(() => {
    update(theme === "dark" ? "light" : "dark");
  }, [theme, update]);

  return { theme, setTheme: update, toggle };
}
