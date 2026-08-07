"use client";

import { useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { ANXIOUS_TOOLTIPS } from "@/lib/content";
import { deal } from "@/lib/bag";
import { spring } from "@/lib/motion";
import { cn } from "@/lib/cn";

/** Below this many px of headroom, there isn't room for the bubble above. */
const MIN_HEADROOM = 70;

/**
 * Wraps an element in a UI component that has feelings about being hovered.
 *
 * One shared deck ("anxious-tooltips") across every instance on the page, same
 * reasoning as the feature cards' hover-roasts: you'd have to hover 50 things
 * before a line repeated. The caption is purely decorative commentary, not
 * information, so it's aria-hidden — nothing here needs to reach a screen
 * reader, and the wrapped control keeps its own accessible name untouched.
 *
 * `side` is a preference, not a promise: elements living in the sticky nav
 * have no headroom above them, so the bubble measures itself on show and
 * flips to the other side rather than running off the top of the viewport.
 */
export function Anxious({
  children,
  className,
  side = "top",
}: {
  children: React.ReactNode;
  className?: string;
  side?: "top" | "bottom";
}) {
  const [line, setLine] = useState<string | null>(null);
  const [resolvedSide, setResolvedSide] = useState(side);
  const wrapRef = useRef<HTMLSpanElement>(null);

  const show = () => {
    if (side === "top" && wrapRef.current) {
      const rect = wrapRef.current.getBoundingClientRect();
      setResolvedSide(rect.top < MIN_HEADROOM ? "bottom" : "top");
    } else {
      setResolvedSide(side);
    }
    setLine(deal("anxious-tooltips", ANXIOUS_TOOLTIPS));
  };
  const hide = () => setLine(null);

  return (
    <span
      ref={wrapRef}
      className={cn("relative inline-flex", className)}
      onMouseEnter={show}
      onMouseLeave={hide}
      onFocus={show}
      onBlur={hide}
    >
      {children}
      <AnimatePresence>
        {line && (
          <motion.span
            aria-hidden
            initial={{ opacity: 0, y: resolvedSide === "top" ? 6 : -6, scale: 0.94 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: resolvedSide === "top" ? 6 : -6, scale: 0.94 }}
            transition={spring.snappy}
            className={cn(
              "pointer-events-none absolute left-1/2 z-40 w-max max-w-[210px] -translate-x-1/2 rounded-lg border border-line bg-ink px-2.5 py-1.5 text-center font-mono text-[10.5px] leading-snug text-bg shadow-float",
              resolvedSide === "top" ? "-top-2 -translate-y-full" : "-bottom-2 translate-y-full",
            )}
          >
            {line}
          </motion.span>
        )}
      </AnimatePresence>
    </span>
  );
}
