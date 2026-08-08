"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import confetti from "canvas-confetti";
import { Container, Card, Eyebrow, Badge } from "@/components/ui/Primitives";
import { Button } from "@/components/ui/Button";
import { useDaily } from "@/components/providers/DailyProvider";
import { useAchievements } from "@/components/providers/AchievementProvider";
import { useSound } from "@/components/providers/SoundProvider";
import { useAuth } from "@/components/providers/AuthProvider";
import { ACHIEVEMENTS, DASHBOARD_STATS } from "@/lib/content";
import { makeRng } from "@/lib/seed";
import { readLS } from "@/lib/storage";
import { riseIn, spring, stagger } from "@/lib/motion";
import { cn } from "@/lib/cn";
import { Squiggle } from "./Squiggle";
import { KevinAside } from "@/components/gags/KevinAside";
import { VibeMeter } from "./VibeMeter";
import { LiveCodeGenerator } from "./LiveCodeGenerator";
import { DistractionCounter } from "./DistractionCounter";
import { PanicButton } from "./PanicButton";
import { ScreenTimeSlider } from "./ScreenTimeSlider";
import { VoidButton } from "./VoidButton";

interface Profile {
  name: string;
  email: string;
  age: string;
  vibes: string[];
  trust: number;
  joinedAt: string;
}

const TABS = ["Overview", "Live Ops", "Achievements", "Insights"] as const;
type Tab = (typeof TABS)[number];

