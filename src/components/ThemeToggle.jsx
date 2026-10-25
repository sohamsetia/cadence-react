/* Theme toggle (was initThemeToggle() in js/main.js, which injected the
   button into the navbar / topbar, or pinned it to the corner on auth
   pages). Same storage key and same data-theme attribute on <html>. */

import { useState } from "react";

const THEME_KEY = "cadence_theme";

function currentTheme() {
  return document.documentElement.getAttribute("data-theme") === "light" ? "light" : "dark";
}

function applyTheme(theme) {
  if (theme === "light") {
    document.documentElement.setAttribute("data-theme", "light");
  } else {
    document.documentElement.removeAttribute("data-theme");
  }
  localStorage.setItem(THEME_KEY, theme);
}

const SunIcon = () => (
  <svg viewBox="0 0 24 24" fill="none"><circle cx="12" cy="12" r="4.5" stroke="currentColor" strokeWidth="1.8" /><path d="M12 2.5v2.2M12 19.3v2.2M4.2 4.2l1.55 1.55M18.25 18.25l1.55 1.55M2.5 12h2.2M19.3 12h2.2M4.2 19.8l1.55-1.55M18.25 5.75l1.55-1.55" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" /></svg>
);
const MoonIcon = () => (
  <svg viewBox="0 0 24 24" fill="none"><path d="M20 14.5A8.5 8.5 0 1 1 9.5 4a7 7 0 0 0 10.5 10.5z" stroke="currentColor" strokeWidth="1.8" strokeLinejoin="round" /></svg>
);

// Auth pages have no navbar/topbar, so the toggle is pinned to the corner there.
const FLOATING_STYLE = { position: "fixed", top: "16px", right: "16px", zIndex: 70 };

export default function ThemeToggle({ floating = false }) {
  const [theme, setTheme] = useState(currentTheme);

  function toggle() {
    const next = theme === "light" ? "dark" : "light";
    applyTheme(next);
    setTheme(next);
  }

  return (
    <button
      type="button"
      className="theme-toggle-btn"
      style={floating ? FLOATING_STYLE : undefined}
      aria-label={theme === "light" ? "Switch to dark theme" : "Switch to light theme"}
      onClick={toggle}
    >
      {theme === "light" ? <MoonIcon /> : <SunIcon />}
    </button>
  );
}
