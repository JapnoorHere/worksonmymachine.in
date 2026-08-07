"use client";

import { useEffect } from "react";
import { useToast } from "@/components/providers/ToastProvider";
import { readLS, writeLS } from "@/lib/storage";

/**
 * `prefers-reduced-motion` is respected everywhere in the CSS — this just makes
 * the accommodation itself part of the bit, once, without withholding anything.
 * The site is fully usable either way; nobody gets a lesser version as a
 * punchline.
 */
export function BoringModeNotice() {
  const toast = useToast();

  useEffect(() => {
    if (typeof window === "undefined") return;
    if (!window.matchMedia?.("(prefers-reduced-motion: reduce)").matches) return;
    if (readLS<boolean>("boringNoticed", false)) return;

    writeLS("boringNoticed", true);
    const t = setTimeout(
      () =>
        toast({
          title: "Reduced motion detected",
          body: "Boring Mode™ enabled. All jokes still included, now delivered standing perfectly still.",
          emoji: "🧘",
          tone: "moss",
          duration: 7000,
        }),
      1600,
    );
    return () => clearTimeout(t);
  }, [toast]);

  return null;
}