export function Dashboard() {
  const daily = useDaily();
  const { unlocked } = useAchievements();
  const { play } = useSound();
  const { user, logout } = useAuth();
  const [profile, setProfile] = useState<Profile | null>(null);
  const [tab, setTab] = useState<Tab>("Overview");
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setProfile(readLS<Profile | null>("profile", null));
    setMounted(true);
  }, []);

  const signOut = async () => {
    await logout();
    play("click");
  };

  /* Confetti, once, on arrival. Fired from two low corners rather than the
     centre so it reads as celebration rather than a screen wipe. */
  useEffect(() => {
    if (!mounted) return;
    if (window.matchMedia?.("(prefers-reduced-motion: reduce)").matches) return;

    const colors = ["#e8410b", "#ff7d57", "#4f7a2e", "#f7f1e8", "#b3730a"];
    const shots = [
      { angle: 60, origin: { x: 0, y: 0.75 } },
      { angle: 120, origin: { x: 1, y: 0.75 } },
    ];

    const t = setTimeout(() => {
      play("chime");
      shots.forEach((s, i) =>
        setTimeout(
          () => confetti({ ...s, particleCount: 70, spread: 68, colors, startVelocity: 46 }),
          i * 140,
        ),
      );
    }, 350);

    return () => clearTimeout(t);
  }, [mounted, play]);

  const stats = useMemo(() => {
    const rng = makeRng(`${daily.key}::dash`);
    return rng.sample(DASHBOARD_STATS, 4).map((s) => ({
      ...s,
      value:
        s.suffix === "%"
          ? `${rng.int(1, 14)}%`
          : s.suffix
            ? `${rng.int(2, 88)}${s.suffix}`
            : (rng.next() * 2).toFixed(1),
      delta: rng.chance(0.5) ? `▲ ${rng.int(0, 3)}%` : `▼ ${rng.int(0, 3)}%`,
    }));
  }, [daily.key]);

  // A real account (once logged in) is the source of truth; the localStorage
  // profile is only a fallback for someone who lands on /dashboard without
  // one — direct nav here has never been gated, and that stays true.
  const displayName = mounted ? user?.name || profile?.name || "Valued User" : "…";
  const displayTrust = mounted ? (user?.trust ?? profile?.trust ?? 50) : 50;
  const displayVibes = mounted ? (user?.vibes ?? profile?.vibes ?? []) : [];
  const earned = ACHIEVEMENTS.filter((a) => unlocked.includes(a.id));

  return (
    <Container className="py-10 sm:py-14">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={spring.gentle}
        className="tif-grain relative mb-6 overflow-hidden rounded-[16px] border border-line bg-ink px-6 py-8 text-bg sm:px-9 sm:py-10"
      >
        <div
          aria-hidden
          className="pointer-events-none absolute -top-32 -right-20 h-72 w-72 rounded-full opacity-45 blur-3xl"
          style={{ background: "radial-gradient(closest-side, var(--tif-ember), transparent 70%)" }}
        />
        <div className="relative">
          <p className="font-mono text-[10.5px] tracking-[0.2em] uppercase opacity-60">
            Welcome aboard
          </p>
          <h1 className="mt-2 text-[clamp(1.9rem,5vw,3rem)] text-bg">
            You&apos;re in, {displayName}.
          </h1>
          <p className="mt-3 max-w-lg text-[15px] leading-relaxed opacity-70">
            You are user{" "}
            <span className="font-mono font-semibold text-ember">#10,000,000</span>. A
            milestone. Shared, as it happens, with everyone who has ever completed this
            form.
          </p>

          <div className="mt-6 flex flex-wrap gap-2">
            <span className="rounded-full bg-white/10 px-3 py-1.5 font-mono text-[11px]">
              plan: free forever*
            </span>
            <span className="rounded-full bg-white/10 px-3 py-1.5 font-mono text-[11px]">
              trust: {displayTrust}%
            </span>
            <span className="rounded-full bg-white/10 px-3 py-1.5 font-mono text-[11px]">
              seats: 1 of 1
            </span>
            {mounted && user && (
              <button
                type="button"
                onClick={signOut}
                title={user.email}
                className="cursor-pointer rounded-full bg-white/10 px-3 py-1.5 font-mono text-[11px] transition-colors hover:bg-white/20"
              >
                sign out
              </button>
            )}
          </div>
          <p className="mt-3 font-mono text-[10px] opacity-40">
            *forever is defined in section 14 of a document we have not drafted
          </p>
        </div>
      </motion.div>

      {/* Tabs */}
      <div className="mb-6 flex gap-1 overflow-x-auto rounded-xl border border-line bg-surface-2 p-1">
        {TABS.map((t) => (
          <button
            key={t}
            onClick={() => {
              setTab(t);
              play("click");
            }}
            aria-current={tab === t}
            className={cn(
              "relative shrink-0 cursor-pointer rounded-lg px-4 py-2 text-[13.5px] font-semibold transition-colors",
              tab === t ? "text-ink" : "text-ink-faint hover:text-ink-soft",
            )}
          >
            {tab === t && (
              <motion.span
                layoutId="dash-tab"
                transition={spring.bouncy}
                className="absolute inset-0 -z-10 rounded-lg border border-line bg-surface shadow-soft"
              />
            )}
            {t}
            {t === "Achievements" && (
              <span className="ml-1.5 font-mono text-[10.5px] text-ember">
                {earned.length}
              </span>
            )}
          </button>
        ))}
      </div>

      {tab === "Overview" && (
        <motion.div
          variants={stagger()}
          initial="hidden"
          animate="show"
          className="grid gap-4 lg:grid-cols-3"
        >
          {stats.map((s) => (
            <motion.div key={s.label} variants={riseIn}>
              <Card className="h-full p-5">
                <p className="text-[12px] text-ink-faint">{s.label}</p>
                <div className="mt-2 flex items-baseline gap-2">
                  <span className="font-display text-[32px] leading-none font-extrabold tracking-tighter">
                    {s.value}
                  </span>
                  <span
                    className={cn(
                      "font-mono text-[11px]",
                      s.delta.startsWith("▲") ? "text-moss" : "text-ember",
                    )}
                  >
                    {s.delta}
                  </span>
                </div>
                <p className="mt-2 text-[12px] leading-snug text-ink-soft">{s.note}</p>
              </Card>
            </motion.div>
          ))}

          <motion.div variants={riseIn} className="lg:col-span-2">
            <Card className="h-full p-5">
              <div className="flex items-baseline justify-between gap-3">
                <div>
                  <Eyebrow>Performance</Eyebrow>
                  <h2 className="mt-1.5 text-[19px] font-bold">Your trajectory</h2>
                </div>
                <Badge tone="smoke">unlabeled</Badge>
              </div>
              <Squiggle seed={`${daily.key}::traj`} />
              <p className="mt-2 font-mono text-[10.5px] text-ink-faint">
                this line is genuinely random · it means nothing · it regenerates daily
              </p>
            </Card>
          </motion.div>

          <motion.div variants={riseIn}>
            <Card className="flex h-full flex-col p-5">
              <Eyebrow>Your vibes</Eyebrow>
              <div className="mt-3 flex flex-1 flex-wrap content-start gap-1.5">
                {displayVibes.length ? (
                  displayVibes.map((v) => (
                    <span
                      key={v}
                      className="rounded-full bg-surface-2 px-2.5 py-1 text-[11.5px] text-ink-soft"
                    >
                      {v}
                    </span>
                  ))
                ) : (
                  <p className="text-[13px] text-ink-faint">
                    You selected none. We&apos;ve assigned you &ldquo;neutral&rdquo;, which
                    is worse.
                  </p>
                )}
              </div>
              <p className="mt-4 border-t border-line pt-3 font-mono text-[10.5px] text-ink-faint">
                used for personalization · personalization not implemented
              </p>
            </Card>
          </motion.div>
        </motion.div>
      )}

      {tab === "Live Ops" && (
        <motion.div
          variants={stagger()}
          initial="hidden"
          animate="show"
          className="grid gap-4 lg:grid-cols-3"
        >
          <motion.div variants={riseIn}>
            <VibeMeter />
          </motion.div>
          <motion.div variants={riseIn}>
            <DistractionCounter />
          </motion.div>
          <motion.div variants={riseIn}>
            <PanicButton />
          </motion.div>
          <motion.div variants={riseIn} className="lg:col-span-2">
            <LiveCodeGenerator />
          </motion.div>
          <motion.div variants={riseIn}>
            <VoidButton />
          </motion.div>
          <motion.div variants={riseIn} className="lg:col-span-3">
            <ScreenTimeSlider />
          </motion.div>
        </motion.div>
      )}

      {tab === "Achievements" && (
        <motion.div
          variants={stagger()}
          initial="hidden"
          animate="show"
          className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3"
        >
          {ACHIEVEMENTS.map((a) => {
            const has = unlocked.includes(a.id);
            const hidden = a.secret && !has;
            return (
              <motion.div key={a.id} variants={riseIn}>
                <Card
                  className={cn(
                    "flex h-full items-start gap-3 p-4 transition-colors",
                    has ? "border-ember/40 bg-ember-wash" : "opacity-70",
                  )}
                >
                  <span
                    className={cn(
                      "grid size-10 shrink-0 place-items-center rounded-xl text-[19px]",
                      has ? "bg-surface" : "bg-surface-2 grayscale",
                    )}
                    aria-hidden
                  >
                    {hidden ? "🔒" : a.emoji}
                  </span>
                  <div className="min-w-0">
                    <p className="text-[13.5px] font-bold">{hidden ? "???" : a.name}</p>
                    <p className="mt-0.5 text-[12px] leading-snug text-ink-soft">
                      {hidden ? "Hidden. Keep clicking things." : a.desc}
                    </p>
                    {has && (
                      <p className="mt-1.5 font-mono text-[10px] tracking-wider text-ember uppercase">
                        Unlocked
                      </p>
                    )}
                  </div>
                </Card>
              </motion.div>
            );
          })}
        </motion.div>
      )}

      {tab === "Insights" && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
          <Card className="p-8 text-center sm:p-14">
            <p className="text-[44px]" aria-hidden>
              📭
            </p>
            <h2 className="mt-4 text-[22px]">No insights yet</h2>
            <p className="mx-auto mt-3 max-w-sm text-[14px] leading-relaxed text-ink-soft">
              Insights appear after 30 days of activity. Activity appears after
              insights. We are aware of the ordering problem and have scheduled a
              meeting.
            </p>
            <div className="mt-7 flex flex-col justify-center gap-3 sm:flex-row">
              <Link href="/contribute">
                <Button variant="secondary">Write your own insight</Button>
              </Link>
              <Link href="/changelog">
                <Button variant="ghost">Read the changelog</Button>
              </Link>
            </div>
          </Card>
        </motion.div>
      )}

      <KevinAside surface="dashboard" align="center" className="mt-8" />

      <p className="mt-3 text-center text-[12.5px] text-ink-faint">
        Nothing on this page is real, and none of it left your browser.{" "}
        <Link href="/contribute" className="text-ember underline-offset-2 hover:underline">
          Add a joke of your own →
        </Link>
      </p>
    </Container>
  );
}
