/**
 * Deterministic pseudo-randomness, seeded by the calendar date.
 *
 * The whole "daily refresh" system rests on this: every visitor on a given day
 * sees the *same* absurd thing, so it becomes a shared bit rather than noise.
 * No cron, no database, no backend. Just arithmetic and poor decisions.
 */

/** xmur3 — string → 32-bit seed. */
function xmur3(str: string): () => number {
  let h = 1779033703 ^ str.length;
  for (let i = 0; i < str.length; i++) {
    h = Math.imul(h ^ str.charCodeAt(i), 3432918353);
    h = (h << 13) | (h >>> 19);
  }
  return () => {
    h = Math.imul(h ^ (h >>> 16), 2246822507);
    h = Math.imul(h ^ (h >>> 13), 3266489909);
    h ^= h >>> 16;
    return h >>> 0;
  };
}

/** mulberry32 — 32-bit seed → uniform [0, 1) stream. */
function mulberry32(a: number): () => number {
  return () => {
    a |= 0;
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

export interface Rng {
  /** Float in [0, 1). */
  next(): number;
  /** Integer in [min, max] inclusive. */
  int(min: number, max: number): number;
  /** One element from a non-empty array. */
  pick<T>(arr: readonly T[]): T;
  /** `count` distinct elements (or the whole array if it's shorter). */
  sample<T>(arr: readonly T[], count: number): T[];
  /** Coin flip weighted toward `true` by `p`. */
  chance(p: number): boolean;
  /** A new independent stream derived from this one's seed + a label. */
  fork(label: string): Rng;
}

export function makeRng(seedStr: string): Rng {
  const rand = mulberry32(xmur3(seedStr)());

  const rng: Rng = {
    next: rand,
    int: (min, max) => Math.floor(rand() * (max - min + 1)) + min,
    pick: (arr) => arr[Math.floor(rand() * arr.length)],
    sample: (arr, count) => {
      const copy = [...arr];
      for (let i = copy.length - 1; i > 0; i--) {
        const j = Math.floor(rand() * (i + 1));
        [copy[i], copy[j]] = [copy[j], copy[i]];
      }
      return copy.slice(0, Math.min(count, copy.length));
    },
    chance: (p) => rand() < p,
    fork: (label) => makeRng(`${seedStr}::${label}`),
  };

  return rng;
}

/**
 * Today's date key as YYYY-MM-DD.
 *
 * Deliberately computed from the *viewer's* local clock, not the server's.
 * Two consequences: the site flips over at local midnight (feels right), and
 * anything date-seeded must render client-side or be hydration-guarded, since
 * the server has no idea what day it is where you are.
 */
export function dateKey(d: Date = new Date()): string {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

/** A stable, human-readable rendering of the current date key. */
export function prettyDate(key: string): string {
  const [y, m, d] = key.split("-").map(Number);
  return new Date(y, m - 1, d).toLocaleDateString(undefined, {
    weekday: "long",
    month: "long",
    day: "numeric",
  });
}
