"use client";

import { useEffect, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Field } from "@/components/ui/Field";
import { Button, Spinner } from "@/components/ui/Button";
import { StepShell } from "./StepShell";
import { judgeAge, judgeEmail, judgeName, judgePassword, emailAside } from "@/lib/rejections";
import { useSound } from "@/components/providers/SoundProvider";
import { useAchievements } from "@/components/providers/AchievementProvider";
import { spring } from "@/lib/motion";
import { cn } from "@/lib/cn";

const TONE_BAR: Record<string, string> = {
  faint: "bg-line-strong",
  ember: "bg-ember",
  warn: "bg-warn",
  moss: "bg-moss",
  smoke: "bg-smoke",
};

const TONE_TEXT: Record<string, string> = {
  faint: "text-ink-faint",
  ember: "text-ember",
  warn: "text-warn",
  moss: "text-moss",
  smoke: "text-smoke",
};

export interface AccountData {
  name: string;
  age: string;
  email: string;
  password: string;
}

export function StepAccount({
  value,
  onChange,
  onNext,
}: {
  value: AccountData;
  onChange: (v: AccountData) => void;
  onNext: () => void;
}) {
  const [nameChecking, setNameChecking] = useState(false);
  const [nameVerdict, setNameVerdict] = useState<string | null>(null);
  const [ageVerdict, setAgeVerdict] = useState<string | null>(null);
  const [emailNote, setEmailNote] = useState<string | null>(null);
  const [aside, setAside] = useState<string | null>(null);
  const { play } = useSound();
  const { unlock } = useAchievements();
  const rejectedNames = useRef(new Set<string>());

  const set = (patch: Partial<AccountData>) => onChange({ ...value, ...patch });

  /* Name: a short fake "checking availability" delay before the rejection.
     The delay is the joke — instant rejection reads as client-side validation,
     but a spinner implies a server that went and looked. */
  useEffect(() => {
    const name = value.name.trim();
    if (!name) {
      setNameVerdict(null);
      setNameChecking(false);
      return;
    }

    setNameChecking(true);
    setNameVerdict(null);

    const t = setTimeout(() => {
      setNameChecking(false);
      const v = judgeName(name);
      setNameVerdict(v?.message ?? null);
      if (v) {
        play("error");
        // Ten distinct names refused in one sitting earns something. It is the
        // only reward for persistence in the entire flow.
        rejectedNames.current.add(name.toLowerCase());
        if (rejectedNames.current.size >= 10) unlock("rejected-many");
      }
    }, 620);

    return () => clearTimeout(t);
  }, [value.name, play, unlock]);

  useEffect(() => {
    const t = setTimeout(() => setAgeVerdict(judgeAge(value.age)?.message ?? null), 380);
    return () => clearTimeout(t);
  }, [value.age]);

  /* Email is accepted immediately, then reconsidered out loud two seconds later. */
  const asideTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  useEffect(() => {
    const email = value.email.trim();
    setAside(null);
    if (asideTimer.current) clearTimeout(asideTimer.current);

    const v = judgeEmail(email);
    setEmailNote(v?.message ?? null);

    if (v?.tone === "ok") {
      asideTimer.current = setTimeout(() => setAside(emailAside(email)), 2100);
    }
    return () => {
      if (asideTimer.current) clearTimeout(asideTimer.current);
    };
  }, [value.email]);

  const pw = judgePassword(value.password);

  // Every field is "invalid" forever, so the gate is just: did you fill it in?
  const canContinue =
    value.name.trim().length > 0 &&
    value.age.trim().length > 0 &&
    value.email.includes("@") &&
    value.password.length > 0;

  return (
    <StepShell
      eyebrow="Create account"
      title="Let's get you set up."
      subtitle="This takes about two minutes. Roughly none of it is stored."
      footer={
        <div className="flex items-center justify-between gap-4">
          <p className="text-[12px] text-ink-faint">
            All fields are required. All fields are also wrong.
          </p>
          <Button
            size="lg"
            disabled={!canContinue}
            onClick={onNext}
            aria-label="Continue to verification"
          >
            Continue
          </Button>
        </div>
      }
    >
      <form
        className="space-y-5"
        onSubmit={(e) => {
          e.preventDefault();
          if (canContinue) onNext();
        }}
      >
        <Field
          label="Full name"
          placeholder="Ada Lovelace"
          autoComplete="off"
          value={value.name}
          onChange={(e) => set({ name: e.target.value })}
          tone={nameChecking ? "checking" : nameVerdict ? "error" : "idle"}
          message={nameChecking ? "Checking availability…" : nameVerdict}
          trailing={
            nameChecking ? (
              <Spinner className="size-3.5 text-ink-faint" />
            ) : nameVerdict ? (
              <motion.span
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={spring.bouncy}
                className="text-[13px] text-ember"
                aria-hidden
              >
                ✕
              </motion.span>
            ) : null
          }
        />

        <Field
          label="Age"
          hint="for demographic purposes we will not explain"
          placeholder="29"
          inputMode="numeric"
          autoComplete="off"
          value={value.age}
          onChange={(e) => set({ age: e.target.value.replace(/[^\d]/g, "").slice(0, 3) })}
          tone={ageVerdict ? "error" : "idle"}
          message={ageVerdict}
        />

        <div>
          <Field
            label="Work email"
            type="email"
            placeholder="you@company.com"
            autoComplete="email"
            value={value.email}
            onChange={(e) => set({ email: e.target.value })}
            tone={
              emailNote === "Looks fine." ? "ok" : value.email.trim() ? "warn" : "idle"
            }
            message={emailNote}
          />
          <AnimatePresence>
            {aside && (
              <motion.p
                initial={{ opacity: 0, y: -6, height: 0 }}
                animate={{ opacity: 1, y: 0, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
                transition={spring.gentle}
                className="overflow-hidden pt-1.5 text-[12.5px] leading-snug text-ink-soft"
              >
                {aside}
              </motion.p>
            )}
          </AnimatePresence>
        </div>

        <div>
          <Field
            label="Password"
            type="password"
            placeholder="••••••••"
            autoComplete="new-password"
            value={value.password}
            onChange={(e) => set({ password: e.target.value })}
          />

          <div className="mt-2.5">
            <div className="flex h-1.5 gap-1">
              {[0, 1, 2, 3].map((i) => (
                <div key={i} className="flex-1 overflow-hidden rounded-full bg-surface-3">
                  <motion.div
                    initial={false}
                    animate={{ scaleX: pw.score * 4 > i ? 1 : 0 }}
                    transition={spring.snappy}
                    className={cn("h-full origin-left rounded-full", TONE_BAR[pw.tone])}
                  />
                </div>
              ))}
            </div>
            <div className="mt-2 flex flex-wrap items-baseline justify-between gap-x-3 gap-y-1">
              <AnimatePresence mode="wait">
                <motion.span
                  key={pw.label}
                  initial={{ opacity: 0, y: 4 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -4 }}
                  transition={{ duration: 0.18 }}
                  className={cn("text-[12.5px] font-semibold", TONE_TEXT[pw.tone])}
                >
                  {pw.label}
                </motion.span>
              </AnimatePresence>
              <AnimatePresence mode="wait">
                <motion.span
                  key={pw.note}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.18 }}
                  className="text-[12px] text-ink-soft"
                >
                  {pw.note}
                </motion.span>
              </AnimatePresence>
            </div>
          </div>
        </div>

        <button type="submit" className="sr-only" tabIndex={-1} aria-hidden>
          Continue
        </button>
      </form>
    </StepShell>
  );
}
