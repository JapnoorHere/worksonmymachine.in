"use client";

import { motion } from "framer-motion";
import { useState } from "react";
import { Container, Eyebrow, Card } from "@/components/ui/Primitives";
import { HOVER_ROASTS } from "@/lib/content";
import { deal } from "@/lib/bag";
import { KevinAside } from "@/components/gags/KevinAside";
import { riseIn, spring, stagger } from "@/lib/motion";
import { cn } from "@/lib/cn";

const FEATURES = [
  {
    title: "Insights",
    body: "We surface patterns in your data and then decline to explain them. Charts are provided. Axes are not.",
    stat: "0",
    statLabel: "actionable insights",
    span: "lg:col-span-3",
  },
  {
    title: "Real-time collaboration",
    body: "See your teammates' cursors moving. They are not doing anything either. This is comforting.",
    stat: "1",
    statLabel: "cursor, yours",
    span: "lg:col-span-3",
  },
  {
    title: "Automations",
    body: "Trigger a workflow when something happens. Then trigger a workflow when that workflow happens. Then talk to Kevin.",
    stat: "∞",
    statLabel: "loops available",
    span: "lg:col-span-2",
  },
  {
    title: "Enterprise-grade security",
    body: "Your data is encrypted at rest, in transit, and while it thinks nobody is looking. Keys stored in a Notion page.",
    stat: "SOC-2",
    statLabel: "adjacent",
    span: "lg:col-span-2",
  },
  {
    title: "99.9% uptime",
    body: "Calculated monthly, excluding weekends, holidays, deploys, incidents, and any period during which the site was down.",
    stat: "99.9%",
    statLabel: "conditionally",
    span: "lg:col-span-2",
  },
];

function FeatureCard({ feature }: { feature: (typeof FEATURES)[number] }) {
  // A fresh roast on every hover, dealt so you'd have to hover 50 times before
  // one came round again. Cards sharing one deck means moving between them
  // never repeats either.
  const [roast, setRoast] = useState<string | null>(null);

  return (
    <motion.div variants={riseIn} className={cn("md:col-span-1", feature.span)}>
      <Card
        onMouseEnter={() => setRoast(deal("hover-roasts", HOVER_ROASTS))}
        onMouseLeave={() => setRoast(null)}
        className="group relative h-full overflow-hidden p-6 transition-[border-color,box-shadow] duration-300 hover:border-line-strong hover:shadow-card"
      >
        <div className="flex items-baseline gap-2.5">
          <span className="font-display text-[30px] leading-none font-extrabold tracking-tighter text-ember">
            {feature.stat}
          </span>
          <span className="font-mono text-[10.5px] tracking-wider text-ink-faint uppercase">
            {feature.statLabel}
          </span>
        </div>

        <h3 className="mt-4 text-[19px] font-bold">{feature.title}</h3>
        <p className="mt-2 text-[14px] leading-relaxed text-ink-soft">{feature.body}</p>

        <motion.p
          initial={false}
          animate={{ opacity: roast ? 1 : 0, y: roast ? 0 : 6 }}
          transition={spring.snappy}
          className="mt-4 font-mono text-[11px] text-ember"
          aria-hidden
        >
          {roast ?? " "}
        </motion.p>
      </Card>
    </motion.div>
  );
}

export function Features() {
  return (
    <section id="features" className="scroll-mt-24 py-20">
      <Container>
        <div className="mb-10 max-w-2xl">
          <Eyebrow>Capabilities</Eyebrow>
          <h2 className="mt-3 text-[clamp(2rem,4.4vw,3rem)]">
            Everything you need, arranged in a grid.
          </h2>
          <p className="mt-4 text-[16px] leading-relaxed text-ink-soft">
            We evaluated what modern teams require and then built a dashboard.
            Each capability below has been independently verified by us.
          </p>
        </div>

        <motion.div
          variants={stagger()}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, margin: "-100px" }}
          className="grid gap-4 md:grid-cols-2 lg:grid-cols-6"
        >
          {FEATURES.map((f) => (
            <FeatureCard key={f.title} feature={f} />
          ))}
        </motion.div>

        <KevinAside surface="features" align="center" className="mt-8" />
      </Container>
    </section>
  );
}
