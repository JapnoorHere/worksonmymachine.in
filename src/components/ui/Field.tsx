"use client";

import { forwardRef, useId } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { cn } from "@/lib/cn";
import { spring } from "@/lib/motion";

export type FieldTone = "idle" | "checking" | "error" | "ok" | "warn";

const TONE_RING: Record<FieldTone, string> = {
  idle: "border-line-strong focus-within:border-ember",
  checking: "border-line-strong focus-within:border-ember",
  error: "border-ember",
  ok: "border-moss",
  warn: "border-warn",
};

const TONE_TEXT: Record<FieldTone, string> = {
  idle: "text-ink-faint",
  checking: "text-ink-faint",
  error: "text-ember",
  ok: "text-moss",
  warn: "text-warn",
};

interface FieldProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label: string;
  hint?: string;
  /** The line under the field. Animates in and out. */
  message?: string | null;
  tone?: FieldTone;
  trailing?: React.ReactNode;
}

export const Field = forwardRef<HTMLInputElement, FieldProps>(function Field(
  { label, hint, message, tone = "idle", trailing, className, id, ...rest },
  ref,
) {
  const auto = useId();
  const inputId = id ?? auto;
  const msgId = `${inputId}-msg`;

  return (
    <div className="w-full">
      <div className="mb-1.5 flex items-baseline justify-between gap-3">
        <label htmlFor={inputId} className="text-[13px] font-semibold tracking-tight">
          {label}
        </label>
        {hint && <span className="text-[11.5px] text-ink-faint">{hint}</span>}
      </div>

      <motion.div
        animate={tone === "error" ? { x: [0, -6, 5, -3, 0] } : { x: 0 }}
        transition={{ duration: 0.32 }}
        className={cn(
          "flex items-center gap-2 rounded-[10px] border bg-surface px-3 transition-colors duration-200",
          "focus-within:shadow-[var(--tif-ring)]",
          TONE_RING[tone],
        )}
      >
        <input
          ref={ref}
          id={inputId}
          aria-describedby={message ? msgId : undefined}
          aria-invalid={tone === "error" || undefined}
          className={cn(
            "h-11 w-full min-w-0 bg-transparent text-[15px] outline-none",
            "placeholder:text-ink-faint",
            className,
          )}
          {...rest}
        />
        {trailing}
      </motion.div>

      <AnimatePresence mode="wait" initial={false}>
        {message && (
          <motion.p
            key={message}
            id={msgId}
            initial={{ opacity: 0, y: -5, height: 0 }}
            animate={{ opacity: 1, y: 0, height: "auto" }}
            exit={{ opacity: 0, y: -5, height: 0 }}
            transition={spring.snappy}
            className={cn(
              "overflow-hidden pt-1.5 text-[12.5px] leading-snug",
              TONE_TEXT[tone],
            )}
          >
            {message}
          </motion.p>
        )}
      </AnimatePresence>
    </div>
  );
});
