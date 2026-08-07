"use client";

import { useEffect, useRef, useState } from "react";
import { motion, useMotionTemplate, useMotionValue, useReducedMotion } from "framer-motion";
import { Card, Eyebrow } from "@/components/ui/Primitives";
import { Button } from "@/components/ui/Button";
import { useToast } from "@/components/providers/ToastProvider";
import { useSound } from "@/components/providers/SoundProvider";

const AUTO_REVERT_MS = 4200;

/**
 * "Turn off the lights."
 *
 * Deliberately its own button, not the real ThemeToggle — that control's
 * inverted-label joke is documented and acknowledged exactly once, ever
 * (PROJECT.md §7.4), and nothing else on the site is allowed to touch it.
 * This one just goes dark: a full blackout with a flashlight cone that tracks
 * the cursor, escapable at any moment by pressing any key or clicking, plus a
 * hard timer so it can never outstay its welcome.
 *
 * Under reduced motion the blackout still happens (it's user-triggered and
 * instantly reversible, unlike ambient page motion) but the entrance skips its
 * fade and the flashlight itself is disabled — no cursor-follow, no fully black
 * screen with a moving hole. You get a plain dark curtain and a fixed dismiss
 * button front and center.
 */
export function VoidButton() {
  const [active, setActive] = useState(false);
  const toast = useToast();
  const { play } = useSound();
  const reducedMotion = useReducedMotion();
  const dismissRef = useRef<HTMLButtonElement>(null);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const mx = useMotionValue(0);
  const my = useMotionValue(0);
  const mask = useMotionTemplate`radial-gradient(circle 130px at ${mx}px ${my}px, transparent 0%, transparent 50%, black 100%)`;

  const activate = () => {
    if (typeof window !== "undefined") {
      mx.set(window.innerWidth / 2);
      my.set(window.innerHeight / 2);
    }
    setActive(true);
    play("whoosh");
  };

  const revert = () => {
    setActive(false);
    if (timerRef.current) clearTimeout(timerRef.current);
    toast({
      title: "You wanted dark mode.",
      body: "Welcome to the void.",
      emoji: "🕳️",
      tone: "neutral",
      duration: 5000,
    });
    play("pop");
  };

  useEffect(() => {
    if (!active) return;
    dismissRef.current?.focus();
    timerRef.current = setTimeout(revert, AUTO_REVERT_MS);
    const onKey = () => revert();
    window.addEventListener("keydown", onKey);
    return () => {
      window.removeEventListener("keydown", onKey);
      if (timerRef.current) clearTimeout(timerRef.current);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [active]);

  return (
    <>
      <Card className="p-5">
        <div className="flex items-baseline justify-between gap-3">
          <Eyebrow>Ambiance</Eyebrow>
          <span className="font-mono text-[10.5px] text-ink-faint">reversible</span>
        </div>
        <h3 className="mt-1.5 text-[16.5px] font-bold">Turn off the lights</h3>
        <p className="mt-1.5 text-[13px] leading-relaxed text-ink-soft">
          For when the real dark mode wasn&apos;t dark enough.
        </p>
        <Button variant="secondary" className="mt-4" onClick={activate}>
          Turn off the lights
        </Button>
      </Card>

      {active && (
        <motion.div
          role="dialog"
          aria-modal="true"
          aria-label="The void"
          initial={reducedMotion ? false : { opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={reducedMotion ? { duration: 0 } : { duration: 0.4 }}
          onPointerMove={(e) => {
            if (reducedMotion) return;
            mx.set(e.clientX);
            my.set(e.clientY);
          }}
          onClick={revert}
          className="fixed inset-0 z-[200] bg-ink"
          style={reducedMotion ? undefined : { WebkitMaskImage: mask, maskImage: mask }}
        >
          <p className="sr-only" aria-live="assertive">
            The lights are off. Press any key, click, or wait a moment to bring them back.
          </p>
          <button
            ref={dismissRef}
            type="button"
            onClick={revert}
            className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 cursor-pointer rounded-full border border-white/20 bg-white/5 px-5 py-2.5 font-mono text-[11px] tracking-wide text-white/70 backdrop-blur-sm hover:bg-white/10 hover:text-white"
          >
            bring back the lights
          </button>
        </motion.div>
      )}
    </>
  );
}
