"use client";

import Link from "next/link";
import { useDaily } from "@/components/providers/DailyProvider";
import { Logo } from "./Logo";
import { Container } from "./ui/Primitives";

const COLUMNS = [
  {
    title: "Product",
    links: [
      { label: "Features", href: "/#features" },
      { label: "Pricing", href: "/#pricing" },
      { label: "Changelog", href: "/changelog" },
      { label: "Status", href: "/#status" },
      { label: "Roadmap", href: "/404-roadmap" },
    ],
  },
  {
    title: "Community",
    links: [
      { label: "Contribute a joke", href: "/contribute" },
      { label: "Hall of Cringe", href: "/hall-of-cringe" },
      { label: "GitHub", href: "https://github.com/JapnoorHere/worksonmymachine.in" },
      { label: "Careers", href: "/404-careers" },
    ],
  },
  {
    title: "Legal-ish",
    links: [
      { label: "Terms nobody read", href: "/404-terms" },
      { label: "Privacy, conceptually", href: "/404-privacy" },
      { label: "Cookie policy", href: "/404-cookies" },
      { label: "DPA", href: "/404-dpa" },
    ],
  },
];

export function Footer() {
  const daily = useDaily();
  const year = new Date().getFullYear();

  return (
    <footer className="relative mt-24 border-t border-line bg-bg-tint">
      <Container className="py-14">
        <div className="grid gap-10 md:grid-cols-[1.4fr_repeat(3,1fr)]">
          <div>
            <Logo />
            <p className="mt-4 max-w-xs text-[13.5px] leading-relaxed text-ink-soft">
              The all-in-one platform for teams who have accepted their situation.
              SOC-2 adjacent. Runs on one machine. That machine is fine.
            </p>
            <p className="mt-4 font-mono text-[11px] text-ink-faint">
              Today the site is feeling:{" "}
              <span className="text-ember">{daily.mood.label}</span>
            </p>
          </div>

          {COLUMNS.map((col) => (
            <div key={col.title}>
              <h3 className="font-mono text-[10.5px] tracking-[0.18em] text-ink-faint uppercase">
                {col.title}
              </h3>
              <ul className="mt-3.5 space-y-2.5">
                {col.links.map((l) => (
                  <li key={l.label}>
                    <Link
                      href={l.href}
                      className="text-[13.5px] text-ink-soft transition-colors hover:text-ember"
                    >
                      {l.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="mt-12 flex flex-col gap-3 border-t border-line pt-6 text-[12px] text-ink-faint sm:flex-row sm:items-center sm:justify-between">
          <p>
            © {year} Works On My Machine, Inc. All rights reserved, and several
            reserved twice. Unauthorized reproduction is encouraged but will be
            spoken about unkindly.
          </p>
          <p className="font-mono">
            build {daily.key.replace(/-/g, "")}·{daily.outage.incidentId.slice(-6)}
          </p>
        </div>
      </Container>
    </footer>
  );
}
