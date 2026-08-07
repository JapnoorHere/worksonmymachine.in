import { NextResponse } from "next/server";
import { createUser, DuplicateEmailError } from "@/lib/users";
import { hashPassword, issueUserToken, USER_COOKIE, USER_MAX_AGE, authLockedOut } from "@/lib/auth";
import { sanitizeText } from "@/lib/sanitize";
import { clientKey, rateLimit, sweepBuckets } from "@/lib/ratelimit";
import { EMAIL_TAKEN_LINES } from "@/lib/content";
import { deal } from "@/lib/bag";

export const dynamic = "force-dynamic";

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const MIN_PASSWORD = 6;

/**
 * The one real thing signup does. Every field here is re-validated
 * server-side — the client's live email check is a convenience, not a trust
 * boundary, and the Mongo unique index on `email` is the actual backstop
 * against a two-tab signup race.
 */
export async function POST(req: Request) {
  sweepBuckets();

  const limit = rateLimit(`signup:${clientKey(req)}`, 5, 15 * 60_000);
  if (!limit.ok) {
    return NextResponse.json(
      { ok: false, field: "general", error: `Too many attempts. Wait ${limit.retryAfter}s.` },
      { status: 429, headers: { "Retry-After": String(limit.retryAfter) } },
    );
  }

  if (authLockedOut()) {
    return NextResponse.json(
      { ok: false, field: "general", error: "Accounts are temporarily disabled on this deployment." },
      { status: 503 },
    );
  }

  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ ok: false, field: "general", error: "Malformed request." }, { status: 400 });
  }

  const { name, email, password, age, vibes, trust } = body as Record<string, unknown>;

  const cleanEmail = typeof email === "string" ? email.trim().toLowerCase() : "";
  if (!EMAIL_RE.test(cleanEmail)) {
    return NextResponse.json(
      { ok: false, field: "email", error: "That doesn't look like a working address." },
      { status: 400 },
    );
  }

  const rawPassword = typeof password === "string" ? password : "";
  if (rawPassword.length < MIN_PASSWORD) {
    return NextResponse.json(
      { ok: false, field: "password", error: `Needs at least ${MIN_PASSWORD} characters.` },
      { status: 400 },
    );
  }

  const cleanName = sanitizeText(typeof name === "string" ? name : "", 60) || "Valued User";

  const cleanAge = (() => {
    const n = Number(age);
    return Number.isFinite(n) && n > 0 && n < 200 ? Math.round(n) : null;
  })();

  const cleanVibes = Array.isArray(vibes)
    ? vibes.filter((v): v is string => typeof v === "string").slice(0, 24)
    : [];

  const cleanTrust = (() => {
    const n = Number(trust);
    return Number.isFinite(n) ? Math.min(100, Math.max(0, Math.round(n))) : 50;
  })();

  try {
    const passwordHash = await hashPassword(rawPassword);
    const user = await createUser({
      email: cleanEmail,
      passwordHash,
      name: cleanName,
      age: cleanAge,
      vibes: cleanVibes,
      trust: cleanTrust,
    });

    const token = await issueUserToken(user.id);
    if (!token) {
      return NextResponse.json(
        { ok: false, field: "general", error: "Accounts are temporarily disabled on this deployment." },
        { status: 503 },
      );
    }

    const res = NextResponse.json({
      ok: true,
      user: { id: user.id, name: user.name, email: user.email },
    });
    res.cookies.set(USER_COOKIE, token, {
      httpOnly: true,
      sameSite: "lax",
      secure: process.env.NODE_ENV === "production",
      path: "/",
      maxAge: USER_MAX_AGE,
    });
    return res;
  } catch (err) {
    if (err instanceof DuplicateEmailError) {
      return NextResponse.json(
        { ok: false, field: "email", error: deal("email-taken", EMAIL_TAKEN_LINES) },
        { status: 409 },
      );
    }
    console.error("[api/auth/signup]", err);
    return NextResponse.json(
      { ok: false, field: "general", error: "Could not create that account. The database is having a moment." },
      { status: 500 },
    );
  }
}
