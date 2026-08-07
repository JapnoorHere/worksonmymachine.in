"use client";

import { useMemo, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Card, Eyebrow } from "@/components/ui/Primitives";
import { SCREEN_TIME_REACTIONS } from "@/lib/content";
import { useSound } from "@/components/providers/SoundProvider";
import { spring } from "@/lib/motion";
import { cn } from "@/lib/cn";

function reactionFor(hours: number) {
  let current = SCREEN_TIME_REACTIONS[0];
  for (const r of SCREEN_TIME_REACTIONS) if (hours >= r.at) current = r;
  return current;
}

const HEAVY_AT = 4;

/**
 * "Set your daily screen time target." Custom physics past the honest number.
 *
 * The slider stays fully keyboard-operable at every value — arrow keys move it
 * exactly like a normal range input, and dragging it back below the threshold
 * un-sags the card immediately. The "weight" is a continuous function of the
 * value, not a one-shot trap, so nobody gets stuck: this is the same
 * always-winnable shape as the trust slider, just gravity instead of recoil.
 */
export function ScreenTimeSlider() {
  const [hours, setHours] = useState(2);
  const leanRef = useRef<1 | -1>(Math.random() > 0.5 ? 1 : -1);
  const { play } = useSound();
  const wasHeavy = useRef(false);

  const reaction = reactionFor(hours);

  // 0 below the threshold, ramping to 1 at the top of the range — how "heavy"
  // the card has become. Continuous, so nothing snaps or traps.
  const sag = useMemo(() => Math.min(1, Math.max(0, (hours - HEAVY_AT) / (16 - HEAVY_AT))), [hours]);
  const heavy = hours > HEAVY_AT;

  const commit = (v: number) => {
    setHours(v);
    if (v > HEAVY_AT && !wasHeavy.current) {
      wasHeavy.current = true;
      play("thud");
    } else if (v <= HEAVY_AT && wasHeavy.current) {
      wasHeavy.current = false;
      play("pop");
    }
  };

  return (
    <Card className="overflow-visible p-5">
      <div className="flex items-baseline justify-between gap-3">
        <Eyebrow>Wellness</Eyebrow>
        <span className="font-mono text-[10.5px] text-ink-faint">not enforced, not tracked</span>
      </div>
      <h3 className="mt-1.5 text-[16.5px] font-bold">Daily screen time target</h3>

      <motion.div
        animate={{
          rotate: heavy ? leanRef.current * sag * 7 : 0,
          y: heavy ? sag * 34 : 0,
          x: heavy ? leanRef.current * sag * 18 : 0,
        }}
        transition={spring.heavy}
        style={{ transformOrigin: leanRef.current > 0 ? "left bottom" : "right bottom" }}
        className="relative mt-5"
      >
        <div className="mb-1.5 flex items-baseline justify-center gap-1.5">
          <span className="font-display text-[38px] leading-none font-extrabold tracking-tighter tabular-nums">
            {hours % 1 === 0 ? hours : hours.toFixed(1)}
          </span>
          <span className="font-mono text-[12px] text-ink-faint">
            {hours === 1 ? "hour" : "hours"} / day
          </span>
        </div>

        <input
          type="range"
          min={0}
          max={16}
          step={0.5}
          value={hours}
          onChange={(e) => commit(Number(e.target.value))}
          aria-label="Daily screen time target, in hours"
          aria-describedby="screentime-reaction"
          aria-valuetext={`${hours} hours — ${reaction.text}`}
          className="tif-range w-full cursor-grab active:cursor-grabbing"
          style={{ ["--tif-fill" as string]: `${(hours / 16) * 100}%` }}
        />

        <div className="mt-1.5 flex justify-between font-mono text-[10.5px] text-ink-faint">
          <span>0h</span>
          <span className={cn(heavy && "text-ember")}>{HEAVY_AT}h</span>
          <span>16h</span>
        </div>
      </motion.div>

      <div className="mt-4 min-h-[40px]">
        <AnimatePresence mode="wait">
          <motion.p
            key={reaction.text}
            id="screentime-reaction"
            aria-live="polite"
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -6 }}
            transition={spring.snappy}
            className={cn(
              "text-[13px] leading-relaxed font-medium",
              heavy ? "text-ember" : "text-ink-soft",
            )}
          >
            {reaction.text}
          </motion.p>
        </AnimatePresence>
      </div>
    </Card>
  );
}
