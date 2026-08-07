"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Card } from "@/components/ui/Primitives";
import { useDaily } from "@/components/providers/DailyProvider";
import { useSound } from "@/components/providers/SoundProvider";
import { dealMany } from "@/lib/bag";
import { spring } from "@/lib/motion";
import { cn } from "@/lib/cn";
import type { AccountData, ServerError } from "./StepAccount";

/**
 * The fake processing screen — which now does one real thing underneath it.
 *
 * Three things keep the theater from feeling scripted. The steps are dealt
 * from a 75-entry shuffle bag, so a second run through signup shows a
 * completely different sequence. The durations are random per-step
 * (600–1500ms), so even an identical sequence wouldn't feel identical. And
 * the progress bar is deliberately non-linear — it sprints to 80%, stalls,
 * and finishes in a rush, which is what every real progress bar does and what
 * no fake one imitates.
 *
 * Underneath all of that, this component fires the real `POST /api/auth/signup`
 * the moment it mounts, in parallel with the fake beats. `onDone` only fires
 * once *both* the animation and the real request have finished; a real
 * failure (a duplicate-email race is the realistic one, since the live check
 * on Step 1 already caught the common case) short-circuits straight to
 * `onFail` rather than making anyone sit through a fake success first.
 */
export function StepProcessing({
  account,
  vibes,
  trust,
  onDone,
  onFail,
}: {
  account: AccountData;
  vibes: string[];
  trust: number;
  onDone: () => void;
  onFail: (err: ServerError) => void;
}) {
  const daily = useDaily();
  const [index, setIndex] = useState(0);
  const [pct, setPct] = useState(0);
  const [animDone, setAnimDone] = useState(false);
  const [requestDone, setRequestDone] = useState(false);
  const { play } = useSound();
  const finished = useRef(false);
  const failed = useRef(false);

  // 6–9 distinct steps dealt from the full merged pool (built-ins plus any
  // approved community submissions), so a repeat signup never replays.
  const steps = useMemo(
    () => dealMany("processing", daily.processing, 6 + Math.floor(Math.random() * 4)),
    [daily.processing],
  );

  // The real work, kicked off once, in parallel with the fake beats below.
  useEffect(() => {
    let cancelled = false;

    (async () => {
      try {
        const res = await fetch("/api/auth/signup", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            name: account.name,
            email: account.email,
            password: account.password,
            age: account.age,
            vibes,
            trust,
          }),
        });
        const data = (await res.json()) as { ok: boolean; field?: string; error?: string };
        if (cancelled) return;

        if (!res.ok || !data.ok) {
          failed.current = true;
          onFail({
            field: (data.field as ServerError["field"]) ?? "general",
            message: data.error ?? "Something went wrong. Try again.",
          });
          return;
        }
        setRequestDone(true);
      } catch {
        if (cancelled) return;
        failed.current = true;
        onFail({ field: "general", message: "Couldn't reach the server. Try again in a moment." });
      }
    })();

    return () => {
      cancelled = true;
    };
    // Runs exactly once, when the processing screen mounts.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (finished.current || failed.current) return;

    if (index >= steps.length) {
      finished.current = true;
      setPct(100);
      play("success");
      const t = setTimeout(() => setAnimDone(true), 800);
      return () => clearTimeout(t);
    }

    play("tick");

    const progress = (index + 1) / steps.length;
    // Ease hard toward 80, then crawl. Classic dishonest progress bar.
    setPct(Math.round(Math.min(96, 80 * Math.pow(progress, 0.55) + progress * 16)));

    const dwell = 600 + Math.random() * 900;
    const t = setTimeout(() => setIndex((i) => i + 1), dwell);
    return () => clearTimeout(t);
  }, [index, steps.length, play]);

  // The fake animation is just theater; the real request is what matters.
  // Only advance once both have actually finished.
  useEffect(() => {
    if (animDone && requestDone) onDone();
  }, [animDone, requestDone, onDone]);

  const visible = steps.slice(Math.max(0, index - 3), index + 1);

  return (
    <Card className="overflow-hidden p-8 text-center shadow-card sm:p-12">
      <div className="relative mx-auto mb-8 size-20">
        <motion.span
          className="absolute inset-0 rounded-full border-[3px] border-line"
          aria-hidden
        />
        <motion.span
          className="absolute inset-0 rounded-full border-[3px] border-transparent border-t-ember"
          animate={{ rotate: 360 }}
          transition={{ duration: 1.1, repeat: Infinity, ease: "linear" }}
          aria-hidden
        />
        <motion.span
          className="absolute inset-2.5 rounded-full border-[3px] border-transparent border-b-moss"
          animate={{ rotate: -360 }}
          transition={{ duration: 1.7, repeat: Infinity, ease: "linear" }}
          aria-hidden
        />
        <span className="absolute inset-0 grid place-items-center font-mono text-[12px] font-semibold tabular-nums">
          {pct}%
        </span>
      </div>

      <h1 className="text-[clamp(1.4rem,3.6vw,1.9rem)]">Setting up your workspace</h1>
      <p className="mt-2.5 text-[14px] text-ink-soft">
        This usually takes a few seconds. Occasionally it takes a few seconds.
      </p>

      <div
        className="mx-auto mt-8 flex h-[132px] max-w-md flex-col justify-end gap-1.5"
        aria-live="polite"
        aria-atomic="false"
      >
        <AnimatePresence mode="popLayout" initial={false}>
          {visible.map((s, i) => {
            const isCurrent = i === visible.length - 1 && index < steps.length;
            return (
              <motion.p
                key={s}
                layout
                initial={{ opacity: 0, y: 14 }}
                animate={{ opacity: isCurrent ? 1 : 0.3, y: 0 }}
                exit={{ opacity: 0, y: -14 }}
                transition={spring.snappy}
                className={cn(
                  "flex items-center justify-center gap-2 font-mono text-[12.5px]",
                  isCurrent ? "text-ink" : "text-ink-faint",
                )}
              >
                <span
                  className={cn(
                    "size-1.5 shrink-0 rounded-full",
                    isCurrent ? "bg-ember" : "bg-moss",
                  )}
                />
                {s}
                {isCurrent && <span className="tif-blink">…</span>}
              </motion.p>
            );
          })}
        </AnimatePresence>
      </div>

      <div className="mx-auto mt-8 h-1.5 max-w-md overflow-hidden rounded-full bg-surface-3">
        <motion.div
          animate={{ width: `${pct}%` }}
          transition={spring.gentle}
          className="h-full rounded-full bg-gradient-to-r from-ember to-warn"
        />
      </div>

      <p className="mt-4 font-mono text-[10.5px] text-ink-faint">
        please do not close this tab · it will not matter either way
      </p>
    </Card>
  );
}
