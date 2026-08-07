"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { Container, Eyebrow, Card } from "@/components/ui/Primitives";
import { Button } from "@/components/ui/Button";
import { useDaily } from "@/components/providers/DailyProvider";
import { TESTIMONIALS, FAKE_LOGOS } from "@/lib/content";
import { useDealtMany } from "@/lib/useDealt";
import { KevinAside } from "@/components/gags/KevinAside";
import { riseIn, stagger } from "@/lib/motion";

export function Testimonials() {
  const daily = useDaily();

  // Six of fifty, dealt fresh on every visit — reload and the wall is different
  // people. The logo row rotates independently for the same reason.
  const quotes = useDealtMany("testimonials", TESTIMONIALS, 6);
  const logos = useDealtMany("fake-logos", FAKE_LOGOS, 7);

  return (
    <section className="py-20">
      <Container>
        {/* Logo wall — every one of these is invented, which is the joke, and
            the caption is the only place we admit it. */}
        <div className="mb-16">
          <p className="text-center font-mono text-[10.5px] tracking-[0.2em] text-ink-faint uppercase">
            Trusted by teams at
          </p>
          <div className="mt-5 flex flex-wrap items-center justify-center gap-x-9 gap-y-4">
            {logos.map((l, i) => (
              <motion.span
                key={l}
                initial={{ opacity: 0, y: 8 }}
                whileInView={{ opacity: 0.55, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.05 }}
                className="font-display text-[17px] font-bold tracking-tight text-ink-soft"
              >
                {l}
              </motion.span>
            ))}
          </div>
          <p className="mt-4 text-center font-mono text-[10.5px] text-ink-faint">
            none of these are real · neither is the trust
          </p>
        </div>

        <div className="mb-10 max-w-2xl">
          <Eyebrow>Social proof</Eyebrow>
          <h2 className="mt-3 text-[clamp(2rem,4.4vw,3rem)]">
            People are saying things.
          </h2>
        </div>

        <motion.div
          variants={stagger()}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, margin: "-80px" }}
          className="columns-1 gap-4 md:columns-2 lg:columns-3 [&>*]:mb-4 [&>*]:break-inside-avoid"
        >
          {/* Keyed on the quote, not the name — "Anonymous" appears repeatedly
              in the pool and would collide. */}
          {quotes.map((q) => (
            <motion.div key={q.quote} variants={riseIn}>
              <Card className="p-5">
                <div className="flex gap-0.5 text-ember" aria-label="5 out of 5">
                  {Array.from({ length: 5 }, (_, i) => (
                    <svg key={i} viewBox="0 0 16 16" className="size-3.5" aria-hidden>
                      <path
                        d="M8 1.6l1.9 4 4.4.6-3.2 3.1.8 4.4L8 11.6l-3.9 2.1.8-4.4L1.7 6.2l4.4-.6L8 1.6Z"
                        fill="currentColor"
                      />
                    </svg>
                  ))}
                </div>
                <p className="mt-3 text-[14px] leading-relaxed text-ink">
                  &ldquo;{q.quote}&rdquo;
                </p>
                <div className="mt-4 flex items-center gap-2.5 border-t border-line pt-3.5">
                  <span className="grid size-7 place-items-center rounded-full bg-surface-3 font-mono text-[11px] font-semibold text-ink-soft">
                    {q.name[0]}
                  </span>
                  <div>
                    <p className="text-[12.5px] font-semibold">{q.name}</p>
                    <p className="text-[11.5px] text-ink-faint">{q.role}</p>
                  </div>
                </div>
              </Card>
            </motion.div>
          ))}
        </motion.div>

        {/* Closing CTA */}
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-80px" }}
          className="tif-grain relative mt-20 overflow-hidden rounded-[18px] border border-line bg-ink px-6 py-14 text-center text-bg sm:px-12"
        >
          <div
            aria-hidden
            className="pointer-events-none absolute -top-24 left-1/2 h-64 w-[700px] max-w-[130vw] -translate-x-1/2 rounded-full opacity-40 blur-3xl"
            style={{
              background: "radial-gradient(closest-side, var(--tif-ember), transparent 70%)",
            }}
          />
          <div className="relative">
            <h2 className="mx-auto max-w-2xl text-[clamp(1.9rem,4.2vw,2.9rem)] text-bg">
              Join {daily.metrics.users.toLocaleString()} people who are also fine.
            </h2>
            <p className="mx-auto mt-4 max-w-md text-[15px] leading-relaxed opacity-70">
              Six steps. Roughly two minutes. At least one of your answers will be
              rejected on principle.
            </p>
            <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
              <Link href="/signup">
                <Button size="lg">Get started free</Button>
              </Link>
              <Link href="/hall-of-cringe">
                <Button
                  size="lg"
                  variant="ghost"
                  className="text-bg/70 hover:bg-white/10 hover:text-bg"
                >
                  See who built this
                </Button>
              </Link>
            </div>
            <p className="mt-7 font-mono text-[10.5px] opacity-45">
              no credit card required · no card accepted · no card exists
            </p>
          </div>
        </motion.div>

        <KevinAside surface="testimonials" align="center" className="mt-6" />
      </Container>
    </section>
  );
}
