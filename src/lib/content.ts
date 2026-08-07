/**
 * THE CONTENT POOL
 *
 * Every joke on this site that isn't hard-wired into a component lives here as
 * plain data. The daily rotator reads from these arrays, and community
 * submissions approved in /admin get merged into the exact same shape at
 * runtime. One source of truth, two doors into it.
 *
 * POOL SIZE IS A FEATURE. Every rotating pool holds 50+ entries, and nothing
 * picks from them randomly — `lib/bag.ts` deals from a shuffled deck so you see
 * the whole pool before you see any entry twice. Random picking from 50 shows a
 * duplicate within ~9 draws, and a duplicate is the exact moment someone stops
 * believing the site is alive. If you add entries, add them in bulk.
 *
 * HOUSE STYLE, if you're contributing:
 *   - Deadpan. The product is sincere. Nothing winks.
 *   - Specific beats general. "Your cursor movement suggests hesitation" lands.
 *     "haha you are bad at computers" does not.
 *   - Never "lol", never "just kidding", never explain the joke.
 *   - Punch at the software, the company, corporate process, or the user's
 *     relatable minor failures. Never at anyone's identity.
 *
 * KEVIN is the running gag. He is support. He is always typing. He appears on
 * every page at least once, and that repetition is deliberate — he's the one
 * constant in a site engineered so nothing else ever repeats.
 */

export const CONTENT_TYPES = [
  "error",
  "loading",
  "achievement",
  "stat",
  "roast",
  "toast",
  "excuse",
  "buzzword",
] as const;

export type ContentType = (typeof CONTENT_TYPES)[number];

export const TRIGGERS = ["submit", "hover", "random", "daily"] as const;
export type Trigger = (typeof TRIGGERS)[number];

export const TYPE_LABELS: Record<ContentType, string> = {
  error: "Fake error message",
  loading: "Loading status text",
  achievement: "Achievement",
  stat: "Fake dashboard stat",
  roast: "Tooltip roast",
  toast: "Toast notification",
  excuse: "404 excuse",
  buzzword: "Word of the day",
};

export const TYPE_HINTS: Record<ContentType, string> = {
  error: "Shown in red under a form field. Should sound like a real validation rule.",
  loading: "One line in the fake processing screen. Present tense, technical, absurd.",
  achievement: "A thing the user 'unlocked'. Short and undeserved.",
  stat: "A number-shaped metric on the dashboard. Confident, meaningless.",
  roast: "Appears on hover. Brief. Personal. Unprompted.",
  toast: "Slides in from the corner uninvited. Sounds like a real system notice.",
  excuse: "Why the 404 page exists today. Blame something specific.",
  buzzword: 'Format: "Word — definition." Invent the word. Define it seriously.',
};

export const TRIGGER_LABELS: Record<Trigger, string> = {
  submit: "When a form is submitted",
  hover: "On hover / tap",
  random: "Randomly, whenever",
  daily: "Part of the daily rotation",
};

/* ========================================================================== */
/* NAME REJECTIONS — reacts to what you typed                                 */
/* ========================================================================== */

export const NAME_REJECTIONS = {
  short: [
    "That name is too efficient. Our servers find it suspicious.",
    "Names under three characters are reserved for people who joined in 2011.",
    "We support short names. We just don't respect them.",
    "“{name}” is taken by someone who also wanted to type as little as possible.",
    "Two characters. Bold. Unavailable, but bold.",
    "This name is held by a service account. The service was decommissioned. The account remains.",
    "Short names are premium. Premium is not a plan we offer.",
    "“{name}” is currently assigned to a load balancer.",
    "We tried to reserve this for you and the database laughed.",
  ],
  taken: [
    "“{name}” is taken. By you. In another life. It didn't go well.",
    "“{name}” is taken by someone with better posture.",
    "“{name}” is already registered to a user who last logged in 4 minutes ago and is, statistically, still here.",
    "“{name}” is unavailable. The previous holder is not deceased, merely disappointing.",
    "Someone named “{name}” already exists and frankly they got here first and they're nicer.",
    "“{name}” was claimed 0.3 seconds ago. We're not saying you were watched. We're saying you were beaten.",
    "“{name}” belongs to a user in a timezone we no longer acknowledge.",
    "“{name}” is taken. We checked twice. The second check was out of hope.",
    "This name is held in escrow pending a dispute nobody is pursuing.",
    "“{name}” exists in our system as a warning to others.",
    "There is a “{name}”. They have a profile picture. It is a landscape.",
    "“{name}” is reserved. Not for anyone. Just reserved.",
    "We found 1,204 users named “{name}”. All of them are more committed than you.",
    "“{name}” is taken by an account created in 2009 that has never posted.",
    "“{name}” conflicts with an internal variable. We could rename the variable. We won't.",
    "That name is taken by someone who spells it the same but means it differently.",
    "“{name}” is currently in use by a test fixture we are afraid to delete.",
    "“{name}” was available eleven seconds ago. You were reading the label.",
    "Taken. The holder has a support ticket open about it. So will you.",
    "“{name}” belongs to someone on a plan we discontinued and cannot contact.",
    "The name “{name}” is fine. The name “{name}” is also gone.",
    "“{name}” is taken by a user whose account we cannot access, close, or explain.",
    "Someone reserved “{name}” and immediately churned. Out of respect, we've kept it.",
    "“{name}” is taken. Consider that a kind of company.",
    "Occupied. The occupant has left a note. The note says “sorry”.",
    "“{name}” resolves to a user who exists only in our staging environment.",
    "“{name}” has been taken since before we had a database. We don't ask.",
    "Unavailable. We'd tell you who has it but they've asked us not to.",
    "“{name}” is taken by an account flagged as “probably a person”.",
    "That's a good name. It was a good name for them, too.",
  ],
  numbers: [
    "Numbers in a name suggest you have lost this argument before.",
    "“{name}” is taken. The digits didn't help. They never do.",
    "We've seen the numbers. We know what they mean. We're not going to say it.",
    "Appending digits is a strategy. It is not a winning one. “{name}” is taken.",
    "A number in a name is a memorial to a name you couldn't have.",
    "“{name}” is unavailable, and so are the next four numbers you were about to try.",
    "We support numerals. We do not endorse them.",
    "Taken. Have you considered a different, equally unavailable number?",
    "The digits were a nice touch. The nice touch is taken.",
  ],
  caps: [
    "All caps detected. Volume is not availability.",
    "“{name}” is taken and shouting won't unclaim it.",
    "We heard you. So did everyone. It's still taken.",
    "Capitalization does not affect uniqueness, only tone.",
    "“{name}” is taken in every case. We normalized it and it was still gone.",
    "That name is unavailable at any volume.",
    "Our system is case-insensitive. Our system is also unimpressed.",
  ],
  long: [
    "That name exceeds our recommended commitment length.",
    "“{name}” is taken, and honestly, it was a lot to type for nothing.",
    "Names this long are usually a cry for help. Also it's taken.",
    "We read the whole thing. We regret to inform you.",
    "This name will not fit in the avatar, the header, or the invoice. It is also taken.",
    "Long names are supported until the second line of the UI, where they are not.",
    "You've written a sentence. We needed a name. Both are taken.",
    "Our database accepted this. Our designer did not.",
  ],
  space: [
    "Multi-word names are taken as a category. All of them. Sorry.",
    "The space in “{name}” is taken. The rest is fine. We can't separate them.",
    "We support spaces. Spaces do not support us.",
    "“{name}” is taken by the same person under a slightly different spacing.",
    "Two words, two conflicts. Efficient, in a way.",
    "The whitespace has been claimed. Legally this is murky.",
  ],
  admin: [
    "Nice try.",
    "That name is reserved for someone who has read the documentation.",
    "This name is restricted to employees, of which there are none.",
    "Reserved. Not by policy. By instinct.",
    "We saw what you tried to do. It was the first thing everyone tries.",
    "This name is protected by a check written specifically because of people like you.",
    "Denied, and logged, and mentioned at standup.",
  ],
} as const;

/* ========================================================================== */
/* AGE REJECTIONS — the original joke                                          */
/* ========================================================================== */

export const AGE_REJECTIONS: { max: number; lines: string[] }[] = [
  {
    max: 12,
    lines: [
      "Users with this age already exist. They're at recess.",
      "This age is at capacity until approximately 3:15 PM.",
      "Age {age} is fully allocated and doing homework.",
      "We have {age}-year-olds. They're better at this than the adults.",
      "This age bracket requires a permission slip we cannot generate.",
      "Occupied. Try again after a growth spurt.",
    ],
  },
  {
    max: 17,
    lines: [
      "Users with this age already exist and they are much better at this than you.",
      "This age bracket is full. Try again after a birthday.",
      "Age {age} is taken by someone with significantly more free time.",
      "We're at quota for {age}. Have you considered {alt}?",
      "This age is reserved for people who will churn in four years.",
      "{age} is unavailable. Statistically, so is your evening.",
    ],
  },
  {
    max: 24,
    lines: [
      "Users with this age already exist. Several of them. All confident.",
      "We have enough {age}-year-olds. We ran the numbers. It's plenty.",
      "Age {age} reached capacity in 2019 and we never reopened it.",
      "{age} is taken by someone who just started a podcast.",
      "This age is currently oversubscribed and slightly smug.",
      "Age {age} is unavailable. The waitlist is also {age}.",
      "Taken. Would you accept {alt}? It's structurally similar.",
      "We're honoring {age} in spirit only.",
    ],
  },
  {
    max: 39,
    lines: [
      "Users with this age already exist and one of them is doing significantly better than you.",
      "Age {age} is currently allocated. Have you considered {alt}?",
      "This age is taken. Not by you. By the concept.",
      "{age} is unavailable. It's peak season for {age}.",
      "We have a {age}. They have a mortgage and opinions about mattresses.",
      "Age {age} is in use by someone who describes themselves as “heads-down right now”.",
      "This age is spoken for. It didn't say much.",
      "{age} is taken. So, quietly, is the decade around it.",
      "Occupied by a user who recently said “I'm getting too old for this” and meant it.",
      "We'd give you {age} but the {age} we have is already tired.",
    ],
  },
  {
    max: 64,
    lines: [
      "Users with this age already exist, and they have opinions about the interface.",
      "Age {age} is available on the enterprise plan only.",
      "We're honored. We're also full. Have you considered {alt}?",
      "{age} is taken by someone who has read the terms of service. All of them.",
      "This age is held by a user who still says “the internet”.",
      "Age {age} is reserved for people who remember what this used to cost.",
      "Taken. The holder has strong feelings about the redesign.",
      "{age} is in use and is asking why there are six steps.",
    ],
  },
  {
    max: 200,
    lines: [
      "Users with this age already exist, allegedly, and we've stopped asking questions.",
      "At {age}, you qualify for our legacy tier, which we deleted.",
      "This age exceeds our support window. So does everything else here.",
      "{age} is taken by a record we are contractually unable to delete.",
      "We have a user at {age}. We do not contact them. They contact us.",
      "Age {age} predates our logging. We assume the best.",
      "Congratulations on {age}. It's taken, but congratulations.",
    ],
  },
];

/* ========================================================================== */
/* PASSWORD METER — mocks you at every length                                  */
/* ========================================================================== */

