# User Flow — This Is Fine™

Every screen, every gag, and the reasoning behind the timing. This is the
reference for anyone editing the experience: if you change a beat, change it
here too.

The governing rule for the whole document: **the product is sincere.** Nothing
winks. The comedy comes from polished, confident UI behaving absurdly and never
acknowledging it. The single exception is the theme toggle, which acknowledges
itself exactly once and then never again.

---

## Map

```
                          ┌──────────────────┐
                          │   Landing  /     │
                          └────────┬─────────┘
                                   │ "Get started free" (dodges once)
                                   ▼
   ┌───────────────────────────────────────────────────────────┐
   │  /signup — progress bar claims 3 steps                     │
   │                                                            │
   │  1. Your details    name · age · email · password          │
   │  2. Verify email    6 digits, none of them checked         │
   │  3. Personalize     vibe multi-select                      │
   │        └── finishing step 3 REVEALS step 4 ────────┐       │
   │  4. One more thing  trust slider that recoils      │       │
   └───────────────────────────────┬────────────────────┴───────┘
                                   │
                                   ▼
                    ┌──────────────────────────┐
                    │  Processing (uncounted)  │
                    │  6–9 dealt status lines  │
                    └────────────┬─────────────┘
                                 ▼
                    ┌──────────────────────────┐
                    │  /dashboard — confetti   │
                    │  "You are user #10M"     │
                    └──────────────────────────┘

  Always present:  status ticker · inverted theme toggle · sound toggle
                   cookie banner (escalates) · Kevin (chat + every page)
                   ambient toasts every 40–75s

  Side routes:     /contribute → /admin → /hall-of-cringe
                   /changelog · 404 (rotating excuse)
```

---

## 1. Landing (`/`)

### Status ticker — above the nav

A thin scrolling marquee of fake telemetry: incident ID, uptime percentage,
deploy count, rollback count (often higher than deploys), p99 latency,
`engineers awake: 0`, `kevin: typing`. All date-seeded. Edges are feathered so
text never hard-clips.

### Hero

| Element | Behavior |
| --- | --- |
| **Roast pill** | Shows the roast of the day (same for everyone). **Clickable** — deals a fresh roast from the 55-entry bag. Click 55 times before a repeat. |
| **Headline** | "Everything is fine and we have the dashboard to prove it." The word *fine* gets a highlight bar that wipes in at 0.55s. |
| **Primary CTA** | Dodges the cursor **once**, then behaves forever. See below. |
| **Live counter** | Starts at 10,000,000, ticks irregularly (0.9–3.5s), and **loses users 22% of the time**. The dips are what sell it. |
| **Outage banner** | "We are aware of an issue affecting nothing." Expandable to a status update. Dismissible. |
| **App mock** | A fake product screenshot built in DOM/SVG, not an image. The chart inside is a genuine random walk, reseeded daily. |

#### The dodging CTA — why *once*

On `mouseenter` the button springs 86–130px sideways, tilts, and returns after
280ms. Then a toast: *"Sorry — reflex."* From that point it is a completely
normal button.

A button that dodges forever is a hostile puzzle. A button that dodges once is
a joke that resolves in under a second and then gets out of the way.

- **Touch:** first tap is the dodge, second tap navigates.
- **Keyboard:** bypasses the dodge entirely and awards the **Fast Hands**
  achievement. This is the accessible path, framed as a reward rather than a
  shortcut.

### "Today only" board

Six date-seeded cards: system status %, word of the day, User of the Day, and
the site's mood (which shifts the accent hue document-wide). Same for everyone
on a given day, different tomorrow — that's what makes it a shared bit.

### Features, pricing, testimonials

- **Features** — hovering any card deals a fresh roast from a 50-entry pool.
  All cards share one deck, so moving between them never repeats.
- **Pricing** — three tiers, identical features. The annual toggle saves 0% and
  says so. Footer admits: *"The tiers are for your emotional benefit."*
- **Testimonials** — 6 of 50, dealt fresh per visit. Reload and it's different
  people. Logo wall rotates independently, captioned *"none of these are real ·
  neither is the trust."*

