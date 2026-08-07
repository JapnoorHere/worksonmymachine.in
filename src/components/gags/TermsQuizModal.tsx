"use client";

import { useEffect, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { TOS_SECTIONS, TOS_QUIZ_QUESTIONS } from "@/lib/content";
import { deal } from "@/lib/bag";
import { useSound } from "@/components/providers/SoundProvider";
import { spring } from "@/lib/motion";
import { cn } from "@/lib/cn";

type Phase = "scroll" | "quiz" | "answered";

/**
 * The Terms & Conditions checkbox.
 *
 * Checking it opens the full document, which auto-scrolls at warp speed
 * (skipped entirely under reduced motion — Boring Mode still gets the quiz,
 * just without the scroll), then hands you a pop quiz about a clause you
 * couldn't have read. Every answer gets the same verdict. This never gates
 * signup — Continue only ever checks that fields are non-empty (see N6 in
 * PROJECT.md) — so the checkbox is a pure bit, not an obstacle.
 */
export function TermsCheckbox() {
  const [accepted, setAccepted] = useState(false);
  const [open, setOpen] = useState(false);
  const [phase, setPhase] = useState<Phase>("scroll");
  const [picked, setPicked] = useState<number | null>(null);
  const [question, setQuestion] = useState(() => TOS_QUIZ_QUESTIONS[0]);
  const scrollRef = useRef<HTMLDivElement>(null);
  const dialogRef = useRef<HTMLDivElement>(null);
  const { play } = useSound();

  const startRitual = () => {
    setQuestion(deal("tos-quiz", TOS_QUIZ_QUESTIONS));
    setPhase("scroll");
    setPicked(null);
    setOpen(true);
    play("whoosh");
  };

  const close = () => {
    setOpen(false);
    // Walking away mid-ritual doesn't count as agreeing to anything.
    if (phase !== "answered") setAccepted(false);
  };

  // Auto-scroll the document at warp speed once the modal opens.
  useEffect(() => {
    if (!open || phase !== "scroll") return;
    const el = scrollRef.current;
    if (!el) return;

    if (window.matchMedia?.("(prefers-reduced-motion: reduce)").matches) {
      setPhase("quiz");
      return;
    }

    let raf: number;
    const start = performance.now();
    const duration = 1700;
    const to = el.scrollHeight - el.clientHeight;

    const tick = (t: number) => {
      const p = Math.min(1, (t - start) / duration);
      el.scrollTop = to * p;
      if (p < 1) raf = requestAnimationFrame(tick);
      else setTimeout(() => setPhase((cur) => (cur === "scroll" ? "quiz" : cur)), 350);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [open, phase]);

  useEffect(() => {
    if (!open) return;
    dialogRef.current?.focus();
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") close();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open]);

  const answer = (i: number) => {
    setPicked(i);
    setPhase("answered");
    play("error");
    setTimeout(() => {
      setAccepted(true);
      setOpen(false);
    }, 1500);
  };

  return (
    <>
      <label className="flex items-start gap-2.5 text-[12.5px] leading-relaxed text-ink-soft">
        <input
          type="checkbox"
          checked={accepted}
          onChange={(e) => {
            if (e.target.checked) startRitual();
            else setAccepted(false);
          }}
          className="mt-0.5 size-4 shrink-0 accent-ember"
        />
        I agree to the Terms &amp; Conditions.
      </label>

      <AnimatePresence>
        {open && (
          <motion.div
            className="fixed inset-0 z-[110] flex items-center justify-center bg-ink/60 p-4"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={(e) => {
              if (e.target === e.currentTarget) close();
            }}
          >
            <motion.div
              ref={dialogRef}
              role="dialog"
              aria-modal="true"
              aria-label="Terms and Conditions"
              tabIndex={-1}
              initial={{ opacity: 0, y: 18, scale: 0.96 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 18, scale: 0.96 }}
              transition={spring.gentle}
              className="flex max-h-[80vh] w-full max-w-lg flex-col overflow-hidden rounded-[16px] border border-line bg-surface shadow-float outline-none"
            >
              <div className="flex items-center justify-between border-b border-line px-5 py-3.5">
                <p className="text-[14px] font-bold">Terms &amp; Conditions</p>
                <button
                  onClick={close}
                  aria-label="Close terms"
                  className="-m-1 cursor-pointer rounded-md p-1 text-ink-faint hover:text-ink"
                >
                  <svg width="14" height="14" viewBox="0 0 14 14" aria-hidden>
                    <path
                      d="M1 1l12 12M13 1L1 13"
                      stroke="currentColor"
                      strokeWidth="1.8"
                      strokeLinecap="round"
                    />
                  </svg>
                </button>
              </div>

              {phase === "scroll" && (
                <div ref={scrollRef} className="flex-1 overflow-y-auto px-5 py-4">
                  {TOS_SECTIONS.map((s) => (
                    <div key={s.n} className="mb-4">
                      <p className="font-mono text-[10.5px] tracking-wider text-ember uppercase">
                        Section {s.n}
                      </p>
                      <p className="mt-0.5 text-[13px] font-semibold">{s.heading}</p>
                      <p className="mt-1 text-[12.5px] leading-relaxed text-ink-soft">{s.body}</p>
                    </div>
                  ))}
                </div>
              )}

              {phase !== "scroll" && (
                <div className="flex-1 overflow-y-auto px-5 py-5">
                  <p className="font-mono text-[10.5px] tracking-[0.16em] text-ember uppercase">
                    Pop quiz
                  </p>
                  <p className="mt-2 text-[15px] leading-snug font-semibold">{question.q}</p>
                  <div className="mt-4 space-y-2">
                    {question.options.map((opt, i) => (
                      <button
                        key={opt}
                        type="button"
                        disabled={phase === "answered"}
                        onClick={() => answer(i)}
                        className={cn(
                          "w-full cursor-pointer rounded-lg border px-3.5 py-2.5 text-left text-[13px] transition-colors disabled:cursor-default",
                          phase === "answered" && picked === i
                            ? "border-ember bg-ember-wash"
                            : "border-line bg-surface hover:border-line-strong hover:bg-surface-2",
                        )}
                      >
                        {opt}
                      </button>
                    ))}
                  </div>
                  <AnimatePresence>
                    {phase === "answered" && (
                      <motion.p
                        initial={{ opacity: 0, y: 6 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={spring.snappy}
                        aria-live="polite"
                        className="mt-4 text-[13px] font-semibold text-ember"
                      >
                        Incorrect, but we&apos;ll accept it anyway.
                      </motion.p>
                    )}
                  </AnimatePresence>
                </div>
              )}

              <div className="flex items-center justify-between gap-3 border-t border-line px-5 py-3">
                <p className="font-mono text-[10px] text-ink-faint">
                  {phase === "scroll"
                    ? "reading at your own pace: disabled"
                    : "you may close this at any time"}
                </p>
                {phase === "scroll" && (
                  <button
                    type="button"
                    onClick={() => setPhase("quiz")}
                    className="cursor-pointer text-[12px] font-semibold text-ember hover:underline"
                  >
                    Skip to quiz
                  </button>
                )}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
