import { NextResponse } from "next/server";
import { findUserByEmail } from "@/lib/users";
import { verifyPassword, issueUserToken, USER_COOKIE, USER_MAX_AGE, authLockedOut } from "@/lib/auth";
import { clientKey, rateLimit, sweepBuckets } from "@/lib/ratelimit";

export const dynamic = "force-dynamic";

export async function POST(req: Request) {
  sweepBuckets();

  const limit = rateLimit(`login:${clientKey(req)}`, 8, 5 * 60_000);
  if (!limit.ok) {
    return NextResponse.json(
      { ok: false, error: `Too many attempts. Wait ${limit.retryAfter}s.` },
      { status: 429, headers: { "Retry-After": String(limit.retryAfter) } },
    );
  }

  if (authLockedOut()) {
    return NextResponse.json(
      { ok: false, error: "Accounts are temporarily disabled on this deployment." },
      { status: 503 },
    );
  }

  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ ok: false, error: "Malformed request." }, { status: 400 });
  }

  const { email, password } = body as { email?: unknown; password?: unknown };
  const cleanEmail = typeof email === "string" ? email.trim().toLowerCase() : "";
  const rawPassword = typeof password === "string" ? password : "";

  if (!cleanEmail || !rawPassword) {
    return NextResponse.json({ ok: false, field: "general", error: "Enter both fields." }, { status: 400 });
  }

  const user = await findUserByEmail(cleanEmail);
  if (!user) {
    return NextResponse.json(
      { ok: false, field: "email", error: "No account with that email." },
      { status: 401 },
    );
  }

  const valid = await verifyPassword(rawPassword, user.passwordHash);
  if (!valid) {
    return NextResponse.json({ ok: false, field: "password", error: "Wrong password." }, { status: 401 });
  }

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
}
