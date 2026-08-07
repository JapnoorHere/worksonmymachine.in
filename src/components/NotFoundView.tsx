"use client";

import { useEffect } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { Container, Card } from "@/components/ui/Primitives";
import { Button } from "@/components/ui/Button";
import { useDaily } from "@/components/providers/DailyProvider";
import { useAchievements } from "@/components/providers/AchievementProvider";
import { spring } from "@/lib/motion";
import { KevinAside } from "@/components/gags/KevinAside";

export function NotFoundView() {
  const daily = useDaily();
  const { unlock } = useAchievements();

  useEffect(() => {
    unlock("lost");
  }, [unlock]);

  return (
    <Container className="flex min-h-[calc(100vh-14rem)] items-center py-16">
      <div className="mx-auto w-full max-w-xl text-center">
        <motion.p
          initial={{ opacity: 0, scale: 0.8, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          transition={spring.bouncy}
          className="font-display text-[clamp(5rem,20vw,9rem)] leading-none font-extrabold tracking-tighter text-ember"
        >
          404
        </motion.p>

        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ ...spring.gentle, delay: 0.12 }}
        >
          <h1 className="mt-2 text-[clamp(1.5rem,4vw,2.1rem)]">
            That page isn&apos;t here.
          </h1>

          <Card className="mt-6 p-5">
            <p className="font-mono text-[10px] tracking-[0.18em] text-ink-faint uppercase">
              Today&apos;s excuse
            </p>
            <p className="mt-2.5 text-[15.5px] leading-relaxed text-ink">{daily.excuse}</p>
            <p className="mt-3 font-mono text-[10.5px] text-ink-faint">
              a different excuse is issued daily · come back tomorrow for a new one
            </p>
          </Card>

          <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
            <Link href="/">
              <Button size="lg">Back to safety</Button>
            </Link>
            <Link href="/contribute">
              <Button size="lg" variant="secondary">
                Write tomorrow&apos;s excuse
              </Button>
            </Link>
          </div>

          <p className="mt-8 font-mono text-[10.5px] text-ink-faint">
            incident {daily.outage.incidentId} · unrelated · probably
          </p>

          <KevinAside surface="404" align="center" className="mt-3" />
        </motion.div>
      </div>
    </Container>
  );
}