export const PASSWORD_VERDICTS: {
  label: string;
  tone: string;
  notes: string[];
}[] = [
  {
    label: "Empty",
    tone: "faint",
    notes: [
      "Bold. Minimalist. Wrong.",
      "Nothing at all. We admire the confidence.",
      "The most memorable password you'll ever have.",
      "Technically the fastest to type.",
    ],
  },
  {
    label: "Weak",
    tone: "ember",
    notes: [
      "A determined child could guess this.",
      "We guessed it while you were typing it.",
      "This would survive roughly one curious coworker.",
      "Our threat model does not include effort this low.",
      "Somewhere, a security engineer just woke up.",
    ],
  },
  {
    label: "Also weak",
    tone: "ember",
    notes: [
      "Adding characters is not the same as adding thought.",
      "Longer. Still guessable. Impressive balance.",
      "You are approaching a bad password from a different direction.",
      "This is the password equivalent of hiding a key under the mat.",
      "We ran this through a dictionary. It was in there twice.",
    ],
  },
  {
    label: "Weak, but longer",
    tone: "warn",
    notes: [
      "Length without imagination is just endurance.",
      "You're padding. We can tell. It's fine. Everyone pads.",
      "This is a strong password wearing a weak password's habits.",
      "Statistically better. Spiritually the same.",
      "Now it takes eleven seconds instead of four.",
    ],
  },
  {
    label: "Technically strong",
    tone: "warn",
    notes: [
      "Our algorithm approves. Our algorithm has never met you.",
      "Strong by the metric. The metric is a number we chose.",
      "This would pass an audit conducted by us.",
      "Cryptographically fine. Behaviorally, you'll write it down.",
      "Good. Now you have to remember it, which is the actual test.",
    ],
  },
  {
    label: "Strong",
    tone: "moss",
    notes: [
      "Strong password. You will forget it by Thursday.",
      "Excellent. You'll reset this after one failed login.",
      "This is genuinely secure and genuinely doomed.",
      "Nobody will crack this. You included.",
      "Strong. We'll see you at the reset flow.",
    ],
  },
  {
    label: "Extremely strong",
    tone: "moss",
    notes: [
      "Unbreakable. Unmemorable. Unwise. You'll reset this within the week.",
      "This password will outlive the account it protects.",
      "You've secured a fake account against a nation-state. Good.",
      "At this length you are protecting nothing from no one, thoroughly.",
      "We are storing this responsibly, which is a first for us.",
    ],
  },
  {
    label: "Excessive",
    tone: "smoke",
    notes: [
      "This is more security than your data deserves. We're storing it in a spreadsheet.",
      "You've exceeded the threat. There is no threat. There never was.",
      "Our hashing function has asked for a moment.",
      "This is longer than our privacy policy and better written.",
      "We respect this. We also cannot support it.",
    ],
  },
];

/* ========================================================================== */
/* ROASTS — 50+, dealt from a shuffle bag                                      */
/* ========================================================================== */

export const ROASTS = [
  "You have the energy of a browser tab someone forgot about.",
  "Statistically, you opened this instead of doing the thing.",
  "You read the terms. You didn't understand them. You agreed anyway. Classic.",
  "Your cursor movement suggests hesitation. We've logged it.",
  "You've been here eleven seconds and haven't clicked anything. Bold.",
  "We ran your vibe through our model. The model asked to be reassigned.",
  "You're the reason the onboarding has six steps now.",
  "Somewhere, a loading spinner is spinning just for you.",
  "You seem like someone who has 'Inbox (1)' and has made peace with it.",
  "You would absolutely fall for a second cookie banner.",
  "Your screen resolution suggests you know what you're doing. Your behavior does not.",
  "You're going to share this and take credit for finding it first.",
  "You have at least four tabs open that you are afraid to close.",
  "You've said “let me look into that” about something you will never look into.",
  "Your browser has a bookmark folder called “read later”. It is a graveyard.",
  "You scrolled past three things you meant to come back to. You will not.",
  "You are the kind of person who reads the changelog and pretends it was for work.",
  "You've been meaning to update your password since a breach you can't name.",
  "You looked at the pricing page. You are not going to pay for anything.",
  "There is a notification badge somewhere on your device that you have simply accepted.",
  "You know exactly which app is draining your battery and you have chosen peace.",
  "You would describe yourself as “detail-oriented” on a resume and nowhere else.",
  "You have opinions about fonts you cannot defend.",
  "You've muted a group chat rather than leave it. Cowardice, but efficient.",
  "You are currently avoiding one specific message.",
  "You've read this sentence more carefully than you read the last email you replied to.",
  "You are the sort of person who says “circle back” and then doesn't.",
  "Your desktop has a folder called “stuff”. It has been there for years.",
  "You've googled something you already knew, just to be sure. It was fine.",
  "You have an unfinished side project you bring up at parties.",
  "You've considered starting a newsletter. Please don't.",
  "You'd describe your setup as “nothing fancy” and then explain it for nine minutes.",
  "You have a to-do app you are no longer on speaking terms with.",
  "You are the reason someone added a confirmation dialog.",
  "You've written “thanks!” with an exclamation mark you did not feel.",
  "You've been on a call where you were the only one who unmuted. It went badly.",
  "You once said “sorry, you go” and then also went.",
  "You have never once read a cookie policy and you're doing great.",
  "You've clicked “remind me tomorrow” enough times to constitute a lifestyle.",
  "You are exactly the demographic our fake analytics were designed to flatter.",
  "You skimmed the headline and formed a complete opinion. Efficient.",
  "You've told someone “I'll send that over” and then simply did not.",
  "You have a browser extension you forgot you installed and it's watching this.",
  "You are one notification away from closing this tab and we both know it.",
  "You've said “quick question” before a question that was not quick.",
  "You have a password manager and you still know one password by heart.",
  "You looked for the dark mode toggle before you read the headline.",
  "Your last five searches would not hold up in court.",
  "You are hovering. We can see you hovering.",
  "You'll tell someone about this site and describe it badly.",
  "You checked whether the user counter was real. It isn't. Neither is the checking.",
  "You've had “inbox zero” as a goal for so long it's now a personality.",
  "You are going to scroll to the bottom looking for the joke. The joke is the scrolling.",
  "You read this expecting it to be about someone else.",
];

/* ========================================================================== */
/* STATUS                                                                      */
/* ========================================================================== */

export const STATUS_LABELS = [
  "operational",
  "operational-adjacent",
  "nominal",
  "technically up",
  "up, spiritually",
  "responsive to prayer",
  "unbothered",
  "structurally optimistic",
  "fine",
  "green, we think",
  "functionally ambiguous",
  "warm",
  "load-bearing",
  "conditionally awake",
  "not currently on fire",
  "on fire, but usefully",
  "stable at this altitude",
  "within tolerance",
  "tolerating",
  "compliant with something",
  "reachable",
  "reachable, unwillingly",
  "responding to pings and nothing else",
  "in the green, definitionally",
  "unverified but confident",
  "healthy per the healthcheck we wrote",
  "monitored",
  "monitored by one person",
  "monitored by nobody",
  "degraded, upward",
  "steady",
  "steady-ish",
  "carrying on",
  "unremarkable",
  "encouraging",
  "provisionally excellent",
  "recovering",
  "recovering from nothing",
  "operational under protest",
  "yellow, but a confident yellow",
  "serving",
  "serving stale",
  "consistent",
  "consistently something",
  "vertically stable",
  "content",
  "at peace",
  "processing feelings",
  "awake",
  "technically correct",
  "unfalsifiable",
];

export const STATUS_EMOJI = [
  "🔥", "🙂", "🫠", "☕", "🧯", "📉", "🛠️", "🚬", "🫡", "🧊",
  "🌡️", "🪫", "🧻", "🕯️", "🧨", "🎈", "🩹", "⛑️", "🪤", "🧃",
];

export const OUTAGE_TITLES = [
  "We are aware of an issue affecting nothing.",
  "Degraded performance reported in a region we do not operate in.",
  "Elevated error rates detected. The errors are fine. They're doing great.",
  "One (1) service is experiencing feelings.",
  "Investigating reports that everything is working.",
  "Scheduled maintenance is occurring at an unscheduled time.",
  "A dependency we don't use has been restored.",
  "Partial outage affecting users who do not exist.",
  "Our monitoring is down, so as far as we know, this is the best day ever.",
  "Increased latency observed by one person who has not filed a ticket.",
  "A database has been promoted. It was not asking for a promotion.",
  "Intermittent failures affecting a feature we removed in March.",
  "We have deployed a fix for an issue nobody reported.",
  "Service disruption in the region containing our office.",
  "An alert fired. We are investigating why we have that alert.",
  "Users may experience the product as intended. We are looking into it.",
  "A cache has been cleared and is now taking it personally.",
  "Read replicas are lagging behind, emotionally.",
  "We are aware that the status page is green. We are investigating.",
  "One node is unreachable and has been for some time.",
  "Elevated 200 responses detected across all endpoints.",
  "A certificate expired. We renewed it. It expired again.",
  "The queue is draining. The queue has been draining since Tuesday.",
  "Traffic is up 400%. We have not verified this.",
  "Background jobs are running in the foreground.",
  "We have identified a memory leak and have decided to let it finish.",
  "An engineer has restarted the service. A different engineer has restarted it back.",
  "Two systems are disagreeing. Both are correct.",
  "We are experiencing an incident with the incident tooling.",
  "Retries are working. That is the problem.",
  "A feature flag was toggled by someone who is on leave.",
  "Our CDN is serving a version of the site from last week. Reviews are better.",
  "Rate limiting is active for all users, including us.",
  "A cron job ran twice. We are determining which one counted.",
  "Search is returning results. They are not the results.",
  "The load balancer has picked a favorite.",
  "One region has been quiet for a suspiciously long time.",
  "Autoscaling has scaled. Nobody asked it to. It's very pleased.",
  "We rolled back the rollback and are now somewhere new.",
  "A migration completed successfully in a direction we did not intend.",
  "Logs are being written. They are not being read.",
  "Our on-call rotation has rotated onto an empty slot.",
  "A third-party provider is having a great day, unrelated to us.",
  "Webhooks are firing in the correct order, retroactively.",
  "Session storage is holding on to things it should have released.",
  "We are seeing duplicate events. We are seeing duplicate events.",
  "An index was rebuilt. The table it indexed was not.",
  "Something recovered on its own. We have not asked how.",
  "The dashboard is accurate. This is the anomaly.",
  "A dependency updated itself overnight and is now more opinionated.",
  "Everything is nominal. This makes us nervous.",
];

export const OUTAGE_UPDATES = [
  "We have identified the cause and elected not to pursue it.",
  "A fix has been deployed to a different repository.",
  "Engineers have been notified and are currently notifying other engineers.",
  "Root cause analysis complete. The root was the cause.",
  "Mitigation in progress. Mitigation is mostly hoping.",
  "We've restarted the thing. It's the same thing, but restarted.",
  "This incident will remain open indefinitely for emotional reasons.",
  "We are monitoring. Monitoring means we have the tab open.",
  "A workaround exists. It is worse than the problem.",
  "We have escalated internally, which moved it sideways.",
  "The fix is written. The deploy window is theoretical.",
  "We have added an alert so this surprises us less next time.",
  "Investigation paused pending someone remembering the password.",
  "A postmortem has been scheduled and will be rescheduled.",
  "Reverting to the last known good state. There isn't one.",
  "We have confirmed the issue is real, which is progress.",
  "Traffic has been shifted to a region that is also affected.",
  "We are waiting on a vendor who is waiting on us.",
  "The service recovered before we understood it. We're moving on.",
  "Impact has been reclassified as “character”.",
  "We have documented this in a place nobody will look.",
  "A patch is being prepared by whoever is closest.",
  "We've disabled the feature. Nobody has noticed. This is also a finding.",
  "The metric has been adjusted so this no longer registers.",
  "Further updates will be provided when there is nothing to say.",
  "Confidence is high. Confidence has been high before.",
  "This has been added to the backlog, where it will age well.",
  "We believe the issue is resolved and are refusing to check.",
  "Someone has claimed this ticket and gone quiet.",
  "We are treating this as a learning opportunity for a team that no longer exists.",
];

