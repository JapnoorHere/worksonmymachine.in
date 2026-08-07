import { cookies } from "next/headers";

/**
 * Visitor session handling — the real counterpart to `adminAuth.ts`.
 *
 * Same construction as the admin session (HMAC-signed, httpOnly cookie,
 * fail-closed secret in production), applied to actual signed-up users
 * instead of the one shared admin password. A separate secret
 * (`AUTH_SECRET`) means a compromised admin secret can't forge user sessions
 * or vice versa.
 *
 * Passwords are hashed with PBKDF2-SHA256 via Web Crypto rather than a new
 * dependency like bcrypt — `crypto.subtle` is already how this codebase signs
 * the admin cookie, so this keeps the same zero-new-dependency posture. The
 * stored format is self-describing (`pbkdf2$<iterations>$<salt>$<hash>`) so
 * the iteration count can be raised later without invalidating old hashes.
 */

export const USER_COOKIE = "tif_user";
export const USER_MAX_AGE = 60 * 60 * 24 * 30; // 30 days

const PBKDF2_ITERATIONS = 210_000;
const SALT_BYTES = 16;
const KEY_LENGTH_BITS = 256;

const enc = new TextEncoder();

function toB64Url(bytes: Uint8Array): string {
  return Buffer.from(bytes).toString("base64url");
}

function fromB64Url(s: string): Uint8Array {
  return new Uint8Array(Buffer.from(s, "base64url"));
}

/** Length-independent comparison so equal-ish hashes can't be timed apart. */
function timingSafeEqualBytes(a: Uint8Array, b: Uint8Array): boolean {
  const len = Math.max(a.length, b.length);
  let diff = a.length ^ b.length;
  for (let i = 0; i < len; i++) diff |= (a[i] ?? 0) ^ (b[i] ?? 0);
  return diff === 0;
}

async function deriveBits(password: string, salt: Uint8Array, iterations: number): Promise<Uint8Array> {
  const key = await crypto.subtle.importKey("raw", enc.encode(password), "PBKDF2", false, [
    "deriveBits",
  ]);
  const bits = await crypto.subtle.deriveBits(
    { name: "PBKDF2", salt: salt as BufferSource, iterations, hash: "SHA-256" },
    key,
    KEY_LENGTH_BITS,
  );
  return new Uint8Array(bits);
}

export async function hashPassword(password: string): Promise<string> {
  const salt = crypto.getRandomValues(new Uint8Array(SALT_BYTES));
  const hash = await deriveBits(password, salt, PBKDF2_ITERATIONS);
  return `pbkdf2$${PBKDF2_ITERATIONS}$${toB64Url(salt)}$${toB64Url(hash)}`;
}

export async function verifyPassword(password: string, stored: string): Promise<boolean> {
  const parts = stored.split("$");
  if (parts.length !== 4 || parts[0] !== "pbkdf2") return false;

  const iterations = Number(parts[1]);
  if (!Number.isFinite(iterations) || iterations <= 0) return false;

  const salt = fromB64Url(parts[2]);
  const expected = fromB64Url(parts[3]);
  const actual = await deriveBits(password, salt, iterations);
  return timingSafeEqualBytes(actual, expected);
}

/* -------------------------------------------------------------------------- */
/* Session cookie                                                              */
/* -------------------------------------------------------------------------- */

const DEV_FALLBACK_SECRET = "tif-dev-auth-secret-not-for-production";

function authSecret(): string | null {
  const configured = process.env.AUTH_SECRET?.trim();
  if (configured) return configured;
  if (process.env.NODE_ENV === "production") return null;
  return DEV_FALLBACK_SECRET;
}

/** True when the deployment has no usable session secret configured. */
export function authLockedOut(): boolean {
  return authSecret() === null;
}

async function sign(payload: string, secret: string): Promise<string> {
  const key = await crypto.subtle.importKey(
    "raw",
    enc.encode(secret),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"],
  );
  const sig = await crypto.subtle.sign("HMAC", key, enc.encode(payload));
  return Buffer.from(new Uint8Array(sig)).toString("base64url");
}

/** Issues `userId.expiresAt.sig`. Returns null if no secret is configured. */
export async function issueUserToken(userId: string): Promise<string | null> {
  const secret = authSecret();
  if (!secret) return null;
  const payload = `${userId}.${Date.now() + USER_MAX_AGE * 1000}`;
  return `${payload}.${await sign(payload, secret)}`;
}

/** Returns the userId if the token is valid and unexpired, else null. */
export async function verifyUserToken(token: string | undefined): Promise<string | null> {
  const secret = authSecret();
  if (!token || !secret) return null;

  const parts = token.split(".");
  if (parts.length !== 3) return null;
  const [userId, expiresStr, sig] = parts;
  if (!userId) return null;

  const expires = Number(expiresStr);
  if (!Number.isFinite(expires) || Date.now() > expires) return null;

  const expectedSig = await sign(`${userId}.${expiresStr}`, secret);
  return timingSafeEqualBytes(enc.encode(sig), enc.encode(expectedSig)) ? userId : null;
}

/** The current visitor's user id, if their session cookie is valid. */
export async function getSessionUserId(): Promise<string | null> {
  const store = await cookies();
  return verifyUserToken(store.get(USER_COOKIE)?.value);
}
