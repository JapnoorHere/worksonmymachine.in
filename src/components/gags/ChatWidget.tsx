"use client";

import { useEffect, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { KEVIN_OPENERS, KEVIN_STATUSES } from "@/lib/content";
import { useAchievements } from "@/components/providers/AchievementProvider";
import { useSound } from "@/components/providers/SoundProvider";
import { deal } from "@/lib/bag";
import { spring } from "@/lib/motion";
import { cn } from "@/lib/cn";

interface Msg {
  from: "kevin" | "you";
  text: string;
}

/**
 * Kevin.
 *
 * Kevin sends exactly one message — the opener — and then types forever. The
 * status line underneath is the actual gag, and it's paced slowly (5–9s a
 * beat) because the humor is in the duration, not the wording. Speed it up and
 * it reads as a gimmick; leave it slow and people genuinely start waiting for
 * an answer that is never coming.
 */
export function ChatWidget() {
  const [open, setOpen] = useState(false);
  const [msgs, setMsgs] = useState<Msg[]>([]);
  const [statusIdx, setStatusIdx] = useState(0);
  const [draft, setDraft] = useState("");
  const [badgeHidden, setBadgeHidden] = useState(true);
  const { unlock } = useAchievements();
  const { play } = useSound();
  const scrollRef = useRef<HTMLDivElement>(null);

  // The unread badge shows up unprompted a few seconds in. Nobody messaged you.
  useEffect(() => {
    const t = setTimeout(() => setBadgeHidden(false), 9000);
    return () => clearTimeout(t);
  }, []);

  useEffect(() => {
    if (!open) return;
    if (msgs.length === 0) {
      const opener = deal("kevin-openers", KEVIN_OPENERS);
      const t = setTimeout(() => {
        setMsgs([{ from: "kevin", text: opener }]);
        play("pop");
      }, 1400);
      return () => clearTimeout(t);
    }
  }, [open, msgs.length, play]);

  /* The status ticker. Runs only while the panel is open.
     KEVIN_STATUSES is walked in order rather than shuffled — it's a narrative,
     not a pool. "Kevin deleted what he wrote" only lands after "Kevin is
     typing", and "Kevin's colleague has also started typing" needs the
     colleague to have been introduced. This is the one sequence on the site
     where repetition is the joke, so the deck stays stacked. */
  useEffect(() => {
    if (!open) return;
    const id = setInterval(
      () => {
        setStatusIdx((i) => {
          const next = i + 1;
          if (next === 10) unlock("kevin-patience");
          return next;
        });
      },
      5000 + Math.random() * 4000,
    );
    return () => clearInterval(id);
  }, [open, unlock]);

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: 99999, behavior: "smooth" });
  }, [msgs]);

  const send = (e: React.FormEvent) => {
    e.preventDefault();
    const text = draft.trim();
    if (!text) return;
    setMsgs((m) => [...m, { from: "you", text }]);
    setDraft("");
    play("click");
  };

  const status = KEVIN_STATUSES[statusIdx % KEVIN_STATUSES.length];

  return (
    <>
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.94 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.94 }}
            transition={spring.gentle}
            style={{ transformOrigin: "bottom right" }}
            className="fixed inset-x-3 bottom-[74px] z-[95] flex max-h-[min(72vh,540px)] flex-col overflow-hidden rounded-[16px] border border-line bg-surface shadow-float sm:inset-x-auto sm:right-5 sm:bottom-[84px] sm:w-[356px]"
          >
            <div className="flex items-center gap-3 border-b border-line bg-surface-2 px-4 py-3">
              <div className="relative">
                <span className="grid size-9 place-items-center rounded-full bg-smoke-wash font-display text-[15px] font-bold text-smoke">
                  K
                </span>
                <span className="absolute -right-0.5 -bottom-0.5 size-2.5 rounded-full border-2 border-surface-2 bg-moss" />
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-[13.5px] font-semibold">Kevin</p>
                <p className="text-[11.5px] text-ink-faint">Customer Success · replies instantly</p>
              </div>
              <button
                onClick={() => setOpen(false)}
                aria-label="Close chat"
                className="-m-1 rounded-md p-1 text-ink-faint hover:text-ink"
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

            <div ref={scrollRef} className="flex-1 space-y-2.5 overflow-y-auto px-4 py-4">
              <p className="text-center font-mono text-[10px] tracking-wider text-ink-faint uppercase">
                Conversation started
              </p>
              {msgs.length === 0 && (
                <div className="flex gap-1.5 pt-2">
                  {[0, 1, 2].map((i) => (
                    <motion.span
                      key={i}
                      className="size-1.5 rounded-full bg-ink-faint"
                      animate={{ y: [0, -4, 0] }}
                      transition={{ duration: 0.9, repeat: Infinity, delay: i * 0.14 }}
                    />
                  ))}
                </div>
              )}
              <AnimatePresence initial={false}>
                {msgs.map((m, i) => (
                  <motion.div
                    key={i}
                    initial={{ opacity: 0, y: 8, scale: 0.96 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    transition={spring.snappy}
                    className={cn("flex", m.from === "you" ? "justify-end" : "justify-start")}
                  >
                    <p
                      className={cn(
                        "max-w-[82%] rounded-2xl px-3.5 py-2 text-[13px] leading-relaxed",
                        m.from === "you"
                          ? "rounded-br-sm bg-ember text-ember-ink"
                          : "rounded-bl-sm bg-surface-2 text-ink",
                      )}
                    >
                      {m.text}
                    </p>
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>

            <div className="border-t border-line px-4 py-2">
              <AnimatePresence mode="wait">
                <motion.p
                  key={status + statusIdx}
                  initial={{ opacity: 0, y: 4 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -4 }}
                  transition={{ duration: 0.25 }}
                  className="flex items-center gap-1.5 text-[11.5px] text-ink-faint"
                  aria-live="polite"
                >
                  {status}
                  <span className="tif-blink">…</span>
                </motion.p>
              </AnimatePresence>
            </div>

            <form onSubmit={send} className="flex items-center gap-2 border-t border-line p-2.5">
              <input
                value={draft}
                onChange={(e) => setDraft(e.target.value)}
                placeholder="Kevin will get to this"
                aria-label="Message Kevin"
                className="h-9 min-w-0 flex-1 rounded-lg bg-surface-2 px-3 text-[13px] outline-none placeholder:text-ink-faint"
              />
              <button
                type="submit"
                aria-label="Send message"
                className="grid size-9 shrink-0 cursor-pointer place-items-center rounded-lg bg-ember text-ember-ink transition-transform active:scale-90"
              >
                <svg viewBox="0 0 20 20" className="size-4" aria-hidden>
                  <path d="M3 10l14-6-6 14-2-6-6-2Z" fill="currentColor" />
                </svg>
              </button>
            </form>
          </motion.div>
        )}
      </AnimatePresence>

      <motion.button
        type="button"
        onClick={() => {
          setOpen((v) => !v);
          setBadgeHidden(true);
          play(open ? "click" : "whoosh");
        }}
        aria-expanded={open}
        aria-label={open ? "Close support chat" : "Open support chat"}
        whileHover={{ scale: 1.06, y: -2 }}
        whileTap={{ scale: 0.92 }}
        transition={spring.bouncy}
        className="fixed right-3 bottom-3 z-[96] grid size-[52px] cursor-pointer place-items-center rounded-full border border-line bg-surface text-ink shadow-float sm:right-5 sm:bottom-5"
      >
        <AnimatePresence mode="wait" initial={false}>
          <motion.span
            key={open ? "close" : "chat"}
            initial={{ rotate: -90, opacity: 0, scale: 0.5 }}
            animate={{ rotate: 0, opacity: 1, scale: 1 }}
            exit={{ rotate: 90, opacity: 0, scale: 0.5 }}
            transition={spring.snappy}
          >
            {open ? (
              <svg viewBox="0 0 20 20" className="size-[18px]" aria-hidden>
                <path
                  d="M4 4l12 12M16 4L4 16"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                />
              </svg>
            ) : (
              <svg viewBox="0 0 22 22" className="size-[20px]" aria-hidden>
                <path
                  d="M3 9.5C3 6 6.6 3.2 11 3.2S19 6 19 9.5 15.4 15.8 11 15.8c-.8 0-1.6-.1-2.3-.3L4.4 17l.9-3A6.9 6.9 0 0 1 3 9.5Z"
                  fill="currentColor"
                />
              </svg>
            )}
          </motion.span>
        </AnimatePresence>

        {!badgeHidden && !open && (
          <motion.span
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={spring.bouncy}
            className="absolute -top-0.5 -right-0.5 grid size-[19px] place-items-center rounded-full bg-ember text-[10px] font-bold text-ember-ink"
          >
            1
          </motion.span>
        )}
      </motion.button>
    </>
  );
}
