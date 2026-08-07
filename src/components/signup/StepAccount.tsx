"use client";

import { useEffect, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Field } from "@/components/ui/Field";
import { Button, Spinner } from "@/components/ui/Button";
import { StepShell } from "./StepShell";
import { judgeAge, judgeName, judgePassword, emailAside } from "@/lib/rejections";
import { useSound } from "@/components/providers/SoundProvider";
import { useAchievements } from "@/components/providers/AchievementProvider";
import { useToast } from "@/components/providers/ToastProvider";
import { TermsCheckbox } from "@/components/gags/TermsQuizModal";
import { CONTINUE_ANYWAY_LINES } from "@/lib/content";
import { deal } from "@/lib/bag";
import { spring } from "@/lib/motion";
import { cn } from "@/lib/cn";

/** Mirrors the server-side floor in `api/auth/signup`. */
const MIN_PASSWORD = 6;

type EmailStatus = "idle" | "checking" | "invalid" | "taken" | "available";

/**
 * A tiny dramatic soundboard for text fields: focusing plays a suspense chord,
 * each keystroke plays a toy typewriter peck, and Backspace plays a toilet
 * flush. All three are already gated by the mute toggle — SoundProvider only
 * plays anything once the user has turned sound on.
 */
function useDramaticField() {
  const { play } = useSound();
  return {
    onFocus: () => play("suspense"),
    onKeyDown: (e: React.KeyboardEvent<HTMLInputElement>) => {
      play(e.key === "Backspace" ? "flush" : "key");
    },
  };
}

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

export interface ServerError {
  field: "email" | "password" | "general";
  message: string;
}

export function StepAccount({
  value,
  onChange,
  onNext,
  serverError,
}: {
  value: AccountData;
  onChange: (v: AccountData) => void;
  onNext: () => void;
  serverError?: ServerError | null;
}) {
  const [nameChecking, setNameChecking] = useState(false);
  const [nameVerdict, setNameVerdict] = useState<string | null>(null);
  const [ageVerdict, setAgeVerdict] = useState<string | null>(null);
  const [emailStatus, setEmailStatus] = useState<EmailStatus>("idle");
  const [emailMessage, setEmailMessage] = useState<string | null>(null);
  const [aside, setAside] = useState<string | null>(null);
  const { play } = useSound();
  const { unlock } = useAchievements();
  const toast = useToast();
  const rejectedNames = useRef(new Set<string>());
  const dramatic = useDramaticField();
  const emailReqId = useRef(0);

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

  /* Email is the one field that's actually real: format-checked, then checked
     live against the account database, debounced so we're not hitting the API
     on every keystroke. Everything else on this step still lies to you; this
     one is the source of truth for the account we're about to create. The fun
     aside still arrives 2100ms after a *genuinely* accepted address, unchanged
     from before. */
  const asideTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  useEffect(() => {
    const email = value.email.trim();
    setAside(null);
    if (asideTimer.current) clearTimeout(asideTimer.current);

    if (!email) {
      setEmailStatus("idle");
      setEmailMessage(null);
      return;
    }

    setEmailStatus("checking");
    setEmailMessage(null);
    const myId = ++emailReqId.current;

    const t = setTimeout(async () => {
      try {
        const res = await fetch(`/api/auth/check-email?email=${encodeURIComponent(email)}`);
        const data = (await res.json()) as { valid: boolean; available: boolean; message?: string };
        if (emailReqId.current !== myId) return; // a newer keystroke superseded this request

        if (!data.valid) {
          setEmailStatus("invalid");
          setEmailMessage(data.message ?? "That doesn't look like a working address.");
        } else if (!data.available) {
          setEmailStatus("taken");
          setEmailMessage(data.message ?? "That email is already registered.");
        } else {
          setEmailStatus("available");
          setEmailMessage("Looks fine.");
          asideTimer.current = setTimeout(() => setAside(emailAside(email)), 2100);
        }
      } catch {
        if (emailReqId.current !== myId) return;
        setEmailStatus("invalid");
        setEmailMessage("Couldn't verify that right now. Try again in a moment.");
      }
    }, 450);

    return () => clearTimeout(t);
  }, [value.email]);

  const pw = judgePassword(value.password);
  const emailReady = emailStatus === "available";
  const passwordReady = value.password.length >= MIN_PASSWORD;

  // Name and age stay gated on non-emptiness only — they're permanently
  // "invalid" by design. Email and password now gate on something real,
  // since they back an actual account.
  const canContinue =
    value.name.trim().length > 0 && value.age.trim().length > 0 && emailReady && passwordReady;

  const handleContinue = () => {
    if (!canContinue) return;
    // Every field on this step just told you it failed. We're letting you
    // through anyway — that contradiction is the joke.
    toast({
      title: "Continuing",
      body: deal("continue-anyway", CONTINUE_ANYWAY_LINES),
      emoji: "➡️",
      duration: 4200,
    });
    onNext();
  };

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
            onClick={handleContinue}
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
          handleContinue();
        }}
      >
        <Field
          label="Full name"
          placeholder="Ada Lovelace"
          autoComplete="off"
          value={value.name}
          onChange={(e) => set({ name: e.target.value })}
          {...dramatic}
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
            hint="the one field we actually check"
            type="email"
            placeholder="you@company.com"
            autoComplete="email"
            value={value.email}
            onChange={(e) => set({ email: e.target.value })}
            {...dramatic}
            tone={
              serverError?.field === "email"
                ? "error"
                : emailStatus === "checking"
                  ? "checking"
                  : emailStatus === "available"
                    ? "ok"
                    : emailStatus === "invalid" || emailStatus === "taken"
                      ? "error"
                      : "idle"
            }
            message={
              serverError?.field === "email"
                ? serverError.message
                : emailStatus === "checking"
                  ? "Checking…"
                  : emailMessage
            }
            trailing={
              emailStatus === "checking" ? (
                <Spinner className="size-3.5 text-ink-faint" />
              ) : emailStatus === "available" ? (
                <motion.span
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={spring.bouncy}
                  className="text-[13px] text-moss"
                  aria-hidden
                >
                  ✓
                </motion.span>
              ) : emailStatus === "invalid" || emailStatus === "taken" ? (
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
            {...dramatic}
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

          <p
            className={cn(
              "mt-2 text-[11.5px]",
              serverError?.field === "password"
                ? "text-ember"
                : passwordReady
                  ? "text-ink-faint"
                  : "text-warn",
            )}
          >
            {serverError?.field === "password"
              ? serverError.message
              : passwordReady
                ? `${MIN_PASSWORD}+ characters — that part's real, even if the opinions above aren't.`
                : `Needs at least ${MIN_PASSWORD} characters to actually create the account.`}
          </p>

          <div className="mt-4">
            <TermsCheckbox />
          </div>
        </div>

        <button type="submit" className="sr-only" tabIndex={-1} aria-hidden>
          Continue
        </button>
      </form>
    </StepShell>
  );
}
