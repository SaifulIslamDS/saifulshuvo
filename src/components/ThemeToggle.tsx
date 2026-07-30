"use client";

import { useEffect, useState } from "react";
import { Icon } from "@/components/Icon";

type Theme = "light" | "dark";

const STORAGE_KEY = "portfolio-theme";

export function ThemeToggle() {
  const [theme, setTheme] = useState<Theme>("dark");

  useEffect(() => {
    const activeTheme = document.documentElement.dataset.theme === "light" ? "light" : "dark";
    setTheme(activeTheme);
  }, []);

  function toggleTheme() {
    const nextTheme: Theme = theme === "dark" ? "light" : "dark";
    document.documentElement.dataset.theme = nextTheme;
    document.documentElement.style.colorScheme = nextTheme;
    localStorage.setItem(STORAGE_KEY, nextTheme);
    setTheme(nextTheme);
  }

  const nextLabel = theme === "dark" ? "Switch to light theme" : "Switch to dark theme";

  return (
    <button
      className="theme-toggle"
      type="button"
      onClick={toggleTheme}
      aria-label={nextLabel}
      title={nextLabel}
    >
      <Icon name={theme === "dark" ? "sun" : "moon"} size={20} />
    </button>
  );
}
