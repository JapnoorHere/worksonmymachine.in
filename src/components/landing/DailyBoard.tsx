"use client";

import { motion } from "framer-motion";
import { useDaily } from "@/components/providers/DailyProvider";
import { Card, Eyebrow } from "@/components/ui/Primitives";
import { KevinAside } from "@/components/gags/KevinAside";
import { riseIn, spring, stagger } from "@/lib/motion";

/**
 * Everything on this board is derived from a hash of today's date, so every
 * visitor sees the same absurd thing today and something different tomorrow.
 * That's what makes it a shared bit instead of noise.
 */
export function DailyBoard() {
  const daily = useDaily();

  return (
    <motion.div
      variants={stagger()}
      initial="hidden"
      whileInView="show"
      viewport={{ once: true, margin: "-80px" }}
      className="grid gap-4 md:grid-cols-6"
    >
      {/* Status meter */}
      <motion.div variants={riseIn} className="md:col-span-3 lg:col-span-2">
        <Card className="h-full p-5">
          <Eyebrow>System status</Eyebrow>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="font-display text-[42px] leading-none font-extrabold tracking-tighter">
              {daily.status.pct}%
            </span>
            <span className="text-[19px]" aria-hidden>
              {daily.status.emoji}
            </span>
          </div>
          <p className="mt-1 text-[13.5px] text-ink-soft">
            All systems <span className="text-ink">{daily.status.label}</span>
          </p>

          <div className="mt-4 h-2 overflow-hidden rounded-full bg-surface-3">
            <motion.div
              initial={{ width: 0 }}
              whileInView={{ width: `${daily.status.pct}%` }}
              viewport={{ once: true }}
              transition={{ ...spring.gentle, delay: 0.25 }}
              className="h-full rounded-full bg-gradient-to-r from-ember to-warn"
            />
          </div>
          <p className="mt-2.5 font-mono text-[10.5px] text-ink-faint">
            measured once, in {daily.pretty.split(",")[0].toLowerCase()}, by someone
          </p>
        </Card>
      </motion.div>

      {/* Word of the day */}
      <motion.div variants={riseIn} className="md:col-span-3 lg:col-span-2">
        <Card className="h-full p-5">
          <Eyebrow>Word of the day</Eyebrow>
          <p className="mt-3 font-display text-[26px] leading-tight font-bold tracking-tight text-ember">
            {daily.buzzword.word}
          </p>
          <p className="mt-2 text-[13.5px] leading-relaxed text-ink-soft">
            {daily.buzzword.def}
          </p>
          <p className="mt-3 font-mono text-[10.5px] text-ink-faint">
            use it in a meeting · nobody will ask
          </p>
        </Card>
      </motion.div>

      {/* User of the day */}
      <motion.div variants={riseIn} className="md:col-span-3 lg:col-span-2">
        <Card className="h-full p-5">
          <Eyebrow>User of the day</Eyebrow>
          <div className="mt-3 flex items-center gap-3">
            <span className="grid size-11 shrink-0 place-items-center rounded-xl bg-ember-wash font-display text-[17px] font-bold text-ember">
              {daily.userOfDay.handle.slice(0, 2)}
            </span>
            <div className="min-w-0">
              <p className="truncate font-mono text-[13px] font-medium">
                @{daily.userOfDay.handle}
              </p>
              <p className="text-[11.5px] text-ink-faint">member since this morning</p>
            </div>
          </div>
          <p className="mt-3.5 rounded-lg bg-surface-2 px-3 py-2.5 text-[12.5px] leading-relaxed text-ink-soft">
            🏆 {daily.userOfDay.achievement}
          </p>
        </Card>
      </motion.div>

      {/* Mood strip */}
      <motion.div variants={riseIn} className="md:col-span-6">
        <Card className="tif-hatch flex flex-col items-start justify-between gap-3 p-5 sm:flex-row sm:items-center">
          <div>
            <Eyebrow>Mood of the site</Eyebrow>
            <p className="mt-1.5 font-display text-[21px] font-bold tracking-tight">
              Today the site is feeling:{" "}
              <span className="tif-mood text-ember">{daily.mood.label}</span>
            </p>
          </div>
          <p className="font-mono text-[11px] text-ink-faint sm:text-right">
            accent hue shifted {daily.mood.hue}° · resets at midnight
            <br className="hidden sm:block" /> whether you like it or not
          </p>
        </Card>
      </motion.div>

      <motion.div variants={riseIn} className="md:col-span-6">
        <KevinAside surface="daily-board" align="center" />
      </motion.div>
    </motion.div>
  );
}
