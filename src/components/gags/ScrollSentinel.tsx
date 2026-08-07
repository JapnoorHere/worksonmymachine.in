"use client";

import { useEffect, useRef } from "react";
import { useAchievements } from "@/components/providers/AchievementProvider";
import { KevinAside } from "./KevinAside";

/**
 * The bottom of the landing page.
 *
 * There is famously nothing down here, which is the joke the achievement pays
 * off. Uses IntersectionObserver rather than a scroll listener so it costs
 * nothing on the way down.
 */
export function ScrollSentinel() {
  const ref = useRef<HTMLDivElement>(null);
  const { unlock } = useAchievements();

  useEffect(() => {
    const el = ref.current;
    if (!el || typeof IntersectionObserver === "undefined") return;

    const io = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          unlock("deep-scroll");
          io.disconnect();
        }
      },
      { threshold: 0.9 },
    );

    io.observe(el);
    return () => io.disconnect();
  }, [unlock]);

  return (
    <div ref={ref} className="py-10 text-center">
      <p className="font-mono text-[10.5px] tracking-[0.18em] text-ink-faint uppercase">
        You have reached the bottom
      </p>
      <p className="mx-auto mt-2 max-w-sm text-[13px] leading-relaxed text-ink-soft">
        There&apos;s nothing here. We put nothing here on purpose so that finding it
        would mean something. It doesn&apos;t, but it could have.
      </p>
      <KevinAside surface="footer-sentinel" align="center" className="mt-4" />
    </div>
  );
}
