"use client";

import Link from "next/link";
import { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { useDaily } from "@/components/providers/DailyProvider";
import { ROASTS } from "@/lib/content";
import { deal } from "@/lib/bag";
import { KevinAside } from "@/components/gags/KevinAside";
import { Container, Eyebrow } from "@/components/ui/Primitives";
import { Button } from "@/components/ui/Button";
import { DodgingCTA } from "./DodgingCTA";
import { LiveCounter } from "./LiveCounter";
import { OutageBanner } from "./OutageBanner";
import { AppMock } from "./AppMock";
import { ease, riseIn, stagger } from "@/lib/motion";

export function Hero() {
  const daily = useDaily();
  const [roast, setRoast] = useState<string | null>(null);

  return (
    <section className="tif-grain relative overflow-hidden pt-12 pb-20 sm:pt-20">
      {/* Warm bloom behind the headline — the only gradient on the page, and it
          is doing a job: pulling the eye to the first line of copy. */}
      <div
        aria-hidden
        className="pointer-events-none absolute -top-40 left-1/2 h-[520px] w-[900px] max-w-[140vw] -translate-x-1/2 rounded-full opacity-[0.28] blur-3xl"
        style={{
          background:
            "radial-gradient(closest-side, var(--tif-ember) 0%, transparent 72%)",
        }}
      />
      <div className="tif-dotgrid pointer-events-none absolute inset-x-0 top-0 h-64 opacity-40 [mask-image:linear-gradient(to_bottom,black,transparent)]" />

      <Container className="relative">
        <motion.div variants={stagger(0.05, 0.07)} initial="hidden" animate="show">
          {/* The roast of the day is shared by everyone — but clicking deals a
              fresh one from the 55-entry bag, so anyone who wants more can just
              keep tapping and won't see a repeat for a very long time. */}
          <motion.div variants={riseIn} className="mb-6 flex justify-center">
            <button
              type="button"
              onClick={() => setRoast(deal("roasts", ROASTS))}
              title="Deal another"
              className="group inline-flex max-w-full cursor-pointer items-center gap-2 rounded-full border border-line bg-surface/80 py-1.5 pr-4 pl-1.5 backdrop-blur transition-colors hover:border-line-strong"
            >
              <span className="rounded-full bg-ember px-2 py-0.5 font-mono text-[10px] font-semibold tracking-wider text-ember-ink uppercase">
                Roast
              </span>
              <AnimatePresence mode="wait" initial={false}>
                <motion.span
                  key={roast ?? daily.roast}
                  initial={{ opacity: 0, y: 6 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -6 }}
                  transition={{ duration: 0.16 }}
                  className="truncate text-left text-[12.5px] text-ink-soft"
                >
                  {roast ?? daily.roast}
                </motion.span>
              </AnimatePresence>
              <span
                aria-hidden
                className="shrink-0 font-mono text-[11px] text-ink-faint opacity-0 transition-opacity group-hover:opacity-100"
              >
                ↻
              </span>
            </button>
          </motion.div>

          <motion.h1
            variants={riseIn}
            className="mx-auto max-w-4xl text-center text-[clamp(2.6rem,7.2vw,5.1rem)]"
          >
            Everything is{" "}
            <span className="relative inline-block">
              <span className="relative z-10">fine</span>
              <motion.span
                aria-hidden
                initial={{ scaleX: 0 }}
                animate={{ scaleX: 1 }}
                transition={{ delay: 0.55, duration: 0.7, ease: ease.out }}
                className="absolute inset-x-[-2%] bottom-[0.1em] -z-0 h-[0.34em] origin-left rounded-sm bg-ember/30"
              />
            </span>
            <br />
            and we have the dashboard to prove it.
          </motion.h1>

          <motion.p
            variants={riseIn}
            className="mx-auto mt-6 max-w-xl text-center text-[16.5px] leading-relaxed text-ink-soft"
          >
            The all-in-one platform for teams who have accepted their situation.
            Onboarding in six steps. Insights you can&apos;t act on. A support agent
            named Kevin who is typing.
          </motion.p>

          <motion.div
            variants={riseIn}
            className="mt-9 flex flex-col items-center justify-center gap-3 sm:flex-row"
          >
            <DodgingCTA />
            <Link href="/contribute">
              <Button variant="secondary" size="lg">
                Make it worse
              </Button>
            </Link>
          </motion.div>

          <motion.div variants={riseIn} className="mt-7 flex justify-center">
            <LiveCounter />
          </motion.div>

          <motion.div variants={riseIn} className="mx-auto mt-10 max-w-2xl">
            <OutageBanner />
          </motion.div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 40, rotateX: 8 }}
          animate={{ opacity: 1, y: 0, rotateX: 0 }}
          transition={{ delay: 0.35, duration: 0.9, ease: ease.out }}
          style={{ perspective: 1200 }}
          className="mt-14"
        >
          <AppMock />
        </motion.div>

        <KevinAside surface="hero" align="center" className="mt-10" />
      </Container>
    </section>
  );
}
