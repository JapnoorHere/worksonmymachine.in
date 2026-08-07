"use client";

import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { SUPPORT_PING_LINES, SUPPORT_PING_REPLY } from "@/lib/content";
import { deal } from "@/lib/bag";
import { readLS, writeLS } from "@/lib/storage";
import { useSound } from "@/components/providers/SoundProvider";
import { spring } from "@/lib/motion";

/**
 * An unprompted "need help?" nudge — distinct from Kevin.
 *
 * Kevin is the real (fake) support agent living in the chat widget at the
 * bottom-right; this is the marketing-chat-bait pattern sites use to bait a
 * reply before you've asked anything. It shows up once, ever, ten seconds in,
 * on the landing page only, in the top-right so it never collides with the
 * chat launcher, the toast stack, or the cookie banner's corner. Typing back
 * gets exactly one reply, because it was never listening.
 */
export function FakeSupportPing() {
  const [visible, setVisible] = useState(false);
  const [replied, setReplied] = useState(false);
  const [draft, setDraft] = useState("");
  const [line] = useState(() => deal("support-ping", SUPPORT_PING_LINES));
  const { play } = useSound();

  useEffect(() => {
    if (readLS<boolean>("supportPingSeen", false)) return;
    const t = setTimeout(() => {
      writeLS("supportPingSeen", true);
      setVisible(true);
      play("pop");
    }, 10000);
    return () => clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const send = (e: React.FormEvent) => {
    e.preventDefault();
    if (!draft.trim()) return;
    setReplied(true);
    setDraft("");
    play("click");
  };

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          role="status"
          aria-live="polite"
          initial={{ opacity: 0, y: -16, scale: 0.96 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: -16, scale: 0.96 }}
          transition={spring.gentle}
          className="fixed top-[76px] right-3 z-[85] w-[280px] rounded-[14px] border border-line bg-surface p-4 shadow-float sm:right-5"
        >
          <div className="flex items-start justify-between gap-2">
            <p className="font-mono text-[10px] tracking-[0.16em] text-ink-faint uppercase">
              Support
            </p>
            <button
              type="button"
              onClick={() => setVisible(false)}
              aria-label="Dismiss"
              className="-m-1 cursor-pointer rounded-md p-1 text-ink-faint hover:text-ink"
            >
              <svg width="12" height="12" viewBox="0 0 14 14" aria-hidden>
                <path
                  d="M1 1l12 12M13 1L1 13"
                  stroke="currentColor"
                  strokeWidth="1.8"
                  strokeLinecap="round"
                />
              </svg>
            </button>
          </div>

          <p className="mt-1.5 text-[13px] leading-relaxed">{replied ? SUPPORT_PING_REPLY : line}</p>

          {!replied && (
            <form onSubmit={send} className="mt-3 flex items-center gap-1.5">
              <label htmlFor="support-ping-reply" className="sr-only">
                Reply
              </label>
              <input
                id="support-ping-reply"
                value={draft}
                onChange={(e) => setDraft(e.target.value)}
                placeholder="Type something…"
                className="h-8 min-w-0 flex-1 rounded-lg bg-surface-2 px-2.5 text-[12.5px] outline-none placeholder:text-ink-faint"
              />
              <button
                type="submit"
                aria-label="Send"
                className="grid size-8 shrink-0 cursor-pointer place-items-center rounded-lg bg-ember text-ember-ink transition-transform active:scale-90"
              >
                <svg viewBox="0 0 20 20" className="size-3.5" aria-hidden>
                  <path d="M3 10l14-6-6 14-2-6-6-2Z" fill="currentColor" />
                </svg>
              </button>
            </form>
          )}
        </motion.div>
      )}
    </AnimatePresence>
  );
}
