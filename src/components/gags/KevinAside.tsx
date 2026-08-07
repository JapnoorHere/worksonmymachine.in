"use client";

import { useEffect } from "react";
import { motion } from "framer-motion";
import { KEVIN_ASIDES } from "@/lib/content";
import { useDealtOne } from "@/lib/useDealt";
import { useAchievements } from "@/components/providers/AchievementProvider";
import { readLS, writeLS } from "@/lib/storage";
import { cn } from "@/lib/cn";

/**
 * Kevin, the running gag.
 *
 * Everything else on this site is engineered never to repeat — 50+ entries per
 * pool, dealt from a shuffled deck. Kevin is the deliberate exception. He shows
 * up on every page and in most sections, always typing, never finishing. The
 * contrast is the joke: in a site where nothing recurs, the one thing that does
 * is a man who has been drafting a reply since you arrived.
 *
 * The *line* still varies (18 asides, dealt) — it's Kevin's presence that
 * repeats, not his words. Repetition of a fact reads as a bit; repetition of a
 * sentence reads as a bug.
 */
export function KevinAside({
  surface,
  className,
  align = "left",
}: {
  /** Unique per placement, so two Kevins on one page never say the same thing. */
  surface: string;
  className?: string;
  align?: "left" | "center";
}) {
  const line = useDealtOne(`kevin-aside:${surface}`, KEVIN_ASIDES);
  const { unlock } = useAchievements();

  // Seeing Kevin on five distinct surfaces unlocks the spotter achievement.
  useEffect(() => {
    const seen = readLS<string[]>("kevinSurfaces", []);
    if (seen.includes(surface)) return;
    const next = [...seen, surface];
    writeLS("kevinSurfaces", next);
    if (next.length >= 5) unlock("kevin-spotter");
  }, [surface, unlock]);

  return (
    <motion.p
      initial={{ opacity: 0 }}
      whileInView={{ opacity: 1 }}
      viewport={{ once: true }}
      transition={{ delay: 0.3 }}
      className={cn(
        "flex items-center gap-1.5 font-mono text-[10.5px] text-ink-faint",
        align === "center" && "justify-center",
        className,
      )}
    >
      <span className="grid size-3.5 shrink-0 place-items-center rounded-full bg-smoke-wash text-[7px] font-bold text-smoke">
        K
      </span>
      {line}
      <span className="tif-blink">…</span>
    </motion.p>
  );
}
