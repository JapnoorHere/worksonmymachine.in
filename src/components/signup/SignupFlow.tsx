"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { AnimatePresence, motion } from "framer-motion";
import { Container } from "@/components/ui/Primitives";
import { StepProgress, stepVariants, type StepMeta } from "./StepShell";
import { StepAccount, type AccountData, type ServerError } from "./StepAccount";
import { StepVerify } from "./StepVerify";
import { StepVibe } from "./StepVibe";
import { StepTrust } from "./StepTrust";
import { StepProcessing } from "./StepProcessing";
import { LoginPane } from "./LoginPane";
import { KevinAside } from "@/components/gags/KevinAside";
import { useToast } from "@/components/providers/ToastProvider";
import { useAchievements } from "@/components/providers/AchievementProvider";
import { writeLS } from "@/lib/storage";
import { spring } from "@/lib/motion";
import { cn } from "@/lib/cn";

type Mode = "signup" | "login";

/** The one segmented control shared by both halves of this page. */
function ModeToggle({ mode, onChange }: { mode: Mode; onChange: (m: Mode) => void }) {
  const OPTIONS: { id: Mode; label: string }[] = [
    { id: "signup", label: "Create account" },
    { id: "login", label: "Log in" },
  ];
  return (
    <div
      role="group"
      aria-label="Account mode"
      className="mb-6 inline-flex rounded-full border border-line bg-surface-2 p-[3px]"
    >
      {OPTIONS.map((opt) => {
        const active = mode === opt.id;
        return (
          <button
            key={opt.id}
            type="button"
            onClick={() => onChange(opt.id)}
            aria-pressed={active}
            className={cn(
              "relative cursor-pointer rounded-full px-4 py-1.5 text-[13px] font-semibold transition-colors",
              active ? "text-ink" : "text-ink-faint hover:text-ink-soft",
            )}
          >
            {active && (
              <motion.span
                layoutId="account-mode-pill"
                transition={spring.bouncy}
                className="absolute inset-0 -z-10 rounded-full border border-line bg-surface shadow-soft"
              />
            )}
            {opt.label}
          </button>
        );
      })}
    </div>
  );
}

/**
 * The onboarding set piece.
 *
 * The progress bar starts out claiming three steps. Finishing the third reveals
 * a fourth, which is the structural joke — the bar isn't wrong, it just wasn't
 * telling you everything. Processing sits outside the counted steps entirely so
 * the bar can hit a genuine 100% before the flow keeps going anyway.
 */

const BASE_STEPS: StepMeta[] = [
  { id: "account", label: "Your details" },
  { id: "verify", label: "Verify email" },
  { id: "vibe", label: "Personalize" },
];

const HIDDEN_STEP: StepMeta = { id: "trust", label: "One more thing" };

