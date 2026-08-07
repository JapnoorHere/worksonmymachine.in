"use client";

import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Card, Eyebrow } from "@/components/ui/Primitives";
import { DISTRACTION_GUILT } from "@/lib/content";
import { spring } from "@/lib/motion";
import { cn } from "@/lib/cn";

function guiltFor(count: number) {
  let current: { at: number; text: string } | null = null;
  for (const g of DISTRACTION_GUILT) if (count >= g.at) current = g;
  return current;
}

/**
 * Counts how many times you leave the tab while this page is open. Resets on
 * reload — this is a live-session counter, not a persisted metric, same as
 * the vibe meter next to it.
 */
export function DistractionCounter() {
  const [count, setCount] = useState(0);

  useEffect(() => {
    const onVisibility = () => {
      if (document.hidden) setCount((c) => c + 1);
    };
    document.addEventListener("visibilitychange", onVisibility);
    return () => document.removeEventListener("visibilitychange", onVisibility);
  }, []);

  const guilt = guiltFor(count);

  return (
    <Card className="p-5">
      <div className="flex items-baseline justify-between gap-3">
        <Eyebrow>Live</Eyebrow>
        <span className="font-mono text-[10.5px] text-ink-faint">this visit only</span>
      </div>
      <h3 className="mt-1.5 text-[16.5px] font-bold">Distraction counter</h3>

      <div className="mt-4 flex items-baseline gap-2">
        <span
          className={cn(
            "font-display text-[38px] leading-none font-extrabold tracking-tighter tabular-nums",
            count >= 8 && "text-ember",
          )}
        >
          {count}
        </span>
        <span className="font-mono text-[12px] text-ink-faint">
          tab {count === 1 ? "switch" : "switches"}
        </span>
      </div>

      <div className="mt-4 min-h-[36px]">
        <AnimatePresence mode="wait">
          {guilt ? (
            <motion.p
              key={guilt.text}
              aria-live="polite"
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -6 }}
              transition={spring.snappy}
              className="text-[12.5px] leading-relaxed text-ink-soft"
            >
              {guilt.text}
            </motion.p>
          ) : (
            <p className="text-[12.5px] leading-relaxed text-ink-faint">
              Still here. We&apos;re watching, gently.
            </p>
          )}
        </AnimatePresence>
      </div>
    </Card>
  );
}
