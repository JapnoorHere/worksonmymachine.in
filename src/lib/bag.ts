/**
 * Shuffle-bag dealing — the anti-repetition engine.
 *
 * Plain `Math.random()` picks from a pool of 50 will show you a duplicate
 * within about nine draws (birthday problem), and people notice duplicates far
 * faster than they notice randomness. So nothing here picks randomly: each pool
 * is shuffled into a deck and dealt one card at a time, and only reshuffles
 * once the deck is empty. You see all 50 before you see any of them twice.
 *
 * The reshuffle also guarantees the last card of the old deck isn't the first
 * card of the new one, which is the only place a "random" sequence would
 * visibly stutter.
 */

interface Deck<T> {
  items: readonly T[];
  remaining: T[];
  last: T | null;
}

const decks = new Map<string, Deck<unknown>>();

function shuffle<T>(arr: readonly T[]): T[] {
  const copy = [...arr];
  for (let i = copy.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [copy[i], copy[j]] = [copy[j], copy[i]];
  }
  return copy;
}

/**
 * Deal the next item from `key`'s deck, reshuffling when exhausted.
 * The deck is keyed by name, so separate call sites share one non-repeating
 * sequence over the same pool.
 */
export function deal<T>(key: string, pool: readonly T[]): T {
  if (pool.length === 0) throw new Error(`deal(): pool "${key}" is empty`);
  if (pool.length === 1) return pool[0];

  let deck = decks.get(key) as Deck<T> | undefined;

  // Rebuild if this is the first draw or the pool itself changed (e.g. new
  // community content arrived and got merged in).
  if (!deck || deck.items !== pool) {
    deck = { items: pool, remaining: shuffle(pool), last: null };
    decks.set(key, deck as Deck<unknown>);
  }

  if (deck.remaining.length === 0) {
    deck.remaining = shuffle(pool);
    // Never let a reshuffle repeat the card we just played.
    if (deck.remaining[0] === deck.last && deck.remaining.length > 1) {
      [deck.remaining[0], deck.remaining[1]] = [deck.remaining[1], deck.remaining[0]];
    }
  }

  const item = deck.remaining.pop() as T;
  deck.last = item;
  return item;
}

/**
 * Deal `count` distinct items in one go.
 *
 * `deal()` reshuffles the whole pool whenever its deck runs empty, and that
 * reshuffle only avoids repeating the single card dealt right before it — not
 * every card already handed out earlier in *this* batch. A batch that spans a
 * reshuffle boundary (small pool, large count — 7 of 20 logos reshuffles
 * inside of three calls) can otherwise repeat within itself, which shows up
 * as a duplicate React key. Skipping and redrawing on a same-batch repeat
 * fixes that; it costs an occasional wasted card from the deck, never a
 * visible duplicate.
 */
export function dealMany<T>(key: string, pool: readonly T[], count: number): T[] {
  const n = Math.min(count, pool.length);
  const out: T[] = [];
  const seen = new Set<T>();
  let guard = n * 4; // pool.length >= n, so this should never actually bind

  while (out.length < n && guard-- > 0) {
    const item = deal(key, pool);
    if (seen.has(item)) continue;
    seen.add(item);
    out.push(item);
  }
  return out;
}

/** How many cards are left before `key` reshuffles. Used by the debug ticker. */
export function remaining(key: string): number {
  return decks.get(key)?.remaining.length ?? 0;
}

/** Drop a deck so it reshuffles from scratch on the next draw. */
export function resetBag(key?: string): void {
  if (key) decks.delete(key);
  else decks.clear();
}