/* ========================================================================== */
/* BUZZWORDS — 50+                                                             */
/* ========================================================================== */

export const BUZZWORDS: { word: string; def: string }[] = [
  { word: "Frictionful", def: "Intentionally difficult, for reasons we will articulate later." },
  { word: "Vertical velocity", def: "Moving quickly, but only upward, which is not a direction problems live in." },
  { word: "Pre-parity", def: "Behind, but with a roadmap." },
  { word: "Trust surface", def: "The total area over which users can be disappointed." },
  { word: "Ambient churn", def: "Users leaving so gradually that no single quarter can be blamed." },
  { word: "Soft launch debt", def: "The accumulated cost of never actually launching." },
  { word: "Signal fatigue", def: "When your alerts have alerts and none of them are read." },
  { word: "Post-clarity", def: "The phase after a strategy meeting." },
  { word: "Load-bearing intern", def: "Any system component whose documentation is a person." },
  { word: "Optimistic durability", def: "We think it saved. We haven't checked." },
  { word: "Consensual telemetry", def: "Telemetry, but the banner was very large." },
  { word: "Directional accuracy", def: "Wrong, but wrong toward the correct side." },
  { word: "Empathy throughput", def: "How many users you can care about per sprint. Currently two." },
  { word: "Non-blocking outage", def: "An outage that only blocks the things nobody uses." },
  { word: "Retroactive intent", def: "Deciding you meant to do the thing after it works." },
  { word: "Graceful escalation", def: "Panicking in a calm font." },
  { word: "Zero-trust onboarding", def: "We don't believe you, and you shouldn't believe us." },
  { word: "Latency theater", def: "An artificial delay added so the work feels valuable." },
  { word: "Scope osmosis", def: "How a two-day task becomes a quarter without any decision being made." },
  { word: "Decision debt", def: "The interest paid on every choice deferred to “later”." },
  { word: "Alignment surface", def: "The number of people who must nod before anything ships." },
  { word: "Confidence interval", def: "The gap between the demo and the deploy." },
  { word: "Hallway consensus", def: "An agreement reached by two people and binding on eleven." },
  { word: "Roadmap adjacency", def: "Not on the roadmap, but standing near it hopefully." },
  { word: "Passive redundancy", def: "Two systems doing nothing, in case one of them stops." },
  { word: "Velocity smoothing", def: "Adjusting the estimate until the burndown looks calm." },
  { word: "Vestigial feature", def: "Code retained because removing it feels riskier than keeping it." },
  { word: "Founder latency", def: "The delay between a hallway idea and its appearance in the sprint." },
  { word: "Enterprise gravity", def: "The force by which one large customer bends an entire roadmap." },
  { word: "Observability theatre", def: "Extensive dashboards, viewed by no one, during no incident." },
  { word: "Soft dependency", def: "A system you don't rely on until the one week you do." },
  { word: "Compliance-shaped", def: "Resembling compliance from a distance and at speed." },
  { word: "Reactive roadmap", def: "A plan assembled entirely from the last three complaints." },
  { word: "Attention budget", def: "A finite resource, spent entirely before the important meeting." },
  { word: "Silent success", def: "A deploy nobody noticed, which we will not be celebrating." },
  { word: "Founder mode", def: "A period during which process is briefly considered optional." },
  { word: "Legacy velocity", def: "The speed at which old code prevents new code." },
  { word: "Consensus decay", def: "The rate at which an agreed decision becomes an open question." },
  { word: "Ghost capacity", def: "Headcount that exists in the plan and nowhere else." },
  { word: "Semantic drift", def: "When a metric slowly stops measuring what it was named after." },
  { word: "Adoption ceiling", def: "The point past which further users would require the product to work." },
  { word: "Warm rollback", def: "Reverting a change while insisting it wasn't the change." },
  { word: "Meeting residue", def: "The tasks generated by a meeting held to reduce tasks." },
  { word: "Preemptive nostalgia", def: "Missing the old system while it is still running." },
  { word: "Blast tolerance", def: "How much can break before anyone external notices." },
  { word: "Structural optimism", def: "Load-bearing belief that the deploy will be fine." },
  { word: "Documentation half-life", def: "The interval after which a README becomes fiction." },
  { word: "Escalation ceiling", def: "The most senior person who will still read the thread." },
  { word: "Vanity durability", def: "Data retained purely so a number on a slide stays large." },
  { word: "Quiet deprecation", def: "Removing a feature by simply never mentioning it again." },
  { word: "Tactical patience", def: "Doing nothing, but framing it." },
  { word: "Discovery inflation", def: "Research expanding to fill the time before a decision is unavoidable." },
];

/* ========================================================================== */
/* MOODS — daily accent hue shift                                              */
/* ========================================================================== */

export const MOODS: { label: string; hue: number }[] = [
  { label: "beige", hue: 24 },
  { label: "combustible", hue: 0 },
  { label: "cautiously radioactive", hue: 62 },
  { label: "damp", hue: 178 },
  { label: "unemployed", hue: 210 },
  { label: "aggressively neutral", hue: 40 },
  { label: "smug", hue: 96 },
  { label: "haunted", hue: 268 },
  { label: "under-caffeinated", hue: 14 },
  { label: "mildly volcanic", hue: 348 },
  { label: "professionally tired", hue: 200 },
  { label: "beige, but louder", hue: 32 },
  { label: "unread", hue: 220 },
  { label: "on mute", hue: 190 },
  { label: "quietly furious", hue: 355 },
  { label: "load-bearing", hue: 36 },
  { label: "post-standup", hue: 165 },
  { label: "buffering", hue: 205 },
  { label: "structurally content", hue: 88 },
  { label: "the colour of a Tuesday", hue: 48 },
  { label: "vaguely mineral", hue: 172 },
  { label: "spiritually offline", hue: 250 },
  { label: "cautiously beige", hue: 28 },
  { label: "warm, unhelpfully", hue: 18 },
  { label: "understaffed", hue: 214 },
  { label: "faintly medicinal", hue: 150 },
  { label: "unbothered", hue: 100 },
  { label: "slightly haunted", hue: 280 },
  { label: "corporate lavender", hue: 272 },
  { label: "the last day of a trial", hue: 8 },
  { label: "expired but stable", hue: 58 },
  { label: "acoustically damp", hue: 184 },
  { label: "self-hosted", hue: 130 },
  { label: "read-only", hue: 226 },
  { label: "eventually consistent", hue: 158 },
  { label: "deprecated but beloved", hue: 300 },
  { label: "on-call", hue: 4 },
  { label: "post-incident", hue: 142 },
  { label: "grey, with ambition", hue: 232 },
  { label: "mildly ceremonial", hue: 320 },
  { label: "unversioned", hue: 70 },
  { label: "a soft no", hue: 340 },
  { label: "open in another tab", hue: 196 },
  { label: "green, allegedly", hue: 112 },
  { label: "tepid", hue: 44 },
  { label: "archival", hue: 30 },
  { label: "reheated", hue: 12 },
  { label: "briefly optimistic", hue: 78 },
  { label: "the beige of a waiting room", hue: 26 },
  { label: "muted, by choice", hue: 208 },
  { label: "fine", hue: 20 },
];

/* ========================================================================== */
/* USER OF THE DAY — combinatorial, so effectively endless                     */
/* ========================================================================== */

export const USER_ADJECTIVES = [
  "Load-Bearing", "Untested", "Deprecated", "Legacy", "Unsanitized", "Idle",
  "Verbose", "Nullable", "Orphaned", "Cached", "Stale", "Blocking",
  "Recursive", "Undocumented", "Hardcoded", "Flaky", "Ambient", "Dangling",
  "Eventual", "Immutable", "Detached", "Throttled", "Deferred", "Silent",
  "Volatile", "Unindexed", "Truncated", "Escaped", "Pinned", "Shadowed",
  "Unreachable", "Duplicated", "Nested", "Inherited", "Overloaded", "Mutable",
  "Transient", "Persistent", "Suspended", "Rejected", "Queued", "Expired",
  "Uncommitted", "Rebased", "Squashed", "Reverted", "Stubbed", "Mocked",
  "Vendored", "Minified", "Obsolete",
];

export const USER_NOUNS = [
  "Gremlin", "Intern", "Cronjob", "Migration", "Hotfix", "Sysadmin",
  "Backup", "Fallback", "Sidecar", "Daemon", "Rollback", "Webhook",
  "Cursor", "Changelog", "Postmortem", "Runbook", "Stakeholder", "Retro",
  "Linter", "Pipeline", "Snapshot", "Replica", "Cluster", "Namespace",
  "Tarball", "Symlink", "Cache", "Buffer", "Socket", "Thread",
  "Mutex", "Callback", "Promise", "Closure", "Fixture", "Sandbox",
  "Bastion", "Proxy", "Gateway", "Cron", "Sprint", "Standup",
  "Backlog", "Epic", "Blocker", "Handoff", "Onboarding", "Offboarding",
  "Deputy", "Escalation", "Wiki",
];

export const USER_ACHIEVEMENTS = [
  "Closed 400 tabs without reading any of them",
  "Replied 'per my last message' and meant it",
  "Deployed on a Friday and got away with it",
  "Read one (1) line of the changelog",
  "Muted a meeting to sigh",
  "Named a variable `data2`",
  "Approved a PR in 4 seconds",
  "Found the bug. Left it.",
  "Turned it off and on again, professionally",
  "Wrote a TODO that will outlive them",
  "Ignored 1,400 unread notifications with total composure",
  "Achieved inbox zero by declaring bankruptcy",
  "Said “no worries if not” and had worries",
  "Scheduled a meeting to discuss meeting frequency",
  "Reopened a ticket out of spite",
  "Wrote documentation nobody has opened",
  "Merged to main directly and told no one",
  "Renamed a folder and broke production",
  "Left a code review comment consisting solely of “?”",
  "Estimated a task at two days for the fourth time",
  "Created a Slack channel that died in nine minutes",
  "Answered a question with a link to the same question",
  "Fixed a flaky test by increasing the timeout",
  "Wrote a regex and never spoke of it again",
  "Attended a retro and said nothing true",
  "Marked a document “final_v3_FINAL”",
  "Debugged for two hours before reading the error",
  "Blamed the cache, correctly, by accident",
  "Introduced a dependency to avoid writing four lines",
  "Deleted a comment that explained everything",
  "Set a calendar reminder they will dismiss forever",
  "Described a bug as “interesting” instead of fixing it",
  "Escalated to a channel with no members",
  "Wrote “LGTM” without opening the diff",
  "Achieved 100% coverage of one file",
  "Restarted the deploy until the tests agreed",
  "Named a service after a bird for no reason",
  "Kept a terminal open for 41 days",
  "Solved the problem by removing the feature",
  "Read the stack trace from the bottom, once",
  "Explained the outage using an analogy about plumbing",
  "Won an argument in a thread nobody else read",
  "Left a meeting early and called it focus time",
  "Created a dashboard viewed exclusively by themselves",
  "Documented a workaround as the solution",
  "Filed a bug against their own code, anonymously",
  "Discovered the toggle did nothing and said nothing",
  "Wrote a migration with no rollback and slept fine",
  "Asked “is this still needed?” about something load-bearing",
  "Achieved consensus by outlasting everyone",
  "Shipped it",
];

