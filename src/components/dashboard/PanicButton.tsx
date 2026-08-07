"use client";

import { useEffect, useRef, useState } from "react";
import { motion } from "framer-motion";
import { Card } from "@/components/ui/Primitives";
import { PANIC_TERMINAL_LINES } from "@/lib/content";
import { deal } from "@/lib/bag";
import { useAchievements } from "@/components/providers/AchievementProvider";
import { useSound } from "@/components/providers/SoundProvider";

const MAX_LINES = 22;

/**
 * "Boss Coming!" — replaces the entire viewport with a fake, scrolling
 * terminal. Closes on Escape, on click anywhere, or via the visible dismiss
 * button, which also takes focus on open so keyboard and screen-reader users
 * always have an immediate, announced way out.
 */
export function PanicButton() {
  const [active, setActive] = useState(false);
  const [lines, setLines] = useState<string[]>([]);
  const logRef = useRef<HTMLDivElement>(null);
  const dismissRef = useRef<HTMLButtonElement>(null);
  const { unlock } = useAchievements();
  const { play } = useSound();

  const activate = () => {
    setActive(true);
    setLines([]);
    unlock("panic-button");
    play("thud");
  };

  const deactivate = () => {
    setActive(false);
    play("click");
  };

  useEffect(() => {
    if (!active) return;
    dismissRef.current?.focus();

    const id = setInterval(() => {
      setLines((prev) => [...prev.slice(-(MAX_LINES - 1)), deal("panic-terminal", PANIC_TERMINAL_LINES)]);
    }, 260);

    const onKey = () => deactivate();
    window.addEventListener("keydown", onKey);
    return () => {
      clearInterval(id);
      window.removeEventListener("keydown", onKey);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [active]);

  useEffect(() => {
    logRef.current?.scrollTo({ top: 99999, behavior: "auto" });
  }, [lines]);

  return (
    <>
      <Card className="flex h-full flex-col justify-between p-5">
        <div>
          <p className="font-mono text-[10.5px] tracking-[0.16em] text-ink-faint uppercase">
            Emergency
          </p>
          <h3 className="mt-1.5 text-[16.5px] font-bold">In case of emergency</h3>
          <p className="mt-1.5 text-[13px] leading-relaxed text-ink-soft">
            Instantly replaces this page with something more convincing.
          </p>
        </div>
        <button
          type="button"
          onClick={activate}
          className="mt-4 w-full cursor-pointer rounded-xl bg-ember py-3.5 text-[14px] font-bold text-ember-ink shadow-[0_1px_0_rgba(255,255,255,0.25)_inset,0_8px_20px_-8px_rgba(232,65,11,0.7)] transition-transform active:scale-[0.98]"
        >
          Boss Coming!
        </button>
      </Card>

      {active && (
        <motion.div
          role="dialog"
          aria-modal="true"
          aria-label="Decoy terminal"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          onClick={deactivate}
          className="fixed inset-0 z-[200] flex flex-col bg-black p-4 font-mono text-[12.5px] text-[#4ade80] sm:p-8"
        >
          <p className="sr-only" aria-live="assertive">
            This is a decoy screen. Press any key, click anywhere, or use the return button to go
            back to the dashboard.
          </p>
          <div ref={logRef} className="flex-1 overflow-hidden">
            {lines.map((l, i) => (
              <div key={i} className="opacity-90">
                <span className="opacity-50">$ </span>
                {l}
              </div>
            ))}
            <span className="tif-blink">▍</span>
          </div>
          <button
            ref={dismissRef}
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              deactivate();
            }}
            className="mt-3 w-fit cursor-pointer rounded-md border border-[#4ade80]/30 px-3 py-1.5 text-[11px] text-[#4ade80]/80 hover:bg-[#4ade80]/10 hover:text-[#4ade80]"
          >
            ← return to dashboard
          </button>
        </motion.div>
      )}
    </>
  );
}
