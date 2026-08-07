"use client";

import { useEffect, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { spring } from "@/lib/motion";

/**
 * The live user counter.
 *
 * It creeps upward at an irregular cadence and occasionally loses a few, which
 * is the part that sells it — a number that only ever goes up reads as a
 * script, while a number that dips looks like it's measuring something real.
 * It is measuring nothing. It starts at 10,000,000 for the same reason
 * everyone becomes user #10,000,000 later.
 */
export function LiveCounter() {
  const [n, setN] = useState(10_000_000);
  const [flash, setFlash] = useState<"up" | "down" | null>(null);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    const tick = () => {
      setN((prev) => {
        const losing = Math.random() < 0.22;
        const delta = losing
          ? -Math.floor(1 + Math.random() * 4)
          : Math.floor(1 + Math.random() * 7);
        setFlash(losing ? "down" : "up");
        return prev + delta;
      });
      timer.current = setTimeout(tick, 900 + Math.random() * 2600);
    };

    timer.current = setTimeout(tick, 1500);
    return () => {
      if (timer.current) clearTimeout(timer.current);
    };
  }, []);

  useEffect(() => {
    if (!flash) return;
    const t = setTimeout(() => setFlash(null), 620);
    return () => clearTimeout(t);
  }, [flash, n]);

  const digits = n.toLocaleString("en-US").split("");

  return (
    <div className="inline-flex items-center gap-2.5">
      <span className="relative flex size-2">
        <span className="absolute inline-flex size-full animate-ping rounded-full bg-moss opacity-60" />
        <span className="relative inline-flex size-2 rounded-full bg-moss" />
      </span>

      <span className="flex items-baseline font-mono text-[15px] font-medium tabular-nums">
        {digits.map((d, i) => (
          <span key={`${i}-${d}`} className="relative inline-block">
            {d === "," ? (
              <span className="text-ink-faint">,</span>
            ) : (
              <AnimatePresence mode="popLayout" initial={false}>
                <motion.span
                  key={d + i}
                  initial={{ y: 12, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  exit={{ y: -12, opacity: 0, position: "absolute" }}
                  transition={spring.snappy}
                  className="inline-block"
                >
                  {d}
                </motion.span>
              </AnimatePresence>
            )}
          </span>
        ))}
      </span>

      <span className="text-[13.5px] text-ink-soft">
        people currently regretting this
      </span>

      <AnimatePresence>
        {flash === "down" && (
          <motion.span
            initial={{ opacity: 0, y: 4 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            className="font-mono text-[11px] text-ember"
          >
            −
          </motion.span>
        )}
      </AnimatePresence>
    </div>
  );
}