/* ========================================================================== */
/* 404 EXCUSES — 50+                                                           */
/* ========================================================================== */

export const EXCUSES_404 = [
  "This page was here. We watched it leave. We did not stop it.",
  "This page is on annual leave and did not set an out-of-office.",
  "This page was removed during a refactor nobody asked for.",
  "This page exists, but only on the machine of a developer who has since left.",
  "Someone deleted this to fix a different bug. It worked.",
  "This page is behind a feature flag we lost the key to.",
  "This URL was correct in a previous version of reality.",
  "This page failed its performance review.",
  "This page is being A/B tested against not existing. Not existing is winning.",
  "We migrated this page to a new CMS. The CMS is also gone.",
  "This page is fine. It's just not here. Those are different.",
  "404. That's not an error, that's a vibe.",
  "This page was load-bearing. Please don't tell anyone it's gone.",
  "This page was consolidated into another page, which was then consolidated.",
  "The route exists. The page does not. We ship the route regardless.",
  "This page is queued for restoration behind 4,000 other things.",
  "We renamed this page for SEO and forgot the redirect.",
  "This page is present in the sitemap as an act of optimism.",
  "This page was removed after a meeting that ran long.",
  "This content was moved to the wiki. The wiki was moved to nowhere.",
  "This URL is reserved for a page we intend to write.",
  "The page loaded. Somewhere. Just not for you.",
  "This page is cached at the edge and nowhere else.",
  "This page has been deprecated with the standard zero days of notice.",
  "This was a landing page for a campaign that was never approved.",
  "This page is available in a locale we no longer support.",
  "The page exists in staging and refuses to be promoted.",
  "This page was deleted by a script that was supposed to do the opposite.",
  "This link came from an email we sent in error.",
  "This page 404s intentionally. We are not going to explain further.",
  "This page was written, reviewed, approved, and never merged.",
  "The file is there. The extension is wrong. Nobody has time.",
  "This route was removed to fix a build. The build still failed.",
  "This page is hosted on a bucket that has become private.",
  "This page requires a permission that has never been granted to anyone.",
  "This page was consolidated into the homepage, which is thriving.",
  "The URL has a typo. It's ours. We're keeping it.",
  "This page was archived. Archiving here means deleting slowly.",
  "This page is scheduled for publication in a past quarter.",
  "The content team owns this page. There is no content team.",
  "This page has been temporarily unavailable since launch.",
  "This page was replaced by a modal, which was replaced by nothing.",
  "This page moved. We do not know where. We wish it well.",
  "The redirect exists but points here, which is the problem.",
  "This page was lost in a merge conflict resolved by picking “ours”.",
  "This page is a casualty of a rebrand we abandoned halfway.",
  "This page was removed for legal reasons, which is a joke, but only partly.",
  "This page has been rewritten in a framework we do not deploy.",
  "This page is 404ing correctly, which we consider a success.",
  "This URL was in the tweet. The tweet was wrong.",
  "This page is behind auth that does not exist yet.",
  "You have found the edge of the site. There is nothing past here.",
];

/* ========================================================================== */
/* PROCESSING STEPS — 60+                                                      */
/* ========================================================================== */

export const PROCESSING_STEPS = [
  "Reticulating splines",
  "Calculating your aura",
  "Negotiating with the database",
  "Warming up the cold path",
  "Asking Kevin",
  "Kevin is not responding",
  "Proceeding without Kevin",
  "Normalizing your enthusiasm",
  "Compiling a list of your regrets",
  "Sharding your personality",
  "Checking if you're the problem",
  "Results inconclusive",
  "Rounding your trust score down",
  "Consulting the roadmap",
  "The roadmap is a picture of a horse",
  "Provisioning imaginary resources",
  "Draining the connection pool for fun",
  "Rewriting this step in Rust",
  "Reverting the Rust rewrite",
  "Aligning stakeholders",
  "Stakeholders remain unaligned",
  "Applying industry-standard shrug",
  "Escalating to nobody",
  "Almost done",
  "That was a lie",
  "Finalizing",
  "Definitely finalizing",
  "Serializing your vibe to disk",
  "Encrypting things that didn't need it",
  "Deleting the audit log (routine)",
  "Allocating a workspace you will not use",
  "Seeding your account with plausible data",
  "Inventing a metric to describe you",
  "Rejecting the metric",
  "Inventing a second metric",
  "Warming caches that are already warm",
  "Cooling caches that got too warm",
  "Assigning you to a cohort",
  "The cohort has declined",
  "Reticulating the other splines",
  "Verifying you against nothing",
  "Estimating your lifetime value pessimistically",
  "Checking for existing accounts with your face",
  "No matches. Concerning either way.",
  "Loading the loading screen",
  "Requesting permission from a service that is asleep",
  "Granting it ourselves",
  "Reconciling two sources of truth",
  "Picking the more convenient truth",
  "Indexing things nobody will search",
  "Running the migration in reverse briefly",
  "Putting it back",
  "Generating a welcome email we will not send",
  "Simulating engagement",
  "Simulation successful. Engagement not.",
  "Assigning a support agent",
  "Kevin has been assigned",
  "Kevin has begun typing",
  "Compressing your preferences into one boolean",
  "Setting the boolean to false",
  "Auditing ourselves and passing",
  "Registering you for a webinar",
  "Un-registering you as a courtesy",
  "Establishing baseline productivity of zero",
  "Recording consent you did not give",
  "Withdrawing it on your behalf",
  "Provisioning a dashboard with four widgets",
  "Three widgets survived",
  "Rebuilding the search index for no reason",
  "Applying the theme you did not choose",
  "Double-checking the theme is wrong",
  "Confirmed wrong",
  "Notifying nobody of your arrival",
  "Wrapping up",
  "Un-wrapping to check something",
  "Wrapping up again",
];

/* ========================================================================== */
/* TOASTS — 50+                                                                */
/* ========================================================================== */

export const TOASTS = [
  { title: "Sync complete", body: "Nothing was synced. Everything is complete." },
  { title: "New device signed in", body: "Location: unclear. Device: also unclear. Probably you." },
  { title: "Your plan was upgraded", body: "You will be billed the same. You will receive the same. Congratulations." },
  { title: "Kevin viewed your profile", body: "Kevin views everyone's profile. Kevin is going through something." },
  { title: "Backup successful", body: "We backed up your data to a folder called `temp`." },
  { title: "Security notice", body: "Your password is strong. Our storage is not. Net neutral." },
  { title: "You're in the top 1%", body: "Of people currently on this page. There is one of you." },
  { title: "Weekly digest ready", body: "You did nothing. Here is a chart of it." },
  { title: "Someone mentioned you", body: "Not by name. Not kindly. But you were implied." },
  { title: "Storage almost full", body: "You have used 2 KB of your unlimited storage. We're monitoring it." },
  { title: "Session extended", body: "Against your wishes and our better judgment." },
  { title: "Compliance update", body: "We are now compliant. With what, legal wouldn't say." },
  { title: "Achievement progress", body: "You are 3% of the way to something we haven't designed yet." },
  { title: "Your workspace is ready", body: "It has been ready. It was always ready. Nothing happens in it." },
  { title: "Invite sent", body: "To nobody. You have no teammates. The invite was symbolic." },
  { title: "New feature available", body: "It is the same feature. It has a new icon." },
  { title: "Data export queued", body: "Your export will be ready in 3–5 business decades." },
  { title: "Two-factor recommended", body: "We recommend it. We do not support it. We recommend it anyway." },
  { title: "Trial ending soon", body: "Your free trial ends in 0 days. It ended before it started. You're fine." },
  { title: "Performance improved", body: "We deleted a chart. Everything is faster now." },
  { title: "Kevin is typing", body: "Still. Yes. We know." },
  { title: "Password reset requested", body: "Not by you. We're mentioning it casually." },
  { title: "Terms updated", body: "The changes are minor and unfavorable." },
  { title: "You have 1 unread", body: "It is this notification. You have now read it. You have 1 unread." },
  { title: "Integration connected", body: "To what, we couldn't say. But firmly connected." },
  { title: "Report generated", body: "The report says “see attached”. There is no attachment." },
  { title: "Team activity", body: "Nobody did anything. We wanted you to know immediately." },
  { title: "Usage limit approaching", body: "You are at 0.02% of your limit. Please slow down." },
  { title: "Maintenance scheduled", body: "For a time in the past. It went well." },
  { title: "New login from Chrome", body: "On a device you own, in a place you are. Just checking." },
  { title: "Feedback received", body: "We have received your feedback and placed it somewhere." },
  { title: "Onboarding 40% complete", body: "You finished onboarding. The number is decorative." },
  { title: "Referral bonus", body: "Refer a friend and both of you receive the same nothing." },
  { title: "System optimized", body: "We changed a setting back to what it was." },
  { title: "Draft saved", body: "You were not writing anything. It has been saved." },
  { title: "Calendar synced", body: "We now know when you are free. This is for us." },
  { title: "Permission granted", body: "You did not request one. It has been granted regardless." },
  { title: "Anomaly detected", body: "In the anomaly detector. The detector is the anomaly." },
  { title: "Kevin has read your message", body: "Kevin has read it several times now." },
  { title: "Your data is safe", body: "We wanted to say it before you asked." },
  { title: "Version 1.4.1 available", body: "Fixes an issue introduced in 1.4.1." },
  { title: "Someone starred your workspace", body: "It was Kevin. Kevin stars everything." },
  { title: "Billing information updated", body: "By us. To the same values. For consistency." },
  { title: "Search index rebuilt", body: "Search still returns nothing, but faster." },
  { title: "You've been added to a group", body: "The group is called “everyone”. It has one member." },
  { title: "Automation triggered", body: "It did what it does, which is not much, immediately." },
  { title: "Uptime milestone", body: "We have been up for a while. Don't look at the status page." },
  { title: "Note from the team", body: "We just wanted to check in. That's it. That's the notification." },
  { title: "Region migrated", body: "Your data now lives somewhere marginally colder." },
  { title: "Digest preferences saved", body: "You will continue to receive everything." },
  { title: "Account verified", body: "By whom, and against what, we're not able to say." },
  { title: "Kevin has stopped typing", body: "Do not get excited." },
];

/* ========================================================================== */
/* DASHBOARD STATS — 40+                                                       */
/* ========================================================================== */

