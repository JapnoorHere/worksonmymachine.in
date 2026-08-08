"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { AnimatePresence, motion } from "framer-motion";
import { Container, Card, Eyebrow, Badge } from "@/components/ui/Primitives";
import { Field } from "@/components/ui/Field";
import { PreviewSurface } from "./PreviewSurface";
import { PendingBoard } from "./PendingBoard";
import { DesperationSubmit } from "./DesperationSubmit";
import { KevinAside } from "@/components/gags/KevinAside";
import { Anxious } from "@/components/gags/AnxiousTooltip";
import {
  CONTENT_TYPES,
  TRIGGERS,
  TYPE_LABELS,
  TYPE_HINTS,
  TRIGGER_LABELS,
  type ContentType,
  type Trigger,
} from "@/lib/content";
import { LIMITS, sanitizeAuthor, sanitizeText } from "@/lib/sanitize";
import { useAuth } from "@/components/providers/AuthProvider";
import { useToast } from "@/components/providers/ToastProvider";
import { useAchievements } from "@/components/providers/AchievementProvider";
import { useSound } from "@/components/providers/SoundProvider";
import { riseIn, spring, stagger } from "@/lib/motion";
import { cn } from "@/lib/cn";

export function ContributeForm() {
  const [type, setType] = useState<ContentType>("error");
  const [trigger, setTrigger] = useState<Trigger>("random");
  const [text, setText] = useState("");
  const [author, setAuthor] = useState("");
  const [handleTouched, setHandleTouched] = useState(false);
  const [busy, setBusy] = useState(false);
  const [errors, setErrors] = useState<string[]>([]);
  const [sent, setSent] = useState(false);
  const [refreshKey, setRefreshKey] = useState(0);

  const toast = useToast();
  const { user, loading: authLoading } = useAuth();
  const { unlock } = useAchievements();
  const { play } = useSound();

  /* Logged in? Start from the account name instead of a blank box. The session
     resolves after mount, so this fills in when it lands — but only while the
     field is untouched, so it can never overwrite something being typed. The
     field stays fully editable: posting under another handle is still allowed,
     and the submission is linked to the account either way. */
  useEffect(() => {
    if (user && !handleTouched) setAuthor(sanitizeAuthor(user.name));
  }, [user, handleTouched]);

  /* The preview shows the *sanitized* value, not the raw input. If someone
     types markup they see it neutered immediately, which explains the rule
     better than any help text would. */
  const cleanText = useMemo(() => sanitizeText(text), [text]);
  const cleanAuthor = useMemo(() => sanitizeAuthor(author), [author]);
  const stripped = text.trim().length > 0 && cleanText.length < text.trim().length;

  const tooShort = cleanText.length > 0 && cleanText.length < LIMITS.text.min;
  const canSubmit = cleanText.length >= LIMITS.text.min && !busy;

  const submit = async () => {
    if (!canSubmit) return;
    setBusy(true);
    setErrors([]);

    try {
      const res = await fetch("/api/submissions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        /* Send a blank handle as blank, not as the sanitizer's "anonymous"
           fallback — the server can only tell "left it empty" from "typed
           anonymous" if we don't collapse the two here. */
        body: JSON.stringify({
          type,
          trigger,
          text: cleanText,
          author: author.trim() ? cleanAuthor : "",
        }),
      });
      const data = (await res.json()) as { ok: boolean; errors?: string[] };

      if (!res.ok || !data.ok) {
        setErrors(data.errors ?? ["Something went wrong. It's probably fine."]);
        play("error");
        return;
      }

      setSent(true);
      setText("");
      unlock("contributor");
      setRefreshKey((k) => k + 1);
      toast({
        title: "Submitted for review",
        body: "A human will read it. That human is not Kevin. Kevin is busy.",
        emoji: "📮",
        tone: "moss",
        duration: 6000,
      });
    } catch {
      setErrors(["Couldn't reach the server. Try again in a moment."]);
      play("error");
    } finally {
      setBusy(false);
    }
  };

  return (
    <Container className="py-10 sm:py-14">
      <div className="mb-10 max-w-2xl">
        <Eyebrow>Contribute</Eyebrow>
        <h1 className="mt-3 text-[clamp(2rem,5vw,3.2rem)]">Make this site worse.</h1>
        <p className="mt-4 text-[16px] leading-relaxed text-ink-soft">
          Write a line, see exactly where it would appear, send it in. No code, no
          GitHub account, no build step. A human reads every submission before it
          goes anywhere near the live site.
        </p>
        <p className="mt-3 text-[14px] leading-relaxed text-ink-faint">
          Want to build an actual feature instead?{" "}
          <a
            href="https://github.com/JapnoorHere/worksonmymachine.in"
            target="_blank"
            rel="noopener noreferrer"
            className="text-ember underline-offset-2 hover:underline"
          >
            Open a pull request
          </a>{" "}
          — that path is wide open too.
        </p>
      </div>

      <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_minmax(0,0.9fr)]">
        {/* ---- Form ---- */}
        <motion.div variants={stagger()} initial="hidden" animate="show" className="space-y-5">
          <motion.div variants={riseIn}>
            <Card className="p-5 sm:p-6">
              <h2 className="text-[15px] font-bold">1. What kind of joke is it?</h2>
              <div className="mt-4 grid grid-cols-2 gap-2 sm:grid-cols-3">
                {CONTENT_TYPES.map((t) => (
                  <button
                    key={t}
                    type="button"
                    onClick={() => {
                      setType(t);
                      play("tick");
                    }}
                    aria-pressed={type === t}
                    className={cn(
                      "cursor-pointer rounded-lg border px-3 py-2.5 text-left text-[12.5px] font-medium transition-colors",
                      type === t
                        ? "border-ember bg-ember-wash text-ink"
                        : "border-line bg-surface text-ink-soft hover:border-line-strong hover:bg-surface-2",
                    )}
                  >
                    {TYPE_LABELS[t]}
                  </button>
                ))}
              </div>
              <AnimatePresence mode="wait">
                <motion.p
                  key={type}
                  initial={{ opacity: 0, y: 4 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -4 }}
                  transition={{ duration: 0.18 }}
                  className="mt-3 rounded-lg bg-surface-2 px-3 py-2.5 text-[12.5px] leading-relaxed text-ink-soft"
                >
                  {TYPE_HINTS[type]}
                </motion.p>
              </AnimatePresence>
            </Card>
          </motion.div>

          <motion.div variants={riseIn}>
            <Card className="p-5 sm:p-6">
              <h2 className="text-[15px] font-bold">2. Write it.</h2>

              <div className="mt-4">
                <label htmlFor="joke-text" className="sr-only">
                  Your joke text
                </label>
                <Anxious className="block w-full">
                  <textarea
                    id="joke-text"
                    value={text}
                    onChange={(e) => setText(e.target.value.slice(0, LIMITS.text.max))}
                    rows={3}
                    placeholder="Deadpan. Confident. Never winks at the reader."
                    aria-describedby="joke-help"
                    className={cn(
                      "w-full resize-y rounded-[10px] border bg-surface p-3 text-[15px] leading-relaxed",
                      "outline-none transition-colors placeholder:text-ink-faint",
                      "focus:border-ember focus:shadow-[var(--tif-ring)]",
                      tooShort ? "border-ember" : "border-line-strong",
                    )}
                  />
                </Anxious>
                <div
                  id="joke-help"
                  className="mt-1.5 flex items-baseline justify-between gap-3 text-[11.5px]"
                >
                  <span className={cn(tooShort ? "text-ember" : "text-ink-faint")}>
                    {tooShort
                      ? `At least ${LIMITS.text.min} characters.`
                      : "Plain text only. Markup is stripped."}
                  </span>
                  <span
                    className={cn(
                      "font-mono tabular-nums",
                      text.length > LIMITS.text.max - 20 ? "text-warn" : "text-ink-faint",
                    )}
                  >
                    {text.length}/{LIMITS.text.max}
                  </span>
                </div>

                <AnimatePresence>
                  {stripped && (
                    <motion.p
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: "auto" }}
                      exit={{ opacity: 0, height: 0 }}
                      transition={spring.snappy}
                      className="overflow-hidden pt-2 text-[12px] leading-snug text-warn"
                    >
                      We removed some characters (angle brackets, control codes, or
                      invisible characters). The preview shows exactly what would be
                      stored.
                    </motion.p>
                  )}
                </AnimatePresence>
              </div>

              <div className="mt-5">
                <p className="mb-2 text-[13px] font-semibold">When should it appear?</p>
                <div className="flex flex-wrap gap-2">
                  {TRIGGERS.map((t) => (
                    <button
                      key={t}
                      type="button"
                      onClick={() => {
                        setTrigger(t);
                        play("tick");
                      }}
                      aria-pressed={trigger === t}
                      className={cn(
                        "cursor-pointer rounded-full border px-3.5 py-1.5 text-[12.5px] transition-colors",
                        trigger === t
                          ? "border-ember bg-ember-wash font-medium text-ink"
                          : "border-line bg-surface text-ink-soft hover:border-line-strong",
                      )}
                    >
                      {TRIGGER_LABELS[t]}
                    </button>
                  ))}
                </div>
              </div>
            </Card>
          </motion.div>

          <motion.div variants={riseIn}>
            <Card className="p-5 sm:p-6">
              <h2 className="text-[15px] font-bold">3. Take credit.</h2>
              <div className="mt-4">
                <Field
                  label="Your handle"
                  hint="optional · shown in the Hall of Cringe"
                  placeholder={user ? sanitizeAuthor(user.name) : "anonymous"}
                  value={author}
                  onChange={(e) => {
                    setHandleTouched(true);
                    setAuthor(e.target.value);
                  }}
                  message={
                    author.trim() && cleanAuthor !== author.trim().replace(/^@+/, "")
                      ? `Will be stored as @${cleanAuthor}`
                      : null
                  }
                  tone="warn"
                />

                {/* Who this actually gets attributed to. Logged-in submissions
                    carry the account id whatever handle is typed, so saying
                    "anonymous" here would be a lie — the handle only decides
                    the display name. */}
                {!authLoading && (
                  <p className="mt-2 text-[12px] leading-snug text-ink-faint">
                    {user ? (
                      <>
                        Posting as{" "}
                        <span className="font-mono text-ink-soft">
                          @{author.trim() ? cleanAuthor : sanitizeAuthor(user.name)}
                        </span>
                        , linked to your {user.email} account
                        {author.trim() ? "" : " (blank uses your account name)"}.
                      </>
                    ) : (
                      <>
                        Posting anonymously — nothing links this to an account.{" "}
                        <Link
                          href="/signup?mode=login"
                          className="text-ember underline-offset-2 hover:underline"
                        >
                          Log in
                        </Link>{" "}
                        first if you want the credit.
                      </>
                    )}
                  </p>
                )}
              </div>

              <AnimatePresence>
                {errors.length > 0 && (
                  <motion.ul
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: "auto" }}
                    exit={{ opacity: 0, height: 0 }}
                    className="mt-4 space-y-1 overflow-hidden rounded-lg bg-ember-wash p-3"
                  >
                    {errors.map((e) => (
                      <li key={e} className="text-[12.5px] text-ember">
                        {e}
                      </li>
                    ))}
                  </motion.ul>
                )}
              </AnimatePresence>

              <div className="mt-5">
                <DesperationSubmit onSubmit={submit} disabled={!canSubmit} loading={busy} />
                {sent && (
                  <motion.p
                    initial={{ opacity: 0, x: -8 }}
                    animate={{ opacity: 1, x: 0 }}
                    className="mt-2 text-[12.5px] text-moss"
                  >
                    Sent. Write another.
                  </motion.p>
                )}
              </div>
            </Card>
          </motion.div>
        </motion.div>

        {/* ---- Live preview ---- */}
        <div className="lg:sticky lg:top-24 lg:self-start">
          <div className="mb-3 flex items-center justify-between gap-3">
            <h2 className="text-[15px] font-bold">Live preview</h2>
            <Badge tone="moss">rendered, not executed</Badge>
          </div>

          <div className="tif-dotgrid rounded-[14px] border border-line bg-bg-tint p-5 sm:p-6">
            <AnimatePresence mode="wait">
              <PreviewSurface key={type} type={type} text={cleanText} author={cleanAuthor} />
            </AnimatePresence>
          </div>

          <p className="mt-3 text-[12px] leading-relaxed text-ink-faint">
            This is the actual component your line would live in. Your text only ever
            fills a slot in it — it is never run as code, and anything that looks like
            markup gets stripped before it&apos;s stored.
          </p>

          <div className="mt-6">
            <PendingBoard refreshKey={refreshKey} />
          </div>

          <KevinAside surface="contribute" align="center" className="mt-6" />

          <p className="mt-3 text-center text-[12.5px] text-ink-faint">
            Curious who&apos;s already in?{" "}
            <Link
              href="/hall-of-cringe"
              className="text-ember underline-offset-2 hover:underline"
            >
              Hall of Cringe →
            </Link>
          </p>
        </div>
      </div>
    </Container>
  );
}