### Bottom of page

A sentinel that awards **Completionist** for scrolling all the way down, and
admits there is nothing there.

---

## 2. Signup (`/signup`)

### The structural joke: the hidden step

The progress bar shows **3 steps**. Completing step 3 makes a fourth segment
slide in from the right while the bar walks backwards from 100% to 75%, and the
step count animates with a scale pop.

The animation is load-bearing. An instant re-render reads as a bug; a segment
that visibly *arrives* reads as a decision. A toast follows at 700ms: *"One
additional step has been added to your onboarding. It was always there. You just
couldn't see it."*

Processing sits **outside** the counted steps, so the bar can honestly reach
100% before the flow continues anyway.

### Step 1 — Your details

Every field rejects you. Two rules make this land instead of reading as noise:

1. **The message reacts to what you typed.** Digits get a line about digits.
   ALL CAPS gets a line about volume. `admin` gets *"Nice try."* Long names get
   a line about commitment length.
2. **The same input always gives the same message**, because the message is
   seeded by the input itself. If it reshuffled per keystroke, people would see
   the randomizer and stop believing the premise.

| Field | Behavior |
| --- | --- |
| **Name** | 620ms "Checking availability…" spinner, *then* rejection. The delay implies a server that went and looked. 9 categories, ~70 lines. |
| **Age** | The original joke. Six brackets, each with its own lines. Suggests an alternative age, also taken. |
| **Email** | Accepted instantly. **2.1 seconds later** a deadpan aside arrives — *"Accepted. We've added you to seven lists. One of them is a newsletter."* The delay is the joke. |
| **Password** | Meter climbs honestly; commentary stays disappointed the whole way. At max length: *"This is more security than your data deserves. We're storing it in a spreadsheet."* |

Continue is gated only on *non-emptiness* — everything is permanently invalid,
so requiring validity would trap the user. Footer: *"All fields are required.
All fields are also wrong."*

**Achievement:** 10 distinct rejected names in one sitting → **Persistent**.

### Step 2 — Verify email

Nothing was sent. Any six digits work.

The comedy is entirely in the fake validation — a multi-beat check with
escalating status text that has no business taking this long:

```
Contacting mail server
Mail server contacted
Mail server has no record of this
Checking code against expected value
Expected value not found
Approving anyway          ← lands after a deliberately longer 1100ms pause
```

Idle helper text is honest about it: *"Any six digits will work. We want to be
clear that we are not checking. We just like the ritual."* Resend re-not-sends
it.

### Step 3 — Personalize

24 vibes, multi-select, emoji pops and rotates on selection. Skippable. Counter
reacts: 0 selected → *"nothing selected · a vibe in itself"*; 6+ → *"that's a
lot of vibe for one person."*

### Step 4 — The trust slider (revealed)

Drag past ~55% and, **on release**, the slider claws back a third of the excess
and the card flinches.

Recoiling on release rather than during the drag is the whole design — fighting
someone's finger mid-gesture feels broken, but flinching *after* they let go
reads as a reaction. And because it only takes back a third, pushing harder
genuinely works.

17 reaction thresholds, escalating from *"Healthy. Correct, even."* through
*"You don't know us"* to *"Nobody has ever gone this far. We don't have copy for
this."*

**Three determined shoves to 100 and it gives up:** *"fine. it's yours. we've
stopped resisting."* A joke you can't win is just an obstacle.

**Achievements:** slider at 100 → **Dangerously Trusting**; at 0 → **Zero
Trust**.

### Processing screen

6–9 status lines dealt from a 75-entry bag, so a second run through signup shows
a completely different sequence. Each line dwells 600–1500ms.

The progress bar is deliberately dishonest — sprints to 80%, stalls, finishes in
a rush. That's what every real progress bar does and what no fake one bothers to
imitate. Caption: *"please do not close this tab · it will not matter either
way."*

---

## 3. Dashboard (`/dashboard`)

Confetti fires once from two low corners (not the centre — reads as celebration,
not a screen wipe). Suppressed under `prefers-reduced-motion`.

