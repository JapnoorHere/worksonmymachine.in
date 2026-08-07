"use client";

import Link from "next/link";
import { useState } from "react";
import { motion } from "framer-motion";
import { Container, Eyebrow, Card, Badge } from "@/components/ui/Primitives";
import { Button } from "@/components/ui/Button";
import { useToast } from "@/components/providers/ToastProvider";
import { riseIn, spring, stagger } from "@/lib/motion";
import { KevinAside } from "@/components/gags/KevinAside";
import { cn } from "@/lib/cn";

const TIERS = [
  {
    name: "Free",
    price: { month: "$0", year: "$0" },
    note: "Forever, or until we reconsider.",
    features: [
      "Unlimited projects (max 1)",
      "Community support (Kevin)",
      "Data retention: optimistic",
      "Export: screenshot",
    ],
    cta: "Start free",
    featured: false,
  },
  {
    name: "Pro",
    price: { month: "$29", year: "$29" },
    note: "Per seat. Seats are conceptual.",
    features: [
      "Everything in Free, arranged differently",
      "Priority support (Kevin, but faster)",
      "Advanced analytics you will not open",
      "Custom domain (points here)",
      "SSO, eventually",
    ],
    cta: "Start free trial",
    featured: true,
  },
  {
    name: "Enterprise",
    price: { month: "Let's talk", year: "Let's talk" },
    note: "We will not talk.",
    features: [
      "Everything in Pro, in a nicer font",
      "Dedicated success manager (Kevin)",
      "99.9% uptime SLA, unenforceable",
      "Procurement fatigue included",
      "Invoice via carrier pigeon",
    ],
    cta: "Contact sales",
    featured: false,
  },
];

export function Pricing() {
  const [annual, setAnnual] = useState(false);
  const toast = useToast();

  return (
    <section id="pricing" className="scroll-mt-24 border-y border-line bg-bg-tint py-20">
      <Container>
        <div className="mb-10 flex flex-col items-start justify-between gap-6 md:flex-row md:items-end">
          <div className="max-w-xl">
            <Eyebrow>Pricing</Eyebrow>
            <h2 className="mt-3 text-[clamp(2rem,4.4vw,3rem)]">
              Simple, transparent, non-refundable.
            </h2>
            <p className="mt-4 text-[16px] leading-relaxed text-ink-soft">
              No hidden fees. The fees are listed. You just won&apos;t read them.
            </p>
          </div>

          <div className="flex items-center gap-3 rounded-full border border-line bg-surface p-1">
            {(["month", "year"] as const).map((p) => {
              const active = (p === "year") === annual;
              return (
                <button
                  key={p}
                  onClick={() => {
                    setAnnual(p === "year");
                    if (p === "year") {
                      toast({
                        title: "Annual billing selected",
                        body: "Save 0%. The price is the same. We admire the optimism.",
                        tone: "moss",
                      });
                    }
                  }}
                  className={cn(
                    "relative cursor-pointer rounded-full px-4 py-1.5 text-[13px] font-semibold transition-colors",
                    active ? "text-ink" : "text-ink-faint hover:text-ink-soft",
                  )}
                >
                  {active && (
                    <motion.span
                      layoutId="price-pill"
                      transition={spring.bouncy}
                      className="absolute inset-0 -z-10 rounded-full bg-surface-2 shadow-soft"
                    />
                  )}
                  {p === "month" ? "Monthly" : "Annual"}
                  {p === "year" && (
                    <span className="ml-1.5 font-mono text-[10px] text-moss">−0%</span>
                  )}
                </button>
              );
            })}
          </div>
        </div>

        <motion.div
          variants={stagger()}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, margin: "-80px" }}
          className="grid gap-4 lg:grid-cols-3"
        >
          {TIERS.map((tier) => (
            <motion.div key={tier.name} variants={riseIn}>
              <Card
                className={cn(
                  "flex h-full flex-col p-6",
                  tier.featured && "border-ember/45 shadow-card ring-1 ring-ember/15",
                )}
              >
                <div className="flex items-center justify-between gap-3">
                  <h3 className="text-[18px] font-bold">{tier.name}</h3>
                  {tier.featured && <Badge tone="ember">Most regretted</Badge>}
                </div>

                <div className="mt-5 flex items-baseline gap-1.5">
                  <motion.span
                    key={annual ? tier.price.year : tier.price.month}
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={spring.snappy}
                    className="font-display text-[38px] leading-none font-extrabold tracking-tighter"
                  >
                    {annual ? tier.price.year : tier.price.month}
                  </motion.span>
                  {tier.price.month.startsWith("$") && (
                    <span className="text-[13px] text-ink-faint">
                      /{annual ? "mo, billed annually" : "mo"}
                    </span>
                  )}
                </div>
                <p className="mt-1.5 text-[12.5px] text-ink-faint">{tier.note}</p>

                <ul className="mt-6 flex-1 space-y-2.5">
                  {tier.features.map((f) => (
                    <li key={f} className="flex gap-2.5 text-[13.5px] leading-snug text-ink-soft">
                      <svg
                        viewBox="0 0 16 16"
                        className="mt-0.5 size-3.5 shrink-0 text-moss"
                        aria-hidden
                      >
                        <path
                          d="M3.5 8.5l3 3 6-6.5"
                          stroke="currentColor"
                          strokeWidth="2"
                          fill="none"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        />
                      </svg>
                      {f}
                    </li>
                  ))}
                </ul>

                <Link href="/signup" className="mt-7 block">
                  <Button
                    variant={tier.featured ? "primary" : "secondary"}
                    size="lg"
                    className="w-full"
                  >
                    {tier.cta}
                  </Button>
                </Link>
              </Card>
            </motion.div>
          ))}
        </motion.div>

        <p className="mt-6 text-center font-mono text-[11px] text-ink-faint">
          All plans include the same features. The tiers are for your emotional benefit.
        </p>

        <KevinAside surface="pricing" align="center" className="mt-4" />
      </Container>
    </section>
  );
}
