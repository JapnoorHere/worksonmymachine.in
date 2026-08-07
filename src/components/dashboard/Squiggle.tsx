"use client";

import { useMemo } from "react";
import { motion } from "framer-motion";
import { makeRng } from "@/lib/seed";
import { ease } from "@/lib/motion";

/** A chart that is, transparently, a random walk. Redrawn daily from the seed. */
export function Squiggle({ seed }: { seed: string }) {
  const { line, area } = useMemo(() => {
    const rng = makeRng(seed);
    const n = 40;
    const pts: [number, number][] = [];
    let y = 55;

    for (let i = 0; i < n; i++) {
      y += (rng.next() - 0.5) * 22;
      if (rng.chance(0.08)) y += (rng.next() - 0.5) * 55;
      y = Math.max(10, Math.min(100, y));
      pts.push([(i / (n - 1)) * 480, y]);
    }

    const d = pts
      .map(([x, py], i) => {
        if (i === 0) return `M ${x} ${py}`;
        const [px, ppy] = pts[i - 1];
        const cx = (px + x) / 2;
        return `C ${cx} ${ppy} ${cx} ${py} ${x} ${py}`;
      })
      .join(" ");

    return { line: d, area: `${d} L 480 110 L 0 110 Z` };
  }, [seed]);

  return (
    <svg viewBox="0 0 480 110" className="mt-4 h-32 w-full sm:h-40" aria-hidden>
      <defs>
        <linearGradient id="squigglefill" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="var(--tif-ember)" stopOpacity="0.26" />
          <stop offset="100%" stopColor="var(--tif-ember)" stopOpacity="0" />
        </linearGradient>
      </defs>

      {[22, 44, 66, 88].map((y) => (
        <line key={y} x1="0" x2="480" y1={y} y2={y} stroke="var(--tif-line)" strokeWidth="1" />
      ))}

      <motion.path
        d={area}
        fill="url(#squigglefill)"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.9, duration: 0.7 }}
      />
      <motion.path
        d={line}
        fill="none"
        stroke="var(--tif-ember)"
        strokeWidth="2.4"
        strokeLinecap="round"
        initial={{ pathLength: 0 }}
        animate={{ pathLength: 1 }}
        transition={{ duration: 1.5, ease: ease.inOut }}
      />
    </svg>
  );
}
