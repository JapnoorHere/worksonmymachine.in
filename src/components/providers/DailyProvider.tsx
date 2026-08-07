"use client";

import { createContext, useContext, useEffect, useMemo, useState } from "react";
import { buildDaily, utcDayKey, type CommunityPools, type DailyPayload } from "@/lib/daily";
import { dateKey } from "@/lib/seed";
import { writeLS } from "@/lib/storage";

/**
 * Serves today's content to the whole tree.
 *
 * First render uses the UTC day so server and client agree byte-for-byte; on
 * mount we switch to the viewer's local day (the site should flip at *your*
 * midnight) and fold in whatever the community pool has approved. Both updates
 * happen after hydration, so neither can cause a mismatch.
 */

interface DailyCtx {
  daily: DailyPayload;
  /** False until local-date + community content have been applied. */
  settled: boolean;
}

const bootstrap = buildDaily(utcDayKey());

const Ctx = createContext<DailyCtx>({ daily: bootstrap, settled: false });

export const useDaily = () => useContext(Ctx).daily;
export const useDailySettled = () => useContext(Ctx).settled;

export function DailyProvider({ children }: { children: React.ReactNode }) {
  const [community, setCommunity] = useState<CommunityPools>({});
  const [localKey, setLocalKey] = useState<string | null>(null);
  const [settled, setSettled] = useState(false);

  useEffect(() => {
    setLocalKey(dateKey());

    const ac = new AbortController();
    fetch("/api/content", { signal: ac.signal })
      .then((r) => (r.ok ? r.json() : null))
      .then((data) => {
        if (data?.pools) setCommunity(data.pools as CommunityPools);
      })
      .catch(() => {
        /* No community content is a perfectly good amount of community content. */
      })
      .finally(() => setSettled(true));

    return () => ac.abort();
  }, []);

  const daily = useMemo(
    () => buildDaily(localKey ?? utcDayKey(), community),
    [localKey, community],
  );

  // The daily "mood" nudges accent hue across the whole document.
  useEffect(() => {
    if (!localKey) return;
    document.documentElement.style.setProperty("--tif-mood-rotate", `${daily.mood.hue}deg`);
    writeLS("moodHue", daily.mood.hue);
  }, [daily.mood.hue, localKey]);

  const value = useMemo(() => ({ daily, settled }), [daily, settled]);

  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}
