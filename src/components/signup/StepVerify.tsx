"use client";

import { useEffect, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Button } from "@/components/ui/Button";
import { StepShell } from "./StepShell";
import { useSound } from "@/components/providers/SoundProvider";
import { useToast } from "@/components/providers/ToastProvider";
import { spring } from "@/lib/motion";
import { cn } from "@/lib/cn";

/**
 * Nothing was sent. Any six digits work.
 *
 * The comedy is entirely in the fake validation: a theatrical multi-second
 * check with escalating status text that has no business taking that long,
 * followed by unconditional success. Which is, notably, how a real one feels.
 */
const VALIDATION_BEATS = [
  "Contacting mail server",
  "Mail server contacted",
  "Mail server has no record of this",
  "Checking code against expected value",
  "Expected value not found",
  "Approving anyway",
];

export function StepVerify({
  email,
  onNext,
  onBack,
}: {
  email: string;
  onNext: () => void;
  onBack: () => void;
}) {
  const [digits, setDigits] = useState<string[]>(Array(6).fill(""));
  const [beat, setBeat] = useState(-1);
  const [done, setDone] = useState(false);
  const inputs = useRef<(HTMLInputElement | null)[]>([]);
  const { play } = useSound();
  const toast = useToast();

  const code = digits.join("");
  const complete = code.length === 6 && digits.every(Boolean);

  useEffect(() => {
    inputs.current[0]?.focus();
  }, []);

  useEffect(() => {
    const t = setTimeout(
      () =>
        toast({
          title: "Code sent",
          body: `We sent a 6-digit code to ${email || "your email"}. We did not.`,
          emoji: "📨",
          duration: 6000,
        }),
      700,
    );
    return () => clearTimeout(t);
  }, [email, toast]);

  const setDigit = (i: number, v: string) => {
    const clean = v.replace(/\D/g, "");
    if (!clean && v !== "") return;

    setDigits((prev) => {
      const next = [...prev];
      if (clean.length > 1) {
        // Handles paste: spread across the remaining boxes.
        clean.split("").forEach((c, k) => {
          if (i + k < 6) next[i + k] = c;
        });
      } else {
        next[i] = clean;
      }
      return next;
    });

    if (clean) {
      play("tick");
      const jump = Math.min(5, i + Math.max(1, clean.length));
      inputs.current[jump]?.focus();
    }
  };

  const onKeyDown = (i: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Backspace" && !digits[i] && i > 0) {
      inputs.current[i - 1]?.focus();
    }
    if (e.key === "ArrowLeft" && i > 0) inputs.current[i - 1]?.focus();
    if (e.key === "ArrowRight" && i < 5) inputs.current[i + 1]?.focus();
  };

  const verify = () => {
    if (!complete || beat >= 0) return;
    setBeat(0);
  };

  // Walk the beats, then let everyone through.
  useEffect(() => {
    if (beat < 0 || done) return;

    if (beat >= VALIDATION_BEATS.length) {
      setDone(true);
      play("success");
      const t = setTimeout(onNext, 900);
      return () => clearTimeout(t);
    }

    // Irregular gaps: the "Approving anyway" beat lands after a longer pause.
    const gap = beat === VALIDATION_BEATS.length - 1 ? 1100 : 520 + Math.random() * 420;
    const t = setTimeout(() => setBeat((b) => b + 1), gap);
    return () => clearTimeout(t);
  }, [beat, done, onNext, play]);

  const busy = beat >= 0;

  return (
    <StepShell
      eyebrow="Verify email"
      title="Check your inbox."
      subtitle={`We sent a 6-digit code to ${email || "your email address"}. It should arrive shortly, in the sense that it will not.`}
      footer={
        <div className="flex items-center justify-between gap-4">
          <Button variant="ghost" onClick={onBack} disabled={busy}>
            Back
          </Button>
          <Button size="lg" onClick={verify} disabled={!complete || busy} loading={busy && !done}>
            {done ? "Verified" : "Verify"}
          </Button>
        </div>
      }
    >
      <div>
        <div className="flex justify-center gap-2 sm:gap-3" role="group" aria-label="6-digit code">
          {digits.map((d, i) => (
            <motion.input
              key={i}
              ref={(el) => {
                inputs.current[i] = el;
              }}
              value={d}
              onChange={(e) => setDigit(i, e.target.value)}
              onKeyDown={(e) => onKeyDown(i, e)}
              onFocus={(e) => e.target.select()}
              inputMode="numeric"
              autoComplete="one-time-code"
              maxLength={6}
              disabled={busy}
              aria-label={`Digit ${i + 1}`}
              animate={done ? { borderColor: "var(--tif-moss)" } : {}}
              whileFocus={{ scale: 1.05 }}
              transition={spring.snappy}
              className={cn(
                "h-14 w-11 rounded-xl border bg-surface text-center font-mono text-[21px] font-semibold",
                "outline-none transition-colors focus:border-ember focus:shadow-[var(--tif-ring)]",
                "disabled:opacity-70 sm:h-16 sm:w-13",
                d ? "border-line-strong" : "border-line",
              )}
            />
          ))}
        </div>

        <div className="mt-6 min-h-[76px] rounded-xl border border-line bg-surface-2 p-4">
          <AnimatePresence mode="popLayout">
            {beat < 0 ? (
              <motion.p
                key="idle"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="text-center text-[12.5px] text-ink-faint"
              >
                Any six digits will work. We want to be clear that we are not
                checking. We just like the ritual.
              </motion.p>
            ) : (
              <motion.div key="beats" className="space-y-1.5">
                {VALIDATION_BEATS.slice(0, beat + 1).map((b, i) => (
                  <motion.p
                    key={b}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: i === beat ? 1 : 0.45, x: 0 }}
                    transition={spring.snappy}
                    className="flex items-center gap-2 font-mono text-[11.5px]"
                  >
                    <span
                      className={cn(
                        "size-1.5 shrink-0 rounded-full",
                        i === beat ? "bg-ember" : "bg-moss",
                      )}
                    />
                    {b}
                    {i === beat && !done && <span className="tif-blink">…</span>}
                  </motion.p>
                ))}
                {done && (
                  <motion.p
                    initial={{ opacity: 0, y: 6 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={spring.bouncy}
                    className="flex items-center gap-2 pt-1 font-mono text-[11.5px] font-semibold text-moss"
                  >
                    <span className="size-1.5 shrink-0 rounded-full bg-moss" />
                    Email verified
                  </motion.p>
                )}
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        <p className="mt-4 text-center text-[12.5px] text-ink-faint">
          Didn&apos;t get it?{" "}
          <button
            type="button"
            onClick={() =>
              toast({
                title: "Code resent",
                body: "We have re-not-sent it. Check your inbox with the same energy as before.",
                emoji: "📭",
              })
            }
            className="cursor-pointer font-medium text-ember underline-offset-2 hover:underline"
          >
            Resend
          </button>
        </p>
      </div>
    </StepShell>
  );
}
