import { NextResponse } from "next/server";
import { voteFor } from "@/lib/submissions";
import { clientKey, rateLimit, sweepBuckets } from "@/lib/ratelimit";

export const dynamic = "force-dynamic";

/**
 * Upvote a pending submission to help the reviewer prioritize.
 *
 * Deliberately not authenticated — this only nudges review order, so the worst
 * a determined ballot-stuffer achieves is getting their own joke read sooner by
 * a human who can still say no. Rate limiting keeps it from being effortless.
 */
export async function POST(req: Request) {
  sweepBuckets();

  const limit = rateLimit(`vote:${clientKey(req)}`, 30, 60_000);
  if (!limit.ok) {
    return NextResponse.json(
      { ok: false, error: "Slow down." },
      { status: 429, headers: { "Retry-After": String(limit.retryAfter) } },
    );
  }

  let id: unknown;
  try {
    ({ id } = (await req.json()) as { id?: unknown });
  } catch {
    return NextResponse.json({ ok: false, error: "Malformed request." }, { status: 400 });
  }

  if (typeof id !== "string" || !/^[a-zA-Z0-9_]{1,64}$/.test(id)) {
    return NextResponse.json({ ok: false, error: "Bad id." }, { status: 400 });
  }

  try {
    const votes = await voteFor(id);
    if (votes === null) {
      return NextResponse.json({ ok: false, error: "Not found." }, { status: 404 });
    }
    return NextResponse.json({ ok: true, votes });
  } catch (err) {
    console.error("[api/submissions/vote]", err);
    return NextResponse.json({ ok: false, error: "Vote failed." }, { status: 500 });
  }
}
