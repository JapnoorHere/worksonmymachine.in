"use client";

import { motion } from "framer-motion";
import { Button } from "@/components/ui/Button";
import { StepShell } from "./StepShell";
import { VIBES } from "@/lib/content";
import { useSound } from "@/components/providers/SoundProvider";
import { spring, riseIn, stagger } from "@/lib/motion";
import { cn } from "@/lib/cn";

export function StepVibe({
  selected,
  onChange,
  onNext,
  onBack,
}: {
  selected: string[];
  onChange: (v: string[]) => void;
  onNext: () => void;
  onBack: () => void;
}) {
  const { play } = useSound();

  const toggle = (label: string) => {
    play(selected.includes(label) ? "tick" : "pop");
    onChange(
      selected.includes(label) ? selected.filter((v) => v !== label) : [...selected, label],
    );
  };

  return (
    <StepShell
      eyebrow="Personalize"
      title="What's your vibe?"
      subtitle="Select all that apply. We use this to tailor your experience, which is identical for everyone."
      footer={
        <div className="flex items-center justify-between gap-4">
          <Button variant="ghost" onClick={onBack}>
            Back
          </Button>
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={onNext}
              className="cursor-pointer text-[12.5px] text-ink-faint underline-offset-2 hover:text-ink-soft hover:underline"
            >
              Skip
            </button>
            <Button size="lg" onClick={onNext}>
              Continue
            </Button>
          </div>
        </div>
      }
    >
      <motion.div
        variants={stagger(0.02, 0.035)}
        initial="hidden"
        animate="show"
        className="grid grid-cols-1 gap-2.5 sm:grid-cols-2 lg:grid-cols-3"
      >
        {VIBES.map((v) => {
          const active = selected.includes(v.label);
          return (
            <motion.button
              key={v.label}
              variants={riseIn}
              type="button"
              onClick={() => toggle(v.label)}
              aria-pressed={active}
              whileHover={{ y: -2 }}
              whileTap={{ scale: 0.97 }}
              transition={spring.snappy}
              className={cn(
                "flex cursor-pointer items-center gap-3 rounded-xl border p-3.5 text-left transition-colors",
                active
                  ? "border-ember bg-ember-wash"
                  : "border-line bg-surface hover:border-line-strong hover:bg-surface-2",
              )}
            >
              <motion.span
                animate={active ? { scale: [1, 1.35, 1], rotate: [0, -12, 0] } : { scale: 1 }}
                transition={spring.bouncy}
                className="text-[21px] leading-none"
                aria-hidden
              >
                {v.emoji}
              </motion.span>
              <span
                className={cn(
                  "flex-1 text-[13.5px] leading-snug font-medium",
                  active ? "text-ink" : "text-ink-soft",
                )}
              >
                {v.label}
              </span>
              <span
                className={cn(
                  "grid size-4.5 shrink-0 place-items-center rounded-md border transition-colors",
                  active ? "border-ember bg-ember" : "border-line-strong",
                )}
                aria-hidden
              >
                {active && (
                  <motion.svg
                    viewBox="0 0 12 12"
                    className="size-2.5 text-ember-ink"
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={spring.bouncy}
                  >
                    <path
                      d="M2 6.2l2.6 2.6L10 3.4"
                      stroke="currentColor"
                      strokeWidth="2"
                      fill="none"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </motion.svg>
                )}
              </span>
            </motion.button>
          );
        })}
      </motion.div>

      <p className="mt-5 text-center font-mono text-[11px] text-ink-faint">
        {selected.length === 0
          ? "nothing selected · a vibe in itself"
          : selected.length >= 6
            ? `${selected.length} selected · that's a lot of vibe for one person`
            : `${selected.length} selected`}
      </p>
    </StepShell>
  );
}