**"You are user #10,000,000."** Always. For everyone. That's the joke, and
nothing on the page acknowledges it.

- **Overview** — 4 stats dealt from 40 (*Blast Radius*, *Meeting Residue*,
  *Kevin Response Time: no sample has completed*), plus a chart openly labelled
  *"this line is genuinely random · it means nothing · it regenerates daily."*
- **Achievements** — 14 total, 1 earned. Secret ones show as `???` until
  unlocked.
- **Insights** — empty state: *"Insights appear after 30 days of activity.
  Activity appears after insights. We are aware of the ordering problem and have
  scheduled a meeting."*

Footer, sincerely: *"Nothing on this page is real, and none of it left your
browser."*

---

## 4. Always-on gags

### Inverted theme toggle

A two-segment control. **The segment labelled "Dark" applies light. The segment
labelled "Light" applies dark.** The active pill follows the *label*, never the
reality — so on a pitch-black page, "Light" is highlighted, and the
contradiction sits in the chrome where you can't miss it.

The inversion is total and consistent, handled by exactly one function. A joke
that fires intermittently reads as a bug; one that never wavers reads as a
decision.

Acknowledged **once, ever**: *"Yeah, we know. That's the point. The labels are
correct; reality is the thing that's wrong."* Clicking both labels unlocks **You
Noticed**. An inline script applies the stored theme before first paint, so the
inversion never flashes on reload.

### Cookie banner — escalating

Eight stages, each triggered by rejection. It comes back **faster** each round
(2400ms shrinking toward 700ms), tilts a little further, and the reject button
quietly fades. By stage six it has stopped capitalizing. By stage seven it is
just `🍪 / please`.

Stage eight it gracefully gives up and never returns. **Accepting ends it
immediately at any stage** — the bit only runs on people who say no, because
punishing someone who complied would be a different, meaner joke.

**Achievement:** reaching the end → **Principled**.

### Kevin

The running gag. Support agent. Permanently typing.

Everything else on this site is engineered never to repeat. Kevin is the
deliberate exception — he appears on **every page**: hero, daily board,
features, pricing, testimonials, page bottom, signup, dashboard, contribute,
hall, changelog, and 404.

His *line* still varies (18 asides, dealt) — it's his **presence** that repeats.
Repetition of a fact reads as a bit; repetition of a sentence reads as a bug.

Opening the chat: he sends exactly one opener, then types forever. The status
line beneath walks a scripted 52-beat narrative — *"Kevin deleted what he
wrote" → "Kevin is asking a colleague" → "Kevin's colleague has also started
typing" → "Kevin has escalated this to Kevin"* — at 5–9s per beat, because the
humor is in the duration, not the wording.

This is the one sequence on the site that is **not** shuffled. It's a narrative;
the beats only work in order.

**Achievement:** Kevin on 5 different pages → **Kevin Everywhere**. Waiting
through 10 status beats → **Waiting On Kevin**.

### Ambient toasts

First at ~22s, then every 40–75s. Never on `/admin` (not part of the bit) or
`/signup` (the flow has its own timing and a toast landing mid-joke steps on
it). Dealt from 52, deck persists across route changes.

### Sound

Off by default — autoplaying audio at a stranger is a hostile act even here.
Synthesized with WebAudio (no files). Muting awards **Silence**.

### Boring Mode™

`prefers-reduced-motion` is respected throughout the CSS. Detected once:
*"Boring Mode™ enabled. All jokes still included, now delivered standing
perfectly still."* Nobody gets a lesser version as a punchline.

### 404

Rotating excuse from 52, date-seeded. *"This page is fine. It's just not here.
Those are different."* Awards **Lost**. Offers a link to write tomorrow's excuse.

---

## 5. Contribution flow

### Track 1 — `/contribute` (no code)

1. **Pick a type** — 8 options, each with a hint about the voice.
2. **Write it** — 180 chars. The preview shows the **sanitized** value, so
   typing markup shows it neutered immediately. That explains the rule better
   than help text would.
