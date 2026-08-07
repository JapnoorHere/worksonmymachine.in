"use client";

import { createContext, useCallback, useContext, useEffect, useState } from "react";
import { readLS, writeLS } from "@/lib/storage";

/**
 * The inverted theme toggle.
 *
 * `applied` is the theme the page is actually wearing. `label` is what the UI
 * claims is selected — always the opposite. The toggle is a two-button
 * segmented control, so the highlight sits under the *lie*: the site is pitch
 * black while the control confidently shows "Light" as active.
 *
 * The important detail is that the inversion is total and consistent. A joke
 * that fires intermittently reads as a bug; one that never wavers reads as a
 * decision. So there is exactly one function that flips it, right here, and
 * nothing else in the codebase is allowed to think about it.
 */

export type Theme = "light" | "dark";

interface ThemeCtx {
  /** What the page actually looks like. */
  applied: Theme;
  /** What the toggle claims is selected. Always `invert(applied)`. */
  label: Theme;
  /** Pick a label; get the opposite. */
  choose: (label: Theme) => void;
  mounted: boolean;
  /** True once the user has clicked both labels. */
  bothSeen: boolean;
}

const Ctx = createContext<ThemeCtx>({
  applied: "light",
  label: "dark",
  choose: () => {},
  mounted: false,
  bothSeen: false,
});

export const useTheme = () => useContext(Ctx);

const invert = (t: Theme): Theme => (t === "dark" ? "light" : "dark");

/** Runs before first paint. Keeps the inversion from flashing on reload. */
export const THEME_BOOT_SCRIPT = `
(function(){
  try {
    var raw = localStorage.getItem('tif:theme');
    if (raw) {
      var t = JSON.parse(raw);
      if (t === 'light' || t === 'dark') {
        document.documentElement.setAttribute('data-theme', t);
      }
    }
    var mood = localStorage.getItem('tif:moodHue');
    if (mood) document.documentElement.style.setProperty('--tif-mood-rotate', JSON.parse(mood) + 'deg');
  } catch (e) {}
})();
`;

function systemTheme(): Theme {
  if (typeof window === "undefined") return "light";
  return window.matchMedia?.("(prefers-color-scheme: dark)").matches ? "dark" : "light";
}

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [applied, setApplied] = useState<Theme>("light");
  const [mounted, setMounted] = useState(false);
  const [clicked, setClicked] = useState<Theme[]>([]);

  useEffect(() => {
    const stored = readLS<Theme | null>("theme", null);
    const initial = stored ?? systemTheme();
    setApplied(initial);
    setClicked(readLS<Theme[]>("themeClicks", []));
    setMounted(true);

    // Follow the OS only while the user hasn't expressed a preference.
    if (stored) return;
    const mq = window.matchMedia("(prefers-color-scheme: dark)");
    const onChange = (e: MediaQueryListEvent) => setApplied(e.matches ? "dark" : "light");
    mq.addEventListener("change", onChange);
    return () => mq.removeEventListener("change", onChange);
  }, []);

  useEffect(() => {
    if (!mounted) return;
    document.documentElement.setAttribute("data-theme", applied);
  }, [applied, mounted]);

  const choose = useCallback((chosenLabel: Theme) => {
    const next = invert(chosenLabel);
    setApplied(next);
    writeLS("theme", next);
    setClicked((prev) => {
      if (prev.includes(chosenLabel)) return prev;
      const merged = [...prev, chosenLabel];
      writeLS("themeClicks", merged);
      return merged;
    });
  }, []);

  return (
    <Ctx.Provider
      value={{
        applied,
        label: invert(applied),
        choose,
        mounted,
        bothSeen: clicked.length >= 2,
      }}
    >
      {children}
    </Ctx.Provider>
  );
}
