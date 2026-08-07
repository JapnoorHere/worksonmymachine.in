# PROJECT.md

**The canonical reference for This Is Fine™.** Everything the project contains
and every rule it is built under. If you change how something works, change it
here in the same commit — a stale entry here is worse than no entry.

> **Read the Non-Negotiables (§2) before touching anything.** The rest of this
> document explains *why* things are the way they are; that section is the part
> you are not free to break.

---

## Table of contents

1. [What this is](#1-what-this-is)
2. [Non-negotiables](#2-non-negotiables)
3. [Voice & comedy rules](#3-voice--comedy-rules)
4. [Design system](#4-design-system)
5. [Architecture](#5-architecture)
6. [Core systems](#6-core-systems)
7. [Feature walkthrough](#7-feature-walkthrough)
8. [Contribution pipeline](#8-contribution-pipeline)
9. [Security rules](#9-security-rules)
10. [Accessibility rules](#10-accessibility-rules)
11. [Engineering conventions](#11-engineering-conventions)
12. [Git & workflow rules](#12-git--workflow-rules)
13. [Environment & deployment](#13-environment--deployment)
14. [Local dev gotchas](#14-local-dev-gotchas)
15. [Verification checklist](#15-verification-checklist)
16. [Achievement reference](#16-achievement-reference)
17. [Maintaining this document](#17-maintaining-this-document)

---

## 1. What this is

A satirical fake SaaS. Every screen looks like a real, well-funded product —
deliberate typography, spring-based motion, working focus rings, full
responsiveness — and then behaves absurdly, completely straight-faced.

The governing idea: **the humor comes from the contrast.** Polished, sincere UI
undercut by ridiculous behavior that the product never acknowledges. If the
design gets sloppy, the joke stops working, because "bad website" is a
different and much worse joke than "immaculate website run by gremlins."

- **Live:** worksonmymachine.in
- **Repo:** https://github.com/JapnoorHere/worksonmymachine.in
- **Company fiction:** Works On My Machine, Inc.
- **License:** MIT

### Goals, in priority order

1. Genuinely fun to click through — motion and timing over cleverness of wording
2. Alive day to day, so repeat visits have a reason
3. Open source with a contribution path that does not require code

---

## 2. Non-negotiables

These are not style preferences. Breaking any of them breaks the project.

| # | Rule | Why |
| --- | --- | --- |
| **N1** | **Contributor text is content, never code.** Never `dangerouslySetInnerHTML`, never interpolated into `href`/`src`/`style`, never `eval`. | A stranger's text goes in front of every visitor. See §9. |
| **N2** | **Every submission passes through a human.** No auto-approve, ever. Votes reorder review; they never publish. | Same reason. |
| **N3** | **`ADMIN_PASSWORD` fail-closed in production.** Unset means every login is refused, never a default. | The default is published in this repo's own `.env.example`. |
| **N4** | **Accessibility is not optional.** Real focus rings, keyboard path through every interaction, `prefers-reduced-motion` honoured, live regions on updating content. | A joke site nobody can use is just a broken site. |
| **N5** | **Rotating pools hold 50+ entries and are dealt, not picked.** | See §6.2. Duplicates are the moment people stop believing the site is alive. |
| **N6** | **Nothing winks.** No "lol", no "just kidding", no self-aware aside. One deliberate exception (§7.4). | The premise dies the instant the site admits it's joking. |
| **N7** | **Never punch at identity.** Target software, companies, corporate process, or relatable minor failures. | Non-negotiable regardless of how funny the line is. |
| **N8** | **Never run `next build` into `.next` while `next dev` is running.** | See §14. Produces a cascade of misleading errors. |

---

## 3. Voice & comedy rules

### The voice

Deadpan corporate sincerity. The product believes in itself completely.

- **Specific beats general.** "Your cursor movement suggests hesitation. We've
  logged it." lands. "haha you are bad at computers" does not.
- **Understate.** "We are aware of an issue affecting nothing" beats any
  exclamation mark.
- **Never explain the joke.** No line should reference the fact that a line is a
  joke.
- **Punch correctly.** Software, companies, corporate ritual, and the reader's
  small relatable failures. Never identity. (N7)

### Comedic timing rules

Timing is the medium here. These delays are tuned, not arbitrary — change them
only deliberately.

| Beat | Timing | Why |
| --- | --- | --- |
| Name "checking availability" | 620ms before rejection | Instant rejection reads as client-side validation. A spinner implies a server went and looked. |
| Email aside | 2100ms after acceptance | The field accepts you, *then* reconsiders out loud. The gap is the joke. |
| "Approving anyway" | 1100ms (other beats 520–940ms) | The irregular longer pause makes the punchline land. |
| CTA dodge | once, 280ms return | Dodging forever is a hostile puzzle. Once is a joke that resolves and gets out of the way. |
| Trust recoil | on release, not during drag | Fighting a finger mid-gesture feels broken. Flinching after reads as a reaction. |
| Kevin status beats | 5–9s each | The humor is duration, not wording. Speed it up and it reads as a gimmick. |
| Ambient toasts | first ~22s, then 40–75s | A gag on a metronome stops surprising by the third repetition. |
| Cookie banner return | 2400ms shrinking to 700ms | Accelerating return reads as losing composure, not following a schedule. |

### Rules for jokes that involve the user losing

- **Always winnable.** The trust slider gives up after three shoves. The CTA
  dodges once. A joke you can't win is an obstacle.
- **Compliance ends the bit.** Accepting cookies stops the escalation
  immediately at any stage. Punishing someone who complied is a meaner,
  different joke.
- **Never trap.** Signup's continue button gates on non-emptiness only, because
  every field is permanently "invalid."

---

## 4. Design system

Committed identity — do not drift toward the generic purple-gradient SaaS
template.

### Palette

Warm paper and soot, signal-orange primary, moss secondary. Never pure black
shadows (they're warm-tinted).

| Token | Light | Dark |
| --- | --- | --- |
| `--tif-bg` | `#faf6f0` | `#0e0c0a` |
| `--tif-surface` | `#ffffff` | `#171310` |
| `--tif-ink` | `#17130d` | `#f7f1e8` |
| `--tif-ember` (primary) | `#e8410b` | `#ff6134` |
| `--tif-moss` (secondary) | `#4f7a2e` | `#9dc46a` |
| `--tif-smoke` | `#5b6b74` | `#93a8b2` |
| `--tif-warn` | `#b3730a` | `#e0a53c` |

**Theming rule:** define the full light palette on bare `:root`; redefine only
what changes under `@media (prefers-color-scheme: dark)` guarded as
`:root:not([data-theme="light"])`, and again under `:root[data-theme="dark"]` so
the toggle wins in both directions. Never give a color its only definition
inside a media or attribute block.

Tailwind v4 maps these via `@theme inline` in `globals.css` — use semantic
classes (`bg-surface`, `text-ink-soft`) and never raw hex in components.

### Typography

| Role | Font | Usage |
| --- | --- | --- |
| Display | **Bricolage Grotesque** | Headings, stat numbers, logo. `tracking-[-0.028em]`, `line-height: 1.05` |
| Body | **DM Sans** | All prose |
| Mono | **JetBrains Mono** | Incident IDs, telemetry, timestamps, captions |

Headings use `text-wrap: balance`, paragraphs `text-wrap: pretty`. Fluid sizing
via `clamp()`. Never a default system font stack.

### Motion

All springs, no linear. Shared vocabulary in `lib/motion.ts`:

| Name | Use |
| --- | --- |
| `bouncy` | Overshoot — pills, icon flips, achievement pops |
| `snappy` | Buttons, toasts, field messages — fast, minimal overshoot |
| `gentle` | Panels, step transitions, layout shifts |
| `heavy` | Modals, weighty landings |
| `recoil` | The trust slider flinch |

Buttons must have real physicality: `whileHover={{ y: -1.5 }}`,
`whileTap={{ scale: 0.965 }}`, plus shadow shift. Color-only hover states are
not enough — a button that feels good to press is a button people press again
after it lies to them.

### Layout rules

- Content measure: `max-w-6xl` via `<Container>`
- Rounded corners intentionally, not everywhere: `14px` cards, `10px` inputs,
  `full` pills
- Exactly one gradient on the landing page (the hero bloom), and it earns its
  place by pulling the eye to the first line of copy
- Avoid centered-everything; the features grid and pricing use asymmetry

### Sound

Synthesized with WebAudio, no asset files. **Off by default** — autoplaying
audio at a stranger is hostile even here. Short, quiet, muteable.

---

## 5. Architecture

**Stack:** Next.js 15 (App Router) · TypeScript (strict) · Tailwind CSS v4 ·
Framer Motion · MongoDB via Mongoose

```
PROJECT.md                 ← you are here; the canonical reference
README.md                  ← public-facing, written in the site's voice
scripts/clean.mjs          ← removes all build artifacts

src/
├── app/
│   ├── layout.tsx         Fonts, providers, persistent chrome
│   ├── globals.css        Tokens, base layer, utilities, Boring Mode
│   ├── page.tsx           Landing
│   ├── signup/            The six-step set piece
│   ├── dashboard/         The payoff
│   ├── contribute/        Submission form + live preview
│   ├── admin/             Review queue (password-gated, not part of the joke)
│   ├── hall-of-cringe/    Contributor credits
│   ├── changelog/         In-voice release notes
│   ├── not-found.tsx      Rotating 404 excuse
│   └── api/
│       ├── content/       GET approved community pools
│       ├── submissions/   POST submit · GET pending · vote/
│       ├── admin/         login/ · submissions/ (approve, reject, edit)
│       └── hall/          GET contributor stats
│
├── components/
│   ├── providers/         Theme · Sound · Toast · Achievement · Daily
│   ├── ui/                Button · Field · Card · Badge · Container
│   ├── landing/           Hero · DodgingCTA · LiveCounter · AppMock · …
│   ├── signup/            SignupFlow + Step* components
│   ├── dashboard/         Dashboard · Squiggle
│   ├── contribute/        ContributeForm · PreviewSurface · PendingBoard
│   ├── admin/             AdminQueue
│   ├── hall/              HallOfCringe
│   └── gags/              CookieBanner · ChatWidget · KevinAside · …
│
└── lib/
    ├── seed.ts            Date-seeded PRNG (xmur3 + mulberry32)
    ├── bag.ts             Shuffle-bag dealer (anti-repetition)
    ├── useDealt.ts        Hydration-safe React access to the bag
    ├── content.ts         EVERY joke, as plain data
    ├── daily.ts           Builds today's payload, merges community content
    ├── rejections.ts      The validation that never validates
    ├── sanitize.ts        Contributor input hygiene
    ├── submissions.ts     Repository: Mongo, or memory if no Mongo
    ├── adminAuth.ts       HMAC session handling
    ├── ratelimit.ts       In-memory speed bump
    ├── db.ts              Cached Mongoose connection
    ├── motion.ts          Shared spring vocabulary
    ├── storage.ts         localStorage that never throws
    └── models/            Mongoose schemas
```

### Provider order (matters)

```
ThemeProvider → SoundProvider → ToastProvider → AchievementProvider → DailyProvider
```

Toasts need sound; achievements need toasts. Theme and daily are independent.

### Where things belong

| Adding… | Goes in |
| --- | --- |
| A new joke line | `lib/content.ts` — plain array, nothing else |
| A new rotating category | `lib/content.ts` + wire into `lib/daily.ts` |
| A new gag component | `components/gags/` |
| A reusable primitive | `components/ui/` |
| Anything touching contributor text | Must route through `lib/sanitize.ts` |

---

## 6. Core systems

### 6.1 Date-seeded daily content (`lib/seed.ts`, `lib/daily.ts`)

A hash of `YYYY-MM-DD` drives a deterministic PRNG (xmur3 → mulberry32).
Everyone sees the same absurd thing today, something different tomorrow. No
cron, no database, no storage.

Drives: status %, roast of the day, word of the day, User of the Day, 404
excuse, incident ID, site mood (which shifts accent hue document-wide).

**Hydration rule:** first render uses the **UTC** day so server and client agree
byte-for-byte; the client swaps to the viewer's **local** day on mount, so the
site flips at *your* midnight. Both updates happen after hydration, so neither
can mismatch.

### 6.2 The shuffle bag (`lib/bag.ts`)

**Nothing on this site picks randomly.**

`Math.random()` over 50 items shows a duplicate within about **9 draws**
(birthday problem), and people notice duplicates far faster than they notice
randomness. Each pool is shuffled into a deck and dealt one card at a time,
reshuffling only when empty. You see all 50 before you see any of them twice.
The reshuffle also guarantees the last card of one deck isn't the first of the
next.

Verified against the real module: 50 draws → 50 distinct; naive `Math.random()`
duplicated at draw 9.

**Rules:**
- Add content in bulk. Pool size is a feature, not decoration. (N5)
- Deck keys are shared deliberately — all feature cards share `hover-roasts`, so
  moving between them never repeats.
- In React, use `useDealt.ts` (deals in an effect after hydration), never deal
  during render.
- **Exception:** `KEVIN_STATUSES` is walked in order, not shuffled. It's a
  narrative — "Kevin deleted what he wrote" only works after "Kevin is typing."

### 6.3 Kevin — the running gag

Everything else is engineered never to repeat. Kevin is the deliberate
exception, appearing on **every page**: hero, daily board, features, pricing,
testimonials, page bottom, signup, dashboard, contribute, hall, changelog, 404.

His *line* varies (18 asides, dealt). His **presence** repeats. Repetition of a
fact reads as a bit; repetition of a sentence reads as a bug.

**Rule:** any new page gets a `<KevinAside surface="unique-name" />`. The
surface name must be unique — it keys both the deck and the Kevin Everywhere
achievement.

### 6.4 Data layer (`lib/submissions.ts`)

Two backends behind one interface: MongoDB when `MONGODB_URI` is set, an
in-process array when it isn't. Nothing upstream knows or cares which it got.

**Rule:** "no database" is a normal state, never an error. Someone cloning the
repo to laugh at it for ten minutes should not have to stand up Mongo first.

---

## 7. Feature walkthrough

### Flow map

```
Landing / ──"Get started free" (dodges once)──► /signup
                                                  │
   1. Your details    name · age · email · password
   2. Verify email    6 digits, none of them checked
   3. Personalize     vibe multi-select
         └── finishing step 3 REVEALS step 4
   4. One more thing  trust slider that recoils
                                                  │
                              Processing (uncounted, 6–9 dealt lines)
                                                  ▼
                                            /dashboard — confetti,
                                            "You are user #10,000,000"

Always on: status ticker · inverted theme toggle · sound toggle
           cookie banner (escalates) · Kevin · ambient toasts
Side routes: /contribute → /admin → /hall-of-cringe · /changelog · 404
```

### 7.1 Landing

| Element | Behavior |
| --- | --- |
| **Status ticker** | Marquee of fake telemetry above the nav. Rollbacks often exceed deploys. `engineers awake: 0`. |
| **Roast pill** | Roast of the day, **clickable** to deal a fresh one from 55. |
| **Dodging CTA** | Springs 86–130px sideways on first `mouseenter`, returns after 280ms, then behaves forever. Touch: first tap dodges. **Keyboard bypasses entirely** and earns *Fast Hands* — the accessible path framed as a reward. |
| **Live counter** | Starts at 10,000,000, ticks irregularly, **loses users 22% of the time**. The dips sell it. |
| **Outage banner** | "We are aware of an issue affecting nothing." Expandable, dismissible. |
| **App mock** | Fake product screenshot in DOM/SVG, not an image. Chart is a genuine random walk, reseeded daily. |
| **Daily board** | Six date-seeded cards. Site mood shifts accent hue document-wide. |
| **Features** | Hover deals a fresh roast from 50; all cards share one deck. |
| **Pricing** | Three tiers, identical features. Annual saves 0% and says so. |
| **Testimonials** | 6 of 50 dealt per visit. Logos rotate independently: *"none of these are real · neither is the trust."* |
| **Bottom sentinel** | Awards *Completionist*, admits there's nothing there. |

### 7.2 Signup — the structural joke

The progress bar shows **3 steps**. Completing step 3 slides a fourth segment in
from the right while the bar walks backwards 100% → 75%.

The animation is load-bearing: an instant re-render reads as a bug, a segment
that visibly *arrives* reads as a decision. Processing sits **outside** the
counted steps so the bar can honestly hit 100% before the flow continues anyway.

**Step 1 — every field rejects you.** Two rules make this land:

1. The message reacts to what you typed (digits → a line about digits, ALL CAPS
   → a line about volume, `admin` → *"Nice try."*).
2. The same input always gives the same message, because it's seeded by the
   input itself. Reshuffling per keystroke would expose the randomizer.

Password meter climbs honestly; commentary stays disappointed the whole way.

**Step 2 — verification.** Nothing was sent, any six digits work. The comedy is
the fake validation walking six beats to "Approving anyway."

**Step 3 — vibes.** 24 options, multi-select, skippable.

**Step 4 — trust slider.** Past ~55%, on release, it claws back a third of the
excess and the card flinches. 17 escalating reactions. Three determined shoves
to 100 and it gives up: *"fine. it's yours. we've stopped resisting."*

**Processing.** 6–9 lines dealt from 75. Progress bar deliberately dishonest —
sprints to 80%, stalls, finishes in a rush.

### 7.3 Dashboard

Confetti from two low corners (not centre — celebration, not screen wipe),
suppressed under reduced motion. **"You are user #10,000,000."** Always. For
everyone. Nothing acknowledges it.

Tabs: Overview (4 stats dealt from 40, plus an openly-random chart),
Achievements (14 total, 1 earned), Insights (empty state about an ordering
problem). Footer, sincerely: *"Nothing on this page is real, and none of it left
your browser."*

### 7.4 The inverted theme toggle — the one acknowledged joke

**The segment labelled "Dark" applies light. The segment labelled "Light"
applies dark.** The active pill follows the *label*, never the reality — so on a
pitch-black page, "Light" is highlighted.

**Rule: the inversion is total and consistent**, handled by exactly one function
(`ThemeProvider.choose`). A joke that fires intermittently reads as a bug; one
that never wavers reads as a decision. Nothing else in the codebase is allowed
to think about it.

Acknowledged **once, ever** — the sole exception to N6: *"Yeah, we know. That's
the point. The labels are correct; reality is the thing that's wrong."* An
inline boot script applies the stored theme before first paint so the inversion
never flashes.

### 7.5 Cookie banner

Eight stages, each triggered by rejection. Returns faster each round
(2400ms → 700ms), tilts further, reject button fades. By stage six it stops
capitalizing; stage seven is `🍪 / please`; stage eight it gracefully gives up
forever.

**Accepting ends it immediately at any stage.** (See §3, compliance ends the
bit.)

### 7.6 Kevin's chat

One opener, then types forever. The status line walks a scripted 52-beat
narrative at 5–9s per beat. Not shuffled — see §6.2.

### 7.7 404

Rotating excuse from 52, date-seeded. Awards *Lost*. Links to write tomorrow's
excuse.

---

## 8. Contribution pipeline

### Track 1 — `/contribute` (no code, most contributors)

Structured form: type → text → trigger → optional handle. **Live preview renders
the text inside the actual component it would appear in.**

The preview shows the **sanitized** value, so typing markup shows it neutered
immediately — that explains the rule better than help text would.

**Pending board:** public upvoting. Votes only reorder what a reviewer sees
first; they never approve anything. That's why one-vote-per-browser is enough
policing — the worst outcome from cheating is a human reading your joke sooner
and still saying no. Labelled honestly.

Rate limited to 5 submissions/min.

### Track 2 — GitHub

Standard fork → branch → PR. No CLA, no template, no bot. Best first PRs: new
content in `lib/content.ts`, a new gag, or an accessibility fix.

### `/admin` — review queue

**Deliberately plain. This page is not part of the joke.** Someone deciding what
a stranger's text does to the live site shouldn't have to squint through a bit.

Each row renders through the *same* `PreviewSurface` the contributor saw, so
what you approve is literally what ships. Admin edits go through the same
sanitizer — trusted reviewer, untrusted clipboard.

Approved items merge into the same pool the daily rotator reads. **A community
line is indistinguishable from a built-in one** — contributors are in the actual
rotation, not a "community corner" at the bottom of the page.

### `/hall-of-cringe`

Ranked by approved count, with titles nobody asked for: Contributor → Committed
→ Repeat Offender → Senior Nuisance → Load-Bearing Gremlin → Structural
Liability.

---

## 9. Security rules

### The submission invariant (N1)

Contributor text is **content, never code**:

- It fills a template string and is placed as a **JSX child** — React escapes
  text nodes by construction
- Never `dangerouslySetInnerHTML`
- Never interpolated into `href`, `src`, `style`, or any URL
- Never `eval`, `Function`, or a dynamic import

`lib/sanitize.ts` is belt-and-braces on top, stripping before storage:
angle brackets · C0/C1 control characters · zero-width and bidi-override Unicode
(invisible in preview, so they could smuggle past a human reviewer) ·
`javascript:`/`data:`/`vbscript:`/`file:` schemes · whitespace runs.

Validation uses an **allow-list**, never a deny-list — an unknown `type` can
never reach the content pool.

**If you extend `PreviewSurface.tsx`, preserve this invariant.**

### Admin auth

Single shared password → HMAC-SHA256-signed, httpOnly, `sameSite=lax` cookie,
8h expiry. Timing-safe comparison. Rate limited to 6 attempts / 5 min.

**Fail-closed in production (N3):** unset `ADMIN_PASSWORD` refuses every login
rather than falling back to the dev default published in `.env.example`.

### Rate limiting

In-memory, per-process, therefore imperfect behind multiple instances. It's a
speed bump against paste-spam, not a security control. The real protection is
N2: a human approves everything.

---

## 10. Accessibility rules

Not optional (N4). Specifics:

- **Focus:** one visible `:focus-visible` ring everywhere (2px ember, 2px
  offset). Never remove it.
- **Keyboard:** every interaction reachable. The CTA dodge is mouse/touch-only
  by design — keyboard goes straight through and earns an achievement.
- **Reduced motion:** honoured globally in `globals.css`. Announced once as
  Boring Mode™, which contains *every* joke, delivered standing still. **Nobody
  gets a lesser version as a punchline.**
- **Live regions:** `aria-live="polite"` on toasts, processing status, Kevin's
  status, trust reactions.
- **Labels:** every input labelled; icon-only buttons carry `aria-label`.
  Decorative SVG is `aria-hidden`.
- **Contrast:** all text meets WCAG AA in both themes. The inverted toggle
  changes labels, never legibility.
- **Skip link** to `#main`.
- **No keyboard traps** — the mobile sheet and chat both close on their own
  controls.

---

## 11. Engineering conventions

### TypeScript
- `strict: true`. Avoid `any`; where a Mongoose lean doc forces it, isolate it
  behind a single mapper with an eslint-disable and a comment.
- Prefer `type` for unions, `interface` for object shapes.
- Derive types from data (`typeof CONTENT_TYPES[number]`) rather than restating.

### Comments
Explain **why**, never what. The bar: would a competent developer reading this
code wonder about it? Timing constants, comedic intent, hydration workarounds,
and safety invariants all get comments. Getters and obvious mappings don't.

### React
- Client components need `"use client"`; keep pages as server components and
  push interactivity into a child where practical.
- **Never deal from the shuffle bag or read `Date` during render** — SSR will
  mismatch. Use an effect (`useDealt.ts` handles this).
- Keys must be genuinely unique. Testimonials key on quote text, not name,
  because "Anonymous" repeats.

### Styling
- Semantic Tailwind tokens only (`bg-surface`, `text-ink-soft`). No raw hex in
  components.
- No `dark:` variants — tokens flip themselves (§4).

### Naming
- Components `PascalCase`, hooks `useThing`, libs `camelCase.ts`
- Storage keys prefixed `tif:`
- Bag deck keys are stable kebab strings (`hover-roasts`, `ambient-toasts`)

---

## 12. Git & workflow rules

### Attribution

**No Claude/Anthropic attribution on anything.** No `Co-Authored-By: Claude`, no
"Generated with Claude Code" footer, no contributor entry. Commits are authored
solely by the repo owner's git identity. Verify with:

```bash
git log -1 --format=%B | grep -iE "claude|anthropic|co-authored" && echo BAD || echo clean
```

### Commit messages

- Subject: imperative, ≤72 chars, no trailing period
- Body: explain **why**, and what was ruled out if it was a debugging commit
- One logical change per commit

### Push cadence

Commit and push **as work progresses**, not one big drop at the end. Standing
instruction from the repo owner.

### Branching

Work on `main` for this project unless a change is large or risky. Never force-push.

---

## 13. Environment & deployment

All variables optional locally; with none set the site runs end to end.

| Variable | Purpose | Required in prod |
| --- | --- | --- |
| `MONGODB_URI` | Submissions, approvals, credits | Recommended (else memory-only) |
| `ADMIN_PASSWORD` | Gates `/admin`. Dev default `thisisfine` | **Yes** — unset seals the queue (N3) |
| `ADMIN_SECRET` | Signs the admin session cookie | Recommended |
| `NEXT_DIST_DIR` | Overrides build output dir | No (local tooling only) |

Deploy: push to Vercel, set the three variables. Anywhere that runs Next.js works.

---

## 14. Local dev gotchas

Both are already handled in config; documented so nobody "fixes" them back.

### Dev runs on Turbopack

`npm run dev` uses `--turbopack`. The webpack dev server corrupted its own chunk
manifests on Windows, producing a rotating cast of errors that all pointed at
nothing real:

```
Cannot find module './611.js'
__webpack_modules__[moduleId] is not a function
ENOENT: routes-manifest.json
Cannot find module for page: /_document     ← there is no pages router here
```

Ruled out first: no circular imports (all 75 files under `src/` scanned), and
only one dev server running. Turbopack doesn't use that manifest, so the class
of error is gone. Cold start also dropped ~30s → ~2s. `npm run dev:webpack`
remains as an escape hatch.

### Never mix build outputs (N8)

Dev and production artifacts are not interchangeable. A `next build` into
`.next` while `next dev` is running leaves the dev server reading prod chunks it
can't resolve.

```bash
# Verification build — goes to .next-build, never touches dev
NEXT_DIST_DIR=.next-build npx next build     # bash
$env:NEXT_DIST_DIR=".next-build"; npx next build   # PowerShell
```

### When local state gets wedged

```bash
# stop the dev server FIRST — the script can't do it for you
npm run clean    # removes .next, .next-build, node_modules/.cache
npm run dev
```

### Workspace root

A stray `package-lock.json` in the parent folder makes Next infer the wrong
workspace root and breaks file tracing. `outputFileTracingRoot` is pinned in
`next.config.mjs` to compensate. Don't remove it.

---

## 15. Verification checklist

Run before any push that touches behavior.

```bash
npx tsc --noEmit                                    # must be silent
NEXT_DIST_DIR=.next-build npx next build            # must complete
npm run dev                                         # then smoke-test routes
```

| Check | Expected |
| --- | --- |
| Typecheck | Clean |
| Production build | All routes, no errors |
| Routes (cold **and** warm pass) | `/`, `/signup`, `/dashboard`, `/contribute`, `/admin`, `/changelog`, `/hall-of-cringe`, all `/api/*` → 200; unknown → 404 |
| Sanitizer | `<script>alert(1)</script>` stored as inert text |
| Admin auth | Unauthenticated `PATCH /api/admin/submissions` → 401 |
| Wrong password | → 401 |
| End-to-end | submit → login → approve → appears in `/api/content` |
| Shuffle bag | 50 draws → 50 distinct |
| Reduced motion | Site fully usable, Boring Mode notice fires |
| Mobile | 375px wide, no horizontal scroll |
| Keyboard | Tab through signup start to finish |

Smoke-test **twice** — cold compile can mask chunk problems that only appear
warm.

---

## 16. Achievement reference

| Achievement | How | Secret |
| --- | --- | --- |
| Signed Up | Complete onboarding (the only one most users get) | — |
| You Noticed | Click both theme labels | ✓ |
| Fast Hands | Reach the CTA without triggering the dodge (keyboard) | ✓ |
| Principled | Reject cookies to the bitter end | ✓ |
| Waiting On Kevin | Sit through 10 chat status beats | ✓ |
| Dangerously Trusting | Trust slider to 100 | ✓ |
| Zero Trust | Trust slider to 0 | ✓ |
| Made It Worse | Submit a joke | ✓ |
| Democracy | Upvote a pending submission | ✓ |
| Lost | Find the 404 | ✓ |
| Silence | Mute the sounds | ✓ |
| Kevin Everywhere | Notice Kevin on 5 different pages | ✓ |
| Completionist | Scroll to the bottom of the landing page | ✓ |
| Persistent | Get 10 different names rejected in one sitting | ✓ |

---

## 17. Maintaining this document

**This file is part of the deliverable, not documentation about it.** Update it
in the same commit as the change.

| When you… | Update |
| --- | --- |
| Add/change a feature or page | §7, and §5 if files moved |
| Change a timing constant | §3 timing table |
| Add a content pool | §6.2, confirm 50+ entries |
| Add an achievement | §16 |
| Add an env variable | §13 |
| Change anything about contributor input | §9 — and re-check N1 |
| Hit a new local-dev trap | §14, so nobody re-discovers it |
| Establish a new working rule | §11 or §12 |

If a rule here turns out to be wrong, **change the rule** — don't quietly work
around it and leave the stale entry behind.
