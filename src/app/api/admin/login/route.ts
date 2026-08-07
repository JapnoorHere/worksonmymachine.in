import { NextResponse } from "next/server";
import {
  ADMIN_COOKIE,
  ADMIN_MAX_AGE,
  adminLockedOut,
  checkPassword,
  issueToken,
} from "@/lib/adminAuth";
import { clientKey, rateLimit, sweepBuckets } from "@/lib/ratelimit";

export const dynamic = "force-dynamic";

export async function POST(req: Request) {
  sweepBuckets();

  // Tight limit: this is the one endpoint worth brute-forcing.
  const limit = rateLimit(`login:${clientKey(req)}`, 6, 5 * 60_000);
  if (!limit.ok) {
    return NextResponse.json(
      { ok: false, error: `Too many attempts. Wait ${limit.retryAfter}s.` },
      { status: 429, headers: { "Retry-After": String(limit.retryAfter) } },
    );
  }

  if (adminLockedOut()) {
    return NextResponse.json(
      {
        ok: false,
        error:
          "ADMIN_PASSWORD is not set on this deployment, so the review queue is sealed. Set it and redeploy.",
      },
      { status: 503 },
    );
  }

  let password: unknown;
  try {
    ({ password } = (await req.json()) as { password?: unknown });
  } catch {
    return NextResponse.json({ ok: false, error: "Malformed request." }, { status: 400 });
  }

  if (!(await checkPassword(password))) {
    return NextResponse.json({ ok: false, error: "Incorrect password." }, { status: 401 });
  }

  const res = NextResponse.json({ ok: true });
  res.cookies.set(ADMIN_COOKIE, await issueToken(), {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: ADMIN_MAX_AGE,
  });
  return res;
}

export async function DELETE() {
  const res = NextResponse.json({ ok: true });
  res.cookies.set(ADMIN_COOKIE, "", { path: "/", maxAge: 0 });
  return res;
}