export const DASHBOARD_STATS = [
  { label: "Productivity Score", suffix: "", note: "Up 0% from a baseline we invented." },
  { label: "Synergy Index", suffix: "", note: "Measured in meetings avoided." },
  { label: "Vibe Coefficient", suffix: "", note: "Normalized against Kevin." },
  { label: "Trust Surface", suffix: "m²", note: "Growing. Concerningly." },
  { label: "Momentum", suffix: "/mo", note: "Direction unspecified." },
  { label: "Unread Signal", suffix: "", note: "You have chosen not to look." },
  { label: "Latent Potential", suffix: "%", note: "Still latent." },
  { label: "Blast Radius", suffix: "km", note: "Within acceptable limits." },
  { label: "Focus Density", suffix: "", note: "Sampled during a meeting. Sorry." },
  { label: "Context Switches", suffix: "/hr", note: "Each one costs more than the last." },
  { label: "Decision Latency", suffix: "d", note: "Measured from the first “let's circle back”." },
  { label: "Alignment Score", suffix: "%", note: "Nobody agrees on how this is computed." },
  { label: "Ambient Load", suffix: "", note: "Things you are carrying but have not named." },
  { label: "Deferred Tasks", suffix: "", note: "They are compounding." },
  { label: "Meeting Residue", suffix: "hrs", note: "Time spent recovering from time spent." },
  { label: "Inbox Pressure", suffix: "psi", note: "Stable. Structurally." },
  { label: "Roadmap Fidelity", suffix: "%", note: "How much of the plan survived contact." },
  { label: "Slack Half-Life", suffix: "m", note: "Before a message becomes irrelevant." },
  { label: "Deploy Confidence", suffix: "%", note: "Highest on Fridays, for some reason." },
  { label: "Tab Debt", suffix: "", note: "Open. Unread. Yours." },
  { label: "Notification Tolerance", suffix: "%", note: "Rising, which is the concerning direction." },
  { label: "Ticket Gravity", suffix: "", note: "How strongly the backlog pulls." },
  { label: "Standup Efficiency", suffix: "%", note: "Includes the part before it starts." },
  { label: "Estimation Drift", suffix: "×", note: "Multiply every estimate by this." },
  { label: "Documentation Age", suffix: "mo", note: "Since anything here was true." },
  { label: "Refactor Appetite", suffix: "%", note: "Peaks immediately before a deadline." },
  { label: "On-call Composure", suffix: "", note: "Measured at 3 AM. Results withheld." },
  { label: "Vendor Dependence", suffix: "%", note: "Higher than the architecture diagram suggests." },
  { label: "Feature Flag Count", suffix: "", note: "Several are permanent now." },
  { label: "Consensus Decay", suffix: "/wk", note: "How fast agreement becomes debate." },
  { label: "Retro Sincerity", suffix: "%", note: "Declines steadily after item three." },
  { label: "Cache Faith", suffix: "%", note: "Belief that the cache is correct." },
  { label: "Legacy Coefficient", suffix: "", note: "New code divided by old code's opinion." },
  { label: "Handoff Loss", suffix: "%", note: "Information that did not survive the transfer." },
  { label: "Escalation Reach", suffix: "", note: "Levels traversed before someone replies." },
  { label: "Sprint Elasticity", suffix: "%", note: "How much it stretched. It stretched." },
  { label: "Idle Capacity", suffix: "%", note: "Fully booked, entirely idle." },
  { label: "Signal Purity", suffix: "%", note: "After removing the alerts we ignore." },
  { label: "Rollback Readiness", suffix: "%", note: "Theoretical." },
  { label: "Kevin Response Time", suffix: "", note: "No sample has completed." },
];

/* ========================================================================== */
/* HOVER ROASTS — 50+                                                          */
/* ========================================================================== */

export const HOVER_ROASTS = [
  "You hovered. That's basically a commitment.",
  "Still hovering. We can wait.",
  "This is the longest anyone has considered this button.",
  "Click it. Or don't. We've stopped caring in a healthy way.",
  "Your hesitation has been added to your file.",
  "A decision would be nice.",
  "We've logged this as “interest”. It will be reported as “demand”.",
  "You're reading it again. It says the same thing.",
  "This element has been hovered 1 time today. By you. Just now.",
  "Hovering is not a commitment, legally.",
  "We watched you approach this from three directions.",
  "The button is not going to change.",
  "Take your time. The quarter ends eventually.",
  "This is being counted as engagement.",
  "Your cursor has been here longer than most people stay on the site.",
  "Nothing about this improves with study.",
  "You're looking for a catch. There's a different catch.",
  "This is a normal button. That's the unsettling part.",
  "You could click it. That's an option available to you.",
  "We've prepared for this click. We've prepared too much.",
  "Still here. Still hovering. Still fine.",
  "That's a hover. We'll take it.",
  "Somewhere a metric just incremented because of this.",
  "You are being extremely thorough about a fake product.",
  "This element does not deserve this much of your attention.",
  "We admire the caution. We do not share it.",
  "Your mouse has stopped. So has the conversation.",
  "Consider clicking. Consider not. Both are available.",
  "This is the part where most people scroll.",
  "You've read this card. You are now rereading this card.",
  "There's nothing hidden here. There's something hidden elsewhere.",
  "You hover like someone who has been burned by a modal.",
  "Fair. It does look like a trap.",
  "We're not going to move it. That's a different button.",
  "This is going in the weekly report as “strong signal”.",
  "You are the most engaged user we have ever had, briefly.",
  "The hover state cost more to build than the feature.",
  "Nothing happens on hover. This is the nothing.",
  "You are hovering over a joke about hovering.",
  "Diminishing returns started about four seconds ago.",
  "Your patience is noted and will not be rewarded.",
  "This card has been reviewed. By you. Extensively.",
  "You're checking whether it's clickable. It is. That's the whole thing.",
  "We could have put something here. We didn't.",
  "This is a lot of consideration for a hover state.",
  "Statistically, you will not click this.",
  "You were going to click and then you read this instead.",
  "Kevin hovered here once. Kevin is still here.",
  "You have now spent longer here than on the pricing page.",
  "Move along. Or don't. There's no rush and no reward.",
];

/* ========================================================================== */
/* COOKIE BANNER — an ordered ladder, not a shuffled pool                      */
/* ========================================================================== */

export const COOKIE_STAGES = [
  {
    title: "We use cookies",
    body: "To improve your experience, analyze traffic, and for reasons that were compelling at the time.",
    accept: "Accept all",
    reject: "Reject all",
  },
  {
    title: "We use cookies",
    body: "You rejected. That's allowed. We've noted it in a file with your name on it.",
    accept: "Accept all",
    reject: "Reject all (again)",
  },
  {
    title: "Okay, about the cookies",
    body: "Legal says we have to ask. Legal is one person. Legal is tired. Legal is asking again.",
    accept: "Fine",
    reject: "No",
  },
  {
    title: "Let's talk about the cookies",
    body: "We're not going to pretend this is about analytics anymore. We just want you to say yes to something today.",
    accept: "Yes",
    reject: "Absolutely not",
  },
  {
    title: "The cookies miss you",
    body: "They're not even good cookies. They're the boring kind that remember your theme preference. That's genuinely it.",
    accept: "Okay fine",
    reject: "Still no",
  },
  {
    title: "cookie banner",
    body: "we've stopped capitalizing. that's how this is going. one click. that's all we're asking. we have a quota.",
    accept: "ok",
    reject: "no",
  },
  {
    title: "🍪",
    body: "please",
    accept: "yes",
    reject: "no",
  },
  {
    title: "Cookie preferences",
    body: "We respect your decision and will now stop asking. This message will not appear again. We are as surprised as you are.",
    accept: "Thank you",
    reject: "Thank you",
  },
];

/* ========================================================================== */
/* KEVIN — the running gag                                                     */
/* ========================================================================== */

export const KEVIN_OPENERS = [
  "Hi! I'm Kevin. I'll be with you shortly.",
  "Kevin here. Let me pull up your account.",
  "Hey — Kevin from support. One sec.",
  "Kevin speaking. Give me one moment to find your details.",
  "Hi, Kevin. I've got your ticket open in front of me.",
  "Kevin from Customer Success. Just reading your history now.",
  "Hello! Kevin. I'm going to help you today.",
  "Kevin. Right, let me just check something.",
];

export const KEVIN_STATUSES = [
  "Kevin is typing",
  "Kevin is still typing",
  "Kevin has stopped typing",
  "Kevin is typing",
  "Kevin is reading your message again",
  "Kevin is typing",
  "Kevin deleted what he wrote",
  "Kevin is typing",
  "Kevin is looking something up",
  "Kevin is typing",
  "Kevin has been typing for a while now",
  "Kevin is typing",
  "Kevin is asking a colleague",
  "Kevin is typing",
  "Kevin's colleague has also started typing",
  "Kevin is typing",
  "Kevin has opened a second window",
  "Kevin is typing",
  "Kevin is consulting the runbook",
  "Kevin has closed the runbook",
  "Kevin is typing",
  "Kevin started over",
  "Kevin is typing",
  "Kevin is rephrasing",
  "Kevin is typing",
  "Kevin has taken a short break",
  "Kevin is back",
  "Kevin is typing",
  "Kevin is checking whether this is his to answer",
  "It is",
  "Kevin is typing",
  "Kevin is reading the documentation",
  "Kevin wrote the documentation",
  "Kevin is typing",
  "Kevin has escalated internally",
  "Kevin is the escalation",
  "Kevin is typing",
  "Kevin is drafting something longer",
  "Kevin is typing",
  "Kevin has deleted the longer thing",
  "Kevin is typing",
  "Kevin is considering a phone call",
  "Kevin has decided against it",
  "Kevin is typing",
  "Kevin's status shows 'away'",
  "Kevin's status shows 'active'",
  "Kevin is typing",
  "Kevin has been typing for six minutes",
  "Kevin is typing",
  "Kevin appreciates your patience",
  "Kevin has not said that out loud",
  "Kevin is typing",
];

/** One Kevin line per surface. He appears on every page — that's the point. */
export const KEVIN_ASIDES = [
  "Kevin is typing.",
  "Kevin has read this page.",
  "Kevin says this section is fine.",
  "Kevin drafted this and did not send it.",
  "Kevin is aware of this and is typing.",
  "Kevin reviewed this. Kevin approves. Kevin is typing.",
  "Kevin has this open in another tab.",
  "Kevin would like to add something. Kevin is typing.",
  "Kevin maintains this section personally.",
  "Kevin has no notes. Kevin is typing anyway.",
  "Kevin looked into this and is preparing a response.",
  "Kevin is still on it.",
  "Kevin owns this page. Kevin has never edited it.",
  "Kevin was consulted. Kevin is typing.",
  "Kevin flagged this internally and then began typing.",
  "Kevin is handling this personally, at his own pace.",
  "Kevin says hello. Kevin is typing the rest.",
  "Kevin has escalated this to Kevin.",
];

/* ========================================================================== */
/* SIGNUP — vibes and trust                                                    */
/* ========================================================================== */

export const VIBES = [
  { emoji: "🔥", label: "Everything is fine" },
  { emoji: "📉", label: "Down and to the right" },
  { emoji: "🫠", label: "Dissolving, but productive" },
  { emoji: "🧊", label: "Emotionally cold-started" },
  { emoji: "🪤", label: "Trapped in a standup" },
  { emoji: "🛎️", label: "Available. Unfortunately." },
  { emoji: "🧯", label: "Prepared for the worst" },
  { emoji: "🐌", label: "Fast, eventually" },
  { emoji: "🎺", label: "Loud about small wins" },
  { emoji: "🕳️", label: "Deep in a thread" },
  { emoji: "🧺", label: "Carrying more than agreed" },
  { emoji: "🪫", label: "Operating on reserve" },
  { emoji: "📎", label: "Attached to something outdated" },
  { emoji: "🛗", label: "Between floors" },
  { emoji: "🧭", label: "Directionally confident" },
  { emoji: "🪞", label: "Reviewing my own PR" },
  { emoji: "🥱", label: "Awake in principle" },
  { emoji: "🎯", label: "Aiming at the wrong thing precisely" },
  { emoji: "🧱", label: "Blocked, but stylishly" },
  { emoji: "🌡️", label: "Running warm" },
  { emoji: "🫧", label: "Optimistic and fragile" },
  { emoji: "🪜", label: "One step from something" },
  { emoji: "📠", label: "Technically still supported" },
  { emoji: "🛟", label: "Fine. Genuinely fine." },
];

