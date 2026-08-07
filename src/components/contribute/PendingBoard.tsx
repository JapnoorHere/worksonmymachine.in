"use client";

import { useCallback, useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Card } from "@/components/ui/Primitives";
import { TYPE_LABELS, type ContentType } from "@/lib/content";
import { readLS, writeLS } from "@/lib/storage";
import { useSound } from "@/components/providers/SoundProvider";
import { useAchievements } from "@/components/providers/AchievementProvider";
import { spring } from "@/lib/motion";
import { cn } from "@/lib/cn";

interface Pending {
  id: string;
  type: ContentType;
  text: string;
  author: string;
  votes: number;
  createdAt: string;
}

/**
 * Public upvoting on the pending queue.
 *
 * Votes only reorder what a human reviews first — they never approve anything.
 * That's why one vote per browser (localStorage) is enough policing: the worst
 * outcome from cheating is that a reviewer reads your joke sooner and still
 * says no.
 */
export function PendingBoard({ refreshKey }: { refreshKey: number }) {
  const [items, setItems] = useState<Pending[]>([]);
  const [voted, setVoted] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const { play } = useSound();
  const { unlock } = useAchievements();

  useEffect(() => {
    setVoted(readLS<string[]>("voted", []));
  }, []);

  const load = useCallback(async () => {
    try {
      const res = await fetch("/api/submissions");
      const data = (await res.json()) as { submissions?: Pending[] };
      setItems(data.submissions ?? []);
    } catch {
      setItems([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void load();
  }, [load, refreshKey]);

  const vote = async (id: string) => {
    if (voted.includes(id)) return;

    // Optimistic — a vote is low stakes and the latency would kill the feel.
    setItems((prev) =>
      [...prev.map((i) => (i.id === id ? { ...i, votes: i.votes + 1 } : i))].sort(
        (a, b) => b.votes - a.votes,
      ),
    );
    const next = [...voted, id];
    setVoted(next);
    writeLS("voted", next);
    play("pop");
    unlock("voter");

    try {
      await fetch("/api/submissions/vote", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id }),
      });
    } catch {
      /* The optimistic count stands. It's a joke queue. */
    }
  };

  if (loading) {
    return (
      <Card className="p-5">
        <div className="tif-shimmer h-4 w-40 rounded" />
        <div className="tif-shimmer mt-3 h-12 rounded-lg" />
        <div className="tif-shimmer mt-2 h-12 rounded-lg" />
      </Card>
    );
  }

  return (
    <Card className="p-5">
      <div className="flex items-baseline justify-between gap-3">
        <h3 className="text-[14px] font-bold">In review</h3>
        <span className="font-mono text-[10.5px] text-ink-faint">
          {items.length} waiting
        </span>
      </div>

      {items.length === 0 ? (
        <p className="mt-3 text-[13px] leading-relaxed text-ink-soft">
          Nothing pending. Either everyone is polite or you&apos;re the first. Both are
          fixable.
        </p>
      ) : (
        <ul className="mt-3 space-y-2">
          <AnimatePresence initial={false}>
            {items.slice(0, 6).map((item) => {
              const has = voted.includes(item.id);
              return (
                <motion.li
                  key={item.id}
                  layout
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  transition={spring.snappy}
                  className="flex items-start gap-3 rounded-lg border border-line bg-surface-2 p-3"
                >
                  <button
                    type="button"
                    onClick={() => vote(item.id)}
                    disabled={has}
                    aria-label={has ? "Already upvoted" : `Upvote: ${item.text}`}
                    className={cn(
                      "flex w-9 shrink-0 flex-col items-center gap-0.5 rounded-md py-1 transition-colors",
                      has
                        ? "cursor-default bg-ember-wash text-ember"
                        : "cursor-pointer text-ink-faint hover:bg-surface-3 hover:text-ink",
                    )}
                  >
                    <svg viewBox="0 0 14 14" className="size-3" aria-hidden>
                      <path
                        d="M7 2.5l5 6H2l5-6Z"
                        fill="currentColor"
                      />
                    </svg>
                    <span className="font-mono text-[11px] tabular-nums">{item.votes}</span>
                  </button>

                  <div className="min-w-0 flex-1">
                    <p className="text-[12.5px] leading-snug text-ink">{item.text}</p>
                    <p className="mt-1 font-mono text-[10.5px] text-ink-faint">
                      {TYPE_LABELS[item.type] ?? item.type} · @{item.author}
                    </p>
                  </div>
                </motion.li>
              );
            })}
          </AnimatePresence>
        </ul>
      )}

      <p className="mt-3 border-t border-line pt-3 font-mono text-[10px] text-ink-faint">
        votes only change review order · a human still decides
      </p>
    </Card>
  );
}
