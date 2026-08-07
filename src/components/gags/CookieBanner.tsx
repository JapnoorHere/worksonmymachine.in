"use client";

import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { COOKIE_STAGES } from "@/lib/content";
import { readLS, writeLS } from "@/lib/storage";
import { useAchievements } from "@/components/providers/AchievementProvider";
import { useSound } from "@/components/providers/SoundProvider";
import { Button } from "@/components/ui/Button";
import { spring } from "@/lib/motion";

/**
 * The cookie banner gets more desperate every time you reject it.
 *
 * Escalation is the joke, so the pacing is deliberate: it comes back a little
 * faster each round (the delay shrinks as the stage climbs), which makes the
 * banner feel like it's losing composure rather than following a schedule.
 * Accepting ends it immediately — the bit only works on people who say no,
 * and punishing someone who complied would be a different, meaner joke.
 */
export function CookieBanner() {
  const [stage, setStage] = useState(-1);
  const [visible, setVisible] = useState(false);
  const [done, setDone] = useState(true);
  const { unlock } = useAchievements();
  const { play } = useSound();

  useEffect(() => {
    if (readLS<boolean>("cookiesSettled", false)) return;
    const saved = readLS<number>("cookieStage", 0);
    setStage(saved);
    setDone(false);
    const t = setTimeout(() => setVisible(true), 2200);
    return () => clearTimeout(t);
  }, []);

  const settle = () => {
    writeLS("cookiesSettled", true);
    setVisible(false);
    setDone(true);
    play("success");
  };

  const reject = () => {
    play("error");
    setVisible(false);

    const next = stage + 1;
    if (next >= COOKIE_STAGES.length - 1) {
      // Final stage: it graciously gives up, then never returns.
      writeLS("cookieStage", COOKIE_STAGES.length - 1);
      setStage(COOKIE_STAGES.length - 1);
      unlock("cookie-persistent");
      setTimeout(() => setVisible(true), 900);
      return;
    }

    writeLS("cookieStage", next);
    setStage(next);
    // Each rejection brings it back sooner. It is not handling this well.
    setTimeout(() => setVisible(true), Math.max(700, 2400 - next * 380));
  };

  if (done || stage < 0) return null;

  const s = COOKIE_STAGES[stage];
  const isFinal = stage === COOKIE_STAGES.length - 1;
  const desperation = stage / (COOKIE_STAGES.length - 1);

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          role="dialog"
          aria-label="Cookie preferences"
          initial={{ y: 130, opacity: 0, scale: 0.97 }}
          animate={{
            y: 0,
            opacity: 1,
            scale: 1,
            // A faint tilt that grows with each rejection. Nobody consciously
            // notices it; everybody feels the banner coming apart.
            rotate: isFinal ? 0 : desperation * 1.6,
          }}
          exit={{ y: 130, opacity: 0, scale: 0.97 }}
          transition={spring.gentle}
          className="fixed inset-x-3 bottom-3 z-[80] sm:inset-x-auto sm:bottom-5 sm:left-5 sm:max-w-[420px]"
        >
          <div className="rounded-[14px] border border-line bg-surface p-4 shadow-float sm:p-5">
            <div className="flex items-start gap-3">
              <span aria-hidden className="text-[19px] leading-none">
                🍪
              </span>
              <div className="min-w-0 flex-1">
                <h2 className="font-display text-[15px] font-bold tracking-tight">{s.title}</h2>
                <p className="mt-1.5 text-[13px] leading-relaxed text-ink-soft">{s.body}</p>

                <div className="mt-4 flex flex-wrap gap-2">
                  <Button size="sm" onClick={settle}>
                    {s.accept}
                  </Button>
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={isFinal ? settle : reject}
                    // The reject button quietly shrinks as it wears the banner down.
                    style={{ opacity: isFinal ? 1 : 1 - desperation * 0.45 }}
                  >
                    {s.reject}
                  </Button>
                </div>

                {stage >= 3 && !isFinal && (
                  <motion.p
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.6 }}
                    className="mt-3 font-mono text-[10px] text-ink-faint"
                  >
                    attempt {stage + 1} of {COOKIE_STAGES.length}
                  </motion.p>
                )}
              </div>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
