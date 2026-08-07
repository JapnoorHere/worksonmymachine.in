"use client";

import { useEffect, useRef, useState } from "react";
import { motion } from "framer-motion";
import { Card, Eyebrow } from "@/components/ui/Primitives";
import { VIBE_METER_LEVELS } from "@/lib/content";
import { deal } from "@/lib/bag";
import { spring } from "@/lib/motion";
import { cn } from "@/lib/cn";

// Lower bound of pixels/ms for each bucket. Tuned by feel, not science.
const THRESHOLDS = [0, 0.05, 0.25, 0.6, 1.1, 1.8, 2.6];
const IDLE_MS = 1400;

/**
 * "Vibe Level": a gauge driven entirely by how fast the mouse is moving.
 * Fast reads as Panicking, slow reads as Procrastinating, motionless reads as
 * Flatlined. The bucket only redeals its commentary when it actually changes,
 * so hovering in place doesn't spam a new line every frame.
 */
export function VibeMeter() {
  const [bucket, setBucket] = useState(0);
  const [note, setNote] = useState(() => VIBE_METER_LEVELS[0].notes[0]);
  const last = useRef<{ x: number; y: number; t: number } | null>(null);
  const idleTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const bucketRef = useRef(0);

  useEffect(() => {
    const setBucketOnce = (b: number) => {
      if (b === bucketRef.current) return;
      bucketRef.current = b;
      setBucket(b);
      setNote(deal(`vibe-notes:${b}`, VIBE_METER_LEVELS[b].notes));
    };

    const onMove = (e: MouseEvent) => {
      const now = performance.now();
      if (last.current) {
        const dt = Math.max(now - last.current.t, 1);
        const dist = Math.hypot(e.clientX - last.current.x, e.clientY - last.current.y);
        const speed = dist / dt;
        let b = 0;
        for (let i = 0; i < THRESHOLDS.length; i++) if (speed >= THRESHOLDS[i]) b = i;
        setBucketOnce(b);
      }
      last.current = { x: e.clientX, y: e.clientY, t: now };

      if (idleTimer.current) clearTimeout(idleTimer.current);
      idleTimer.current = setTimeout(() => setBucketOnce(0), IDLE_MS);
    };

    window.addEventListener("mousemove", onMove);
    return () => {
      window.removeEventListener("mousemove", onMove);
      if (idleTimer.current) clearTimeout(idleTimer.current);
    };
  }, []);

  const level = VIBE_METER_LEVELS[bucket];

  return (
    <Card className="p-5">
      <div className="flex items-baseline justify-between gap-3">
        <Eyebrow>Live</Eyebrow>
        <span className="font-mono text-[10.5px] text-ink-faint">sampled from your cursor</span>
      </div>
      <h3 className="mt-1.5 text-[16.5px] font-bold">Vibe level</h3>

      <div className="mt-4 flex items-baseline gap-2">
        <span className="font-display text-[26px] leading-none font-extrabold tracking-tighter">
          {level.label}
        </span>
      </div>

      <div className="mt-3 flex gap-1">
        {VIBE_METER_LEVELS.map((_, i) => (
          <div key={i} className="h-2 flex-1 overflow-hidden rounded-full bg-surface-3">
            <motion.div
              initial={false}
              animate={{ scaleX: i <= bucket ? 1 : 0 }}
              transition={spring.snappy}
              className={cn(
                "h-full origin-left rounded-full",
                bucket >= 5 ? "bg-ember" : bucket >= 3 ? "bg-warn" : "bg-moss",
              )}
            />
          </div>
        ))}
      </div>

      <p aria-live="polite" className="mt-3 text-[12.5px] leading-relaxed text-ink-soft">
        {note}
      </p>
    </Card>
  );
}