3. **Pick a trigger** — submit / hover / random / daily rotation.
4. **Take credit** — optional handle, shown in the Hall of Cringe.

**Live preview** renders the text inside the *actual component* it would appear
in — a real error field, a real toast, a real 404 block.

> **Safety invariant.** Contributor text is **content, never code.** It fills a
> template string and is placed as a JSX child, which React escapes by
> construction. No `dangerouslySetInnerHTML`, no interpolation into
> `href`/`src`/`style`, no `eval`. `sanitize.ts` additionally strips angle
> brackets, control characters, invisible/bidi Unicode, and dangerous URL
> schemes before storage. Then a human still has to approve it.

**Pending board** — public upvoting. Votes only reorder what a reviewer sees
first; they never approve anything. That's why one-vote-per-browser is enough
policing. Labelled honestly: *"votes only change review order · a human still
decides."*

Rate limited to 5 submissions/min. Awards **Made It Worse**; voting awards
**Democracy**.

### Track 2 — GitHub

Standard fork → branch → PR. No CLA, no template, no bot. Best first PRs: new
content in `src/lib/content.ts` (plain arrays), a new gag, or an accessibility
fix.

### `/admin` — review queue

Password-gated, HMAC-signed httpOnly session, 8h expiry, 6 attempts / 5 min.
**Fail-closed in production**: if `ADMIN_PASSWORD` is unset on a real
deployment, every login is refused rather than falling back to the default
published in this repo's own `.env.example`.

Deliberately plain — this page is **not part of the joke**. Someone deciding
what a stranger's text does to the live site shouldn't have to squint through a
bit. Each row renders through the *same* `PreviewSurface` the contributor saw,
so what you approve is literally what ships. Admin edits go through the same
sanitizer (trusted reviewer, untrusted clipboard).

Approved items merge into the same pool the daily rotator reads — a community
line is indistinguishable from a built-in one. Contributors are in the actual
rotation, not a "community corner" at the bottom of the page.

### `/hall-of-cringe`

Contributors ranked by approved count, with titles nobody asked for:
Contributor → Committed → Repeat Offender → Senior Nuisance → Load-Bearing
Gremlin → Structural Liability.

---

## 6. Two systems worth understanding before editing

### Date-seeded daily content

A hash of `YYYY-MM-DD` drives a deterministic PRNG (xmur3 + mulberry32). Status
%, roast, word of the day, User of the Day, 404 excuse, incident ID, and site
mood all derive from it.

Everyone sees the same thing today and something different tomorrow. No cron, no
database, no storage. First render uses the **UTC** day so SSR and hydration
agree; the client swaps to the viewer's **local** day on mount, so the site
flips at your midnight.

### The shuffle bag (`lib/bag.ts`)

Nothing on this site picks randomly.

`Math.random()` over 50 items shows a duplicate within about **9 draws**
(birthday problem), and people notice duplicates far faster than they notice
randomness. So each pool is shuffled into a deck and dealt one card at a time,
reshuffling only when empty. **You see all 50 before you see any of them twice.**
The reshuffle also guarantees the last card of one deck isn't the first of the
next.

Verified against the real module: 50 draws → 50 distinct items, versus naive
`Math.random()` duplicating at draw 9.

**If you add content, add it in bulk.** Pool size is a feature, not decoration.

---

## Achievement reference

| Achievement | How |
| --- | --- |
| Signed Up | Complete onboarding (the only one most users get) |
| You Noticed | Click both theme labels |
| Fast Hands | Reach the CTA without triggering the dodge (keyboard) |
| Principled | Reject cookies to the bitter end |
| Waiting On Kevin | Sit through 10 chat status beats |
| Dangerously Trusting | Trust slider to 100 |
| Zero Trust | Trust slider to 0 |
| Made It Worse | Submit a joke |
| Democracy | Upvote a pending submission |
| Lost | Find the 404 |
| Silence | Mute the sounds |
| Kevin Everywhere | Notice Kevin on 5 different pages |
| Completionist | Scroll to the bottom of the landing page |
| Persistent | Get 10 different names rejected in one sitting |
