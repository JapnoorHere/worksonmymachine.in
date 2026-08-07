import { makeRng } from "./seed";
import { AGE_REJECTIONS, NAME_REJECTIONS, PASSWORD_VERDICTS } from "./content";

/**
 * The validation that never validates.
 *
 * Two rules make this land instead of just being noise:
 *
 * 1. The message *reacts to what you typed*. Numbers get a line about numbers,
 *    ALL CAPS gets a line about volume. A generic rejection reads as a canned
 *    string; a specific one reads as a system that looked at you.
 * 2. The same input always produces the same message, because the message is
 *    seeded by the input itself. If it reshuffled on every keystroke people
 *    would see the randomizer and stop believing the premise.
 */

export interface Verdict {
  message: string;
  tone: "error" | "warn" | "ok";
}

function categorize(name: string): keyof typeof NAME_REJECTIONS {
  const n = name.trim();
  if (/^(admin|root|administrator|owner|kevin|superuser|test)$/i.test(n)) return "admin";
  if (n.length <= 2) return "short";
  if (n.length >= 22) return "long";
  if (/\s/.test(n)) return "space";
  if (/\d/.test(n)) return "numbers";
  if (n.length >= 4 && n === n.toUpperCase() && /[A-Z]/.test(n)) return "caps";
  return "taken";
}

export function judgeName(raw: string): Verdict | null {
  const name = raw.trim();
  if (!name) return null;

  const category = categorize(name);
  const pool = NAME_REJECTIONS[category];
  // Seeded by the name, so retyping the same thing gets the same verdict.
  const line = makeRng(`name::${name.toLowerCase()}`).pick(pool);

  return {
    message: line.replace(/\{name\}/g, name),
    tone: "error",
  };
}

/** A nearby age to suggest instead. Also taken, obviously. */
function alternativeAge(age: number): number {
  const offset = makeRng(`agealt::${age}`).pick([-4, -3, -2, 2, 3, 4, 7]);
  return Math.max(1, age + offset);
}

export function judgeAge(raw: string): Verdict | null {
  const trimmed = raw.trim();
  if (!trimmed) return null;

  const age = Number(trimmed);

  if (!Number.isFinite(age) || !/^\d+$/.test(trimmed)) {
    return { message: "Age must be a number. We're flexible on which one.", tone: "error" };
  }
  if (age <= 0) {
    return {
      message: "We admire the ambition but we do need you to have started.",
      tone: "error",
    };
  }
  if (age > 200) {
    return {
      message: "That age is not supported. Almost nothing here is supported.",
      tone: "error",
    };
  }

  const bracket = AGE_REJECTIONS.find((b) => age <= b.max) ?? AGE_REJECTIONS.at(-1)!;
  const line = makeRng(`age::${age}`).pick(bracket.lines);

  return {
    message: line
      .replace(/\{age\}/g, String(age))
      .replace(/\{alt\}/g, String(alternativeAge(age))),
    tone: "error",
  };
}

/** The email is accepted instantly. The aside arrives a couple of seconds later. */
export const EMAIL_ASIDES = [
  "Accepted. We've added you to seven lists. One of them is a newsletter.",
  "Great. We'll only email you when something happens, and something is always happening.",
  "Verified. Not by us — by vibes.",
  "Thanks. This address has been shared with our partners, who are also us.",
  "Confirmed. You'll receive a welcome email, a re-welcome email, and silence.",
  "Noted. We won't spam you. We'll do something adjacent to spam that we call 'updates'.",
  "Perfect. This domain has an excellent reputation and you're about to change that.",
];

export function emailAside(email: string): string {
  return makeRng(`email::${email.toLowerCase()}`).pick(EMAIL_ASIDES);
}

export function judgeEmail(raw: string): Verdict | null {
  const email = raw.trim();
  if (!email) return null;
  // The one field that genuinely accepts anything with an @ in it.
  if (!email.includes("@")) {
    return { message: "That needs an @ somewhere. Anywhere. We're not fussy.", tone: "warn" };
  }
  return { message: "Looks fine.", tone: "ok" };
}

export interface PasswordVerdict {
  label: string;
  note: string;
  tone: string;
  /** 0–1, drives the meter width. Deliberately not entropy. */
  score: number;
}

/**
 * The meter mocks you at every length. It does climb as you type — a bar that
 * never moved would just look broken — but the commentary stays disappointed
 * the whole way up, which is the joke: the number improves and the opinion
 * doesn't.
 *
 * The note is seeded by password *length* rather than dealt from a bag, so it
 * changes as you type but holds still for any given string. A note that
 * reshuffled on every keystroke would read as a glitch, not a personality.
 */
export function judgePassword(pw: string): PasswordVerdict {
  const len = pw.length;

  let idx: number;
  if (len === 0) idx = 0;
  else if (len < 4) idx = 1;
  else if (len < 7) idx = 2;
  else if (len < 10) idx = 3;
  else if (len < 14) idx = 4;
  else if (len < 20) idx = 5;
  else if (len < 32) idx = 6;
  else idx = 7;

  const v = PASSWORD_VERDICTS[idx];
  const note = makeRng(`pw::${idx}::${len}`).pick(v.notes);

  return { label: v.label, tone: v.tone, note, score: Math.min(1, len / 22) };
}