export const TRUST_REACTIONS: { at: number; text: string }[] = [
  { at: 0, text: "Healthy. Correct, even." },
  { at: 8, text: "Appropriately guarded." },
  { at: 15, text: "Reasonable skepticism. We respect it." },
  { at: 22, text: "A sensible amount. Nobody gets hurt here." },
  { at: 30, text: "Slightly generous, but within range." },
  { at: 35, text: "That's… more than most. Okay." },
  { at: 42, text: "We're noting this." },
  { at: 50, text: "Hm." },
  { at: 55, text: "Let's just pause there." },
  { at: 60, text: "Let's slow down." },
  { at: 66, text: "You've met us for ninety seconds." },
  { at: 72, text: "You don't know us." },
  { at: 78, text: "This is not reciprocated." },
  { at: 85, text: "This is genuinely making us uncomfortable." },
  { at: 90, text: "We are not the company you think we are." },
  { at: 95, text: "Please stop. We are not equipped for this." },
  { at: 99, text: "Nobody has ever gone this far. We don't have copy for this." },
];

/* ========================================================================== */
/* TESTIMONIALS — 50+                                                          */
/* ========================================================================== */

export const TESTIMONIALS = [
  { quote: "We migrated our entire stack to This Is Fine in a weekend. Nobody has asked us to migrate back, which I'm reading as consent.", name: "Dana R.", role: "VP of Engineering, a company" },
  { quote: "The onboarding told me my age was taken. I have thought about that every day since. Five stars.", name: "M. Okonkwo", role: "Head of Something, Series B" },
  { quote: "Our productivity score went from 0.3 to 0.4. Leadership has asked me to present on how.", name: "Priya S.", role: "Ops Lead" },
  { quote: "Kevin is still typing. It has been four months. We've grown close.", name: "Anonymous", role: "Enterprise customer" },
  { quote: "I clicked the dark mode button and the lights came on. I have not recovered and I have not left.", name: "T. Halvorsen", role: "Design Director" },
  { quote: "Genuinely the most honest software we've ever purchased. It does nothing and says so.", name: "R. Mbeki", role: "CTO" },
  { quote: "We evaluated eleven vendors. This one was the only one that admitted anything.", name: "Claudia F.", role: "Procurement" },
  { quote: "The status page said 12% operational and it was the most accurate thing I read that quarter.", name: "J. Whitfield", role: "SRE" },
  { quote: "I showed this to my manager as a joke and we now have a purchase order.", name: "Sam A.", role: "Engineering Manager" },
  { quote: "The trust slider recoiled from me. I've been thinking about that a lot.", name: "Nadia P.", role: "Product Lead" },
  { quote: "Six onboarding steps. Our real product has nine. This was the wake-up call.", name: "Oliver G.", role: "Founder" },
  { quote: "It rejected every name I tried, including my own, twice. Deeply validating.", name: "H. Suzuki", role: "Staff Engineer" },
  { quote: "We use the changelog as a template now. Our releases have never been better documented or less truthful.", name: "Marcus L.", role: "Release Manager" },
  { quote: "The cookie banner escalated until it said 'please'. I respected it enough to accept.", name: "Elena V.", role: "Privacy Counsel" },
  { quote: "I have a dashboard with a random squiggle on it at work too. Mine cost forty thousand dollars.", name: "D. Ferreira", role: "Analytics" },
  { quote: "This is the only product I've used where the loading screen was the best part.", name: "Yusuf K.", role: "Consultant" },
  { quote: "Told my team the roadmap was a picture of a horse. Nobody questioned it.", name: "Brigid O.", role: "Head of Product" },
  { quote: "The password meter insulted my password and it was right to.", name: "Anonymous", role: "Security" },
  { quote: "We adopted 'load-bearing intern' as official terminology. HR has questions.", name: "Tomás R.", role: "People Ops" },
  { quote: "The 404 page had a better excuse than the one I gave my standup.", name: "Wei C.", role: "Developer" },
  { quote: "I came for the joke and stayed because the focus rings are genuinely excellent.", name: "Simone D.", role: "Accessibility Consultant" },
  { quote: "It said I was user ten million. So was my colleague. We haven't discussed it.", name: "P. Andersen", role: "Data Engineer" },
  { quote: "The button dodged my cursor once and then behaved. That's better UX than our checkout.", name: "Rania H.", role: "UX Researcher" },
  { quote: "Every metric on this dashboard means nothing. Ours mean slightly less.", name: "Gabriel M.", role: "Head of Insights" },
  { quote: "We shipped a feature because the fake version looked better than our real one.", name: "Anonymous", role: "Series A" },
  { quote: "Our incident channel now uses 'we are aware of an issue affecting nothing' unironically.", name: "Kofi B.", role: "Platform" },
  { quote: "The word of the day was 'decision debt' and I had to leave the room.", name: "Louise T.", role: "Program Manager" },
  { quote: "I muted the sound and it gave me an achievement for it. Finally, a product that understands.", name: "Anonymous", role: "Open plan office" },
  { quote: "The verification code accepted any six digits. So does ours, apparently. We checked after.", name: "Ingrid S.", role: "Backend Lead" },
  { quote: "This site has better error messages than our production application.", name: "Ravi N.", role: "Tech Lead" },
  { quote: "I've been the User of the Day. It changed nothing and I think about it constantly.", name: "@StaleWebhook42", role: "Community member" },
  { quote: "My contribution got approved and I put it on my résumé. It's the strongest line.", name: "Fatima Z.", role: "Contributor" },
  { quote: "The site's mood was 'beige' on the day of our funding round. Correct.", name: "Anonymous", role: "Founder" },
  { quote: "The processing screen said 'checking if you're the problem' and then said results were inconclusive.", name: "Ben A.", role: "Engineer" },
  { quote: "We've replaced our all-hands slides with this changelog. Engagement is up.", name: "Miriam J.", role: "Chief of Staff" },
  { quote: "It respects prefers-reduced-motion and calls it Boring Mode. That's care.", name: "Anonymous", role: "Screen reader user" },
  { quote: "The pricing page admits all tiers are identical. Ours does too, less clearly.", name: "Andre P.", role: "Pricing Strategy" },
  { quote: "I clicked 'reject all' seven times purely to see what would happen. Worth it.", name: "Chidi E.", role: "QA" },
  { quote: "Kevin has viewed my profile 40 times. I've started to view his.", name: "Anonymous", role: "Enterprise" },
  { quote: "The user counter went down while I was looking at it. That's craft.", name: "Sofia L.", role: "Frontend" },
  { quote: "Our real onboarding rejects fewer fields and users like it less. We're studying this.", name: "Hassan I.", role: "Growth" },
  { quote: "Achievement unlocked: 'Signed Up'. It's the only one most of my users get too.", name: "Naomi W.", role: "Product Analytics" },
  { quote: "The footer copyright is legally meaningless and better written than our actual terms.", name: "Anonymous", role: "Legal" },
  { quote: "I read the whole README. Twice. I don't do that for tools I pay for.", name: "Alexei D.", role: "Open source maintainer" },
  { quote: "It told me my hesitation had been logged. I closed the tab. It was right.", name: "Grace O.", role: "Marketing" },
  { quote: "The daily rotation means my team argues about what today's roast was. That's retention.", name: "Diego S.", role: "Team Lead" },
  { quote: "Every joke is different for fifty clicks. Our onboarding repeats after two.", name: "Anonymous", role: "Competitor" },
  { quote: "The one thing that repeats is Kevin, and by then you want him to.", name: "Lin Z.", role: "Narrative Designer" },
  { quote: "We're not customers. There's nothing to be a customer of. We're here anyway.", name: "Anonymous", role: "Daily visitor" },
  { quote: "Best fake SaaS I've used. Better than several real ones I currently pay for.", name: "Tobias R.", role: "CTO" },
  { quote: "I submitted a joke, it got approved, and now strangers see my words. This is the internet working.", name: "@NullableGremlin", role: "Hall of Cringe" },
];

export const FAKE_LOGOS = [
  "NORTHWIND", "ACME∞", "Umbra Labs", "Kestrel", "Fourth Wall",
  "Grimwald & Co", "Palisade", "Verity", "Blackpine", "Ostrich",
  "Meridian", "Halcyon", "Tallow", "Ninefold", "Cairn",
  "Bellweather", "Sundry", "Ironwood", "Pallas", "Quorum",
];

/* ========================================================================== */
/* ACHIEVEMENTS                                                                */
/* ========================================================================== */

export interface AchievementDef {
  id: string;
  name: string;
  desc: string;
  emoji: string;
  secret?: boolean;
}

export const ACHIEVEMENTS: AchievementDef[] = [
  { id: "signed-up", name: "Signed Up", emoji: "📝", desc: "You completed onboarding. This is the only achievement most users get." },
  { id: "theme-noticed", name: "You Noticed", emoji: "🙃", desc: "Clicked both theme buttons. Yeah. We know.", secret: true },
  { id: "cta-caught", name: "Fast Hands", emoji: "🖱️", desc: "Reached the button without triggering the dodge. Suspicious.", secret: true },
  { id: "cookie-persistent", name: "Principled", emoji: "🍪", desc: "Rejected cookies more times than was reasonable.", secret: true },
  { id: "kevin-patience", name: "Waiting On Kevin", emoji: "⏳", desc: "Stayed in the chat long enough to learn something about yourself.", secret: true },
  { id: "trust-max", name: "Dangerously Trusting", emoji: "🫂", desc: "Pushed the trust slider all the way. We're worried.", secret: true },
  { id: "trust-zero", name: "Zero Trust", emoji: "🚪", desc: "Trust slider at absolute zero. Finally, someone sensible.", secret: true },
  { id: "contributor", name: "Made It Worse", emoji: "✍️", desc: "Submitted a joke to the content pool.", secret: true },
  { id: "lost", name: "Lost", emoji: "🗺️", desc: "Found the 404 page.", secret: true },
  { id: "mute", name: "Silence", emoji: "🔇", desc: "Muted the sounds. Fair.", secret: true },
  { id: "kevin-spotter", name: "Kevin Everywhere", emoji: "👀", desc: "Noticed Kevin on five different pages. He's on all of them.", secret: true },
  { id: "deep-scroll", name: "Completionist", emoji: "📜", desc: "Scrolled to the bottom of the landing page. There was nothing there.", secret: true },
  { id: "voter", name: "Democracy", emoji: "🗳️", desc: "Upvoted a pending submission. It changes review order and nothing else.", secret: true },
  { id: "rejected-many", name: "Persistent", emoji: "🧱", desc: "Had ten different names rejected in one sitting.", secret: true },
  { id: "panic-button", name: "Boss Never Came", emoji: "🧯", desc: "Hit the panic button. There was no boss. There was never a boss.", secret: true },
  { id: "desperate", name: "We Appreciate It", emoji: "🙏", desc: "Submitted a joke at maximum desperation.", secret: true },
];

/* ========================================================================== */
/* CHANGELOG                                                                   */
/* ========================================================================== */

