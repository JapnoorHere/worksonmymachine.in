import { NextResponse } from "next/server";
import { findUserByEmail } from "@/lib/users";
import { clientKey, rateLimit, sweepBuckets } from "@/lib/ratelimit";
import { EMAIL_TAKEN_LINES } from "@/lib/content";
import { deal } from "@/lib/bag";

export const dynamic = "force-dynamic";

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

/** Live check while typing. Signup re-validates everything server-side. */
export async function GET(req: Request) {
  sweepBuckets();

  const limit = rateLimit(`check-email:${clientKey(req)}`, 20, 60_000);
  if (!limit.ok) {
    return NextResponse.json(
      { valid: false, available: false, message: "Slow down a little." },
      { status: 429, headers: { "Retry-After": String(limit.retryAfter) } },
    );
  }

  const { searchParams } = new URL(req.url);
  const email = (searchParams.get("email") ?? "").trim();

  if (!email) return NextResponse.json({ valid: false, available: false });

  if (!EMAIL_RE.test(email)) {
    return NextResponse.json({
      valid: false,
      available: false,
      message: "That doesn't look like a working address.",
    });
  }

  try {
    const existing = await findUserByEmail(email);
    if (existing) {
      return NextResponse.json({
        valid: true,
        available: false,
        message: deal("email-taken", EMAIL_TAKEN_LINES),
      });
    }
    return NextResponse.json({ valid: true, available: true });
  } catch (err) {
    console.error("[api/auth/check-email]", err);
    // Fail open — this is a live-typing convenience check, not the real gate.
    // Signup re-checks authoritatively, backed by Mongo's unique index.
    return NextResponse.json({ valid: true, available: true });
  }
}