export function SignupFlow() {
  const router = useRouter();
  const toast = useToast();
  const { unlock } = useAchievements();

  // Defaults to signup on first render (matching the static-prerendered
  // markup) and flips to login post-mount if the URL asked for it — reading
  // the query param via useSearchParams() would force a Suspense boundary
  // onto an otherwise static page just for this one flag.
  const [mode, setMode] = useState<Mode>("signup");
  useEffect(() => {
    if (new URLSearchParams(window.location.search).get("mode") === "login") setMode("login");
  }, []);

  const [index, setIndex] = useState(0);
  const [dir, setDir] = useState(1);
  const [revealed, setRevealed] = useState(false);
  const [processing, setProcessing] = useState(false);

  const [account, setAccount] = useState<AccountData>({
    name: "",
    age: "",
    email: "",
    password: "",
  });
  const [vibes, setVibes] = useState<string[]>([]);
  const [trust, setTrust] = useState(50);
  const [serverError, setServerError] = useState<ServerError | null>(null);

  // Editing any field after a real signup failure clears the stale error —
  // it was about the *previous* attempt.
  const updateAccount = useCallback((v: AccountData) => {
    setServerError(null);
    setAccount(v);
  }, []);

  const steps = useMemo(
    () => (revealed ? [...BASE_STEPS, HIDDEN_STEP] : BASE_STEPS),
    [revealed],
  );

  const go = useCallback((next: number, direction: number) => {
    setDir(direction);
    setIndex(next);
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, []);

  const next = useCallback(() => {
    // Finishing the last visible step is where the extra one appears.
    if (index === BASE_STEPS.length - 1 && !revealed) {
      setRevealed(true);
      setTimeout(
        () =>
          toast({
            title: "Almost done",
            body: "One additional step has been added to your onboarding. It was always there. You just couldn't see it.",
            emoji: "🪜",
            tone: "ember",
            duration: 6000,
          }),
        700,
      );
      go(index + 1, 1);
      return;
    }

    if (index >= steps.length - 1) {
      setProcessing(true);
      return;
    }

    go(index + 1, 1);
  }, [index, revealed, steps.length, go, toast]);

  const back = useCallback(() => {
    if (index > 0) go(index - 1, -1);
    else router.push("/");
  }, [index, go, router]);

  const finish = useCallback(() => {
    // The dashboard reads this back to greet you by your (rejected) name.
    writeLS("profile", {
      name: account.name.trim() || "Valued User",
      email: account.email.trim(),
      age: account.age.trim(),
      vibes,
      trust,
      joinedAt: new Date().toISOString(),
    });
    unlock("signed-up");
    router.push("/dashboard");
  }, [account, vibes, trust, router, unlock]);

  // The realistic failure here is a duplicate-email race — the live check on
  // Step 1 already caught the common case. Never a dead end: back to Step 1,
  // with the real reason shown on the field that actually caused it.
  const handleSignupFail = useCallback(
    (err: ServerError) => {
      setProcessing(false);
      setServerError(err);
      toast({
        title: "That didn't take.",
        body: err.message,
        emoji: "⚠️",
        tone: "warn",
        duration: 6000,
      });
      go(0, -1);
    },
    [go, toast],
  );

  // Warn on refresh mid-flow, purely so the warning itself can be a bit.
  useEffect(() => {
    if (index === 0 || processing) return;
    const handler = (e: BeforeUnloadEvent) => {
      e.preventDefault();
      e.returnValue = "";
    };
    window.addEventListener("beforeunload", handler);
    return () => window.removeEventListener("beforeunload", handler);
  }, [index, processing]);

  if (processing) {
    return (
      <Container className="flex min-h-[calc(100vh-8rem)] items-center py-12">
        <div className="mx-auto w-full max-w-lg">
          <StepProcessing
            account={account}
            vibes={vibes}
            trust={trust}
            onDone={finish}
            onFail={handleSignupFail}
          />
        </div>
      </Container>
    );
  }

  const current = steps[index]?.id;

  if (mode === "login") {
    return (
      <Container className="py-10 sm:py-14">
        <div className="mx-auto w-full max-w-xl">
          <ModeToggle mode={mode} onChange={setMode} />
          <LoginPane />
          <KevinAside surface="signup" align="center" className="mt-4" />
        </div>
      </Container>
    );
  }

  return (
    <Container className="py-10 sm:py-14">
      <div className="mx-auto w-full max-w-xl">
        <ModeToggle mode={mode} onChange={setMode} />
        <StepProgress steps={steps} current={index} revealed={revealed} />

        <div className="relative">
          <AnimatePresence mode="wait" custom={dir} initial={false}>
            <motion.div
              key={current}
              custom={dir}
              variants={stepVariants}
              initial="enter"
              animate="center"
              exit="exit"
              transition={spring.gentle}
            >
              {current === "account" && (
                <StepAccount
                  value={account}
                  onChange={updateAccount}
                  onNext={next}
                  serverError={serverError}
                />
              )}
              {current === "verify" && (
                <StepVerify email={account.email} onNext={next} onBack={back} />
              )}
              {current === "vibe" && (
                <StepVibe selected={vibes} onChange={setVibes} onNext={next} onBack={back} />
              )}
              {current === "trust" && (
                <StepTrust value={trust} onChange={setTrust} onNext={next} onBack={back} />
              )}
            </motion.div>
          </AnimatePresence>
        </div>

        <p className="mt-6 text-center text-[12px] leading-relaxed text-ink-faint">
          By continuing you agree to terms that have not been written and a privacy
          policy that is, at time of publication, a single sentence.
        </p>

        <KevinAside surface="signup" align="center" className="mt-4" />
      </div>
    </Container>
  );
}
