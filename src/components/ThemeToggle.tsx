"use client";

import { useEffect, useRef } from "react";
import { motion } from "framer-motion";
import { useTheme, type Theme } from "@/components/providers/ThemeProvider";
import { useToast } from "@/components/providers/ToastProvider";
import { useAchievements } from "@/components/providers/AchievementProvider";
import { useSound } from "@/components/providers/SoundProvider";
import { readLS, writeLS } from "@/lib/storage";
import { spring } from "@/lib/motion";
import { cn } from "@/lib/cn";

const OPTIONS: { label: Theme; text: string }[] = [
  { label: "light", text: "Light" },
  { label: "dark", text: "Dark" },
];

function SunIcon() {
  return (
    <svg viewBox="0 0 20 20" className="size-[15px]" fill="none" aria-hidden>
      <circle cx="10" cy="10" r="3.6" fill="currentColor" />
      {[0, 45, 90, 135, 180, 225, 270, 315].map((deg) => (
        <line
          key={deg}
          x1="10"
          y1="1.8"
          x2="10"
          y2="4"
          stroke="currentColor"
          strokeWidth="1.7"
          strokeLinecap="round"
          transform={`rotate(${deg} 10 10)`}
        />
      ))}
    </svg>
  );
}

function MoonIcon() {
  return (
    <svg viewBox="0 0 20 20" className="size-[15px]" fill="none" aria-hidden>
      <path
        d="M16.2 12.4A7 7 0 0 1 7.6 3.8a7 7 0 1 0 8.6 8.6Z"
        fill="currentColor"
      />
    </svg>
  );
}

/**
 * The joke, in one control.
 *
 * The segment labelled "Dark" applies light. The segment labelled "Light"
 * applies dark. The active pill follows the *label*, never the reality — so
 * on a pitch-black page, "Light" is the one that's highlighted, and the
 * contradiction is sitting right there in the chrome where you can't miss it.
 */
export function ThemeToggle({ compact = false }: { compact?: boolean }) {
  const { applied, label, choose, mounted, bothSeen } = useTheme();
  const toast = useToast();
  const { unlock } = useAchievements();
  const { play } = useSound();
  const acknowledged = useRef(false);

  useEffect(() => {
    if (bothSeen) unlock("theme-noticed");
  }, [bothSeen, unlock]);

  const handle = (opt: Theme) => {
    choose(opt);
    play(opt === "dark" ? "whoosh" : "pop");

    // Acknowledge the bit exactly once, ever. Explaining a joke twice is worse
    // than not explaining it at all.
    if (!acknowledged.current && !readLS<boolean>("themeAcknowledged", false)) {
      acknowledged.current = true;
      writeLS("themeAcknowledged", true);
      setTimeout(
        () =>
          toast({
            title: "Yeah, we know.",
            body: "That's the point. The labels are correct; reality is the thing that's wrong.",
            emoji: "🙃",
            tone: "ember",
            duration: 7000,
          }),
        900,
      );
    }
  };

  return (
    <div
      role="group"
      aria-label="Theme (labels are intentionally inverted)"
      className={cn(
        "relative flex items-center rounded-full border border-line bg-surface-2 p-[3px]",
        compact && "scale-95",
      )}
    >
      {OPTIONS.map((opt) => {
        const active = mounted && label === opt.label;
        return (
          <button
            key={opt.label}
            type="button"
            onClick={() => handle(opt.label)}
            aria-pressed={active}
            title={`Switch to ${opt.text.toLowerCase()} mode`}
            className={cn(
              "relative z-10 flex cursor-pointer items-center gap-1.5 rounded-full px-3 py-1.5",
              "text-[12.5px] font-semibold transition-colors duration-200",
              active ? "text-ink" : "text-ink-faint hover:text-ink-soft",
            )}
          >
            {active && (
              <motion.span
                layoutId="theme-pill"
                transition={spring.bouncy}
                className="absolute inset-0 -z-10 rounded-full border border-line bg-surface shadow-soft"
              />
            )}
            <motion.span
              key={`${opt.label}-${applied}`}
              initial={{ rotate: -180, scale: 0.4, opacity: 0 }}
              animate={{ rotate: 0, scale: 1, opacity: 1 }}
              transition={spring.bouncy}
              className="inline-flex"
            >
              {opt.label === "light" ? <SunIcon /> : <MoonIcon />}
            </motion.span>
            <span className={cn(compact && "sr-only sm:not-sr-only")}>{opt.text}</span>
          </button>
        );
      })}
    </div>
  );
}
