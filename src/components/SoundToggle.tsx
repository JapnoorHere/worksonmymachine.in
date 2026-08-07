"use client";

import { motion } from "framer-motion";
import { useSound } from "@/components/providers/SoundProvider";
import { useAchievements } from "@/components/providers/AchievementProvider";
import { spring } from "@/lib/motion";

export function SoundToggle() {
  const { enabled, setEnabled, play } = useSound();
  const { unlock } = useAchievements();

  return (
    <button
      type="button"
      onClick={() => {
        const next = !enabled;
        setEnabled(next);
        if (next) {
          // Fires after the gesture unlocks the audio context.
          setTimeout(() => play("chime"), 40);
        } else {
          unlock("mute");
        }
      }}
      aria-pressed={enabled}
      aria-label={enabled ? "Mute interface sounds" : "Enable interface sounds"}
      title={enabled ? "Sound on — click to mute" : "Sound off — click for tiny noises"}
      className="grid size-9 cursor-pointer place-items-center rounded-full border border-line bg-surface-2 text-ink-soft transition-colors hover:bg-surface-3 hover:text-ink"
    >
      <svg viewBox="0 0 20 20" className="size-[16px]" fill="none" aria-hidden>
        <path
          d="M4 7.6h2.6L10 4.6v10.8l-3.4-3H4a1 1 0 0 1-1-1V8.6a1 1 0 0 1 1-1Z"
          fill="currentColor"
        />
        {enabled ? (
          <>
            <motion.path
              d="M12.8 7.4a3.4 3.4 0 0 1 0 5.2"
              stroke="currentColor"
              strokeWidth="1.6"
              strokeLinecap="round"
              initial={{ opacity: 0, x: -3 }}
              animate={{ opacity: 1, x: 0 }}
              transition={spring.snappy}
            />
            <motion.path
              d="M15.1 5.2a6.6 6.6 0 0 1 0 9.6"
              stroke="currentColor"
              strokeWidth="1.6"
              strokeLinecap="round"
              initial={{ opacity: 0, x: -3 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ ...spring.snappy, delay: 0.05 }}
            />
          </>
        ) : (
          <motion.path
            d="M13 7.6l4 4.8M17 7.6l-4 4.8"
            stroke="currentColor"
            strokeWidth="1.6"
            strokeLinecap="round"
            initial={{ opacity: 0, scale: 0.5 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={spring.bouncy}
          />
        )}
      </svg>
    </button>
  );
}