export const CHANGELOG = [
  {
    version: "1.5.0",
    date: "Recently",
    tag: "stable",
    items: [
      "Every rotating pool now holds 50+ entries and deals from a shuffled deck, so nothing repeats until you've seen all of it.",
      "Except Kevin. Kevin repeats. Kevin is the control group.",
      "Added a hover roast to essentially everything. Sorry.",
      "The trust slider now gives up if you push it three times. It didn't used to. It learned.",
      "Testimonials expanded to fifty. None of these people exist. Several have job titles that don't either.",
    ],
  },
  {
    version: "1.4.0",
    date: "The recent past",
    tag: "stable",
    items: [
      "Fixed a bug where the bugs were fixed.",
      "The dark mode toggle now correctly does the wrong thing.",
      "Added a sixth onboarding step. Users asked for fewer.",
      "Kevin has been given a longer typing animation to reflect his workload.",
      "Removed the loading spinner that indicated progress. It was misleading.",
    ],
  },
  {
    version: "1.3.2",
    date: "Slightly before that",
    tag: "hotfix",
    items: [
      "Rolled back 1.3.1.",
      "Rolled back the rollback.",
      "The cookie banner now escalates at a rate our lawyer describes as 'legally novel'.",
      "Performance improvements. (We deleted a chart.)",
    ],
  },
  {
    version: "1.3.1",
    date: "A Thursday",
    tag: "deprecated",
    items: [
      "Shipped on a Friday. Consequences observed on Saturday.",
      "Password strength meter now insults strong passwords equally.",
      "Fixed an issue where the site occasionally worked on the first try.",
    ],
  },
  {
    version: "1.0.0",
    date: "The beginning",
    tag: "legacy",
    items: [
      "Initial release.",
      "Every user is user #10,000,000. This is not a bug and we will not be discussing it.",
      "Added the age field. It rejects all ages. This was the entire original idea.",
    ],
  },
];

/* ========================================================================== */
/* ANXIOUS TOOLTIPS — 50+, dealt. UI elements with feelings about being used. */
/* ========================================================================== */

export const ANXIOUS_TOOLTIPS = [
  "Please click me gently. It's been a long deploy.",
  "Don't type anything weird in here. We've seen things.",
  "I was drawn in MS Paint by an intern. He was proud of me.",
  "This is my one job. Please don't make it weird.",
  "I've been hovered on before. It's fine. I'm fine.",
  "If you click me, we're both committing to something.",
  "I don't know what happens next either.",
  "Careful. I bruise easy and I remember everything.",
  "I was A/B tested against a rectangle. The rectangle lost.",
  "Someone in a meeting fought for my border-radius.",
  "I contain multitudes and also just a click handler.",
  "This icon is doing its best.",
  "I've never been clicked at this hour before.",
  "Go easy. I only had one code review.",
  "I was supposed to be blue. Long story.",
  "Whatever you're about to do, I support it nervously.",
  "I have opinions about you and I am not sharing them.",
  "This label took longer to write than to build.",
  "I've been staring at your cursor for eleven seconds.",
  "I promise I do something. I just don't know what, exactly.",
  "Please don't double-click. I only have one job in me.",
  "I was named 'button2_final' in the source. We don't discuss it.",
  "You hover like someone who's been burned by a modal before.",
  "I'm load-bearing. Emotionally, mostly.",
  "Somebody QA'd me once. It went fine. Probably.",
  "I get nervous around fast cursors.",
  "This is the longest anyone's looked at me today.",
  "I was going to say something. I've reconsidered.",
  "I was built on a Friday. We don't talk about it.",
  "Please don't tell the other elements I said this.",
  "I've been hovered by 1 person today. It's you. Hi.",
  "Whatever happens after this click isn't really up to me.",
  "I was reviewed by exactly one person, and they were tired.",
  "I've got a good feeling about this. I have no basis for that.",
  "This tooltip exists because someone thought silence was worse.",
  "I don't remember agreeing to have a personality.",
  "Someone gave me a shadow. I didn't ask for a shadow.",
  "I was supposed to say something useful. This is what happened instead.",
  "I've seen your cursor circle back twice. We're both nervous now.",
  "This is fine. I'm fine. Everything about this is fine.",
  "I was cloned from a component that no longer exists.",
  "Nobody has told me what I do. I've stopped asking.",
  "If this breaks, it's not going to be because of me. Probably.",
  "I have a tabIndex and a dream.",
  "This element has read the accessibility guidelines. Some of them.",
  "I get like this before every click. It passes.",
  "I was placed here by someone who has since left the company.",
  "You're allowed to just click it. I've been ready for a while.",
  "I don't do anything special. I just wanted you to know that up front.",
  "This has been the highlight of my day, and my day started nine seconds ago.",
];

/* ========================================================================== */
/* SCREEN TIME SLIDER — an ordered ladder, keyed by hour, not shuffled         */
/* ========================================================================== */

export const SCREEN_TIME_REACTIONS: { at: number; text: string }[] = [
  { at: 0, text: "Ambitious. We've never seen this." },
  { at: 1, text: "Technically possible. Historically, no." },
  { at: 2, text: "This is a lovely number. We don't believe it." },
  { at: 3, text: "Getting closer to a number people actually hit." },
  { at: 4, text: "This is where it gets heavy." },
  { at: 5, text: "The slider felt that." },
  { at: 6, text: "It's not you. It's the number." },
  { at: 8, text: "The slider has stopped pretending this is fine." },
  { at: 10, text: "We're not going to make this easy for you." },
  { at: 12, text: "The slider would like a moment." },
  { at: 14, text: "This is no longer a screen time target. This is a lifestyle." },
  { at: 16, text: "The slider is tired of your unrealistic expectations." },
];

/* ========================================================================== */
/* TERMS & CONDITIONS — a fixed document, walked top to bottom, not shuffled  */
/* Section 4 is load-bearing: the quiz references it by number.               */
/* ========================================================================== */

export const TOS_SECTIONS: { n: number; heading: string; body: string }[] = [
  { n: 1, heading: "Acceptance", body: "By continuing, you accept these terms in the same spirit you accept cookies: reluctantly, and without reading them." },
  { n: 2, heading: "Definitions", body: "“We” means the company. “You” means whoever clicked. “Reasonable” does not appear again in this document." },
  { n: 3, heading: "Eligibility", body: "You must be a real person, or something that types like one." },
  { n: 4, heading: "Soul & Related Assets", body: "Paragraph 1: continued use of the Service constitutes a non-exclusive, revocable-by-us-only license to your soul, effective immediately upon scrolling past this sentence. Paragraph 2: your soul remains yours in name only; we retain the right to reference it in future marketing materials." },
  { n: 5, heading: "Firstborn & Dependents", body: "Any firstborn children are considered “stretch goals” and not contractually binding, this time." },
  { n: 6, heading: "Wi-Fi Password Sharing", body: "You agree to share your Wi-Fi password with any device we later invent that needs it." },
  { n: 7, heading: "NFTs You're Embarrassed About", body: "You warrant that you own zero (0) NFTs. If this warranty is false, you agree not to bring it up." },
  { n: 8, heading: "Data Collection", body: "We collect everything technically possible, and several things that are not." },
  { n: 9, heading: "Data Usage", body: "Your data will be used to train a model that resents you specifically." },
  { n: 10, heading: "Third Parties", body: "We may share your information with partners, none of whom you have met, several of whom are also us." },
  { n: 11, heading: "Cookies", body: "See our separate, much angrier, Cookie Policy." },
  { n: 12, heading: "Intellectual Property", body: "Anything you type becomes ours. Anything we type was already ours." },
  { n: 13, heading: "User Conduct", body: "You agree not to be reasonable about any of this in a public forum." },
  { n: 14, heading: "Termination", body: "We may terminate your account for any reason, no reason, or a reason we make up after the fact." },
  { n: 15, heading: "Termination by You", body: "You may also terminate. We will not notice." },
  { n: 16, heading: "Warranties", body: "The Service is provided “as is”, which is a legal term meaning “we know”." },
  { n: 17, heading: "Limitation of Liability", body: "Our liability is limited to the amount you paid us, which is nothing, so: nothing." },
  { n: 18, heading: "Indemnification", body: "You agree to defend us in a dispute you were not consulted about." },
  { n: 19, heading: "Dispute Resolution", body: "Disputes will be resolved via arbitration, by an arbitrator we selected, in a building we own." },
  { n: 20, heading: "Governing Law", body: "These terms are governed by the laws of a jurisdiction we have not disclosed." },
  { n: 21, heading: "Force Majeure", body: "We are not responsible for acts of god, weather, or Kevin." },
  { n: 22, heading: "Modifications", body: "We may change these terms at any time, retroactively, and will consider that notice." },
  { n: 23, heading: "Assignment", body: "We may assign this agreement to any entity, including one that does not yet exist." },
  { n: 24, heading: "Severability", body: "If one clause is unenforceable, the rest remain, out of spite." },
  { n: 25, heading: "Entire Agreement", body: "This is the entire agreement. There is a second document. It supersedes this one. We won't say where it is." },
  { n: 26, heading: "Contact", body: "Questions may be directed to Kevin. Kevin is typing." },
];

/** Dealt on every quiz open, so re-checking the box doesn't repeat the question. */
export const TOS_QUIZ_QUESTIONS: { q: string; options: string[] }[] = [
  { q: "What did Section 4, Paragraph 2 state about your soul ownership?", options: ["It remains yours in name only", "It was never really in question", "It's complicated", "We'd rather not say"] },
  { q: "According to Section 5, what happens to any firstborn children?", options: ["They become stretch goals", "Nothing, this time", "It depends on the quarter", "Please stop asking about this"] },
  { q: "Per Section 6, what are you required to share with future devices?", options: ["Your Wi-Fi password", "Your patience", "Both, honestly", "We forget"] },
  { q: "What did Section 17 say about our liability?", options: ["It is limited to what you paid", "It does not exist", "It's a feeling, not a number", "We covered this already"] },
  { q: "Per Section 21, who is Force Majeure not responsible for?", options: ["Kevin", "The weather", "Us, mostly", "All of the above, allegedly"] },
  { q: "What does Section 12 say happens to anything you type?", options: ["It becomes ours", "It already was", "Both, somehow", "We're not proud of this one"] },
  { q: "Section 19 — where is arbitration conducted?", options: ["A building we own", "A building we lease", "Somewhere. We're not saying.", "The comments section"] },
  { q: "What did Section 25 say the second document contains?", options: ["Everything this one doesn't", "We won't say where it is", "It supersedes this one", "You don't want to know"] },
  { q: "Per Section 9, what is your data used to train?", options: ["A model that resents you specifically", "A model that resents everyone equally", "Kevin", "We plead the fifth"] },
  { q: "According to Section 14, on what basis may we terminate your account?", options: ["Any reason", "No reason", "A reason we invent later", "Yes"] },
  { q: "Section 7 — what must you warrant about NFTs?", options: ["That you own zero", "That you're embarrassed regardless", "Both", "We already know the answer"] },
  { q: "What does Section 16 say the Service is provided as?", options: ["“As is”", "“As is, unfortunately”", "We know what it means", "All of the above"] },
  { q: "Per Section 22, when can these terms change?", options: ["At any time", "Retroactively", "Both, and that counts as notice", "It already changed while you read this"] },
  { q: "Section 26 — who handles contact questions?", options: ["Kevin", "Kevin, who is typing", "Someone. Eventually.", "You've met him"] },
  { q: "What does Section 3 require you to be?", options: ["A real person", "Something that types like one", "Either, we're not checking", "This one's a trick question"] },
  { q: "Per Section 8, how much data do we collect?", options: ["Everything technically possible", "Several things that aren't", "Both", "More than that, probably"] },
  { q: "Section 18 — what do you agree to defend us in?", options: ["A dispute you weren't consulted on", "Multiple disputes", "This exact quiz", "We'd rather not elaborate"] },
  { q: "According to Section 11, what governs cookies?", options: ["A separate, angrier policy", "This one, technically", "Whichever one you didn't read", "The banner knows"] },
  { q: "Section 23 — who can we assign this agreement to?", options: ["Any entity", "An entity that doesn't exist yet", "Both, eventually", "We already have"] },
  { q: "What did Section 1 say you accept these terms in the spirit of?", options: ["Accepting cookies", "Reluctance", "Not reading them", "All three, simultaneously"] },
];

