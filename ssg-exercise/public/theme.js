// Hw 4 part 4 - theme.js for light / dark theme
(function () {
  "use strict";

  const KEY = "theme";
  const root = document.documentElement;

  function loadTheme() {
    try {
      const saved = localStorage.getItem(KEY);
      return saved === "dark" || saved === "light" ? saved : null;
    } catch (error) {
      return null;
    }
  }

  function saveTheme(theme) {
    try {
      localStorage.setItem(KEY, theme);
    } catch (error) {

    }
  }

  function applyTheme(theme) {
    root.dataset.theme = theme;
  }

  function shouldAnimate() {
    const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    return typeof document.startViewTransition === "function" && !reduceMotion;
  }

  applyTheme(loadTheme() || "light");

  function setUpButton() {
    const button = document.getElementById("theme-toggle");
    if (!button) {
      return;
    }

    function setLabel() {
      const dark = root.dataset.theme === "dark";
      button.textContent = dark ? "Switch to light theme" : "Switch to dark theme";
    }

    function switchTheme(next) {
      applyTheme(next);
      setLabel();
    }

    button.addEventListener("click", () => {
      const next = root.dataset.theme === "dark" ? "light" : "dark";

      if (shouldAnimate()) {
        document.startViewTransition(() => switchTheme(next));
      } else {
        switchTheme(next);
      }

      saveTheme(next);
    });

    setLabel();
    button.hidden = false;
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", setUpButton);
  } else {
    setUpButton();
  }
})();
