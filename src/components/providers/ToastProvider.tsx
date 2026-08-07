"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { AnimatePresence, motion } from "framer-motion";
import { useSound } from "./SoundProvider";
import { spring } from "@/lib/motion";

export type ToastTone = "neutral" | "ember" | "moss" | "warn" | "achievement";

export interface ToastInput {
  title: string;
  body?: string;
  tone?: ToastTone;
  emoji?: string;
  /** ms; 0 keeps it until dismissed. */
  duration?: number;
}

interface ToastItem extends ToastInput {
  id: number;
}

const Ctx = createContext<{ toast: (t: ToastInput) => void }>({ toast: () => {} });
export const useToast = () => useContext(Ctx).toast;

const TONE_BAR: Record<ToastTone, string> = {
  neutral: "bg-ink-faint",
  ember: "bg-ember",
  moss: "bg-moss",
  warn: "bg-warn",
  achievement: "bg-ember",
};

let seq = 0;

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [items, setItems] = useState<ToastItem[]>([]);
  const timers = useRef(new Map<number, ReturnType<typeof setTimeout>>());
  const { play } = useSound();

  const dismiss = useCallback((id: number) => {
    const t = timers.current.get(id);
    if (t) {
      clearTimeout(t);
      timers.current.delete(id);
    }
    setItems((prev) => prev.filter((i) => i.id !== id));
  }, []);

  const toast = useCallback(
    (input: ToastInput) => {
      const id = ++seq;
      const duration = input.duration ?? 5200;
      // Cap the stack so a chatty page can't wallpaper the viewport.
      setItems((prev) => [...prev.slice(-3), { ...input, id }]);
      play(input.tone === "achievement" ? "chime" : "pop");
      if (duration > 0) {
        timers.current.set(
          id,
          setTimeout(() => dismiss(id), duration),
        );
      }
    },
    [dismiss, play],
  );

  useEffect(() => {
    const map = timers.current;
    return () => map.forEach(clearTimeout);
  }, []);

  const value = useMemo(() => ({ toast }), [toast]);

  return (
    <Ctx.Provider value={value}>
      {children}
      <div
        aria-live="polite"
        aria-relevant="additions"
        /* Stacked above the chat launcher, which owns the bottom-right corner. */
        className="pointer-events-none fixed inset-x-3 bottom-[74px] z-[90] flex flex-col items-stretch gap-2 sm:inset-x-auto sm:right-5 sm:bottom-[84px] sm:w-[364px]"
      >
        <AnimatePresence initial={false}>
          {items.map((t) => (
            <motion.div
              key={t.id}
              layout
              initial={{ opacity: 0, y: 22, scale: 0.94 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, x: 40, scale: 0.96, transition: { duration: 0.18 } }}
              transition={spring.snappy}
              className="pointer-events-auto overflow-hidden rounded-xl border border-line bg-surface shadow-float"
            >
              <div className="flex items-stretch">
                <div className={`w-1 shrink-0 ${TONE_BAR[t.tone ?? "neutral"]}`} />
                <div className="flex flex-1 items-start gap-3 p-3.5">
                  {t.emoji && (
                    <span aria-hidden className="mt-px text-lg leading-none">
                      {t.emoji}
                    </span>
                  )}
                  <div className="min-w-0 flex-1">
                    {t.tone === "achievement" && (
                      <p className="mb-0.5 font-mono text-[10px] tracking-[0.16em] text-ember uppercase">
                        Achievement unlocked
                      </p>
                    )}
                    <p className="text-[13.5px] leading-snug font-semibold">{t.title}</p>
                    {t.body && (
                      <p className="mt-1 text-[12.5px] leading-relaxed text-ink-soft">{t.body}</p>
                    )}
                  </div>
                  <button
                    onClick={() => dismiss(t.id)}
                    aria-label="Dismiss notification"
                    className="-m-1 shrink-0 rounded-md p-1 text-ink-faint transition-colors hover:bg-surface-2 hover:text-ink"
                  >
                    <svg width="13" height="13" viewBox="0 0 14 14" aria-hidden>
                      <path
                        d="M1 1l12 12M13 1L1 13"
                        stroke="currentColor"
                        strokeWidth="1.8"
                        strokeLinecap="round"
                      />
                    </svg>
                  </button>
                </div>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
    </Ctx.Provider>
  );
}
