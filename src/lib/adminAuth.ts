import { cookies } from "next/headers";

/**
 * Admin session handling for the review queue.
 *
 * A single shared password, exchanged for an HMAC-signed, httpOnly cookie. The
 * queue is the one part of this project that isn't a joke: approving a
 * submission puts a stranger's text in front of every visitor, so the gate has
 * to actually hold.
 *
 * Fail-closed in production. If `ADMIN_PASSWORD` is unset on a real deployment,
 * every login is refused rather than falling back to a default that's published
 * in this repo's own .env.example.
 */

const COOKIE = "tif_admin";
const MAX_AGE = 60 * 60 * 8; // 8 hours

const DEV_FALLBACK_PASSWORD = "thisisfine";

function expectedPassword(): string | null {
  const configured = process.env.ADMIN_PASSWORD?.trim();
  if (configured) return configured;
  if (process.env.NODE_ENV === "production") return null;
  return DEV_FALLBACK_PASSWORD;
}

function secret(): string {
  return (
    process.env.ADMIN_SECRET?.trim() ||
    process.env.ADMIN_PASSWORD?.trim() ||
    "tif-dev-secret-not-for-production"
  );
}

const enc = new TextEncoder();

/** Length-independent comparison, so we don't leak the password by timing. */
function timingSafeEqual(a: string, b: string): boolean {
  const ab = enc.encode(a);
  const bb = enc.encode(b);
  // Compare a fixed number of bytes regardless of input length.
  const len = Math.max(ab.length, bb.length);
  let diff = ab.length ^ bb.length;
  for (let i = 0; i < len; i++) {
    diff |= (ab[i] ?? 0) ^ (bb[i] ?? 0);
  }
  return diff === 0;
}

async function sign(payload: string): Promise<string> {
  const key = await crypto.subtle.importKey(
    "raw",
    enc.encode(secret()),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"],
  );
  const sig = await crypto.subtle.sign("HMAC", key, enc.encode(payload));
  return Buffer.from(new Uint8Array(sig)).toString("base64url");
}

export async function issueToken(): Promise<string> {
  const payload = String(Date.now() + MAX_AGE * 1000);
  return `${payload}.${await sign(payload)}`;
}

export async function verifyToken(token: string | undefined): Promise<boolean> {
  if (!token) return false;
  const [payload, sig] = token.split(".");
  if (!payload || !sig) return false;

  const expires = Number(payload);
  if (!Number.isFinite(expires) || Date.now() > expires) return false;

  return timingSafeEqual(sig, await sign(payload));
}

export async function checkPassword(candidate: unknown): Promise<boolean> {
  const expected = expectedPassword();
  if (!expected) return false;
  if (typeof candidate !== "string") return false;
  return timingSafeEqual(candidate, expected);
}

export async function isAdmin(): Promise<boolean> {
  const store = await cookies();
  return verifyToken(store.get(COOKIE)?.value);
}

export const ADMIN_COOKIE = COOKIE;
export const ADMIN_MAX_AGE = MAX_AGE;

/** True when the deployment has no usable password configured. */
export function adminLockedOut(): boolean {
  return expectedPassword() === null;
}
