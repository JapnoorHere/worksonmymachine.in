"use client";

import { useDaily } from "@/components/providers/DailyProvider";

/** The thin scrolling strip above the nav. Pure texture; nothing here is real. */
export function StatusTicker() {
  const daily = useDaily();
  const items = [...daily.ticker, `word of the day: ${daily.buzzword.word.toLowerCase()}`];

  return (
    <div
      className="relative flex h-8 items-center overflow-hidden border-b border-line bg-ink text-bg"
      aria-hidden
    >
      <div className="tif-marquee flex w-max shrink-0 items-center">
        {[0, 1].map((copy) => (
          <div key={copy} className="flex items-center">
            {items.map((t, i) => (
              <span
                key={`${copy}-${i}`}
                className="flex items-center gap-3 px-4 font-mono text-[10.5px] tracking-[0.14em] whitespace-nowrap uppercase opacity-75"
              >
                <span className="size-1 rounded-full bg-ember" />
                {t}
              </span>
            ))}
          </div>
        ))}
      </div>
      {/* Feather the edges so text doesn't hard-clip at the viewport. */}
      <div className="pointer-events-none absolute inset-y-0 left-0 w-10 bg-gradient-to-r from-ink to-transparent" />
      <div className="pointer-events-none absolute inset-y-0 right-0 w-10 bg-gradient-to-l from-ink to-transparent" />
    </div>
  );
}
