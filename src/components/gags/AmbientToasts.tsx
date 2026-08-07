"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";
import { useToast } from "@/components/providers/ToastProvider";
import { TOASTS } from "@/lib/content";
import { deal } from "@/lib/bag";

/**
 * Unsolicited system notifications.
 *
 * Deliberately sparse and irregularly spaced: the first lands ~22s in, then
 * every 40–75s, and never on /admin (that page isn't part of the bit) or
 * /signup (the flow has its own timing and a toast landing mid-joke steps on
 * it). A gag that fires on a metronome stops being a surprise by the third
 * repetition, which is exactly when most people are still on the page.
 *
 * Dealt from the shared shuffle bag rather than picked at random, and the deck
 * persists across route changes — so you'd have to sit through all 50+ before
 * a single toast came round again.
 */
export function AmbientToasts() {
  const toast = useToast();
  const pathname = usePathname();

  const muted = pathname.startsWith("/admin") || pathname.startsWith("/signup");

  useEffect(() => {
    if (muted) return;

    let cancelled = false;
    const timers: ReturnType<typeof setTimeout>[] = [];

    const schedule = (delay: number) => {
      const t = setTimeout(() => {
        if (cancelled) return;
        const item = deal("ambient-toasts", TOASTS);
        toast({ title: item.title, body: item.body, tone: "neutral" });
        schedule(40_000 + Math.random() * 35_000);
      }, delay);
      timers.push(t);
    };

    schedule(22_000);

    return () => {
      cancelled = true;
      timers.forEach(clearTimeout);
    };
  }, [muted, toast]);

  return null;
}
