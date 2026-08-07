"use client";

import { useEffect, useRef, useState } from "react";
import { AnimatePresence, motion, useAnimationControls } from "framer-motion";
import { Button } from "@/components/ui/Button";
import { StepShell } from "./StepShell";
import { TRUST_REACTIONS } from "@/lib/content";
import { useSound } from "@/components/providers/SoundProvider";
import { useAchievements } from "@/components/providers/AchievementProvider";
import { spring } from "@/lib/motion";
import { cn } from "@/lib/cn";

function reactionFor(v: number) {
  let current = TRUST_REACTIONS[0];
  for (const r of TRUST_REACTIONS) if (v >= r.at) current = r;
  return current;
}

/**
 * The trust slider physically recoils past halfway.
 *
 * The recoil fires on release, not during the drag — fighting someone's finger
 * mid-gesture feels broken, but flinching *after* they let go reads as a
 * reaction. It also only claws back a third of the excess, so pushing harder
 * genuinely works. Three determined shoves to 100 and it gives up and lets you
 * have it, because a joke you can't win is just an obstacle.
 */
export function StepTrust({
  value,
  onChange,
  onNext,
  onBack,
}: {
  value: number;
  onChange: (v: number) => void;
  onNext: () => void;
  onBack: () => void;
}) {
  const [recoiling, setRecoiling] = useState(false);
  const pushes = useRef(0);
  const [locked, setLocked] = useState(false);
  const controls = useAnimationControls();
  const { play } = useSound();
  const { unlock } = useAchievements();

  const reaction = reactionFor(value);
  const anxious = value >= 60;

  useEffect(() => {
    if (value >= 98) unlock("trust-max");
    if (value === 0) unlock("trust-zero");
  }, [value, unlock]);

  const settle = () => {
    if (locked || value <= 55) return;

    if (value >= 99) {
      pushes.current += 1;
      if (pushes.current >= 3) {
        // Fine. Have it. We're not comfortable but we're not stopping you.
        setLocked(true);
        play("thud");
        controls.start({ x: [0, -8, 7, -4, 0], transition: { duration: 0.4 } });
        return;
      }
    }

    setRecoiling(true);
    play("whoosh");
    controls.start({ x: [0, -5, 4, 0], transition: { duration: 0.28 } });

    // Give back only a third of the excess, so persistence pays off.
    const next = Math.round(value - (value - 50) * 0.34);
    setTimeout(() => {
      onChange(next);
      setRecoiling(false);
    }, 180);
  };

  return (
    <StepShell
      eyebrow="One more thing"
      title="How much do you trust us?"
      subtitle="There is no wrong answer. There is a concerning answer, and we'll let you know if you find it."
      footer={
        <div className="flex items-center justify-between gap-4">
          <Button variant="ghost" onClick={onBack}>
            Back
          </Button>
          <Button size="lg" onClick={onNext}>
            Finish setup
          </Button>
        </div>
      }
    >
      <motion.div animate={controls}>
        <div className="mb-7 flex items-baseline justify-center gap-2">
          <motion.span
            key={Math.round(value / 5)}
            initial={{ scale: 1.12 }}
            animate={{ scale: 1 }}
            transition={spring.snappy}
            className={cn(
              "font-display text-[56px] leading-none font-extrabold tracking-tighter tabular-nums",
              anxious ? "text-ember" : "text-ink",
            )}
          >
            {value}
          </motion.span>
          <span className="font-mono text-[13px] text-ink-faint">%</span>
        </div>

        <div className="relative px-1">
          <input
            type="range"
            min={0}
            max={100}
            value={value}
            onChange={(e) => onChange(Number(e.target.value))}
            onPointerUp={settle}
            onKeyUp={settle}
            onBlur={settle}
            aria-label="Trust level"
            aria-describedby="trust-reaction"
            aria-valuetext={`${value} percent — ${reaction.text}`}
            className="tif-range w-full cursor-grab active:cursor-grabbing"
            style={{ ["--tif-fill" as string]: `${value}%` }}
          />

          <div className="mt-2 flex justify-between font-mono text-[10.5px] text-ink-faint">
            <span>none</span>
            <span className={cn(anxious && "text-ember")}>halfway</span>
            <span>total</span>
          </div>
        </div>

        <div className="mt-7 min-h-[84px]">
          <AnimatePresence mode="wait">
            <motion.div
              key={reaction.text}
              initial={{ opacity: 0, y: 10, scale: 0.97 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -10, scale: 0.97 }}
              transition={spring.snappy}
              className={cn(
                "rounded-xl border p-4 text-center",
                anxious ? "border-ember/40 bg-ember-wash" : "border-line bg-surface-2",
              )}
            >
              <p
                id="trust-reaction"
                aria-live="polite"
                className={cn(
                  "text-[14.5px] leading-relaxed font-medium",
                  anxious ? "text-ember" : "text-ink-soft",
                )}
              >
                {reaction.text}
              </p>
              {locked && (
                <motion.p
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="mt-2 font-mono text-[11px] text-ink-faint"
                >
                  fine. it&apos;s yours. we&apos;ve stopped resisting.
                </motion.p>
              )}
              {recoiling && (
                <motion.p
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="mt-2 font-mono text-[11px] text-ink-faint"
                >
                  adjusting on your behalf
                </motion.p>
              )}
            </motion.div>
          </AnimatePresence>
        </div>
      </motion.div>
    </StepShell>
  );
}
