# This Is Fine™

**A fake SaaS that takes itself extremely seriously.**

Everything looks like a real product. The type is deliberate, the animations are
spring-based, the focus rings work, the whole thing is responsive. Then you use
it and the age field tells you that users with your age already exist.

That's the bit. Real design, unreal behavior, delivered completely straight.

🔥 **[worksonmymachine.in](https://worksonmymachine.in)**

---

## What's in it

**A signup flow that fights back.** Six steps of onboarding where every field
rejects you with a different, specific insult. Your name is taken. Your age is
taken. Your password is "technically strong" and our algorithm has never met
you. The verification code is unchecked — we just like the ritual.

**A dark mode toggle that lies.** The button labelled "Dark" turns on the
lights. The button labelled "Light" turns them off. This is not a bug. There is
a toast the first time that says so, once, and then never explains itself again.

**Content that changes daily.** The status percentage, the roast, the word of
the day, the User of the Day, the 404 excuse, the site's mood — all of it is
seeded from a hash of today's date. So everyone sees the same absurd thing on
the same day, and something different tomorrow. No cron. No database. Just
arithmetic.

**A support agent named Kevin.** Kevin is typing. Kevin has been typing for some
time. Kevin will continue to type.

**A cookie banner with a deteriorating emotional state.** It escalates each time
you reject it. By attempt six it has stopped capitalizing.

---

## Contributing

Two doors, both open.

### Door 1 — write a joke (no code)

Go to **[/contribute](https://worksonmymachine.in/contribute)**. Pick a type,
write your line, and watch it render *inside the actual component it would
appear in*. Submit. A human reads it. If it's good it joins the daily rotation
and you get a spot in the [Hall of Cringe](https://worksonmymachine.in/hall-of-cringe).

You don't need a GitHub account. You don't need to know what a pull request is.
This is the door most people should use.

**House style, if you want yours approved:**

- Deadpan. The product is sincere. Nothing winks.
- Specific beats general. "Your cursor movement suggests hesitation" lands;
  "haha you are bad at computers" does not.
- Never say "lol", never use "just kidding", never explain the joke.
- Punch at the software, the company, corporate process, or the user's
  relatable minor failures. Not at anyone's identity.

### Door 2 — build something (code)

Standard fork → branch → PR. No CLA, no issue template, no bot demanding you
fill in a form. Open a PR, I'll read it.

**Read [PROJECT.md](PROJECT.md) first.** It's the canonical reference — every
feature, every rule, the comedic timing constants and why they're set where they
are, the safety invariants around contributor input, and the local dev traps
that will otherwise eat an afternoon.

Good first PRs: new content in `src/lib/content.ts` (it's all plain arrays), a
new gag component, or an accessibility fix — those get merged fastest, because
the one genuinely non-negotiable rule here is that the joke site has to be
usable by everyone.

---

## Running it locally

```bash
git clone https://github.com/YOUR-USERNAME/this-is-fine.git
cd this-is-fine
npm install
npm run dev
```

Open [localhost:3000](http://localhost:3000). That's it — **no database
required**. Without a `MONGODB_URI` the submission queue transparently falls
back to an in-memory store that lives exactly as long as your dev server does,
which is fine for local work and openly wrong for production.

### Environment

Everything is optional. Copy `.env.example` to `.env.local` if you want any of it.

| Variable         | What it does                                                        |
| ---------------- | ------------------------------------------------------------------- |
| `MONGODB_URI`    | Persists submissions, approvals, and credits. Local or Atlas.        |
| `ADMIN_PASSWORD` | Gates `/admin`. Defaults to `thisisfine` in dev; **required** in prod. |
| `ADMIN_SECRET`   | Signs the admin session cookie. Any long random string.              |

⚠️ **On production, `ADMIN_PASSWORD` is mandatory.** If it's unset, `/admin`
refuses every login rather than falling back to a default that's published in
this repo's own `.env.example`. The review queue is the one part of this project
that isn't a joke — approving a submission puts a stranger's text in front of
every visitor.

---

## How it's built

Next.js 15 (App Router) · TypeScript · Tailwind CSS v4 · Framer Motion ·
MongoDB via Mongoose

> Full architecture, design system, and every rule this project runs under live
> in **[PROJECT.md](PROJECT.md)**. What follows is the short version.

```
src/
├── app/                      Routes and API handlers
│   ├── api/                  submissions · content · admin · hall
│   ├── signup/               The six-step set piece
│   ├── dashboard/            The payoff
│   ├── contribute/           Form + live preview
│   ├── admin/                Review queue (password-gated)
│   └── hall-of-cringe/       Credits
├── components/
│   ├── providers/            Theme · sound · toasts · achievements · daily
│   ├── landing/ signup/ dashboard/ contribute/ admin/ gags/
│   └── ui/                   Button · Field · Card · Badge
└── lib/
    ├── seed.ts               Date-seeded PRNG (xmur3 + mulberry32)
    ├── content.ts            Every joke, as plain data
    ├── daily.ts              Builds today's payload
    ├── rejections.ts         The validation that never validates
    ├── sanitize.ts           Contributor input hygiene
    └── submissions.ts        Mongo, or memory if there's no Mongo
```

### Two notes on the architecture

**The content pool is one array.** Built-in jokes and community-approved jokes
live in the same shape and get merged before rotation, so an approved
submission is indistinguishable from something I wrote. Contributors are in the
actual rotation, not a "community corner" at the bottom of the page.

**Contributor text is content, never code.** It fills a template string, it's
rendered as a React text node (which escapes by construction), and it never
touches `dangerouslySetInnerHTML`, a `style` attribute, or a URL. `sanitize.ts`
strips markup, control characters, invisible Unicode, and dangerous schemes
before anything is stored. Then a human still has to approve it.

### Accessibility

Not optional, even here. Real focus rings, keyboard paths through every
interaction (the CTA's dodge is mouse/touch-only — keyboard users go straight
through, and get an achievement for it), semantic landmarks, live regions on the
things that update, and full `prefers-reduced-motion` support. Reduced motion
gets Boring Mode™, which contains every joke, delivered standing perfectly
still.

---

## Deploying

Push to Vercel, set `MONGODB_URI` / `ADMIN_PASSWORD` / `ADMIN_SECRET`, done.
Anywhere that runs Next.js works.

---

## License

MIT. Do whatever you want with it.

If you fork this and make a better one, that's fine. Everything is fine.

---

<sub>© Works On My Machine, Inc. All rights reserved, and several reserved
twice. Unauthorized reproduction is encouraged but will be spoken about
unkindly.</sub>