/* ========================================================================== */
/* LIVE CODE GENERATOR — 50+, dealt. Nonsense pseudocode, always deploying.    */
/* ========================================================================== */

export const LIVE_CODE_LINES = [
  "import magic from './reality';",
  "await forgiveness.request();",
  "const vibe = Math.random() > 0 ? 'fine' : 'also fine';",
  "git commit -m \"final_final_v3_ACTUAL\"",
  "function doEverything() { /* TODO: everything */ }",
  "deploy(prod, { confidence: 'theoretical' });",
  "try { ship(); } catch { alsoShip(); }",
  "const truth = process.env.TRUTH ?? 'undefined';",
  "await sleep(quarter);",
  "if (bug) { rename(bug, 'feature'); }",
  "export default function() { return; /* fine */ }",
  "const rollback = () => rollback();",
  "// this works, do not ask how",
  "class Kevin extends Support { isTyping = true; }",
  "const scope = creep(scope);",
  "delete node_modules; delete node_modules;",
  "console.log('probably fine');",
  "npm install --save-optimism",
  "const meeting = await scheduleMeeting({ about: 'scheduling' });",
  "throw new Hope();",
  "if (Math.random() < 1) { proceed(); }",
  "const backlog = backlog.concat(backlog);",
  "await align(stakeholders); // still pending",
  "return synergy ?? null;",
  "for (let i = 0; i < Infinity; i++) { standup(); }",
  "const cache = new Map(); cache.set('trust', 0);",
  "// reviewed by nobody, approved by everyone",
  "async function ship() { return new Promise(() => {}); }",
  "let momentum = 0; momentum++; momentum--;",
  "export const isDone = () => false;",
  "const migration = reverse(reverse(migration));",
  "process.on('exit', () => console.log('we tried'));",
  "const roadmap = new Image('horse.png');",
  "if (onFire) { logCalmly(); }",
  "const password = prompt('trust us');",
  "await retry(retry(retry(action)));",
  "// merged to main, told no one",
  "const estimate = actualTime * Infinity;",
  "function fixBug() { return hideBug(); }",
  "const consensus = vote([true]);",
  "git push --force-with-lease-of-life",
  "const dashboard = new Widget(4).slice(0, 3);",
  "await Promise.race([hope, deadline]);",
  "const feelings = JSON.stringify(undefined);",
  "if (!works) { works = true; }",
  "export function reticulateSplines() { /* again */ }",
  "const trust = Math.max(0, trust - 1);",
  "let kevin = setInterval(typing, Infinity);",
  "// deployed to production. again.",
  "return 'it works on my machine';",
];

export const DEPLOY_BANNER_LINES = [
  "Deployed to Production",
  "Deployed to Production (again)",
  "Deployed to Production, allegedly",
  "Deployed to Production. No tests were harmed.",
  "Deployed to Production at 4:58 PM on a Friday",
  "Deployed to Production. Rolling back in 3… 2…",
  "Deployed to Production, confidence: theoretical",
  "Deployed to Production. Kevin approved it.",
  "Deployed to Production. Nobody reviewed it.",
  "Deployed to Production, skipping CI",
  "Deployed to Production. It's fine. Probably.",
  "Deployed to Production, twice, by accident",
  "Deployed to Production. This is the real one.",
  "Deployed to Production. So was the last one.",
  "Deployed to Production. Champagne on standby.",
  "Deployed to Production. Rolling forward instead.",
];

/* ========================================================================== */
/* DISTRACTION COUNTER — an ordered ladder, keyed by tab-switch count          */
/* ========================================================================== */

export const DISTRACTION_GUILT: { at: number; text: string }[] = [
  { at: 1, text: "Tab switch #1. We noticed." },
  { at: 2, text: "Tab switch #2. Everything's still here." },
  { at: 3, text: "Tab switch #3. This is between you and the tab." },
  { at: 4, text: "Tab switch #4… your code is missing you." },
  { at: 5, text: "Tab switch #5. We're not counting. We are counting." },
  { at: 6, text: "Tab switch #6. The dashboard remembers." },
  { at: 8, text: "Tab switch #8. Statistically, you're not coming back this time." },
  { at: 10, text: "Tab switch #10. Ten. We're impressed and concerned." },
  { at: 13, text: "Tab switch #13. Unlucky, and also accurate." },
  { at: 16, text: "Tab switch #16. At this point it's a rhythm." },
  { at: 20, text: "Tab switch #20. We've stopped judging. We've started logging." },
  { at: 25, text: "Tab switch #25. This is now a lifestyle, not a lapse." },
  { at: 30, text: "Tab switch #30. The guilt meter has nothing left to give." },
  { at: 40, text: "Tab switch #40. We're proud of you for coming back at all." },
];

/* ========================================================================== */
/* VIBE METER — bucketed by cursor speed, each bucket dealt for variety        */
/* ========================================================================== */

export const VIBE_METER_LEVELS: { label: string; notes: string[] }[] = [
  {
    label: "Flatlined",
    notes: [
      "The cursor has not moved. We're checking your pulse.",
      "This qualifies as “away” in most systems.",
      "Stillness. Bold choice.",
      "We've logged this as “thinking” out of kindness.",
    ],
  },
  {
    label: "Procrastinating",
    notes: [
      "Deliberate, or stuck. Hard to say.",
      "This is the pace of someone rereading an email before sending it.",
      "Slow and, statistically, not steady.",
      "You have the energy of a browser tab someone forgot about.",
    ],
  },
  {
    label: "Idling",
    notes: [
      "Present, technically.",
      "Ambient movement. No commitment implied.",
      "This is what “available” looks like on a graph.",
      "We wouldn't call this working, exactly.",
    ],
  },
  {
    label: "Working",
    notes: [
      "This looks like actual productivity. Suspicious.",
      "Purposeful. We're choosing to believe it.",
      "Solidly in the “getting things done” band.",
      "This is the pace of someone who has a plan.",
    ],
  },
  {
    label: "Focused",
    notes: [
      "Locked in. We respect it.",
      "This is what deadlines do to a cursor.",
      "Efficient. Slightly alarming.",
      "You are moving like something is due.",
    ],
  },
  {
    label: "Panicking",
    notes: [
      "This is the cursor equivalent of shouting.",
      "Fast. Erratic. Familiar.",
      "We've seen this pattern before a deploy.",
      "This reads as “the meeting is in two minutes”.",
    ],
  },
  {
    label: "Full Meltdown",
    notes: [
      "This is not vibes anymore, this is a cry for help.",
      "We're going to go ahead and alert someone.",
      "The cursor is now faster than the thing it's chasing.",
      "Please, for your own sake, close a tab.",
    ],
  },
];

/* ========================================================================== */
/* PANIC BUTTON — 40+ fake terminal lines, dealt in sequence when triggered    */
/* ========================================================================== */

export const PANIC_TERMINAL_LINES = [
  "Compiling dependencies... done",
  "Running test suite (247 passed, 0 run)",
  "Optimizing bundle size... -0.0%",
  "Connecting to production database",
  "Connection established (probably)",
  "Applying migration 0042_final_v2",
  "Rolling back migration 0042_final_v2",
  "Reapplying migration 0042_final_v3",
  "Cache warmed",
  "Cache invalidated",
  "Cache warmed again, out of spite",
  "Restarting worker pool",
  "Worker pool restarted (1 of 4 responding)",
  "Health check: green",
  "Health check: green, unverified",
  "Provisioning staging environment",
  "Staging environment indistinguishable from production",
  "Rebuilding search index",
  "Search index rebuilt, results unchanged",
  "Purging CDN edge cache",
  "CDN cache purge queued behind 400 others",
  "Scaling instances: 2 -> 8",
  "Scaling instances: 8 -> 2, nobody asked",
  "Sync complete: 0 conflicts, 4 concerns",
  "Encrypting at rest",
  "Decrypting to check it worked",
  "Deploying hotfix for the hotfix",
  "Awaiting stakeholder sign-off",
  "Stakeholder sign-off simulated",
  "Log rotation complete",
  "Logs rotated into a void",
  "Checking certificate expiry: fine, for now",
  "Certificate renewed, expired immediately",
  "Queue draining: 14,208 jobs remaining",
  "Queue draining: 14,209 jobs remaining",
  "Background job failed silently, as designed",
  "Alert fired. Alert acknowledged. Alert ignored.",
  "Everything is nominal. This is the concerning part.",
  "No incidents to report. Suspicious.",
  "End of log. Nothing to see here. Boss is definitely not coming.",
];

/* ========================================================================== */
/* FAKE SUPPORT PING — a small dealt pool, one automated nudge per session     */
/* ========================================================================== */

export const SUPPORT_PING_LINES = [
  "Hey — noticed you've been on this page a while. Need help typing your name?",
  "Still there? We're standing by, decoratively.",
  "Quick question: do you need help, or are you just looking?",
  "We noticed you scrolled. That usually means something.",
  "Most visitors have a question by now. Do you?",
  "This is usually the part where someone asks about pricing.",
  "We're here if you need anything. We are, technically, always here.",
  "You've been idle for a bit. So have we, but differently.",
  "A lot of people type something right about now.",
  "Go ahead. Say something. See what happens.",
];

export const SUPPORT_PING_REPLY = "I'm just a picture of a chat box. I can't actually read.";

/* ========================================================================== */
/* DESPERATION SLIDER — an ordered ladder, keyed by desperation percentage     */
/* ========================================================================== */

/* ========================================================================== */
/* CONTINUE ANYWAY — fires on Step 1's Continue despite every "rejection"     */
/* ========================================================================== */

export const CONTINUE_ANYWAY_LINES = [
  "None of that resolved. We're letting you through regardless.",
  "Every one of those was wrong. Continuing anyway.",
  "We didn't fix anything. We just stopped checking.",
  "Technically none of this passed. Proceeding.",
  "The validation failed. The button did not care.",
  "We reviewed your answers. We've decided not to act on that.",
  "Nothing here is approved. You are, somehow.",
  "This should not work. It's working.",
  "We're waiving all of that, just this once, again, as always.",
  "Rejected in spirit. Approved in practice.",
];

/* ========================================================================== */
/* EMAIL TAKEN — real, but in-voice. Email is the one field that's actually   */
/* checked against a real account.                                            */
/* ========================================================================== */

export const EMAIL_TAKEN_LINES = [
  "That address already has an account here.",
  "We already know this one.",
  "Already yours, or someone convincingly pretending to be you.",
  "That email is spoken for, and it wasn't by us.",
  "There's already a person behind that address. Possibly you.",
  "Taken. Unlike the other fields, this one means it.",
  "That one's real, and it's already registered.",
  "We checked. Actually checked, this time. It's in use.",
];

export const DESPERATION_LINES: { at: number; text: string }[] = [
  { at: 0, text: "We'll wait." },
  { at: 10, text: "No rush." },
  { at: 25, text: "Whenever you're ready." },
  { at: 40, text: "Still no rush. We mean it less." },
  { at: 55, text: "We could really use this one." },
  { at: 70, text: "This would really help us out." },
  { at: 80, text: "Please." },
  { at: 90, text: "We are begging, technically." },
  { at: 97, text: "This is the whole business model." },
  { at: 100, text: "Fine. Take it. It's yours." },
];
