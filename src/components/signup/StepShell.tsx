"use client";

import { motion } from "framer-motion";
import { Card } from "@/components/ui/Primitives";
import { ease, spring } from "@/lib/motion";
import { cn } from "@/lib/cn";

export interface StepMeta {
  id: string;
  label: string;
}

/**
 * The progress bar lies by omission.
 *
 * It shows three steps until you finish the third, at which point a fourth
 * slides in from the right and the bar walks backwards from 100% to 75%. The
 * animation is what sells it — an instant re-render would look like a bug, so
 * the new segment has to visibly *arrive*.
 */
export function StepProgress({
  steps,
  current,
  revealed,
}: {
  steps: StepMeta[];
  current: number;
  revealed: boolean;
}) {
  const pct = steps.length ? ((current + 1) / steps.length) * 100 : 0;

  return (
    <div className="mb-8">
      <div className="mb-3 flex items-center justify-between gap-3">
        <p className="font-mono text-[10.5px] tracking-[0.16em] text-ink-faint uppercase">
          Step {current + 1} of{" "}
          <motion.span
            key={steps.length}
            initial={revealed ? { scale: 1.6, color: "var(--tif-ember)" } : false}
            animate={{ scale: 1, color: "var(--tif-ink-faint)" }}
            transition={spring.bouncy}
            className="inline-block"
          >
            {steps.length}
          </motion.span>
        </p>
        <p className="font-mono text-[10.5px] text-ink-faint">
          {Math.round(pct)}% complete
        </p>
      </div>

      <div className="flex gap-1.5">
        {steps.map((s, i) => (
          <motion.div
            key={s.id}
            layout
            initial={{ opacity: 0, scaleX: 0.3 }}
            animate={{ opacity: 1, scaleX: 1 }}
            transition={spring.gentle}
            className="h-1.5 flex-1 origin-left overflow-hidden rounded-full bg-surface-3"
          >
            <motion.div
              initial={false}
              animate={{ scaleX: i <= current ? 1 : 0 }}
              transition={{ duration: 0.5, ease: ease.out }}
              className={cn(
                "h-full origin-left rounded-full",
                i < current ? "bg-moss" : "bg-ember",
              )}
            />
          </motion.div>
        ))}
      </div>

      <div className="mt-2.5 hidden gap-1.5 sm:flex">
        {steps.map((s, i) => (
          <motion.p
            key={s.id}
            layout
            className={cn(
              "flex-1 truncate text-[11px] transition-colors",
              i === current ? "font-semibold text-ink" : "text-ink-faint",
            )}
          >
            {s.label}
          </motion.p>
        ))}
      </div>
    </div>
  );
}

export function StepShell({
  eyebrow,
  title,
  subtitle,
  children,
  footer,
}: {
  eyebrow?: string;
  title: string;
  subtitle?: string;
  children: React.ReactNode;
  footer?: React.ReactNode;
}) {
  return (
    <Card className="overflow-hidden p-6 shadow-card sm:p-8">
      {eyebrow && (
        <p className="mb-2 font-mono text-[10.5px] tracking-[0.2em] text-ember uppercase">
          {eyebrow}
        </p>
      )}
      <h1 className="text-[clamp(1.5rem,4vw,2rem)]">{title}</h1>
      {subtitle && (
        <p className="mt-2.5 text-[14.5px] leading-relaxed text-ink-soft">{subtitle}</p>
      )}
      <div className="mt-7">{children}</div>
      {footer && <div className="mt-7 border-t border-line pt-5">{footer}</div>}
    </Card>
  );
}

/** Slide transition shared by every step. Direction-aware. */
export const stepVariants = {
  enter: (dir: number) => ({ x: dir > 0 ? 60 : -60, opacity: 0 }),
  center: { x: 0, opacity: 1 },
  exit: (dir: number) => ({ x: dir > 0 ? -60 : 60, opacity: 0 }),
};
