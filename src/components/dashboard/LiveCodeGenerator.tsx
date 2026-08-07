"use client";

import { useEffect, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Card, Eyebrow } from "@/components/ui/Primitives";
import { LIVE_CODE_LINES, DEPLOY_BANNER_LINES } from "@/lib/content";
import { deal } from "@/lib/bag";
import { spring } from "@/lib/motion";

const MAX_LINES = 9;

/**
 * A box that types nonsense pseudocode forever and flashes a "Deployed to
 * Production" banner every few seconds. Both pools are dealt, so a visitor
 * would need to sit here for a very long time before either repeated.
 */
export function LiveCodeGenerator() {
  const [lines, setLines] = useState<string[]>([]);
  const [banner, setBanner] = useState<string | null>(null);
  const logRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const id = setInterval(() => {
      setLines((prev) => [...prev.slice(-(MAX_LINES - 1)), deal("live-code", LIVE_CODE_LINES)]);
    }, 1500);
    return () => clearInterval(id);
  }, []);

  useEffect(() => {
    const id = setInterval(() => {
      setBanner(deal("deploy-banner", DEPLOY_BANNER_LINES));
      const t = setTimeout(() => setBanner(null), 2200);
      return () => clearTimeout(t);
    }, 5200);
    return () => clearInterval(id);
  }, []);

  useEffect(() => {
    logRef.current?.scrollTo({ top: 99999, behavior: "smooth" });
  }, [lines]);

  return (
    <Card className="relative overflow-hidden p-5">
      <div className="flex items-baseline justify-between gap-3">
        <Eyebrow>Live</Eyebrow>
        <span className="font-mono text-[10.5px] text-ink-faint">building, always</span>
      </div>
      <h3 className="mt-1.5 text-[16.5px] font-bold">Continuous deployment</h3>

      <div
        ref={logRef}
        aria-hidden
        className="tif-hatch mt-4 h-[168px] overflow-hidden rounded-lg bg-ink px-3.5 py-3 font-mono text-[11.5px] leading-relaxed text-moss"
      >
        {lines.map((l, i) => (
          <div key={i} className="whitespace-pre-wrap opacity-90">
            {l}
          </div>
        ))}
        <span className="tif-blink">▍</span>
      </div>

      <p className="sr-only" aria-live="off">
        A simulated code feed. Purely decorative, not real output.
      </p>

      <AnimatePresence>
        {banner && (
          <motion.div
            initial={{ y: -12, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: -12, opacity: 0 }}
            transition={spring.snappy}
            role="status"
            aria-live="polite"
            className="absolute top-3 right-3 left-3 rounded-lg bg-moss px-3 py-1.5 text-center font-mono text-[10.5px] font-semibold tracking-wide text-white shadow-float"
          >
            {banner}
          </motion.div>
        )}
      </AnimatePresence>
    </Card>
  );
}
