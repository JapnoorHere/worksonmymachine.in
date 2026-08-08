"use client";

import { useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { motion, useAnimationControls } from "framer-motion";
import { useSound } from "@/components/providers/SoundProvider";
import { useAchievements } from "@/components/providers/AchievementProvider";
import { useToast } from "@/components/providers/ToastProvider";
import { useAuth } from "@/components/providers/AuthProvider";
import { spring } from "@/lib/motion";

/**
 * The primary CTA dodges the cursor exactly once, then gives up and behaves.
 *
 * "Once" is the entire design. A button that dodges forever is a hostile
 * puzzle; a button that dodges once is a joke that resolves in under a second
 * and then gets out of the way. Keyboard users bypass the dodge entirely —
 * that's not an oversight, it's the accessible path, and it awards an
 * achievement so it reads as a reward rather than a shortcut.
 */
export function DodgingCTA() {
  const [dodged, setDodged] = useState(false);
  const controls = useAnimationControls();
  const router = useRouter();
  const { play } = useSound();
  const { unlock } = useAchievements();
  const toast = useToast();
  const { user } = useAuth();
  const busy = useRef(false);

  const dodge = async () => {
    if (dodged || busy.current) return;
    busy.current = true;
    setDodged(true);
    play("whoosh");

    const dir = Math.random() > 0.5 ? 1 : -1;
    await controls.start({
      x: dir * (86 + Math.random() * 44),
      y: -14,
      rotate: dir * 5,
      transition: spring.recoil,
    });
    await controls.start({
      x: 0,
      y: 0,
      rotate: 0,
      transition: { ...spring.gentle, delay: 0.28 },
    });

    busy.current = false;
    toast({
      title: "Sorry — reflex.",
      body: "It's fine now. It won't do that again. Probably worth a second attempt.",
      emoji: "🫥",
      duration: 4200,
    });
  };

  const go = () => {
    play("success");
    router.push(user ? "/dashboard" : "/signup");
  };

  return (
    <motion.button
      type="button"
      animate={controls}
      onMouseEnter={dodge}
      onPointerDown={(e) => {
        // Touch has no hover, so the first tap is the dodge.
        if (e.pointerType === "touch" && !dodged) {
          e.preventDefault();
          dodge();
        }
      }}
      onClick={() => {
        if (busy.current) return;
        // Reached it without ever triggering a hover — keyboard, most likely.
        if (!dodged) unlock("cta-caught");
        go();
      }}
      whileHover={dodged ? { y: -2, scale: 1.02 } : undefined}
      whileTap={dodged ? { scale: 0.96 } : undefined}
      transition={spring.snappy}
      className="group relative inline-flex h-13 cursor-pointer items-center gap-2.5 rounded-xl bg-ember px-7 text-[15.5px] font-semibold text-ember-ink shadow-[0_1px_0_rgba(255,255,255,0.25)_inset,0_8px_24px_-8px_rgba(232,65,11,0.7)]"
    >
      {user ? "Go to dashboard" : "Get started free"}
      <svg
        viewBox="0 0 18 18"
        className="size-[17px] transition-transform duration-300 group-hover:translate-x-1"
        aria-hidden
      >
        <path
          d="M3 9h11M9.5 4.5L14 9l-4.5 4.5"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
      <span className="pointer-events-none absolute inset-0 rounded-xl ring-0 ring-ember/40 transition-[box-shadow] group-hover:ring-8" />
    </motion.button>
  );
}
