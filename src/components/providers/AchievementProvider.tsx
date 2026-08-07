"use client";

import { createContext, useCallback, useContext, useEffect, useState } from "react";
import { ACHIEVEMENTS } from "@/lib/content";
import { readLS, writeLS } from "@/lib/storage";
import { useToast } from "./ToastProvider";

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

export function AchievementProvider({ children }: { children: React.ReactNode }) {
  const [unlocked, setUnlocked] = useState<string[]>([]);
  const [ready, setReady] = useState(false);
  const toast = useToast();

  useEffect(() => {
    setUnlocked(readLS<string[]>("achievements", []));
    setReady(true);
  }, []);

  const unlock = useCallback(
    (id: string) => {
      if (!ready) return;
      setUnlocked((prev) => {
        if (prev.includes(id)) return prev;
        const def = ACHIEVEMENTS.find((a) => a.id === id);
        if (!def) return prev;
        const next = [...prev, id];
        writeLS("achievements", next);
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
    [ready, toast],
  );

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
