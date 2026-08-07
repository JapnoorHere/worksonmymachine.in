"use client";

import { useRef, useState } from "react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/Button";
import { useAchievements } from "@/components/providers/AchievementProvider";
import { DESPERATION_LINES } from "@/lib/content";
import { spring } from "@/lib/motion";
import { cn } from "@/lib/cn";

function reactionFor(pct: number) {
  let current = DESPERATION_LINES[0];
  for (const r of DESPERATION_LINES) if (pct >= r.at) current = r;
  return current;
}

const REPEL_RADIUS = 90;
const MAX_OFFSET = 46;

/**
 * The submit button is negotiable.
 *
 * At 0% desperation it magnetically repels the cursor within a ~90px radius.
 * Dragging the slider up linearly weakens the repulsion until, at 100%, it
 * sits dead center, small, and red — it has surrendered. This is mouse-only,
 * same shape as the landing page's dodging CTA: keyboard users tab to the
 * button and press Enter, completely unaffected, because the bit is a
 * cursor-chasing joke and a Tab key was never being chased.
 */
export function DesperationSubmit({
  onSubmit,
  disabled,
  loading,
}: {
  onSubmit: (desperation: number) => void;
  disabled: boolean;
  loading: boolean;
}) {
  const [desperation, setDesperation] = useState(0);
  const [offset, setOffset] = useState({ x: 0, y: 0 });
  const btnRef = useRef<HTMLButtonElement>(null);
  const { unlock } = useAchievements();

  const strength = 1 - desperation / 100;
  const reaction = reactionFor(desperation);
  const surrendered = desperation >= 100;

  const onMouseMove = (e: React.MouseEvent) => {
    if (strength <= 0 || !btnRef.current) return;
    const rect = btnRef.current.getBoundingClientRect();
    const cx = rect.left + rect.width / 2;
    const cy = rect.top + rect.height / 2;
    const dx = cx - e.clientX;
    const dy = cy - e.clientY;
    const dist = Math.max(Math.hypot(dx, dy), 1);
    if (dist > REPEL_RADIUS) {
      setOffset({ x: 0, y: 0 });
      return;
    }
    const push = (1 - dist / REPEL_RADIUS) * MAX_OFFSET * strength;
    setOffset({ x: (dx / dist) * push, y: (dy / dist) * push });
  };

  return (
    <div className="space-y-4">
      <div>
        <div className="mb-1.5 flex items-baseline justify-between gap-3">
          <label htmlFor="desperation" className="text-[13px] font-semibold tracking-tight">
            Desperation level
          </label>
          <span className="font-mono text-[11.5px] text-ink-faint">{desperation}%</span>
        </div>
        <input
          id="desperation"
          type="range"
          min={0}
          max={100}
          value={desperation}
          onChange={(e) => setDesperation(Number(e.target.value))}
          aria-describedby="desperation-reaction"
          className="tif-range w-full cursor-grab active:cursor-grabbing"
          style={{ ["--tif-fill" as string]: `${desperation}%` }}
        />
        <p id="desperation-reaction" aria-live="polite" className="mt-1.5 text-[12px] text-ink-soft">
          {reaction.text}
        </p>
      </div>

      <div
        onMouseMove={onMouseMove}
        onMouseLeave={() => setOffset({ x: 0, y: 0 })}
        className="flex h-[68px] items-center"
      >
        <motion.div
          animate={{ x: offset.x, y: offset.y, scale: 1 - (desperation / 100) * 0.22 }}
          transition={spring.snappy}
          className="inline-block"
        >
          <Button
            ref={btnRef}
            size="lg"
            disabled={disabled}
            loading={loading}
            onClick={() => {
              if (surrendered) unlock("desperate");
              onSubmit(desperation);
            }}
            className={cn(surrendered && "!bg-ember shadow-[0_0_0_4px_var(--tif-ember-wash)]")}
          >
            Submit for review
          </Button>
        </motion.div>
      </div>
    </div>
  );
}
