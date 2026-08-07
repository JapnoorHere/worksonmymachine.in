"use client";

import { useMemo } from "react";
import { motion } from "framer-motion";
import { useDaily } from "@/components/providers/DailyProvider";
import { makeRng } from "@/lib/seed";
import { ease } from "@/lib/motion";

/**
 * The hero "product screenshot", built in DOM and SVG rather than shipped as an
 * image. It costs nothing to load, it inherits the theme automatically, and —
 * the part that matters — the chart inside it is genuinely random, so the
 * screenshot is different tomorrow. A static PNG would have given the joke
 * away by being too perfect.
 */
export function AppMock() {
  const daily = useDaily();

  const { line, area, bars } = useMemo(() => {
    const rng = makeRng(`${daily.key}::squiggle`);
    const points: [number, number][] = [];
    const n = 34;
    let y = 60;
    for (let i = 0; i < n; i++) {
      // Random walk with an occasional cliff. It trends nowhere, confidently.
      y += (rng.next() - 0.5) * 26;
      if (rng.chance(0.06)) y += (rng.next() - 0.5) * 60;
      y = Math.max(12, Math.min(108, y));
      points.push([(i / (n - 1)) * 560, y]);
    }
    const d = points
      .map(([x, py], i) => {
        if (i === 0) return `M ${x} ${py}`;
        const [px, ppy] = points[i - 1];
        const cx = (px + x) / 2;
        return `C ${cx} ${ppy} ${cx} ${py} ${x} ${py}`;
      })
      .join(" ");

    return {
      line: d,
      area: `${d} L 560 120 L 0 120 Z`,
      bars: Array.from({ length: 12 }, () => 18 + rng.next() * 76),
    };
  }, [daily.key]);

  return (
    <div className="relative mx-auto max-w-4xl">
      <div className="overflow-hidden rounded-[16px] border border-line bg-surface shadow-float">
        {/* Window chrome */}
        <div className="flex items-center gap-2 border-b border-line bg-surface-2 px-4 py-2.5">
          <div className="flex gap-1.5">
            {["#ff5f57", "#febc2e", "#28c840"].map((c) => (
              <span key={c} className="size-[9px] rounded-full" style={{ background: c }} />
            ))}
          </div>
          <div className="mx-auto flex items-center gap-1.5 rounded-md bg-surface px-3 py-1 font-mono text-[10.5px] text-ink-faint">
            <svg viewBox="0 0 12 12" className="size-2.5 text-moss" aria-hidden>
              <path
                d="M3 5.5V4a3 3 0 1 1 6 0v1.5"
                stroke="currentColor"
                strokeWidth="1.4"
                fill="none"
              />
              <rect x="2.2" y="5.4" width="7.6" height="5" rx="1.2" fill="currentColor" />
            </svg>
            app.worksonmymachine.in/overview
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-[168px_1fr]">
          {/* Sidebar */}
          <div className="hidden flex-col gap-1 border-r border-line bg-bg-tint p-3 sm:flex">
            {[
              ["Overview", true],
              ["Signals", false],
              ["Synergy", false],
              ["Incidents", false],
              ["Kevin", false],
              ["Billing", false],
            ].map(([label, active]) => (
              <div
                key={label as string}
                className={`flex items-center gap-2 rounded-lg px-2.5 py-1.5 text-[12.5px] ${
                  active ? "bg-surface text-ink shadow-soft" : "text-ink-faint"
                }`}
              >
                <span
                  className={`size-1.5 rounded-full ${active ? "bg-ember" : "bg-line-strong"}`}
                />
                {label as string}
              </div>
            ))}
            <div className="mt-auto rounded-lg bg-ember-wash p-2.5">
              <p className="text-[11px] font-semibold text-ember">Trial: 0 days left</p>
              <p className="mt-0.5 text-[10.5px] text-ink-soft">Started today.</p>
            </div>
          </div>

          {/* Body */}
          <div className="p-4 sm:p-5">
            <div className="mb-4 flex flex-wrap items-end justify-between gap-3">
              <div>
                <p className="font-mono text-[10px] tracking-[0.16em] text-ink-faint uppercase">
                  This quarter
                </p>
                <p className="mt-1 font-display text-[26px] leading-none font-bold tracking-tight">
                  Momentum
                </p>
              </div>
              <div className="flex gap-1.5">
                {["7d", "30d", "∞"].map((t, i) => (
                  <span
                    key={t}
                    className={`rounded-md px-2 py-1 font-mono text-[10.5px] ${
                      i === 2 ? "bg-ink text-bg" : "bg-surface-2 text-ink-faint"
                    }`}
                  >
                    {t}
                  </span>
                ))}
              </div>
            </div>

            <div className="rounded-xl border border-line bg-bg-tint p-3">
              <svg viewBox="0 0 560 120" className="h-28 w-full sm:h-36" aria-hidden>
                <defs>
                  <linearGradient id="mockfill" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="var(--tif-ember)" stopOpacity="0.3" />
                    <stop offset="100%" stopColor="var(--tif-ember)" stopOpacity="0" />
                  </linearGradient>
                </defs>
                {[24, 48, 72, 96].map((y) => (
                  <line
                    key={y}
                    x1="0"
                    x2="560"
                    y1={y}
                    y2={y}
                    stroke="var(--tif-line)"
                    strokeWidth="1"
                  />
                ))}
                <motion.path
                  d={area}
                  fill="url(#mockfill)"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 1.3, duration: 0.8 }}
                />
                <motion.path
                  d={line}
                  fill="none"
                  stroke="var(--tif-ember)"
                  strokeWidth="2.2"
                  strokeLinecap="round"
                  initial={{ pathLength: 0 }}
                  animate={{ pathLength: 1 }}
                  transition={{ delay: 0.7, duration: 1.6, ease: ease.inOut }}
                />
              </svg>
              <p className="mt-1 text-center font-mono text-[10px] text-ink-faint">
                y-axis intentionally unlabeled
              </p>
            </div>

            <div className="mt-3 grid grid-cols-2 gap-3 sm:grid-cols-3">
              {[
                { k: "Productivity", v: "0.4", d: "▲ 0%" },
                { k: "Trust surface", v: "17m²", d: "▲ 3%" },
                { k: "Kevin ETA", v: "—", d: "pending" },
              ].map((s) => (
                <div key={s.k} className="rounded-xl border border-line p-3">
                  <p className="text-[10.5px] text-ink-faint">{s.k}</p>
                  <p className="mt-1 font-display text-[21px] leading-none font-bold">{s.v}</p>
                  <p className="mt-1 font-mono text-[10px] text-moss">{s.d}</p>
                </div>
              ))}
            </div>

            <div className="mt-3 flex h-14 items-end gap-1 rounded-xl border border-line bg-bg-tint px-3 pb-3">
              {bars.map((h, i) => (
                <motion.span
                  key={i}
                  initial={{ height: 0 }}
                  animate={{ height: `${h}%` }}
                  transition={{ delay: 1 + i * 0.035, ...{ type: "spring", stiffness: 300, damping: 24 } }}
                  className="flex-1 rounded-t-[3px] bg-smoke/45"
                />
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Floating notification, pinned to the mock. */}
      <motion.div
        initial={{ opacity: 0, y: 14, scale: 0.9 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ delay: 1.9, type: "spring", stiffness: 320, damping: 20 }}
        className="absolute -right-2 -bottom-5 hidden max-w-[240px] rounded-xl border border-line bg-surface p-3 shadow-float sm:block"
      >
        <p className="text-[12px] font-semibold">Weekly digest ready</p>
        <p className="mt-0.5 text-[11.5px] leading-snug text-ink-soft">
          You did nothing. Here is a chart of it.
        </p>
      </motion.div>
    </div>
  );
}
