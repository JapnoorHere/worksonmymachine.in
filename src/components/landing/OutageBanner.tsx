"use client";

import { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { useDaily } from "@/components/providers/DailyProvider";
import { spring } from "@/lib/motion";

export function OutageBanner() {
  const daily = useDaily();
  const [open, setOpen] = useState(false);
  const [dismissed, setDismissed] = useState(false);

  if (dismissed) return null;

  return (
    <motion.div
      initial={{ opacity: 0, y: -8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={spring.gentle}
      className="overflow-hidden rounded-xl border border-warn/35 bg-warn-wash"
    >
      <div className="flex items-start gap-3 px-4 py-3">
        <span className="mt-0.5 grid size-5 shrink-0 place-items-center rounded-full bg-warn/20 text-warn">
          <svg viewBox="0 0 16 16" className="size-3" aria-hidden>
            <path
              d="M8 4v5M8 11.4v.2"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
            />
          </svg>
        </span>

        <div className="min-w-0 flex-1">
          <p className="text-[13.5px] leading-snug font-medium text-ink">{daily.outage.title}</p>
          <button
            onClick={() => setOpen((v) => !v)}
            aria-expanded={open}
            className="mt-1 cursor-pointer font-mono text-[11px] text-warn underline-offset-2 hover:underline"
          >
            {daily.outage.severity} · {daily.outage.incidentId} ·{" "}
            {open ? "hide details" : "view details"}
          </button>

          <AnimatePresence initial={false}>
            {open && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: "auto", opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                transition={spring.gentle}
                className="overflow-hidden"
              >
                <p className="pt-2.5 text-[12.5px] leading-relaxed text-ink-soft">
                  {daily.outage.update}
                </p>
                <p className="pt-1.5 font-mono text-[11px] text-ink-faint">
                  Next update: when there is one.
                </p>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        <button
          onClick={() => setDismissed(true)}
          aria-label="Dismiss incident notice"
          className="-m-1 shrink-0 rounded-md p-1 text-warn/70 transition-colors hover:text-warn"
        >
          <svg width="12" height="12" viewBox="0 0 14 14" aria-hidden>
            <path
              d="M1 1l12 12M13 1L1 13"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
            />
          </svg>
        </button>
      </div>
    </motion.div>
  );
}
