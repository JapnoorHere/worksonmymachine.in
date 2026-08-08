"use client";

import { createContext, useCallback, useContext, useEffect, useRef, useState } from "react";
import { ACHIEVEMENTS } from "@/lib/content";
import { readLS, writeLS } from "@/lib/storage";
import { useToast } from "./ToastProvider";
import { useAuth } from "./AuthProvider";

interface AchCtx {
  unlocked: string[];
  unlock: (id: string) => void;
  has: (id: string) => boolean;
  reset: () => void;
}

const Ctx = createContext<AchCtx>({
  unlocked: [],
  unlock: () => {},
  has: () => false,
  reset: () => {},
});

export const useAchievements = () => useContext(Ctx);

/**
 * Unlocks live in `localStorage` for everyone, and additionally on the account
 * for anyone logged in — a browser store alone meant an account page reported
 * zero progress on a second device.
 *
 * The two stores are merged by **union**, never replace. A sync can only ever
 * add: progress made in two browsers at once survives both ways, and an
 * anonymous streak is absorbed the first time someone logs in. The local
 * `reset()` stays per-browser, which is the only way to lose anything.
 */
export function AchievementProvider({ children }: { children: React.ReactNode }) {
  const [unlocked, setUnlocked] = useState<string[]>([]);
  const [ready, setReady] = useState(false);
  const toast = useToast();
  const { user } = useAuth();

  // Read through a ref so `unlock` keeps a stable identity — plenty of callers
  // list it in an effect's dependencies.
  const userIdRef = useRef<string | null>(null);
  useEffect(() => {
    userIdRef.current = user?.id ?? null;
  }, [user]);

  useEffect(() => {
    setUnlocked(readLS<string[]>("achievements", []));
    setReady(true);
  }, []);

  /** Fire-and-forget: the server unions these in and the local set already has them. */
  const push = useCallback((ids: string[]) => {
    void fetch("/api/auth/achievements", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ids }),
    }).catch(() => {
      /* Offline or logged out mid-flight. localStorage still has it. */
    });
  }, []);

  // Merge with the account once per session, then adopt the union locally and
  // hand the server anything it was missing.
  const syncedFor = useRef<string | null>(null);
  useEffect(() => {
    if (!ready || !user || syncedFor.current === user.id) return;
    syncedFor.current = user.id;

    const merged = [...new Set([...user.achievements, ...unlocked])];
    setUnlocked(merged);
    writeLS("achievements", merged);
    if (merged.length > user.achievements.length) push(merged);
  }, [ready, user, unlocked, push]);

  const unlock = useCallback(
    (id: string) => {
      if (!ready) return;
      setUnlocked((prev) => {
        if (prev.includes(id)) return prev;
        const def = ACHIEVEMENTS.find((a) => a.id === id);
        if (!def) return prev;
        const next = [...prev, id];
        writeLS("achievements", next);
        if (userIdRef.current) push(next);
        // Deferred so the toast doesn't fire during the caller's render pass.
        queueMicrotask(() =>
          toast({
            title: def.name,
            body: def.desc,
            emoji: def.emoji,
            tone: "achievement",
            duration: 6000,
          }),
        );
        return next;
      });
    },
    [ready, toast, push],
  );

  /** Local only, on purpose — clearing a browser shouldn't wipe the account. */
  const reset = useCallback(() => {
    setUnlocked([]);
    writeLS("achievements", []);
  }, []);

  return (
    <Ctx.Provider
      value={{ unlocked, unlock, has: (id) => unlocked.includes(id), reset }}
    >
      {children}
    </Ctx.Provider>
  );
}
