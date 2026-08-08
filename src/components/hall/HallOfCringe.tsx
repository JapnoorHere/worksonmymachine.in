"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { Container, Card, Eyebrow, Badge } from "@/components/ui/Primitives";
import { Button } from "@/components/ui/Button";
import { TYPE_LABELS, type ContentType } from "@/lib/content";
import { riseIn, stagger } from "@/lib/motion";
import { KevinAside } from "@/components/gags/KevinAside";
import { cn } from "@/lib/cn";

interface Contributor {
  author: string;
  /** True when this handle has a real account behind it, not just typed text. */
  linked?: boolean;
  approved: number;
  pending: number;
  latest: string | null;
  types: string[];
}

/** Titles awarded by approved-joke count. Nobody asked for a ranking system. */
function rankTitle(n: number): string {
  if (n >= 25) return "Structural Liability";
  if (n >= 15) return "Load-Bearing Gremlin";
  if (n >= 8) return "Senior Nuisance";
  if (n >= 4) return "Repeat Offender";
  if (n >= 2) return "Committed";
  if (n >= 1) return "Contributor";
  return "In Review";
}

const MEDALS = ["🥇", "🥈", "🥉"];

export function HallOfCringe() {
  const [list, setList] = useState<Contributor[] | null>(null);

  useEffect(() => {
    fetch("/api/hall")
      .then((r) => r.json())
      .then((d) => setList((d.contributors as Contributor[]) ?? []))
      .catch(() => setList([]));
  }, []);

  const withApproved = (list ?? []).filter((c) => c.approved > 0);
  const totalJokes = withApproved.reduce((sum, c) => sum + c.approved, 0);

  return (
    <Container className="py-10 sm:py-14">
      <div className="mb-10 max-w-2xl">
        <Eyebrow>Credits</Eyebrow>
        <h1 className="mt-3 text-[clamp(2rem,5vw,3.2rem)]">Hall of Cringe</h1>
        <p className="mt-4 text-[16px] leading-relaxed text-ink-soft">
          Everyone who has made this site measurably worse, ranked by how much worse.
          Approved submissions only — the pending queue is not a leaderboard, it&apos;s a
          waiting room.
        </p>
      </div>

      <div className="mb-8 grid gap-3 sm:grid-cols-3">
        {[
          { label: "Contributors", value: withApproved.length },
          { label: "Jokes in rotation", value: totalJokes },
          { label: "Jokes rejected", value: "we don't publish that" },
        ].map((s) => (
          <Card key={s.label} className="p-5">
            <p className="text-[12px] text-ink-faint">{s.label}</p>
            <p
              className={cn(
                "mt-1.5 font-display font-extrabold tracking-tighter",
                typeof s.value === "number" ? "text-[34px] leading-none" : "text-[15px] leading-snug",
              )}
            >
              {list === null ? "…" : s.value}
            </p>
          </Card>
        ))}
      </div>

      {list === null ? (
        <Card className="p-8 text-center">
          <p className="text-[13px] text-ink-faint">Counting…</p>
        </Card>
      ) : withApproved.length === 0 ? (
        <Card className="p-10 text-center sm:p-14">
          <p className="text-[44px]" aria-hidden>
            🫥
          </p>
          <h2 className="mt-4 text-[22px]">Nobody yet.</h2>
          <p className="mx-auto mt-3 max-w-md text-[14.5px] leading-relaxed text-ink-soft">
            The hall is empty, echoing, and lit slightly too brightly. First approved
            submission takes the top spot and, more importantly, takes it from nobody.
          </p>
          <Link href="/contribute" className="mt-7 inline-block">
            <Button size="lg">Be the first</Button>
          </Link>
        </Card>
      ) : (
        <motion.ul
          variants={stagger()}
          initial="hidden"
          animate="show"
          className="space-y-2.5"
        >
          {withApproved.map((c, i) => (
            <motion.li key={c.author} variants={riseIn}>
              <Card
                className={cn(
                  "flex flex-wrap items-center gap-4 p-4 sm:p-5",
                  i === 0 && "border-ember/45 bg-ember-wash",
                )}
              >
                <span className="grid size-11 shrink-0 place-items-center rounded-xl bg-surface-2 font-display text-[17px] font-bold">
                  {MEDALS[i] ?? <span className="text-ink-faint">{i + 1}</span>}
                </span>

                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    <p className="truncate font-mono text-[14px] font-medium">@{c.author}</p>
                    {/* Ranking is unchanged — this only says the handle has an
                        account behind it, rather than being typed by anyone. */}
                    {c.linked && (
                      <Badge tone="moss" className="shrink-0">
                        <span aria-hidden>🔗</span> linked
                      </Badge>
                    )}
                  </div>
                  <p className="mt-0.5 text-[12px] text-ink-faint">
                    {rankTitle(c.approved)}
                    {c.pending > 0 && ` · ${c.pending} in review`}
                  </p>
                </div>

                <div className="hidden flex-wrap gap-1.5 sm:flex">
                  {c.types.slice(0, 3).map((t) => (
                    <Badge key={t}>{TYPE_LABELS[t as ContentType] ?? t}</Badge>
                  ))}
                </div>

                <div className="text-right">
                  <p className="font-display text-[26px] leading-none font-extrabold tracking-tighter text-ember">
                    {c.approved}
                  </p>
                  <p className="font-mono text-[10px] text-ink-faint">approved</p>
                </div>
              </Card>
            </motion.li>
          ))}
        </motion.ul>
      )}

      <KevinAside surface="hall" align="center" className="mt-10" />

      <Card className="mt-6 p-6 text-center sm:p-8">
        <h2 className="text-[20px]">Two ways in.</h2>
        <div className="mt-6 grid gap-4 text-left sm:grid-cols-2">
          <div className="rounded-xl border border-line bg-surface-2 p-4">
            <p className="text-[14px] font-bold">Write a joke</p>
            <p className="mt-1.5 text-[13px] leading-relaxed text-ink-soft">
              Fill a form, watch it render in the real component, submit. No account,
              no code, about ninety seconds.
            </p>
            <Link href="/contribute" className="mt-4 inline-block">
              <Button size="sm">Open the form</Button>
            </Link>
          </div>
          <div className="rounded-xl border border-line bg-surface-2 p-4">
            <p className="text-[14px] font-bold">Build a feature</p>
            <p className="mt-1.5 text-[13px] leading-relaxed text-ink-soft">
              The repo is public and the README is written in the same voice as the
              site. Standard PR flow. A human reviews and merges.
            </p>
            <a
              href="https://github.com/JapnoorHere/worksonmymachine.in"
              target="_blank"
              rel="noopener noreferrer"
              className="mt-4 inline-block"
            >
              <Button size="sm" variant="secondary">
                Open GitHub
              </Button>
            </a>
          </div>
        </div>
      </Card>
    </Container>
  );
}
