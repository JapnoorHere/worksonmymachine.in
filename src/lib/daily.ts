import { makeRng, dateKey, prettyDate } from "./seed";
import {
  ROASTS,
  STATUS_LABELS,
  STATUS_EMOJI,
  OUTAGE_TITLES,
  OUTAGE_UPDATES,
  BUZZWORDS,
  MOODS,
  USER_ADJECTIVES,
  USER_NOUNS,
  USER_ACHIEVEMENTS,
  EXCUSES_404,
  PROCESSING_STEPS,
  TOASTS,
  type ContentType,
} from "./content";

/**
 * Community-approved lines, merged into the built-in pools before rotation so
 * an approved submission is indistinguishable from something we wrote. That's
 * the whole point of the contribution pipeline — contributors get to be in the
 * actual rotation, not a "community corner" ghetto at the bottom of the page.
 */
export type CommunityPools = Partial<Record<ContentType, string[]>>;

export interface DailyPayload {
  key: string;
  pretty: string;
  status: { pct: number; label: string; emoji: string };
  roast: string;
  userOfDay: { handle: string; achievement: string };
  outage: { title: string; update: string; incidentId: string; severity: string };
  buzzword: { word: string; def: string };
  mood: { label: string; hue: number };
  excuse: string;
  processing: string[];
  toasts: { title: string; body: string }[];
  ticker: string[];
  /** Fake-but-stable numbers the landing page shows off. */
  metrics: { users: number; uptime: string; latency: number; incidents: number };
}

const SEVERITIES = ["SEV-0", "SEV-1", "SEV-2", "SEV-4", "SEV-∞", "SEV-BEIGE"];

function merge(base: readonly string[], extra?: string[]): string[] {
  return extra && extra.length ? [...base, ...extra] : [...base];
}

export function buildDaily(key: string, community: CommunityPools = {}): DailyPayload {
  const rng = makeRng(key);

  const roasts = merge(ROASTS, community.roast);
  const excuses = merge(EXCUSES_404, community.excuse);
  const steps = merge(PROCESSING_STEPS, community.loading);

  // Community buzzwords arrive as "Word — definition"; split them back apart.
  const extraBuzz = (community.buzzword ?? []).map((raw) => {
    const [word, ...rest] = raw.split(/\s*[—–-]\s*/);
    return { word: word.trim(), def: rest.join(" — ").trim() || "Definition pending review." };
  });
  const buzzwords = [...BUZZWORDS, ...extraBuzz];

  const extraToasts = (community.toast ?? []).map((raw) => {
    const [title, ...rest] = raw.split(/\s*[—–:]\s*/);
    return { title: title.trim(), body: rest.join(" — ").trim() || "No further details." };
  });
  const toastPool = [...TOASTS, ...extraToasts];

  const status = rng.fork("status");
  const pct = status.int(3, 99);

  const inc = rng.fork("incident");
  const incidentId = `INC-${inc.int(1000, 9999)}-${inc.pick("ABCDEFGHJKMNPQRSTUVWXYZ".split(""))}${inc.pick(
    "ABCDEFGHJKMNPQRSTUVWXYZ".split(""),
  )}`;

  const u = rng.fork("user");
  const m = rng.fork("metrics");


  return {
    key,
    pretty: prettyDate(key),
    status: {
      pct,
      label: status.pick(STATUS_LABELS),
      emoji: status.pick(STATUS_EMOJI),
    },
    roast: rng.fork("roast").pick(roasts),
    userOfDay: {
      handle: `${u.pick(USER_ADJECTIVES)}${u.pick(USER_NOUNS)}${u.int(10, 99)}`,
      achievement: u.pick(USER_ACHIEVEMENTS),
    },
    outage: {
      title: inc.pick(OUTAGE_TITLES),
      update: inc.pick(OUTAGE_UPDATES),
      incidentId,
      severity: inc.pick(SEVERITIES),
    },
    buzzword: rng.fork("buzz").pick(buzzwords),
    mood: rng.fork("mood").pick(MOODS),
    excuse: rng.fork("excuse").pick(excuses),
    // The full merged pool, not a daily slice — the processing screen deals
    // its own sequence from a shuffle bag so repeat signups differ.
    processing: steps,
    toasts: toastPool,
    ticker: [
      `${incidentId} · monitoring`,
      `all systems ${pct}% ${status.pick(STATUS_LABELS)}`,
      `deploys today: ${m.int(0, 40)}`,
      `rollbacks today: ${m.int(0, 41)}`,
      `p99 latency: ${m.int(200, 9000)}ms`,
      `open tickets: ${m.int(2, 9)}k`,
      `engineers awake: ${m.int(0, 3)}`,
      `kevin: typing`,
    ],
    metrics: {
      users: 10_000_000,
      uptime: `${(99 - m.next() * 40).toFixed(m.int(1, 4))}%`,
      latency: m.int(12, 4800),
      incidents: m.int(0, 12),
    },
  };
}

/**
 * UTC day key. Used for the first (server) render so SSR and hydration always
 * agree; the client swaps to its own local key on mount, which only differs
 * during the few hours a day when someone's calendar disagrees with UTC's.
 */
export function utcDayKey(d: Date = new Date()): string {
  return `${d.getUTCFullYear()}-${String(d.getUTCMonth() + 1).padStart(2, "0")}-${String(
    d.getUTCDate(),
  ).padStart(2, "0")}`;
}

export { dateKey };
